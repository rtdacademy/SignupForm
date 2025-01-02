const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
const cors = require('cors')({ origin: true });
const jwt = require('jsonwebtoken');

if (!admin.apps.length) {
    admin.initializeApp();
}

// Platform Configuration
const CLIENT_ID = 'rtd-academy-lti-client';
const ISSUER = 'https://us-central1-rtd-academy.cloudfunctions.net';
const TOOL_URL = 'https://edge.rtdacademy.com';
const PLATFORM_UNIQUE_ID = '6765d5fcca524';

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
    const launchesRef = db.ref('lti/test_launches');
    const now = Date.now();
    const oldLaunches = await launchesRef.orderByChild('expires').endAt(now).once('value');
    const deletePromises = [];
    oldLaunches.forEach(snapshot => {
        deletePromises.push(snapshot.ref.remove());
    });
    await Promise.all(deletePromises);
};

// JWKS Endpoint
exports.ltiJwks = functions.https.onRequest(async (req, res) => {
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

// Helper function to sanitize objects for logging
const sanitizeForLog = (obj) => {
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, v === Object(v) ? sanitizeForLog(v) : v])
    );
};

exports.ltiAuth = functions.https.onRequest(async (req, res) => {
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

        if (!client_id || !login_hint || !nonce || !redirect_uri || !state) {
            throw new Error('Missing required parameters');
        }

        // Get launch data
        const db = admin.database();
        let launchData = null;
        if (lti_message_hint) {
            const launchRef = db.ref(`lti/test_launches/${lti_message_hint}`);
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
            // For instructors, use cid_###_0 format
            ltiKey = `cid_${launchData.course_id}_0`;
            customParams = {
                "context_history": launchData.course_id,
                "lti_key": ltiKey,
                "allow_direct_login": "1",  // Required for account linking
                "tool_consumer_instance_guid": PLATFORM_UNIQUE_ID,
                "tool_consumer_info_product_family_code": "RTD-Academy"
            };
        } else {
            // For students, need to get assessment ID from deep link
            if (launchData.deep_link_id) {
                const deepLinkRef = db.ref(`lti/deep_links/${launchData.deep_link_id}`);
                const deepLinkSnapshot = await deepLinkRef.once('value');
                const deepLinkData = deepLinkSnapshot.val();

                if (!deepLinkData || !deepLinkData.assessment_id) {
                    throw new Error('Invalid deep link or missing assessment ID');
                }

                // For students, use aid_###_0 format
                ltiKey = `aid_${deepLinkData.assessment_id}_0`;
                customParams = {
                    "context_history": launchData.course_id,
                    "lti_key": ltiKey,
                    "allow_direct_login": "1",
                    "tool_consumer_instance_guid": PLATFORM_UNIQUE_ID,
                    "tool_consumer_info_product_family_code": "RTD-Academy"
                };
            } else {
                throw new Error('No assessment ID found for student launch');
            }
        }

        // Log custom parameters
        await logEvent('Auth Custom Params', {
            customParams,
            role: launchData.role,
            ltiKey
        });

        // Base payload
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
            "https://purl.imsglobal.org/spec/lti/claim/deployment_id": "1",
            "https://purl.imsglobal.org/spec/lti/claim/roles": [
                launchData.role === 'instructor' 
                    ? "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"
                    : "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student"
            ],

            // Context claim with history
            "https://purl.imsglobal.org/spec/lti/claim/context": {
                "id": launchData.course_id,
                "label": `Course ${launchData.course_id}`,
                "title": `Course ${launchData.course_id}`,
                "type": ["http://purl.imsglobal.org/vocab/lis/v2/course#CourseSection"]
            },

            // Custom claims
            "https://purl.imsglobal.org/spec/lti/claim/custom": customParams
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
                "auto_create": true
            };
        } else {
            if (launchData.deep_link_id) {
                const deepLinkRef = db.ref(`lti/deep_links/${launchData.deep_link_id}`);
                const deepLinkSnapshot = await deepLinkRef.once('value');
                const deepLinkData = deepLinkSnapshot.val();

                payload["https://purl.imsglobal.org/spec/lti/claim/message_type"] = "LtiResourceLinkRequest";
                payload["https://purl.imsglobal.org/spec/lti/claim/target_link_uri"] = deepLinkData.url;
                payload["https://purl.imsglobal.org/spec/lti/claim/resource_link"] = {
                    "id": launchData.resource_link_id,
                    "title": deepLinkData.title
                };

                if (deepLinkData.lineItem) {
                    payload["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"] = {
                        "scope": [
                            "https://purl.imsglobal.org/spec/lti-ags/scope/score"
                        ],
                        "lineitem": deepLinkData.lineItem.id,
                        "scores": `${ISSUER}/ltiGradeCallback`
                    };
                }
            }
        }

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


