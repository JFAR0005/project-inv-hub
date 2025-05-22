
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Eye, EyeOff, FileText, Paperclip } from "lucide-react";

export interface NoteAttachment {
  id: string;
  filename: string;
  type: string;
  url: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  companyId?: string;
  companyName?: string;
  tags: string[];
  visibility: "internal" | "partner" | "founder";
  createdAt: Date;
  attachments: NoteAttachment[];
}

interface NoteCardProps {
  note: Note;
  onEdit?: (id: string) => void;
}

export function NoteCard({ note, onEdit }: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);

  const visibilityMap = {
    internal: { label: "Internal Only", icon: EyeOff, color: "bg-yellow-100 text-yellow-800" },
    partner: { label: "Shared with Partners", icon: Eye, color: "bg-blue-100 text-blue-800" },
    founder: { label: "Shared with Founders", icon: Eye, color: "bg-green-100 text-green-800" },
  };

  const { label, icon: VisibilityIcon, color } = visibilityMap[note.visibility];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle>{note.title}</CardTitle>
          <Badge variant="outline" className={`${color}`}>
            <VisibilityIcon className="h-3 w-3 mr-1" />
            {label}
          </Badge>
        </div>
        {note.companyName && (
          <CardDescription>
            Re: {note.companyName}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        <div className={`prose prose-sm max-w-none ${!expanded && 'line-clamp-3'}`}>
          {note.content}
        </div>
        {!expanded && note.content.length > 200 && (
          <Button 
            variant="link" 
            className="p-0 h-auto text-xs mt-1" 
            onClick={() => setExpanded(true)}
          >
            Read more
          </Button>
        )}
        
        {note.attachments.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">Attachments</div>
            <div className="flex flex-wrap gap-2">
              {note.attachments.map(attachment => (
                <Badge key={attachment.id} variant="secondary" className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  {attachment.filename}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {note.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 border-t">
        <div className="flex items-center gap-2">
          {note.author.avatar ? (
            <img 
              src={note.author.avatar} 
              alt={note.author.name} 
              className="w-6 h-6 rounded-full" 
            />
          ) : (
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold text-xs">
                {note.author.name.substring(0, 1).toUpperCase()}
              </span>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            {note.author.name} · {formatDistanceToNow(note.createdAt, { addSuffix: true })}
          </div>
        </div>
        {onEdit && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => onEdit(note.id)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default NoteCard;
