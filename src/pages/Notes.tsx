
import React, { useState, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import NoteList from '@/components/notes/NoteList';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NoteForm from '@/components/notes/NoteForm';

const Notes = () => {
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const noteListRef = useRef<{ fetchNotes: () => void } | null>(null);
  
  // Function to handle successful note creation
  const handleNoteSuccess = () => {
    setIsNoteDialogOpen(false);
    
    // Refresh the note list
    if (noteListRef.current) {
      noteListRef.current.fetchNotes();
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Notes</h1>
            <p className="text-muted-foreground mt-1">
              Create, manage, and share notes about companies and deals
            </p>
          </div>
          <Button onClick={() => setIsNoteDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Note
          </Button>
        </div>
        
        <NoteList ref={noteListRef} />
        
        {/* Create Note Dialog */}
        <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
          <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
            </DialogHeader>
            <NoteForm onSuccess={handleNoteSuccess} />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Notes;
