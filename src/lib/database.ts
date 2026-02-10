import { supabase } from '@/lib/supabase';
import type {
  CommercialBid, ResidentialContact, Message, AutomationSequence,
  BidStatus, LossReason, ServiceArea, ConversationEntry,
} from '@/data/crmData';

// ─── Snake ↔ Camel mappers ───────────────────────────────────────────────

function bidFromRow(r: any): CommercialBid {
  return {
    id: r.id,
    bidNumber: r.bid_number,
    propertyName: r.property_name,
    serviceArea: r.service_area as ServiceArea,
    fullAddress: r.full_address,
    companyName: r.company_name,
    contactName: r.contact_name,
    phone: r.phone,
    email: r.email,
    numberOfVents: r.number_of_vents,
    basePricePerVent: Number(r.base_price_per_vent),
    equipmentCost: Number(r.equipment_cost),
    totalBidPrice: Number(r.total_bid_price),
    status: r.status as BidStatus,
    executionDate: r.execution_date ?? undefined,
    finalPrice: r.final_price != null ? Number(r.final_price) : undefined,
    lossReason: r.loss_reason as LossReason | undefined,
    oneDriveFolderLink: r.onedrive_folder_link ?? '',
    proposalDocLink: r.proposal_doc_link ?? '',
    conversationLog: (r.conversation_log ?? []) as ConversationEntry[],
    automationActive: r.automation_active ?? false,
    automationStep: r.automation_step ?? 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function bidToRow(b: Partial<CommercialBid>): Record<string, any> {
  const row: Record<string, any> = {};
  if (b.propertyName !== undefined) row.property_name = b.propertyName;
  if (b.serviceArea !== undefined) row.service_area = b.serviceArea;
  if (b.fullAddress !== undefined) row.full_address = b.fullAddress;
  if (b.companyName !== undefined) row.company_name = b.companyName;
  if (b.contactName !== undefined) row.contact_name = b.contactName;
  if (b.phone !== undefined) row.phone = b.phone;
  if (b.email !== undefined) row.email = b.email;
  if (b.numberOfVents !== undefined) row.number_of_vents = b.numberOfVents;
  if (b.basePricePerVent !== undefined) row.base_price_per_vent = b.basePricePerVent;
  if (b.equipmentCost !== undefined) row.equipment_cost = b.equipmentCost;
  if (b.totalBidPrice !== undefined) row.total_bid_price = b.totalBidPrice;
  if (b.status !== undefined) row.status = b.status;
  if (b.executionDate !== undefined) row.execution_date = b.executionDate || null;
  if (b.finalPrice !== undefined) row.final_price = b.finalPrice ?? null;
  if (b.lossReason !== undefined) row.loss_reason = b.lossReason ?? null;
  if (b.oneDriveFolderLink !== undefined) row.onedrive_folder_link = b.oneDriveFolderLink;
  if (b.proposalDocLink !== undefined) row.proposal_doc_link = b.proposalDocLink;
  if (b.conversationLog !== undefined) row.conversation_log = b.conversationLog;
  if (b.automationActive !== undefined) row.automation_active = b.automationActive;
  if (b.automationStep !== undefined) row.automation_step = b.automationStep;
  row.updated_at = new Date().toISOString();
  return row;
}

function contactFromRow(r: any): ResidentialContact {
  return {
    id: r.id,
    customerName: r.customer_name,
    address: r.address,
    phone: r.phone,
    email: r.email,
    serviceArea: r.service_area as ServiceArea,
    lastServiceDate: r.last_service_date,
    lastContactDate: r.last_contact_date,
    totalCharges: Number(r.total_charges),
    serviceDue: r.service_due,
    automationActive: r.automation_active,
    automationStep: r.automation_step,
    optedOut: r.opted_out,
    notes: r.notes ?? '',
  };
}

function messageFromRow(r: any): Message {
  return {
    id: r.id,
    contactId: r.contact_id,
    contactName: r.contact_name,
    contactType: r.contact_type as 'commercial' | 'residential',
    channel: r.channel as 'sms' | 'email',
    direction: r.direction as 'inbound' | 'outbound',
    content: r.content,
    timestamp: r.created_at,
    read: r.read,
  };
}

function sequenceFromRow(r: any): AutomationSequence {
  return {
    id: r.id,
    recordId: r.record_id,
    recordType: r.record_type as 'commercial' | 'residential',
    contactName: r.contact_name,
    status: r.status as 'active' | 'paused' | 'completed' | 'killed',
    currentStep: r.current_step,
    totalSteps: r.total_steps,
    startDate: r.start_date,
    nextActionDate: r.next_action_date ?? '',
    nextActionType: r.next_action_type as 'email' | 'sms',
    killReason: r.kill_reason ?? undefined,
  };
}

// ─── Fetch all ────────────────────────────────────────────────────────────

export async function fetchBids(): Promise<CommercialBid[]> {
  const { data, error } = await supabase
    .from('commercial_bids')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(bidFromRow);
}

export async function fetchContacts(): Promise<ResidentialContact[]> {
  const { data, error } = await supabase
    .from('residential_contacts')
    .select('*')
    .order('customer_name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(contactFromRow);
}

export async function fetchMessages(): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []).map(messageFromRow);
}

export async function fetchSequences(): Promise<AutomationSequence[]> {
  const { data, error } = await supabase
    .from('automation_sequences')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(sequenceFromRow);
}

// ─── Commercial Bids CRUD ─────────────────────────────────────────────────

export async function insertBid(bid: Partial<CommercialBid>): Promise<CommercialBid> {
  const row = bidToRow(bid);
  delete row.updated_at; // let DB default
  const { data, error } = await supabase
    .from('commercial_bids')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return bidFromRow(data);
}

export async function updateBidDb(id: string, updates: Partial<CommercialBid>): Promise<CommercialBid> {
  const row = bidToRow(updates);
  const { data, error } = await supabase
    .from('commercial_bids')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return bidFromRow(data);
}

// ─── Messages CRUD ────────────────────────────────────────────────────────

export async function insertMessage(msg: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      contact_id: msg.contactId,
      contact_name: msg.contactName,
      contact_type: msg.contactType,
      channel: msg.channel,
      direction: msg.direction,
      content: msg.content,
      read: msg.read,
    })
    .select()
    .single();
  if (error) throw error;
  return messageFromRow(data);
}

