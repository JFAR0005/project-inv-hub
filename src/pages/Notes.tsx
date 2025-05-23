
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import NoteEditor from '@/components/notes/NoteEditor';
import NotesView from '@/components/notes/NotesView';
import { supabase } from '@/lib/supabase';

interface Note {
  id: string;
  title: string;
  content: string;
  company_id?: string;
  visibility: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

interface Company {
  id: string;
  name: string;
}

const Notes = () => {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setCurrentView('create');
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setCurrentView('edit');
  };

  const handleSaveNote = () => {
    setCurrentView('list');
    setEditingNote(null);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setEditingNote(null);
  };

  return (
    <Layout>
      {currentView === 'list' && (
        <NotesView
          onCreateNote={handleCreateNote}
          onEditNote={handleEditNote}
        />
      )}
      
      {(currentView === 'create' || currentView === 'edit') && (
        <NoteEditor
          note={editingNote || undefined}
          companies={companies}
          onSave={handleSaveNote}
          onCancel={handleCancel}
        />
      )}
    </Layout>
  );
};

export default Notes;
