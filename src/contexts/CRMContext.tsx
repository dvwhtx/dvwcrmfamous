import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import {
  CommercialBid, ResidentialContact, Message, AutomationSequence,
  BidStatus, LossReason, ConversationEntry,
} from '@/data/crmData';
import {
  fetchBids, fetchContacts, fetchMessages, fetchSequences,
  insertBid, updateBidDb, insertMessage, markMessageReadDb,
  killSequenceDb, killSequencesByRecordId,
  subscribeToBids, subscribeToContacts, subscribeToMessages, subscribeToSequences,
} from '@/lib/database';

export type ActiveView = 'dashboard' | 'commercial' | 'residential' | 'inbox' | 'automation' | 'reports';

interface CRMContextType {
  activeView: ActiveView;
  setActiveView: (v: ActiveView) => void;
  bids: CommercialBid[];
  contacts: ResidentialContact[];
  messages: Message[];
  sequences: AutomationSequence[];
  selectedBidId: string | null;
  setSelectedBidId: (id: string | null) => void;
  selectedContactId: string | null;
  setSelectedContactId: (id: string | null) => void;
  addBid: (bid: Omit<CommercialBid, 'id' | 'bidNumber' | 'createdAt' | 'updatedAt' | 'conversationLog' | 'automationActive' | 'automationStep'>) => void;
  updateBid: (id: string, updates: Partial<CommercialBid>) => void;
  updateBidStatus: (id: string, status: BidStatus, extra?: { executionDate?: string; finalPrice?: number; lossReason?: LossReason }) => void;
  addConversationEntry: (bidId: string, note: string) => void;
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  markMessageRead: (id: string) => void;
  killSequence: (id: string, reason: string) => void;
  unreadCount: number;
  activeBidCount: number;
  dueMaintenanceCount: number;
  revenuePipeline: number;
  wonRevenue: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showBidForm: boolean;
  setShowBidForm: (v: boolean) => void;
  isLoading: boolean;
}

