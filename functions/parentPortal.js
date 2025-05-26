// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');
const { onRequest } = require('firebase-functions/v2/https');
const { onValueCreated } = require('firebase-functions/v2/database');
const { onValueDeleted } = require('firebase-functions/v2/database');

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

// Export all functions
module.exports = {
  sendParentInvitation,
  sendParentInvitationOnCreate,
  validateParentInvitation,
  processParentInvitationRequest,
  acceptParentInvitation,
  approveStudentEnrollment
};