import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Loader2 } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { timeAgo } from '../../utils/date';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const { 
    conversation, 
    messages, 
    loading, 
    sending, 
    isAdminOnline, 
    sendMessage, 
    createConversation 
  } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 96)}px`;
    }
  }, [messageInput]);

  const handleOpen = () => {
    setIsOpen(true);
    if (!conversation) {
      createConversation();
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || sending) return;

    const content = messageInput.trim();
    setMessageInput('');
    await sendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const unreadCount = messages.filter(m => m.sender_type === 'admin' && !m.is_read).length;

  return (
    <div className="fixed bottom-6 right-6 z-50 no-print">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className="w-14 h-14 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-all relative"
          >
            <MessageSquare className="text-white" size={24} />
            {unreadCount > 0 && (
              <div className="w-5 h-5 bg-red-500 rounded-full text-white text-[10px] absolute -top-1 -right-1 flex items-center justify-center font-bold border-2 border-white">
                {unreadCount}
              </div>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 w-[calc(100vw-32px)] sm:w-80 h-[70vh] sm:h-[480px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100"
          >
            {/* HEADER */}
            <div className="bg-indigo-600 text-white p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg shadow-inner">
                  F
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Facty Support</h3>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isAdminOnline ? 'bg-green-400 animate-pulse' : 'bg-slate-300'}`} />
                    <span className="text-[10px] opacity-90">
                      {isAdminOnline ? 'En ligne' : 'Répond sous 24h'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="text-indigo-600 animate-spin" size={24} />
                </div>
              ) : messages.length === 0 ? (
                <div className="bg-indigo-50 rounded-2xl p-6 text-center space-y-2">
                  <div className="text-2xl">👋</div>
                  <p className="text-slate-800 font-semibold text-sm">Bonjour !</p>
                  <p className="text-slate-600 text-xs">Comment pouvons-nous vous aider aujourd'hui ?</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex flex-col ${msg.sender_type === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`
                        max-w-[85%] px-4 py-2.5 text-sm shadow-sm
                        ${msg.sender_type === 'user' 
                          ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm' 
                          : 'bg-white text-slate-800 rounded-2xl rounded-bl-sm border border-slate-100'}
                      `}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {timeAgo(msg.created_at)}
                      </span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}

              {conversation?.status === 'closed' && (
                <div className="bg-slate-100 text-slate-500 text-[10px] text-center py-2 rounded-lg font-medium">
                  Cette conversation est fermée
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="p-3 bg-white border-t border-slate-100">
              <form 
                onSubmit={handleSend}
                className="flex items-end gap-2"
              >
                <textarea
                  ref={textareaRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={conversation?.status === 'closed' ? "Conversation fermée" : "Écrire un message..."}
                  disabled={conversation?.status === 'closed' || sending}
                  rows={1}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all max-h-24 disabled:bg-slate-50 disabled:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || sending || conversation?.status === 'closed'}
                  className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-md shadow-indigo-100"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
