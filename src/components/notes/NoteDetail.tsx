
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Note {
  id: string;
  title: string;
  content: string;
  company_id: string | null;
  company_name?: string;
  author_id: string;
  author_name?: string;
  visibility: string;
  file_url?: string | null;
  created_at: string;
  updated_at?: string;
}

interface NoteDetailProps {
  note: Note;
  onClose: () => void;
}

const NoteDetail: React.FC<NoteDetailProps> = ({ note, onClose }) => {
  // Get badge color for visibility
  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'partner': return 'bg-blue-100 text-blue-800';
      case 'founder': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <DialogHeader>
        <div className="flex justify-between items-start">
          <div>
            <DialogTitle className="mb-1">{note.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              {note.company_name && note.company_name !== 'No company' && (
                <span>Company: {note.company_name}</span>
              )}
              <Badge className={getVisibilityColor(note.visibility)}>
                {note.visibility.charAt(0).toUpperCase() + note.visibility.slice(1)}
              </Badge>
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      
      <div className="mt-6">
        <div className="whitespace-pre-wrap bg-muted/30 rounded-md p-4 min-h-[200px]">
          {note.content}
        </div>
      </div>
      
      {note.file_url && (
        <div className="mt-6 border border-border rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              <span className="font-medium">Attachment</span>
            </div>
            <a 
              href={note.file_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center"
            >
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </a>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-sm text-muted-foreground border-t pt-4">
        <div className="flex justify-between">
          <span>Created by {note.author_name} on {format(new Date(note.created_at), 'PPp')}</span>
          {note.updated_at && note.updated_at !== note.created_at && (
            <span>Last updated: {format(new Date(note.updated_at), 'PPp')}</span>
          )}
        </div>
      </div>
    </>
  );
};

export default NoteDetail;
