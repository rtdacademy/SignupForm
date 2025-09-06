// functions/adminUserManagement.js

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');

// Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Generate a secure temporary password
 */
function generateTempPassword() {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one of each type
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // symbol
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Verify caller has admin permissions
 */
async function verifyAdminPermissions(request) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to perform this action.');
  }

  const callerUid = request.auth.uid;
  const callerEmail = request.auth.token.email;
  
  // Get caller's custom claims
  const callerUserRecord = await admin.auth().getUser(callerUid);
  const callerClaims = callerUserRecord.customClaims || {};
  
  // Check if caller has staff permissions (any staff member can perform user management)
  const isStaff = callerClaims.isStaffUser || 
                  callerClaims.isAdminUser || 
                  callerClaims.isSuperAdminUser ||
                  (callerClaims.staffPermissions && callerClaims.staffPermissions.length > 0);
  
  if (!isStaff && callerEmail !== 'kyle@rtdacademy.com') {
    throw new HttpsError('permission-denied', 'Only staff members can perform user management actions.');
  }
  
  return { callerUid, callerEmail, callerClaims };
}

/**
 * Verify caller has super admin permissions (for destructive actions)
 */
async function verifySuperAdminPermissions(request) {
  const { callerEmail, callerClaims } = await verifyAdminPermissions(request);
  
  const isSuperAdmin = callerClaims.isSuperAdminUser || 
                       (callerClaims.staffPermissions && callerClaims.staffPermissions.includes('super_admin'));
  
  if (!isSuperAdmin && callerEmail !== 'kyle@rtdacademy.com') {
    throw new HttpsError('permission-denied', 'Only super admin users can perform this action.');
  }
  
  return { callerEmail, callerClaims };
}

/**
 * Log admin action for audit trail
 */
async function logAdminAction(actionType, targetUser, callerInfo, actionData = {}) {
  const db = admin.database();
  const auditEntry = {
    actionType,
    targetUser: {
      email: targetUser.email,
      uid: targetUser.uid
    },
    performedBy: {
      email: callerInfo.callerEmail,
      uid: callerInfo.callerUid
    },
    actionData,
    timestamp: Date.now(),
    ip: actionData.ip || 'unknown'
  };
  
  try {
    await db.ref(`adminAuditLog`).push(auditEntry);
    console.log(`Logged admin action: ${actionType} by ${callerInfo.callerEmail} on ${targetUser.email}`);
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw here as the main operation should still succeed
  }
}

/**
 * Cloud Function: setTemporaryPassword
 * 
 * Sets a temporary password for a user and adds a custom claim requiring password change
 */
const setTemporaryPassword = onCall({
  concurrency: 50,
  cors: [
    "https://yourway.rtdacademy.com", 
    "http://localhost:3000", 
    "https://rtd-connect.com"
  ]
}, async (request) => {
  const callerInfo = await verifyAdminPermissions(request);
  const { targetEmail, customPassword, reason, targetSite } = request.data;
  
  if (!targetEmail) {
    throw new HttpsError('invalid-argument', 'Target email is required.');
  }
  
  console.log(`Admin ${callerInfo.callerEmail} setting temporary password for: ${targetEmail}`);
  
  try {
    // Get target user
    const targetUser = await admin.auth().getUserByEmail(targetEmail);
    
    // Generate or use provided password
    const tempPassword = customPassword || generateTempPassword();
    
    // Update user password and verify email if not already verified
    const updateData = {
      password: tempPassword
    };
    
    // If email is not verified, verify it since admin is setting password
    if (!targetUser.emailVerified) {
      updateData.emailVerified = true;
      console.log(`Also verifying email for user: ${targetEmail}`);
    }
    
    await admin.auth().updateUser(targetUser.uid, updateData);
    
    // Get current custom claims
    const currentClaims = targetUser.customClaims || {};
    
    // Add temporary password claim
    const newClaims = {
      ...currentClaims,
      tempPasswordRequired: true,
      tempPasswordSetAt: Date.now(),
      tempPasswordSetBy: callerInfo.callerEmail
    };
    
    await admin.auth().setCustomUserClaims(targetUser.uid, newClaims);
    
    // Update metadata to trigger token refresh
    const db = admin.database();
    await db.ref(`metadata/${targetUser.uid}`).set({
      refreshTime: Date.now(),
      tempPasswordSet: Date.now()
    });
    
    // Log the action
    await logAdminAction('setTemporaryPassword', targetUser, callerInfo, {
      reason: reason || 'No reason provided',
      passwordGenerated: !customPassword,
      emailVerified: !targetUser.emailVerified  // Log if email was verified as part of this action
    });
    
    return {
      success: true,
      tempPassword: tempPassword,
      message: 'Temporary password set successfully',
      userEmail: targetUser.email,
      targetSite: targetSite || 'rtdacademy'
    };
    
  } catch (error) {
    console.error('Error setting temporary password:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'User not found.');
    }
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'An error occurred while setting temporary password.');
  }
});

/**
 * Cloud Function: deleteFirebaseAuthUser
 * 
 * Safely deletes a Firebase Auth user while preserving student data
 * Super admin only
 */
const deleteFirebaseAuthUser = onCall({
  concurrency: 50,
  cors: [
    "https://yourway.rtdacademy.com", 
    "http://localhost:3000", 
    "https://rtd-connect.com",
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ]
}, async (request) => {
  const callerInfo = await verifySuperAdminPermissions(request);
  const { targetEmail, targetUid, reason } = request.data;
  
  if (!targetEmail && !targetUid) {
    throw new HttpsError('invalid-argument', 'Either targetEmail or targetUid must be provided.');
  }
  
  console.log(`Super admin ${callerInfo.callerEmail} deleting Firebase user: ${targetEmail || targetUid}`);
  
  try {
    // Get target user
    let targetUser;
    if (targetEmail) {
      targetUser = await admin.auth().getUserByEmail(targetEmail);
    } else {
      targetUser = await admin.auth().getUser(targetUid);
    }
    
    // Prevent super admins from deleting their own account
    if (targetUser.uid === callerInfo.callerUid) {
      throw new HttpsError('permission-denied', 'Cannot delete your own account.');
    }
    
    // Log the action before deletion
    await logAdminAction('deleteFirebaseUser', targetUser, callerInfo, {
      reason: reason || 'No reason provided',
      preservedStudentData: true
    });
    
    // Delete the Firebase Auth user (preserves database data)
    await admin.auth().deleteUser(targetUser.uid);
    
    return {
      success: true,
      message: 'Firebase Auth user deleted successfully. Student data preserved.',
      deletedUserEmail: targetUser.email,
      deletedUserUid: targetUser.uid
    };
    
  } catch (error) {
    console.error('Error deleting Firebase user:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'User not found.');
    }
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'An error occurred while deleting user.');
  }
});

/**
 * Cloud Function: toggleUserAccountStatus
 * 
 * Enable or disable a user account
 */
