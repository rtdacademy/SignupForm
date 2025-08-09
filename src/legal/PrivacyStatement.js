import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';

const PrivacyStatement = () => {
  const effectiveDate = "August 8, 2025";
  const lastUpdated = "August 8, 2025";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Privacy Statement</h1>
            <p className="text-gray-600">
              YourWay Platform by Edbotz Inc.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Effective Date: {effectiveDate} | Last Updated: {lastUpdated}
            </p>
          </div>

          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="mb-4">
                  Edbotz Inc. ("we," "our," or "us") operates the YourWay educational platform, 
                  which includes our main education services at yourway.rtdacademy.com and our 
                  home education support services at rtd-connect.com (collectively, the "Platform").
                </p>
                <p className="mb-4">
                  This Privacy Statement explains how we collect, use, disclose, and safeguard 
                  your information when you use our Platform. We are committed to protecting your 
                  privacy and complying with applicable privacy laws, including the Personal 
                  Information Protection Act (PIPA) of Alberta and the Personal Information 
                  Protection and Electronic Documents Act (PIPEDA) of Canada.
                </p>
              </section>

              <Separator className="my-6" />

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">2.1 All Users</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Account credentials (email, password)</li>
                      <li>Authentication data via Firebase</li>
                      <li>Session and usage analytics</li>
                      <li>Communication preferences</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">2.2 Education Service Students (Main Site)</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Personal information (name, date of birth, gender)</li>
                      <li>Contact information (email, phone, address)</li>
                      <li>Alberta Student Number (ASN)</li>
                      <li>Academic records (grades, course progress, assessments)</li>
                      <li>Schedule and attendance data</li>
                      <li>Guardian information (for students under 18)</li>
                      <li>Citizenship and residency documentation</li>
                      <li>Payment information (processed through Stripe)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">2.3 Home Education Families (RTD-Connect)</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Family structure and relationships</li>
                      <li>Guardian information (name, email, phone, address)</li>
                      <li>Student information (name, age, grade, ASN)</li>
                      <li>Education plans and goals</li>
                      <li>Reimbursement request documentation</li>
                      <li>Receipt and expense records</li>
                      <li>Stripe Connect account status (no banking details stored)</li>
                      <li>Facilitator selection and interaction history</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator className="my-6" />

              {/* How We Use Your Information */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">3.1 Service Delivery</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Provide educational content and track progress</li>
                      <li>Process tuition payments and educational reimbursements</li>
                      <li>Communicate about courses, schedules, and important updates</li>
                      <li>Generate transcripts and educational records</li>
                      <li>Facilitate home education support and guidance</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">3.2 Legal and Compliance</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Comply with Alberta Education requirements</li>
                      <li>Report to government authorities as required by law</li>
                      <li>Maintain records for accreditation purposes</li>
                      <li>Verify eligibility for programs and funding</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">3.3 Platform Improvement</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Analyze usage patterns to improve services</li>
                      <li>Develop new features and educational content</li>
                      <li>Ensure platform security and prevent fraud</li>
                      <li>Provide customer support</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator className="my-6" />

              {/* Third-Party Services */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
                <p className="mb-4">We use trusted third-party services to operate our Platform:</p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">4.1 Payment Processing</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>Stripe (Tuition Payments):</strong> For students paying tuition, 
                        we use Stripe to process payments. Your payment card details are sent 
                        directly to Stripe and are not stored on our servers.
                      </li>
                      <li>
                        <strong>Stripe Connect (Reimbursements):</strong> For home education 
                        families receiving reimbursements, we use Stripe Connect to facilitate 
                        payouts. Your banking information is provided directly to Stripe through 
                        their secure interface and is never stored on our servers. We only receive 
                        account connection status and transaction references.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">4.2 Communication Services</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>SendGrid:</strong> We use SendGrid to send important educational 
                        communications, updates, and notifications via email. Your email address 
                        is shared with SendGrid solely for message delivery purposes.
                      </li>
                      <li>
                        <strong>Microsoft Teams SMS:</strong> For parents and guardians who opt-in, 
                        we use Microsoft Teams to send personalized SMS messages about student 
                        progress, scheduling, and course-related matters. This is one-to-one 
                        communication only, not marketing or mass messaging. Phone numbers are 
                        only used with explicit consent.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">4.3 Infrastructure Services</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Firebase (Google):</strong> Authentication, database, and hosting</li>
                      <li><strong>Google AI:</strong> Educational assistance and content generation</li>
                      <li><strong>Google Maps:</strong> Address verification and location services</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator className="my-6" />

              {/* Data Sharing and Disclosure */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
                <p className="mb-4">We may share your information in the following circumstances:</p>
                
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Educational Authorities:</strong> Student records with Alberta Education 
                    as required for accreditation and compliance
                  </li>
                  <li>
                    <strong>Parents/Guardians:</strong> Student progress and records with authorized 
                    guardians
                  </li>
                  <li>
                    <strong>Service Providers:</strong> With third-party services necessary for 
                    Platform operation (under strict confidentiality agreements)
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law, court order, or to 
                    protect rights and safety
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with any merger, sale of 
                    company assets, or acquisition
                  </li>
                  <li>
                    <strong>Consent:</strong> With your explicit consent for specific purposes
                  </li>
                </ul>
              </section>

              <Separator className="my-6" />

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
                <p className="mb-4">
                  We implement appropriate technical and organizational measures to protect your 
                  personal information, including:
                </p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication through Firebase</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access controls based on role and necessity</li>
                  <li>Secure third-party payment processing (no direct storage of financial data)</li>
                  <li>Regular backups and disaster recovery procedures</li>
                </ul>
              </section>

              <Separator className="my-6" />

              {/* Data Retention */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
                <p className="mb-4">We retain personal information for as long as necessary to:</p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide our services and maintain your account</li>
                  <li>Comply with legal obligations (educational records: 7 years minimum)</li>
                  <li>Resolve disputes and enforce agreements</li>
                  <li>Support legitimate business purposes</li>
                </ul>
                
                <p className="mt-4">
                  Academic records and transcripts are retained in accordance with Alberta 
                  Education requirements. Financial records are retained as required by Canadian 
                  tax law.
                </p>
              </section>

              <Separator className="my-6" />

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Your Rights</h2>
                <p className="mb-4">Under applicable privacy laws, you have the right to:</p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your information (subject to legal requirements)</li>
                  <li>Object to or restrict certain processing</li>
                  <li>Data portability (receive your data in a structured format)</li>
                  <li>Withdraw consent for optional data processing</li>
                  <li>File a complaint with privacy authorities</li>
                </ul>
                
                <p className="mt-4">
                  To exercise these rights, please contact us at privacy@edbotz.com. We will 
                  respond to your request within 30 days.
                </p>
              </section>

              <Separator className="my-6" />

              {/* Alberta FOIP Compliance */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Compliance with Alberta FOIP and Access to Information Legislation</h2>
                
                <div className="space-y-4">
                  <p className="mb-4">
                    We handle personal information in accordance with the Freedom of Information and 
                    Protection of Privacy Act (FOIP) of Alberta, the Education Act, and other 
                    applicable Canadian privacy laws.
                  </p>
                  
                  <div>
                    <p className="mb-3">We ensure that personal information is:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>Collected only for purposes directly related to the delivery of our educational services,</strong>
                      </li>
                      <li>
                        <strong>Used only for those purposes or as otherwise authorized by law, and</strong>
                      </li>
                      <li>
                        <strong>Protected through appropriate administrative, technical, and physical safeguards.</strong>
                      </li>
                    </ul>
                  </div>
                  
                  <p className="mb-4">
                    Where required by Alberta Education or other regulatory bodies, we may conduct 
                    Privacy Impact Assessments (PIAs) to evaluate privacy risks and implement safeguards.
                  </p>
                  
                  <p className="mb-4">
                    Students and guardians have the right to request access to their personal information, 
                    request corrections, and be informed about how their data is used and disclosed in 
                    accordance with FOIP.
                  </p>
                </div>
              </section>

              <Separator className="my-6" />

              {/* Communications and Consent */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Communications and Consent</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">10.1 Email Communications</h3>
                    <p className="mb-2">
                      We send the following types of emails through SendGrid:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Essential service communications (required)</li>
                      <li>Course updates and academic notifications</li>
                      <li>Important announcements and deadlines</li>
                      <li>Password resets and security alerts</li>
                    </ul>
                    <p className="mt-2 text-sm">
                      You cannot opt out of essential service emails. You may manage other 
                      email preferences in your account settings.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">10.2 SMS Communications (Opt-In Only)</h3>
                    <p className="mb-2">
                      With explicit consent, we may send SMS messages for:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>One-to-one teacher/staff communication about student progress</li>
                      <li>Personalized scheduling reminders</li>
                      <li>Urgent course-related matters</li>
                      <li>Individual academic support</li>
                    </ul>
                    <p className="mt-2 text-sm">
                      SMS is never used for marketing or mass messaging. You may opt out at 
                      any time by replying STOP or updating your preferences.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">10.3 Communication Preferences</h3>
                    <p className="text-sm">
                      You can manage your communication preferences at any time through your 
                      account settings or by contacting support@rtdacademy.com. Opting out of 
                      non-essential communications does not affect your access to our services.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-6" />

              {/* Cookies and Tracking */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Cookies and Tracking Technologies</h2>
                <p className="mb-4">We use cookies and similar technologies to:</p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li>Maintain your session and authentication state</li>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze Platform usage and performance</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
                
                <p className="mt-4">
                  You can control cookies through your browser settings. However, disabling 
                  cookies may limit Platform functionality.
                </p>
              </section>

              <Separator className="my-6" />

              {/* Updates to Privacy Statement */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Updates to This Privacy Statement</h2>
                <p className="mb-4">
                  We may update this Privacy Statement periodically. We will notify you of 
                  material changes via email or Platform notification. Your continued use of 
                  the Platform after changes indicates acceptance of the updated statement.
                </p>
              </section>

              <Separator className="my-6" />

              {/* Acknowledgment */}
              <section className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Acknowledgment</h2>
                <p className="text-sm">
                  By using our Platform, you acknowledge that you have read and understood 
                  this Privacy Statement and agree to the collection, use, and disclosure 
                  of your information as described herein.
                </p>
              </section>
            </div>
          </ScrollArea>
        </Card>

        <div className="mt-6 text-center space-x-4">
          <Link to="/terms" className="text-blue-600 hover:text-blue-800 underline">
            Terms & Conditions
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

export default PrivacyStatement;