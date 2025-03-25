import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Checkbox } from "../components/ui/checkbox";
import { FileDown, GripVertical } from 'lucide-react';
import { CSVLink } from 'react-csv';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ id, label, checked, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center space-x-2 py-2 px-2 bg-white rounded-md border border-transparent hover:border-gray-200"
    >
      <button
        className="cursor-grab hover:text-gray-700 touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </button>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onToggle}
      />
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none"
      >
        {label}
      </label>
    </div>
  );
};

const CustomCSVExport = ({ isOpen, onClose, data }) => {
    const [columns, setColumns] = useState([
        // Personal Information
        { key: 'lname', label: 'Last Name' },
        { key: 'fname', label: 'First Name' },
        { key: 'email', label: 'Email' },
        { key: 'Status_Value', label: 'Status' },
        { key: 'course', label: 'Course' },
        { key: 'StudentPhone', label: 'Student Phone' },
        { key: 'School_x0020_Year_Value', label: 'School Year' },
        { key: 'asn', label: 'ASN' },
        
      
        { key: 'pemail', label: 'Parent Email' },
        { key: 'ParentPhone_x0023_', label: 'Parent Phone' },
        
       
        { key: 'section', label: 'Section' },
        
        { key: 'DiplomaMonthChoices_Value', label: 'Diploma Month' },
        { key: 'studenttype', label: 'Student Type' },
        { key: 'LMSStudentID', label: 'LMS ID' },
        
        // Schedule Information
        { key: 'starting', label: 'Start Date' },
        { key: 'ending', label: 'End Date' },
        { key: 'lastUpdated', label: 'Last Updated' },
        
        // Teacher Information
        { key: 'teacherFirstName', label: 'Teacher First Name' },
        { key: 'teacherLastName', label: 'Teacher Last Name' },
        { key: 'teacherEmail', label: 'Teacher Email' },
        
        // System Fields (at bottom)
        { key: 'username', label: 'Username' },
        { key: 'password', label: 'Password' },
        { key: 'courseid', label: 'Course ID' }
      ]);
      
      // Also update the initial selected fields
      const [selectedFields, setSelectedFields] = useState(new Set(['lname', 'fname', 'email', 'Status_Value', 'course', 'StudentPhone', 'School_x0020_Year_Value']));


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex(item => item.key === active.id);
        const newIndex = items.findIndex(item => item.key === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleField = (field) => {
    const newSelectedFields = new Set(selectedFields);
    if (newSelectedFields.has(field)) {
      newSelectedFields.delete(field);
    } else {
      newSelectedFields.add(field);
    }
    setSelectedFields(newSelectedFields);
  };

  const selectAll = () => {
    setSelectedFields(new Set(columns.map(col => col.key)));
  };

  const deselectAll = () => {
    setSelectedFields(new Set());
  };

  const getFilteredData = () => {
    return data.map(item => {
      const filteredItem = {};
      // Use the columns array order for the CSV
      columns.forEach(col => {
        if (selectedFields.has(col.key)) {
          filteredItem[col.key] = item[col.key];
        }
      });
      return filteredItem;
    });
  };

  const getSelectedHeaders = () => {
    return columns
      .filter(col => selectedFields.has(col.key))
      .map(col => ({
        label: col.label,
        key: col.key
      }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize CSV Export</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-end space-x-2 mb-4">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll}>
            Deselect All
          </Button>
        </div>

        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={columns.map(col => col.key)}
                strategy={verticalListSortingStrategy}
              >
                {columns.map((column) => (
                  <SortableItem
                    key={column.key}
                    id={column.key}
                    label={column.label}
                    checked={selectedFields.has(column.key)}
                    onToggle={() => toggleField(column.key)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="default"
            disabled={selectedFields.size === 0}
            asChild
          >
            <CSVLink
              data={getFilteredData()}
              headers={getSelectedHeaders()}
              filename={`student-export-${new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }).replace(/[/:,\s]/g, '-')}.csv`}
              onClick={onClose}
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export Selected Fields
            </CSVLink>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomCSVExport;