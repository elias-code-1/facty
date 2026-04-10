import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MessageSquare, 
  Send, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft,
  Loader2,
  Inbox
} from 'lucide-react';
import { useAdminChat, AdminConversation } from '../../hooks/useAdminChat';
import { timeAgo } from '../../utils/date';
import Switch from '../../components/ui/Switch';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

export default function AdminChat() {
  const { 
    conversations, 
    activeConversation, 
    messages, 
    loading, 
    sending, 
    setActiveConversation, 
    sendMessage, 
    closeConversation, 
    setAdminOnline 
  } = useAdminChat();

  const [view, setView] = useState<'list' | 'messages'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [messageInput, setMessageInput] = useState('');
  const [isAdminOnline, setIsAdminOnline] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch initial admin status
  useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'admin_online')
        .maybeSingle();
      if (data) setIsAdminOnline(data.value === 'true');
    };
    fetchStatus();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConversation]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [messageInput]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const matchesSearch = 
        conv.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'open' && conv.status === 'open') ||
        (filter === 'closed' && conv.status === 'closed');

      return matchesSearch && matchesFilter;
    });
  }, [conversations, searchQuery, filter]);

  const activeConvData = useMemo(() => 
    conversations.find(c => c.id === activeConversation),
    [conversations, activeConversation]
  );

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeConversation || sending) return;

    const content = messageInput.trim();
    setMessageInput('');
    await sendMessage(content, activeConversation);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToggleOnline = async (val: boolean) => {
    setIsAdminOnline(val);
    await setAdminOnline(val);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-indigo-100 text-indigo-600',
      'bg-emerald-100 text-emerald-600',
      'bg-amber-100 text-amber-600',
      'bg-rose-100 text-rose-600',
      'bg-sky-100 text-sky-600',
      'bg-violet-100 text-violet-600'
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-4 sm:gap-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Live Chat</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {conversations.filter(c => c.status === 'open').length} conversations actives
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm self-start sm:self-auto">
          <span className="text-xs sm:text-sm font-medium text-slate-700">
            Statut : {isAdminOnline ? 'En ligne' : 'Hors ligne'}
          </span>
          <Switch 
            checked={isAdminOnline} 
            onChange={handleToggleOnline}
            colorOn="bg-green-500"
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex">
        
        {/* LEFT COLUMN: Conversations List */}
        <div className={`
          w-full md:w-80 border-r border-slate-200 flex flex-col flex-shrink-0
          ${view === 'messages' ? 'hidden md:flex' : 'flex'}
        `}>
          <div className="p-3 sm:p-4 border-b border-slate-100 space-y-3 sm:space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="flex p-1 bg-slate-50 rounded-lg">
              {(['all', 'open', 'closed'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`
                    flex-1 py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-all
                    ${filter === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                  `}
                >
                  {t === 'all' ? 'Toutes' : t === 'open' ? 'Ouvertes' : 'Fermées'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && conversations.length === 0 ? (
              <div className="p-8 text-center">
                <Loader2 className="animate-spin text-indigo-600 mx-auto mb-2" size={20} />
                <p className="text-[10px] sm:text-xs text-slate-500">Chargement...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <Inbox className="text-slate-300 mx-auto mb-2" size={28} />
                <p className="text-[10px] sm:text-xs text-slate-500">Aucune conversation</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConversation(conv.id);
                    setView('messages');
                  }}
                  className={`
                    flex items-center gap-3 p-3 sm:p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50
                    ${activeConversation === conv.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}
                  `}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0 ${getAvatarColor(conv.user_id)}`}>
                    {getInitials(conv.profiles?.full_name || 'U')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                        {conv.profiles?.full_name || 'Utilisateur'}
                      </h3>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                        {timeAgo(conv.last_message_at || conv.created_at)}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5">
                      {conv.last_message || 'Aucun message'}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-indigo-600 text-white text-[8px] sm:text-[10px] rounded-full flex items-center justify-center font-bold">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Chat Area */}
        <div className={`
          flex-1 flex flex-col bg-slate-50
          ${view === 'list' ? 'hidden md:flex' : 'flex'}
        `}>
          {!activeConvData ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="text-indigo-600" size={28} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-2">Sélectionnez une conversation</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs">
                Choisissez un utilisateur dans la liste de gauche pour commencer à discuter.
              </p>
            </div>
          ) : (
            <>
              {/* CHAT HEADER */}
              <div className="p-3 sm:p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setView('list')}
                    className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-indigo-600 font-medium text-sm"
                  >
                    <ChevronLeft size={20} />
                    Retour
                  </button>
                  <div className={`hidden sm:flex w-10 h-10 rounded-full items-center justify-center font-semibold text-sm ${getAvatarColor(activeConvData.user_id)}`}>
                    {getInitials(activeConvData.profiles?.full_name || 'U')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {activeConvData.profiles?.full_name}
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate">{activeConvData.profiles?.email}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ml-1 ${activeConvData.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                    {activeConvData.status === 'open' ? 'Ouvert' : 'Fermé'}
                  </span>
                </div>

                {activeConvData.status === 'open' && (
                  <button
                    onClick={() => closeConversation(activeConvData.id)}
                    className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium transition-colors p-2"
                  >
                    Fermer
                  </button>
                )}
              </div>

              {/* MESSAGES AREA */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex items-end gap-2 ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender_type === 'user' && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 ${getAvatarColor(msg.sender_id)}`}>
                        {getInitials(activeConvData.profiles?.full_name || 'U')}
                      </div>
                    )}
                    <div className="flex flex-col max-w-[75%]">
                      <div className={`
                        px-4 py-2 text-sm shadow-sm
                        ${msg.sender_type === 'admin' 
                          ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm' 
                          : 'bg-white text-slate-800 rounded-2xl rounded-bl-sm'}
                      `}>
                        {msg.content}
                      </div>
                      <span className={`text-[10px] text-slate-400 mt-1 ${msg.sender_type === 'admin' ? 'text-right' : 'text-left'}`}>
                        {timeAgo(msg.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT AREA */}
              <div className="p-3 bg-white border-t border-slate-200">
                <form 
                  onSubmit={handleSend}
                  className="flex items-end gap-2"
                >
                  <textarea
                    ref={textareaRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={activeConvData.status === 'closed' ? "Conversation fermée" : "Écrire un message..."}
                    disabled={activeConvData.status === 'closed' || sending}
                    rows={1}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all max-h-32 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sending || activeConvData.status === 'closed'}
                    className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
