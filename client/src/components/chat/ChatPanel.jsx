import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../common';
import { format } from 'date-fns';

export default function ChatPanel({ requestId, otherUser, onClose }) {
  const { user } = useAuth();
  const { joinChat, leaveChat, sendMessage, sendTyping, stopTyping, on, connected } = useSocket();

  const storageKey = `fixit_chat_${requestId}`;

  // 1. Initialize from persistent local storage
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(`fixit_chat_${requestId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 2. Join socket room on mount
  useEffect(() => {
    if (!requestId) return;
    joinChat(requestId);
    return () => leaveChat(requestId);
  }, [requestId, joinChat, leaveChat]);

  // 3. Save messages to localStorage whenever they update
  useEffect(() => {
    if (requestId && messages.length > 0) {
      try {
        localStorage.setItem(`fixit_chat_${requestId}`, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save chat to localStorage:', e);
      }
    }
  }, [messages, requestId]);

  // 4. Listen for incoming socket messages and typing events
  useEffect(() => {
    if (!requestId) return;

    const unsub1 = on('chat:message', (data) => {
      if (data.requestId === requestId) {
        setMessages((prev) => {
          // Avoid duplicate if sent by me within 5 seconds with same content
          const isDuplicate = prev.some(
            (m) =>
              (m.id && data.id && m.id === data.id) ||
              (m.senderId === data.senderId &&
                m.message === data.message &&
                Math.abs(new Date(m.timestamp).getTime() - new Date(data.timestamp).getTime()) < 4000)
          );
          if (isDuplicate) return prev;
          const updated = [...prev, data];
          try {
            localStorage.setItem(`fixit_chat_${requestId}`, JSON.stringify(updated));
          } catch {}
          return updated;
        });
        setIsOtherTyping(false);
      }
    });

    const unsub2 = on('chat:typing', (data) => {
      if (data.requestId === requestId && data.userId !== user?.id) {
        setIsOtherTyping(true);
      }
    });

    const unsub3 = on('chat:stop-typing', (data) => {
      if (data.requestId === requestId && data.userId !== user?.id) {
        setIsOtherTyping(false);
      }
    });

    return () => {
      unsub1?.();
      unsub2?.();
      unsub3?.();
    };
  }, [requestId, on, user?.id]);

  // 5. Auto scroll down
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    sendTyping(requestId);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(requestId);
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      senderId: user?.id,
      requestId,
      message: text,
      type: 'text',
      timestamp: new Date().toISOString(),
    };

    // Optimistically add and save immediately so message NEVER disappears
    setMessages((prev) => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem(`fixit_chat_${requestId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    sendMessage(requestId, text);
    setInput('');
    stopTyping(requestId);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#151F32] rounded-2xl border border-surface-200 dark:border-surface-300 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 sm:px-4 py-3 border-b border-surface-200 dark:border-surface-300 bg-surface-50 dark:bg-[#111827] shrink-0">
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-300 transition-colors shrink-0 cursor-pointer"
            aria-label="Close Chat"
          >
            <ArrowLeft className="w-4 h-4 text-surface-500 dark:text-surface-400" />
          </button>
        )}
        <Avatar src={otherUser?.avatarUrl} name={`${otherUser?.firstName || 'User'} ${otherUser?.lastName || ''}`} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-surface-900 truncate">
            {otherUser?.firstName || 'User'} {otherUser?.lastName || ''}
          </p>
          <p className="text-xs font-medium text-surface-500 flex items-center gap-1.5">
            {isOtherTyping ? (
              <span className="text-primary-600 dark:text-primary-400 font-semibold animate-pulse">Typing...</span>
            ) : connected ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active Now</span>
              </>
            ) : (
              <span className="text-surface-400">Live Chat</span>
            )}
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-3.5 space-y-3 bg-surface-50/40 dark:bg-[#0F172A]/50">
        {messages.length === 0 && (
          <div className="text-center py-14 space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto">
              💬
            </div>
            <p className="text-sm font-bold text-surface-800 dark:text-surface-600">No messages yet</p>
            <p className="text-xs text-surface-500 max-w-xs mx-auto">
              Send a message to coordinate with {otherUser?.firstName || 'the technician'}.
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              <div
                className={`
                  max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs
                  ${isMe
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-[#1E293B] text-surface-900 rounded-bl-xs border border-surface-200 dark:border-surface-300'
                  }
                `}
              >
                <p className="break-words font-medium">{msg.message}</p>
                <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-surface-400 dark:text-surface-500'}`}>
                  <span>{format(new Date(msg.timestamp || Date.now()), 'HH:mm')}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-blue-200" />}
                </div>
              </div>
            </div>
          );
        })}

        {isOtherTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white dark:bg-[#1E293B] px-3.5 py-2 rounded-2xl rounded-bl-xs border border-surface-200 dark:border-surface-300 text-xs text-surface-500 flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] font-semibold">{otherUser?.firstName || 'User'} is typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-3.5 sm:px-4 py-3 border-t border-surface-200 dark:border-surface-300 shrink-0 bg-white dark:bg-[#151F32]">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 min-w-0 px-4 py-2.5 bg-surface-50 dark:bg-surface-200 border border-surface-200 dark:border-surface-300 rounded-full text-xs sm:text-sm text-surface-900 placeholder:text-surface-400 dark:placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2.5 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer shadow-xs hover:scale-105 active:scale-95"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
