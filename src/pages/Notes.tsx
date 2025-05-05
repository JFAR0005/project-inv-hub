
import React from 'react';
import Layout from '@/components/layout/Layout';
import NoteList from '@/components/notes/NoteList';

const Notes = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground mt-1">
            Create, manage, and share notes about companies and deals
          </p>
        </div>
        
        <NoteList />
      </div>
    </Layout>
  );
};

export default Notes;
