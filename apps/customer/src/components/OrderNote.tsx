import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { NoteBottomSheet } from '../components/NoteBottomSheet';
import { useIsMobile } from '../components/ui/use-mobile';
import { FileText, X, Check, Edit2, Trash2 } from 'lucide-react';

interface OrderNoteProps {
  note: string;
  onSave: (note: string) => void;
  vendorName?: string;
}

export function OrderNote({ note, onSave, vendorName }: OrderNoteProps) {
  const isMobile = useIsMobile();
  const [showSheet, setShowSheet] = useState(false);
  
  // Desktop State
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempNote, setTempNote] = useState(note);

  // Sync temp note when prop changes
  useEffect(() => {
    setTempNote(note);
  }, [note]);

  const handleSave = () => {
    onSave(tempNote);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setTempNote(note); // Revert
    setIsExpanded(false);
  };

  const handleRemove = () => {
     onSave(""); // Clear note
     setTempNote("");
  };

  const handleEditClick = () => {
    if (isMobile) {
      setShowSheet(true);
    } else {
      setIsExpanded(true);
    }
  };

  const MobileSheet = isMobile ? (
      <NoteBottomSheet 
          isOpen={showSheet} 
          onClose={() => setShowSheet(false)} 
          onSave={onSave} 
          initialNote={note} 
      />
  ) : null;

  // State 1: Note Exists - Show Preview & Actions (Unified for Mobile & Desktop)
  if (note && !isExpanded) {
      return (
          <>
            {MobileSheet}
            {/* Desktop: Force 50% width using JavaScript style override for guaranteed behavior */}
            <div 
                className="flex items-center gap-2 group w-full"
                style={{ width: isMobile ? '100%' : '50%' }}
            >
                <div className="bg-gutzo-primary/5 border border-gutzo-primary/20 rounded-xl px-3 py-2 flex items-center gap-3 text-sm w-full">
                    <FileText className="w-4 h-4 text-gutzo-primary flex-shrink-0" />
                    <span className="text-gray-700 font-medium flex-1 truncate" title={note}>
                        {note}
                    </span>
                    
                    <div className="h-4 w-px bg-gutzo-primary/20 mx-1 flex-shrink-0"></div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button 
                          onClick={handleEditClick}
                          className="p-1 hover:bg-gutzo-primary/10 rounded-full text-gutzo-primary transition-colors"
                          title="Edit Note"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={handleRemove}
                          className="p-1 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove Note"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
          </>
      );
  }

  // State 2: Expanded (Desktop Editing / Mobile Sheet Trigger fallback)
  // If isMobile, we shouldn't be in isExpanded state unless we want inline editing on mobile (which we don't, we use Sheet).
  // But for the initial "Add Note" button, we can share logic or separate.
  
  if (isMobile) {
       return (
          <>
            {MobileSheet}
            <Button 
                variant="outline" 
                onClick={() => setShowSheet(true)}
                className="text-xs h-9 px-3 whitespace-nowrap border-gray-200 rounded-xl gap-2 text-gray-600 font-normal hover:border-gray-300 bg-white"
            >
                <FileText className="w-4 h-4 text-gray-400" /> 
                Add a note for {vendorName}
            </Button>
          </>
       );
  }

  // Desktop Expanded State
  if (isExpanded) {
      return (
        <div className="flex flex-col gap-2 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <Textarea
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
                placeholder="e.g. Less spicy, extra sauce..."
                className="min-h-[80px] text-sm bg-white border-gutzo-primary/30 focus:border-gutzo-primary focus:ring-1 focus:ring-gutzo-primary/20 rounded-xl resize-none"
                autoFocus
            />
            <div className="flex gap-2">
                <Button 
                    size="sm" 
                    onClick={handleSave}
                    className="h-8 bg-gutzo-primary hover:bg-gutzo-primary-hover text-white rounded-lg px-4"
                >
                    Save
                </Button>
                <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleCancel}
                    className="h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                    Cancel
                </Button>
            </div>
        </div>
      );
  }

  // Desktop Empty State
  return (
      <Button 
        variant="outline" 
        onClick={() => setIsExpanded(true)}
        className="text-xs h-9 px-3 whitespace-nowrap border-gray-200 rounded-xl gap-2 text-gray-600 font-normal hover:border-gray-300 bg-white hover:bg-gray-50 transition-all"
      >
         <FileText className="w-4 h-4 text-gray-400" /> 
         Add a note for {vendorName}
      </Button>
  );
}
