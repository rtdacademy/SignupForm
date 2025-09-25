import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Users,
  TrendingUp,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Color palette for charts
const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

const PASIAnalyticsInline = ({
  records = [],
  viewName = "Current View",
  expanded = false
}) => {
  // Log for debugging
  console.log('📊 Inline Analytics - Records received:', records?.length || 0);
  console.log('📊 Sample record:', records?.[0]);

  // Calculate analytics from the filtered records
  const analytics = useMemo(() => {
    if (!records || records.length === 0) {
      return {
        totalRecords: 0,
        statusCounts: {},
        studentTypeCounts: {},
        courseCounts: {},
        termCounts: {},
        recentRegistrations: 0,
        activeStudents: 0,
        uniqueStudents: 0
      };
    }

    const statusCounts = {};
    const studentTypeCounts = {};
    const courseCounts = {};
    const termCounts = {};
    const uniqueStudents = new Set();
    let recentRegistrations = 0;
    let activeStudents = 0;

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    records.forEach(record => {
      // Count unique students by ASN
      if (record.asn) {
        uniqueStudents.add(record.asn);
      }

      // Status counts (both PASI and YourWay)
      const status = record.status || record.Status_Value || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      if (status === 'Active' || record.ActiveFutureArchived_Value === 'Active') {
        activeStudents++;
      }

      // Student type counts
      const studentType = record.StudentType_Value || record.studentType || 'Unknown';
      studentTypeCounts[studentType] = (studentTypeCounts[studentType] || 0) + 1;

      // Course counts
      if (record.courseCode) {
        courseCounts[record.courseCode] = (courseCounts[record.courseCode] || 0) + 1;
      }

      // Term counts
      const term = record.pasiTerm || record.Term || 'Unknown';
      if (term && term !== 'Unknown') {
        termCounts[term] = (termCounts[term] || 0) + 1;
      }

      // Recent registrations
      if (record.Created) {
        try {
          const createdDate = new Date(record.Created);
          if (createdDate > thirtyDaysAgo) {
            recentRegistrations++;
          }
        } catch (e) {
          // Invalid date
        }
      }
    });

    return {
      totalRecords: records.length,
      statusCounts,
      studentTypeCounts,
      courseCounts,
      termCounts,
      recentRegistrations,
      activeStudents,
      uniqueStudents: uniqueStudents.size
    };
  }, [records]);

  // Prepare data for charts
  const statusData = Object.entries(analytics.statusCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const studentTypeData = Object.entries(analytics.studentTypeCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5

  const topCourses = Object.entries(analytics.courseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Compact view (default)
  if (!expanded) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {/* Total Records */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Records</p>
                <p className="text-2xl font-bold text-blue-800">{analytics.totalRecords}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Unique Students */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Unique Students</p>
                <p className="text-2xl font-bold text-green-800">{analytics.uniqueStudents}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Active Students */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Active</p>
                <p className="text-2xl font-bold text-amber-800">{analytics.activeStudents}</p>
              </div>
              <Activity className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Recent (30d)</p>
                <p className="text-2xl font-bold text-purple-800">{analytics.recentRegistrations}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expanded view with charts
  return (
    <div className="space-y-4 p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Records</p>
                <p className="text-2xl font-bold text-blue-800">{analytics.totalRecords}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Unique Students</p>
                <p className="text-2xl font-bold text-green-800">{analytics.uniqueStudents}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Active</p>
                <p className="text-2xl font-bold text-amber-800">{analytics.activeStudents}</p>
              </div>
              <Activity className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Recent (30d)</p>
                <p className="text-2xl font-bold text-purple-800">{analytics.recentRegistrations}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Courses */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top 5 Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCourses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={10}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Student Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {studentTypeData.map((type, index) => (
              <Badge
                key={type.name}
                variant="outline"
                style={{
                  borderColor: COLORS[index % COLORS.length],
                  color: COLORS[index % COLORS.length]
                }}
              >
                {type.name}: {type.value}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PASIAnalyticsInline;