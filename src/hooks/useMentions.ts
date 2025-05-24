
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MentionNotification {
  id: string;
  mentioned_user_id: string;
  mentioning_user_id: string;
  content: string;
  context_type: 'comment' | 'note' | 'update';
  context_id: string;
  created_at: string;
  is_read: boolean;
}

export const useMentions = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [mentions, setMentions] = useState<MentionNotification[]>([]);

  // Fetch team members for @mention suggestions
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .neq('id', user.id);
        
      if (!error && data) {
        setTeamMembers(data);
      }
    };

    fetchTeamMembers();
  }, [user]);

  // Parse @mentions from text
  const parseMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(match => match.substring(1)) : [];
  };

  // Create mention notifications
  const createMentions = async (
    content: string, 
    contextType: 'comment' | 'note' | 'update',
    contextId: string
  ) => {
    if (!user) return;

    const mentionedNames = parseMentions(content);
    const mentionedUsers = teamMembers.filter(member => 
      mentionedNames.some(name => 
        member.name.toLowerCase().includes(name.toLowerCase()) ||
        member.email.toLowerCase().includes(name.toLowerCase())
      )
    );

    for (const mentionedUser of mentionedUsers) {
      await supabase.from('mention_notifications').insert({
        mentioned_user_id: mentionedUser.id,
        mentioning_user_id: user.id,
        content: content.substring(0, 100),
        context_type: contextType,
        context_id: contextId,
        is_read: false
      });
    }
  };

  // Get mentions for current user
  const fetchMentions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('mention_notifications')
      .select(`
        *,
        mentioning_user:users!mention_notifications_mentioning_user_id_fkey(name, email)
      `)
      .eq('mentioned_user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMentions(data);
    }
  };

  // Mark mention as read
  const markMentionRead = async (mentionId: string) => {
    await supabase
      .from('mention_notifications')
      .update({ is_read: true })
      .eq('id', mentionId);
    
    setMentions(prev => prev.map(m => 
      m.id === mentionId ? { ...m, is_read: true } : m
    ));
  };

  return {
    teamMembers,
    mentions,
    parseMentions,
    createMentions,
    fetchMentions,
    markMentionRead
  };
};
