import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '../../components/ui/sheet';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import EntryCommunication from './EntryCommunication';
import { useCommunication } from '../hooks/useCommunication';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '../../components/ui/button';

const CommunicationSheet = ({
  entryId,
  entryTitle,
  familyId,
  studentId,
  trigger,
  onOpenChange,
  isOpen = false
}) => {
  const [open, setOpen] = useState(isOpen);
  const [communicationSummary, setCommunicationSummary] = useState(null);

  // Use the communication hook
  const {
    messages = [],
    loadingMessages = false,
    sendMessage,
    addScore,
    markAsRead,
    markAllAsRead,
    getEntryCommunicationSummary,
    unreadByEntry = {}
  } = useCommunication(
    familyId,
    studentId,
    entryId
  );

  const unreadCount = entryId ? (unreadByEntry[entryId] || 0) : 0;

  // Load communication summary
  useEffect(() => {
    if (entryId && getEntryCommunicationSummary) {
      getEntryCommunicationSummary(entryId)
        .then(setCommunicationSummary)
        .catch(console.error);
    }
  }, [entryId, getEntryCommunicationSummary]);

  // Mark all as read when sheet opens
  useEffect(() => {
    if (open && unreadCount > 0 && markAllAsRead) {
      markAllAsRead(entryId);
    }
  }, [open, unreadCount, markAllAsRead, entryId]);

  // Sync internal state with external control
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {trigger && (
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
      )}

      <SheetContent
        side="right"
        className="w-full sm:w-[500px] lg:w-[600px] p-0 flex flex-col h-screen"
      >
        <SheetHeader className="px-4 py-2 border-b bg-gradient-to-r from-blue-50 to-green-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-600" />
            <div>
              <SheetTitle className="text-sm font-semibold">
                Parent-Facilitator Communication
              </SheetTitle>
              {entryTitle && (
                <SheetDescription className="text-xs">
                  {entryTitle}
                </SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Remove ScrollArea wrapper and let EntryCommunication handle its own scrolling */}
        <div className="flex-1 overflow-hidden px-3 py-2">
          <EntryCommunication
            entryId={entryId}
            messages={messages}
            loadingMessages={loadingMessages}
            onSendMessage={sendMessage}
            onAddScore={addScore}
            onMarkAsRead={markAsRead}
            unreadCount={unreadCount}
            collapsed={false}
            onToggle={() => {}}
            entryTitle={entryTitle}
            isEditMode={false}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommunicationSheet;