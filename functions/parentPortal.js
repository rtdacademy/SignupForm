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
 * Helper function to mask email address for privacy
 * Shows first part and domain with partial masking
 * e.g., 'john.doe@example.com' -> 'john@e*****.com'
 */
const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  
  const [localPart, domain] = email.split('@');
  if (!domain) return email; // Invalid email format
  
  const [domainName, ...domainExtParts] = domain.split('.');
  const domainExt = domainExtParts.join('.');
  
  // Show first character of domain and mask the rest
  const maskedDomain = domainName.length > 1 
    ? domainName[0] + '*****' 
    : domainName;
  
  // Show first 4 characters of local part or all if shorter
  const visibleLocalPart = localPart.length > 4 
    ? localPart.substring(0, 4)
    : localPart;
  
  return `${visibleLocalPart}@${maskedDomain}.${domainExt}`;
};

/**
 * Helper function to check if addresses match
 * Compares key address components for verification
 */
const addressesMatch = (address1, address2) => {
  if (!address1 || !address2) return false;
  
  // Normalize for comparison
  const normalize = (str) => str?.toString().toLowerCase().trim() || '';
  
  // Check if all key components match
  return (
    normalize(address1.streetAddress) === normalize(address2.streetAddress) &&
    normalize(address1.city) === normalize(address2.city) &&
    normalize(address1.province) === normalize(address2.province) &&
    normalize(address1.postalCode) === normalize(address2.postalCode) &&
    normalize(address1.country) === normalize(address2.country)
  );
};

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
            color: white !important;
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
            
            <p><strong>Important:</strong> For security purposes, you'll need to verify ${studentFirstName}'s identity. You can use either their Alberta Student Number (ASN) - a 9-digit number (####-####-#) found on report cards - or their home address.</p>
            
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

Important: For security purposes, you'll need to verify ${studentFirstName}'s identity. You can use either their Alberta Student Number (ASN) - a 9-digit number (####-####-#) found on report cards - or their home address.

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
    
    // Normalize emails for comparison
    const normalizedInvitationEmail = (invitation.parentEmail || '').toLowerCase().trim();
    const normalizedParentEmail = (parentEmail || '').toLowerCase().trim();
    
    if (normalizedInvitationEmail !== normalizedParentEmail) {
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
 * Handles different scenarios with appropriate email templates
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
  
  console.log(`Processing new parent invitation: ${invitationToken} - Scenario: ${invitation.scenario}`);
  
  if (!invitation || invitation.status !== 'pending') {
    console.log('Invalid or already processed invitation');
    return null;
  }
  
  const {
    parentEmail,
    studentName,
    courseName,
    relationship,
    scenario = 'new_parent' // Default to new parent scenario
  } = invitation;
  
  const db = admin.database();
  
  try {
    // Check if parent account already exists
    const parentEmailKey = sanitizeEmail(parentEmail);
    const parentRef = db.ref(`parents/${parentEmailKey}`);
    const parentSnapshot = await parentRef.once('value');
    const parentExists = parentSnapshot.exists();
    
    // Extract parent name from the invitation if available
    const parentName = invitation.parentName || 'Parent/Guardian';
    
    // Get student first name only for privacy (until verified)
    const studentFirstName = studentName ? studentName.split(' ')[0] : 'your child';
    
    // Create the invitation link - use localhost for test email, production URL otherwise
    const isTestEmail = parentEmail === 'kyle.e.brown13@gmail.com';
    const baseUrl = isTestEmail ? 'http://localhost:3000' : 'https://yourway.rtdacademy.com';
    
    let emailHtml, emailText, emailSubject;
    
    // Generate different email content based on scenario
    if (scenario === 'new_parent' || !parentExists) {
      // Handle both new parent and existing parent with invitation
      const invitationLink = parentExists 
        ? `${baseUrl}/parent-login` 
        : `${baseUrl}/parent-login?firstTime=true&email=${encodeURIComponent(parentEmail)}`;
      emailSubject = parentExists 
        ? `Action Required: ${studentFirstName}'s Course Enrollment`
        : `Parent Account Invitation - ${studentFirstName}'s Registration`;
      
      // Email HTML template
      emailHtml = `
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
            color: white !important;
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
            <h1>RTD Academy Parent Portal ${parentExists ? 'Action Required' : 'Invitation'}</h1>
          </div>
          <div class="content">
            <p>Dear ${parentName},</p>
            
            <p><strong>🎉 ${parentExists ? 'ACTION REQUIRED:' : 'NEW FEATURE:'}</strong> ${studentName} has registered for ${courseName} at RTD Academy. ${parentExists ? 'They need your approval to proceed.' : "We're excited to introduce our new Parent Portal!"}</p>
            
            <p>As their ${relationship || 'parent/guardian'}, you're invited to ${parentExists ? 'access' : 'create'} a parent account. Once fully implemented, you'll be able to:</p>
            
            <ul>
              <li>✅ Approve course enrollments</li>
              <li>🔄 View grades and progress (coming soon)</li>
              <li>🔄 Access course schedules (coming soon)</li>
              <li>🔄 Update contact information (coming soon)</li>
              <li>🔄 Communicate with teachers (coming soon)</li>
            </ul>
            
            <p><strong>💡 Quick Tip:</strong> ${!parentExists ? 'If you use Gmail (@gmail.com) or Outlook (@outlook.com, @hotmail.com), we recommend clicking "Sign in with Google" or "Sign in with Microsoft" for the fastest setup!' : 'Sign in to your parent account to view and approve this enrollment.'}</p>
            
            <p>${parentExists 
              ? `To view and approve ${studentName}'s enrollment, please sign in to your parent account:`
              : `To create your parent account and link it to ${studentName}'s profile, please click the button below:`
            }</p>
            
            <div style="text-align: center;">
              <a href="${invitationLink}" class="button">${parentExists ? 'Sign In to Parent Portal' : 'Create Parent Account'}</a>
            </div>
            
            <p><strong>Important:</strong> ${parentExists 
              ? `After signing in, you'll see ${studentFirstName}'s pending enrollment on your dashboard. You'll need to verify their identity using their Alberta Student Number (ASN) or home address before approving.`
              : `For security purposes, you'll need to verify ${studentFirstName}'s identity. You can use either their Alberta Student Number (ASN) - a 9-digit number (####-####-#) found on report cards - or their home address.`
            }</p>
            
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

As their ${relationship || 'parent/guardian'}, you're invited to ${parentExists ? 'access' : 'create'} a parent account. Once fully implemented, you'll be able to:

✅ Approve course enrollments
🔄 View grades and progress (coming soon)
🔄 Access course schedules (coming soon)
🔄 Update contact information (coming soon)
🔄 Communicate with teachers (coming soon)

${!parentExists 
  ? '💡 Quick Tip: If you use Gmail or Outlook, we recommend using "Sign in with Google" or "Sign in with Microsoft" for the fastest setup!'
  : '💡 Quick Tip: Sign in to your parent account to view and approve this enrollment.'
}

${parentExists 
  ? `To view and approve ${studentName}'s enrollment, please sign in at:`
  : 'To create your parent account, please visit:'
}
${invitationLink}

Important: ${parentExists 
  ? `After signing in, you'll see ${studentFirstName}'s pending enrollment on your dashboard. You'll need to verify their identity using their Alberta Student Number (ASN) or home address before approving.`
  : `For security purposes, you'll need to verify ${studentFirstName}'s identity. You can use either their Alberta Student Number (ASN) - a 9-digit number (####-####-#) found on report cards - or their home address.`
}

This invitation will expire in 48 hours.

If you have any questions, please contact us at info@rtdacademy.com

Best regards,
RTD Academy Team
      `;
      
    } else if (scenario === 'existing_parent_new_student') {
      // Scenario 2: Existing parent, new student wants to link
      emailSubject = `New Student Link Request - ${studentFirstName}`;
      
      emailHtml = `
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
              color: white !important;
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
            .info-box {
              background-color: #e3f2fd;
              border-left: 4px solid #0066cc;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Student Link Request</h1>
            </div>
            <div class="content">
              <p>Dear ${parentName},</p>
              
              <p>A new student wants to link their account to your parent profile:</p>
              
              <div class="info-box">
                <p><strong>Student:</strong> ${studentFirstName}<br>
                <strong>Email:</strong> ${maskEmail(invitation.studentEmail)}<br>
                <strong>Course:</strong> ${courseName}<br>
                <strong>Relationship:</strong> ${relationship || 'Parent'}</p>
              </div>
              
              <p>To approve this request and link ${studentFirstName}'s account to your parent profile, please log in to your parent dashboard:</p>
              
              <div style="text-align: center;">
                <a href="${baseUrl}/parent-login" class="button">Go to Parent Dashboard</a>
              </div>
              
              <p>Once logged in, you'll see the pending request at the top of your dashboard. You'll need to verify the student's identity using their Alberta Student Number (ASN) or home address.</p>
              
              <p>If you don't recognize this student or didn't expect this request, you can safely ignore this email.</p>
              
              <p>Best regards,<br>
              RTD Academy Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message from RTD Academy. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      emailText = `
Dear ${parentName},

A new student wants to link their account to your parent profile:

Student: ${studentFirstName}
Email: ${maskEmail(invitation.studentEmail)}
Course: ${courseName}
Relationship: ${relationship || 'Parent'}

To approve this request, please log in to your parent dashboard at:
${baseUrl}/parent-login

Once logged in, you'll see the pending request at the top of your dashboard. You'll need to verify the student's identity using their Alberta Student Number (ASN) or home address.

If you don't recognize this student, you can safely ignore this email.

Best regards,
RTD Academy Team
      `;
      
    } else if (scenario === 'existing_student_new_course') {
      // Scenario 3: Same student adding a new course
      emailSubject = `Course Enrollment Approval Required - ${studentFirstName}`;
      
      emailHtml = `
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
              color: white !important;
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
            .course-box {
              background-color: #fff;
              border: 2px solid #0066cc;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Course Enrollment Approval Required</h1>
            </div>
            <div class="content">
              <p>Dear ${parentName},</p>
              
              <p>${studentName} has enrolled in a new course and requires your approval:</p>
              
              <div class="course-box">
                <h3 style="color: #0066cc; margin-top: 0;">${courseName}</h3>
                <p style="margin: 10px 0;">Course ID: ${invitation.courseId}</p>
              </div>
              
              <p><strong>Important:</strong> ${studentFirstName} can begin studying immediately. However, their enrollment will not be officially registered with Alberta Education until you approve it.</p>
              
              <p>To review and approve this enrollment, please log in to your parent dashboard:</p>
              
              <div style="text-align: center;">
                <a href="${baseUrl}/parent-login" class="button">Review Enrollment</a>
              </div>
              
              <p>You can approve or decline the enrollment from your dashboard. If you decline, ${studentFirstName} will still have access to the course materials, but won't be registered with PASI.</p>
              
              <p>Best regards,<br>
              RTD Academy Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message from RTD Academy. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      emailText = `
Dear ${parentName},

${studentName} has enrolled in a new course and requires your approval:

Course: ${courseName}
Course ID: ${invitation.courseId}

Important: ${studentFirstName} can begin studying immediately. However, their enrollment will not be officially registered with Alberta Education until you approve it.

To review and approve this enrollment, please log in to your parent dashboard at:
${baseUrl}/parent-login

You can approve or decline the enrollment from your dashboard.

Best regards,
RTD Academy Team
      `;
      
    } else {
      // Default fallback
      console.warn(`Unknown scenario: ${scenario}, using default new parent template`);
      // For fallback, use the invitation token if available
      const invitationLink = `${baseUrl}/parent-login${invitationToken ? `?token=${invitationToken}` : ''}`;
      emailSubject = `Parent Account Invitation - ${studentFirstName}'s Registration`;
      
      // Use the full new_parent template as fallback
      emailHtml = `<!DOCTYPE html>
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
            color: white !important;
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
            <p>To create your parent account and link it to ${studentFirstName}'s profile, please click the button below:</p>
            <div style="text-align: center;">
              <a href="${invitationLink}" class="button">Create Parent Account</a>
            </div>
            <p>Best regards,<br>
            RTD Academy Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message from RTD Academy. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>`;
      
      emailText = `Dear ${parentName},

${studentName} has registered for ${courseName} at RTD Academy.

To create your parent account, please visit:
${invitationLink}

Best regards,
RTD Academy Team`;
    }

    // Send email via SendGrid
    const emailConfig = {
      to: parentEmail,
      from: {
        email: 'info@rtdacademy.com',
        name: 'RTD Academy'
      },
      subject: emailSubject,
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

    // Get student first name only for privacy
    const studentFirstName = invitation.studentName 
      ? invitation.studentName.split(' ')[0] 
      : 'Student';
    
    // Mask the student email
    const maskedStudentEmail = maskEmail(invitation.studentEmail);
    
    // Check if student has ASN to determine verification options
    const studentEmailKey = invitation.studentEmailKey;
    const studentASNRef = db.ref(`students/${studentEmailKey}/profile/asn`);
    const studentASNSnapshot = await studentASNRef.once('value');
    const hasASN = studentASNSnapshot.exists() && studentASNSnapshot.val();
    
    // Return only the necessary information (no sensitive data)
    return {
      success: true,
      invitation: {
        parentEmail: invitation.parentEmail,
        parentName: invitation.parentName,
        studentName: studentFirstName, // Only first name
        studentEmail: maskedStudentEmail, // Masked email
        courseName: invitation.courseName,
        relationship: invitation.relationship,
        expiresAt: invitation.expiresAt,
        status: invitation.status,
        verificationOptions: {
          asn: hasASN,
          address: true // Always allow address verification
        }
      }
    };

  } catch (error) {
    console.error('Error validating invitation:', error);
    throw new Error(error.message || 'Failed to validate invitation');
  }
});

/**
 * Cloud Function: verifyStudentASN
 * Verifies that the parent knows the student's ASN or address before linking accounts
 * Now supports both ASN and address verification for international students
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

  const { invitationToken, providedASN, providedAddress, verificationType } = data.data;

  if (!invitationToken) {
    throw new HttpsError('invalid-argument', 'Missing invitation token');
  }

  // Validate that we have either ASN or address for verification
  if (verificationType === 'asn' && !providedASN) {
    throw new HttpsError('invalid-argument', 'Missing ASN for verification');
  }
  
  if (verificationType === 'address' && !providedAddress) {
    throw new HttpsError('invalid-argument', 'Missing address for verification');
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
    const normalizedInvitationEmail = (invitation.parentEmail || '').toLowerCase().trim();
    const normalizedAuthEmail = (data.auth.token.email || '').toLowerCase().trim();
    
    if (normalizedInvitationEmail !== normalizedAuthEmail) {
      throw new HttpsError('permission-denied', 'This invitation was sent to a different email address');
    }
    
    // Get student email key from invitation
    const studentEmailKey = invitation.studentEmailKey;
    
    // Perform verification based on type
    let verificationSuccess = false;
    let verificationError = '';
    
    if (verificationType === 'asn') {
      // ASN Verification
      const studentProfileRef = db.ref(`students/${studentEmailKey}/profile/asn`);
      const studentASNSnapshot = await studentProfileRef.once('value');
      
      if (!studentASNSnapshot.exists() || !studentASNSnapshot.val()) {
        // Check if student is international - they might not have ASN
        const studentTypeRef = db.ref(`students/${studentEmailKey}/profile/studentType`);
        const studentTypeSnapshot = await studentTypeRef.once('value');
        const studentType = studentTypeSnapshot.val();
        
        if (studentType === 'International Student') {
          throw new HttpsError(
            'failed-precondition',
            'This student does not have an Alberta Student Number. Please use address verification instead.'
          );
        }
        
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
        verificationError = 'The Alberta Student Number provided does not match our records. Please ensure you enter the ASN exactly as it appears on the student\'s official documents (####-####-#).';
      } else {
        verificationSuccess = true;
      }
      
    } else if (verificationType === 'address') {
      // Address Verification
      const studentAddressRef = db.ref(`students/${studentEmailKey}/profile/address`);
      const studentAddressSnapshot = await studentAddressRef.once('value');
      
      if (!studentAddressSnapshot.exists()) {
        throw new HttpsError(
          'not-found',
          'Student address information not found. Please contact support.'
        );
      }
      
      const actualAddress = studentAddressSnapshot.val();
      
      // Compare addresses using the helper function
      if (!addressesMatch(providedAddress, actualAddress)) {
        verificationError = 'The address provided does not match our records. Please ensure you enter the exact address the student used during registration.';
      } else {
        verificationSuccess = true;
      }
    } else {
      throw new HttpsError('invalid-argument', 'Invalid verification type');
    }
    
    // Handle verification result
    if (!verificationSuccess) {
      // Log failed attempt for security monitoring
      console.warn(`Failed ${verificationType} verification attempt for invitation ${invitationToken} by ${data.auth.token.email}`);
      
      // Track failed attempts
      await invitationRef.child('verificationAttempts').push({
        timestamp: new Date().toISOString(),
        attemptedBy: data.auth.token.email,
        success: false,
        verificationType: verificationType
      });
      
      throw new HttpsError('invalid-argument', verificationError);
    }
    
    // Verification successful - mark as verified
    await invitationRef.update({
      [`${verificationType}Verified`]: true,
      [`${verificationType}VerifiedAt`]: new Date().toISOString(),
      [`${verificationType}VerifiedBy`]: data.auth.token.email,
      // Keep backward compatibility for existing code
      asnVerified: true,
      asnVerifiedAt: new Date().toISOString(),
      asnVerifiedBy: data.auth.token.email
    });
    
    console.log(`Successful ${verificationType} verification for invitation ${invitationToken}`);
    
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
 * Handles three scenarios:
 * 1. New parent (first time) - Create invitation with token
 * 2. Existing parent, new student - Create pending link request
 * 3. Existing parent, same student new course - Send notification only
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
    
    const parentEmailKey = sanitizeEmail(request.parentEmail);
    
    // Check if parent account exists
    const parentRef = db.ref(`parents/${parentEmailKey}`);
    const parentSnapshot = await parentRef.once('value');
    const parentExists = parentSnapshot.exists();
    
    // Check if student is already linked to this parent
    let studentAlreadyLinked = false;
    if (parentExists) {
      const linkedStudentRef = db.ref(`parents/${parentEmailKey}/linkedStudents/${studentEmailKey}`);
      const linkedStudentSnapshot = await linkedStudentRef.once('value');
      studentAlreadyLinked = linkedStudentSnapshot.exists();
    }
    
    // Determine the scenario and process accordingly
    if (!parentExists) {
      // Scenario 1: New parent - Create traditional invitation with token
      console.log('Scenario 1: New parent account');
      
      const invitationToken = db.ref('parentInvitations').push().key;
      
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
        processedFromRequest: true,
        scenario: 'new_parent',
        // Include resend metadata if this is a resend
        ...(request.isResend && {
          isResend: true,
          resentBy: request.resentBy,
          resentAt: request.resentAt
        })
      });
      
      // Update the request with token
      await db.ref(`students/${studentEmailKey}/parentInvitationRequest`).update({
        status: 'processed',
        processedAt: new Date().toISOString(),
        invitationToken: invitationToken,
        scenario: 'new_parent'
      });
      
    } else if (!studentAlreadyLinked) {
      // Scenario 2: Existing parent, new student - Create pending link request
      console.log('Scenario 2: Existing parent, new student');
      
      // Create a pending link request in the parent's account
      await db.ref(`parents/${parentEmailKey}/pendingLinkRequests/${studentEmailKey}`).set({
        studentName: request.studentName,
        studentEmail: request.studentEmail,
        courseName: request.courseName,
        courseId: request.courseId,
        requestedAt: new Date().toISOString(),
        relationship: request.relationship || 'Parent',
        status: 'pending'
      });
      
      // Also create a simple invitation for email notification
      const invitationToken = db.ref('parentInvitations').push().key;
      
      await db.ref(`parentInvitations/${invitationToken}`).set({
        parentEmail: request.parentEmail,
        parentName: request.parentName || 'Parent/Guardian',
        studentEmail: request.studentEmail,
        studentEmailKey: studentEmailKey,
        studentName: request.studentName,
        relationship: request.relationship || 'Parent',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days for existing parents
        status: 'pending',
        courseId: request.courseId,
        courseName: request.courseName,
        processedFromRequest: true,
        scenario: 'existing_parent_new_student',
        requiresToken: false, // Parent can approve from dashboard
        // Include resend metadata if this is a resend
        ...(request.isResend && {
          isResend: true,
          resentBy: request.resentBy,
          resentAt: request.resentAt
        })
      });
      
      // Update the request
      await db.ref(`students/${studentEmailKey}/parentInvitationRequest`).update({
        status: 'processed',
        processedAt: new Date().toISOString(),
        scenario: 'existing_parent_new_student'
      });
      
    } else {
      // Scenario 3: Existing parent, same student adding new course
      console.log('Scenario 3: Existing parent, same student, new course');
      
      // Add the new course to enrollment approval
      await db.ref(`parents/${parentEmailKey}/linkedStudents/${studentEmailKey}/enrollmentApproval/courses/${request.courseId}`).set({
        courseName: request.courseName,
        approved: false,
        approvedAt: null,
        requestedAt: new Date().toISOString()
      });
      
      // Update enrollment approval status
      await db.ref(`parents/${parentEmailKey}/linkedStudents/${studentEmailKey}/enrollmentApproval`).update({
        status: 'pending',
        lastUpdated: new Date().toISOString()
      });
      
      // Create notification-only invitation
      const invitationToken = db.ref('parentInvitations').push().key;
      
      await db.ref(`parentInvitations/${invitationToken}`).set({
        parentEmail: request.parentEmail,
        parentName: request.parentName || 'Parent/Guardian',
        studentEmail: request.studentEmail,
        studentEmailKey: studentEmailKey,
        studentName: request.studentName,
        relationship: request.relationship || 'Parent',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        status: 'pending',
        courseId: request.courseId,
        courseName: request.courseName,
        processedFromRequest: true,
        scenario: 'existing_student_new_course',
        requiresToken: false,
        notificationOnly: true,
        // Include resend metadata if this is a resend
        ...(request.isResend && {
          isResend: true,
          resentBy: request.resentBy,
          resentAt: request.resentAt
        })
      });
      
      // Update the request
      await db.ref(`students/${studentEmailKey}/parentInvitationRequest`).update({
        status: 'processed',
        processedAt: new Date().toISOString(),
        scenario: 'existing_student_new_course'
      });
    }
    
    // Clean up the request after a delay
    setTimeout(async () => {
      try {
        await db.ref(`students/${studentEmailKey}/parentInvitationRequest`).remove();
      } catch (error) {
        console.log('Error cleaning up processed request:', error);
      }
    }, 5000); // Remove after 5 seconds
    
    console.log(`Successfully processed parent invitation request with scenario: ${
      !parentExists ? 'new_parent' : !studentAlreadyLinked ? 'existing_parent_new_student' : 'existing_student_new_course'
    }`);
    
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
 * Cloud Function: resendParentInvitation
 * Allows a student to resend parent invitation email for a specific course
 * Includes rate limiting to prevent spam
 */
const resendParentInvitation = onCall({
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000", "https://3000-idx-yourway-1744540653512.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"]
}, async (data) => {
  // Authentication check
  if (!data.auth) {
    return {
      success: false,
      error: 'User must be authenticated.'
    };
  }

  const { courseId } = data.data;
  const studentEmail = data.auth.token.email;
  const studentEmailKey = sanitizeEmail(studentEmail);

  if (!courseId) {
    return {
      success: false,
      error: 'Course ID is required'
    };
  }

  const db = admin.database();
  
  try {
    // Get student's course data to verify they're enrolled
    const studentCourseRef = db.ref(`students/${studentEmailKey}/courses/${courseId}`);
    const studentCourseSnapshot = await studentCourseRef.once('value');
    
    if (!studentCourseSnapshot.exists()) {
      return {
        success: false,
        error: 'You are not enrolled in this course'
      };
    }

    const courseData = studentCourseSnapshot.val();
    
    // Get student profile to check if they're under 18
    const studentProfileRef = db.ref(`students/${studentEmailKey}/profile`);
    const studentProfileSnapshot = await studentProfileRef.once('value');
    
    if (!studentProfileSnapshot.exists()) {
      return {
        success: false,
        error: 'Student profile not found'
      };
    }

    const studentProfile = studentProfileSnapshot.val();
    const isUnder18 = studentProfile.age && studentProfile.age < 18;
    
    if (!isUnder18) {
      return {
        success: false,
        error: 'Parent approval is not required for students 18 or older'
      };
    }

    // Check if parent approval is already approved
    if (courseData.parentApproval?.approved) {
      return {
        success: false,
        error: 'Parent approval has already been granted for this course'
      };
    }

    // Get course details
    const courseDetailsRef = db.ref(`courses/${courseId}`);
    const courseDetailsSnapshot = await courseDetailsRef.once('value');
    
    if (!courseDetailsSnapshot.exists()) {
      return {
        success: false,
        error: 'Course not found'
      };
    }

    const courseDetails = courseDetailsSnapshot.val();

    // Get parent email from student profile
    const parentEmail = studentProfile.ParentEmail || studentProfile.parentEmail || studentProfile.emergencyContactEmail;
    if (!parentEmail) {
      return {
        success: false,
        error: 'No parent email found in your profile. Please contact support to update your parent contact information.'
      };
    }

    // Rate limiting: Check for recent invitations
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const allInvitationsRef = db.ref('parentInvitations');
    const recentInvitationsQuery = allInvitationsRef.orderByChild('createdAt').startAt(oneDayAgo);
    const recentInvitationsSnapshot = await recentInvitationsQuery.once('value');
    
    let recentInvitationFound = false;
    if (recentInvitationsSnapshot.exists()) {
      recentInvitationsSnapshot.forEach((inviteSnapshot) => {
        const invitation = inviteSnapshot.val();
        if (invitation.studentEmailKey === studentEmailKey && 
            invitation.courseId === courseId &&
            invitation.parentEmail?.toLowerCase() === parentEmail.toLowerCase()) {
          recentInvitationFound = true;
          return true; // Break the forEach loop
        }
      });
    }

    if (recentInvitationFound) {
      return {
        success: false,
        error: 'An invitation was already sent within the last 24 hours. Please wait before sending another.'
      };
    }

    // Get parent relationship from student profile (prefer stored relationship over hardcoded 'Parent')
    const parentRelationship = studentProfile.parentRelationship || 'Parent';
    const parentFirstName = studentProfile.ParentFirstName || '';
    const parentLastName = studentProfile.ParentLastName || '';
    const parentName = `${parentFirstName} ${parentLastName}`.trim() || 'Parent/Guardian';

    // Check if there's already a pending parentInvitationRequest
    const existingRequestRef = db.ref(`students/${studentEmailKey}/parentInvitationRequest`);
    const existingRequestSnapshot = await existingRequestRef.once('value');
    
    if (existingRequestSnapshot.exists()) {
      const existingRequest = existingRequestSnapshot.val();
      if (existingRequest.status === 'pending') {
        return {
          success: false,
          error: 'A parent invitation request is already being processed. Please wait a moment and try again.'
        };
      }
    }

    // Create parentInvitationRequest following the same pattern as registration flow
    // This will trigger the processParentInvitationRequest function which handles the proper flow
    await db.ref(`students/${studentEmailKey}/parentInvitationRequest`).set({
      parentEmail: parentEmail,
      parentName: parentName,
      studentEmail: studentEmail,
      studentName: `${studentProfile.firstName || ''} ${studentProfile.lastName || ''}`.trim() || 'Student',
      relationship: parentRelationship,
      requestedAt: new Date().toISOString(),
      courseId: courseId,
      courseName: courseDetails.Title || `Course ${courseId}`,
      status: 'pending',
      // Additional metadata for resend tracking
      isResend: true,
      resentBy: studentEmail,
      resentAt: new Date().toISOString()
    });

    // The processParentInvitationRequest trigger will handle creating the parentInvitations entry
    // and determining the appropriate scenario based on existing parent/student relationships

    console.log(`Parent invitation request created successfully for course ${courseId} by student ${studentEmail}`);
    
    return {
      success: true,
      message: 'Parent invitation request has been created and will be processed shortly. An email will be sent to your parent.',
      parentEmail: parentEmail
    };

  } catch (error) {
    console.error('Error resending parent invitation:', error);
    return {
      success: false,
      error: error.message || 'Failed to resend parent invitation'
    };
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
      // Create parent account on first login
      console.log(`Creating new parent account for ${parentEmail}`);
      
      const newParentProfile = {
        email: parentEmail,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        emailVerified: data.auth.token.email_verified || false,
        uid: data.auth.uid,
        accountCreationType: 'direct_login' // Track how account was created
      };
      
      await db.ref(`parents/${parentEmailKey}/profile`).set(newParentProfile);
      
      // Return empty dashboard for new parent
      return {
        success: true,
        parentProfile: newParentProfile,
        linkedStudents: [],
        totalLinkedStudents: 0,
        message: 'Welcome! Your parent account has been created. You can now link to your children\'s accounts.'
      };
    }
    
    const parentData = parentSnapshot.val();
    
    // Update last login
    await db.ref(`parents/${parentEmailKey}/profile/lastLogin`).set(new Date().toISOString());
    
    // Check for any pending invitations for this parent email
    // Normalize the parent email for comparison
    const normalizedParentEmail = parentEmail.toLowerCase().trim();
    
    // Query all invitations and filter by normalized email
    const pendingInvitationsRef = db.ref('parentInvitations');
    const allInvitationsSnapshot = await pendingInvitationsRef.once('value');
    
    const pendingInvitations = [];
    if (allInvitationsSnapshot.exists()) {
      allInvitationsSnapshot.forEach((inviteSnapshot) => {
        const invitation = inviteSnapshot.val();
        // Normalize the invitation email for comparison
        const normalizedInvitationEmail = (invitation.parentEmail || '').toLowerCase().trim();
        
        if (normalizedInvitationEmail === normalizedParentEmail && 
            invitation.status === 'pending' && 
            new Date(invitation.expiresAt) > new Date()) {
          pendingInvitations.push({
            token: inviteSnapshot.key,
            ...invitation
          });
        }
      });
    }
    
    console.log(`Found ${pendingInvitations.length} pending invitations for ${parentEmail}`);
    
    // Check if parent has any linked students
    if (!parentData.linkedStudents || Object.keys(parentData.linkedStudents).length === 0) {
      return {
        success: true,
        message: 'No linked students found',
        linkedStudents: [],
        pendingInvitations: pendingInvitations,
        parentProfile: {
          email: parentData.profile?.email || parentEmail,
          lastLogin: parentData.profile?.lastLogin,
          emailVerified: parentData.profile?.emailVerified
        },
        totalLinkedStudents: 0
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
          profile: studentProfile // Include entire profile
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
                
                // Student type for this specific course
                StudentType: courseData.StudentType || null,
                
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
                Created: courseData.Created || courseData.created || '',
                
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
    
    // Always include pending invitations in the response
    return {
      success: true,
      parentProfile: {
        email: parentData.profile?.email || parentEmail,
        lastLogin: parentData.profile?.lastLogin,
        emailVerified: parentData.profile?.emailVerified
      },
      linkedStudents: linkedStudentsData,
      totalLinkedStudents: linkedStudentsData.length,
      pendingInvitations: pendingInvitations
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
  resendParentInvitation,
  getParentDashboardData
};