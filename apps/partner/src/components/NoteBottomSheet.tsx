import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface NoteBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  initialNote?: string;
}

export function NoteBottomSheet({ isOpen, onClose, onSave, initialNote = "" }: NoteBottomSheetProps) {
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    if (isOpen) {
        setNote(initialNote);
    }
  }, [isOpen, initialNote]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="w-full max-w-none rounded-t-3xl px-6 pb-8 pt-6 border-t-0">
        <style>{`
          [data-slot="sheet-content"] > button[class*="absolute"] {
            display: none !important;
          }
        `}</style>
        <SheetHeader className="mb-4 text-left">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-gray-900">Add Cooking Instructions</SheetTitle>
            <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors -mr-2"
            >
                <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </SheetHeader>
        <div className="space-y-4">
          <Textarea
             placeholder="e.g. Less spicy, extra sauce, allergies..."
             value={note}
             onChange={(e) => setNote(e.target.value)}
             className="min-h-[150px] resize-none text-base p-4 bg-gray-50 border-gray-200 focus:border-gutzo-primary ring-offset-0 focus-visible:ring-0 rounded-xl"
             autoFocus
          />
          <div className="pt-2">
            <Button 
                className="w-full bg-gutzo-primary hover:bg-gutzo-primary-hover text-white h-12 rounded-xl text-base font-semibold shadow-lg shadow-gutzo-primary/20 active:scale-95 transition-all"
                onClick={() => {
                    onSave(note);
                    onClose();
                }}
            >
                Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
