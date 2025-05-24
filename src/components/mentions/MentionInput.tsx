
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useMentions } from '@/hooks/useMentions';
import { User } from 'lucide-react';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onMentionCreate?: (mentionedUserIds: string[]) => void;
}

const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
  onMentionCreate
}) => {
  const { teamMembers } = useMentions();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof teamMembers>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const cursorPos = textarea.selectionStart;
    setCursorPosition(cursorPos);
    
    // Check if we're typing an @mention
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      
      const filteredSuggestions = teamMembers.filter(member =>
        member.name.toLowerCase().includes(query.toLowerCase()) ||
        member.email.toLowerCase().includes(query.toLowerCase())
      );
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (member: typeof teamMembers[0]) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    
    // Remove the partial @mention and replace with full mention
    const mentionStart = textBeforeCursor.lastIndexOf('@');
    const newTextBefore = textBeforeCursor.substring(0, mentionStart);
    const mention = `@${member.name}`;
    const newValue = newTextBefore + mention + ' ' + textAfterCursor;
    
    onChange(newValue);
    setShowSuggestions(false);
    
    // Notify about the mention
    if (onMentionCreate) {
      onMentionCreate([member.id]);
    }
    
    // Set cursor position after the mention
    setTimeout(() => {
      const newCursorPos = newTextBefore.length + mention.length + 1;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
      e.preventDefault();
      // For simplicity, just select the first suggestion on Enter
      if (e.key === 'Enter' && suggestions.length > 0) {
        insertMention(suggestions[0]);
      }
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
      />
      
      {showSuggestions && (
        <Card className="absolute z-10 mt-1 max-h-48 overflow-y-auto bg-white border shadow-lg">
          {suggestions.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => insertMention(member)}
            >
              <User className="h-4 w-4" />
              <div>
                <div className="font-medium">{member.name}</div>
                <div className="text-xs text-gray-500">{member.email}</div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default MentionInput;
