// ConfirmationDialog.jsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <p>{message}</p>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ConfirmationDialog;