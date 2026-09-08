import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, ArrowLeft, Check, CheckCheck, Wrench, User, ShieldCheck } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, Badge } from '../common';
import { format } from 'date-fns';

export default function ChatPanel({ requestId, otherUser, customer, technician, onClose }) {
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

  // Derive resolved names and IDs for customer & technician
  const custName = customer
    ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer'
    : (otherUser?.role === 'CUSTOMER' ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() : 'Customer');

  const custId = customer?.id || (otherUser?.role === 'CUSTOMER' ? otherUser.id : null);

  const techName = technician?.user
    ? `${technician.user.firstName || ''} ${technician.user.lastName || ''}`.trim()
    : technician?.firstName
    ? `${technician.firstName} ${technician.lastName || ''}`.trim()
    : (otherUser?.role === 'TECHNICIAN' ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() : 'Technician');

  const techId = technician?.user?.id || technician?.userId || technician?.id || (otherUser?.role === 'TECHNICIAN' ? otherUser.id : null);

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

    const myName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || (user?.role === 'TECHNICIAN' ? 'Technician' : 'Customer');
    const myRole = user?.role || 'CUSTOMER';

    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      senderId: user?.id,
      senderName: myName,
      senderRole: myRole,
      requestId,
      message: text,
      type: 'text',
      timestamp: new Date().toISOString(),
    };

    // Optimistically add and save immediately
    setMessages((prev) => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem(`fixit_chat_${requestId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    sendMessage(requestId, text, 'text', { senderName: myName, senderRole: myRole });
    setInput('');
    stopTyping(requestId);
  };

  // Helper to determine message sender metadata & role badge
  const resolveSender = (msg) => {
    const isMe = Boolean(user?.id && msg.senderId === user?.id);

    let role = msg.senderRole;
    let name = msg.senderName;

    if (isMe) {
      return {
        isMe: true,
        role: user?.role || 'CUSTOMER',
        name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'You',
        isTechnician: user?.role === 'TECHNICIAN',
        isCustomer: user?.role === 'CUSTOMER',
        isAdmin: user?.role === 'ADMIN',
      };
    }

    // Explicit role attached from modern socket payload
    if (role === 'TECHNICIAN') {
      return {
        isMe: false,
        role: 'TECHNICIAN',
        name: name || techName || 'Technician',
        isTechnician: true,
        isCustomer: false,
        isAdmin: false,
      };
    }
    if (role === 'CUSTOMER') {
      return {
        isMe: false,
        role: 'CUSTOMER',
        name: name || custName || 'Customer',
        isTechnician: false,
        isCustomer: true,
        isAdmin: false,
      };
    }
    if (role === 'ADMIN') {
      return {
        isMe: false,
        role: 'ADMIN',
        name: name || 'Admin',
        isTechnician: false,
        isCustomer: false,
        isAdmin: true,
      };
    }

    // Historical messages without senderRole (deduce from IDs)
    if (techId && msg.senderId === techId) {
      return {
        isMe: false,
        role: 'TECHNICIAN',
        name: techName || 'Technician',
        isTechnician: true,
        isCustomer: false,
        isAdmin: false,
      };
    }

    if (custId && msg.senderId === custId) {
      return {
        isMe: false,
        role: 'CUSTOMER',
        name: custName || 'Customer',
        isTechnician: false,
        isCustomer: true,
        isAdmin: false,
      };
    }

    // Role-context deduction if viewing as Technician or Customer
    if (user?.role === 'TECHNICIAN') {
      return {
        isMe: false,
        role: 'CUSTOMER',
        name: custName || `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.trim() || 'Customer',
        isTechnician: false,
        isCustomer: true,
        isAdmin: false,
      };
    }

    if (user?.role === 'CUSTOMER') {
      return {
        isMe: false,
        role: 'TECHNICIAN',
        name: techName || `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.trim() || 'Technician',
        isTechnician: true,
        isCustomer: false,
        isAdmin: false,
      };
    }

    // Fallback for Admin when sender IDs are different
    // Check first message in thread vs current message
    const firstMsgSenderId = messages[0]?.senderId;
    if (firstMsgSenderId && msg.senderId === firstMsgSenderId) {
      return {
        isMe: false,
        role: 'TECHNICIAN',
        name: techName || 'Technician',
        isTechnician: true,
        isCustomer: false,
        isAdmin: false,
      };
    }

    return {
      isMe: false,
      role: 'CUSTOMER',
      name: custName || 'Customer',
      isTechnician: false,
      isCustomer: true,
      isAdmin: false,
    };
  };

  const isAdminView = user?.role === 'ADMIN';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111927] rounded-2xl border border-surface-200 dark:border-surface-300 overflow-hidden shadow-md">
      {/* Header */}
      <div className="px-3.5 sm:px-4 py-3 border-b border-surface-200 dark:border-surface-300 bg-surface-50 dark:bg-[#0c1322] shrink-0">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-300 transition-colors shrink-0 cursor-pointer text-surface-600 dark:text-surface-300"
              aria-label="Close Chat"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {isAdminView ? (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-surface-900 dark:text-white flex items-center gap-1">
                  👤 <span className="text-blue-600 dark:text-blue-400 font-semibold">{custName}</span>
                </span>
                <span className="text-xs text-surface-400 font-bold">↔</span>
                <span className="text-xs font-bold text-surface-900 dark:text-white flex items-center gap-1">
                  🛠️ <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{techName}</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40">
                  🛡️ Admin View
                </span>
              </div>
              <p className="text-[11px] text-surface-400 mt-0.5">Live coordination log for Request #{requestId?.slice(-6) || ''}</p>
            </div>
          ) : (
            <>
              <Avatar
                src={user?.role === 'CUSTOMER' ? (technician?.user?.avatarUrl || otherUser?.avatarUrl) : (customer?.avatarUrl || otherUser?.avatarUrl)}
                name={user?.role === 'CUSTOMER' ? techName : custName}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-surface-900 dark:text-white truncate">
                    {user?.role === 'CUSTOMER' ? techName : custName}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      user?.role === 'CUSTOMER'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40'
                        : 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/40'
                    }`}
                  >
                    {user?.role === 'CUSTOMER' ? (
                      <>
                        <Wrench className="w-2.5 h-2.5" /> Technician
                      </>
                    ) : (
                      <>
                        <User className="w-2.5 h-2.5" /> Customer
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs font-medium text-surface-500 dark:text-surface-400 flex items-center gap-1.5 mt-0.5">
                  {isOtherTyping ? (
                    <span className="text-primary-600 dark:text-primary-400 font-semibold animate-pulse">Typing...</span>
                  ) : connected ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active Now</span>
                    </>
                  ) : (
                    <span className="text-surface-400 dark:text-surface-500">Live Chat</span>
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-4 space-y-4 bg-surface-50/50 dark:bg-[#0a0f1d]">
        {messages.length === 0 && (
          <div className="text-center py-14 space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto text-xl">
              💬
            </div>
            <p className="text-sm font-bold text-surface-800 dark:text-surface-200">No messages yet</p>
            <p className="text-xs text-surface-500 dark:text-surface-400 max-w-xs mx-auto">
              Send a message to coordinate service details in real time.
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const sender = resolveSender(msg);

          return (
            <div
              key={msg.id || i}
              className={`flex flex-col ${sender.isMe ? 'items-end' : 'items-start'} animate-slide-up`}
            >
              {/* Sender Name & Role Pill Header */}
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {sender.isTechnician ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    <Wrench className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Technician: {sender.name}</span>
                    {sender.isMe && <span className="text-emerald-600 dark:text-emerald-400 font-normal ml-0.5">(You)</span>}
                  </span>
                ) : sender.isCustomer ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                    <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>Customer: {sender.name}</span>
                    {sender.isMe && <span className="text-blue-600 dark:text-blue-400 font-normal ml-0.5">(You)</span>}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                    <ShieldCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span>Admin: {sender.name}</span>
                    {sender.isMe && <span className="text-purple-600 dark:text-purple-400 font-normal ml-0.5">(You)</span>}
                  </span>
                )}
              </div>

              {/* Message Bubble - Ultra High Contrast */}
              <div
                className={`
                  max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm transition-all
                  ${
                    sender.isMe
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs font-normal'
                      : sender.isTechnician
                      ? 'bg-emerald-50 dark:bg-[#14261f] text-slate-900 dark:text-slate-100 rounded-bl-xs border border-emerald-300 dark:border-emerald-700/80 font-normal'
                      : 'bg-white dark:bg-[#182338] text-slate-900 dark:text-slate-100 rounded-bl-xs border border-sky-300 dark:border-blue-700/80 font-normal'
                  }
                `}
              >
                <p className="break-words font-medium text-slate-900 dark:text-slate-100">{msg.message}</p>
                <div
                  className={`flex items-center justify-end gap-1 text-[11px] mt-1 font-medium ${
                    sender.isMe ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <span>{format(new Date(msg.timestamp || Date.now()), 'HH:mm')}</span>
                  {sender.isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-100" />}
                </div>
              </div>
            </div>
          );
        })}

        {isOtherTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white dark:bg-[#182338] px-3.5 py-2 rounded-2xl rounded-bl-xs border border-surface-200 dark:border-surface-300 text-xs text-surface-600 dark:text-surface-300 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] font-semibold text-surface-700 dark:text-surface-200">{techName || custName || 'User'} is typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-3.5 sm:px-4 py-3 border-t border-surface-200 dark:border-surface-300 shrink-0 bg-white dark:bg-[#0c1322]">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 min-w-0 px-4 py-2.5 bg-surface-50 dark:bg-[#162033] border border-surface-200 dark:border-surface-300 rounded-full text-xs sm:text-sm text-surface-900 dark:text-white placeholder:text-surface-400 dark:placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2.5 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
