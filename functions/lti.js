const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const crypto = require('crypto');
const cors = require('cors')({ origin: true });
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const { sanitizeEmail } = require('./utils');

if (!admin.apps.length) {
    admin.initializeApp();
}

// Platform Configuration
const CLIENT_ID = 'rtd-academy-lti-client';
const ISSUER = 'https://us-central1-rtd-academy.cloudfunctions.net';
const TOOL_URL = 'https://edge.rtdacademy.com';
const PLATFORM_UNIQUE_ID = '6765d5fcca524';
const DEPLOYMENT_ID = 'imathas-deployment-1'; // Your single deployment ID for now

// Helper Functions
const logEvent = async (type, details, success = true) => {
    const db = admin.database();
    const logsRef = db.ref('lti/logs').push();
    await logsRef.set({
        type,
        details,
        success,
        timestamp: admin.database.ServerValue.TIMESTAMP
    });
    console.log(`LTI ${type}:`, details);
};

const generateKeyPair = () => {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
};

const formatPublicKeyToJWK = (publicKey, kid) => {
    const keyDetails = crypto.createPublicKey(publicKey);
    const keyData = keyDetails.export({ format: 'jwk' });
    return {
        kty: 'RSA',
        kid: kid,
        use: 'sig',
        alg: 'RS256',
        n: keyData.n,
        e: keyData.e
    };
};

const createIdToken = (payload, privateKey, kid) => {
    const options = {
        algorithm: 'RS256',
        header: {
            kid: kid
        }
    };
    return jwt.sign(payload, privateKey, options);
};

const cleanupExpiredLaunches = async () => {
    const db = admin.database();
    const launchesRef = db.ref('lti/launches');
    const now = Date.now();
    const oldLaunches = await launchesRef.orderByChild('expires').endAt(now).once('value');
    const deletePromises = [];
    oldLaunches.forEach(snapshot => {
        deletePromises.push(snapshot.ref.remove());
    });
    await Promise.all(deletePromises);
};

// JWKS Endpoint (v2)
exports.ltiJwksV2 = onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    try {
        await logEvent('JWKS Request', {
            method: req.method,
            headers: req.headers,
            url: req.url
        });

        const db = admin.database();
        const keysRef = db.ref('lti/keys');
        const snapshot = await keysRef.once('value');
        let keyData = snapshot.val();

        if (!keyData) {
            await logEvent('JWKS', 'No existing keys found, generating new pair');
            const { publicKey, privateKey } = generateKeyPair();
            const kid = crypto.randomBytes(16).toString('hex');

            keyData = {
                kid,
                publicKey,
                privateKey,
                created_at: admin.database.ServerValue.TIMESTAMP
            };

            await keysRef.set(keyData);
            await logEvent('JWKS', 'New key pair generated and stored');
        }

        const jwk = formatPublicKeyToJWK(keyData.publicKey, keyData.kid);
        await logEvent('JWKS Response', {
            kid: keyData.kid,
            keys: [jwk]
        });

        res.status(200).json({ keys: [jwk] });

    } catch (error) {
        await logEvent('JWKS Error', error.message, false);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Helper function to sanitize objects for logging (No changes needed)
const sanitizeForLog = (obj) => {
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, v === Object(v) ? sanitizeForLog(v) : v])
    );
};

// LTI Authentication Endpoint (v2)
exports.ltiAuthV2 = onRequest(async (req, res) => {
    try {
        await logEvent('Auth Request Initial', sanitizeForLog({
            method: req.method,
            clientId: req.query.client_id,
            loginHint: req.query.login_hint,
            redirectUri: req.query.redirect_uri
        }));

        const {
            client_id,
            login_hint,
            nonce,
            redirect_uri,
            state,
            lti_message_hint
        } = req.query;

        // Validate required parameters
        if (!client_id || !login_hint || !nonce || !redirect_uri || !state) {
            throw new Error('Missing required parameters');
        }

        // Get launch data
        const db = admin.database();
        let launchData = null;
        if (lti_message_hint) {
            const launchRef = db.ref(`lti/launches/${lti_message_hint}`);
            const launchSnapshot = await launchRef.once('value');
            launchData = launchSnapshot.val();
            
            if (launchData) {
                await logEvent('Auth Launch Data Retrieved', sanitizeForLog({
                    role: launchData.role,
                    course_id: launchData.course_id,
                    message_hint: lti_message_hint
                }));

                if (launchData.expires < Date.now()) {
                    throw new Error('Launch data has expired');
                }
            }
        }

        if (!launchData) {
            throw new Error('Invalid or missing launch data');
        }

        // Check for LMSStudentID after successful launch for students
        if (launchData.role === 'student' && launchData.email) {
            const sanitizedEmail = sanitizeEmail(launchData.email);
            const studentIdRef = db.ref(`students/${sanitizedEmail}/courses/${launchData.course_id}/LMSStudentID`);
            const studentIdSnapshot = await studentIdRef.once('value');

            if (!studentIdSnapshot.exists()) {
                try {
                    console.log('Attempting to fetch LMS ID for:', launchData.email);

                    // Send request to edge system
                    const response = await fetch('https://edge.rtdacademy.com/return_data_to_yourway.php', {
                        method: 'POST',
                        body: JSON.stringify({ email: launchData.email }),
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    const responseText = await response.text();
                    console.log('Raw response:', responseText);

                    let result;
                    try {
                        result = JSON.parse(responseText);
                    } catch (e) {
                        console.error('Failed to parse response:', e);
                        throw new Error('Invalid response from Edge system');
                    }

                    console.log('Parsed result:', result);

                    if (!result.success) {
                        console.log('Edge system returned error:', result.message);
                        throw new Error(result.message || 'Failed to fetch LMS ID');
                    }

                    const updates = {};
                    updates[`students/${sanitizedEmail}/courses/${launchData.course_id}/LMSStudentID`] = result.user.id;
                    
                    const summaryRef = db.ref(`studentCourseSummaries/${sanitizedEmail}_${launchData.course_id}`);
                    const summarySnapshot = await summaryRef.once('value');
                    const currentToggle = summarySnapshot.exists() ? summarySnapshot.val().toggle : false;
                    
                    updates[`studentCourseSummaries/${sanitizedEmail}_${launchData.course_id}/toggle`] = !currentToggle;

                    await db.ref().update(updates);
                    
                    await logEvent('LMS Student ID Fetch', {
                        email: launchData.email,
                        courseId: launchData.course_id,
                        status: 'success',
                        lmsId: result.user.id
                    });

                } catch (error) {
                    await logEvent('LMS Student ID Fetch Error', {
                        email: launchData.email,
                        courseId: launchData.course_id,
                        error: error.message
                    }, false);
                }
            }
        }

        // Get platform keys
        const keysRef = db.ref('lti/keys');
        const keyData = (await keysRef.once('value')).val();

        if (!keyData) {
            throw new Error('Platform keys not found');
        }

        // Determine the correct lti_key format based on role and launch type
        let ltiKey;
        let customParams;
        if (launchData.role === 'instructor') {
            ltiKey = `cid_${launchData.course_id}_0`;
            customParams = {
                "context_history": launchData.course_id,
                "lti_key": ltiKey,
                "allow_direct_login": "1",
                "tool_consumer_instance_guid": PLATFORM_UNIQUE_ID,
                "tool_consumer_info_product_family_code": "RTD-Academy"
            };
        } else {
            if (launchData.deep_link_id) { 
                const deepLinkRef = db.ref(`lti/deep_links/${launchData.deep_link_id}`);
                const deepLinkSnapshot = await deepLinkRef.once('value');
                const deepLinkData = deepLinkSnapshot.val();

                if (!deepLinkData || !deepLinkData.assessment_id) {
                    throw new Error('Invalid deep link or missing assessment ID');
                }

                ltiKey = `aid_${deepLinkData.assessment_id}_0`;
                customParams = {
                    "context_history": launchData.course_id,
                    "lti_key": ltiKey,
                    "allow_direct_login": launchData.allowDirectLogin ? "1" : "0",
                    "tool_consumer_instance_guid": PLATFORM_UNIQUE_ID,
                    "tool_consumer_info_product_family_code": "RTD-Academy"
                };
            } else {
                throw new Error('No resource link ID found for student launch');
            }
        }

        // Log custom parameters
        await logEvent('Auth Custom Params', {
            customParams,
            role: launchData.role,
            ltiKey
        });

        // Construct base payload
        const payload = {
            // OIDC required claims
            sub: login_hint,
            nonce: nonce,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
            iss: ISSUER,
            aud: client_id,
        
            // Standard LTI user claims
            given_name: launchData.firstname || '',
            family_name: launchData.lastname || '',
            email: launchData.email || '',
        
            // LIS claims for user details
            "https://purl.imsglobal.org/spec/lti/claim/lis": {
                "person_sourcedid": login_hint,
                "person_name_given": launchData.firstname || '',
                "person_name_family": launchData.lastname || '',
                "person_contact_email_primary": launchData.email || ''
            },
        
            // LTI required claims
            "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
            "https://purl.imsglobal.org/spec/lti/claim/deployment_id": DEPLOYMENT_ID,
            "https://purl.imsglobal.org/spec/lti/claim/roles": [
                launchData.role === 'instructor' 
                    ? "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"
                    : "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student"
            ],
        };
        
        // Determine context label and title to use
        let contextLabel = `Course ${launchData.course_id}`;
        let contextTitle = `Course ${launchData.course_id}`;
        
        // For students, try to get a custom title from their data
        if (launchData.role === 'student' && launchData.email) {
            const sanitizedEmail = sanitizeEmail(launchData.email);
            try {
                const schoolYearRef = db.ref(`students/${sanitizedEmail}/courses/${launchData.course_id}/School_x0020_Year/Value`);
                const schoolYearSnapshot = await schoolYearRef.once('value');
                
                if (schoolYearSnapshot.exists() && schoolYearSnapshot.val()) {
                    // Use school year as the context title if available
                    contextTitle = schoolYearSnapshot.val();
                    contextLabel = schoolYearSnapshot.val();
                    
                    await logEvent('Context Info', {
                        email: launchData.email,
                        courseId: launchData.course_id,
                        schoolYear: contextTitle
                    });
                }
            } catch (error) {
                await logEvent('School Year Fetch Error', {
                    email: launchData.email,
                    courseId: launchData.course_id,
                    error: error.message
                }, false);
            }
        }
        
        // Then add the context claim to the payload
        payload["https://purl.imsglobal.org/spec/lti/claim/context"] = {
            "id": launchData.course_id,
            "label": contextLabel,
            "title": contextTitle,
            "type": ["http://purl.imsglobal.org/vocab/lis/v2/course#CourseSection"]
        };

        // Add role-specific claims and target link URIs
        if (launchData.role === 'instructor') {
            payload["https://purl.imsglobal.org/spec/lti/claim/message_type"] = "LtiDeepLinkingRequest";
            payload["https://purl.imsglobal.org/spec/lti/claim/target_link_uri"] =
                `${TOOL_URL}/lti/launch.php?type=course&refcid=${launchData.course_id}`;

            payload["https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings"] = {
                "accept_types": ["ltiResourceLink"],
                "accept_presentation_document_targets": ["iframe", "window"],
                "deep_link_return_url": `${ISSUER}/ltiDeepLinkReturn`,
                "accept_multiple": false,
                "auto_create": true,
                "data": launchData.deep_link_id
            };
        } else { // Student launch
            if (launchData.deep_link_id) {
                const deepLinkRef = db.ref(`lti/deep_links/${launchData.deep_link_id}`);
                const deepLinkSnapshot = await deepLinkRef.once('value');
                const deepLinkData = deepLinkSnapshot.val();

                if (!deepLinkData || !deepLinkData.assessment_id) {
                    throw new Error('Invalid deep link or missing assessment ID');
                }

                payload["https://purl.imsglobal.org/spec/lti/claim/message_type"] = "LtiResourceLinkRequest";
                payload["https://purl.imsglobal.org/spec/lti/claim/target_link_uri"] = deepLinkData.url;

                payload["https://purl.imsglobal.org/spec/lti/claim/resource_link"] = {
                    "id": launchData.deep_link_id,
                    "title": deepLinkData.title
                };

                if (deepLinkData.lineItem) {
                    payload["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"] = {
                        "scope": [
                            "https://purl.imsglobal.org/spec/lti-ags/scope/score"
                        ],
                        "lineitem": deepLinkData.lineItem.id,
                        "lineitems": `${ISSUER}/lineitems?deployment_id=${DEPLOYMENT_ID}&resource_link_id=${launchData.deep_link_id}`,
                        "scores": `${ISSUER}/ltiGradeCallback`
                    };
                }
            } else {
                throw new Error('No deep link ID found for student launch');
            }
        }

        // Add custom claims
        payload["https://purl.imsglobal.org/spec/lti/claim/custom"] = customParams;

        // Create and send the form
        const id_token = await createIdToken(payload, keyData.privateKey, keyData.kid);
        const formHtml = `
            <html>
            <head><title>Submitting LTI Launch</title></head>
            <body>
                <form id="ltiLaunchForm" action="${redirect_uri}" method="POST">
                    <input type="hidden" name="id_token" value="${id_token}"/>
                    <input type="hidden" name="state" value="${state}"/>
                </form>
                <script>
                    document.getElementById('ltiLaunchForm').submit();
                </script>
            </body>
            </html>
        `;

        res.status(200).send(formHtml);

    } catch (error) {
        await logEvent('Auth Error', sanitizeForLog({
            error: error.message,
            stack: error.stack,
            query: {
                client_id: req.query.client_id,
                redirect_uri: req.query.redirect_uri
            }
        }), false);
        res.status(500).json({ error: error.message });
    }
});

// LTI Login Endpoint (v2)
exports.ltiLoginV2 = onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            await logEvent('Login Request Initial', {
                method: req.method,
                headers: req.headers
            });

            await cleanupExpiredLaunches();

            const { 
                user_id,
                course_id, 
                deep_link_id,
                role = 'student',
                allow_direct_login,
                firstname,
                lastname,
                email
            } = req.query;

            // Log parameters
            const logParams = {
                user_id,
                course_id,
                role,
                allow_direct_login,
                has_user_details: !!(firstname && lastname && email)
            };
            
            if (role === 'student' && deep_link_id) {
                logParams.deep_link_id = deep_link_id;
            }

            await logEvent('Login Parameters', logParams);

            // Validate required parameters
            if (!user_id || !course_id) {
                throw new Error('Missing required parameters');
            }

            // For students, ensure deep_link_id is provided
            if (role === 'student' && !deep_link_id) {
                throw new Error('Missing deep_link_id for student launch');
            }

            // Validate user details are provided
            if (!firstname || !lastname || !email) {
                throw new Error('Missing required user details');
            }

            const state = crypto.randomBytes(32).toString('hex');
            const nonce = crypto.randomBytes(32).toString('hex');

            // Create resource link ID based on role and context
            const resource_link_id = role === 'instructor'
                ? `course_${course_id}`
                : deep_link_id;

            // Create launch data object
            const launchData = {
                user_id,
                role,
                course_id,
                resource_link_id,
                deep_link_id,
                nonce,
                firstname,
                lastname,
                email,
                allowDirectLogin: allow_direct_login === "1",
                created: admin.database.ServerValue.TIMESTAMP,
                expires: Date.now() + (5 * 60 * 1000)  // 5 minute expiry
            };

            // Store launch data
            const db = admin.database();
            await db.ref(`lti/launches/${state}`).set(launchData);

            // Construct IMathAS login URL with parameters
            const params = new URLSearchParams({
                iss: ISSUER,
                login_hint: user_id,
                client_id: CLIENT_ID,
                lti_message_hint: state,
                scope: 'openid',
                response_type: 'id_token',
                response_mode: 'form_post',
                nonce,
                state,
                prompt: 'none',
                u: PLATFORM_UNIQUE_ID
            });

            const redirectUrl = `${TOOL_URL}/lti/login.php?${params.toString()}`;

            await logEvent('Login Redirect', { 
                redirectUrl,
                params: Object.fromEntries(params),
                role,
                course_id
            });
            
            res.redirect(redirectUrl);

        } catch (error) {
            await logEvent('Login Error', {
                error: error.message,
                stack: error.stack,
                query: req.query
            }, false);
            res.status(500).json({ error: error.message });
        }
    });
});