exports.ltiLogin = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        try {
            await logEvent('Login Request Initial', {
                method: req.method,
                headers: req.headers
            });

            await cleanupExpiredLaunches();

            const { 
                user_id,
                test_user_id,
                course_id, 
                deep_link_id,
                role = 'student',
                allow_direct_login,
                firstname = 'Kyle',  // Default values for all users
                lastname = 'Fake',   // Default values for all users
                email = 'kyle.e.brown13@gmail.com' // Default values for all users
            } = req.query;

            // Use test_user_id if provided, otherwise use regular user_id
            const effectiveUserId = test_user_id || user_id;

            // Log parameters
            const logParams = {
                actual_user_id: user_id,
                effective_user_id: effectiveUserId,
                is_test_user: !!test_user_id,
                course_id,
                role,
                allow_direct_login,
                firstname,
                lastname,
                email: email ? 'provided' : 'not provided'
            };
            
            if (role === 'student' && deep_link_id) {
                logParams.deep_link_id = deep_link_id;
            }

            await logEvent('Login Parameters', logParams);

            // Validate required parameters
            if (!effectiveUserId || !course_id) {
                throw new Error('Missing required parameters');
            }
            if (role === 'student' && !deep_link_id) {
                throw new Error('Missing deep_link_id for student launch');
            }

            const state = crypto.randomBytes(32).toString('hex');
            const nonce = crypto.randomBytes(32).toString('hex');

            // Create resource link ID
            const resource_link_id = role === 'instructor'
                ? `course_${course_id}`
                : `link_${deep_link_id}`;

            // Create launch data object with user details
            const launchData = {
                user_id: effectiveUserId,
                actual_user_id: user_id,
                is_test_user: !!test_user_id,
                role,
                course_id,
                resource_link_id,
                nonce,
                firstname,    // Always include user details
                lastname,     // Always include user details
                email,       // Always include user details
                allowDirectLogin: allow_direct_login === "1",
                created: admin.database.ServerValue.TIMESTAMP,
                expires: Date.now() + (5 * 60 * 1000)
            };

            if (role === 'student' && deep_link_id) {
                launchData.deep_link_id = deep_link_id;
            }

            // Store launch data
            const db = admin.database();
            await db.ref(`lti/test_launches/${state}`).set(launchData);

            // Construct IMathAS login URL
            const params = new URLSearchParams({
                iss: ISSUER,
                login_hint: effectiveUserId,
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
                course_id,
                is_test_user: !!test_user_id
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
const LTI_CONFIG = functions.config().lti;

exports.ltiDeepLinkReturn = functions.https.onRequest(async (req, res) => {
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
                    title: item.title,
                    url: item.url,
                    type: item.type,
                    course_id: refcid, // Use the course ID from the URL
                    assessment_id: refaid, // Store the assessment ID
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

                // Store in Firebase
                const linksRef = admin.database().ref('lti/deep_links').push();
                await linksRef.set(linkData);
                storedLinks.push({
                    id: linksRef.key,
                    ...linkData
                });

                await logEvent('Deep Link Stored', {
                    linkId: linksRef.key,
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
            // Just notify the parent window of success
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

            // Return an error page
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


// Get LTI Links for a Course
exports.getLTILinks = functions.https.onRequest(async (req, res) => {
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

exports.ltiGradeCallback = functions.https.onRequest(async (req, res) => {
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

            // Create a reference combining user and assessment
            // The URL will include the deep link ID
            const urlParams = new URL(req.headers.referer || '').searchParams;
            const deepLinkId = urlParams.get('deep_link_id');
            
            if (!deepLinkId) {
                throw new Error('Missing deep link ID');
            }

            // Store the grade
            const gradeRef = db.ref(`lti/grades/${deepLinkId}/${score.userId}`);
            await gradeRef.set(gradeData);

            await logEvent('Grade Stored', {
                deepLinkId,
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