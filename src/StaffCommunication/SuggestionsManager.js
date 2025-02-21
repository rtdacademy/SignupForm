// SuggestionsManager.js
import React, { useState, useEffect, useRef } from 'react';
import { toast, Toaster } from "sonner";
import { getDatabase, ref, push, update, onValue, off } from 'firebase/database';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import QuillEditor from './QuillEditor'; // Your existing QuillEditor component

const SuggestionsManager = ({ currentUser }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const quillRef = useRef(null);

  const [newSuggestion, setNewSuggestion] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  const statusOptions = [
    { value: 'all', label: 'All Suggestions' },
    { value: 'pending', label: 'Pending' },
    { value: 'inProgress', label: "In Progress" },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  useEffect(() => {
    const db = getDatabase();
    const suggestionsRef = ref(db, 'suggestions');
    
    onValue(suggestionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const suggestionsArray = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setSuggestions(suggestionsArray.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ));
      }
    });

    return () => off(suggestionsRef);
  }, []);

  const handleSubmitSuggestion = async () => {
    try {
      if (!newSuggestion.title.trim()) {
        toast.error("Please enter a title for the suggestion");
        return;
      }

      const db = getDatabase();
      const suggestionsRef = ref(db, 'suggestions');
      
      const newSuggestionData = {
        ...newSuggestion,
        status: 'pending',
        createdBy: currentUser.email,
        createdAt: new Date().toISOString(),
        comments: [],
        updates: []
      };

      await push(suggestionsRef, newSuggestionData);

      toast.success("Suggestion submitted successfully");
      setIsAddingNew(false);
      setNewSuggestion({ title: '', description: '', priority: 'medium' });
    } catch (error) {
      toast.error("Failed to submit suggestion");
      console.error(error);
    }
  };

  const handleStatusUpdate = async (suggestionId, newStatus) => {
    try {
      const db = getDatabase();
      const suggestionRef = ref(db, `suggestions/${suggestionId}`);
      
      const update = {
        status: newStatus,
        updatedBy: currentUser.email,
        updatedAt: new Date().toISOString()
      };

      await update(suggestionRef, update);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const addComment = async (suggestionId, content) => {
    try {
      const db = getDatabase();
      const commentsRef = ref(db, `suggestions/${suggestionId}/comments`);
      
      const newComment = {
        content,
        createdBy: currentUser.email,
        createdAt: new Date().toISOString()
      };

      await push(commentsRef, newComment);
      toast.success("Comment added successfully");
    } catch (error) {
      toast.error("Failed to add comment");
      console.error(error);
    }
  };

  const filteredSuggestions = suggestions
    .filter(suggestion => 
      filterStatus === 'all' || suggestion.status === filterStatus
    )
    .filter(suggestion =>
      suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
     
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Suggestions</h1>
        <Button onClick={() => setIsAddingNew(true)}>
          Add New Suggestion
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Select
          value={filterStatus}
          onValueChange={setFilterStatus}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Search suggestions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
      </div>

      <div className="space-y-4">
        {filteredSuggestions.map(suggestion => (
          <Card 
            key={suggestion.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedSuggestion(suggestion);
              setIsViewingDetails(true);
            }}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{suggestion.title}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{suggestion.status}</Badge>
                    <Badge className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority}
                    </Badge>
                  </div>
                </div>
                {currentUser.isAdmin && (
                  <Select
                    value={suggestion.status}
                    onValueChange={(value) => {
                      handleStatusUpdate(suggestion.id, value);
                      event.stopPropagation();
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions
                        .filter(option => option.value !== 'all')
                        .map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                Submitted by {suggestion.createdBy} on{' '}
                {new Date(suggestion.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Suggestion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Suggestion Title"
              value={newSuggestion.title}
              onChange={(e) => setNewSuggestion({
                ...newSuggestion,
                title: e.target.value
              })}
            />
            
            <div className="h-[400px]">
              <QuillEditor
                ref={quillRef}
                initialContent={newSuggestion.description}
                onChange={(content) => setNewSuggestion({
                  ...newSuggestion,
                  description: content
                })}
              />
            </div>

            <Select
              value={newSuggestion.priority}
              onValueChange={(value) => setNewSuggestion({
                ...newSuggestion,
                priority: value
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitSuggestion}>
                Submit Suggestion
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          {selectedSuggestion && (
            <ScrollArea className="h-full">
              <DialogHeader>
                <DialogTitle>{selectedSuggestion.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedSuggestion.status}</Badge>
                  <Badge className={getPriorityColor(selectedSuggestion.priority)}>
                    {selectedSuggestion.priority}
                  </Badge>
                </div>
                
                <div className="prose max-w-none" 
                  dangerouslySetInnerHTML={{ __html: selectedSuggestion.description }} 
                />

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Comments</h3>
                  {selectedSuggestion.comments && Object.entries(selectedSuggestion.comments).map(([id, comment]) => (
                    <div key={id} className="mb-4 bg-gray-50 p-3 rounded">
                      <div dangerouslySetInnerHTML={{ __html: comment.content }} />
                      <div className="text-sm text-gray-500 mt-1">
                        {comment.createdBy} - {new Date(comment.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4">
                    <QuillEditor
                      ref={quillRef}
                      initialContent=""
                      onSave={(content) => addComment(selectedSuggestion.id, content)}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuggestionsManager;