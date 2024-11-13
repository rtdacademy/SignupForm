import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set, remove } from 'firebase/database';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Plus, Settings, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { ScrollArea } from "../components/ui/scroll-area";

const SectionPicker = ({ value, onChange, disabled = false }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [newSection, setNewSection] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    const db = getDatabase();
    try {
      const snapshot = await get(ref(db, 'courses/sections'));
      if (snapshot.exists()) {
        const sectionsData = snapshot.val();
        setSections(Object.keys(sectionsData).sort());
      } else {
        setSections([]);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setError('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSection.trim()) return;
    
    const db = getDatabase();
    try {
      await set(ref(db, `courses/sections/${newSection.trim()}`), true);
      await fetchSections();
      setNewSection("");
    } catch (error) {
      console.error('Error adding section:', error);
      setError('Failed to add section');
    }
  };

  const handleDeleteSection = async (sectionToDelete) => {
    const db = getDatabase();
    try {
      await remove(ref(db, `courses/sections/${sectionToDelete}`));
      await fetchSections();
      if (value === sectionToDelete) {
        onChange('');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      setError('Failed to delete section');
    }
  };

  if (loading) {
    return <div className="h-9 bg-gray-100 animate-pulse rounded-md" />;
  }

  return (
    <div className="flex gap-2 items-center">
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select Section" />
        </SelectTrigger>
        <SelectContent>
          {sections.map((section) => (
            <SelectItem 
              key={section} 
              value={section}
            >
              {section}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!disabled && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowManageDialog(true)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}

      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Sections</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddSection} className="flex gap-2 mb-4">
            <Input
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              placeholder="Enter new section name"
              className="flex-1"
            />
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </form>

          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section Name</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => (
                  <TableRow key={section}>
                    <TableCell>{section}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSection(section)}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {sections.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No sections available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManageDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SectionPicker;