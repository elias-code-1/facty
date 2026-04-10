import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { ChatConversation, ChatMessage } from './useChat';

export interface AdminConversation extends ChatConversation {
  profiles: {
    full_name: string;
    email: string;
  } | null;
  unread_count: number;
  last_message: string;
}

export function useAdminChat() {
  const { user: adminUser } = useAuth();
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const activeConversationRef = useRef<string | null>(null);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Fetch conversations
      const { data: convs, error: convError } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (convError) throw convError;

      // 2. Fetch profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email');

      if (profileError) throw profileError;

      // 3. Fetch all messages to count unread and get last message
      const { data: allMessages, error: msgError } = await supabase
        .from('chat_messages')
        .select('conversation_id, content, created_at, is_read, sender_type')
        .order('created_at', { ascending: false });

      if (msgError) throw msgError;

      // Combine data
      const combined = (convs || []).map(conv => {
        const convMessages = allMessages?.filter(m => m.conversation_id === conv.id) || [];
        return {
          ...conv,
          profiles: profiles?.find(p => p.id === conv.user_id) || null,
          unread_count: convMessages.filter(m => !m.is_read && m.sender_type === 'user').length,
          last_message: convMessages[0]?.content ?? ''
        };
      });

      setConversations(combined);
    } catch (err) {
      console.error('Erreur fetchConversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
      
      // Mark as read
      const unreadIds = data
        .filter(m => m.sender_type === 'user' && !m.is_read)
        .map(m => m.id);
      
      if (unreadIds.length > 0) {
        await supabase
          .from('chat_messages')
          .update({ is_read: true })
          .in('id', unreadIds);
        
        // Refresh conversation list to update unread count
        fetchConversations();
      }
    }
  }, [fetchConversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    } else {
      setMessages([]);
    }
  }, [activeConversation, fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin_chat_global')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          
          // Ajouter au state si conversation active
          if (msg.conversation_id === activeConversationRef.current) {
            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            
            // Mark as read immediately if active
            if (msg.sender_type === 'user') {
              supabase
                .from('chat_messages')
                .update({ is_read: true })
                .eq('id', msg.id);
            }
          }
          
          // Refresh list
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConversations]);

  const sendMessage = async (content: string, conversationId: string) => {
    if (!adminUser || !content.trim() || !conversationId) return;

    try {
      setSending(true);
      const { data: newMessage, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: adminUser.id,
          sender_type: 'admin',
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Optimistic update
      if (activeConversation === conversationId) {
        setMessages(prev => [...prev, newMessage]);
      }

      // Update last_message_at
      await supabase
        .from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      fetchConversations();
    } catch (err) {
      console.error('Erreur sendMessage admin:', err);
    } finally {
      setSending(false);
    }
  };

  const closeConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ status: 'closed' })
        .eq('id', id);

      if (error) throw error;
      fetchConversations();
    } catch (err) {
      console.error('Erreur closeConversation:', err);
    }
  };

  const setAdminOnline = async (online: boolean) => {
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({ 
          key: 'admin_online', 
          value: online ? 'true' : 'false',
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;
    } catch (err) {
      console.error('Erreur setAdminOnline:', err);
    }
  };

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    sending,
    setActiveConversation,
    sendMessage,
    closeConversation,
    setAdminOnline,
    refetch: fetchConversations
  };
}
