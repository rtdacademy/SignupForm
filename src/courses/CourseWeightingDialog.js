import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";

const CourseWeightingDialog = ({ 
  courseId,
  courseUnits, 
  courseWeights,
  onWeightsUpdate,
  isEditing 
}) => {
  const [categoryWeights, setCategoryWeights] = useState({
    lesson: 20,
    assignment: 20,
    exam: 60
  });
  
  const [itemWeights, setItemWeights] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [validationState, setValidationState] = useState({
    categoryTotal: 100,
    itemTotal: 100,
    isValid: true,
    message: ""
  });

  // Load initial weights from Firebase and round them
  useEffect(() => {
    if (courseWeights && isOpen) {
      setCategoryWeights({
        lesson: Math.round(courseWeights.lesson * 100),
        assignment: Math.round(courseWeights.assignment * 100),
        exam: Math.round(courseWeights.exam * 100)
      });
    }
  }, [courseWeights, isOpen]);

  const getCounts = () => {
    const counts = { lesson: 0, assignment: 0, exam: 0 };
    courseUnits.forEach(unit => {
      unit.items?.forEach(item => {
        if (counts.hasOwnProperty(item.type)) {
          counts[item.type]++;
        }
      });
    });
    return counts;
  };

  const distributeWeights = () => {
    const counts = getCounts();
    const newItemWeights = {};
    
    courseUnits.forEach(unit => {
      unit.items?.forEach(item => {
        if (categoryWeights.hasOwnProperty(item.type)) {
          const weight = (categoryWeights[item.type] / counts[item.type]);
          newItemWeights[`${unit.sequence}-${item.sequence}`] = weight;
        }
      });
    });

    setItemWeights(newItemWeights);
    validateWeights(categoryWeights, newItemWeights);
  };

  const validateWeights = (catWeights = categoryWeights, itemW = itemWeights) => {
    const categoryTotal = Object.values(catWeights).reduce((a, b) => a + b, 0);
    const itemTotal = Object.values(itemW).reduce((a, b) => a + b, 0);
    
    let message = "";
    let isValid = true;

    if (categoryTotal !== 100) {
      message = `Category weights sum to ${categoryTotal}% (should be 100%)`;
      isValid = false;
    }

    if (Math.abs(itemTotal - 100) > 0.1) {
      message = message ? `${message}. Item weights sum to ${itemTotal.toFixed(1)}%` 
                       : `Item weights sum to ${itemTotal.toFixed(1)}% (should be 100%)`;
      isValid = false;
    }

    setValidationState({
      categoryTotal,
      itemTotal,
      isValid,
      message
    });

    return isValid;
  };

  const handleCategoryWeightChange = (category, value) => {
    const numValue = parseFloat(value) || 0;
    const newCategoryWeights = {
      ...categoryWeights,
      [category]: numValue
    };
    setCategoryWeights(newCategoryWeights);
    validateWeights(newCategoryWeights, itemWeights);
  };

  const handleItemWeightChange = (itemKey, value, type) => {
    // Only allow weight changes for assignments and exams
    if (type === 'lesson') return;

    const numValue = parseFloat(value) || 0;
    const newItemWeights = {
      ...itemWeights,
      [itemKey]: numValue
    };
    setItemWeights(newItemWeights);
    validateWeights(categoryWeights, newItemWeights);
  };

  const handleApplyWeights = () => {
    if (!validateWeights()) return;
    
    // Convert category weights back to decimals for Firebase
    const categoryWeightsForFirebase = {
      lesson: categoryWeights.lesson / 100,
      assignment: categoryWeights.assignment / 100,
      exam: categoryWeights.exam / 100
    };

    const updatedUnits = courseUnits.map(unit => ({
      ...unit,
      items: unit.items?.map(item => ({
        ...item,
        weight: (itemWeights[`${unit.sequence}-${item.sequence}`] || 0) / 100
      }))
    }));

    onWeightsUpdate(categoryWeightsForFirebase, updatedUnits);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      distributeWeights();
    }
  }, [isOpen, categoryWeights]);

  const getItemsByType = () => {
    const grouped = { lesson: [], assignment: [], exam: [] };
    courseUnits.forEach(unit => {
      unit.items?.forEach(item => {
        if (grouped.hasOwnProperty(item.type)) {
          grouped[item.type].push({
            unit,
            item,
            weight: itemWeights[`${unit.sequence}-${item.sequence}`] || 0
          });
        }
      });
    });
    return grouped;
  };

  const itemsByType = getItemsByType();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={!isEditing}>
          Manage Course Weights
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Course Weighting Configuration</DialogTitle>
          <DialogDescription>
            Set weights for each category and individual items. Weights must sum to 100%.
            Note: Individual lesson weights are automatically distributed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Weights */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Category Weights</h3>
              <Badge variant={validationState.isValid ? "success" : "destructive"}>
                Total: {validationState.categoryTotal}%
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(categoryWeights).map(([category, weight]) => (
                <div key={category}>
                  <label className="block text-sm font-medium mb-1 capitalize">
                    {category}
                  </label>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => handleCategoryWeightChange(category, e.target.value)}
                    step="1"
                    min="0"
                    max="100"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Validation Message */}
          {!validationState.isValid && (
            <Alert variant="destructive">
              <AlertDescription>{validationState.message}</AlertDescription>
            </Alert>
          )}

          {/* Individual Item Weights */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Individual Item Weights</h3>
              <Badge variant={Math.abs(validationState.itemTotal - 100) <= 0.1 ? "success" : "destructive"}>
                Total: {validationState.itemTotal.toFixed(1)}%
              </Badge>
            </div>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <Accordion type="single" collapsible className="space-y-2">
                {Object.entries(itemsByType).map(([type, items]) => items.length > 0 && (
                  <AccordionItem key={type} value={type}>
                    <AccordionTrigger className="capitalize">
                      {type}s ({items.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        {items.map(({ unit, item }) => (
                          <div key={`${unit.sequence}-${item.sequence}`} className="flex items-center space-x-2">
                            <span className="text-sm flex-grow">
                              Unit {unit.sequence} - {item.title}
                            </span>
                            <Input
                              type="number"
                              className="w-24"
                              value={itemWeights[`${unit.sequence}-${item.sequence}`] || 0}
                              onChange={(e) => handleItemWeightChange(
                                `${unit.sequence}-${item.sequence}`, 
                                e.target.value,
                                item.type
                              )}
                              disabled={item.type === 'lesson'}
                              step="0.1"
                              min="0"
                              max="100"
                            />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleApplyWeights}
            disabled={!validationState.isValid}
          >
            Apply Weights
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CourseWeightingDialog;
