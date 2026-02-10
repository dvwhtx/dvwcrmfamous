import { v4 as uuidv4 } from 'uuid';

export type ServiceArea = 'Bellaire' | 'River Oaks' | 'Galleria' | 'Med Center' | 'West University' | 'Heights' | 'Stafford' | 'Missouri City';
export type BidStatus = 'Request' | 'Draft' | 'Submitted' | 'Under Review' | 'Cancelled' | 'Deferred' | 'Lost' | 'Won';
export type LossReason = 'Price' | 'Timing' | 'Scope' | 'Board Rejection' | 'Inactivity' | 'Other';

export interface ConversationEntry {
  id: string;
  timestamp: string;
  note: string;
  author: string;
}

export interface CommercialBid {
  id: string;
  bidNumber: number;
  propertyName: string;
  serviceArea: ServiceArea;
  fullAddress: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  numberOfVents: number;
  basePricePerVent: number;
  equipmentCost: number;
  totalBidPrice: number;
  status: BidStatus;
  executionDate?: string;
  finalPrice?: number;
  lossReason?: LossReason;
  oneDriveFolderLink: string;
  proposalDocLink: string;
  conversationLog: ConversationEntry[];
  createdAt: string;
  updatedAt: string;
  automationActive: boolean;
  automationStep: number;
}

export interface ResidentialContact {
  id: string;
  customerName: string;
  address: string;
  phone: string;
  email: string;
  serviceArea: ServiceArea;
  lastServiceDate: string;
  lastContactDate: string;
  totalCharges: number;
  serviceDue: boolean;
  automationActive: boolean;
  automationStep: number;
  optedOut: boolean;
  notes: string;
}

