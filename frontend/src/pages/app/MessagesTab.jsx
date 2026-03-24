import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';
import { MessageCircle, Send, ArrowLeft, User, Search } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MessagesTab() {
  const { user, getAuthHeaders } = useAuth();
  const { language } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [users, setUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const de = language === 'de';

  const fetchConversations = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/messages/conversations`, { headers: getAuthHeaders() });
      setConversations(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [getAuthHeaders]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const openChat = async (partnerId, partnerName) => {
    setActiveChat({ id: partnerId, name: partnerName });
    try {
      const res = await axios.get(`${API}/messages/${partnerId}`, { headers: getAuthHeaders() });
      setMessages(res.data);
    } catch (err) { console.error(err); }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeChat) return;
    try {
      const res = await axios.post(`${API}/messages`, {
        recipient_id: activeChat.id, content: newMsg.trim()
      }, { headers: getAuthHeaders() });
      setMessages(prev => [...prev, res.data]);
      setNewMsg('');
    } catch (err) { console.error(err); }
  };

  const startNewChat = async () => {
    setShowNewChat(true);
    try {
      const res = await axios.get(`${API}/messages/users/list`, { headers: getAuthHeaders() });
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  // Chat view
  if (activeChat) {
    return (
      <div data-testid="app-chat" className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Chat header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <button onClick={() => { setActiveChat(null); fetchConversations(); }} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-charcoal border border-gold/30 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gold/50" />
          </div>
          <span className="font-teko text-lg text-white">{activeChat.name}</span>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-gray-500 font-rajdhani py-12">{de ? 'Noch keine Nachrichten' : 'No messages yet'}</p>
          )}
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl font-rajdhani text-sm ${
                m.sender_id === user?.id
                  ? 'bg-gold text-obsidian rounded-br-md'
                  : 'bg-charcoal text-white border border-white/5 rounded-bl-md'
              }`}>
                <p>{m.content}</p>
                <p className={`text-xs mt-1 ${m.sender_id === user?.id ? 'text-obsidian/60' : 'text-gray-600'}`}>
                  {new Date(m.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* Input */}
        <div className="flex gap-2 pt-3 border-t border-white/10">
          <input
            data-testid="message-input"
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder={de ? 'Nachricht...' : 'Message...'}
            className="flex-1 bg-charcoal border border-white/10 rounded-full px-4 py-2.5 font-rajdhani text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gold/50"
          />
          <button data-testid="send-message-btn" onClick={sendMessage} disabled={!newMsg.trim()} className="w-10 h-10 bg-gold rounded-full flex items-center justify-center disabled:opacity-40">
            <Send className="w-4 h-4 text-obsidian" />
          </button>
        </div>
      </div>
    );
  }

  // New chat user selection
  if (showNewChat) {
    const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
    return (
      <div data-testid="new-chat-select">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setShowNewChat(false)} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="font-teko text-lg text-white">{de ? 'Neue Nachricht' : 'New Message'}</h3>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={de ? 'Suchen...' : 'Search...'}
            className="w-full bg-charcoal border border-white/10 rounded-xl pl-10 pr-4 py-2.5 font-rajdhani text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gold/50" />
        </div>
        <div className="space-y-2">
          {filtered.map(u => (
            <button key={u.id} onClick={() => { setShowNewChat(false); openChat(u.id, u.name); }}
              className="w-full flex items-center gap-3 p-3 bg-charcoal border border-white/5 rounded-xl hover:border-gold/30 transition-colors">
              <div className="w-10 h-10 bg-obsidian border border-gold/20 rounded-full flex items-center justify-center shrink-0">
                {u.image_url ? <img src={u.image_url} alt="" className="w-full h-full rounded-full object-cover" /> : <User className="w-5 h-5 text-gold/50" />}
              </div>
              <div className="text-left">
                <p className="font-rajdhani text-white text-sm">{u.name}</p>
                <p className="font-rajdhani text-gray-500 text-xs capitalize">{u.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Conversations list
  return (
    <div data-testid="app-messages">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-teko text-xl text-white uppercase">{de ? 'Nachrichten' : 'Messages'}</h3>
        <button data-testid="new-chat-btn" onClick={startNewChat} className="w-9 h-9 bg-gold rounded-full flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-obsidian" />
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="font-rajdhani text-gray-500">{de ? 'Noch keine Nachrichten' : 'No messages yet'}</p>
          <button onClick={startNewChat} className="mt-3 font-rajdhani text-gold text-sm hover:text-gold-glow">
            {de ? 'Erste Nachricht schreiben' : 'Write first message'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(c => (
            <button key={c.partner_id} onClick={() => openChat(c.partner_id, c.partner_name)}
              className="w-full flex items-center gap-3 p-3 bg-charcoal border border-white/5 rounded-xl hover:border-gold/30 transition-colors">
              <div className="relative shrink-0">
                <div className="w-11 h-11 bg-obsidian border border-gold/20 rounded-full flex items-center justify-center">
                  {c.partner_image ? <img src={c.partner_image} alt="" className="w-full h-full rounded-full object-cover" /> : <User className="w-5 h-5 text-gold/50" />}
                </div>
                {c.unread > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-obsidian text-xs font-bold rounded-full flex items-center justify-center">{c.unread}</span>}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-rajdhani text-white text-sm font-medium">{c.partner_name}</p>
                  <p className="font-rajdhani text-gray-600 text-xs">{new Date(c.last_at).toLocaleDateString('de-DE')}</p>
                </div>
                <p className="font-rajdhani text-gray-500 text-xs truncate">{c.last_message}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
