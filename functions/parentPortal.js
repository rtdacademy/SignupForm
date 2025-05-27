// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');
const { onRequest } = require('firebase-functions/v2/https');
const { onValueCreated } = require('firebase-functions/v2/database');
const { onValueDeleted } = require('firebase-functions/v2/database');
const { HttpsError } = require('firebase-functions/v2/https');

// Other dependencies
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');
const sgMail = require('@sendgrid/mail');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Cloud Function: sendParentInvitation
 * Sends an invitation email to a parent to create an account and link to their child
 */
const sendParentInvitation = onCall({
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"],
  secrets: ["SENDGRID_KEY"]
}, async (data) => {
  // Initialize SendGrid with API key from Secret Manager
  sgMail.setApiKey(process.env.SENDGRID_KEY);
  
  // Authentication check
  if (!data.auth) {
    console.error('Unauthenticated request attempted');
    throw new Error('User must be authenticated.');
  }

  const {
    invitationToken,
    parentEmail,
    parentName,
    studentName,
    courseName
  } = data.data;

  // Input validation
  if (!invitationToken || !parentEmail || !studentName) {
    throw new Error('Missing required fields');
  }

  const db = admin.database();
  
  try {
    // Verify the invitation token exists and is valid
    const invitationRef = db.ref(`parentInvitations/${invitationToken}`);
    const invitationSnapshot = await invitationRef.once('value');
    
    if (!invitationSnapshot.exists()) {
      throw new Error('Invalid invitation token');
    }
    
    const invitation = invitationSnapshot.val();
    if (invitation.status !== 'pending') {
      throw new Error('Invitation has already been used or expired');
    }

    // Create the invitation link - use localhost for test email, production URL otherwise
    const isTestEmail = parentEmail === 'kyle.e.brown13@gmail.com';
    const baseUrl = isTestEmail ? 'http://localhost:3000' : 'https://yourway.rtdacademy.com';
    const invitationLink = `${baseUrl}/parent-login?token=${invitationToken}`;
    
    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #0066cc;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 5px 5px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #0066cc;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RTD Academy Parent Portal Invitation</h1>
          </div>
          <div class="content">
            <p>Dear ${parentName || 'Parent/Guardian'},</p>
            
            <p><strong>🎉 NEW FEATURE:</strong> ${studentName} has registered for ${courseName} at RTD Academy. We're excited to introduce our new Parent Portal!</p>
            
            <p>As their parent/guardian, you're invited to create a parent account. Once fully implemented, you'll be able to:</p>
            
            <ul>
              <li>✅ Approve course enrollments</li>
              <li>🔄 View grades and progress (coming soon)</li>
              <li>🔄 Access course schedules (coming soon)</li>
              <li>🔄 Update contact information (coming soon)</li>
              <li>🔄 Communicate with teachers (coming soon)</li>
            </ul>
            
            <p><strong>💡 Quick Tip:</strong> If you use Gmail (@gmail.com) or Outlook (@outlook.com, @hotmail.com), we recommend clicking "Sign in with Google" or "Sign in with Microsoft" for the fastest setup!</p>
            
            <p>To create your parent account and link it to ${studentName}'s profile, please click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${invitationLink}" class="button">Create Parent Account</a>
            </div>
            
            <p><strong>Important:</strong> For security purposes, you'll need ${studentName}'s Alberta Student Number (ASN) to complete the setup. This is a 9-digit number (####-####-#) found on report cards and school documents.</p>
            
            <p><strong>This invitation will expire in 48 hours.</strong></p>
            
            <p>If you have any questions or need assistance, please contact us at info@rtdacademy.com</p>
            
            <p>Best regards,<br>
            RTD Academy Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message from RTD Academy. Please do not reply to this email.</p>
            <p>If you did not expect this invitation, please contact us immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Plain text version
    const emailText = `
Dear ${parentName || 'Parent/Guardian'},

🎉 NEW FEATURE: ${studentName} has registered for ${courseName} at RTD Academy. We're excited to introduce our new Parent Portal!

As their parent/guardian, you're invited to create a parent account. Once fully implemented, you'll be able to:

✅ Approve course enrollments
🔄 View grades and progress (coming soon)
🔄 Access course schedules (coming soon)
🔄 Update contact information (coming soon)
🔄 Communicate with teachers (coming soon)

💡 Quick Tip: If you use Gmail or Outlook, we recommend using "Sign in with Google" or "Sign in with Microsoft" for the fastest setup!

To create your parent account, please visit:
${invitationLink}

Important: For security purposes, you'll need ${studentName}'s Alberta Student Number (ASN) to complete the setup. This is a 9-digit number (####-####-#) found on report cards and school documents.

This invitation will expire in 48 hours.

If you have any questions, please contact us at info@rtdacademy.com

Best regards,
RTD Academy Team
    `;

    // Send email via SendGrid
    const emailConfig = {
      to: parentEmail,
      from: {
        email: 'info@rtdacademy.com',
        name: 'RTD Academy'
      },
      subject: `Parent Account Invitation - ${studentName}'s Registration`,
      text: emailText,
      html: emailHtml,
      trackingSettings: {
        openTracking: {
          enable: true
        }
      }
    };

    await sgMail.send(emailConfig);

    // Update invitation status
    await invitationRef.update({
      emailSent: true,
      emailSentAt: new Date().toISOString()
    });

    console.log(`Parent invitation sent successfully to ${parentEmail}`);
    
    return {
      success: true,
      message: 'Parent invitation sent successfully'
    };

  } catch (error) {
    console.error('Error sending parent invitation:', error);
    throw new Error(`Failed to send parent invitation: ${error.message}`);
  }
});

/**
 * Cloud Function: acceptParentInvitation
 * Processes a parent's acceptance of the invitation and creates the parent-student link
 */
const acceptParentInvitation = onCall({
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  // Authentication check
  if (!data.auth) {
    console.error('Unauthenticated request attempted');
    throw new Error('User must be authenticated.');
  }

  const { invitationToken } = data.data;
  const parentEmail = data.auth.token.email;
  const parentEmailKey = sanitizeEmail(parentEmail);

  if (!invitationToken) {
    throw new Error('Missing invitation token');
  }

  const db = admin.database();
  
  try {
    // Get invitation details
    const invitationRef = db.ref(`parentInvitations/${invitationToken}`);
    const invitationSnapshot = await invitationRef.once('value');
    
    if (!invitationSnapshot.exists()) {
      throw new Error('Invalid invitation token');
    }
    
    const invitation = invitationSnapshot.val();
    
    // Validate invitation
    if (invitation.status !== 'pending') {
      throw new Error('This invitation has already been used');
    }
    
    if (invitation.parentEmail.toLowerCase() !== parentEmail.toLowerCase()) {
      throw new Error('This invitation was sent to a different email address');
    }
    
    // Check if invitation has expired
    const expirationTime = new Date(invitation.expiresAt).getTime();
    if (Date.now() > expirationTime) {
      throw new Error('This invitation has expired');
    }

    // Verify ASN was checked
    if (!invitation.asnVerified) {
      throw new Error('Student identity verification is required before accepting this invitation');
    }

    const { studentEmailKey, studentName, relationship, courseId, courseName } = invitation;

    // Create parent profile if it doesn't exist
    const parentProfileRef = db.ref(`parents/${parentEmailKey}/profile`);
    const parentProfileSnapshot = await parentProfileRef.once('value');
    
    if (!parentProfileSnapshot.exists()) {
      await parentProfileRef.set({
        email: parentEmail,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        emailVerified: true,
        uid: data.auth.uid
      });
    }

    // Link parent to student
    await db.ref(`parents/${parentEmailKey}/linkedStudents/${studentEmailKey}`).set({
      studentName,
      relationship: relationship || 'Parent',
      isLegalGuardian: true,
      permissions: {
        viewGrades: true,
        viewSchedule: true,
        viewNotes: true,
        editContactInfo: true,
        approveEnrollment: true,
        viewPayments: false
      },
      enrollmentApproval: {
        status: 'pending',
        timestamp: new Date().toISOString(),
        courses: {
          [courseId]: {
            courseName,
            approved: false,
            approvedAt: null
          }
        }
      },
      linkedAt: new Date().toISOString(),
      invitedBy: invitation.studentEmail
    });

    // Update student profile to reflect parent link
    await db.ref(`students/${studentEmailKey}/profile/parentAccounts/${parentEmailKey}`).set({
      status: 'active',
      linkedAt: new Date().toISOString(),
      relationship: relationship || 'Parent'
    });

    // Update parent approval status
    await db.ref(`students/${studentEmailKey}/profile/parentApprovalStatus`).update({
      status: 'linked',
      linkedParentEmail: parentEmail,
      lastUpdated: new Date().toISOString()
    });

    // Mark invitation as accepted
    await invitationRef.update({
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      acceptedBy: parentEmail
    });

    return {
      success: true,
      studentEmailKey,
      studentName,
      message: 'Parent account successfully linked'
    };

  } catch (error) {
    console.error('Error accepting parent invitation:', error);
    throw new Error(`Failed to accept invitation: ${error.message}`);
  }
});

/**
 * Cloud Function: approveStudentEnrollment
 * Allows a parent to approve their child's course enrollment
 */
const approveStudentEnrollment = onCall({
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  // Authentication check
  if (!data.auth) {
    throw new Error('User must be authenticated.');
  }

  const { studentEmailKey, courseId, approved } = data.data;
  const parentEmail = data.auth.token.email;
  const parentEmailKey = sanitizeEmail(parentEmail);

  if (!studentEmailKey || courseId === undefined || approved === undefined) {
    throw new Error('Missing required fields');
  }

  const db = admin.database();
  
  try {
    // Verify parent has permission to approve for this student
    const parentLinkRef = db.ref(`parents/${parentEmailKey}/linkedStudents/${studentEmailKey}`);
    const parentLinkSnapshot = await parentLinkRef.once('value');
    
    if (!parentLinkSnapshot.exists()) {
      throw new Error('You do not have permission to approve enrollments for this student');
    }
    
    const parentLink = parentLinkSnapshot.val();
    if (!parentLink.permissions?.approveEnrollment) {
      throw new Error('You do not have enrollment approval permissions');
    }

    // Update enrollment approval status
    await db.ref(`parents/${parentEmailKey}/linkedStudents/${studentEmailKey}/enrollmentApproval/courses/${courseId}`).update({
      approved,
      approvedAt: new Date().toISOString(),
      approvedBy: parentEmail
    });

    // Update overall approval status
    await db.ref(`parents/${parentEmailKey}/linkedStudents/${studentEmailKey}/enrollmentApproval`).update({
      status: approved ? 'approved' : 'denied',
      lastUpdated: new Date().toISOString()
    });

    // Update student's course record
    await db.ref(`students/${studentEmailKey}/courses/${courseId}`).update({
      parentApproval: {
        required: true,
        approved,
        approvedAt: new Date().toISOString(),
        approvedBy: parentEmail
      }
    });

    // Update student profile approval status
    await db.ref(`students/${studentEmailKey}/profile/parentApprovalStatus`).update({
      status: approved ? 'approved' : 'denied',
      approvedBy: parentEmail,
      lastUpdated: new Date().toISOString()
    });

    // Add a note to the student's course
    const noteContent = approved 
      ? `Parent/Guardian approved enrollment`
      : `Parent/Guardian denied enrollment`;
      
    await db.ref(`students/${studentEmailKey}/courses/${courseId}/jsonStudentNotes`).transaction((currentNotes) => {
      const notesArray = Array.isArray(currentNotes) ? currentNotes : [];
      const newNote = {
        id: `parent-approval-${Date.now()}`,
        content: noteContent,
        timestamp: new Date().toISOString(),
        author: `Parent (${parentEmail})`,
        noteType: approved ? '✅' : '❌',
        metadata: {
          type: 'parent_approval',
          approved,
          parentEmail
        }
      };
      return [newNote, ...notesArray];
    });

    return {
      success: true,
      approved,
      message: approved ? 'Enrollment approved successfully' : 'Enrollment denied'
    };

  } catch (error) {
    console.error('Error approving enrollment:', error);
    throw new Error(`Failed to process enrollment approval: ${error.message}`);
  }
});

/**
 * Database Trigger: sendParentInvitationOnCreate
 * Automatically sends parent invitation email when a new invitation is created in the database
 */
const sendParentInvitationOnCreate = onValueCreated({
  ref: '/parentInvitations/{invitationToken}',
  region: 'us-central1',
  memory: '256MiB',
  secrets: ["SENDGRID_KEY"]
}, async (event) => {
  // Initialize SendGrid with API key from Secret Manager
  sgMail.setApiKey(process.env.SENDGRID_KEY);
  
  const invitationToken = event.params.invitationToken;
  const invitation = event.data.val();
  
  console.log(`Processing new parent invitation: ${invitationToken}`);
  
  if (!invitation || invitation.status !== 'pending') {
    console.log('Invalid or already processed invitation');
    return null;
  }
  
  const {
    parentEmail,
    studentName,
    courseName,
    relationship
  } = invitation;
  
  const db = admin.database();
  
  try {
    // Extract parent name from the invitation if available
    const parentName = invitation.parentName || 'Parent/Guardian';
    
    // Create the invitation link - use localhost for test email, production URL otherwise
    const isTestEmail = parentEmail === 'kyle.e.brown13@gmail.com';
    const baseUrl = isTestEmail ? 'http://localhost:3000' : 'https://yourway.rtdacademy.com';
    const invitationLink = `${baseUrl}/parent-login?token=${invitationToken}`;
    
    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #0066cc;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 5px 5px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #0066cc;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RTD Academy Parent Portal Invitation</h1>
          </div>
          <div class="content">
            <p>Dear ${parentName},</p>
            
            <p><strong>🎉 NEW FEATURE:</strong> ${studentName} has registered for ${courseName} at RTD Academy. We're excited to introduce our new Parent Portal!</p>
            
            <p>As their ${relationship || 'parent/guardian'}, you're invited to create a parent account. Once fully implemented, you'll be able to:</p>
            
            <ul>
              <li>✅ Approve course enrollments</li>
              <li>🔄 View grades and progress (coming soon)</li>
              <li>🔄 Access course schedules (coming soon)</li>
              <li>🔄 Update contact information (coming soon)</li>
              <li>🔄 Communicate with teachers (coming soon)</li>
            </ul>
            
            <p><strong>💡 Quick Tip:</strong> If you use Gmail (@gmail.com) or Outlook (@outlook.com, @hotmail.com), we recommend clicking "Sign in with Google" or "Sign in with Microsoft" for the fastest setup!</p>
            
            <p>To create your parent account and link it to ${studentName}'s profile, please click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${invitationLink}" class="button">Create Parent Account</a>
            </div>
            
            <p><strong>Important:</strong> For security purposes, you'll need ${studentName}'s Alberta Student Number (ASN) to complete the setup. This is a 9-digit number (####-####-#) found on report cards and school documents.</p>
            
            <p><strong>This invitation will expire in 48 hours.</strong></p>
            
            <p>If you have any questions or need assistance, please contact us at info@rtdacademy.com</p>
            
            <p>Best regards,<br>
            RTD Academy Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message from RTD Academy. Please do not reply to this email.</p>
            <p>If you did not expect this invitation, please contact us immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Plain text version
    const emailText = `
Dear ${parentName},

🎉 NEW FEATURE: ${studentName} has registered for ${courseName} at RTD Academy. We're excited to introduce our new Parent Portal!

As their ${relationship || 'parent/guardian'}, you're invited to create a parent account. Once fully implemented, you'll be able to:

✅ Approve course enrollments
🔄 View grades and progress (coming soon)
🔄 Access course schedules (coming soon)
🔄 Update contact information (coming soon)
🔄 Communicate with teachers (coming soon)

💡 Quick Tip: If you use Gmail or Outlook, we recommend using "Sign in with Google" or "Sign in with Microsoft" for the fastest setup!

To create your parent account, please visit:
${invitationLink}

Important: For security purposes, you'll need ${studentName}'s Alberta Student Number (ASN) to complete the setup. This is a 9-digit number (####-####-#) found on report cards and school documents.

This invitation will expire in 48 hours.

If you have any questions, please contact us at info@rtdacademy.com

Best regards,
RTD Academy Team
    `;

    // Send email via SendGrid
    const emailConfig = {
      to: parentEmail,
      from: {
        email: 'info@rtdacademy.com',
        name: 'RTD Academy'
      },
      subject: `Parent Account Invitation - ${studentName}'s Registration`,
      text: emailText,
      html: emailHtml,
      trackingSettings: {
        openTracking: {
          enable: true
        }
      }
    };

    await sgMail.send(emailConfig);

    // Update invitation status
    await db.ref(`parentInvitations/${invitationToken}`).update({
      emailSent: true,
      emailSentAt: new Date().toISOString()
    });

    console.log(`Parent invitation email sent successfully to ${parentEmail}`);
    
    return null;

  } catch (error) {
    console.error('Error sending parent invitation email:', error);
    
    // Update invitation with error status
    await db.ref(`parentInvitations/${invitationToken}`).update({
      emailError: error.message,
      emailErrorAt: new Date().toISOString()
    });
    
    throw error;
  }
});

/**
 * Cloud Function: validateParentInvitation
 * Public function to validate invitation tokens without authentication
 */
const validateParentInvitation = onCall({
  memory: '256MiB',
  timeoutSeconds: 30,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  const { token } = data.data;

  if (!token) {
    throw new Error('Missing invitation token');
  }

  const db = admin.database();
  
  try {
    // Get invitation details
    const invitationRef = db.ref(`parentInvitations/${token}`);
    const invitationSnapshot = await invitationRef.once('value');
    
    if (!invitationSnapshot.exists()) {
      throw new Error('Invalid invitation token');
    }
    
    const invitation = invitationSnapshot.val();
    
    // Check if invitation is still valid
    if (invitation.status !== 'pending') {
      if (invitation.status === 'accepted') {
        throw new Error('This invitation has already been used. You can now sign in directly to the Parent Portal.');
      } else {
        throw new Error('This invitation is no longer valid.');
      }
    }
    
    // Check expiration
    const expirationTime = new Date(invitation.expiresAt).getTime();
    if (Date.now() > expirationTime) {
      throw new Error('This invitation has expired. Please contact the school for a new invitation.');
    }

    // Return only the necessary information (no sensitive data)
    return {
      success: true,
      invitation: {
        parentEmail: invitation.parentEmail,
        parentName: invitation.parentName,
        studentName: invitation.studentName,
        courseName: invitation.courseName,
        relationship: invitation.relationship,
        expiresAt: invitation.expiresAt,
        status: invitation.status
      }
    };

  } catch (error) {
    console.error('Error validating invitation:', error);
    throw new Error(error.message || 'Failed to validate invitation');
  }
});

/**
 * Cloud Function: verifyStudentASN
 * Verifies that the parent knows the student's ASN before linking accounts
 */
const verifyStudentASN = onCall({
  memory: '256MiB',
  timeoutSeconds: 30,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  // Authentication check
  if (!data.auth) {
    console.error('Unauthenticated request attempted');
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { invitationToken, providedASN } = data.data;

  if (!invitationToken || !providedASN) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  const db = admin.database();
  
  try {
    // Get invitation details
    const invitationRef = db.ref(`parentInvitations/${invitationToken}`);
    const invitationSnapshot = await invitationRef.once('value');
    
    if (!invitationSnapshot.exists()) {
      throw new HttpsError('not-found', 'Invalid invitation token');
    }
    
    const invitation = invitationSnapshot.val();
    
    // Validate invitation is still pending
    if (invitation.status !== 'pending') {
      throw new HttpsError('failed-precondition', 'This invitation has already been used or is no longer valid');
    }
    
    // Verify the parent email matches the authenticated user
    if (invitation.parentEmail.toLowerCase() !== data.auth.token.email.toLowerCase()) {
      throw new HttpsError('permission-denied', 'This invitation was sent to a different email address');
    }
    
    // Get the student's ASN from their profile
    const studentEmailKey = invitation.studentEmailKey;
    const studentProfileRef = db.ref(`students/${studentEmailKey}/profile/asn`);
    const studentASNSnapshot = await studentProfileRef.once('value');
    
    if (!studentASNSnapshot.exists()) {
      console.error(`No ASN found for student: ${studentEmailKey}`);
      throw new HttpsError(
        'not-found',
        'Student verification data not found. Please contact support.'
      );
    }
    
    const actualASN = studentASNSnapshot.val();
    
    // Clean both ASNs for comparison (remove dashes and spaces)
    const cleanProvidedASN = providedASN.replace(/[\s-]/g, '');
    const cleanActualASN = actualASN.replace(/[\s-]/g, '');
    
    // Log for debugging (without revealing the actual ASN)
    console.log(`ASN verification attempt for invitation ${invitationToken}: Length matches: ${cleanProvidedASN.length === cleanActualASN.length}`);
    
    // Compare ASNs
    if (cleanProvidedASN !== cleanActualASN) {
      // Log failed attempt for security monitoring
      console.warn(`Failed ASN verification attempt for invitation ${invitationToken} by ${data.auth.token.email}`);
      
      // Track failed attempts
      await invitationRef.child('verificationAttempts').push({
        timestamp: new Date().toISOString(),
        attemptedBy: data.auth.token.email,
        success: false
      });
      
      // For v2 functions, use HttpsError for proper client error handling
      throw new HttpsError(
        'invalid-argument',
        'The Alberta Student Number provided does not match our records. Please ensure you enter the ASN exactly as it appears on the student\'s official documents (####-####-#).'
      );
    }
    
    // ASN matches - mark verification as successful
    await invitationRef.update({
      asnVerified: true,
      asnVerifiedAt: new Date().toISOString(),
      asnVerifiedBy: data.auth.token.email
    });
    
    console.log(`Successful ASN verification for invitation ${invitationToken}`);
    
    return {
      success: true,
      message: 'Student identity verified successfully'
    };

  } catch (error) {
    console.error('Error verifying student ASN:', error);
    
    // If it's already an HttpsError, re-throw it
    if (error instanceof HttpsError) {
      throw error;
    }
    
    // Otherwise, wrap it in an HttpsError
    throw new HttpsError('internal', error.message || 'Failed to verify student information');
  }
});

/**
 * Database Trigger: processParentInvitationRequest
 * Watches for parent invitation requests under student profiles and creates actual invitations
 * This provides better security as students can only create requests under their own profile
 */
const processParentInvitationRequest = onValueCreated({
  ref: '/students/{studentEmailKey}/parentInvitationRequest',
  region: 'us-central1',
  memory: '256MiB'
}, async (event) => {
  const studentEmailKey = event.params.studentEmailKey;
  const request = event.data.val();
  
  console.log(`Processing parent invitation request for student: ${studentEmailKey}`);
  
  if (!request || request.status !== 'pending') {
    console.log('Invalid or already processed request');
    return null;
  }
  
  const db = admin.database();
  
  try {
    // Validate the request
    if (!request.parentEmail || !request.studentEmail || !request.courseName) {
      throw new Error('Missing required fields in invitation request');
    }
    
    // Generate a secure invitation token
    const invitationToken = db.ref('parentInvitations').push().key;
    
    // Create the actual parent invitation with validated data
    await db.ref(`parentInvitations/${invitationToken}`).set({
      parentEmail: request.parentEmail,
      parentName: request.parentName || 'Parent/Guardian',
      studentEmail: request.studentEmail,
      studentEmailKey: studentEmailKey,
      studentName: request.studentName,
      relationship: request.relationship || 'Parent',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
      status: 'pending',
      courseId: request.courseId,
      courseName: request.courseName,
      processedFromRequest: true // Flag to indicate this came from a request
    });
    
    // Update the request to mark it as processed
    await db.ref(`students/${studentEmailKey}/parentInvitationRequest`).update({
      status: 'processed',
      processedAt: new Date().toISOString(),
      invitationToken: invitationToken
    });
    
    // Clean up the request after a delay (optional)
    setTimeout(async () => {
      try {
        await db.ref(`students/${studentEmailKey}/parentInvitationRequest`).remove();
      } catch (error) {
        console.log('Error cleaning up processed request:', error);
      }
    }, 5000); // Remove after 5 seconds
    
    console.log(`Successfully created parent invitation ${invitationToken} from request`);
    
    return null;
  } catch (error) {
    console.error('Error processing parent invitation request:', error);
    
    // Update request with error status
    await db.ref(`students/${studentEmailKey}/parentInvitationRequest`).update({
      status: 'error',
      error: error.message,
      errorAt: new Date().toISOString()
    });
    
    throw error;
  }
});

/**
 * Cloud Function: getParentDashboardData
 * Fetches all linked students' data that the parent has permission to view
 */
const getParentDashboardData = onCall({
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data) => {
  // Authentication check
  if (!data.auth) {
    console.error('Unauthenticated request attempted');
    throw new Error('User must be authenticated.');
  }

  const parentEmail = data.auth.token.email;
  const parentEmailKey = sanitizeEmail(parentEmail);

  const db = admin.database();
  
  try {
    // Fetch parent's data
    const parentRef = db.ref(`parents/${parentEmailKey}`);
    const parentSnapshot = await parentRef.once('value');
    
    if (!parentSnapshot.exists()) {
      throw new Error('Parent account not found. Please ensure you have accepted a parent invitation.');
    }
    
    const parentData = parentSnapshot.val();
    
    // Check if parent has any linked students
    if (!parentData.linkedStudents || Object.keys(parentData.linkedStudents).length === 0) {
      return {
        success: true,
        message: 'No linked students found',
        linkedStudents: []
      };
    }
    
    // Fetch important dates once (shared across all students)
    const importantDatesRef = db.ref('ImportantDates');
    const importantDatesSnapshot = await importantDatesRef.once('value');
    const importantDates = importantDatesSnapshot.exists() ? importantDatesSnapshot.val() : {};
    
    // Process each linked student
    const linkedStudentsData = [];
    const processedStudentKeys = new Set(); // Track processed students to avoid duplicates
    
    for (const [studentKey, studentLink] of Object.entries(parentData.linkedStudents)) {
      // Skip if we've already processed this student
      if (processedStudentKeys.has(studentKey)) {
        console.warn(`Duplicate student key found: ${studentKey}. Using first occurrence.`);
        continue;
      }
      processedStudentKeys.add(studentKey);
      try {
        // Verify the link is active by checking student's profile
        const studentParentLinkRef = db.ref(`students/${studentKey}/profile/parentAccounts/${parentEmailKey}`);
        const studentParentLinkSnapshot = await studentParentLinkRef.once('value');
        
        if (!studentParentLinkSnapshot.exists()) {
          console.warn(`Parent link not found in student profile for ${studentKey}`);
          continue;
        }
        
        const studentParentLink = studentParentLinkSnapshot.val();
        if (studentParentLink.status !== 'active') {
          console.warn(`Parent link is not active for student ${studentKey}`);
          continue;
        }
        
        // Fetch student profile data
        const studentProfileRef = db.ref(`students/${studentKey}/profile`);
        const studentProfileSnapshot = await studentProfileRef.once('value');
        
        if (!studentProfileSnapshot.exists()) {
          console.warn(`Student profile not found for ${studentKey}`);
          continue;
        }
        
        const studentProfile = studentProfileSnapshot.val();
        const permissions = studentLink.permissions || {};
        
        // Build student data object based on permissions
        const studentData = {
          studentKey,
          studentEmailKey: studentKey, // Ensure both naming conventions are supported
          studentName: studentLink.studentName,
          relationship: studentLink.relationship,
          linkedAt: studentLink.linkedAt,
          permissions,
          enrollmentApproval: studentLink.enrollmentApproval,
          profile: studentProfile, // Include entire profile
          // We'll add studentType from the first course if available
          studentType: null
        };
        
        // Fetch courses if permitted
        if (permissions.viewSchedule || permissions.viewGrades) {
          const studentCoursesRef = db.ref(`students/${studentKey}/courses`);
          const studentCoursesSnapshot = await studentCoursesRef.once('value');
          
          if (studentCoursesSnapshot.exists()) {
            const courses = studentCoursesSnapshot.val();
            studentData.courses = [];
            
            for (const [courseId, courseData] of Object.entries(courses)) {
              // Fetch detailed course information from /courses/{courseId}
              let courseDetails = null;
              let teachersInfo = [];
              try {
                const courseDetailsRef = db.ref(`courses/${courseId}`);
                const courseDetailsSnapshot = await courseDetailsRef.once('value');
                if (courseDetailsSnapshot.exists()) {
                  courseDetails = courseDetailsSnapshot.val();
                  
                  // Fetch teacher information
                  if (courseDetails.Teachers && Array.isArray(courseDetails.Teachers)) {
                    for (const teacherEmail of courseDetails.Teachers) {
                      try {
                        const teacherKey = teacherEmail.replace(/\./g, ',');
                        const teacherRef = db.ref(`staff/${teacherKey}`);
                        const teacherSnapshot = await teacherRef.once('value');
                        if (teacherSnapshot.exists()) {
                          const teacherData = teacherSnapshot.val();
                          teachersInfo.push({
                            email: teacherData.email,
                            firstName: teacherData.firstName,
                            lastName: teacherData.lastName,
                            displayName: `${teacherData.firstName} ${teacherData.lastName}`,
                            signature: teacherData.signature
                          });
                        }
                      } catch (error) {
                        console.log(`Could not fetch teacher info for ${teacherEmail}:`, error.message);
                      }
                    }
                  }
                }
              } catch (error) {
                console.log(`Could not fetch course details for ${courseId}:`, error.message);
              }
              
              const courseInfo = {
                // Core identifiers
                CourseID: courseId,
                id: courseId,
                
                // From student's course data
                Course: courseData.Course || { 
                  Id: parseInt(courseId), 
                  Value: courseData.courseName || courseDetails?.Title || `Course ${courseId}`
                },
                courseName: courseData.courseName || courseData.Course?.Value || courseDetails?.Title || '',
                courseCode: courseData.courseCode || courseDetails?.Title || '',
                credits: courseData.credits || courseDetails?.courseCredits || 0,
                courseCredits: courseData.credits || courseDetails?.courseCredits || 0,
                
                // Status and enrollment
                Status: courseData.Status || { Id: 1, Value: 'Active' },
                status: courseData.status || courseData.Status?.Value || 'Active',
                ActiveFutureArchived: courseData.ActiveFutureArchived || { Id: 1, Value: 'Active' },
                enrollmentStatus: courseData.enrollmentStatus || courseData.ActiveFutureArchived?.Value || 'Active',
                parentApproval: courseData.parentApproval,
                
                // Dates
                ScheduleStartDate: courseData.ScheduleStartDate || courseData.startDate || '',
                ScheduleEndDate: courseData.ScheduleEndDate || courseData.endDate || '',
                startDate: courseData.startDate || courseData.ScheduleStartDate || '',
                endDate: courseData.endDate || courseData.ScheduleEndDate || '',
                
                // From course details
                CourseType: courseDetails?.CourseType || '',
                grade: courseDetails?.grade || '',
                NumberOfHours: courseDetails?.NumberOfHours || '',
                minCompletionMonths: courseDetails?.minCompletionMonths || 1,
                recommendedCompletionMonths: courseDetails?.recommendedCompletionMonths || 5,
                units: courseDetails?.units || [],
                weights: courseDetails?.weights || {},
                DiplomaCourse: courseDetails?.DiplomaCourse || 'No',
                CurrentTeacher: courseDetails?.CurrentTeacher || '',
                Teachers: courseDetails?.Teachers || [],
                teachersInfo: teachersInfo,
                // Add courseDetails with teacher info formatted for CourseDetailsDialog
                courseDetails: {
                  ...courseDetails,
                  teachers: teachersInfo.reduce((acc, teacher, index) => {
                    acc[index] = {
                      displayName: teacher.displayName,
                      email: teacher.email,
                      firstName: teacher.firstName,
                      lastName: teacher.lastName
                    };
                    return acc;
                  }, {}),
                  supportStaff: {} // Add support staff if available
                }
              };
              
              // Add grades if permitted
              if (permissions.viewGrades) {
                courseInfo.overallGrade = courseData.overallGrade;
                courseInfo.letterGrade = courseData.letterGrade;
                courseInfo.progress = courseData.progress || 0;
                courseInfo.completedUnits = courseData.completedUnits || 0;
                courseInfo.totalUnits = courseData.totalUnits || courseDetails?.units?.length || 0;
                courseInfo.lastAccessed = courseData.lastAccessed;
                
                // Calculate progress if not provided
                if (!courseInfo.progress && courseInfo.totalUnits > 0) {
                  courseInfo.progress = Math.round((courseInfo.completedUnits / courseInfo.totalUnits) * 100);
                }
              }
              
              // Add schedule if permitted
              if (permissions.viewSchedule) {
                courseInfo.schedule = courseData.schedule;
                courseInfo.datesArray = courseData.datesArray;
                courseInfo.nextScheduledDate = courseData.nextScheduledDate || null;
              }
              
              studentData.courses.push(courseInfo);
              
              // Set student type from first course if not already set
              if (!studentData.studentType && courseData.StudentType) {
                studentData.studentType = courseData.StudentType;
              }
            }
          }
        }
        
        // Add notes if permitted
        if (permissions.viewNotes) {
          // We'll only include a count of notes, not the actual content for privacy
          const notesRef = db.ref(`students/${studentKey}/courses`);
          const notesSnapshot = await notesRef.once('value');
          
          if (notesSnapshot.exists()) {
            const courses = notesSnapshot.val();
            studentData.notesCount = {};
            
            for (const [courseId, courseData] of Object.entries(courses)) {
              if (courseData.jsonStudentNotes && Array.isArray(courseData.jsonStudentNotes)) {
                studentData.notesCount[courseId] = courseData.jsonStudentNotes.length;
              }
            }
          }
        }
        
        // Payment info already handled above when we included the full profile
        
        // Add important dates (already fetched above)
        studentData.importantDates = importantDates;
        
        linkedStudentsData.push(studentData);
        
      } catch (error) {
        console.error(`Error processing student ${studentKey}:`, error);
        // Continue with other students
      }
    }
    
    return {
      success: true,
      parentProfile: {
        email: parentData.profile?.email || parentEmail,
        lastLogin: parentData.profile?.lastLogin,
        emailVerified: parentData.profile?.emailVerified
      },
      linkedStudents: linkedStudentsData,
      totalLinkedStudents: linkedStudentsData.length
    };
    
  } catch (error) {
    console.error('Error fetching parent dashboard data:', error);
    throw new Error(`Failed to fetch dashboard data: ${error.message}`);
  }
});

// Export all functions
module.exports = {
  sendParentInvitation,
  sendParentInvitationOnCreate,
  validateParentInvitation,
  verifyStudentASN,
  processParentInvitationRequest,
  acceptParentInvitation,
  approveStudentEnrollment,
  getParentDashboardData
};