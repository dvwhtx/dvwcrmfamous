import React, { useState, useMemo } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import {
  Search, Mail, MessageSquare, Send, Phone, Building2, Home,
  ChevronDown, AlertCircle, CheckCircle2, Filter
} from 'lucide-react';

const CommunicationsCenter: React.FC = () => {
  const { messages, bids, contacts, addMessage, markMessageRead, searchQuery } = useCRM();
  const [channelFilter, setChannelFilter] = useState<'all' | 'sms' | 'email'>('all');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [localSearch, setLocalSearch] = useState('');

  const effectiveSearch = searchQuery || localSearch;

  // Group messages by contact
  const threads = useMemo(() => {
    const grouped: Record<string, typeof messages> = {};
    messages.forEach(m => {
      if (!grouped[m.contactId]) grouped[m.contactId] = [];
      grouped[m.contactId].push(m);
    });
    return Object.entries(grouped).map(([contactId, msgs]) => ({
      contactId,
      contactName: msgs[0].contactName,
      contactType: msgs[0].contactType,
      messages: msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      lastMessage: msgs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0],
      unreadCount: msgs.filter(m => !m.read && m.direction === 'inbound').length,
    })).sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
  }, [messages]);

  const filteredThreads = useMemo(() => {
    let result = threads;
    if (channelFilter !== 'all') {
      result = result.filter(t => t.messages.some(m => m.channel === channelFilter));
    }
    if (directionFilter !== 'all') {
      result = result.filter(t => t.messages.some(m => m.direction === directionFilter));
    }
    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      result = result.filter(t =>
        t.contactName.toLowerCase().includes(q) ||
        t.messages.some(m => m.content.toLowerCase().includes(q))
      );
    }
    return result;
  }, [threads, channelFilter, directionFilter, effectiveSearch]);

  const activeThread = filteredThreads.find(t => t.contactId === selectedThread);

  // Get context for selected contact
  const getContactContext = (contactId: string, contactType: string) => {
    if (contactType === 'commercial') {
      const bid = bids.find(b => b.id === contactId);
      if (bid) return {
        type: 'Commercial',
        detail: bid.propertyName,
        status: bid.status,
        value: `$${bid.totalBidPrice.toLocaleString()}`,
      };
    } else {
      const contact = contacts.find(c => c.id === contactId);
      if (contact) return {
        type: 'Residential',
        detail: contact.address,
        status: contact.serviceDue ? 'Service Due' : 'Current',
        value: `$${contact.totalCharges}`,
      };
    }
    return null;
  };

  const handleReply = (channel: 'sms' | 'email') => {
    if (!replyText.trim() || !activeThread) return;
    let content = replyText.trim();
    if (channel === 'sms') {
      content += '\n\nReply STOP to opt out.';
    }
    addMessage({
      contactId: activeThread.contactId,
      contactName: activeThread.contactName,
      contactType: activeThread.contactType,
      channel,
      direction: 'outbound',
      content,
      read: true,
    });
    setReplyText('');
  };

  const quickReplies = [
    'Thank you for your response. I\'ll follow up shortly.',
    'We can schedule your service for next week. What day works best?',
    'I\'ve attached the updated proposal for your review.',
    'Your annual dryer vent cleaning helps prevent fires. Let\'s schedule!',
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Thread List */}
      <div className={`w-full md:w-96 border-r border-gray-100 flex flex-col ${activeThread && 'hidden md:flex'}`}>
        {/* Filters */}
        <div className="p-3 border-b border-gray-100 space-y-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'sms', 'email'] as const).map(f => (
              <button
                key={f}
                onClick={() => setChannelFilter(f)}
                className={`flex-1 px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                  channelFilter === f ? 'bg-[#0A1628] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All' : f === 'sms' ? 'SMS' : 'Email'}
              </button>
            ))}
          </div>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.map(thread => (
            <button
              key={thread.contactId}
              onClick={() => {
                setSelectedThread(thread.contactId);
                thread.messages.forEach(m => {
                  if (!m.read && m.direction === 'inbound') markMessageRead(m.id);
                });
              }}
              className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                selectedThread === thread.contactId ? 'bg-orange-50/50 border-l-2 border-l-orange-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  thread.contactType === 'commercial' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {thread.contactType === 'commercial' ? <Building2 size={16} /> : <Home size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#0A1628] truncate">{thread.contactName}</p>
                    {thread.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{thread.lastMessage.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      thread.lastMessage.channel === 'sms' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {thread.lastMessage.channel === 'sms' ? 'SMS' : 'Email'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(thread.lastMessage.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
          {filteredThreads.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Message View */}
      <div className={`flex-1 flex flex-col ${!activeThread && 'hidden md:flex'}`}>
        {activeThread ? (
          <>
            {/* Thread header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedThread(null)}
                  className="md:hidden p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronDown size={18} className="rotate-90" />
                </button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activeThread.contactType === 'commercial' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {activeThread.contactType === 'commercial' ? <Building2 size={18} /> : <Home size={18} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0A1628]">{activeThread.contactName}</p>
                  <p className="text-xs text-gray-500 capitalize">{activeThread.contactType}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Phone size={16} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Context card */}
            {(() => {
              const ctx = getContactContext(activeThread.contactId, activeThread.contactType);
              if (!ctx) return null;
              return (
                <div className="mx-4 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{ctx.type} - {ctx.detail}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${
                        ctx.status === 'Won' || ctx.status === 'Current' ? 'bg-emerald-50 text-emerald-600' :
                        ctx.status === 'Service Due' ? 'bg-red-50 text-red-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>{ctx.status}</span>
                      <span className="font-mono font-bold text-[#0A1628]">{ctx.value}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeThread.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.direction === 'outbound'
                      ? 'bg-[#0A1628] text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        msg.channel === 'sms'
                          ? msg.direction === 'outbound' ? 'bg-white/20 text-white/80' : 'bg-green-100 text-green-600'
                          : msg.direction === 'outbound' ? 'bg-white/20 text-white/80' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {msg.channel === 'sms' ? 'SMS' : 'Email'}
                      </span>
                      <span className={`text-[10px] ${msg.direction === 'outbound' ? 'text-white/50' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick replies */}
            <div className="px-4 pt-2 flex gap-2 overflow-x-auto">
              {quickReplies.map((qr, i) => (
                <button
                  key={i}
                  onClick={() => setReplyText(qr)}
                  className="flex-shrink-0 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                >
                  {qr.slice(0, 40)}...
                </button>
              ))}
            </div>

            {/* Reply */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply('email')}
                  placeholder="Type a reply..."
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
                />
                <button
                  onClick={() => handleReply('email')}
                  disabled={!replyText.trim()}
                  className="px-3 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-40 flex items-center gap-1.5"
                  title="Send Email"
                >
                  <Mail size={16} />
                </button>
                <button
                  onClick={() => handleReply('sms')}
                  disabled={!replyText.trim()}
                  className="px-3 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-40 flex items-center gap-1.5"
                  title="Send SMS (includes STOP opt-out)"
                >
                  <MessageSquare size={16} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                <AlertCircle size={10} /> SMS messages automatically include "Reply STOP to opt out" for 10DLC compliance.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs mt-1">Choose a thread from the left to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationsCenter;
