import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { AlertTriangle } from 'lucide-react';
import { Button } from "../components/ui/button";
import { getDatabase, ref, update, get, query, orderByChild, equalTo } from 'firebase/database';

const AsnIssuesDialog = ({ 
  isOpen, 
  onOpenChange, 
  asn, 
  emailKeys,
  studentKey,
  studentEmail
}) => {
    const handleAssignAsn = async () => {
        if (!asn || !studentKey || !studentEmail) return;
      
        const db = getDatabase();
        
        try {
          // 1. Update ASN emailKeys
          const asnRef = ref(db, `ASNs/${asn}/emailKeys`);
          const emailUpdates = emailKeys.reduce((acc, email) => {
            acc[email] = email === studentKey;
            return acc;
          }, {});
          await update(asnRef, emailUpdates);
      
          // 2. Find and update all PASI records with matching ASN
          const pasiRef = ref(db, 'pasiRecords');
          const pasiQuery = query(pasiRef, orderByChild('asn'), equalTo(asn));
          
          const snapshot = await get(pasiQuery);
          if (snapshot.exists()) {
            const updates = {};
            snapshot.forEach((child) => {
              updates[`pasiRecords/${child.key}/email`] = studentEmail;
            });
            
            if (Object.keys(updates).length > 0) {
              await update(ref(db), updates);
            }
          }
        } catch (error) {
          console.error("Error updating ASN and PASI records:", error);
        } finally {
          onOpenChange(false);
        }
      };

  // Show different content based on emailKeys
  if (!emailKeys || emailKeys.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              ASN Issue
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              There is an issue with this student's ASN. The ASN is either missing or in an incorrect format.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Multiple ASN Assignments
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">ASN: {asn}</h3>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Currently Assigned To:</h4>
            <ul className="space-y-1">
              {emailKeys.map((email, index) => (
                <li 
                  key={index} 
                  className={`text-sm ${email === studentKey ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
                >
                  • {email.replace(/,/g, '.')}
                  {email === studentKey && " (current student)"}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex justify-end">
          <Button
  onClick={(e) => {
    e.stopPropagation();
    handleAssignAsn();
  }}
  className="bg-blue-600 hover:bg-blue-700 text-white"
>
  Assign ASN to Current Student
</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AsnIssuesDialog;