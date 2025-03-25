import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, update } from 'firebase/database';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { X, Plus } from "lucide-react";
import PhoneInput from "react-phone-input-2";

const GuardianManager = ({ studentKey, readOnly }) => {
    const [guardians, setGuardians] = useState([]);
    const [errors, setErrors] = useState({});
    const [updateError, setUpdateError] = useState(null);
  
    // Email validation regex
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  
    // Fetch existing guardians on component mount
    useEffect(() => {
      const fetchGuardians = async () => {
        const db = getDatabase();
        try {
          const guardiansSnapshot = await get(ref(db, `students/${studentKey}/profile/AdditionalGuardians`));
          const guardiansData = guardiansSnapshot.val() || [];
          setGuardians(guardiansData);
        } catch (error) {
          console.error("Error fetching guardians:", error);
          setUpdateError("Failed to load guardians");
        }
      };
  
      fetchGuardians();
    }, [studentKey]);
  
    // Save guardians to Firebase
    const saveGuardians = async (updatedGuardians) => {
      const db = getDatabase();
      try {
        await update(ref(db), {
          [`students/${studentKey}/profile/AdditionalGuardians`]: updatedGuardians
        });
        setUpdateError(null);
      } catch (error) {
        console.error("Error saving guardians:", error);
        setUpdateError("Failed to save changes");
      }
    };
  
    // Add a new guardian
    const addGuardian = () => {
      const newGuardian = {
        id: Date.now().toString(),
        fullName: '',
        email: '',
        phone: '',
        relationship: ''
      };
      const updatedGuardians = [...guardians, newGuardian];
      setGuardians(updatedGuardians);
      saveGuardians(updatedGuardians);
    };
  
    // Remove a guardian
    const removeGuardian = (guardianId) => {
      const updatedGuardians = guardians.filter(g => g.id !== guardianId);
      setGuardians(updatedGuardians);
      saveGuardians(updatedGuardians);
      // Clear any errors for this guardian
      const newErrors = { ...errors };
      delete newErrors[guardianId];
      setErrors(newErrors);
    };
  
    // Validate and update guardian fields
    const updateGuardian = (guardianId, field, value) => {
      const newErrors = { ...errors };
  
      if (field === 'email') {
        // Convert email to lowercase
        value = value.toLowerCase();
        
        // Validate email format
        if (value && !emailRegex.test(value)) {
          newErrors[guardianId] = {
            ...newErrors[guardianId],
            email: 'Please enter a valid email address'
          };
        } else {
          if (newErrors[guardianId]) {
            delete newErrors[guardianId].email;
            if (Object.keys(newErrors[guardianId]).length === 0) {
              delete newErrors[guardianId];
            }
          }
        }
        setErrors(newErrors);
      }
  
      const updatedGuardians = guardians.map(guardian => 
        guardian.id === guardianId ? { ...guardian, [field]: value } : guardian
      );
      setGuardians(updatedGuardians);
      saveGuardians(updatedGuardians);
    };
  
    return (
      <div className="space-y-4">
        {updateError && (
          <div className="text-sm text-red-500 mb-2">{updateError}</div>
        )}
        
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[#315369]">Additional Guardians</h3>
          {!readOnly && (
            <Button
              onClick={addGuardian}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Guardian
            </Button>
          )}
        </div>

      {guardians.map((guardian) => (
        <Card key={guardian.id} className="bg-white">
          <CardContent className="p-4">
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeGuardian(guardian.id)}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={guardian.fullName}
                  onChange={(e) => updateGuardian(guardian.id, 'fullName', e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={guardian.email}
                  onChange={(e) => updateGuardian(guardian.id, 'email', e.target.value)}
                  className={`bg-white ${errors[guardian.id]?.email ? 'border-red-500' : ''}`}
                />
                {errors[guardian.id]?.email && (
                  <p className="text-sm text-red-500">{errors[guardian.id].email}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Phone</label>
                <PhoneInput
                  country="ca"
                  value={guardian.phone}
                  onChange={(value, _, __, formattedValue) => {
                    updateGuardian(guardian.id, 'phone', formattedValue);
                  }}
                  inputClass="w-full p-2 border rounded-md"
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  preferredCountries={["ca"]}
                  priority={{ ca: 0, us: 1 }}
                  enableSearch={true}
                  searchPlaceholder="Search country..."
                  autoFormat={true}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Relationship</label>
                <Input
                  value={guardian.relationship}
                  onChange={(e) => updateGuardian(guardian.id, 'relationship', e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {guardians.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          No additional guardians added
        </p>
      )}
    </div>
  );
};

export default GuardianManager;