// Get LTI configuration from functions config
const LTI_CONFIG = {
    issuer: process.env.LTI_ISSUER,
    kid: process.env.LTI_KID,
    base_url: process.env.LTI_BASE_URL,
    public_key: process.env.LTI_PUBLIC_KEY,
    client_id: process.env.LTI_CLIENT_ID
};

// LTI Deep Link Return Endpoint (v2)
exports.ltiDeepLinkReturnV2 = onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            await logEvent('Deep Link Return Request', {
                method: req.method,
                body: req.body
            });

            if (!req.body.JWT) {
                throw new Error('Missing JWT in deep link response');
            }

            const decodedJwt = jwt.verify(req.body.JWT, LTI_CONFIG.public_key, {
                algorithms: ['RS256'],
                issuer: LTI_CONFIG.client_id,
                audience: LTI_CONFIG.issuer
            });

            // Correctly extract deep_link_id from the top-level data claim
            const deep_link_id = decodedJwt['https://purl.imsglobal.org/spec/lti-dl/claim/data'];

            console.log("deep_link_id", deep_link_id);

            if (!deep_link_id) {
                throw new Error('deep_link_id not found in deep link response');
            }

            const contentItems = decodedJwt['https://purl.imsglobal.org/spec/lti-dl/claim/content_items'];

            if (!Array.isArray(contentItems) || contentItems.length === 0) {
                throw new Error('No content items in deep link response');
            }

            // Process each content item
            const storedLinks = [];
            for (const item of contentItems) {
                // Extract course ID and assessment ID from the URL
                const urlParams = new URL(item.url).searchParams;
                const refcid = urlParams.get('refcid');
                const refaid = urlParams.get('refaid');

                const linkData = {
                    resource_link_id: deep_link_id,
                    title: item.title,
                    url: item.url,
                    type: item.type,
                    course_id: refcid,
                    assessment_id: refaid,
                    created: admin.database.ServerValue.TIMESTAMP
                };

                if (item.lineItem) {
                    linkData.lineItem = {
                        scoreMaximum: item.lineItem.scoreMaximum,
                        label: item.lineItem.label,
                        tag: item.lineItem.tag,
                        submissionReview: item.lineItem.submissionReview
                    };
                }

                // Store in Firebase using the received deep_link_id
                const db = admin.database();
                const deepLinkRef = db.ref(`lti/deep_links/${deep_link_id}`);
                await deepLinkRef.set(linkData);
                storedLinks.push({
                    id: deep_link_id,
                    ...linkData
                });

                await logEvent('Deep Link Stored', {
                    deep_link_id,
                    linkData
                });
            }

            // Return success page that will close the deep linking window
            const responseHtml = `
        <html>
        <head>
            <title>Deep Link Created</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                .success { color: #4caf50; margin-bottom: 20px; }
                .details { background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <h2 class="success">Assignment Links Created Successfully</h2>
            <div class="details">
                <p>${storedLinks.length} assignment link(s) have been created and stored.</p>
                <p>These assignments are now available for student access.</p>
                <p>You may continue setting up your course in IMathAS.</p>
            </div>
            <script>
                window.parent.postMessage(
                    {
                        subject: 'lti.deep_linking.response.success',
                        linkCount: ${storedLinks.length},
                        links: ${JSON.stringify(storedLinks)}
                    }, 
                    '*'
                );
            </script>
        </body>
        </html>
        `;

            res.status(200).send(responseHtml);

        } catch (error) {
            await logEvent('Deep Link Return Error', {
                error: error.message,
                stack: error.stack
            }, false);

            const errorHtml = `
                <html>
                <head>
                    <title>Deep Link Error</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                        .error { color: #f44336; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <h2 class="error">Error Creating Link</h2>
                    <p>${error.message}</p>
                    <p>Please close this window and try again.</p>
                </body>
                </html>
            `;

            res.status(500).send(errorHtml);
        }
    });
});

