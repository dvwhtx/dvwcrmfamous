import React, { useState, useEffect } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { ServiceArea, BidStatus, CommercialBid } from '@/data/crmData';
import { X, Calculator } from 'lucide-react';

const SERVICE_AREAS: ServiceArea[] = ['Bellaire', 'River Oaks', 'Galleria', 'Med Center', 'West University', 'Heights', 'Stafford', 'Missouri City'];
const STATUSES: BidStatus[] = ['Request', 'Draft', 'Submitted', 'Under Review', 'Cancelled', 'Deferred', 'Lost', 'Won'];

interface BidFormModalProps {
  editBid?: CommercialBid | null;
  onClose: () => void;
}

const BidFormModal: React.FC<BidFormModalProps> = ({ editBid, onClose }) => {
  const { addBid, updateBid } = useCRM();

  const [form, setForm] = useState({
    propertyName: '',
    serviceArea: 'Bellaire' as ServiceArea,
    fullAddress: '',
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    numberOfVents: 0,
    basePricePerVent: 55,
    equipmentCost: 0,
    status: 'Request' as BidStatus,
    oneDriveFolderLink: '',
    proposalDocLink: '',
  });

  useEffect(() => {
    if (editBid) {
      setForm({
        propertyName: editBid.propertyName,
        serviceArea: editBid.serviceArea,
        fullAddress: editBid.fullAddress,
        companyName: editBid.companyName,
        contactName: editBid.contactName,
        phone: editBid.phone,
        email: editBid.email,
        numberOfVents: editBid.numberOfVents,
        basePricePerVent: editBid.basePricePerVent,
        equipmentCost: editBid.equipmentCost,
        status: editBid.status,
        oneDriveFolderLink: editBid.oneDriveFolderLink,
        proposalDocLink: editBid.proposalDocLink,
      });
    }
  }, [editBid]);

  const totalBidPrice = form.numberOfVents * form.basePricePerVent + form.equipmentCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editBid) {
      updateBid(editBid.id, { ...form, totalBidPrice });
    } else {
      addBid({ ...form, totalBidPrice });
    }
    onClose();
  };

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-8 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">{editBid ? 'Edit Bid' : 'New Commercial Bid'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{editBid ? `Bid #${editBid.bidNumber}` : 'Fill in all required fields'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Property Info */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Property Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Property Name *</label>
                <input
                  required
                  value={form.propertyName}
                  onChange={e => updateField('propertyName', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
                  placeholder="e.g., Galleria Tower Apartments"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Houston Service Area *</label>
                <select
                  value={form.serviceArea}
                  onChange={e => updateField('serviceArea', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none bg-white"
                >
                  {SERVICE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Address *</label>
                <input
                  required
                  value={form.fullAddress}
                  onChange={e => updateField('fullAddress', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
                  placeholder="Street, City, State, ZIP"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Company Name *</label>
                <input
                  required
                  value={form.companyName}
                  onChange={e => updateField('companyName', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contact Name *</label>
                <input
                  required
                  value={form.contactName}
                  onChange={e => updateField('contactName', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                <input
                  required
                  value={form.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
                  placeholder="(713) 555-0000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => updateField('email', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bid Calculator */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calculator size={14} /> Bid Calculator
            </h3>
            <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-xl p-4 border border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Number of Vents *</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.numberOfVents || ''}
                    onChange={e => updateField('numberOfVents', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Base Price / Vent ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.basePricePerVent || ''}
                    onChange={e => updateField('basePricePerVent', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Equipment Cost ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.equipmentCost || ''}
                    onChange={e => updateField('equipmentCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <span className="font-mono">{form.numberOfVents}</span> vents × <span className="font-mono">${form.basePricePerVent}</span> + <span className="font-mono">${form.equipmentCost}</span> equip.
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total Bid Price</p>
                  <p className="text-2xl font-bold text-[#0A1628] font-mono">${totalBidPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Status & Documentation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => updateField('status', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none bg-white"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">OneDrive Folder Link</label>
                <input
                  value={form.oneDriveFolderLink}
                  onChange={e => updateField('oneDriveFolderLink', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
                  placeholder="https://onedrive.live.com/..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Proposal Document Link</label>
                <input
                  value={form.proposalDocLink}
                  onChange={e => updateField('proposalDocLink', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
                  placeholder="https://onedrive.live.com/doc/..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              {editBid ? 'Update Bid' : 'Create Bid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BidFormModal;
