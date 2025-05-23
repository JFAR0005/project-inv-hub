
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{note.title}</h2>
          {note.company_name && note.company_name !== 'No company' && (
            <p className="text-muted-foreground">
              Company: {note.company_name}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Badge className={getVisibilityColor(note.visibility)}>
            {note.visibility.charAt(0).toUpperCase() + note.visibility.slice(1)}
          </Badge>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="whitespace-pre-wrap">
        {note.content}
      </div>
      
      {note.file_url && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Attached File</h3>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <a 
              href={note.file_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline flex items-center"
            >
              View attachment <ExternalLink className="ml-1 h-3 w-3" />
            </a>
            <a 
              href={note.file_url} 
              download 
              className="text-blue-600 hover:underline flex items-center"
            >
              Download <Download className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      )}
      
      <div className="text-sm text-muted-foreground pt-4 border-t">
        <div>Created by {note.author_name} on {format(new Date(note.created_at), 'PPP')}</div>
        {note.updated_at && note.updated_at !== note.created_at && (
          <div>Updated on {format(new Date(note.updated_at), 'PPP')}</div>
        )}
      </div>
    </div>
  );
};

export default NoteDetail;
