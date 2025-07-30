// functions/adminUserManagement.js

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

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
  
  // Check if caller has admin permissions
  const isAdmin = callerClaims.isAdminUser || callerClaims.isSuperAdminUser || 
                  (callerClaims.staffPermissions && callerClaims.staffPermissions.includes('admin'));
  
  if (!isAdmin && callerEmail !== 'kyle@rtdacademy.com') {
    throw new HttpsError('permission-denied', 'Only admin users can perform user management actions.');
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
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ]
}, async (request) => {
  const callerInfo = await verifyAdminPermissions(request);
  const { targetEmail, customPassword, reason } = request.data;
  
  if (!targetEmail) {
    throw new HttpsError('invalid-argument', 'Target email is required.');
  }
  
  console.log(`Admin ${callerInfo.callerEmail} setting temporary password for: ${targetEmail}`);
  
  try {
    // Get target user
    const targetUser = await admin.auth().getUserByEmail(targetEmail);
    
    // Generate or use provided password
    const tempPassword = customPassword || generateTempPassword();
    
    // Update user password
    await admin.auth().updateUser(targetUser.uid, {
      password: tempPassword
    });
    
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
      passwordGenerated: !customPassword
    });
    
    return {
      success: true,
      tempPassword: tempPassword,
      message: 'Temporary password set successfully',
      userEmail: targetUser.email
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
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ],
  secrets: ["SENDGRID_KEY"]
}, async (request) => {
  const callerInfo = await verifyAdminPermissions(request);
  const { targetEmail, tempPassword, userFirstName } = request.data;
  
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
    
    // Create email content
    const firstName = userFirstName || 'Student';
    const subject = 'Temporary Password for Your RTD Academy Account';
    
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
          
          <p>Hello ${firstName},</p>
          
          <p>An administrator has set a temporary password for your RTD Academy account. You can use this password to log in, but you'll be required to create a new password during your next login for security purposes.</p>
          
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
            <a href="https://yourway.rtdacademy.com/login" 
               style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              🚀 Log In to Your Account
            </a>
          </div>
          
          <p>If you have any questions or need assistance, please contact your teacher or RTD Academy support.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
          
          <div style="text-align: center; color: #6c757d; font-size: 14px;">
            <p><strong>RTD Academy</strong><br>
            Your Way Learning Platform</p>
            <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const textContent = `
Temporary Password for Your RTD Academy Account

Hello ${firstName},

An administrator has set a temporary password for your RTD Academy account. You can use this password to log in, but you'll be required to create a new password during your next login for security purposes.

Your Login Information:
Email: ${targetEmail}
Temporary Password: ${tempPassword}

IMPORTANT SECURITY NOTICE:
- This is a temporary password that expires after your first use
- You must create a new secure password when you log in
- Do not share this password with anyone
- For security, this email should be deleted after you log in

Login at: https://yourway.rtdacademy.com/login

If you have any questions or need assistance, please contact your teacher or RTD Academy support.

RTD Academy - Your Way Learning Platform
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
    "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ],
  secrets: ["SENDGRID_KEY"]
}, async (request) => {
  const callerInfo = await verifyAdminPermissions(request);
  const { targetEmail, customPassword, sendEmail, reason, userFirstName } = request.data;
  
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
    const newUserRecord = await admin.auth().createUser({
      email: targetEmail,
      password: tempPassword,
      emailVerified: false,
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
        
        // Create email content
        const firstName = userFirstName || 'Student';
        const subject = 'Welcome to RTD Academy - Your New Account';
        
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to RTD Academy</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 5px solid #28a745;">
              <h2 style="color: #28a745; margin-top: 0;">🎉 Welcome to RTD Academy!</h2>
              
              <p>Hello ${firstName},</p>
              
              <p>An administrator has created a new account for you at RTD Academy. We're excited to have you join our learning community!</p>
              
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
                <a href="https://yourway.rtdacademy.com/login" 
                   style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  🚀 Access Your Account
                </a>
              </div>
              
              <p>Once you log in, you'll have access to all your courses and learning materials. If you have any questions or need assistance, please contact your teacher or RTD Academy support.</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
              
              <div style="text-align: center; color: #6c757d; font-size: 14px;">
                <p><strong>RTD Academy</strong><br>
                Your Way Learning Platform</p>
                <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        
        const textContent = `
Welcome to RTD Academy!

Hello ${firstName},

An administrator has created a new account for you at RTD Academy. We're excited to have you join our learning community!

Your Login Information:
Email: ${targetEmail}
Temporary Password: ${tempPassword}

IMPORTANT SECURITY INFORMATION:
- This is a temporary password that you must change on your first login
- You'll be prompted to create a secure password when you sign in
- Keep this information secure until you log in
- For security, delete this email after you've successfully logged in

Login at: https://yourway.rtdacademy.com/login

Once you log in, you'll have access to all your courses and learning materials. If you have any questions or need assistance, please contact your teacher or RTD Academy support.

RTD Academy - Your Way Learning Platform
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
 * Cloud Function: removeTempPasswordClaim
 * 
 * Removes the temporary password requirement claim from the calling user
 */
const removeTempPasswordClaim = onCall({
  concurrency: 50,
  cors: [
    "https://yourway.rtdacademy.com", 
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
    const userRecord = await admin.auth().getUser(uid);
    const currentClaims = userRecord.customClaims || {};
    
    // Check if user actually has temp password claim
    if (!currentClaims.tempPasswordRequired) {
      return {
        success: true,
        message: 'No temporary password claim to remove'
      };
    }
    
    // Remove temporary password related claims
    const newClaims = { ...currentClaims };
    delete newClaims.tempPasswordRequired;
    delete newClaims.tempPasswordSetAt;
    delete newClaims.tempPasswordSetBy;
    
    await admin.auth().setCustomUserClaims(uid, newClaims);
    
    // Update metadata to trigger token refresh
    const db = admin.database();
    await db.ref(`metadata/${uid}`).set({
      refreshTime: Date.now(),
      tempPasswordRemoved: Date.now()
    });
    
    // Log the action
    await logAdminAction('removeTempPasswordClaim', { email: userEmail, uid }, { 
      callerUid: uid, 
      callerEmail: userEmail 
    }, {
      reason: 'User completed forced password change'
    });
    
    return {
      success: true,
      message: 'Temporary password claim removed successfully'
    };
    
  } catch (error) {
    console.error('Error removing temporary password claim:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'An error occurred while removing temporary password claim.');
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
  removeTempPasswordClaim
};