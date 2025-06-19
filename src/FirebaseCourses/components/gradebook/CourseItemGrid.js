import React, { useState, useMemo } from 'react';
// No longer using gradebook context - data comes from course prop
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  RotateCcw,
  ChevronRight
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

const CourseItemGrid = ({ onViewItemDetails, onItemSelect, courseStructure, course, compact = false }) => {
  // Extract gradebook data from either courseStructure or course prop
  const gradebook = (courseStructure || course)?.Gradebook || {};
  const items = gradebook?.items || {};
  const categories = gradebook?.categories || {};
  const hasData = !!gradebook?.summary;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('sequence');
  const [sortOrder, setSortOrder] = useState('asc');

  // Process course items from gradebook data
  const courseItems = useMemo(() => {
    if (!hasData || !items) return [];
    
    const allItems = [];
    
    // Convert gradebook items to course items format
    Object.entries(items).forEach(([itemId, itemData]) => {
      // Try to find matching course structure item
      let structureItem = null;
      const courseData = courseStructure || course;
      if (courseData?.courseStructure?.units) {
        courseData.courseStructure.units.forEach(unit => {
          const found = unit.items?.find(item => item.itemId === itemId);
          if (found) {
            structureItem = { ...found, unitTitle: unit.name, unitSequence: unit.order };
          }
        });
      }
      
      // Find questions for this item from categories
      let questions = [];
      Object.values(categories).forEach(category => {
        const categoryItem = category.items?.find(item => item.id === itemId);
        if (categoryItem) {
          // Mock questions for display - in reality these would come from assessment data
          const questionCount = Math.ceil(itemData.maxScore / 5); // Assume 5 points per question
          for (let i = 1; i <= questionCount; i++) {
            questions.push([
              `${itemId}_question${i}`,
              {
                score: i <= Math.floor(itemData.score / 5) ? 5 : itemData.score % 5,
                maxScore: 5,
                attempts: itemData.attempts || 0,
                status: itemData.status,
                title: `Question ${i}`,
                assessmentData: null // Would be populated with real assessment data
              }
            ]);
          }
        }
      });
      
      allItems.push({
        ...structureItem,
        ...itemData,
        itemId: itemId,
        questions: questions,
        totalQuestions: questions.length,
        completedQuestions: questions.filter(([, data]) => data.score > 0).length,
        totalPoints: itemData.maxScore || 0,
        earnedPoints: itemData.score || 0,
        percentage: itemData.maxScore > 0 ? Math.round((itemData.score / itemData.maxScore) * 100) : 0
      });
    });
    
    return allItems;
  }, [items, categories, courseStructure, course, hasData]);

  // Filter and sort course items
  const filteredItems = useMemo(() => {
    let filtered = [...courseItems];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'sequence':
          comparison = (a.unitSequence || 0) - (b.unitSequence || 0) || 
                      (a.sequence || 0) - (b.sequence || 0);
          break;
        case 'score':
          comparison = (b.percentage || 0) - (a.percentage || 0);
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
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [courseItems, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  if (!hasData) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500">No course items available yet.</p>
      </div>
    );
  }

  // Compact mode for dashboard overview
  if (compact) {
    return (
      <div className="space-y-3">
        {filteredItems.slice(0, 5).map((item) => (
          <div key={item.itemId} className="bg-white border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
               onClick={() => (onViewItemDetails || onItemSelect)?.(item)}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.type} • {item.unitTitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-medium">{item.earnedPoints} / {item.totalPoints}</div>
                  <div className="text-sm text-gray-500">{item.percentage}%</div>
                </div>
                <div className="flex items-center">
                  {item.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : item.status === 'in_progress' ? (
                    <RotateCcw className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredItems.length > 5 && (
          <div className="text-center">
            <Button variant="ghost" className="text-sm text-gray-600">
              View all {filteredItems.length} items
            </Button>
          </div>
        )}
        {filteredItems.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No course items available.
          </div>
        )}
      </div>
    );
  }

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search course items..."
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
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredItems.length} of {courseItems.length} course items
      </div>

      {/* Course Items Table */}
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
                    Course Item
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
                  Questions
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <CourseItemRow 
                  key={item.itemId}
                  item={item}
                  onViewDetails={() => (onViewItemDetails || onItemSelect)?.(item)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No course items match your filters.
        </div>
      )}
    </div>
  );
};

// Course Item Row Component
const CourseItemRow = ({ item, onViewDetails }) => {
  const getScoreColor = (pct) => {
    if (pct >= 90) return 'text-green-700 bg-green-50';
    if (pct >= 80) return 'text-blue-700 bg-blue-50';
    if (pct >= 70) return 'text-yellow-700 bg-yellow-50';
    if (pct >= 60) return 'text-orange-700 bg-orange-50';
    return 'text-red-700 bg-red-50';
  };

  const getStatusIcon = () => {
    if (item.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (item.status === 'in_progress') {
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
          {item.title}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {item.unitTitle} • {item.contentPath}
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge className={`${getTypeColor(item.type)} text-xs`}>
          {item.type}
        </Badge>
      </td>
      <td className="px-6 py-4 text-center">
        {item.totalPoints > 0 ? (
          <div className="flex flex-col items-center">
            <div className={`text-sm font-medium px-2 py-1 rounded ${getScoreColor(item.percentage)}`}>
              {item.earnedPoints} / {item.totalPoints}
            </div>
            <div className="text-xs text-gray-500 mt-1">{item.percentage}%</div>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Not available</span>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        <div className="text-sm text-gray-600">
          {item.completedQuestions} / {item.totalQuestions}
        </div>
        <div className="text-xs text-gray-500">
          {item.totalQuestions > 0 ? `${Math.round((item.completedQuestions / item.totalQuestions) * 100)}%` : '0%'}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {getStatusIcon()}
          <span className="text-xs text-gray-600 capitalize">
            {item.status.replace('_', ' ')}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        {item.questions.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onViewDetails}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            View Details
            <ChevronRight className="h-3 w-3" />
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

export default CourseItemGrid;