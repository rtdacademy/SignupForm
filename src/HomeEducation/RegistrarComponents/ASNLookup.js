// Placeholder component - ASN lookup will be done directly in PASI
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const ASNLookup = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ASN Lookup</DialogTitle>
        </DialogHeader>
        <div className="text-center py-8 text-gray-500">
          ASN lookup should be done directly in the PASI system
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ASNLookup;