import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, onValue, off, set, update, push, serverTimestamp } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { 
  Calendar, CheckCircle2, AlertCircle, Download, Save, MessageSquare, 
  ChevronDown, ChevronRight, Plus, X, Loader2, Users, BookOpen,
  ClipboardCheck, FileText, User, CalendarDays, UserPlus,
  AlertTriangle, CheckCircle, Clock, Eye, EyeOff, Expand, Minimize2, UserCheck,
  CheckSquare, FileWarning
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getFacilitatorByEmail } from '../config/facilitators';
import { toast } from 'sonner';

// Styled card component matching SOLO theme
const StyledCard = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-white border border-gray-200',
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200',
    green: 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200',
    yellow: 'bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200',
    purple: 'bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200',
  };

  return (
    <div className={`rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-md ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Enhanced form field component
const FormField = ({ label, error, children, required = false, description = null, icon: Icon = null }) => (
  <div className="space-y-2">
    <label className="flex items-center space-x-2 text-sm font-medium text-gray-900">
      {Icon && <Icon className="w-4 h-4 text-gray-600" />}
      <span>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
    </label>
    {description && (
      <p className="text-sm text-gray-600">{description}</p>
    )}
    {children}
    {error && (
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

// Tab navigation component
const TabNavigation = ({ activeTab, onTabChange, hasSpringData, hasFallData }) => {
  return (
    <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg mb-6">
      <button
        onClick={() => onTabChange('fall')}
        className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
          activeTab === 'fall'
            ? 'bg-white text-purple-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <CalendarDays className="w-4 h-4" />
        <span>Fall Visit</span>
        {hasFallData && (
          <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        )}
      </button>
      <button
        onClick={() => onTabChange('spring')}
        className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
          activeTab === 'spring'
            ? 'bg-white text-purple-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <CalendarDays className="w-4 h-4" />
        <span>Spring Visit</span>
        {hasSpringData && (
          <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        )}
      </button>
    </div>
  );
};

// Expandable subject card component
const ExpandableSubjectCard = ({ 
  subject, 
  fallValue, 
  springValue, 
  onFallChange, 
  onSpringChange, 
  readOnly, 
  activeTab,
  comments,
  onAddComment,
  onDeleteComment,
  onTogglePdfComment,
  currentUserId,
  isStaff,
  canComment 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBothSeasons, setShowBothSeasons] = useState(false);
  
  // Local state for text fields to prevent lag
  const [localFallValue, setLocalFallValue] = useState(fallValue || '');
  const [localSpringValue, setLocalSpringValue] = useState(springValue || '');
  
  // Sync local state with props when they change (e.g., from Firebase)
  useEffect(() => {
    setLocalFallValue(fallValue || '');
  }, [fallValue]);
  
  useEffect(() => {
    setLocalSpringValue(springValue || '');
  }, [springValue]);
  
  // Save handlers for onBlur
  const handleFallBlur = () => {
    if (localFallValue !== fallValue) {
      onFallChange(localFallValue);
    }
  };
  
  const handleSpringBlur = () => {
    if (localSpringValue !== springValue) {
      onSpringChange(localSpringValue);
    }
  };
  
  const hasContent = fallValue?.trim() || springValue?.trim();
  const otherSeasonHasContent = activeTab === 'fall' ? springValue?.trim() : fallValue?.trim();

  return (
    <div className="border border-purple-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md bg-white">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-white hover:bg-purple-50 transition-colors duration-200 flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
            <ChevronRight className={`w-4 h-4 ${hasContent ? 'text-purple-600' : 'text-gray-600'}`} />
          </div>
          <span className="font-medium text-gray-900 text-sm">{subject.label}</span>
          {hasContent && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Has content
            </span>
          )}
        </div>
        {!isExpanded && hasContent && (
          <span className="text-xs text-gray-500 max-w-xs truncate">
            {activeTab === 'fall' ? fallValue : springValue}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-purple-100 bg-gradient-to-b from-purple-50/50 to-white">
          <div className="pt-4">
            {/* Current season input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {activeTab === 'fall' ? 'Fall Notes' : 'Spring Notes'}
                </label>
                <textarea
                  value={activeTab === 'fall' ? localFallValue : localSpringValue}
                  onChange={(e) => activeTab === 'fall' ? setLocalFallValue(e.target.value) : setLocalSpringValue(e.target.value)}
                  onBlur={activeTab === 'fall' ? handleFallBlur : handleSpringBlur}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                    readOnly ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                  readOnly={readOnly}
                  disabled={readOnly}
                  rows={4}
                  placeholder={`Enter ${activeTab} notes for ${subject.label.toLowerCase()}...`}
                />
              </div>

              {/* Show other season button if it has content */}
              {otherSeasonHasContent && !showBothSeasons && (
                <button
                  type="button"
                  onClick={() => setShowBothSeasons(true)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>View {activeTab === 'fall' ? 'Spring' : 'Fall'} Notes</span>
                </button>
              )}

              {/* Other season content (expandable) */}
              {showBothSeasons && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {activeTab === 'fall' ? 'Spring Notes' : 'Fall Notes'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowBothSeasons(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={activeTab === 'fall' ? localSpringValue : localFallValue}
                    onChange={(e) => activeTab === 'fall' ? setLocalSpringValue(e.target.value) : setLocalFallValue(e.target.value)}
                    onBlur={activeTab === 'fall' ? handleSpringBlur : handleFallBlur}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                      readOnly ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                    readOnly={readOnly}
                    disabled={readOnly}
                    rows={4}
                    placeholder={`Enter ${activeTab === 'fall' ? 'spring' : 'fall'} notes for ${subject.label.toLowerCase()}...`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Comments section */}
          <div className="pt-4 border-t border-gray-200">
            <h5 className="text-xs font-semibold text-gray-700 mb-2">Comments & Discussion</h5>
            <CommentList 
              items={comments} 
              onDelete={onDeleteComment}
              onTogglePdf={onTogglePdfComment}
              currentUserId={currentUserId}
              isStaff={isStaff}
            />
            <CommentComposer onAdd={onAddComment} readOnly={!canComment} />
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced comment list component
const CommentList = ({ items, onDelete, onTogglePdf, currentUserId, isStaff }) => {
  // Ensure items is an array
  const itemsArray = Array.isArray(items) ? items : [];
  
  return (
    <div className="space-y-2">
      {itemsArray.map((c) => {
        // Check if user can delete this comment
        const canDelete = isStaff || (currentUserId && c.authorId === currentUserId);
        
        return (
          <div key={c.id} className="rounded-lg p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <User className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-medium text-gray-700">
                  {c.authorName || 'User'}
                </span>
                {c.role && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.role === 'staff' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {c.role}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                </span>
                {isStaff && onTogglePdf && (
                  <button
                    type="button"
                    onClick={() => onTogglePdf(c.id, c.includeInPdf)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-all duration-200 ${
                      c.includeInPdf 
                        ? 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200' 
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}
                    title={c.includeInPdf ? "Remove from PDF" : "Include in PDF"}
                  >
                    <div className="flex items-center space-x-1">
                      <FileText className="w-3 h-3" />
                      <span>PDF</span>
                    </div>
                  </button>
                )}
                {!isStaff && c.includeInPdf && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-300">
                    PDF
                  </span>
                )}
                {canDelete && onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(c.id)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    title={isStaff ? "Delete comment" : "Delete your comment"}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.text}</p>
          </div>
        );
      })}
      {itemsArray.length === 0 && (
        <div className="text-center py-4 text-xs text-gray-500">No comments yet</div>
      )}
    </div>
  );
};

// Enhanced comment composer
const CommentComposer = ({ onAdd, readOnly }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [includeInPdf, setIncludeInPdf] = useState(false);
  
  if (readOnly) return null;
  
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 w-full px-3 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 rounded-lg text-sm font-medium inline-flex items-center justify-center space-x-2 transition-all duration-200"
      >
        <Plus className="w-4 h-4" />
        <span>Add Comment</span>
      </button>
    );
  }

  return (
    <div className="mt-3 p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share your thoughts..."
        rows={3}
        className="w-full px-3 py-2 border border-purple-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        autoFocus
      />
      <label className="flex items-center space-x-2 text-sm">
        <input 
          type="checkbox" 
          checked={includeInPdf} 
          onChange={(e) => setIncludeInPdf(e.target.checked)}
          className="rounded border-purple-300 text-purple-600 focus:ring-purple-500" 
        />
        <span className="text-gray-700">Include in PDF report</span>
      </label>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => {
            if (text.trim()) {
              onAdd(text.trim(), includeInPdf);
              setText('');
              setIncludeInPdf(false);
              setOpen(false);
            }
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium transition-colors duration-200"
        >
          Post Comment
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setText('');
            setIncludeInPdf(false);
          }}
          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Date and time utilities
const toYYYYMMDD = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const fromYYYYMMDD = (str) => {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const dt = new Date(year, month, day);
  return isNaN(dt.getTime()) ? null : dt;
};

// Enhanced date input component
const DateInput = ({ value, onChange, readOnly, placeholder = "Select date" }) => {
  const selected = fromYYYYMMDD(value);
  return (
    <div className="relative">
      <DatePicker
        selected={selected}
        onChange={(d) => onChange(d ? toYYYYMMDD(d) : '')}
        dateFormat="yyyy-MM-dd"
        placeholderText={placeholder}
        className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
          readOnly ? 'bg-gray-50 cursor-not-allowed border-gray-200' : 'border-gray-300'
        }`}
        disabled={readOnly}
        isClearable={!readOnly}
      />
      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

// Attendee Selector Component
const AttendeeSelector = ({ attendees = [], onUpdateAttendees, guardians = [], readOnly }) => {
  const [showSelector, setShowSelector] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('');

  const handleAddGuardian = (guardian) => {
    const newAttendee = {
      type: 'guardian',
      name: guardian.name,
      email: guardian.email,
      relationToStudents: guardian.relationToStudents
    };
    onUpdateAttendees([...attendees, newAttendee]);
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    const newAttendee = {
      type: 'custom',
      name: customName.trim(),
      role: customRole.trim() || 'Attendee'
    };
    onUpdateAttendees([...attendees, newAttendee]);
    setCustomName('');
    setCustomRole('');
    setShowSelector(false);
  };

  const handleRemoveAttendee = (index) => {
    // Don't allow removing facilitator, student, or primary guardian (first three if primary guardian exists)
    const attendee = attendees[index];
    if (index < 2 || attendee?.isPrimary) return;
    const updated = attendees.filter((_, i) => i !== index);
    onUpdateAttendees(updated);
  };

  // Filter out already added guardians
  const availableGuardians = guardians.filter(
    g => !attendees.some(a => a.email === g.email)
  );

  return (
    <div className="space-y-3">
      {/* List of current attendees */}
      <div className="space-y-2">
        {attendees.map((attendee, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              {attendee.type === 'facilitator' && <User className="w-4 h-4 text-purple-500" />}
              {attendee.type === 'student' && <UserCheck className="w-4 h-4 text-blue-500" />}
              {attendee.type === 'guardian' && <Users className="w-4 h-4 text-green-500" />}
              {attendee.type === 'custom' && <User className="w-4 h-4 text-gray-500" />}
              <span className="text-sm font-medium text-gray-900">{attendee.name}</span>
              {attendee.isPrimary && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Primary</span>
              )}
              {attendee.relationToStudents && !attendee.isPrimary && (
                <span className="text-xs text-gray-500">({attendee.relationToStudents})</span>
              )}
              {attendee.role && attendee.type === 'custom' && (
                <span className="text-xs text-gray-500">({attendee.role})</span>
              )}
            </div>
            {index >= 2 && !attendee?.isPrimary && !readOnly && (
              <button
                type="button"
                onClick={() => handleRemoveAttendee(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add attendee button/selector */}
      {!readOnly && (
        <>
          {!showSelector ? (
            <button
              type="button"
              onClick={() => setShowSelector(true)}
              className="w-full px-3 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 rounded-lg text-sm font-medium inline-flex items-center justify-center space-x-2 transition-all duration-200"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Attendee</span>
            </button>
          ) : (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
              {/* Guardian selector */}
              {availableGuardians.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Family Guardian</label>
                  <div className="space-y-2">
                    {availableGuardians.map((guardian) => (
                      <button
                        key={guardian.id}
                        type="button"
                        onClick={() => {
                          handleAddGuardian(guardian);
                          setShowSelector(false);
                        }}
                        className="w-full text-left p-2 bg-white hover:bg-gray-50 rounded-md border border-gray-200 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{guardian.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({guardian.relationToStudents})</span>
                          </div>
                          <Plus className="w-4 h-4 text-purple-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              {availableGuardians.length > 0 && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-purple-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-purple-50 text-purple-600">OR</span>
                  </div>
                </div>
              )}

              {/* Custom attendee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Custom Attendee</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="Role (e.g., Observer, Specialist)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleAddCustom}
                      disabled={!customName.trim()}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSelector(false);
                        setCustomName('');
                        setCustomRole('');
                      }}
                      className="flex-1 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Student Info Header Component
const StudentInfoHeader = ({ student, facilitator, primaryGuardian }) => {
  // Format ASN as 1234-5678-9
  const formatASN = (asn) => {
    if (!asn || asn === '') return 'No ASN added yet';
    // Remove any existing formatting
    const cleanASN = asn.replace(/\D/g, '');
    if (cleanASN.length !== 9) return asn; // Return as-is if not 9 digits
    return `${cleanASN.slice(0, 4)}-${cleanASN.slice(4, 8)}-${cleanASN.slice(8)}`;
  };

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Student Information</h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-900">
              <span className="font-medium">Name:</span> {student?.preferredName || `${student?.firstName} ${student?.lastName}`}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Grade:</span> {student?.grade || 'N/A'}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">ASN:</span> {formatASN(student?.asn)}
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Primary Guardian</h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-900">
              <span className="font-medium">Name:</span> {primaryGuardian?.name || 'N/A'}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Email:</span> {primaryGuardian?.email || 'N/A'}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Phone:</span> {primaryGuardian?.phone || 'N/A'}
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Facilitator Information</h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-900">
              <span className="font-medium">Name:</span> {facilitator?.name || 'N/A'}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Email:</span> {facilitator?.contact?.email || facilitator?.email || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// PDF Generation Modal Component
const PDFGenerationModal = ({ isOpen, onClose, onConfirm, fallComplete, springComplete }) => {
  if (!isOpen) return null;
  
  const bothComplete = fallComplete && springComplete;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          {bothComplete ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <FileWarning className="w-6 h-6 text-yellow-500" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {bothComplete ? 'Generate PDF Report' : 'Incomplete Meeting Data'}
          </h3>
        </div>
        
        <div className="mb-6">
          {bothComplete ? (
            <p className="text-sm text-gray-600">
              Both Fall and Spring visits appear to be complete. Would you like to generate the PDF report now?
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">
                The following visits appear to be incomplete:
              </p>
              <div className="space-y-2 mb-3">
                {!fallComplete && (
                  <div className="flex items-center space-x-2 text-sm">
                    <X className="w-4 h-4 text-red-500" />
                    <span className="text-gray-700">Fall Visit</span>
                  </div>
                )}
                {!springComplete && (
                  <div className="flex items-center space-x-2 text-sm">
                    <X className="w-4 h-4 text-red-500" />
                    <span className="text-gray-700">Spring Visit</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">
                It's recommended to complete both visits before generating the PDF report. However, you can still generate a partial report if needed.
              </p>
            </>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
              bothComplete 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }`}
          >
            {bothComplete ? 'Generate PDF' : 'Generate Anyway'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate progress
const calculateProgress = (data, activeTab) => {
  let total = 0;
  let completed = 0;
  
  const currentMeeting = activeTab === 'fall' ? data?.meeting1 : data?.meeting2;
  
  // Check meeting details (only count date, not attendees since they're pre-populated)
  if (currentMeeting?.date) completed++;
  total++;
  
  // Check evaluation items
  const evalItems = ['planCompletedReviewedAccepted', 'discussedTesting', 'discussedActivitiesProgress', 
                    'advisedParent', 'discussedResourcesAvailable', 'discussedClaimsAndTransfer'];
  evalItems.forEach(item => {
    total++;
    if (data?.evaluation?.[item]) completed++;
  });
  
  // Check subjects
  const subjects = ['la', 'math', 'science', 'social', 'physed', 'arts', 'lifeSkills', 'other'];
  subjects.forEach(subject => {
    total++;
    const value = activeTab === 'fall' ? data?.subjects?.[subject]?.fall : data?.subjects?.[subject]?.spring;
    if (value && value.trim()) completed++;
  });
  
  // Check overall comments
  if (data?.overallComments && data.overallComments.trim()) completed++;
  total++;
  
  return { completed, total, percentage: Math.round((completed / total) * 100) };
};

// Progress indicator component
const ProgressIndicator = ({ data, activeTab }) => {
  const progress = calculateProgress(data, activeTab);
  
  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
      <div className="px-4 py-1.5">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-medium text-gray-700">
            {activeTab === 'fall' ? 'Fall Visit' : 'Spring Visit'} Progress
          </span>
          <span className="text-xs font-bold text-purple-600">
            {progress.percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-500 ${
              progress.percentage === 100 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : 'bg-gradient-to-r from-purple-500 to-purple-600'
            }`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Main component
const FacilitatorMeetingForm = ({ 
  isOpen, 
  onOpenChange, 
  student, 
  familyId, 
  schoolYear, 
  staffMode = false, 
  userClaims = {}, 
  selectedFacilitator = null 
}) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState('fall');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [familyGuardians, setFamilyGuardians] = useState([]);
  const [showAttendeesSelector, setShowAttendeesSelector] = useState({ fall: false, spring: false });
  const [showPDFModal, setShowPDFModal] = useState(false);
  
  // Local state for overall comments to prevent lag
  const [localOverallComments, setLocalOverallComments] = useState('');

  const canEdit = !!staffMode;
  const canComment = true;

  // Check if visits are complete
  const checkVisitCompletion = (visitData, evaluation, subjects, visitType) => {
    if (!visitData?.date) return false;
    if (!visitData?.attendees || visitData.attendees.length < 2) return false;
    
    // Check if at least some evaluation items are checked
    const evalChecked = Object.values(evaluation || {}).filter(Boolean).length > 0;
    if (!evalChecked) return false;
    
    // Check if at least some subjects have content
    const subjectsData = subjects || {};
    const hasSubjectContent = Object.values(subjectsData).some(subject => {
      const content = visitType === 'fall' ? subject?.fall : subject?.spring;
      return content && content.trim().length > 0;
    });
    
    return hasSubjectContent;
  };

  const fallComplete = useMemo(() => 
    checkVisitCompletion(data?.meeting1, data?.evaluation, data?.subjects, 'fall'),
    [data]
  );
  
  const springComplete = useMemo(() => 
    checkVisitCompletion(data?.meeting2, data?.evaluation, data?.subjects, 'spring'),
    [data]
  );

  const dbPath = useMemo(() => (
    familyId && student?.id && schoolYear
      ? `homeEducationFamilies/familyInformation/${familyId}/FACILITATOR_MEETINGS/${schoolYear.replace('/', '_')}/${student.id}`
      : null
  ), [familyId, student?.id, schoolYear]);

  // Load realtime data
  useEffect(() => {
    if (!dbPath || !isOpen) return;
    const db = getDatabase();
    const r = ref(db, dbPath);
    const unsub = onValue(r, (snap) => {
      setData(snap.exists() ? snap.val() : {
        studentFirstName: student?.firstName || '',
        studentLastName: student?.lastName || '',
        grade: student?.grade || '',
        asn: student?.asn || '',
        facilitatorName: selectedFacilitator?.name || '',
        facilitatorEmail: selectedFacilitator?.contact?.email || '',
        meeting1: { date: '', attendees: [] },
        meeting2: { date: '', attendees: [] },
        evaluation: {},
        subjects: {
          la: { fall: '', spring: '' },
          math: { fall: '', spring: '' },
          science: { fall: '', spring: '' },
          social: { fall: '', spring: '' },
          physed: { fall: '', spring: '' },
          arts: { fall: '', spring: '' },
          lifeSkills: { fall: '', spring: '' },
          other: { fall: '', spring: '' }
        },
        overallComments: '',
        professionalJudgmentAchievingOutcomes: false,
        submissionStatus: 'draft',
        comments: {},
        pdfVersions: []
      });
      setLoading(false);
    });
    return () => off(r, 'value', unsub);
  }, [dbPath, isOpen, student, selectedFacilitator]);

  // Sync local overall comments with Firebase data
  useEffect(() => {
    if (data?.overallComments !== undefined) {
      setLocalOverallComments(data.overallComments || '');
    }
  }, [data?.overallComments]);

  // Load family guardians
  useEffect(() => {
    if (!familyId || !isOpen) return;
    const db = getDatabase();
    const guardiansRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/guardians`);
    const unsub = onValue(guardiansRef, (snap) => {
      if (snap.exists()) {
        const guardiansData = snap.val();
        const guardiansList = Object.values(guardiansData).map(guardian => ({
          id: guardian.emailKey || guardian.email,
          name: `${guardian.firstName} ${guardian.lastName}`,
          firstName: guardian.firstName,
          lastName: guardian.lastName,
          email: guardian.email,
          phone: guardian.phone || guardian.phoneNumber || '',
          guardianType: guardian.guardianType,
          relationToStudents: guardian.relationToStudents || 'Guardian'
        }));
        setFamilyGuardians(guardiansList);
      }
    });
    return () => off(guardiansRef, 'value', unsub);
  }, [familyId, isOpen]);

  // Initialize attendees with facilitator, student, and primary guardian
  useEffect(() => {
    if (!data || !selectedFacilitator || !student || familyGuardians.length === 0) return;
    
    const studentName = student.preferredName || `${student.firstName} ${student.lastName}`;
    const facilitatorName = selectedFacilitator.name || data.facilitatorName;
    
    // Find the primary guardian
    const primaryGuardian = familyGuardians.find(g => g.guardianType === 'primary_guardian');
    
    const defaultAttendees = [
      { type: 'facilitator', name: facilitatorName },
      { type: 'student', name: studentName }
    ];
    
    // Add primary guardian if found
    if (primaryGuardian) {
      defaultAttendees.push({
        type: 'guardian',
        name: primaryGuardian.name,
        email: primaryGuardian.email,
        phone: primaryGuardian.phone || '',
        relationToStudents: primaryGuardian.relationToStudents || 'Primary Guardian',
        isPrimary: true
      });
    }
    
    // Initialize attendees if empty or if we need to add primary guardian
    let needsUpdate = false;
    const updates = {};
    
    // Check if meeting1 needs initialization or primary guardian
    if (!data.meeting1?.attendees || data.meeting1.attendees.length === 0) {
      updates['meeting1.attendees'] = defaultAttendees;
      needsUpdate = true;
    } else if (primaryGuardian && !data.meeting1.attendees.some(a => a.isPrimary)) {
      // Add primary guardian if not already present
      const hasPrimaryGuardian = data.meeting1.attendees.some(a => 
        a.email === primaryGuardian.email || (a.isPrimary === true)
      );
      if (!hasPrimaryGuardian) {
        updates['meeting1.attendees'] = [...data.meeting1.attendees, {
          type: 'guardian',
          name: primaryGuardian.name,
          email: primaryGuardian.email,
          phone: primaryGuardian.phone || '',
          relationToStudents: primaryGuardian.relationToStudents || 'Primary Guardian',
          isPrimary: true
        }];
        needsUpdate = true;
      }
    }
    
    // Check if meeting2 needs initialization or primary guardian
    if (!data.meeting2?.attendees || data.meeting2.attendees.length === 0) {
      updates['meeting2.attendees'] = defaultAttendees;
      needsUpdate = true;
    } else if (primaryGuardian && !data.meeting2.attendees.some(a => a.isPrimary)) {
      // Add primary guardian if not already present
      const hasPrimaryGuardian = data.meeting2.attendees.some(a => 
        a.email === primaryGuardian.email || (a.isPrimary === true)
      );
      if (!hasPrimaryGuardian) {
        updates['meeting2.attendees'] = [...data.meeting2.attendees, {
          type: 'guardian',
          name: primaryGuardian.name,
          email: primaryGuardian.email,
          phone: primaryGuardian.phone || '',
          relationToStudents: primaryGuardian.relationToStudents || 'Primary Guardian',
          isPrimary: true
        }];
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      Object.keys(updates).forEach(key => setField(key, updates[key]));
    }
  }, [data, selectedFacilitator, student, familyGuardians]);

  // Backfill facilitator info
  useEffect(() => {
    if (!data) return;
    const needName = !data.facilitatorName || data.facilitatorName.trim() === '';
    const needEmail = !data.facilitatorEmail || data.facilitatorEmail.trim() === '';
    let updated = {};
    if ((needName || needEmail) && selectedFacilitator) {
      if (needName) updated.facilitatorName = selectedFacilitator.name;
      if (needEmail) updated.facilitatorEmail = selectedFacilitator.contact?.email || '';
    } else if ((needName || needEmail) && data.facilitatorEmail) {
      const f = getFacilitatorByEmail(data.facilitatorEmail);
      if (f) {
        if (needName) updated.facilitatorName = f.name;
      }
    }
    if (Object.keys(updated).length > 0) {
      saveData(updated);
      setData(prev => ({ ...prev, ...updated }));
    }
  }, [data, selectedFacilitator]);

  // Save data with debouncing
  const saveData = async (patch) => {
    if (!dbPath) return;
    setSaving(true);
    const db = getDatabase();
    const r = ref(db, dbPath);
    await update(r, { ...patch, lastUpdated: Date.now() });
    setSaving(false);
  };

  const setField = (path, value) => {
    setData((prev) => {
      const next = { ...(prev || {}) };
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = obj[keys[i]] || {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      saveData(next);
      return next;
    });
  };

  const addComment = async (sectionKey, text, includeInPdf = false) => {
    if (!dbPath || !user) return;
    const db = getDatabase();
    const listRef = ref(db, `${dbPath}/comments/${sectionKey}`);
    const newRef = push(listRef);
    await set(newRef, {
      id: newRef.key,
      text,
      authorId: user.uid,
      authorName: user.displayName || user.email || 'User',
      role: staffMode ? 'staff' : (userClaims?.familyRole || 'user'),
      createdAt: Date.now(),
      includeInPdf: !!includeInPdf
    });
  };

  const deleteComment = async (sectionKey, commentId) => {
    if (!dbPath) return;
    const db = getDatabase();
    const commentRef = ref(db, `${dbPath}/comments/${sectionKey}/${commentId}`);
    await set(commentRef, null);
    toast.success('Comment deleted');
  };

  const toggleCommentPdfInclusion = async (sectionKey, commentId, currentValue) => {
    if (!dbPath) return;
    const db = getDatabase();
    const commentRef = ref(db, `${dbPath}/comments/${sectionKey}/${commentId}/includeInPdf`);
    await set(commentRef, !currentValue);
    toast.success(currentValue ? 'Comment removed from PDF' : 'Comment will be included in PDF');
  };

  const validate = () => {
    const errors = {};
    if (!data?.meeting1?.date) errors.m1date = 'Fall visit date is required';
    if (!data?.meeting2?.date) errors.m2date = 'Spring visit date is required';
    const anySubjectFilled = Object.values(data?.subjects || {}).some(s => (s.fall && s.fall.trim()) || (s.spring && s.spring.trim()));
    if (!anySubjectFilled && !(data?.overallComments && data.overallComments.trim())) {
      errors.subjects = 'Please add notes for at least one subject or provide overall comments';
    }
    return errors;
  };

  const generatePDF = async () => {
    if (!data || !dbPath) return;
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      toast.error('Please complete required fields before generating PDF.');
      return;
    }
    setGeneratingPDF(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let y = 18;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Home Education Progress Report', pageWidth / 2, y, { align: 'center' });
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Student: ${data.studentFirstName || ''} ${data.studentLastName || ''}  •  Grade: ${data.grade || ''}  •  ASN: ${data.asn || ''}`, pageWidth / 2, y, { align: 'center' });
      y += 6;
      doc.text(`School Year: ${schoolYear}`, pageWidth / 2, y, { align: 'center' });
      y += 10;

      // Header details
      const formatAttendees = (attendees) => {
        if (!attendees || !Array.isArray(attendees)) return '';
        return attendees.map(a => a.name).join(', ');
      };
      
      doc.autoTable({
        startY: y,
        head: [['Field', 'Fall', 'Spring']],
        body: [
          ['Facilitator', data.facilitatorName || '', ''],
          ['Facilitator Email', data.facilitatorEmail || '', ''],
          ['Visit Date', data.meeting1?.date || '', data.meeting2?.date || ''],
          ['Attendees', formatAttendees(data.meeting1?.attendees), formatAttendees(data.meeting2?.attendees)]
        ],
        styles: { fontSize: 9, cellPadding: 3 },
        theme: 'striped',
        margin: { left: 14, right: 14 }
      });
      y = doc.previousAutoTable.finalY + 6;

      // Evaluation checklist
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Evaluation of Progress Based On: The Schedule of Learning Outcomes for Home Education', 14, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const chk = (b) => (b ? '✔️' : '');
      doc.autoTable({
        startY: y,
        head: [['Item', 'Checked']],
        body: [
          ['Program plan completed, reviewed, and accepted.', chk(data.evaluation?.planCompletedReviewedAccepted)],
          ['Discussed available testing (when applicable): PATs (grades 6 and 9); diploma exams (grade 12 academic courses).', chk(data.evaluation?.discussedTesting)],
          ["Discussion of student's learning activities, assessment, and progress.", chk(data.evaluation?.discussedActivitiesProgress)],
          ['Advised parent on matters that may assist in attaining a higher level of achievement or enhance the student\'s learning experience', chk(data.evaluation?.advisedParent)],
          ['Discussed resources available', chk(data.evaluation?.discussedResourcesAvailable)],
          ['Discussed resource claims and Transfer of Funding', chk(data.evaluation?.discussedClaimsAndTransfer)]
        ],
        styles: { fontSize: 9, cellPadding: 3 },
        theme: 'striped',
        margin: { left: 14, right: 14 }
      });
      y = doc.previousAutoTable.finalY + 6;

      // Subjects table
      const subj = data.subjects || {};
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Subject Progress', 14, y);
      y += 4;
      doc.autoTable({
        startY: y,
        head: [['Subject', 'Fall', 'Spring']],
        body: [
          ['Language, communication, writing, reading, media (LA)', subj.la?.fall || '', subj.la?.spring || ''],
          ['Logic, analytical thinking (Mathematics)', subj.math?.fall || '', subj.math?.spring || ''],
          ['Technology, ecology, nature (Science)', subj.science?.fall || '', subj.science?.spring || ''],
          ['Humanities, community, history, geography (Soc)', subj.social?.fall || '', subj.social?.spring || ''],
          ['Wellness, health, athletics (PhysEd)', subj.physed?.fall || '', subj.physed?.spring || ''],
          ['Creativity, artistic expression (Drama, Art, Music)', subj.arts?.fall || '', subj.arts?.spring || ''],
          ['Practical abilities, financial literacy, information technology (Life Skills)', subj.lifeSkills?.fall || '', subj.lifeSkills?.spring || ''],
          ['Other', subj.other?.fall || '', subj.other?.spring || '']
        ],
        styles: { fontSize: 9, cellPadding: 3 },
        theme: 'grid',
        margin: { left: 14, right: 14 }
      });
      y = doc.previousAutoTable.finalY + 6;

      // Credits statement
      const creditsLine = 'Awarding of Credits Based On: Demonstration of achievement of the standards and learning outcomes set out in the Alberta Program of Study.';
      doc.setFont('helvetica', 'bold');
      doc.text('Credits & Judgment', 14, y); y += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(doc.splitTextToSize(creditsLine, pageWidth - 28), 14, y);
      y += 8;

      // Comments
      doc.setFont('helvetica', 'bold');
      doc.text('Comments', 14, y); y += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(doc.splitTextToSize(data.overallComments || '', pageWidth - 28), 14, y);
      y += 8 + doc.getTextDimensions(doc.splitTextToSize(data.overallComments || '', pageWidth - 28)).h;

      // Selected Comments
      const commentsBySection = data.comments || {};
      const subjectLabels = {
        subject_la: 'Language Arts',
        subject_math: 'Mathematics',
        subject_science: 'Science',
        subject_social: 'Social Studies',
        subject_physed: 'Physical Education',
        subject_arts: 'Arts',
        subject_lifeSkills: 'Life Skills',
        subject_other: 'Other'
      };
      const selectedRows = [];
      Object.keys(commentsBySection).forEach((key) => {
        const list = (commentsBySection[key] || []).filter(c => c.includeInPdf);
        if (list.length > 0) {
          const label = subjectLabels[key] || (key === 'overall_comments' ? 'Overall' : key);
          list.forEach((c) => {
            const meta = [c.authorName || 'User', c.role || '', new Date(c.createdAt || Date.now()).toLocaleDateString()].filter(Boolean).join(' • ');
            selectedRows.push([label, `${c.text}\n(${meta})`]);
          });
        }
      });
      if (selectedRows.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Selected Comments', 14, y); y += 4;
        doc.setFont('helvetica', 'normal');
        doc.autoTable({
          startY: y,
          head: [['Section', 'Comment']],
          body: selectedRows,
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: { 1: { cellWidth: pageWidth - 14 - 14 - 50 } },
          theme: 'striped',
          margin: { left: 14, right: 14 }
        });
        y = doc.previousAutoTable.finalY + 8;
      }

      // Professional judgment
      doc.setFont('helvetica', 'bold');
      const judgment = data.professionalJudgmentAchievingOutcomes ? '✔️' : '◻';
      doc.text(`${judgment} In my professional judgment, this student is achieving the Alberta Learning Outcomes for Home Education Students.`, 14, y);
      y += 10;

      // Signature
      doc.setFont('helvetica', 'normal');
      doc.text((data.facilitatorName || 'Facilitator') + '  •  Home Education Teacher/Facilitator', 14, y); y += 5;
      if (data.facilitatorEmail) { doc.text(data.facilitatorEmail, 14, y); y += 5; }

      // Upload
      const storage = getStorage();
      const version = (data.pdfVersions?.length || 0) + 1;
      const filePath = `meeting-forms/${familyId}/${student.id}/${schoolYear.replace('/', '_')}/facilitator-meetings/v${version}.pdf`;
      const bytes = doc.output('arraybuffer');
      const fileRef = storageRef(storage, filePath);
      await uploadBytes(fileRef, new Blob([bytes], { type: 'application/pdf' }), { contentType: 'application/pdf' });
      const url = await getDownloadURL(fileRef);

      // Save metadata
      await saveData({
        submissionStatus: 'submitted',
        submittedAt: Date.now(),
        pdfVersions: [
          ...(data.pdfVersions || []),
          {
            version,
            url,
            name: `FacilitatorMeeting_${student.lastName || ''}_${student.firstName || ''}_v${version}.pdf`,
            createdAt: Date.now(),
            createdById: user?.uid || null,
            createdByName: user?.displayName || user?.email || 'User'
          }
        ]
      });
      setGeneratingPDF(false);
      toast.success('PDF generated and saved successfully!');
    } catch (e) {
      console.error(e);
      setGeneratingPDF(false);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  // Check if tabs have data
  const hasFallData = () => {
    if (!data) return false;
    return !!(data.meeting1?.date || 
             (data.meeting1?.attendees && data.meeting1.attendees.length > 0) ||
             Object.values(data.subjects || {}).some(s => s.fall && s.fall.trim()));
  };

  const hasSpringData = () => {
    if (!data) return false;
    return !!(data.meeting2?.date || 
             (data.meeting2?.attendees && data.meeting2.attendees.length > 0) ||
             Object.values(data.subjects || {}).some(s => s.spring && s.spring.trim()));
  };

  const subjectOptions = [
    { key: 'la', label: 'Language, communication, writing, reading, media (LA)' },
    { key: 'math', label: 'Logic, analytical thinking (Mathematics)' },
    { key: 'science', label: 'Technology, ecology, nature (Science)' },
    { key: 'social', label: 'Humanities, community, history, geography (Social Studies)' },
    { key: 'physed', label: 'Wellness, health, athletics (Physical Education)' },
    { key: 'arts', label: 'Creativity, artistic expression (Drama, Art, Music)' },
    { key: 'lifeSkills', label: 'Practical abilities, financial literacy, IT (Life Skills)' },
    { key: 'other', label: 'Other' }
  ];

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" size="full" className="h-full w-full overflow-y-auto p-0">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
            <SheetTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span>Facilitator Meetings — {student?.preferredName || student?.firstName} {student?.lastName} ({schoolYear})</span>
            </SheetTitle>
            <SheetDescription>
              Document fall and spring visits with detailed progress notes and evaluations
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 p-6 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500 mr-2" />
                <span className="text-gray-600">Loading meeting data...</span>
              </div>
            ) : data && (
              <>
            

                {/* Student and Facilitator Info Header */}
                <StudentInfoHeader 
                  student={student} 
                  facilitator={selectedFacilitator || { name: data.facilitatorName, email: data.facilitatorEmail }}
                  primaryGuardian={familyGuardians.find(g => g.guardianType === 'primary_guardian')}
                />

                {/* Evaluation Checklist - Applies to Both Visits */}
                <StyledCard variant="green" className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <ClipboardCheck className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Progress Evaluation Criteria</h3>
                     
                    </div>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          const allChecked = ['planCompletedReviewedAccepted', 'discussedTesting', 
                            'discussedActivitiesProgress', 'advisedParent', 'discussedResourcesAvailable', 
                            'discussedClaimsAndTransfer'].every(key => data.evaluation?.[key]);
                          
                          const newValue = !allChecked;
                          setField('evaluation', {
                            planCompletedReviewedAccepted: newValue,
                            discussedTesting: newValue,
                            discussedActivitiesProgress: newValue,
                            advisedParent: newValue,
                            discussedResourcesAvailable: newValue,
                            discussedClaimsAndTransfer: newValue
                          });
                        }}
                        className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors duration-200"
                      >
                        <CheckSquare className="w-4 h-4" />
                        <span>Select All</span>
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: 'planCompletedReviewedAccepted', label: 'Program plan completed, reviewed, and accepted.' },
                      { key: 'discussedTesting', label: 'Discussed available testing (PATs grades 6 & 9, diploma exams grade 12).' },
                      { key: 'discussedActivitiesProgress', label: 'Discussion of student\'s learning activities, assessment, and progress.' },
                      { key: 'advisedParent', label: 'Advised parent on matters to enhance achievement and learning experience.' },
                      { key: 'discussedResourcesAvailable', label: 'Discussed resources available.' },
                      { key: 'discussedClaimsAndTransfer', label: 'Discussed resource claims and Transfer of Funding.' }
                    ].map(item => (
                      <label key={item.key} className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg hover:bg-green-50 transition-colors duration-200">
                        <input 
                          type="checkbox" 
                          className="mt-0.5 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          checked={!!data.evaluation?.[item.key]}
                          onChange={(e) => setField(`evaluation.${item.key}`, e.target.checked)}
                          disabled={!canEdit}
                        />
                        <span className="text-sm text-gray-800">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </StyledCard>

                {/* Visit-Specific Content Container */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 mb-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Visit Documentation</h3>
                    <p className="text-sm text-gray-600">Record details specific to each facilitator visit</p>
                  </div>

                  {/* Tab Navigation */}
                  <TabNavigation 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab}
                    hasFallData={hasFallData()}
                    hasSpringData={hasSpringData()}
                  />

                  {/* Meeting Details Section */}
                  <StyledCard variant="blue" className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      label="Visit Date" 
                      required 
                      icon={CalendarDays}
                    >
                      <DateInput 
                        value={activeTab === 'fall' ? data.meeting1?.date : data.meeting2?.date} 
                        onChange={(v) => setField(activeTab === 'fall' ? 'meeting1.date' : 'meeting2.date', v)} 
                        readOnly={!canEdit}
                        placeholder={`Select ${activeTab} visit date`}
                      />
                    </FormField>
                    
                    <FormField 
                      label="Visit Attendees" 
                      icon={Users}
                      description="Facilitator and student are included by default"
                    >
                      <AttendeeSelector
                        attendees={activeTab === 'fall' ? (data.meeting1?.attendees || []) : (data.meeting2?.attendees || [])}
                        onUpdateAttendees={(attendees) => setField(activeTab === 'fall' ? 'meeting1.attendees' : 'meeting2.attendees', attendees)}
                        guardians={familyGuardians}
                        readOnly={!canEdit}
                      />
                    </FormField>
                  </div>
                </StyledCard>

                  {/* Subject Progress */}
                  <StyledCard variant="purple" className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Subject-Specific Progress</h3>
                    <p className="text-xs text-gray-500">Click to expand and add notes</p>
                  </div>
                  <div className="space-y-3">
                    {subjectOptions.map(subject => (
                      <ExpandableSubjectCard
                        key={subject.key}
                        subject={subject}
                        fallValue={data.subjects?.[subject.key]?.fall}
                        springValue={data.subjects?.[subject.key]?.spring}
                        onFallChange={(v) => setField(`subjects.${subject.key}.fall`, v)}
                        onSpringChange={(v) => setField(`subjects.${subject.key}.spring`, v)}
                        readOnly={!canEdit}
                        activeTab={activeTab}
                        comments={Object.values(data.comments?.[`subject_${subject.key}`] || {})}
                        onAddComment={(t, inc) => addComment(`subject_${subject.key}`, t, inc)}
                        onDeleteComment={(commentId) => deleteComment(`subject_${subject.key}`, commentId)}
                        onTogglePdfComment={(commentId, currentValue) => toggleCommentPdfInclusion(`subject_${subject.key}`, commentId, currentValue)}
                        currentUserId={user?.uid}
                        isStaff={staffMode}
                        canComment={canComment}
                      />
                    ))}
                  </div>
                </StyledCard>
                </div>

                {/* Overall Assessment - Below Tab Content */}
                
                <StyledCard variant="purple" className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Overall Comments & Summary</h3>
                  </div>
                  <textarea 
                    value={localOverallComments}
                    onChange={(e) => setLocalOverallComments(e.target.value)}
                    onBlur={() => {
                      if (localOverallComments !== data.overallComments) {
                        setField('overallComments', localOverallComments);
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      !canEdit ? 'bg-gray-50 cursor-not-allowed border-gray-200' : 'border-gray-300'
                    }`}
                    readOnly={!canEdit}
                    disabled={!canEdit}
                    placeholder="Provide an overall summary of the student's progress..."
                    rows={5}
                  />
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Discussion Thread</h5>
                    <CommentList 
                      items={Object.values(data.comments?.overall_comments || {})} 
                      onDelete={(commentId) => deleteComment('overall_comments', commentId)}
                      onTogglePdf={(commentId, currentValue) => toggleCommentPdfInclusion('overall_comments', commentId, currentValue)}
                      currentUserId={user?.uid}
                      isStaff={staffMode}
                    />
                    <CommentComposer 
                      onAdd={(t, inc) => addComment('overall_comments', t, inc)} 
                      readOnly={!canComment} 
                    />
                  </div>
                </StyledCard>

                {/* Professional Judgment */}
                <StyledCard className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Professional Judgment</h3>
                  </div>
                  <label className="flex items-start space-x-3 cursor-pointer p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                    <input 
                      type="checkbox" 
                      className="mt-0.5 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      checked={!!data.professionalJudgmentAchievingOutcomes}
                      onChange={(e) => setField('professionalJudgmentAchievingOutcomes', e.target.checked)}
                      disabled={!canEdit}
                    />
                    <span className="text-sm text-gray-800 font-medium">
                      In my professional judgment, this student is achieving the Alberta Learning Outcomes for Home Education Students.
                    </span>
                  </label>
                </StyledCard>

                {/* Footer Actions */}
                <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
                  {/* Progress Bar */}
                  <ProgressIndicator data={data} activeTab={activeTab} />
                  
                  {/* Action Buttons */}
                  <div className="px-4 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => onOpenChange(false)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors duration-200 inline-flex items-center space-x-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Close</span>
                        </button>
                        <div className="text-xs text-gray-600">
                          {saving ? (
                            <span className="flex items-center space-x-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Saving...</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                              <span>Saved</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {data?.pdfVersions?.length > 0 && (
                          <a
                            href={data.pdfVersions[data.pdfVersions.length - 1].url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-50 rounded text-xs font-medium inline-flex items-center space-x-1.5 border border-gray-300 transition-colors duration-200"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Latest PDF</span>
                          </a>
                        )}
                        {(() => {
                          const progress = calculateProgress(data, activeTab);
                          return progress.percentage === 100 ? (
                            <button
                              type="button"
                              onClick={() => setShowPDFModal(true)}
                              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded hover:from-purple-700 hover:to-indigo-700 text-xs font-medium inline-flex items-center space-x-1.5 transition-all duration-200 shadow-sm hover:shadow-md"
                              disabled={generatingPDF}
                            >
                              {generatingPDF ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-3.5 h-3.5" />
                                  <span>Generate PDF</span>
                                </>
                              )}
                            </button>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* PDF Generation Modal */}
                <PDFGenerationModal
                  isOpen={showPDFModal}
                  onClose={() => setShowPDFModal(false)}
                  onConfirm={() => {
                    setShowPDFModal(false);
                    generatePDF();
                  }}
                  fallComplete={fallComplete}
                  springComplete={springComplete}
                />
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FacilitatorMeetingForm;