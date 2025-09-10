import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Star,
  User,
  Users,
  Calendar,
  Tag,
  X,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  FileText,
  DollarSign,
  GraduationCap,
  Heart,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

// Lazy load QuillEditor to ensure jQuery loads first
const QuillEditor = lazy(() => import('../../courses/CourseEditor/QuillEditor'));
import { useAuth } from '../../context/AuthContext';
import { useFamilyNotes } from './useFamilyNotes';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import {
  Alert,
  AlertDescription,
} from '../../components/ui/alert';

// Note categories with icons and colors
const NOTE_CATEGORIES = {
  general: { label: 'General', icon: FileText, color: 'bg-gray-100 text-gray-700' },
  financial: { label: 'Financial', icon: DollarSign, color: 'bg-green-100 text-green-700' },
  academic: { label: 'Academic', icon: GraduationCap, color: 'bg-blue-100 text-blue-700' },
  behavioral: { label: 'Behavioral', icon: Heart, color: 'bg-purple-100 text-purple-700' },
  communication: { label: 'Communication', icon: Phone, color: 'bg-orange-100 text-orange-700' }
};

// Helper function to get email status icon
function getEmailStatusIcon(status) {
  switch (status) {
    case 'sent':
    case 'processed':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'delivered':
      return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
    case 'opened':
      return <Eye className="h-4 w-4 text-green-600" />;
    case 'failed':
    case 'bounce':
    case 'dropped':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Mail className="h-4 w-4 text-gray-600" />;
  }
}

const FamilyNotesModal = ({ isOpen, onClose, family, familyId }) => {
  const { user } = useAuth();
  const {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    markAsRead,
    getUnreadCount,
    emailTracking,
    emailContents
  } = useFamilyNotes(familyId);

  // Debug logging in useEffect to avoid render loops
  useEffect(() => {
    if (emailTracking && Object.keys(emailTracking).length > 0) {
      console.log('[DEBUG] FamilyNotesModal - Email tracking received:', {
        familyId,
        trackingKeys: Object.keys(emailTracking),
        notesWithEmail: notes.filter(n => n.metadata?.type === 'email').map(n => n.metadata.emailId)
      });
    }
  }, [Object.keys(emailTracking || {}).join(',')]); // Only log when tracking keys change

  // State management
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [noteVisibility, setNoteVisibility] = useState('shared');
  const [noteCategory, setNoteCategory] = useState('general');
  const [noteImportant, setNoteImportant] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedEmails, setExpandedEmails] = useState({});

  const quillRef = useRef(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedNote(null);
      setIsEditing(false);
      setIsCreating(false);
      setEditorContent('');
      setSearchTerm('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // Mark note as read when selected
  useEffect(() => {
    if (selectedNote && !selectedNote.readBy?.includes(user.email)) {
      markAsRead(selectedNote.id);
    }
  }, [selectedNote, user.email, markAsRead]);

  // Filter notes based on tab, search, and category
  const filteredNotes = notes.filter(note => {
    // Filter by tab (visibility)
    if (activeTab === 'personal' && (note.visibility !== 'personal' || note.authorEmail !== user.email)) {
      return false;
    }
    if (activeTab === 'shared' && note.visibility !== 'shared') {
      return false;
    }

    // Filter by category
    if (selectedCategory !== 'all' && note.category !== selectedCategory) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const contentText = note.content.replace(/<[^>]*>/g, '').toLowerCase();
      const authorMatch = note.authorName?.toLowerCase().includes(searchLower);
      return contentText.includes(searchLower) || authorMatch;
    }

    return true;
  });

  // Group notes by date
  const groupNotesByDate = (notes) => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    notes.forEach(note => {
      const noteDate = new Date(note.createdAt);
      if (noteDate >= today) {
        groups.today.push(note);
      } else if (noteDate >= yesterday) {
        groups.yesterday.push(note);
      } else if (noteDate >= weekAgo) {
        groups.thisWeek.push(note);
      } else if (noteDate >= monthAgo) {
        groups.thisMonth.push(note);
      } else {
        groups.older.push(note);
      }
    });

    return groups;
  };

  const groupedNotes = groupNotesByDate(filteredNotes);

  // Handle creating new note
  const handleCreateNote = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedNote(null);
    setEditorContent('');
    setNoteVisibility('shared');
    setNoteCategory('general');
    setNoteImportant(false);
  };

  // Handle saving note
  const handleSaveNote = async () => {
    if (!editorContent.trim()) return;

    setSaving(true);
    try {
      const noteData = {
        content: editorContent,
        visibility: noteVisibility,
        category: noteCategory,
        isImportant: noteImportant,
        authorEmail: user.email,
        authorName: user.displayName || user.email
      };

      if (isEditing && selectedNote) {
        await updateNote(selectedNote.id, noteData);
      } else {
        await createNote(noteData);
      }

      setIsCreating(false);
      setIsEditing(false);
      setEditorContent('');
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle editing note
  const handleEditNote = (note) => {
    setSelectedNote(note);
    setIsEditing(true);
    setIsCreating(false);
    setEditorContent(note.content);
    setNoteVisibility(note.visibility);
    setNoteCategory(note.category);
    setNoteImportant(note.isImportant);
  };

  // Handle deleting note
  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      setDeleteConfirm(null);
      setSelectedNote(null);
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  // Render note item in list
  const renderNoteItem = (note) => {
    const isUnread = !note.readBy?.includes(user.email);
    const isAuthor = note.authorEmail === user.email;
    const isEmailNote = note.metadata?.type === 'email';
    const CategoryIcon = isEmailNote ? Mail : (NOTE_CATEGORIES[note.category]?.icon || FileText);
    const categoryStyle = isEmailNote ? 'bg-blue-100 text-blue-700' : (NOTE_CATEGORIES[note.category]?.color || 'bg-gray-100 text-gray-700');

    // Get email status and open count if it's an email note
    let emailStatus = null;
    let totalOpens = 0;
    if (isEmailNote && note.metadata?.emailId && emailTracking) {
      const tracking = emailTracking[note.metadata.emailId];
      
      if (tracking?.recipients) {
        // Get the primary recipient's status
        const primaryRecipient = Object.values(tracking.recipients)[0];
        emailStatus = primaryRecipient?.status;
      }
      totalOpens = tracking?.totalOpens || 0;
    }

    return (
      <div
        key={note.id}
        onClick={() => setSelectedNote(note)}
        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
          selectedNote?.id === note.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        } ${isUnread ? 'bg-blue-50/50' : ''}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge className={categoryStyle} variant="secondary">
              <CategoryIcon className="w-3 h-3 mr-1" />
              {isEmailNote ? 'Email' : NOTE_CATEGORIES[note.category]?.label}
            </Badge>
            {emailStatus && getEmailStatusIcon(emailStatus)}
            {totalOpens > 0 && (
              <Badge variant="outline" className="text-xs bg-green-50">
                {totalOpens} open{totalOpens !== 1 ? 's' : ''}
              </Badge>
            )}
            {note.isImportant && (
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            )}
            {isUnread && (
              <Badge variant="default" className="bg-blue-500">
                New
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {note.visibility === 'personal' ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <EyeOff className="w-3 h-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>Personal Note</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Users className="w-3 h-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>Shared with all staff</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-1">
          <span className="font-medium">{note.authorName}</span>
          <span className="mx-1">•</span>
          <span>{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
        </div>

        {isEmailNote && note.metadata?.subject ? (
          <div className="text-sm text-gray-700">
            <div className="font-medium">{note.metadata.subject}</div>
            <div className="text-xs text-gray-500 mt-1">
              To: {note.metadata.recipientEmail || 'Unknown'}
            </div>
          </div>
        ) : (
          <div 
            className="text-sm text-gray-700 line-clamp-2"
            dangerouslySetInnerHTML={{ 
              __html: note.content.replace(/<[^>]*>/g, ' ').substring(0, 150) + '...' 
            }}
          />
        )}
      </div>
    );
  };

  // Render notes list section
  const renderNotesList = () => (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Search and filters */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(NOTE_CATEGORIES).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <value.icon className="w-4 h-4" />
                    {value.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreateNote} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Notes list */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No notes found</p>
            <p className="text-sm mt-1">
              {searchTerm ? 'Try adjusting your search' : 'Create your first note'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedNotes).map(([period, periodNotes]) => {
              if (periodNotes.length === 0) return null;

              const periodLabels = {
                today: 'Today',
                yesterday: 'Yesterday',
                thisWeek: 'This Week',
                thisMonth: 'This Month',
                older: 'Older'
              };

              return (
                <div key={period}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {periodLabels[period]}
                  </h3>
                  <div className="space-y-2">
                    {periodNotes.map(renderNoteItem)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  // Render note detail/editor
  const renderNoteDetail = () => {
    if (isCreating || isEditing) {
      return (
        <div className="h-full flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold mb-3">
              {isEditing ? 'Edit Note' : 'New Note'}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="visibility">Visibility:</Label>
                  <Select value={noteVisibility} onValueChange={setNoteVisibility}>
                    <SelectTrigger id="visibility" className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shared">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Shared
                        </div>
                      </SelectItem>
                      <SelectItem value="personal">
                        <div className="flex items-center gap-2">
                          <EyeOff className="w-4 h-4" />
                          Personal
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="category">Category:</Label>
                  <Select value={noteCategory} onValueChange={setNoteCategory}>
                    <SelectTrigger id="category" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(NOTE_CATEGORIES).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <value.icon className="w-4 h-4" />
                            {value.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="important"
                    checked={noteImportant}
                    onCheckedChange={setNoteImportant}
                  />
                  <Label htmlFor="important" className="flex items-center gap-1">
                    <Star className={`w-4 h-4 ${noteImportant ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                    Important
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 p-4">
            <div style={{ height: 'calc(100% - 1rem)' }}>
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              }>
                <QuillEditor
                  ref={quillRef}
                  initialContent={editorContent}
                  onContentChange={setEditorContent}
                  hideSaveButton={true}
                  fixedHeight="calc(100vh - 28rem)"
                />
              </Suspense>
            </div>
          </div>

          <div className="p-4 border-t flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setEditorContent('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveNote} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Note
                </>
              )}
            </Button>
          </div>
        </div>
      );
    }

    if (selectedNote) {
      const isAuthor = selectedNote.authorEmail === user.email;
      const isEmailNote = selectedNote.metadata?.type === 'email';
      const CategoryIcon = isEmailNote ? Mail : (NOTE_CATEGORIES[selectedNote.category]?.icon || FileText);
      const categoryStyle = isEmailNote ? 'bg-blue-100 text-blue-700' : (NOTE_CATEGORIES[selectedNote.category]?.color || 'bg-gray-100 text-gray-700');

      return (
        <div className="h-full flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={categoryStyle} variant="secondary">
                    <CategoryIcon className="w-3 h-3 mr-1" />
                    {isEmailNote ? 'Email' : NOTE_CATEGORIES[selectedNote.category]?.label}
                  </Badge>
                  {selectedNote.isImportant && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                  {selectedNote.visibility === 'personal' ? (
                    <Badge variant="outline">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Personal
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Users className="w-3 h-3 mr-1" />
                      Shared
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{selectedNote.authorName}</span>
                  <span className="mx-1">•</span>
                  <span>{formatDistanceToNow(new Date(selectedNote.createdAt), { addSuffix: true })}</span>
                  {selectedNote.updatedAt && selectedNote.updatedAt !== selectedNote.createdAt && (
                    <>
                      <span className="mx-1">•</span>
                      <span className="text-gray-500">
                        edited {formatDistanceToNow(new Date(selectedNote.updatedAt), { addSuffix: true })}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {isAuthor && !isEmailNote && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditNote(selectedNote)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(selectedNote.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              )}
            </div>

            {/* Read by section */}
            {selectedNote.visibility === 'shared' && selectedNote.readBy?.length > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                <Eye className="w-3 h-3 inline mr-1" />
                Read by {selectedNote.readBy.length} staff member{selectedNote.readBy.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          <ScrollArea className="flex-1 p-4 overflow-y-auto">
            {isEmailNote ? (
              <div className="space-y-4">
                {/* Email metadata */}
                {selectedNote.metadata?.subject && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm space-y-1">
                      <div><strong>Subject:</strong> {selectedNote.metadata.subject}</div>
                      <div><strong>To:</strong> {selectedNote.metadata.recipientEmail}</div>
                    </div>
                  </div>
                )}
                
                {/* Email tracking status */}
                {selectedNote.metadata?.emailId && emailTracking && emailTracking[selectedNote.metadata.emailId] && (
                  <div className="border rounded-lg p-3 bg-blue-50/50">
                    <div className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Status
                      {emailTracking[selectedNote.metadata.emailId].totalOpens > 0 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {emailTracking[selectedNote.metadata.emailId].totalOpens} open{emailTracking[selectedNote.metadata.emailId].totalOpens !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Last activity indicator */}
                    {emailTracking[selectedNote.metadata.emailId].lastActivity && (
                      <div className="text-xs text-gray-500 mb-2">
                        Last activity: {emailTracking[selectedNote.metadata.emailId].lastActivity.type} - {
                          formatDistanceToNow(new Date(emailTracking[selectedNote.metadata.emailId].lastActivity.timestamp * 1000), { addSuffix: true })
                        }
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {Object.entries(emailTracking[selectedNote.metadata.emailId].recipients || {}).map(([key, recipient]) => {
                        const openCount = emailTracking[selectedNote.metadata.emailId].openCount?.[key] || 0;
                        return (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{recipient.email}</span>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                {getEmailStatusIcon(recipient.status)}
                                <span className="text-xs">{recipient.status}</span>
                              </span>
                              {openCount > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {openCount}x
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Show event timeline if there are multiple events */}
                    {emailTracking[selectedNote.metadata.emailId].events && 
                     Object.keys(emailTracking[selectedNote.metadata.emailId].events).length > 1 && (
                      <details className="mt-3">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          View event timeline
                        </summary>
                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                          {Object.entries(emailTracking[selectedNote.metadata.emailId].events || {})
                            .filter(([key]) => key !== 'sent') // Filter out the 'sent' event which has different structure
                            .sort(([, a], [, b]) => (b.timestamp || 0) - (a.timestamp || 0))
                            .map(([eventKey, event]) => {
                              // Handle different timestamp formats - some are in seconds, some in milliseconds
                              const timestamp = event.timestamp > 10000000000 ? event.timestamp : event.timestamp * 1000;
                              return (
                                <div key={eventKey} className="text-xs text-gray-600 flex items-center gap-2">
                                  {getEmailStatusIcon(event.status || event.type)}
                                  <span>{event.type}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>{event.email}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>
                                </div>
                              );
                            })
                          }
                        </div>
                      </details>
                    )}
                  </div>
                )}
                
                {/* Email content toggle */}
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedEmails(prev => ({
                      ...prev,
                      [selectedNote.id]: !prev[selectedNote.id]
                    }))}
                    className="mb-2"
                  >
                    {expandedEmails[selectedNote.id] ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Email Content
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show Email Content
                      </>
                    )}
                  </Button>
                  
                  {expandedEmails[selectedNote.id] && emailContents && emailContents[selectedNote.metadata.emailId] && (
                    <div className="border rounded-lg p-4 bg-white">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: emailContents[selectedNote.metadata.emailId].html || 
                                  emailContents[selectedNote.metadata.emailId].text 
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedNote.content }}
              />
            )}
          </ScrollArea>

          {/* Delete confirmation */}
          {deleteConfirm === selectedNote.id && (
            <Alert className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Are you sure you want to delete this note?</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteNote(selectedNote.id)}
                  >
                    Delete
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      );
    }

    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">Select a note to view</p>
          <p className="text-sm mt-1">Or create a new one</p>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" size="full" className="w-full sm:w-[95%] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b flex-shrink-0">
          <SheetTitle className="text-xl">
            Family Notes - {family?.familyName || 'Unknown Family'}
          </SheetTitle>
          <SheetDescription>
            Manage personal and shared notes for this family
          </SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 flex-shrink-0">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              All Notes
              {notes.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {notes.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Shared
              {notes.filter(n => n.visibility === 'shared').length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {notes.filter(n => n.visibility === 'shared').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <EyeOff className="w-4 h-4" />
              Personal
              {notes.filter(n => n.visibility === 'personal' && n.authorEmail === user.email).length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {notes.filter(n => n.visibility === 'personal' && n.authorEmail === user.email).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 mt-0 overflow-hidden">
            <div className="h-full flex">
              {/* Left panel - Notes list */}
              <div className="w-1/3 border-r h-full overflow-hidden">
                {renderNotesList()}
              </div>

              {/* Right panel - Note detail/editor */}
              <div className="flex-1 h-full overflow-hidden">
                {renderNoteDetail()}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default FamilyNotesModal;