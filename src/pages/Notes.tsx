
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotesView from '@/components/notes/NotesView';
import NoteForm from '@/components/notes/NoteForm';

interface Note {
  id: string;
  title: string;
  content: string;
  company_id?: string;
  visibility: 'private' | 'team' | 'shared';
  author_id: string;
  created_at: string;
  updated_at: string;
}

const Notes = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsCreating(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsCreating(true);
  };

  const handleCloseForm = () => {
    setSelectedNote(null);
    setIsCreating(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">All Notes</TabsTrigger>
          {isCreating && (
            <TabsTrigger value="form">
              {selectedNote ? 'Edit Note' : 'Create Note'}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list">
          <NotesView />
        </TabsContent>

        {isCreating && (
          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedNote ? 'Edit Note' : 'Create New Note'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NoteForm 
                  note={selectedNote}
                  onSave={handleCloseForm}
                  onCancel={handleCloseForm}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Notes;
