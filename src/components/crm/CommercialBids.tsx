import React, { useState, useMemo } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { BidStatus, ServiceArea } from '@/data/crmData';
import StatusBadge from './StatusBadge';
import BidFormModal from './BidFormModal';
import BidDetail from './BidDetail';
import { Search, Filter, SortAsc, Building2, DollarSign, MapPin, ChevronDown } from 'lucide-react';

const CommercialBids: React.FC = () => {
  const { bids, searchQuery, selectedBidId, setSelectedBidId, showBidForm, setShowBidForm } = useCRM();
  const [statusFilter, setStatusFilter] = useState<BidStatus | 'All'>('All');
  const [areaFilter, setAreaFilter] = useState<ServiceArea | 'All'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'amount-desc' | 'amount-asc' | 'bid-number'>('newest');
  const [editBid, setEditBid] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState('');

  const effectiveSearch = searchQuery || localSearch;

  const filteredBids = useMemo(() => {
    let result = [...bids];

    if (statusFilter !== 'All') {
      result = result.filter(b => b.status === statusFilter);
    }
    if (areaFilter !== 'All') {
      result = result.filter(b => b.serviceArea === areaFilter);
    }
    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      result = result.filter(b =>
        b.propertyName.toLowerCase().includes(q) ||
        b.companyName.toLowerCase().includes(q) ||
        b.contactName.toLowerCase().includes(q) ||
        b.serviceArea.toLowerCase().includes(q) ||
        String(b.bidNumber).includes(q)
      );
    }

    switch (sortBy) {
      case 'newest': result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); break;
      case 'amount-desc': result.sort((a, b) => b.totalBidPrice - a.totalBidPrice); break;
      case 'amount-asc': result.sort((a, b) => a.totalBidPrice - b.totalBidPrice); break;
      case 'bid-number': result.sort((a, b) => b.bidNumber - a.bidNumber); break;
    }

    return result;
  }, [bids, statusFilter, areaFilter, effectiveSearch, sortBy]);

  const selectedBid = bids.find(b => b.id === selectedBidId);
  const editingBid = bids.find(b => b.id === editBid);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: bids.length };
    bids.forEach(b => { counts[b.status] = (counts[b.status] || 0) + 1; });
    return counts;
  }, [bids]);

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Bids', value: bids.length, icon: <Building2 size={18} />, color: 'text-blue-600 bg-blue-50' },
          { label: 'Pipeline Value', value: `$${(bids.filter(b => ['Submitted', 'Under Review'].includes(b.status)).reduce((s, b) => s + b.totalBidPrice, 0) / 1000).toFixed(1)}K`, icon: <DollarSign size={18} />, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Won', value: bids.filter(b => b.status === 'Won').length, icon: <Building2 size={18} />, color: 'text-green-600 bg-green-50' },
          { label: 'Total Vents', value: bids.reduce((s, b) => s + b.numberOfVents, 0).toLocaleString(), icon: <Building2 size={18} />, color: 'text-orange-600 bg-orange-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}>{s.icon}</div>
            <div>
              <p className="text-lg font-bold text-[#0A1628]">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search bids..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as BidStatus | 'All')}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-orange-400 outline-none cursor-pointer"
            >
              <option value="All">All Status ({statusCounts.All})</option>
              {(['Request', 'Draft', 'Submitted', 'Under Review', 'Won', 'Lost', 'Deferred', 'Cancelled'] as BidStatus[]).map(s => (
                <option key={s} value={s}>{s} ({statusCounts[s] || 0})</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Area filter */}
          <div className="relative">
            <select
              value={areaFilter}
              onChange={e => setAreaFilter(e.target.value as ServiceArea | 'All')}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-orange-400 outline-none cursor-pointer"
            >
              <option value="All">All Areas</option>
              {(['Bellaire', 'River Oaks', 'Galleria', 'Med Center', 'West University', 'Heights', 'Stafford', 'Missouri City'] as ServiceArea[]).map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-orange-400 outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="amount-desc">Amount (High-Low)</option>
              <option value="amount-asc">Amount (Low-High)</option>
              <option value="bid-number">Bid Number</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bids Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Bid #</th>
                <th className="px-4 py-3 font-semibold">Property</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Area</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Contact</th>
                <th className="px-4 py-3 font-semibold">Vents</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold hidden xl:table-cell">Automation</th>
              </tr>
            </thead>
            <tbody>
              {filteredBids.map(bid => (
                <tr
                  key={bid.id}
                  onClick={() => setSelectedBidId(bid.id)}
                  className="border-t border-gray-50 hover:bg-orange-50/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">#{bid.bidNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#0A1628] truncate max-w-[220px]">{bid.propertyName}</p>
                    <p className="text-xs text-gray-400 truncate">{bid.companyName}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                      <MapPin size={12} className="text-orange-400" /> {bid.serviceArea}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-sm text-gray-700">{bid.contactName}</p>
                    <p className="text-xs text-gray-400">{bid.phone}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">{bid.numberOfVents}</td>
                  <td className="px-4 py-3 font-bold font-mono text-[#0A1628]">${bid.totalBidPrice.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={bid.status} /></td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    {bid.automationActive ? (
                      <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">Step {bid.automationStep}/10</span>
                    ) : (
                      <span className="text-xs text-gray-400">--</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredBids.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    <Building2 size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No bids match your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
          Showing {filteredBids.length} of {bids.length} bids
        </div>
      </div>

      {/* Modals */}
      {showBidForm && (
        <BidFormModal onClose={() => setShowBidForm(false)} />
      )}
      {editBid && editingBid && (
        <BidFormModal editBid={editingBid} onClose={() => setEditBid(null)} />
      )}
      {selectedBid && (
        <BidDetail
          bid={selectedBid}
          onClose={() => setSelectedBidId(null)}
          onEdit={() => { setEditBid(selectedBid.id); setSelectedBidId(null); }}
        />
      )}
    </div>
  );
};

export default CommercialBids;
