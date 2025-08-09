import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';

const TermsAndConditions = () => {
  const effectiveDate = "August 8, 2025";
  const lastUpdated = "August 8, 2025";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
            <p className="text-gray-600">
              YourWay Platform by Edbotz Inc.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Effective Date: {effectiveDate} | Last Updated: {lastUpdated}
            </p>
          </div>

          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-8">
              {/* Agreement */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
                <p className="mb-4">
                  These Terms and Conditions ("Terms") govern your use of the YourWay educational 
                  platform operated by Edbotz Inc. ("Company," "we," "us," or "our"), including 
                  services provided at yourway.rtdacademy.com (education services) and 
                  rtd-connect.com (home education support services), collectively referred to 
                  as the "Platform."
                </p>
                <p className="mb-4">
                  By accessing or using our Platform, you agree to be bound by these Terms. 
                  If you disagree with any part of these terms, you may not access the Platform.
                </p>
              </section>

              <Separator className="my-6" />

              {/* SMS Messaging Terms */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">2. SMS Messaging Terms</h2>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-sm font-medium">
                    <strong>SMS Messaging Terms:</strong> By providing your mobile number and opting in 
                    during registration, you consent to receive one-to-one school-related SMS messages 
                    from RTD Academy staff. Msg & data rates may apply. Msg frequency varies. Reply 
                    STOP to opt out. Reply HELP for assistance.
                  </p>
                </div>
              </section>

              <Separator className="my-6" />

              {/* Definitions */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Definitions</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>"Student"</strong> means an individual enrolled in educational courses</li>
                  <li><strong>"Guardian"</strong> means a parent or legal guardian of a Student under 18</li>
                  <li><strong>"Home Education Family"</strong> means families participating in home education support services</li>
                  <li><strong>"Facilitator"</strong> means an approved education support specialist</li>
                  <li><strong>"Services"</strong> means all educational and support services offered through the Platform</li>
                  <li><strong>"Content"</strong> means all educational materials, courses, and resources</li>
                </ul>
              </section>

              <Separator className="my-6" />

              {/* Account Registration */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Account Registration and Eligibility</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">4.1 Account Creation</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>You must provide accurate, current, and complete information</li>
                      <li>You are responsible for maintaining account security</li>
                      <li>You must notify us immediately of any unauthorized access</li>
                      <li>One account per user (no account sharing)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">4.2 Eligibility</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Users must be 18+ or have parental/guardian consent</li>
                      <li>Students must meet program-specific requirements</li>
                      <li>Home Education Families must be Alberta residents</li>
                      <li>Users must have legal capacity to enter binding contracts</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator className="my-6" />

              {/* Service-Specific Terms */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Service-Specific Terms</h2>
                
                <Alert className="mb-6">
                  <AlertDescription>
                    Different terms apply depending on which services you use. Please review 
                    the sections relevant to your use of the Platform.
                  </AlertDescription>
                </Alert>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">5.1 Education Services (Main Site)</h3>
                    
                    <div className="space-y-4 pl-4">
                      <div>
                        <h4 className="font-medium mb-2">5.1.1 Course Enrollment</h4>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                          <li>Enrollment subject to prerequisites and availability</li>
                          <li>Course schedules and content may be modified</li>
                          <li>Students must maintain satisfactory academic progress</li>
                          <li>Academic integrity policies apply to all coursework</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">5.1.2 Tuition and Payments</h4>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                          <li>Tuition fees are due upon enrollment unless otherwise arranged</li>
                          <li>All payments processed securely through Stripe</li>
                          <li>Payment card information is not stored on our servers</li>
                          <li>Late payment may result in suspension of access</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">5.1.3 Refund Policy</h4>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                          <li>Full refund within 14 days of enrollment if no content accessed</li>
                          <li>Partial refunds may be available for documented circumstances</li>
                          <li>No refunds after 30 days or 25% course completion</li>
                          <li>Refund requests must be submitted in writing</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">5.2 Home Education Support (RTD-Connect)</h3>
                    
                    <div className="space-y-4 pl-4">
                      <div>
                        <h4 className="font-medium mb-2">5.2.1 Program Eligibility</h4>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                          <li>Must be Alberta residents with home education notification</li>
                          <li>Students must be registered with Alberta Education</li>
                          <li>Must comply with Alberta home education regulations</li>
                          <li>Annual re-registration required</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">5.2.2 Reimbursement Program</h4>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                          <li>Reimbursements for approved educational expenses only</li>
                          <li>Original receipts and documentation required</li>
                          <li>Subject to Alberta Education funding guidelines</li>
                          <li>Maximum amounts per student per year apply</li>
                          <li>Funds distributed through Stripe Connect to verified accounts</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">5.2.3 Stripe Connect Requirements</h4>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                          <li>Primary guardians must create Stripe Connect accounts for payouts</li>
                          <li>Banking information provided directly to Stripe (not stored by us)</li>
                          <li>Identity verification required by Stripe</li>
                          <li>Tax reporting responsibilities remain with recipients</li>
                          <li>Payout schedules subject to processing times</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">5.2.4 Facilitator Services</h4>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                          <li>Facilitator selection at family's discretion</li>
                          <li>Facilitators are teachers employed by RTD Academy</li>
                          <li>We do not guarantee specific outcomes</li>
                          <li>Facilitator communications are subject to school policies</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <Separator className="my-6" />

              {/* User Responsibilities */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">6. User Responsibilities and Conduct</h2>
                
                <div className="space-y-4">
                  <p>Users agree to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Provide accurate and truthful information</li>
                    <li>Maintain confidentiality of account credentials</li>
                    <li>Use the Platform only for lawful educational purposes</li>
                    <li>Respect intellectual property rights</li>
                    <li>Not share, sell, or distribute course content</li>
                    <li>Not engage in academic dishonesty or plagiarism</li>
                    <li>Not attempt to bypass security measures</li>
                    <li>Not harass, abuse, or harm other users</li>
                    <li>Comply with all applicable laws and regulations</li>
                  </ul>
                </div>
              </section>

              <Separator className="my-6" />

              {/* Communications and Consent */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Communications and Consent</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">7.1 Email Communications</h3>
                    <p className="mb-2">
                      By using our Platform, you consent to receive emails from us including:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Essential service communications (cannot be opted out)</li>
                      <li>Educational updates and course notifications</li>
                      <li>Important announcements and system updates</li>
                      <li>Security alerts and password resets</li>
                      <li>Billing and payment notifications</li>
                    </ul>
                    <p className="mt-2 text-sm">
                      Emails are delivered via SendGrid. You may manage non-essential email 
                      preferences in your account settings.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">7.2 SMS Communications (Opt-In Required)</h3>
                    <p className="mb-2">
                      We offer optional SMS communications through Microsoft Teams for:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Personalized teacher-to-parent communications about student progress</li>
                      <li>Individual scheduling updates and reminders</li>
                      <li>Urgent course-related matters requiring immediate attention</li>
                      <li>One-to-one academic support communications</li>
                    </ul>
                    
                    <div className="bg-blue-50 p-3 rounded-lg mt-3">
                      <p className="text-sm font-medium mb-1">SMS Consent Terms:</p>
                      <ul className="list-disc pl-4 space-y-1 text-xs">
                        <li>SMS is strictly opt-in and requires explicit consent</li>
                        <li>Used only for educational purposes, never marketing</li>
                        <li>One-to-one communication only, not mass messaging</li>
                        <li>You may opt out at any time by replying STOP</li>
                        <li>Standard message and data rates may apply</li>
                        <li>We do not charge for SMS services</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">7.3 Communication Preferences</h3>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>You may update communication preferences in your account settings</li>
                      <li>Essential service communications cannot be disabled</li>
                      <li>Opting out of communications does not affect service access</li>
                      <li>Contact support@rtdacademy.com for preference assistance</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator className="my-6" />

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property Rights</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">8.1 Platform Content</h3>
                    <p className="mb-2">
                      All content on the Platform, including courses, materials, graphics, and 
                      software, is owned by or licensed to Edbotz Inc. and is protected by 
                      copyright and other intellectual property laws.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">8.2 Limited License</h3>
                    <p className="mb-2">
                      We grant you a limited, non-exclusive, non-transferable license to access 
                      and use the Platform and Content for personal educational purposes only.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">8.3 User Content</h3>
                    <p className="mb-2">
                      You retain ownership of content you submit but grant us a license to use, 
                      modify, and display it as necessary to provide our Services.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-6" />

              {/* Payment Processing */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Payment Processing and Financial Terms</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">9.1 Payment Methods</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        <strong>Tuition Payments:</strong> Processed through Stripe's standard 
                        payment gateway. We do not store credit card information.
                      </li>
                      <li>
                        <strong>Reimbursement Payouts:</strong> Distributed via Stripe Connect 
                        to verified bank accounts. Banking details are managed directly by Stripe.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">9.2 Financial Responsibilities</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Users responsible for all fees and charges incurred</li>
                      <li>Currency conversions subject to current exchange rates</li>
                      <li>Tax obligations remain with users</li>
                      <li>T4A slips issued for reimbursements as required</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">9.3 Billing Disputes</h3>
                    <p>
                      Billing disputes must be reported within 30 days of the transaction. 
                      We will investigate and respond within 10 business days.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-6" />

              {/* Privacy */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Privacy and Data Protection</h2>
                <p className="mb-4">
                  Your use of the Platform is also governed by our Privacy Statement, which 
                  describes how we collect, use, and protect your personal information. By 
                  using the Platform, you consent to our data practices as described in the 
                  Privacy Statement.
                </p>
                <p>
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                    View our Privacy Statement
                  </Link>
                </p>
              </section>

              <Separator className="my-6" />

              {/* Disclaimers */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Disclaimers and Limitations of Liability</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">11.1 Service Availability</h3>
                    <p className="mb-2">
                      The Platform is provided "as is" and "as available." We do not guarantee 
                      uninterrupted or error-free service. Scheduled maintenance and unexpected 
                      outages may occur.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">11.2 Educational Outcomes</h3>
                    <p className="mb-2">
                      We do not guarantee specific educational outcomes, grades, or success in 
                      examinations. Learning results depend on individual effort and circumstances.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">11.3 Third-Party Services</h3>
                    <p className="mb-2">
                      We are not responsible for third-party services, including payment 
                      processors, facilitators, or external educational resources.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">11.4 Limitation of Liability</h3>
                    <p className="mb-2 uppercase font-semibold">
                      To the maximum extent permitted by law, Edbotz Inc. shall not be liable 
                      for any indirect, incidental, special, consequential, or punitive damages, 
                      or any loss of profits or revenues, whether incurred directly or indirectly.
                    </p>
                    <p className="mb-2">
                      Our total liability for any claim shall not exceed the amount paid by you 
                      to us in the 12 months preceding the claim.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-6" />

              {/* Indemnification */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Indemnification</h2>
                <p className="mb-4">
                  You agree to indemnify, defend, and hold harmless Edbotz Inc., its officers, 
                  directors, employees, and agents from any claims, damages, losses, liabilities, 
                  and expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Your use or misuse of the Platform</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any rights of another party</li>
                  <li>Your violation of any applicable laws</li>
                  <li>Content you submit to the Platform</li>
                </ul>
              </section>

              <Separator className="my-6" />

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">13. Termination</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">13.1 Termination by You</h3>
                    <p className="mb-2">
                      You may terminate your account at any time by contacting support. 
                      Termination does not entitle you to refunds for services already provided.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">13.2 Termination by Us</h3>
                    <p className="mb-2">
                      We may suspend or terminate your account for:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Violation of these Terms</li>
                      <li>Non-payment of fees</li>
                      <li>Fraudulent or illegal activity</li>
                      <li>Harm to other users or the Platform</li>
                      <li>Extended inactivity</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">13.3 Effect of Termination</h3>
                    <p className="mb-2">
                      Upon termination, your access rights cease immediately. We may retain 
                      certain data as required by law or for legitimate business purposes.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-6" />

              {/* Dispute Resolution */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">14. Dispute Resolution</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">14.1 Informal Resolution</h3>
                    <p className="mb-2">
                      We encourage resolution of disputes through direct communication. Contact 
                      us at support@edbotz.com to attempt informal resolution first.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">14.2 Arbitration</h3>
                    <p className="mb-2">
                      If informal resolution fails, disputes shall be resolved through binding 
                      arbitration in accordance with the Arbitration Act of Alberta, except 
                      where prohibited by law.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">14.3 Class Action Waiver</h3>
                    <p className="mb-2 uppercase font-semibold">
                      You agree to resolve disputes individually and waive any right to 
                      participate in class actions or class arbitrations.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-6" />

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">15. Governing Law</h2>
                <p className="mb-4">
                  These Terms are governed by the laws of the Province of Alberta and the 
                  federal laws of Canada applicable therein, without regard to conflict of 
                  law principles. You consent to the exclusive jurisdiction of the courts 
                  located in Calgary, Alberta for any disputes.
                </p>
              </section>

              <Separator className="my-6" />

              {/* Modifications */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">16. Modifications to Terms</h2>
                <p className="mb-4">
                  We reserve the right to modify these Terms at any time. Material changes 
                  will be notified via email or Platform announcement at least 30 days before 
                  taking effect. Continued use after changes constitutes acceptance of modified 
                  Terms.
                </p>
              </section>

              <Separator className="my-6" />

              {/* General Provisions */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">17. General Provisions</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">17.1 Entire Agreement</h3>
                    <p className="text-sm">
                      These Terms, together with our Privacy Statement, constitute the entire 
                      agreement between you and Edbotz Inc.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">17.2 Severability</h3>
                    <p className="text-sm">
                      If any provision is found unenforceable, the remaining provisions shall 
                      continue in full force and effect.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">17.3 Waiver</h3>
                    <p className="text-sm">
                      Our failure to enforce any provision shall not constitute a waiver of 
                      that or any other provision.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">17.4 Assignment</h3>
                    <p className="text-sm">
                      You may not assign these Terms without our written consent. We may assign 
                      our rights and obligations without restriction.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">17.5 Force Majeure</h3>
                    <p className="text-sm">
                      We are not liable for delays or failures due to circumstances beyond our 
                      reasonable control.
                    </p>
                  </div>
                </div>
              </section>

            </div>
          </ScrollArea>
        </Card>

        <div className="mt-6 text-center space-x-4">
          <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">
            Privacy Statement
          </Link>
          <span className="text-gray-400">|</span>
          <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;