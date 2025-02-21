// emailTemplates.js
const createEmailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
 <meta charset="utf-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <style>
   body { 
     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
     line-height: 1.5;
     margin: 0;
     padding: 0;
     -webkit-font-smoothing: antialiased;
   }
   .header {
     background-color: #1f2937;
     border-bottom: 1px solid #374151;
     padding: 20px;
   }
   .header-text {
     color: white;
     margin: 0;
     font-size: 20px;
     font-weight: 600;
   }
   .content {
     padding: 24px;
     background-color: white;
   }
   .footer {
     padding: 20px;
     background-color: #f3f4f6;
     color: #6b7280;
     font-size: 12px;
     text-align: center;
   }
   .button {
     display: inline-block;
     padding: 10px 20px;
     background-color: #008B8B;
     color: #ffffff !important;
     text-decoration: none;
     border-radius: 4px;
     margin: 20px 0;
   }
   .note {
     background-color: #f3f4f6;
     padding: 12px;
     border-radius: 4px;
     margin: 16px 0;
   }
 </style>
</head>
<body>
 <div class="header">
   <h1 class="header-text">RTD Academy</h1>
 </div>
 
 <div class="content">
   ${content}
 </div>

 <div class="footer">
   <p>© ${new Date().getFullYear()} RTD Academy. All rights reserved.</p>
   <p>This is an automated message. Please do not reply to this email.</p>
 </div>
</body>
</html>
`;

const getUpcomingCourseEmail = (courseName) => createEmailTemplate(`
 <h2 style="color: #1f2937; margin-bottom: 20px;">Your Course is Starting Soon</h2>
 <p>Hello,</p>
 <p>This is a reminder that your course <strong>${courseName}</strong> will be resuming in 2 days.</p>
 <p>To prepare for your return, please:</p>
 <ul>
   <li>Review your previous course work to remind yourself where you left off</li>
   <li>Take some time to revisit earlier content to get back into the right mindset</li>
   <li>Log in to check and update your schedule to match your current situation</li>
   <li>Reach out to your teacher or support person (CC'd on this email) with any questions or comments</li>
 </ul>
 <div class="note">
   <strong>Important:</strong> Your course is associated with this email address, so make sure you use this email when loging in.
 </div>
 <a href="https://yourway.rtdacademy.com/login" class="button" style="color: #ffffff !important;">Go to Dashboard</a>
`);

const getStartingTodayEmail = (courseName) => createEmailTemplate(`
 <h2 style="color: #1f2937; margin-bottom: 20px;">Your Course Begins Today</h2>
 <p>Hello,</p>
 <p>Your course <strong>${courseName}</strong> is resuming today!</p>
 <p>To ensure a smooth return to your studies:</p>
 <ul>
   <li>Review your previous course work to remind yourself where you left off</li>
   <li>Take some time to revisit earlier content to get back into the right mindset</li>
   <li>Log in to check and update your schedule to match your current situation</li>
   <li>Reach out to your teacher or support person (CC'd on this email) with any questions or comments</li>
 </ul>
 <div class="note">
   <strong>Important:</strong> Your course is associated with this email address, so make sure you use this email when loging in.
 </div>
 <a href="https://yourway.rtdacademy.com/login" class="button" style="color: #ffffff !important;">Start Learning</a>
`);

module.exports = {
 getUpcomingCourseEmail,
 getStartingTodayEmail
};