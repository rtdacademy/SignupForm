import React, { useState, useMemo } from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

const AssessmentGrid = ({ onReviewAssessment }) => {
  const { items, categories, hasData } = useGradebook();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter and sort assessments
  const filteredAssessments = useMemo(() => {
    let assessments = Object.entries(items || {}).map(([id, item]) => ({
      id,
      ...item
    }));

    // Apply search filter
    if (searchTerm) {
      assessments = assessments.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      assessments = assessments.filter(item => item.type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      assessments = assessments.filter(item => {
        if (filterStatus === 'completed') return item.status === 'completed';
        if (filterStatus === 'attempted') return item.attempts > 0 && item.status !== 'completed';
        if (filterStatus === 'not_started') return item.attempts === 0;
        return true;
      });
    }

    // Apply sorting
    assessments.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = (b.lastAttempt || 0) - (a.lastAttempt || 0);
          break;
        case 'score':
          comparison = (b.score || 0) - (a.score || 0);
          break;
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
          break;
        default:
          break;
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return assessments;
  }, [items, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  if (!hasData) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500">No assessments available yet.</p>
      </div>
    );
  }

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="lesson">Lessons</SelectItem>
            <SelectItem value="assignment">Assignments</SelectItem>
            <SelectItem value="exam">Exams</SelectItem>
            <SelectItem value="lab">Labs</SelectItem>
            <SelectItem value="project">Projects</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="attempted">Attempted</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredAssessments.length} of {Object.keys(items).length} assessments
      </div>

      {/* Assessment Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('title')}
                >
                  <div className="flex items-center gap-1">
                    Assessment
                    <SortIcon field="title" currentSort={sortBy} sortOrder={sortOrder} />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('type')}
                >
                  <div className="flex items-center gap-1">
                    Type
                    <SortIcon field="type" currentSort={sortBy} sortOrder={sortOrder} />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('score')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Score
                    <SortIcon field="score" currentSort={sortBy} sortOrder={sortOrder} />
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Last Activity
                    <SortIcon field="date" currentSort={sortBy} sortOrder={sortOrder} />
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssessments.map((assessment) => (
                <AssessmentRow 
                  key={assessment.id}
                  assessment={assessment}
                  onReview={() => onReviewAssessment(assessment)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAssessments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No assessments match your filters.
        </div>
      )}
    </div>
  );
};

// Assessment Row Component
const AssessmentRow = ({ assessment, onReview }) => {
  const percentage = assessment.maxScore > 0 
    ? Math.round((assessment.score / assessment.maxScore) * 100) 
    : 0;
    
  const getScoreColor = (pct) => {
    if (pct >= 90) return 'text-green-700 bg-green-50';
    if (pct >= 80) return 'text-blue-700 bg-blue-50';
    if (pct >= 70) return 'text-yellow-700 bg-yellow-50';
    if (pct >= 60) return 'text-orange-700 bg-orange-50';
    return 'text-red-700 bg-red-50';
  };

  const getStatusIcon = () => {
    if (assessment.status === 'completed' && assessment.score === assessment.maxScore) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (assessment.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-blue-500" />;
    } else if (assessment.attempts > 0) {
      return <RotateCcw className="h-5 w-5 text-yellow-500" />;
    }
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      lesson: 'bg-blue-100 text-blue-800',
      assignment: 'bg-emerald-100 text-emerald-800',
      exam: 'bg-purple-100 text-purple-800',
      lab: 'bg-orange-100 text-orange-800',
      project: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {assessment.title || assessment.id}
        </div>
        {assessment.unitId && assessment.unitId !== 'unknown' && (
          <div className="text-xs text-gray-500 mt-1">
            Unit: {assessment.unitId}
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <Badge className={`${getTypeColor(assessment.type)} text-xs`}>
          {assessment.type}
        </Badge>
      </td>
      <td className="px-6 py-4 text-center">
        {assessment.attempts > 0 ? (
          <div className="flex flex-col items-center">
            <div className={`text-sm font-medium px-2 py-1 rounded ${getScoreColor(percentage)}`}>
              {assessment.score} / {assessment.maxScore}
            </div>
            <div className="text-xs text-gray-500 mt-1">{percentage}%</div>
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-sm text-gray-600">{assessment.attempts || 0}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {getStatusIcon()}
          <span className="text-xs text-gray-600">
            {assessment.status === 'completed' ? 'Completed' : 
             assessment.attempts > 0 ? 'In Progress' : 'Not Started'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        {assessment.lastAttempt ? (
          <div className="text-sm text-gray-600">
            {new Date(assessment.lastAttempt).toLocaleDateString()}
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        {assessment.attempts > 0 && assessment.assessmentData && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onReview}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            Review
          </Button>
        )}
      </td>
    </tr>
  );
};

// Sort Icon Component
const SortIcon = ({ field, currentSort, sortOrder }) => {
  if (currentSort !== field) {
    return <ChevronDown className="h-3 w-3 text-gray-400" />;
  }
  return sortOrder === 'asc' 
    ? <ChevronUp className="h-3 w-3 text-gray-700" />
    : <ChevronDown className="h-3 w-3 text-gray-700" />;
};

export default AssessmentGrid;