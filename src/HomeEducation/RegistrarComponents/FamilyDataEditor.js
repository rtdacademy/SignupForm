import React, { useState } from 'react';
import { getDatabase, ref, update } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FamilyDataEditor = ({ isOpen, onClose, familyData, familyId, studentId, onUpdate }) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const student = familyData?.students?.[studentId];
  const [editedData, setEditedData] = useState({
    student: { ...student },
    family: { familyName: familyData?.familyName || '' }
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const db = getDatabase();
      const updates = {};
      
      // Update student data
      if (editedData.student.asn !== student.asn) {
        updates[`homeEducationFamilies/familyInformation/${familyId}/students/${studentId}/asn`] = editedData.student.asn;
      }
      
      // Update family name if changed
      if (editedData.family.familyName !== familyData.familyName) {
        updates[`homeEducationFamilies/familyInformation/${familyId}/familyName`] = editedData.family.familyName;
      }
      
      // Add update metadata
      updates[`homeEducationFamilies/familyInformation/${familyId}/lastUpdated`] = Date.now();
      updates[`homeEducationFamilies/familyInformation/${familyId}/updatedBy`] = user.uid;
      
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
        toast.success('Changes saved successfully');
        if (onUpdate) onUpdate();
        onClose();
      } else {
        toast.info('No changes to save');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes');
    }
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Registration Data</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student Information</TabsTrigger>
            <TabsTrigger value="family">Family Information</TabsTrigger>
          </TabsList>
          
          <TabsContent value="student" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={editedData.student.firstName}
                  onChange={(e) => setEditedData({
                    ...editedData,
                    student: { ...editedData.student, firstName: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={editedData.student.lastName}
                  onChange={(e) => setEditedData({
                    ...editedData,
                    student: { ...editedData.student, lastName: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>ASN</Label>
                <Input
                  value={editedData.student.asn || ''}
                  onChange={(e) => setEditedData({
                    ...editedData,
                    student: { ...editedData.student, asn: e.target.value }
                  })}
                  placeholder="Enter ASN"
                />
              </div>
              <div>
                <Label>Grade</Label>
                <Input
                  value={editedData.student.grade}
                  onChange={(e) => setEditedData({
                    ...editedData,
                    student: { ...editedData.student, grade: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Birthday</Label>
                <Input
                  type="date"
                  value={editedData.student.birthday}
                  onChange={(e) => setEditedData({
                    ...editedData,
                    student: { ...editedData.student, birthday: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Gender</Label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={editedData.student.gender}
                  onChange={(e) => setEditedData({
                    ...editedData,
                    student: { ...editedData.student, gender: e.target.value }
                  })}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="X">Other</option>
                </select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="family" className="space-y-4">
            <div>
              <Label>Family Name</Label>
              <Input
                value={editedData.family.familyName}
                onChange={(e) => setEditedData({
                  ...editedData,
                  family: { ...editedData.family, familyName: e.target.value }
                })}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FamilyDataEditor;