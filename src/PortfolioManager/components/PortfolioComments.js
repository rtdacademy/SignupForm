import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import DevFileIndicator from './DevFileIndicator';
import {
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  X,
  Check,
  Loader2,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import QuillEditor from '../../courses/CourseEditor/QuillEditor';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import {
  Alert,
  AlertDescription,
} from '../../components/ui/alert';

const PortfolioComments = ({
  entryId,
  comments = [],
  loadingComments,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  collapsed = false,
  onToggle,
  commentCount = 0
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(!collapsed);
  const [showEditor, setShowEditor] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const editorRef = useRef(null);

  // Toggle expanded state
  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  // Handle new comment
  const handleAddComment = () => {
    setShowEditor(true);
    setEditingComment(null);
    setCommentContent('');
  };

  // Handle edit comment
  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setCommentContent(comment.content);
    setShowEditor(true);
  };

  // Handle save comment
  const handleSaveComment = async () => {
    if (!commentContent.trim()) return;

    setSaving(true);
    try {
      if (editingComment) {
        // Update existing comment
        await onUpdateComment(editingComment.id, {
          content: commentContent
        });
      } else {
        // Create new comment
        await onCreateComment({
          entryId: entryId,
          content: commentContent,
          type: 'text'
        });
      }

      // Reset editor
      setShowEditor(false);
      setEditingComment(null);
      setCommentContent('');
    } catch (err) {
      console.error('Error saving comment:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await onDeleteComment(commentId, entryId);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setShowEditor(false);
    setEditingComment(null);
    setCommentContent('');
  };

  // Render individual comment
  const renderComment = (comment) => {
    const isAuthor = comment.authorUid === user.uid;
    const isDeleting = deleteConfirm === comment.id;

    return (
      <div key={comment.id} className="group">
        <div className="flex items-start gap-3">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-medium text-sm text-gray-900">
                {comment.authorName}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(
                  comment.createdAt?.toDate ? comment.createdAt.toDate() : new Date(comment.createdAt),
                  { addSuffix: true }
                )}
              </span>
              {comment.edited && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
            </div>

            {/* Comment HTML content */}
            <div 
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />

            {/* Delete confirmation */}
            {isDeleting && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Delete this comment?</span>
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
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Actions (visible on hover) */}
          {isAuthor && !isDeleting && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditComment(comment)}
                className="h-7 px-2"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirm(comment.id)}
                className="h-7 px-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-lg bg-gray-50">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-white rounded-t-lg">
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-sm">Comments</span>
            {commentCount > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                {commentCount}
              </Badge>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Comments Section */}
      {isExpanded && (
        <div className="p-4">
          {/* Comments List */}
          {loadingComments ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : comments.length > 0 ? (
            <ScrollArea className="max-h-80">
              <div className="space-y-4">
                {comments.map(renderComment)}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No comments yet</p>
              <p className="text-xs mt-1">Be the first to comment</p>
            </div>
          )}

          {/* Add/Edit Comment Form */}
          {showEditor ? (
            <div className="mt-4 border-t pt-4">
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  {editingComment ? 'Edit Comment' : 'Add Comment'}
                </h4>
              </div>
              
              {/* Quill Editor */}
              <div className="border rounded-md" style={{ minHeight: '150px' }}>
                <QuillEditor
                  ref={editorRef}
                  initialContent={commentContent}
                  onContentChange={setCommentContent}
                  hideSaveButton={true}
                  fixedHeight="150px"
                  placeholder="Write your comment..."
                />
              </div>

              {/* Actions */}
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveComment}
                  disabled={saving || !commentContent.trim()}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3 mr-1" />
                      {editingComment ? 'Update' : 'Post'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddComment}
                className="w-full"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Comment
              </Button>
            </div>
          )}
        </div>
      )}
      <DevFileIndicator fileName="PortfolioComments.js" />
    </div>
  );
};

export default PortfolioComments;