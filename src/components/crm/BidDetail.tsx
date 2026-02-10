import React, { useState } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { CommercialBid, BidStatus, LossReason } from '@/data/crmData';
import StatusBadge from './StatusBadge';
import {
  X, Phone, Mail, MapPin, Building2, Calendar, DollarSign,
  ExternalLink, FileText, MessageSquare, Send, Edit3, Clock
} from 'lucide-react';

const STATUSES: BidStatus[] = ['Request', 'Draft', 'Submitted', 'Under Review', 'Cancelled', 'Deferred', 'Lost', 'Won'];
const LOSS_REASONS: LossReason[] = ['Price', 'Timing', 'Scope', 'Board Rejection', 'Inactivity', 'Other'];

interface BidDetailProps {
  bid: CommercialBid;
  onClose: () => void;
  onEdit: () => void;
}

const BidDetail: React.FC<BidDetailProps> = ({ bid, onClose, onEdit }) => {
  const { updateBidStatus, addConversationEntry } = useCRM();
  const [newNote, setNewNote] = useState('');
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [newStatus, setNewStatus] = useState<BidStatus>(bid.status);
  const [executionDate, setExecutionDate] = useState(bid.executionDate || '');
  const [finalPrice, setFinalPrice] = useState(bid.finalPrice || bid.totalBidPrice);
  const [lossReason, setLossReason] = useState<LossReason>(bid.lossReason || 'Other');

  const handleStatusUpdate = () => {
    updateBidStatus(bid.id, newStatus, {
      executionDate: newStatus === 'Won' ? executionDate : undefined,
      finalPrice: newStatus === 'Won' ? finalPrice : undefined,
      lossReason: newStatus === 'Lost' ? lossReason : undefined,
    });
    setShowStatusChange(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addConversationEntry(bid.id, newNote.trim());
    setNewNote('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-4 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono text-gray-400">#{bid.bidNumber}</span>
              <StatusBadge status={bid.status} size="md" />
              {bid.automationActive && (
                <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">Automation Active</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[#0A1628]">{bid.propertyName}</h2>
            <p className="text-sm text-gray-500">{bid.companyName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
              <Edit3 size={18} className="text-gray-400" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Address</p>
                <p className="text-sm text-[#0A1628]">{bid.fullAddress}</p>
                <p className="text-xs text-orange-500 font-medium">{bid.serviceArea}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Contact</p>
                <p className="text-sm font-medium text-[#0A1628]">{bid.contactName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-gray-400 flex-shrink-0" />
              <a href={`tel:${bid.phone}`} className="text-sm text-blue-600 hover:underline">{bid.phone}</a>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-400 flex-shrink-0" />
              <a href={`mailto:${bid.email}`} className="text-sm text-blue-600 hover:underline truncate">{bid.email}</a>
            </div>
          </div>

          {/* Bid Calculator Summary */}
          <div className="bg-gradient-to-br from-[#0A1628] to-[#132240] rounded-xl p-5 text-white">
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">Bid Calculator</h3>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-400">Vents</p>
                <p className="text-lg font-bold font-mono">{bid.numberOfVents}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Price/Vent</p>
                <p className="text-lg font-bold font-mono">${bid.basePricePerVent}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Equipment</p>
                <p className="text-lg font-bold font-mono">${bid.equipmentCost}</p>
              </div>
            </div>
            <div className="border-t border-white/20 pt-3 flex items-center justify-between">
              <span className="text-sm text-gray-300">Total Bid Price</span>
              <span className="text-2xl font-bold font-mono text-orange-400">${bid.totalBidPrice.toLocaleString()}</span>
            </div>
            {bid.status === 'Won' && bid.finalPrice && (
              <div className="border-t border-white/20 pt-3 mt-3 flex items-center justify-between">
                <span className="text-sm text-emerald-300">Final Price (Won)</span>
                <span className="text-xl font-bold font-mono text-emerald-400">${bid.finalPrice.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Conditional: Won fields */}
          {bid.status === 'Won' && (
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar size={14} /> Won Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Execution Date</p>
                  <p className="text-sm font-semibold text-[#0A1628]">{bid.executionDate || 'TBD'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Final Price</p>
                  <p className="text-sm font-semibold text-emerald-700 font-mono">${(bid.finalPrice || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Conditional: Lost fields */}
          {bid.status === 'Lost' && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Loss Details</h3>
              <p className="text-sm text-[#0A1628]">Reason: <span className="font-semibold">{bid.lossReason || 'Not specified'}</span></p>
            </div>
          )}

          {/* Status Change */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status Workflow</h3>
              <button
                onClick={() => setShowStatusChange(!showStatusChange)}
                className="text-xs text-orange-500 hover:text-orange-600 font-semibold"
              >
                {showStatusChange ? 'Cancel' : 'Change Status'}
              </button>
            </div>
            {showStatusChange && (
              <div className="space-y-3">
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as BidStatus)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {newStatus === 'Won' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Execution Date</label>
                      <input
                        type="date"
                        value={executionDate}
                        onChange={e => setExecutionDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Final Price</label>
                      <input
                        type="number"
                        value={finalPrice}
                        onChange={e => setFinalPrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                )}
                {newStatus === 'Lost' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Reason for Loss</label>
                    <select
                      value={lossReason}
                      onChange={e => setLossReason(e.target.value as LossReason)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                    >
                      {LOSS_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                )}
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Update Status
                </button>
              </div>
            )}
            {!showStatusChange && (
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(s => (
                  <span key={s} className={`text-xs px-2 py-1 rounded-full ${
                    s === bid.status ? 'bg-orange-500 text-white font-bold' : 'bg-white text-gray-400 border border-gray-200'
                  }`}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Documentation Links */}
          <div className="flex flex-wrap gap-3">
            {bid.oneDriveFolderLink && (
              <a
                href={bid.oneDriveFolderLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
              >
                <ExternalLink size={14} /> OneDrive Photos
              </a>
            )}
            {bid.proposalDocLink && (
              <a
                href={bid.proposalDocLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-violet-50 text-violet-700 text-sm font-medium rounded-lg hover:bg-violet-100 transition-colors"
              >
                <FileText size={14} /> Proposal Document
              </a>
            )}
          </div>

          {/* Conversation Log */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageSquare size={14} /> Conversation Log
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-3">
              {bid.conversationLog.map(entry => (
                <div key={entry.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-[#0A1628] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {entry.author[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-[#0A1628]">{entry.author}</span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <Clock size={10} />
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{entry.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                placeholder="Add a note..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="px-3 py-2 bg-[#0A1628] hover:bg-[#132240] text-white rounded-lg transition-colors disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidDetail;