export interface Message {
  id: string;
  contactId: string;
  contactName: string;
  contactType: 'commercial' | 'residential';
  channel: 'sms' | 'email';
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface AutomationSequence {
  id: string;
  recordId: string;
  recordType: 'commercial' | 'residential';
  contactName: string;
  status: 'active' | 'paused' | 'completed' | 'killed';
  currentStep: number;
  totalSteps: number;
  startDate: string;
  nextActionDate: string;
  nextActionType: 'email' | 'sms';
  killReason?: string;
}

const SERVICE_AREAS: ServiceArea[] = ['Bellaire', 'River Oaks', 'Galleria', 'Med Center', 'West University', 'Heights', 'Stafford', 'Missouri City'];

export const SEQUENCE_DAYS = [1, 3, 7, 10, 14, 17, 21, 24, 27, 30];
export const SEQUENCE_TYPES: ('email' | 'sms')[] = ['email', 'sms', 'email', 'sms', 'email', 'sms', 'email', 'sms', 'email', 'sms'];

export const generateCommercialBids = (): CommercialBid[] => {
  const properties = [
    { name: 'Galleria Tower Apartments', company: 'Greystar Management', contact: 'Maria Santos', area: 'Galleria' as ServiceArea, vents: 120, status: 'Won' as BidStatus },
    { name: 'River Oaks Garden Condos', company: 'Camden Property Trust', contact: 'James Mitchell', area: 'River Oaks' as ServiceArea, vents: 85, status: 'Submitted' as BidStatus },
    { name: 'Med Center Plaza', company: 'Hines Real Estate', contact: 'Dr. Sarah Chen', area: 'Med Center' as ServiceArea, vents: 200, status: 'Under Review' as BidStatus },
    { name: 'West U Townhomes', company: 'Finger Companies', contact: 'Robert Finger', area: 'West University' as ServiceArea, vents: 48, status: 'Draft' as BidStatus },
    { name: 'Heights Lofts', company: 'Midway Companies', contact: 'Lisa Park', area: 'Heights' as ServiceArea, vents: 64, status: 'Request' as BidStatus },
    { name: 'Bellaire Senior Living', company: 'Brookdale Senior', contact: 'Tom Williams', area: 'Bellaire' as ServiceArea, vents: 150, status: 'Won' as BidStatus },
    { name: 'Stafford Business Park', company: 'Parmenter Realty', contact: 'Angela Davis', area: 'Stafford' as ServiceArea, vents: 32, status: 'Lost' as BidStatus },
    { name: 'Missouri City Commons', company: 'NRP Group', contact: 'Kevin Brown', area: 'Missouri City' as ServiceArea, vents: 96, status: 'Submitted' as BidStatus },
    { name: 'Galleria Oaks Residences', company: 'Lincoln Property Co', contact: 'Diana Ross', area: 'Galleria' as ServiceArea, vents: 180, status: 'Under Review' as BidStatus },
    { name: 'Bellaire Park Place', company: 'JMB Realty', contact: 'Michael Torres', area: 'Bellaire' as ServiceArea, vents: 72, status: 'Deferred' as BidStatus },
    { name: 'River Oaks Manor', company: 'Hines Real Estate', contact: 'Patricia Lane', area: 'River Oaks' as ServiceArea, vents: 55, status: 'Cancelled' as BidStatus },
    { name: 'Heights Village Apts', company: 'Morgan Group', contact: 'Steven Clark', area: 'Heights' as ServiceArea, vents: 110, status: 'Won' as BidStatus },
  ];

  return properties.map((p, i) => {
    const basePrice = p.vents > 100 ? 45 : p.vents > 50 ? 55 : 65;
    const equipCost = p.vents > 100 ? 500 : p.vents > 50 ? 350 : 200;
    const total = p.vents * basePrice + equipCost;
    return {
      id: uuidv4(),
      bidNumber: 1001 + i,
      propertyName: p.name,
      serviceArea: p.area,
      fullAddress: `${1000 + i * 100} ${p.area} Blvd, Houston, TX 77${String(1 + i).padStart(3, '0')}`,
      companyName: p.company,
      contactName: p.contact,
      phone: `(713) ${String(555 + i).padStart(3, '0')}-${String(1000 + i * 11).slice(0, 4)}`,
      email: `${p.contact.split(' ')[0].toLowerCase()}@${p.company.split(' ')[0].toLowerCase()}.com`,
      numberOfVents: p.vents,
      basePricePerVent: basePrice,
      equipmentCost: equipCost,
      totalBidPrice: total,
      status: p.status,
      executionDate: p.status === 'Won' ? '2026-03-15' : undefined,
      finalPrice: p.status === 'Won' ? total * 0.95 : undefined,
      lossReason: p.status === 'Lost' ? 'Price' : undefined,
      oneDriveFolderLink: `https://onedrive.live.com/dvw/${p.name.replace(/\s/g, '-').toLowerCase()}`,
      proposalDocLink: `https://onedrive.live.com/doc/proposal-${1001 + i}`,
      conversationLog: [
        { id: uuidv4(), timestamp: '2026-01-15T10:30:00Z', note: `Initial contact with ${p.contact} regarding dryer vent cleaning services.`, author: 'System' },
        { id: uuidv4(), timestamp: '2026-01-18T14:15:00Z', note: `Sent proposal for ${p.vents} vents at $${basePrice}/vent.`, author: 'Admin' },
      ],
      createdAt: '2026-01-10T08:00:00Z',
      updatedAt: '2026-02-01T16:00:00Z',
      automationActive: p.status === 'Submitted',
      automationStep: p.status === 'Submitted' ? 3 : 0,
    };
  });
};

export const generateResidentialContacts = (): ResidentialContact[] => {
  const firstNames = ['John', 'Mary', 'David', 'Sarah', 'Michael', 'Jennifer', 'Robert', 'Linda', 'William', 'Patricia', 'James', 'Elizabeth', 'Charles', 'Barbara', 'Thomas', 'Susan', 'Daniel', 'Jessica', 'Matthew', 'Karen', 'Anthony', 'Nancy', 'Mark', 'Betty', 'Donald'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris'];
  const streets = ['Oak Lane', 'Maple Dr', 'Cedar St', 'Pine Ave', 'Elm Ct', 'Birch Rd', 'Willow Way', 'Ash Blvd', 'Spruce Pl', 'Holly Ln'];

  const contacts: ResidentialContact[] = [];
  for (let i = 0; i < 50; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const area = SERVICE_AREAS[i % SERVICE_AREAS.length];
    const street = streets[i % streets.length];
    const daysAgo = Math.floor(Math.random() * 500) + 100;
    const lastService = new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];
    const serviceDue = daysAgo > 365;
    const contactDaysAgo = Math.floor(Math.random() * 60) + 1;

    contacts.push({
      id: uuidv4(),
      customerName: `${fn} ${ln}`,
      address: `${1000 + i * 37} ${street}, ${area}, TX 77${String(1 + (i % 9)).padStart(3, '0')}`,
      phone: `(713) ${String(200 + i).padStart(3, '0')}-${String(1000 + i * 7).slice(0, 4)}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@gmail.com`,
      serviceArea: area,
      lastServiceDate: lastService,
      lastContactDate: new Date(Date.now() - contactDaysAgo * 86400000).toISOString().split('T')[0],
      totalCharges: Math.floor(Math.random() * 800) + 150,
      serviceDue,
      automationActive: serviceDue && Math.random() > 0.5,
      automationStep: serviceDue ? Math.floor(Math.random() * 10) : 0,
      optedOut: Math.random() > 0.92,
      notes: '',
    });
  }
  return contacts;
};

export const generateMessages = (bids: CommercialBid[], contacts: ResidentialContact[]): Message[] => {
  const msgs: Message[] = [];
  
  bids.slice(0, 5).forEach(bid => {
    msgs.push(
      { id: uuidv4(), contactId: bid.id, contactName: bid.contactName, contactType: 'commercial', channel: 'email', direction: 'outbound', content: `Hi ${bid.contactName}, following up on the dryer vent cleaning proposal for ${bid.propertyName}. Please let us know if you have any questions.`, timestamp: '2026-02-07T09:00:00Z', read: true },
      { id: uuidv4(), contactId: bid.id, contactName: bid.contactName, contactType: 'commercial', channel: 'email', direction: 'inbound', content: `Thanks for the proposal. We're reviewing it with our board this week. Will get back to you by Friday.`, timestamp: '2026-02-07T14:30:00Z', read: false },
      { id: uuidv4(), contactId: bid.id, contactName: bid.contactName, contactType: 'commercial', channel: 'sms', direction: 'outbound', content: `Hi ${bid.contactName.split(' ')[0]}, just checking in on the ${bid.propertyName} proposal. Any updates? Reply STOP to opt out.`, timestamp: '2026-02-08T10:00:00Z', read: true },
    );
  });

  contacts.filter(c => c.serviceDue).slice(0, 5).forEach(contact => {
    msgs.push(
      { id: uuidv4(), contactId: contact.id, contactName: contact.customerName, contactType: 'residential', channel: 'sms', direction: 'outbound', content: `Hi ${contact.customerName.split(' ')[0]}, your annual dryer vent cleaning is overdue. Clogged vents are the #1 cause of dryer fires. Schedule today! Reply STOP to opt out.`, timestamp: '2026-02-06T11:00:00Z', read: true },
      { id: uuidv4(), contactId: contact.id, contactName: contact.customerName, contactType: 'residential', channel: 'sms', direction: 'inbound', content: `Yes, I'd like to schedule. What times are available next week?`, timestamp: '2026-02-06T15:20:00Z', read: false },
    );
  });

  return msgs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const generateAutomationSequences = (bids: CommercialBid[], contacts: ResidentialContact[]): AutomationSequence[] => {
  const seqs: AutomationSequence[] = [];

  bids.filter(b => b.automationActive).forEach(bid => {
    seqs.push({
      id: uuidv4(),
      recordId: bid.id,
      recordType: 'commercial',
      contactName: bid.contactName,
      status: 'active',
      currentStep: bid.automationStep,
      totalSteps: 10,
      startDate: '2026-01-20T08:00:00Z',
      nextActionDate: '2026-02-10T09:00:00Z',
      nextActionType: SEQUENCE_TYPES[bid.automationStep] || 'email',
    });
  });

  contacts.filter(c => c.automationActive).slice(0, 8).forEach(contact => {
    seqs.push({
      id: uuidv4(),
      recordId: contact.id,
      recordType: 'residential',
      contactName: contact.customerName,
      status: 'active',
      currentStep: contact.automationStep,
      totalSteps: 10,
      startDate: '2026-01-25T08:00:00Z',
      nextActionDate: '2026-02-11T09:00:00Z',
      nextActionType: SEQUENCE_TYPES[contact.automationStep] || 'sms',
    });
  });

  // Add some killed/completed ones
  seqs.push(
    { id: uuidv4(), recordId: 'old1', recordType: 'commercial', contactName: 'Old Contact 1', status: 'killed', currentStep: 4, totalSteps: 10, startDate: '2025-12-01T08:00:00Z', nextActionDate: '', nextActionType: 'email', killReason: 'Inbound message detected' },
    { id: uuidv4(), recordId: 'old2', recordType: 'residential', contactName: 'Old Contact 2', status: 'completed', currentStep: 10, totalSteps: 10, startDate: '2025-11-15T08:00:00Z', nextActionDate: '', nextActionType: 'sms' },
  );

  return seqs;
};