const toggleUserAccountStatus = onCall({
  concurrency: 50,
  cors: [
    "https://yourway.rtdacademy.com", 
    "http://localhost:3000", 
    "https://rtd-connect.com",
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ]
}, async (request) => {
  const callerInfo = await verifyAdminPermissions(request);
  const { targetEmail, targetUid, disabled, reason } = request.data;
  
  if (!targetEmail && !targetUid) {
    throw new HttpsError('invalid-argument', 'Either targetEmail or targetUid must be provided.');
  }
  
  if (typeof disabled !== 'boolean') {
    throw new HttpsError('invalid-argument', 'Disabled status must be a boolean.');
  }
  
  console.log(`Admin ${callerInfo.callerEmail} ${disabled ? 'disabling' : 'enabling'} user: ${targetEmail || targetUid}`);
  
  try {
    // Get target user
    let targetUser;
    if (targetEmail) {
      targetUser = await admin.auth().getUserByEmail(targetEmail);
    } else {
      targetUser = await admin.auth().getUser(targetUid);
    }
    
    // Prevent admins from disabling their own account
    if (targetUser.uid === callerInfo.callerUid) {
      throw new HttpsError('permission-denied', 'Cannot disable your own account.');
    }
    
    // Update user disabled status
    await admin.auth().updateUser(targetUser.uid, {
      disabled: disabled
    });
    
    // Log the action
    await logAdminAction(disabled ? 'disableAccount' : 'enableAccount', targetUser, callerInfo, {
      reason: reason || 'No reason provided'
    });
    
    return {
      success: true,
      message: `User account ${disabled ? 'disabled' : 'enabled'} successfully`,
      userEmail: targetUser.email,
      disabled: disabled
    };
    
  } catch (error) {
    console.error('Error updating user account status:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'User not found.');
    }
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'An error occurred while updating account status.');
  }
});


/**
 * Cloud Function: getUserSignInMethods
 * 
 * Get all sign-in methods available for a user's email using Admin SDK
 */
const getUserSignInMethods = onCall({
  concurrency: 50,
  cors: [
    "https://yourway.rtdacademy.com", 
    "http://localhost:3000", 
    "https://rtd-connect.com",
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ]
}, async (request) => {
  const callerInfo = await verifyAdminPermissions(request);
  const { targetEmail } = request.data;
  
  if (!targetEmail) {
    throw new HttpsError('invalid-argument', 'Target email is required.');
  }
  
  console.log(`Admin ${callerInfo.callerEmail} fetching sign-in methods for: ${targetEmail}`);
  
  try {
    // Get target user to verify they exist and get provider data
    const targetUser = await admin.auth().getUserByEmail(targetEmail);
    
    // Get provider data from the user record - this contains all linked providers
    const providerData = targetUser.providerData || [];
    
    // Map provider IDs to friendly names
    const providerMap = {
      'password': 'Email/Password',
      'google.com': 'Google',
      'microsoft.com': 'Microsoft',
      'facebook.com': 'Facebook',
      'twitter.com': 'Twitter',
      'github.com': 'GitHub',
      'apple.com': 'Apple'
    };
    
    // Build detailed provider information
    const detailedProviders = providerData.map(provider => ({
      providerId: provider.providerId,
      providerName: providerMap[provider.providerId] || provider.providerId,
      email: provider.email,
      displayName: provider.displayName || null,
      photoURL: provider.photoURL || null,
      uid: provider.uid
    }));
    
    // Extract just the provider IDs for sign-in methods
    const signInMethods = providerData.map(provider => provider.providerId);
    
    // Check if user has password authentication (this might not be in providerData)
    // We can infer this from the user record
    const hasPasswordAuth = targetUser.passwordHash !== undefined;
    if (hasPasswordAuth && !signInMethods.includes('password')) {
      signInMethods.push('password');
      detailedProviders.push({
        providerId: 'password',
        providerName: 'Email/Password',
        email: targetUser.email,
        displayName: null,
        photoURL: null,
        uid: targetUser.uid
      });
    }
    
    console.log(`Found ${signInMethods.length} sign-in methods for ${targetEmail}:`, signInMethods);
    
    // Log the action
    await logAdminAction('getUserSignInMethods', targetUser, callerInfo, {
      signInMethodsFound: signInMethods.length,
      providersFound: providerData.length,
      hasPasswordAuth: hasPasswordAuth
    });
    
    return {
      success: true,
      userEmail: targetUser.email,
      userUid: targetUser.uid,
      signInMethods: signInMethods,
      providerData: detailedProviders,
      friendlyMethods: signInMethods.map(method => providerMap[method] || method),
      totalMethods: signInMethods.length,
      hasPasswordAuth: hasPasswordAuth
    };
    
  } catch (error) {
    console.error('Error getting sign-in methods:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'User not found.');
    }
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'An error occurred while fetching sign-in methods.');
  }
});

/**
 * Cloud Function: getAdminAuditLog
 * 
 * Get audit log entries for admin actions (super admin only)
 */
const getAdminAuditLog = onCall({
  concurrency: 50,
  cors: [
    "https://yourway.rtdacademy.com", 
    "http://localhost:3000", 
    "https://rtd-connect.com",
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ]
}, async (request) => {
  const callerInfo = await verifySuperAdminPermissions(request);
  const { limit = 100, startAfter } = request.data;
  
  console.log(`Super admin ${callerInfo.callerEmail} requesting audit log`);
  
  try {
    const db = admin.database();
    let query = db.ref('adminAuditLog').orderByChild('timestamp').limitToLast(limit);
    
    if (startAfter) {
      query = query.endBefore(startAfter);
    }
    
    const snapshot = await query.once('value');
    const auditEntries = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        auditEntries.push({
          id: child.key,
          ...child.val()
        });
      });
    }
    
    // Sort by timestamp descending (most recent first)
    auditEntries.sort((a, b) => b.timestamp - a.timestamp);
    
    return {
      success: true,
      auditEntries,
      totalEntries: auditEntries.length
    };
    
  } catch (error) {
    console.error('Error getting audit log:', error);
    throw new HttpsError('internal', 'An error occurred while retrieving audit log.');
  }
});

/**
 * Cloud Function: sendTempPasswordEmail
 * 
 * Sends an email to the user with their temporary password and login instructions
 */
