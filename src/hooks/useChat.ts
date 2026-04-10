import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export interface ChatConversation {
  id: string;
  user_id: string;
  status: 'open' | 'closed';
  last_message_at: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin';
  content: string;
  is_read: boolean;
  created_at: string;
}

export function useChat() {
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isAdminOnline, setIsAdminOnline] = useState(false);

  // Fetch or create conversation
  const createConversation = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      // 1. Vérifier si une conversation 'open' existe déjà
      const { data: existing, error: fetchError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        setConversation(existing);
      } else {
        // 2. Créer une nouvelle conversation
        const { data: newConv, error: createError } = await supabase
          .from('chat_conversations')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        setConversation(newConv);
      }
    } catch (err) {
      console.error('Erreur createConversation:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch messages and Realtime subscription
  useEffect(() => {
    if (!conversation?.id) {
      setMessages([]);
      return;
    }

    // Charger les messages initiaux
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      setMessages(data ?? []);
    };

    fetchMessages();

    // Realtime
    const channelName = `chat_messages_${conversation.id}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;

          setMessages(prev => {
            // Éviter les doublons
            const exists = prev.some(m => m.id === newMsg.id);
            if (exists) return prev;
            return [...prev, newMsg];
          });

          // Marquer comme lu si c'est un message admin
          if (newMsg.sender_type === 'admin') {
            markAsRead(newMsg.id);
          }
        }
      )
      .subscribe((status) => {
        console.log('Chat realtime:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation?.id]);

  // Marquer un message comme lu
  const markAsRead = async (messageId: string) => {
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('id', messageId);
  };

  // Envoyer un message
  const sendMessage = async (content: string) => {
    if (!user || !conversation || !content.trim()) return;

    try {
      setSending(true);
      
      // 1. Insérer le message
      const { data: newMessage, error: msgError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          sender_type: 'user',
          content: content.trim()
        })
        .select()
        .single();

      if (msgError) throw msgError;

      // Optimistic update
      setMessages(prev => [...prev, newMessage]);

      // 2. Mettre à jour last_message_at
      await supabase
        .from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id);

      // 3. Insérer notification admin
      await supabase.from('admin_notifications').insert({
        type: 'new_message',
        message: `Nouveau message de ${profile?.full_name || user.email}`,
        metadata: {
          conversation_id: conversation.id,
          user_email: user.email
        }
      });

    } catch (err) {
      console.error('Erreur sendMessage:', err);
    } finally {
      setSending(false);
    }
  };

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'admin_online')
        .maybeSingle();

      if (!error && data) {
        setIsAdminOnline(data.value === 'true');
      }
    };

    checkAdminStatus();
    const interval = setInterval(checkAdminStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    conversation,
    messages,
    loading,
    sending,
    isAdminOnline,
    sendMessage,
    createConversation
  };
}
