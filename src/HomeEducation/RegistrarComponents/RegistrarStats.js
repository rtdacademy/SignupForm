import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart3, TrendingUp, Users, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const RegistrarStats = ({ isOpen, onClose, families, schoolYear }) => {
  const dbSchoolYear = schoolYear.replace('/', '_');

  const stats = useMemo(() => {
    let totalStudents = 0;
    let studentsWithAsn = 0;
    let completedRegistrations = 0;
    let pendingDocs = 0;
    let readyForPasi = 0;
    const gradeDistribution = {};
    const facilitatorDistribution = {};

    Object.values(families).forEach(family => {
      if (family.students) {
        Object.values(family.students).forEach(student => {
          totalStudents++;
          
          if (student.asn) studentsWithAsn++;
          
          // Check registration status
          const pasiReg = family.PASI_REGISTRATIONS?.[dbSchoolYear]?.[student.id];
          if (pasiReg?.status === 'completed') completedRegistrations++;
          
          // Grade distribution
          const grade = student.grade || 'Unknown';
          gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
          
          // Facilitator distribution
          const facilitator = family.facilitatorEmail || 'Unassigned';
          facilitatorDistribution[facilitator] = (facilitatorDistribution[facilitator] || 0) + 1;
        });
      }
    });

    return {
      totalStudents,
      studentsWithAsn,
      completedRegistrations,
      pendingDocs,
      readyForPasi,
      gradeDistribution,
      facilitatorDistribution,
      completionRate: totalStudents > 0 ? Math.round((completedRegistrations / totalStudents) * 100) : 0,
      asnRate: totalStudents > 0 ? Math.round((studentsWithAsn / totalStudents) * 100) : 0
    };
  }, [families, dbSchoolYear]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Registration Analytics for {schoolYear}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{stats.completedRegistrations}</p>
                <p className="text-xs text-gray-500">{stats.completionRate}% complete</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Have ASN</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">{stats.studentsWithAsn}</p>
                <p className="text-xs text-gray-500">{stats.asnRate}% have ASN</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalStudents - stats.completedRegistrations}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Grade Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.gradeDistribution)
                  .sort((a, b) => {
                    if (a[0] === 'K' || a[0] === 'k') return -1;
                    if (b[0] === 'K' || b[0] === 'k') return 1;
                    return parseInt(a[0]) - parseInt(b[0]);
                  })
                  .map(([grade, count]) => (
                    <div key={grade} className="flex items-center justify-between">
                      <span className="text-sm">Grade {grade}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(count / stats.totalStudents) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Facilitator Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Facilitator Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.facilitatorDistribution)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([facilitator, count]) => (
                    <div key={facilitator} className="flex items-center justify-between">
                      <span className="text-sm truncate max-w-xs">
                        {facilitator === 'Unassigned' ? 
                          <span className="text-orange-600">Unassigned</span> : 
                          facilitator.split('@')[0]}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{count} students</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrarStats;