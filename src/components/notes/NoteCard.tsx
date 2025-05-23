
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';

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

interface NoteCardProps {
  note: Note;
  onClick: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
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
    <Card 
      className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(note)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="leading-tight">{note.title}</CardTitle>
          <Badge className={getVisibilityColor(note.visibility)}>
            {note.visibility.charAt(0).toUpperCase() + note.visibility.slice(1)}
          </Badge>
        </div>
        {note.company_name && note.company_name !== 'No company' && (
          <div className="text-sm text-muted-foreground">
            Company: {note.company_name}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <div className="text-sm line-clamp-6">
          {note.content}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 text-xs text-muted-foreground border-t">
        <div>
          By: {note.author_name}
        </div>
        <div className="flex items-center">
          {note.file_url && (
            <FileText className="h-3 w-3 mr-1" />
          )}
          {format(new Date(note.created_at), 'MMM d, yyyy')}
        </div>
      </CardFooter>
    </Card>
  );
};

export default NoteCard;