const CRMContext = createContext<CRMContextType>({} as CRMContextType);
export const useCRM = () => useContext(CRMContext);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBidForm, setShowBidForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [bids, setBids] = useState<CommercialBid[]>([]);
  const [contacts, setContacts] = useState<ResidentialContact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sequences, setSequences] = useState<AutomationSequence[]>([]);
  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Track if initial load is done to avoid realtime duplicates
  const initialLoadDone = useRef(false);

  // ─── Initial data fetch ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      try {
        const [b, c, m, s] = await Promise.all([
          fetchBids(),
          fetchContacts(),
          fetchMessages(),
          fetchSequences(),
        ]);
        if (!cancelled) {
          setBids(b);
          setContacts(c);
          setMessages(m);
          setSequences(s);
          initialLoadDone.current = true;
        }
      } catch (err: any) {
        console.error('Failed to load CRM data:', err);
        toast({ title: 'Database Error', description: err.message || 'Failed to load data', variant: 'destructive' });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadAll();
    return () => { cancelled = true; };
  }, []);

  // ─── Real-time subscriptions ───────────────────────────────────────────
  useEffect(() => {
    if (!initialLoadDone.current) return;

    const unsubBids = subscribeToBids(({ eventType, new: newBid, old: oldBid }) => {
      if (eventType === 'INSERT' && newBid) {
        setBids(prev => {
          if (prev.some(b => b.id === newBid.id)) return prev;
          return [newBid, ...prev];
        });
      } else if (eventType === 'UPDATE' && newBid) {
        setBids(prev => prev.map(b => b.id === newBid.id ? newBid : b));
      } else if (eventType === 'DELETE' && oldBid) {
        setBids(prev => prev.filter(b => b.id !== oldBid.id));
      }
    });

    const unsubContacts = subscribeToContacts(({ eventType, new: newC, old: oldC }) => {
      if (eventType === 'INSERT' && newC) {
        setContacts(prev => {
          if (prev.some(c => c.id === newC.id)) return prev;
          return [newC, ...prev];
        });
      } else if (eventType === 'UPDATE' && newC) {
        setContacts(prev => prev.map(c => c.id === newC.id ? newC : c));
      } else if (eventType === 'DELETE' && oldC) {
        setContacts(prev => prev.filter(c => c.id !== oldC.id));
      }
    });

    const unsubMessages = subscribeToMessages(({ eventType, new: newM, old: oldM }) => {
      if (eventType === 'INSERT' && newM) {
        setMessages(prev => {
          if (prev.some(m => m.id === newM.id)) return prev;
          return [newM, ...prev];
        });
      } else if (eventType === 'UPDATE' && newM) {
        setMessages(prev => prev.map(m => m.id === newM.id ? newM : m));
      }
    });

    const unsubSeqs = subscribeToSequences(({ eventType, new: newS, old: oldS }) => {
      if (eventType === 'INSERT' && newS) {
        setSequences(prev => {
          if (prev.some(s => s.id === newS.id)) return prev;
          return [newS, ...prev];
        });
      } else if (eventType === 'UPDATE' && newS) {
        setSequences(prev => prev.map(s => s.id === newS.id ? newS : s));
      }
    });

    return () => {
      unsubBids();
      unsubContacts();
      unsubMessages();
      unsubSeqs();
    };
  }, [isLoading]); // Re-subscribe after initial load completes

  // ─── Optimistic CRUD operations ────────────────────────────────────────

  const addBid = useCallback(async (bid: Omit<CommercialBid, 'id' | 'bidNumber' | 'createdAt' | 'updatedAt' | 'conversationLog' | 'automationActive' | 'automationStep'>) => {
    // Optimistic: create a temp local bid
    const tempId = uuidv4();
    const now = new Date().toISOString();
    const optimistic: CommercialBid = {
      ...bid,
      id: tempId,
      bidNumber: Math.max(...bids.map(b => b.bidNumber), 1000) + 1,
      createdAt: now,
      updatedAt: now,
      conversationLog: [{ id: uuidv4(), timestamp: now, note: 'Bid created.', author: 'System' }],
      automationActive: false,
      automationStep: 0,
    };
    setBids(prev => [optimistic, ...prev]);

    try {
      const saved = await insertBid({
        ...bid,
        conversationLog: optimistic.conversationLog,
      });
      // Replace optimistic with real
      setBids(prev => prev.map(b => b.id === tempId ? saved : b));
      toast({ title: 'Bid Created', description: `${saved.propertyName} - #${saved.bidNumber}` });
    } catch (err: any) {
      // Revert
      setBids(prev => prev.filter(b => b.id !== tempId));
      toast({ title: 'Error Creating Bid', description: err.message, variant: 'destructive' });
    }
  }, [bids]);

  const updateBid = useCallback(async (id: string, updates: Partial<CommercialBid>) => {
    // Optimistic
    const prev = bids.find(b => b.id === id);
    if (!prev) return;
    setBids(p => p.map(b => b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b));

    try {
      await updateBidDb(id, updates);
    } catch (err: any) {
      // Revert
      setBids(p => p.map(b => b.id === id ? prev : b));
      toast({ title: 'Error Updating Bid', description: err.message, variant: 'destructive' });
    }
  }, [bids]);

  const updateBidStatus = useCallback(async (id: string, status: BidStatus, extra?: { executionDate?: string; finalPrice?: number; lossReason?: LossReason }) => {
    const prev = bids.find(b => b.id === id);
    if (!prev) return;

    const updates: Partial<CommercialBid> = {
      status,
      automationActive: status === 'Submitted',
      automationStep: status === 'Submitted' ? 0 : prev.automationStep,
    };
    if (status === 'Won') {
      updates.executionDate = extra?.executionDate || '';
      updates.finalPrice = extra?.finalPrice || prev.totalBidPrice;
    }
    if (status === 'Lost') {
      updates.lossReason = extra?.lossReason || 'Other';
    }

    // Optimistic update
    setBids(p => p.map(b => b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b));

    // Kill switch: if status changes from Submitted, kill automation
    if (prev.status === 'Submitted' && status !== 'Submitted') {
      setSequences(p => p.map(s =>
        s.recordId === id && s.status === 'active'
          ? { ...s, status: 'killed' as const, killReason: `Status changed to ${status}` }
          : s
      ));
      killSequencesByRecordId(id, `Status changed to ${status}`).catch(console.error);
    }

    try {
      await updateBidDb(id, updates);
      toast({ title: 'Status Updated', description: `${prev.propertyName} → ${status}` });
    } catch (err: any) {
      setBids(p => p.map(b => b.id === id ? prev : b));
      toast({ title: 'Error Updating Status', description: err.message, variant: 'destructive' });
    }
  }, [bids]);

  const addConversationEntry = useCallback(async (bidId: string, note: string) => {
    const bid = bids.find(b => b.id === bidId);
    if (!bid) return;
    const entry: ConversationEntry = { id: uuidv4(), timestamp: new Date().toISOString(), note, author: 'Admin' };
    const newLog = [...bid.conversationLog, entry];

    // Optimistic
    setBids(p => p.map(b => b.id === bidId ? { ...b, conversationLog: newLog } : b));

    try {
      await updateBidDb(bidId, { conversationLog: newLog } as any);
    } catch (err: any) {
      setBids(p => p.map(b => b.id === bidId ? bid : b));
      toast({ title: 'Error Adding Note', description: err.message, variant: 'destructive' });
    }
  }, [bids]);

  const addMessage = useCallback(async (msg: Omit<Message, 'id' | 'timestamp'>) => {
    // Optimistic
    const tempId = uuidv4();
    const optimistic: Message = { ...msg, id: tempId, timestamp: new Date().toISOString() };
    setMessages(prev => [optimistic, ...prev]);

    // Kill switch: if inbound message detected, kill automation for that contact
    if (msg.direction === 'inbound') {
      setSequences(prev => prev.map(s =>
        s.recordId === msg.contactId && s.status === 'active'
          ? { ...s, status: 'killed' as const, killReason: 'Inbound message detected' }
          : s
      ));
      killSequencesByRecordId(msg.contactId, 'Inbound message detected').catch(console.error);
    }

    try {
      const saved = await insertMessage(msg);
      setMessages(prev => prev.map(m => m.id === tempId ? saved : m));
    } catch (err: any) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toast({ title: 'Error Sending Message', description: err.message, variant: 'destructive' });
    }
  }, []);

  const markMessageRead = useCallback(async (id: string) => {
    // Optimistic
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    try {
      await markMessageReadDb(id);
    } catch (err: any) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: false } : m));
    }
  }, []);

  const killSequence = useCallback(async (id: string, reason: string) => {
    const prev = sequences.find(s => s.id === id);
    // Optimistic
    setSequences(p => p.map(s => s.id === id ? { ...s, status: 'killed' as const, killReason: reason } : s));
    try {
      await killSequenceDb(id, reason);
      toast({ title: 'Sequence Killed', description: reason });
    } catch (err: any) {
      if (prev) setSequences(p => p.map(s => s.id === id ? prev : s));
      toast({ title: 'Error Killing Sequence', description: err.message, variant: 'destructive' });
    }
  }, [sequences]);

  // ─── Computed metrics ──────────────────────────────────────────────────
  const unreadCount = useMemo(() => messages.filter(m => !m.read && m.direction === 'inbound').length, [messages]);
  const activeBidCount = useMemo(() => bids.filter(b => ['Request', 'Draft', 'Submitted', 'Under Review'].includes(b.status)).length, [bids]);
  const dueMaintenanceCount = useMemo(() => contacts.filter(c => c.serviceDue).length, [contacts]);
  const revenuePipeline = useMemo(() => bids.filter(b => ['Submitted', 'Under Review'].includes(b.status)).reduce((s, b) => s + b.totalBidPrice, 0), [bids]);
  const wonRevenue = useMemo(() => bids.filter(b => b.status === 'Won').reduce((s, b) => s + (b.finalPrice || b.totalBidPrice), 0), [bids]);

  return (
    <CRMContext.Provider value={{
      activeView, setActiveView,
      bids, contacts, messages, sequences,
      selectedBidId, setSelectedBidId,
      selectedContactId, setSelectedContactId,
      addBid, updateBid, updateBidStatus,
      addConversationEntry, addMessage, markMessageRead, killSequence,
      unreadCount, activeBidCount, dueMaintenanceCount, revenuePipeline, wonRevenue,
      searchQuery, setSearchQuery,
      showBidForm, setShowBidForm,
      isLoading,
    }}>
      {children}
    </CRMContext.Provider>
  );
};
