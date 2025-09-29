import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Users,
  Award,
  ArrowRight,
  Calendar,
  CheckCircle,
  Star,
  Calculator,
  Beaker,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import Header from '../Layout/Header';

const OpenCoursesComingSoon = () => {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleEnrollNow = () => {
    navigate('/get-started');
  };

  // Sample courses that will be available
  const upcomingCourses = [
    { name: 'Math 10C', icon: Calculator, color: 'bg-blue-100 text-blue-700', credits: 5 },
    { name: 'Math 20-1', icon: Calculator, color: 'bg-blue-100 text-blue-700', credits: 5 },
    { name: 'Math 30-1', icon: Calculator, color: 'bg-purple-100 text-purple-700', credits: 5 },
    { name: 'Math 31', icon: Calculator, color: 'bg-purple-100 text-purple-700', credits: 5 },
    { name: 'Physics 20', icon: Beaker, color: 'bg-green-100 text-green-700', credits: 5 },
    { name: 'Physics 30', icon: Beaker, color: 'bg-green-100 text-green-700', credits: 5 },
  ];

  const features = [
    {
      icon: BookOpen,
      title: 'Full Course Content',
      description: 'Access all lessons, videos, and materials'
    },
    {
      icon: Users,
      title: 'Practice Questions',
      description: 'Unlimited practice with instant feedback'
    },
    {
      icon: Clock,
      title: 'Learn at Your Pace',
      description: 'No deadlines, no pressure'
    },
    {
      icon: Award,
      title: 'Free Forever',
      description: 'No hidden fees or subscriptions'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/20">
      <Header
        user={currentUser}
        onLogout={handleLogout}
        onDashboardClick={() => navigate('/dashboard')}
        portalType="Open Courses"
        isEmulating={false}
        isStaffUser={false}
      />

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="bg-gradient-to-r from-green-100 to-teal-100 text-green-800 px-4 py-1 mb-4 text-sm">
            <Sparkles className="w-4 h-4 mr-1 inline" />
            Coming January 2025
          </Badge>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Open Courses
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Free access to our complete Alberta curriculum.
            Learn, practice, and master at your own pace - no registration fees, no commitments.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleEnrollNow}
              size="lg"
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-6 text-lg shadow-lg"
            >
              <GraduationCap className="mr-2 h-5 w-5" />
              Want Credits? Enroll Now
            </Button>
            <Button
              onClick={() => navigate('/')}
              size="lg"
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* What's Coming Section */}
        <Card className="mb-12 shadow-xl border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
            <CardTitle className="text-2xl flex items-center">
              <Calendar className="mr-2 h-6 w-6 text-green-600" />
              What's Coming in Open Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
              <p className="text-center text-gray-700">
                <strong>Perfect for:</strong> Test preparation, homeschooling, skill review,
                or exploring our curriculum before enrolling for credits
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Available Courses Preview */}
        <Card className="mb-12 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50">
            <CardTitle className="text-2xl">Courses Available at Launch</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingCourses.map((course, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <course.icon className="h-5 w-5 text-gray-700" />
                      <span className="font-semibold text-gray-900">{course.name}</span>
                    </div>
                    <Badge className={course.color}>{course.credits} Credits</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Full curriculum aligned with Alberta Education standards
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Why Open Courses */}
        <Card className="mb-12 shadow-xl border-2 border-teal-200">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
            <CardTitle className="text-2xl">Why We're Making Courses Open</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Education Should Be Accessible</strong>
                  <p className="text-gray-600">
                    We believe everyone should have access to quality education, regardless of their circumstances.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Try Before You Commit</strong>
                  <p className="text-gray-600">
                    Explore our teaching style and course quality before enrolling for credits.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Support Your Learning Journey</strong>
                  <p className="text-gray-600">
                    Whether you're preparing for exams, homeschooling, or refreshing skills, we're here to help.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 text-white text-center shadow-xl">
          <h2 className="text-3xl font-bold mb-4">
            Need Official Credits?
          </h2>
          <p className="text-xl mb-6 text-teal-50">
            While Open Courses are perfect for learning, only enrolled students receive:
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
              <Star className="w-4 h-4 mr-1" />
              Official Alberta Credits
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
              <Users className="w-4 h-4 mr-1" />
              Teacher Support
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
              <Award className="w-4 h-4 mr-1" />
              Diploma Eligibility
            </Badge>
          </div>
          <Button
            onClick={handleEnrollNow}
            size="lg"
            className="bg-white text-teal-700 hover:bg-gray-100 px-8 py-3"
          >
            Enroll for Credits <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OpenCoursesComingSoon;