const sendTempPasswordEmail = onCall({
  concurrency: 50,
  cors: [
    "https://yourway.rtdacademy.com", 
    "http://localhost:3000", 
    "https://rtd-connect.com",
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ],
  secrets: ["SENDGRID_KEY"]
}, async (request) => {
  const callerInfo = await verifyAdminPermissions(request);
  const { targetEmail, tempPassword, userFirstName, targetSite } = request.data;
  
  if (!targetEmail || !tempPassword) {
    throw new HttpsError('invalid-argument', 'Target email and temporary password are required.');
  }

  console.log(`Admin ${callerInfo.callerEmail} sending temp password email to: ${targetEmail}`);
  
  try {
    // Initialize SendGrid
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_KEY);

    const db = admin.database();
    const emailId = db.ref('emails').push().key;
    
    // Determine the login URL based on target site
    const loginUrl = targetSite === 'rtdconnect' 
      ? 'https://rtd-connect.com/login' 
      : 'https://yourway.rtdacademy.com/login';
    
    const siteName = targetSite === 'rtdconnect' 
      ? 'RTD Connect' 
      : 'RTD Academy';
    
    // Create email content
    const firstName = userFirstName || 'Student';
    const subject = `Temporary Password for Your ${siteName} Account`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Temporary Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 5px solid #007bff;">
          <h2 style="color: #007bff; margin-top: 0;">🔐 Temporary Password for Your Account</h2>
          
          <p>An administrator has set a temporary password for your ${siteName} account. You can use this password to log in, but you'll be required to create a new password during your next login for security purposes.</p>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 2px solid #e9ecef; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">📧 Your Login Information:</h3>
            <p><strong>Email:</strong> ${targetEmail}</p>
            <p><strong>Temporary Password:</strong> <code style="background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 16px; color: #e83e8c;">${tempPassword}</code></p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #856404;">⚠️ Important Security Notice:</h4>
            <ul style="margin-bottom: 0; color: #856404;">
              <li>This is a temporary password that expires after your first use</li>
              <li>You must create a new secure password when you log in</li>
              <li>Do not share this password with anyone</li>
              <li>For security, this email should be deleted after you log in</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              🚀 Log In to Your Account
            </a>
          </div>
          
          <p>${targetSite === 'rtdconnect' 
            ? 'If you have any questions or need assistance, please contact your facilitator.' 
            : 'If you have any questions or need assistance, please contact your teacher or RTD Academy support.'}</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
          
          <div style="text-align: center; color: #6c757d; font-size: 14px;">
            <p><strong>${siteName}</strong><br>
            ${targetSite === 'rtdconnect' ? 'Home Education Support Platform' : 'Your Way Learning Platform'}</p>
            <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const textContent = `
Temporary Password for Your ${siteName} Account

An administrator has set a temporary password for your ${siteName} account. You can use this password to log in, but you'll be required to create a new password during your next login for security purposes.

Your Login Information:
Email: ${targetEmail}
Temporary Password: ${tempPassword}

IMPORTANT SECURITY NOTICE:
- This is a temporary password that expires after your first use
- You must create a new secure password when you log in
- Do not share this password with anyone
- For security, this email should be deleted after you log in

Login at: ${loginUrl}

${targetSite === 'rtdconnect' 
  ? 'If you have any questions or need assistance, please contact your facilitator.' 
  : 'If you have any questions or need assistance, please contact your teacher or RTD Academy support.'}

${siteName} - ${targetSite === 'rtdconnect' ? 'Home Education Support Platform' : 'Your Way Learning Platform'}
This is an automated message. Please do not reply to this email.
    `;

    // Prepare email configuration
    const emailConfig = {
      personalizations: [{
        to: [{ email: targetEmail }],
        subject: subject,
        custom_args: { emailId }
      }],
      from: {
        email: 'noreply@rtdacademy.com',
        name: 'RTD Academy (Do Not Reply)'
      },
      content: [
        {
          type: 'text/plain',
          value: textContent
        },
        {
          type: 'text/html',
          value: htmlContent
        }
      ],
      trackingSettings: {
        openTracking: {
          enable: true,
          substitutionTag: '%open-track%'
        }
      }
    };

    // Send email via SendGrid
    await sgMail.send(emailConfig);

    const timestamp = Date.now();
    const recipientKey = targetEmail.replace(/[.#$[\]]/g, ',');
    const senderKey = callerInfo.callerEmail.replace(/[.#$[\]]/g, ',');

    // Store tracking record
    await db.ref(`sendGridTracking/${emailId}`).set({
      emailId,
      recipientKey,
      senderKey,
      recipientEmail: targetEmail,
      senderEmail: callerInfo.callerEmail,
      senderName: callerInfo.callerEmail,
      timestamp,
      subject,
      sent: true,
      events: {
        sent: {
          timestamp,
          success: true
        }
      },
      metadata: {
        emailType: 'temp_password',
        sentByAdmin: true
      },
      recipients: {
        [recipientKey]: {
          email: targetEmail,
          status: 'sent',
          timestamp
        }
      }
    });

    // Store email records
    const emailRecord = {
      subject,
      text: textContent,
      html: htmlContent,
      timestamp,
      sender: 'noreply@rtdacademy.com',
      senderName: 'RTD Academy (Do Not Reply)',
      status: 'sent',
      emailType: 'temp_password'
    };

    await Promise.all([
      // Store recipient's copy
      db.ref(`userEmails/${recipientKey}/${emailId}`).set(emailRecord),
      
      // Store sender's copy
      db.ref(`userEmails/${senderKey}/sent/${emailId}`).set({
        ...emailRecord,
        to: targetEmail,
        sentByAdmin: true
      }),
      
      // Create notification
      db.ref(`notifications/${recipientKey}/${emailId}`).set({
        type: 'new_email',
        emailId,
        sender: 'noreply@rtdacademy.com',
        senderName: 'RTD Academy',
        subject,
        preview: 'You have received a temporary password for your account...',
        timestamp,
        read: false
      })
    ]);

    // Log the action
    await logAdminAction('sendTempPasswordEmail', { email: targetEmail, uid: 'N/A' }, callerInfo, {
      emailId,
      tempPasswordSent: true
    });

    return {
      success: true,
      message: 'Temporary password email sent successfully',
      emailId,
      recipientEmail: targetEmail
    };

  } catch (error) {
    console.error('Error sending temporary password email:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'User not found.');
    }
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'An error occurred while sending the temporary password email.');
  }
});

/**
 * Cloud Function: createUserWithTempPassword
 * 
 * Creates a new Firebase Auth user with a temporary password and sends welcome email
 */
const createUserWithTempPassword = onCall({
  concurrency: 50,
  cors: [
    "https://yourway.rtdacademy.com", 
    "http://localhost:3000", 
    "https://rtd-connect.com",
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ],
  secrets: ["SENDGRID_KEY"]
}, async (request) => {
  const callerInfo = await verifyAdminPermissions(request);
  const { targetEmail, customPassword, sendEmail, reason, userFirstName, targetSite } = request.data;
  
  if (!targetEmail) {
    throw new HttpsError('invalid-argument', 'Target email is required.');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(targetEmail)) {
    throw new HttpsError('invalid-argument', 'Invalid email format.');
  }

  console.log(`Admin ${callerInfo.callerEmail} creating new user: ${targetEmail}`);
  
  try {
    // Check if user already exists
    try {
      await admin.auth().getUserByEmail(targetEmail);
      throw new HttpsError('already-exists', 'A user with this email already exists.');
    } catch (error) {
      // If user doesn't exist, this is expected and we can proceed
      if (error.code !== 'auth/user-not-found') {
        throw error; // Re-throw if it's a different error
      }
    }

    // Generate or use provided password
    const tempPassword = customPassword || generateTempPassword();
    
    // Create new user with Firebase Admin SDK
    // Email is automatically verified since admin is creating the account
    const newUserRecord = await admin.auth().createUser({
      email: targetEmail,
      password: tempPassword,
      emailVerified: true,  // Auto-verify email when admin creates account
      disabled: false
    });

    console.log(`Created new user: ${newUserRecord.uid} for email: ${targetEmail}`);

    // Set temporary password custom claims
    const customClaims = {
      tempPasswordRequired: true,
      tempPasswordSetAt: Date.now(),
      tempPasswordSetBy: callerInfo.callerEmail,
      userCreatedByAdmin: true,
      createdAt: Date.now()
    };
    
    await admin.auth().setCustomUserClaims(newUserRecord.uid, customClaims);

    // Update metadata to trigger token refresh when user logs in
    const db = admin.database();
    await db.ref(`metadata/${newUserRecord.uid}`).set({
      refreshTime: Date.now(),
      tempPasswordSet: Date.now(),
      createdByAdmin: true,
      createdBy: callerInfo.callerEmail
    });

    // Log the action
    await logAdminAction('createUserWithTempPassword', { 
      email: targetEmail, 
      uid: newUserRecord.uid 
    }, callerInfo, {
      reason: reason || 'Admin created new user account',
      passwordGenerated: !customPassword,
      emailWillBeSent: sendEmail
    });

    let emailResult = null;
    
    // Send welcome email if requested
    if (sendEmail) {
      try {
        // Initialize SendGrid
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_KEY);

        const emailId = db.ref('emails').push().key;
        
        // Determine the login URL based on target site
        const loginUrl = targetSite === 'rtdconnect' 
          ? 'https://rtd-connect.com/login' 
          : 'https://yourway.rtdacademy.com/login';
        
        const siteName = targetSite === 'rtdconnect' 
          ? 'RTD Connect' 
          : 'RTD Academy';
        
        // Create email content
        const firstName = userFirstName || 'Student';
        const subject = `Welcome to ${siteName} - Your New Account`;
        
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to ${siteName}</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 5px solid #28a745;">
              <h2 style="color: #28a745; margin-top: 0;">🎉 Welcome to ${siteName}!</h2>
              
              <p>An administrator has created a new account for you at ${siteName}. ${targetSite === 'rtdconnect' 
                ? 'We\'re excited to have you join our home education community!' 
                : 'We\'re excited to have you join our learning community!'}</p>
              
              <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 2px solid #e9ecef; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #495057;">📧 Your Login Information:</h3>
                <p><strong>Email:</strong> ${targetEmail}</p>
                <p><strong>Temporary Password:</strong> <code style="background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 16px; color: #e83e8c;">${tempPassword}</code></p>
              </div>
              
              <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #bee5eb; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #0c5460;">🔐 Important Security Information:</h4>
                <ul style="margin-bottom: 0; color: #0c5460;">
                  <li>This is a <strong>temporary password</strong> that you must change on your first login</li>
                  <li>You'll be prompted to create a secure password when you sign in</li>
                  <li>Keep this information secure until you log in</li>
                  <li>For security, delete this email after you've successfully logged in</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" 
                   style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  🚀 Access Your Account
                </a>
              </div>
              
              <p>${targetSite === 'rtdconnect' 
                ? 'Once you log in, you\'ll have access to your RTD Connect dashboard. If you have any questions or need assistance, please contact your facilitator.' 
                : 'Once you log in, you\'ll have access to all your courses and learning materials. If you have any questions or need assistance, please contact your teacher or RTD Academy support.'}</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
              
              <div style="text-align: center; color: #6c757d; font-size: 14px;">
                <p><strong>${siteName}</strong><br>
                ${targetSite === 'rtdconnect' ? 'Home Education Support Platform' : 'Your Way Learning Platform'}</p>
                <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        
        const textContent = `
Welcome to ${siteName}!

An administrator has created a new account for you at ${siteName}. ${targetSite === 'rtdconnect' 
  ? 'We\'re excited to have you join our home education community!' 
  : 'We\'re excited to have you join our learning community!'}

Your Login Information:
Email: ${targetEmail}
Temporary Password: ${tempPassword}

IMPORTANT SECURITY INFORMATION:
- This is a temporary password that you must change on your first login
- You'll be prompted to create a secure password when you sign in
- Keep this information secure until you log in
- For security, delete this email after you've successfully logged in

Login at: ${loginUrl}

${targetSite === 'rtdconnect' 
  ? 'Once you log in, you\'ll have access to your RTD Connect dashboard. If you have any questions or need assistance, please contact your facilitator.' 
  : 'Once you log in, you\'ll have access to all your courses and learning materials. If you have any questions or need assistance, please contact your teacher or RTD Academy support.'}

${siteName} - ${targetSite === 'rtdconnect' ? 'Home Education Support Platform' : 'Your Way Learning Platform'}
This is an automated message. Please do not reply to this email.
        `;

        // Prepare email configuration
        const emailConfig = {
          personalizations: [{
            to: [{ email: targetEmail }],
            subject: subject,
            custom_args: { emailId }
          }],
          from: {
            email: 'noreply@rtdacademy.com',
            name: 'RTD Academy (Do Not Reply)'
          },
          content: [
            {
              type: 'text/plain',
              value: textContent
            },
            {
              type: 'text/html',
              value: htmlContent
            }
          ],
          trackingSettings: {
            openTracking: {
              enable: true,
              substitutionTag: '%open-track%'
            }
          }
        };

        // Send email via SendGrid
        await sgMail.send(emailConfig);

        const timestamp = Date.now();
        const recipientKey = targetEmail.replace(/[.#$[\]]/g, ',');
        const senderKey = callerInfo.callerEmail.replace(/[.#$[\]]/g, ',');

        // Store tracking record
        await db.ref(`sendGridTracking/${emailId}`).set({
          emailId,
          recipientKey,
          senderKey,
          recipientEmail: targetEmail,
          senderEmail: callerInfo.callerEmail,
          senderName: callerInfo.callerEmail,
          timestamp,
          subject,
          sent: true,
          events: {
            sent: {
              timestamp,
              success: true
            }
          },
          metadata: {
            emailType: 'welcome_new_user',
            sentByAdmin: true,
            newUserCreated: true
          },
          recipients: {
            [recipientKey]: {
              email: targetEmail,
              status: 'sent',
              timestamp
            }
          }
        });

        // Store email records
        const emailRecord = {
          subject,
          text: textContent,
          html: htmlContent,
          timestamp,
          sender: 'noreply@rtdacademy.com',
          senderName: 'RTD Academy (Do Not Reply)',
          status: 'sent',
          emailType: 'welcome_new_user'
        };

        await Promise.all([
          // Store recipient's copy
          db.ref(`userEmails/${recipientKey}/${emailId}`).set(emailRecord),
          
          // Store sender's copy
          db.ref(`userEmails/${senderKey}/sent/${emailId}`).set({
            ...emailRecord,
            to: targetEmail,
            sentByAdmin: true,
            newUserCreated: true
          }),
          
          // Create notification
          db.ref(`notifications/${recipientKey}/${emailId}`).set({
            type: 'new_email',
            emailId,
            sender: 'noreply@rtdacademy.com',
            senderName: 'RTD Academy',
            subject,
            preview: 'Welcome to RTD Academy! Your new account has been created...',
            timestamp,
            read: false
          })
        ]);

        emailResult = {
          success: true,
          emailId,
          message: 'Welcome email sent successfully'
        };

      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        emailResult = {
          success: false,
          error: emailError.message,
          message: 'User created successfully, but welcome email failed to send'
        };
      }
    }

    return {
      success: true,
      message: 'User created successfully with temporary password',
      user: {
        uid: newUserRecord.uid,
        email: newUserRecord.email,
        emailVerified: newUserRecord.emailVerified,
        disabled: newUserRecord.disabled,
        creationTime: newUserRecord.metadata.creationTime,
        lastSignInTime: newUserRecord.metadata.lastSignInTime
      },
      tempPassword: tempPassword,
      emailResult: emailResult,
      customClaims: customClaims
    };

  } catch (error) {
    console.error('Error creating user with temp password:', error);
    
    if (error.code === 'auth/email-already-exists') {
      throw new HttpsError('already-exists', 'A user with this email already exists.');
    }
    
    if (error.code === 'auth/invalid-email') {
      throw new HttpsError('invalid-argument', 'Invalid email address.');
    }
    
    if (error.code === 'auth/weak-password') {
      throw new HttpsError('invalid-argument', 'Password is too weak.');
    }
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'An error occurred while creating the user account.');
  }
});

/**
 * Cloud Function: verifyUserEmail
 * 
 * Manually verify a user's email address
 * Admin only
 */
const verifyUserEmail = onCall({
  concurrency: 50,
  cors: [
    "https://yourway.rtdacademy.com", 
    "https://rtd-connect.com",
    "http://localhost:3000", 
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ]
}, async (request) => {
  const callerInfo = await verifyAdminPermissions(request);
  const { targetEmail, targetUid, reason } = request.data;
  
  if (!targetEmail && !targetUid) {
    throw new HttpsError('invalid-argument', 'Either targetEmail or targetUid must be provided.');
  }
  
  console.log(`Admin ${callerInfo.callerEmail} verifying email for: ${targetEmail || targetUid}`);
  
  try {
    // Get target user
    let targetUser;
    if (targetEmail) {
      targetUser = await admin.auth().getUserByEmail(targetEmail);
    } else {
      targetUser = await admin.auth().getUser(targetUid);
    }
    
    // Check if email is already verified
    if (targetUser.emailVerified) {
      return {
        success: true,
        message: 'Email is already verified',
        userEmail: targetUser.email,
        alreadyVerified: true
      };
    }
    
    // Update user to set emailVerified to true
    await admin.auth().updateUser(targetUser.uid, {
      emailVerified: true
    });
    
    // Log the action
    await logAdminAction('verifyUserEmail', targetUser, callerInfo, {
      reason: reason || 'Admin manually verified email address',
      previousStatus: false,
      newStatus: true
    });
    
    return {
      success: true,
      message: 'Email address verified successfully',
      userEmail: targetUser.email,
      emailVerified: true
    };
    
  } catch (error) {
    console.error('Error verifying user email:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'User not found.');
    }
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'An error occurred while verifying email address.');
  }
});

/**
 * Cloud Function: removeTempPasswordClaim
 * 
 * Removes the temporary password requirement claim from the calling user
 */
const removeTempPasswordClaim = onCall({
  concurrency: 50,
  enforceAppCheck: false,
  cors: [
    "https://yourway.rtdacademy.com",
    "https://rtd-connect.com",
    "http://localhost:3000", 
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ]
}, async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to perform this action.');
  }

  const uid = request.auth.uid;
  const userEmail = request.auth.token.email;
  
  console.log(`User ${userEmail} (${uid}) completing password change - removing temp password claim`);
  
  try {
    // Get user's current custom claims
    console.log('Step 1: Getting user record for UID:', uid);
    const userRecord = await admin.auth().getUser(uid);
    const currentClaims = userRecord.customClaims || {};
    console.log('Current claims:', currentClaims);
    
    // Check if user actually has temp password claim
    if (!currentClaims.tempPasswordRequired) {
      console.log('No temporary password claim found, returning early');
      return {
        success: true,
        message: 'No temporary password claim to remove'
      };
    }
    
    // Remove temporary password related claims
    console.log('Step 2: Removing temp password claims');
    const newClaims = { ...currentClaims };
    delete newClaims.tempPasswordRequired;
    delete newClaims.tempPasswordSetAt;
    delete newClaims.tempPasswordSetBy;
    console.log('New claims after removal:', newClaims);
    
    console.log('Step 3: Setting custom user claims');
    await admin.auth().setCustomUserClaims(uid, newClaims);
    console.log('Custom claims updated successfully');
    
    // Update metadata to trigger token refresh
    console.log('Step 4: Updating metadata for token refresh');
    const db = admin.database();
    await db.ref(`metadata/${uid}`).set({
      refreshTime: Date.now(),
      tempPasswordRemoved: Date.now()
    });
    console.log('Metadata updated successfully');
    
    // Log the action - wrap in try-catch to avoid failure if logging fails
    console.log('Step 5: Logging admin action');
    try {
      await logAdminAction('removeTempPasswordClaim', { email: userEmail, uid }, { 
        callerUid: uid, 
        callerEmail: userEmail 
      }, {
        reason: 'User completed forced password change'
      });
      console.log('Admin action logged successfully');
    } catch (logError) {
      console.error('Failed to log admin action (non-critical):', logError);
      // Don't fail the whole operation if logging fails
    }
    
    console.log('Successfully removed temp password claim for user:', userEmail);
    return {
      success: true,
      message: 'Temporary password claim removed successfully'
    };
    
  } catch (error) {
    console.error('Error removing temporary password claim:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', `An error occurred while removing temporary password claim: ${error.message}`);
  }
});

/**
 * Cloud Function: changeUserEmail
 * 
 * Changes a user's email address while preserving custom claims and updating all related database records
 * Staff only function
 */
const changeUserEmail = onCall({
  concurrency: 50,
  cors: [
    "https://yourway.rtdacademy.com",
    "http://localhost:3000",
    "https://rtd-connect.com",
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ],
  secrets: ["SENDGRID_KEY"]
}, async (request) => {
  const callerInfo = await verifyAdminPermissions(request);
  const { originalEmail, newEmail, familyId, reason, authMethod = 'password' } = request.data;
  
  // Validate inputs
  if (!originalEmail || !newEmail) {
    throw new HttpsError('invalid-argument', 'Both original and new email addresses are required.');
  }
  
  if (originalEmail === newEmail) {
    throw new HttpsError('invalid-argument', 'New email must be different from original email.');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    throw new HttpsError('invalid-argument', 'Invalid new email format.');
  }
  
  // Validate auth method
  const validAuthMethods = ['google', 'microsoft', 'password'];
  if (!validAuthMethods.includes(authMethod)) {
    throw new HttpsError('invalid-argument', 'Invalid authentication method. Must be google, microsoft, or password.');
  }
  
  console.log(`Admin ${callerInfo.callerEmail} changing email from ${originalEmail} to ${newEmail}`);
  
  try {
    // Step 1: Get the original user
    let originalUser;
    try {
      originalUser = await admin.auth().getUserByEmail(originalEmail);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new HttpsError('not-found', 'Original user not found.');
      }
      throw error;
    }
    
    // Step 2: Check if new email already exists
    let newUser = null;
    let newUserExists = false;
    try {
      newUser = await admin.auth().getUserByEmail(newEmail);
      newUserExists = true;
      console.log(`User with email ${newEmail} already exists. Will merge claims.`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`User with email ${newEmail} does not exist. Will create new user.`);
        newUserExists = false;
      } else {
        throw error;
      }
    }
    
    // Step 3: Get original user's custom claims
    const originalClaims = originalUser.customClaims || {};
    console.log('Original user claims:', originalClaims);
    
    // Validate that the user is a primary guardian
    if (originalClaims.familyRole !== 'primary_guardian') {
      throw new HttpsError('invalid-argument', 
        'Email change through this method is only available for primary guardians. ' +
        `Current role: ${originalClaims.familyRole || 'none'}`);
    }
    
    // Step 4: Create or update new user
    if (!newUserExists) {
      // Handle user creation based on auth method
      if (authMethod === 'password') {
        // Create with temp password for email/password auth
        const tempPassword = generateTempPassword();
        newUser = await admin.auth().createUser({
          email: newEmail,
          password: tempPassword,
          emailVerified: true, // Auto-verify since admin is changing
          disabled: false
        });
        
        console.log(`Created new user ${newUser.uid} for email ${newEmail} with temp password`);
        
        // Set custom claims including temp password requirement
        const newClaims = {
          ...originalClaims,
          tempPasswordRequired: true,
          tempPasswordSetAt: Date.now(),
          tempPasswordSetBy: callerInfo.callerEmail,
          emailChangedFrom: originalEmail,
          emailChangedAt: Date.now(),
          authMethod: authMethod
        };
        
        await admin.auth().setCustomUserClaims(newUser.uid, newClaims);
        
        // Store temp password for response
        newUser.tempPassword = tempPassword;
      } else {
        // For Google/Microsoft auth, create user without password
        newUser = await admin.auth().createUser({
          email: newEmail,
          emailVerified: true, // Auto-verify since admin is changing
          disabled: false
        });
        
        console.log(`Created new user ${newUser.uid} for email ${newEmail} for ${authMethod} authentication`);
        
        // Set custom claims without temp password requirement
        const newClaims = {
          ...originalClaims,
          emailChangedFrom: originalEmail,
          emailChangedAt: Date.now(),
          authMethod: authMethod,
          authProvider: authMethod // Track which provider they should use
        };
        
        await admin.auth().setCustomUserClaims(newUser.uid, newClaims);
        
        // No temp password for provider auth
        newUser.tempPassword = null;
      }
    } else {
      // Merge claims with existing user
      const existingClaims = newUser.customClaims || {};
      const mergedClaims = {
        ...existingClaims, // Keep existing claims
        ...originalClaims, // Add/override with original user's claims
        emailChangedFrom: originalEmail,
        emailChangedAt: Date.now(),
        claimsMergedAt: Date.now()
      };
      
      // Remove temp password requirement if merging to existing user
      delete mergedClaims.tempPasswordRequired;
      delete mergedClaims.tempPasswordSetAt;
      delete mergedClaims.tempPasswordSetBy;
      
      await admin.auth().setCustomUserClaims(newUser.uid, mergedClaims);
      console.log(`Merged claims for existing user ${newUser.uid}`);
    }
    
    // Step 5: Update database records
    const db = admin.database();
    const updates = {};
    
    // Update guardian records if familyId provided
    if (familyId) {
      const oldEmailKey = sanitizeEmail(originalEmail);
      const newEmailKey = sanitizeEmail(newEmail);
      
      console.log(`Migrating guardian data from ${oldEmailKey} to ${newEmailKey}`);
      
      // Get original guardian data
      const guardianPath = `homeEducationFamilies/familyInformation/${familyId}/guardians/${oldEmailKey}`;
      const guardianSnapshot = await db.ref(guardianPath).once('value');
      
      if (guardianSnapshot.exists()) {
        const guardianData = guardianSnapshot.val();
        
        // Move old guardian to previousGuardians node with timestamp
        const timestamp = Date.now();
        const previousGuardianPath = `homeEducationFamilies/familyInformation/${familyId}/previousGuardians/${oldEmailKey}`;
        updates[previousGuardianPath] = {
          ...guardianData,
          movedToPreviousAt: timestamp,
          emailChangedTo: newEmail,
          emailChangedBy: callerInfo.callerEmail,
          emailChangedByUid: callerInfo.callerUid,
          reasonForMove: 'email_change',
          originalEmail: originalEmail,
          newEmail: newEmail
        };
        
        // Remove the old guardian entry
        updates[guardianPath] = null;
        
        // Create new guardian entry with updated email
        const newGuardianPath = `homeEducationFamilies/familyInformation/${familyId}/guardians/${newEmailKey}`;
        updates[newGuardianPath] = {
          ...guardianData,
          email: newEmail,
          emailKey: newEmailKey,
          guardianType: 'primary_guardian',
          emailChangedFrom: originalEmail,
          updatedAt: timestamp,
          updatedBy: callerInfo.callerUid
        };
        
        console.log(`Prepared guardian migration: moving ${oldEmailKey} to previousGuardians and creating new entry ${newEmailKey}`);
      }
    }
    
    // Update user profile if exists
    const originalUserPath = `users/${originalUser.uid}`;
    const originalUserSnapshot = await db.ref(originalUserPath).once('value');
    
    if (originalUserSnapshot.exists()) {
      const userData = originalUserSnapshot.val();
      
      // Mark original user profile as migrated
      updates[`${originalUserPath}/emailChangedTo`] = newEmail;
      updates[`${originalUserPath}/emailChangedAt`] = Date.now();
      updates[`${originalUserPath}/profileMigrated`] = true;
      
      // Create/update new user profile
      const newUserPath = `users/${newUser.uid}`;
      updates[newUserPath] = {
        ...userData,
        email: newEmail,
        emailChangedFrom: originalEmail,
        lastUpdated: Date.now()
      };
      
      console.log(`Prepared user profile migration from ${originalUserPath} to ${newUserPath}`);
    }
    
    // Apply all database updates atomically
    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
      console.log('Database updates applied successfully');
    }
    
    // Step 6: Remove claims from original user
    const cleanedOriginalClaims = {};
    // Keep only non-family related claims for original user
    for (const [key, value] of Object.entries(originalClaims)) {
      if (!['familyId', 'familyRole', 'guardianId', 'guardianType'].includes(key)) {
        if (key === 'isStaffUser' && value === true) {
          // Keep staff status if they are staff
          cleanedOriginalClaims[key] = value;
        }
      }
    }
    
    // Mark original user as having email changed
    cleanedOriginalClaims.emailChangedTo = newEmail;
    cleanedOriginalClaims.emailChangedAt = Date.now();
    
    await admin.auth().setCustomUserClaims(originalUser.uid, cleanedOriginalClaims);
    
    // Step 7: Optionally disable original account
    // Uncomment if you want to disable the original account
    // await admin.auth().updateUser(originalUser.uid, { disabled: true });
    
    // Step 8: Log the action
    await logAdminAction('changeUserEmail', originalUser, callerInfo, {
      reason: reason || 'Email change requested',
      originalEmail,
      newEmail,
      familyId,
      authMethod,
      newUserCreated: !newUserExists,
      newUserUid: newUser.uid,
      claimsMigrated: true,
      databaseUpdated: Object.keys(updates).length > 0,
      guardianMovedToPrevious: familyId ? true : false
    });
    
    // Step 9: Send notification emails based on auth method
    let emailSent = false;
    let emailError = null;
    
    if (authMethod === 'password' && !newUserExists && newUser.tempPassword) {
      // Send temp password email for new users with password auth
      try {
        console.log(`Sending temp password email to ${newEmail}`);
        
        // Initialize SendGrid
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_KEY);
        
        const db = admin.database();
        const emailId = db.ref('emails').push().key;
        
        // Get guardian name if available
        let userFirstName = 'Guardian';
        if (familyId) {
          const newEmailKey = sanitizeEmail(newEmail);
          const guardianRef = db.ref(`homeEducationFamilies/familyInformation/${familyId}/guardians/${newEmailKey}`);
          const guardianSnapshot = await guardianRef.once('value');
          if (guardianSnapshot.exists()) {
            const guardianData = guardianSnapshot.val();
            userFirstName = guardianData.firstName || 'Guardian';
          }
        }
        
        // Determine the login URL based on target site
        const targetSite = 'rtdconnect'; // Default to rtdconnect for primary guardians
        const loginUrl = targetSite === 'rtdconnect' 
          ? 'https://rtd-connect.com/login' 
          : 'https://yourway.rtdacademy.com/login';
        
        const siteName = targetSite === 'rtdconnect' 
          ? 'RTD Connect' 
          : 'RTD Academy';
        
        const subject = `Your ${siteName} Email Has Been Changed - Temporary Password`;
        
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Address Changed</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 5px solid #007bff;">
              <h2 style="color: #007bff; margin-top: 0;">🔐 Your Email Address Has Been Updated</h2>
              
              <p>Dear ${userFirstName},</p>
              
              <p>An administrator has updated your primary guardian email address for ${siteName}. Your new login credentials are below.</p>
              
              <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 2px solid #e9ecef; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #495057;">📧 Your New Login Information:</h3>
                <p><strong>Previous Email:</strong> <span style="text-decoration: line-through; color: #6c757d;">${originalEmail}</span></p>
                <p><strong>New Email:</strong> ${newEmail}</p>
                <p><strong>Temporary Password:</strong> <code style="background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 16px; color: #e83e8c;">${newUser.tempPassword}</code></p>
              </div>
              
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #856404;">⚠️ Important Security Notice:</h4>
                <ul style="margin-bottom: 0; color: #856404;">
                  <li>This is a temporary password that expires after your first use</li>
                  <li>You must create a new secure password when you log in</li>
                  <li>Do not share this password with anyone</li>
                  <li>For security, this email should be deleted after you log in</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" 
                   style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  🚀 Log In to Your Account
                </a>
              </div>
              
              <p>All your permissions and family data have been transferred to this new email address. You are still the primary guardian for your family.</p>
              
              <p>${targetSite === 'rtdconnect' 
                ? 'If you have any questions or need assistance, please contact your facilitator.' 
                : 'If you have any questions or need assistance, please contact RTD Academy support.'}</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
              
              <div style="text-align: center; color: #6c757d; font-size: 14px;">
                <p><strong>${siteName}</strong><br>
                ${targetSite === 'rtdconnect' ? 'Home Education Support Platform' : 'Your Way Learning Platform'}</p>
                <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        
        const textContent = `
Your ${siteName} Email Has Been Changed

Dear ${userFirstName},

An administrator has updated your primary guardian email address for ${siteName}. Your new login credentials are below.

Your New Login Information:
Previous Email: ${originalEmail}
New Email: ${newEmail}
Temporary Password: ${newUser.tempPassword}

IMPORTANT SECURITY NOTICE:
- This is a temporary password that expires after your first use
- You must create a new secure password when you log in
- Do not share this password with anyone
- For security, this email should be deleted after you log in

Login at: ${loginUrl}

All your permissions and family data have been transferred to this new email address. You are still the primary guardian for your family.

${targetSite === 'rtdconnect' 
  ? 'If you have any questions or need assistance, please contact your facilitator.' 
  : 'If you have any questions or need assistance, please contact RTD Academy support.'}

${siteName} - ${targetSite === 'rtdconnect' ? 'Home Education Support Platform' : 'Your Way Learning Platform'}
This is an automated message. Please do not reply to this email.
        `;
        
        // Send email via SendGrid
        const emailConfig = {
          personalizations: [{
            to: [{ email: newEmail }],
            subject: subject,
            custom_args: { emailId }
          }],
          from: {
            email: 'noreply@rtdacademy.com',
            name: 'RTD Academy (Do Not Reply)'
          },
          content: [
            { type: 'text/plain', value: textContent },
            { type: 'text/html', value: htmlContent }
          ],
          trackingSettings: {
            openTracking: {
              enable: true,
              substitutionTag: '%open-track%'
            }
          }
        };
        
        await sgMail.send(emailConfig);
        emailSent = true;
        console.log(`Temporary password email sent successfully to ${newEmail}`);
        
        // Store email tracking records
        const timestamp = Date.now();
        const recipientKey = sanitizeEmail(newEmail);
        const senderKey = sanitizeEmail(callerInfo.callerEmail);
        
        await db.ref(`sendGridTracking/${emailId}`).set({
          emailId,
          recipientKey,
          senderKey,
          recipientEmail: newEmail,
          senderEmail: callerInfo.callerEmail,
          timestamp,
          subject,
          sent: true,
          events: {
            sent: {
              timestamp,
              success: true
            }
          },
          metadata: {
            emailType: 'email_change_temp_password',
            sentByAdmin: true,
            originalEmail: originalEmail
          }
        });
        
      } catch (error) {
        console.error('Error sending temp password email:', error);
        emailError = error.message;
        // Don't throw - we still want to return success for the email change
      }
    } else if ((authMethod === 'google' || authMethod === 'microsoft') && !newUserExists) {
      // For Google/Microsoft, we don't send an email - they just sign in with their provider
      console.log(`No email sent for ${authMethod} authentication - user will sign in with provider`);
    }
    
    return {
      success: true,
      message: `Email successfully changed from ${originalEmail} to ${newEmail}`,
      originalUser: {
        uid: originalUser.uid,
        email: originalEmail,
        claimsRemoved: true
      },
      newUser: {
        uid: newUser.uid,
        email: newEmail,
        created: !newUserExists,
        tempPassword: newUser.tempPassword || null,
        claimsMerged: newUserExists,
        authMethod: authMethod
      },
      databaseUpdates: Object.keys(updates).length,
      familyId: familyId || null,
      authMethod: authMethod,
      emailSent: emailSent,
      emailError: emailError
    };
    
  } catch (error) {
    console.error('Error changing user email:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', `An error occurred while changing email: ${error.message}`);
  }
});