export async function markMessageReadDb(id: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', id);
  if (error) throw error;
}

// ─── Automation Sequences ─────────────────────────────────────────────────

export async function killSequenceDb(id: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('automation_sequences')
    .update({ status: 'killed', kill_reason: reason, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function killSequencesByRecordId(recordId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('automation_sequences')
    .update({ status: 'killed', kill_reason: reason, updated_at: new Date().toISOString() })
    .eq('record_id', recordId)
    .eq('status', 'active');
  if (error) throw error;
}

// ─── Real-time subscriptions ──────────────────────────────────────────────

export type RealtimeCallback<T> = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
}) => void;

export function subscribeToBids(callback: RealtimeCallback<CommercialBid>) {
  const channel = supabase
    .channel('bids-realtime')
    .on(
      'postgres_changes' as any,
      { event: '*', schema: '*', table: 'commercial_bids' },
      (payload: any) => {
        callback({
          eventType: payload.eventType,
          new: payload.new ? bidFromRow(payload.new) : null,
          old: payload.old ? bidFromRow(payload.old) : null,
        });
      }
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export function subscribeToContacts(callback: RealtimeCallback<ResidentialContact>) {
  const channel = supabase
    .channel('contacts-realtime')
    .on(
      'postgres_changes' as any,
      { event: '*', schema: '*', table: 'residential_contacts' },
      (payload: any) => {
        callback({
          eventType: payload.eventType,
          new: payload.new ? contactFromRow(payload.new) : null,
          old: payload.old ? contactFromRow(payload.old) : null,
        });
      }
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export function subscribeToMessages(callback: RealtimeCallback<Message>) {
  const channel = supabase
    .channel('messages-realtime')
    .on(
      'postgres_changes' as any,
      { event: '*', schema: '*', table: 'messages' },
      (payload: any) => {
        callback({
          eventType: payload.eventType,
          new: payload.new ? messageFromRow(payload.new) : null,
          old: payload.old ? messageFromRow(payload.old) : null,
        });
      }
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export function subscribeToSequences(callback: RealtimeCallback<AutomationSequence>) {
  const channel = supabase
    .channel('sequences-realtime')
    .on(
      'postgres_changes' as any,
      { event: '*', schema: '*', table: 'automation_sequences' },
      (payload: any) => {
        callback({
          eventType: payload.eventType,
          new: payload.new ? sequenceFromRow(payload.new) : null,
          old: payload.old ? sequenceFromRow(payload.old) : null,
        });
      }
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

// ─── Mapper exports for external use ──────────────────────────────────────
export { bidFromRow, contactFromRow, messageFromRow, sequenceFromRow };