// Get LTI Links Endpoint (v2)
exports.getLTILinksV2 = onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            const { courseId } = req.query;

            if (!courseId) {
                throw new Error('Course ID is required');
            }

            const db = admin.database();
            const linksRef = db.ref('lti/deep_links');

            // Query links for this course
            const snapshot = await linksRef
                .orderByChild('course_id')
                .equalTo(courseId)
                .once('value');

            const links = [];
            snapshot.forEach((childSnapshot) => {
                links.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            await logEvent('Get LTI Links', {
                courseId,
                linkCount: links.length
            });

            res.status(200).json({ 
                links,
                message: `Found ${links.length} links for course ${courseId}`
            });

        } catch (error) {
            await logEvent('Get LTI Links Error', {
                error: error.message,
                stack: error.stack
            }, false);

            res.status(500).json({ error: error.message });
        }
    });
});

// LTI Grade Callback Endpoint (v2)
exports.ltiGradeCallbackV2 = onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            await logEvent('Grade Callback Request', {
                method: req.method,
                headers: req.headers,
                body: req.body
            });

            // Verify Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new Error('Missing or invalid authorization header');
            }

            // Get the token
            const token = authHeader.split(' ')[1];

            // Verify the score object
            const score = req.body;
            if (!score.userId || score.scoreGiven === undefined) {
                throw new Error('Invalid score object');
            }

            // Store the grade in Firebase
            const db = admin.database();
            const gradeData = {
                userId: score.userId,
                score: parseFloat(score.scoreGiven),
                maxScore: parseFloat(score.scoreMaximum),
                timestamp: score.timestamp || admin.database.ServerValue.TIMESTAMP,
                activityProgress: score.activityProgress || 'Completed',
                gradingProgress: score.gradingProgress || 'FullyGraded',
                comment: score.comment || ''
            };

            // The URL will include the resource link ID
            const referer = req.headers.referer || '';
            const urlParams = new URL(referer).searchParams;
            const resourceLinkId = urlParams.get('resource_link_id');

            if (!resourceLinkId) {
                throw new Error('Missing resource link ID');
            }

            // Store the grade using resourceLinkId
            const gradeRef = db.ref(`lti/grades/${resourceLinkId}/${score.userId}`);
            await gradeRef.set(gradeData);

            await logEvent('Grade Stored', {
                resourceLinkId,
                userId: score.userId,
                score: gradeData.score
            });

            res.status(200).json({ success: true });

        } catch (error) {
            await logEvent('Grade Callback Error', {
                error: error.message,
                stack: error.stack
            }, false);

            res.status(500).json({ error: error.message });
        }
    });
});
