import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Phone, Mail, Users, ArrowLeft, School, Clock, FileText } from 'lucide-react';

const ContactPage = () => {
  const handleBackClick = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          onClick={handleBackClick}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact RTD Math Academy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get in touch with our team for enrollment, support, or general inquiries
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* General Information Card */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-br from-teal-50 to-cyan-50">
              <CardTitle className="flex items-center gap-3">
                <School className="h-6 w-6 text-teal-600" />
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-teal-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p className="text-gray-700">403-351-0896 ext 2</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-teal-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <a
                      href="mailto:info@rtdacademy.com"
                      className="text-teal-700 hover:text-teal-800 underline"
                    >
                      info@rtdacademy.com
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Contacts Card */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-3">
                <Users className="h-6 w-6 text-purple-600" />
                Key Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Charlie Hiles</p>
                    <p className="text-gray-700">Principal</p>
                    <a
                      href="mailto:charlie@rtdacademy.com"
                      className="text-purple-700 hover:text-purple-800 underline text-sm"
                    >
                      charlie@rtdacademy.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Stan Scott</p>
                    <p className="text-gray-700">Registrar</p>
                    <a
                      href="mailto:stan@rtdacademy.com"
                      className="text-purple-700 hover:text-purple-800 underline text-sm"
                    >
                      stan@rtdacademy.com
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* School Information Section */}
        <Card className="max-w-4xl mx-auto shadow-lg mb-12">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-teal-50">
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              School Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Official Codes</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Alberta School Code:</strong> 2444</p>
                  <p><strong>Authority Code:</strong> 0402</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Accreditation</h3>
                <div className="space-y-2 text-gray-700">
                  <p>Alberta Education Fully Accredited</p>
                  <p>AISCA Member - Independent Schools</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Hours Section */}
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader className="bg-gradient-to-br from-orange-50 to-yellow-50">
            <CardTitle className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-orange-600" />
              Support & Office Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Teacher Support</h3>
                <p className="text-gray-700">
                  Our teachers are available through online chat and video conferencing.
                  Students can message teachers anytime and typically receive responses within 24 hours.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Office Hours</h3>
                <p className="text-gray-700">
                  Monday - Friday: 9:00 AM - 4:00 PM MST<br />
                  Closed on statutory holidays and school breaks
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Emergency Contact</h3>
                <p className="text-gray-700">
                  For urgent matters outside office hours, please email{' '}
                  <a
                    href="mailto:info@rtdacademy.com"
                    className="text-teal-700 hover:text-teal-800 underline"
                  >
                    info@rtdacademy.com
                  </a>
                  {' '}with "URGENT" in the subject line.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-600 mb-6">
            Ready to start your learning journey?
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => window.location.href = '/get-started'}
              className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-3"
            >
              Get Started
            </Button>
            <Button
              onClick={() => window.location.href = '/student-faq'}
              variant="outline"
              className="border-2 border-teal-600 text-teal-700 hover:bg-teal-50 px-8 py-3"
            >
              View FAQs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;