/**
 * Cloud Function: sendAuthProviderEmailChangeNotification
 * 
 * Sends email notification for users who will sign in with Google or Microsoft
 */
const sendAuthProviderEmailChangeNotification = onCall({
  concurrency: 50,
  cors: [
    "https://yourway.rtdacademy.com",
    "http://localhost:3000",
    "https://rtd-connect.com",
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ],
  secrets: ["SENDGRID_KEY"]
}, async (request) => {
  const callerInfo = await verifyAdminPermissions(request);
  const { targetEmail, authMethod, originalEmail, targetSite } = request.data;
  
  if (!targetEmail || !authMethod) {
    throw new HttpsError('invalid-argument', 'Target email and authentication method are required.');
  }
  
  if (authMethod === 'password') {
    throw new HttpsError('invalid-argument', 'This function is only for Google/Microsoft authentication.');
  }

  console.log(`Admin ${callerInfo.callerEmail} sending ${authMethod} auth email to: ${targetEmail}`);
  
  try {
    // Initialize SendGrid
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_KEY);

    const db = admin.database();
    const emailId = db.ref('emails').push().key;
    
    // Determine the login URL based on target site
    const loginUrl = targetSite === 'rtdconnect' 
      ? 'https://rtd-connect.com/login' 
      : 'https://yourway.rtdacademy.com/login';
    
    const siteName = targetSite === 'rtdconnect' 
      ? 'RTD Connect' 
      : 'RTD Academy';
    
    const providerName = authMethod === 'google' ? 'Google' : 'Microsoft';
    const providerColor = authMethod === 'google' ? '#4285f4' : '#00a4ef';
    const providerIcon = authMethod === 'google' ? '🇬' : 'Ⓜ️';
    
    // Create email content
    const subject = `Your ${siteName} Email Has Been Updated`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Address Updated</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 5px solid ${providerColor};">
          <h2 style="color: ${providerColor}; margin-top: 0;">${providerIcon} Email Address Updated</h2>
          
          <p>Your primary guardian email address for ${siteName} has been updated by an administrator.</p>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 2px solid #e9ecef; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">📧 Your Updated Login Information:</h3>
            ${originalEmail ? `<p><strong>Previous Email:</strong> <span style="text-decoration: line-through; color: #6c757d;">${originalEmail}</span></p>` : ''}
            <p><strong>New Email:</strong> ${targetEmail}</p>
            <p><strong>Sign In Method:</strong> <span style="color: ${providerColor}; font-weight: bold;">Sign in with ${providerName}</span></p>
          </div>
          
          <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #bee5eb; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #0c5460;">🔐 How to Sign In:</h4>
            <ol style="margin-bottom: 0; color: #0c5460;">
              <li>Go to the ${siteName} login page</li>
              <li>Click the <strong>"Sign in with ${providerName}"</strong> button</li>
              <li>Use your ${providerName} account: <strong>${targetEmail}</strong></li>
              <li>You'll be automatically signed in - no password needed!</li>
            </ol>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #856404;">⚠️ Important Notes:</h4>
            <ul style="margin-bottom: 0; color: #856404;">
              <li><strong>No password required</strong> - You'll sign in using your ${providerName} account</li>
              <li>Make sure you have access to your ${providerName} account (${targetEmail})</li>
              <li>All your permissions and data have been transferred to this new email</li>
              <li>If you don't have a ${providerName} account for this email, you'll need to create one first</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="background-color: ${providerColor}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              ${providerIcon} Sign In with ${providerName}
            </a>
          </div>
          
          <p>${targetSite === 'rtdconnect' 
            ? 'If you have any questions or issues signing in, please contact your facilitator.' 
            : 'If you have any questions or issues signing in, please contact RTD Academy support.'}</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
          
          <div style="text-align: center; color: #6c757d; font-size: 14px;">
            <p><strong>${siteName}</strong><br>
            ${targetSite === 'rtdconnect' ? 'Home Education Support Platform' : 'Your Way Learning Platform'}</p>
            <p style="font-size: 12px;">This is an automated message sent because your email address was updated. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const textContent = `
Your ${siteName} Email Has Been Updated

Your primary guardian email address for ${siteName} has been updated by an administrator.

Your Updated Login Information:
${originalEmail ? `Previous Email: ${originalEmail}` : ''}
New Email: ${targetEmail}
Sign In Method: Sign in with ${providerName}

HOW TO SIGN IN:
1. Go to the ${siteName} login page
2. Click the "Sign in with ${providerName}" button
3. Use your ${providerName} account: ${targetEmail}
4. You'll be automatically signed in - no password needed!

IMPORTANT NOTES:
- No password required - You'll sign in using your ${providerName} account
- Make sure you have access to your ${providerName} account (${targetEmail})
- All your permissions and data have been transferred to this new email
- If you don't have a ${providerName} account for this email, you'll need to create one first

Login at: ${loginUrl}

${targetSite === 'rtdconnect' 
  ? 'If you have any questions or issues signing in, please contact your facilitator.' 
  : 'If you have any questions or issues signing in, please contact RTD Academy support.'}

${siteName} - ${targetSite === 'rtdconnect' ? 'Home Education Support Platform' : 'Your Way Learning Platform'}
This is an automated message. Please do not reply to this email.
    `;

    // Prepare email configuration
    const emailConfig = {
      personalizations: [{
        to: [{ email: targetEmail }],
        subject: subject,
        custom_args: { emailId }
      }],
      from: {
        email: 'noreply@rtdacademy.com',
        name: 'RTD Academy (Do Not Reply)'
      },
      content: [
        {
          type: 'text/plain',
          value: textContent
        },
        {
          type: 'text/html',
          value: htmlContent
        }
      ],
      trackingSettings: {
        openTracking: {
          enable: true,
          substitutionTag: '%open-track%'
        }
      }
    };

    // Send email via SendGrid
    await sgMail.send(emailConfig);

    const timestamp = Date.now();
    const recipientKey = targetEmail.replace(/[.#$[\]]/g, ',');
    const senderKey = callerInfo.callerEmail.replace(/[.#$[\]]/g, ',');

    // Store tracking record
    await db.ref(`sendGridTracking/${emailId}`).set({
      emailId,
      recipientKey,
      senderKey,
      recipientEmail: targetEmail,
      senderEmail: callerInfo.callerEmail,
      senderName: callerInfo.callerEmail,
      timestamp,
      subject,
      sent: true,
      events: {
        sent: {
          timestamp,
          success: true
        }
      },
      metadata: {
        emailType: 'email_change_provider_auth',
        authMethod: authMethod,
        sentByAdmin: true
      },
      recipients: {
        [recipientKey]: {
          email: targetEmail,
          status: 'sent',
          timestamp
        }
      }
    });

    // Store email records
    const emailRecord = {
      subject,
      text: textContent,
      html: htmlContent,
      timestamp,
      sender: 'noreply@rtdacademy.com',
      senderName: 'RTD Academy (Do Not Reply)',
      status: 'sent',
      emailType: 'email_change_provider_auth'
    };

    await Promise.all([
      // Store recipient's copy
      db.ref(`userEmails/${recipientKey}/${emailId}`).set(emailRecord),
      
      // Store sender's copy
      db.ref(`userEmails/${senderKey}/sent/${emailId}`).set({
        ...emailRecord,
        to: targetEmail,
        sentByAdmin: true
      }),
      
      // Create notification
      db.ref(`notifications/${recipientKey}/${emailId}`).set({
        type: 'new_email',
        emailId,
        sender: 'noreply@rtdacademy.com',
        senderName: 'RTD Academy',
        subject,
        preview: 'Your email address has been updated...',
        timestamp,
        read: false
      })
    ]);

    // Log the action
    await logAdminAction('sendAuthProviderEmail', { email: targetEmail, uid: 'N/A' }, callerInfo, {
      emailId,
      authMethod,
      emailChanged: true
    });

    return {
      success: true,
      message: `${providerName} authentication email sent successfully`,
      emailId,
      recipientEmail: targetEmail,
      authMethod
    };

  } catch (error) {
    console.error('Error sending provider auth email:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'An error occurred while sending the authentication email.');
  }
});

/**
 * Cloud Function: updateUserCustomClaims
 * 
 * Allows admins to manually update a user's custom claims
 * This provides full control over custom claims for debugging and management
 */
const updateUserCustomClaims = onCall({
  concurrency: 50,
  enforceAppCheck: false,
  cors: [
    "https://yourway.rtdacademy.com",
    "http://localhost:3000",
    "https://rtd-connect.com",
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ]
}, async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to perform this action.');
  }

  const { targetEmail, customClaims, reason = 'Admin manually updated custom claims' } = request.data;
  const callerUid = request.auth.uid;
  const callerEmail = request.auth.token.email;
  const currentClaims = request.auth.token;
  
  console.log(`Admin ${callerEmail} (${callerUid}) updating custom claims for ${targetEmail}`);
  
  // Check admin permissions - only super admins can update claims
  const isAdmin = currentClaims.isAdminUser === true || 
                  currentClaims.permissions?.isAdmin === true ||
                  currentClaims.roles?.includes('admin');
  
  const isSuperAdmin = ['kyle@rtdacademy.com', 'stan@rtdacademy.com', 'charlie@rtdacademy.com']
    .includes(callerEmail?.toLowerCase());
  
  if (!isAdmin && !isSuperAdmin) {
    console.warn(`Unauthorized attempt to update custom claims by ${callerEmail}`);
    throw new HttpsError('permission-denied', 'Only administrators can update custom claims.');
  }
  
  try {
    // Get the target user by email
    const targetUser = await admin.auth().getUserByEmail(targetEmail);
    
    if (!targetUser) {
      throw new HttpsError('not-found', 'Target user not found.');
    }
    
    // Validate custom claims (basic validation)
    if (typeof customClaims !== 'object' || customClaims === null) {
      throw new HttpsError('invalid-argument', 'Custom claims must be a valid object.');
    }
    
    // Ensure we're not exceeding Firebase's 1000 byte limit for custom claims
    const claimsString = JSON.stringify(customClaims);
    if (claimsString.length > 1000) {
      throw new HttpsError('invalid-argument', 
        `Custom claims size (${claimsString.length} bytes) exceeds Firebase limit of 1000 bytes.`);
    }
    
    // Log the current claims for audit
    const currentUserClaims = targetUser.customClaims || {};
    console.log('Current user claims:', currentUserClaims);
    console.log('New claims to set:', customClaims);
    
    // Update the custom claims
    await admin.auth().setCustomUserClaims(targetUser.uid, customClaims);
    console.log('Custom claims updated successfully');
    
    // Update metadata to trigger token refresh
    const db = admin.database();
    const metadataRef = db.ref(`metadata/${targetUser.uid}`);
    await metadataRef.update({
      refreshTime: Date.now(),
      lastClaimsUpdate: Date.now(),
      updatedBy: callerEmail,
      updateReason: reason
    });
    
    // Log the admin action
    await logAdminAction('updateUserCustomClaims', targetUser, 
      { callerUid, callerEmail }, 
      { reason, oldClaims: currentUserClaims, newClaims: customClaims });
    
    return {
      success: true,
      message: 'Custom claims updated successfully',
      uid: targetUser.uid,
      email: targetUser.email,
      newClaims: customClaims
    };
    
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error('Error updating custom claims:', error);
    throw new HttpsError('internal', `Failed to update custom claims: ${error.message}`);
  }
});

module.exports = {
  setTemporaryPassword,
  deleteFirebaseAuthUser,
  toggleUserAccountStatus,
  getUserSignInMethods,
  getAdminAuditLog,
  sendTempPasswordEmail,
  createUserWithTempPassword,
  removeTempPasswordClaim,
  verifyUserEmail,
  updateUserCustomClaims,
  changeUserEmail,
  sendAuthProviderEmailChangeNotification
};