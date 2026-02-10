import React, { useState, useMemo } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { ServiceArea } from '@/data/crmData';
import {
  Search, Phone, Mail, AlertTriangle, CheckCircle2, Clock, MapPin,
  ChevronDown, Home, Filter, ChevronLeft, ChevronRight, Calendar, DollarSign
} from 'lucide-react';

const ResidentialContacts: React.FC = () => {
  const { contacts, searchQuery } = useCRM();
  const [localSearch, setLocalSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState<ServiceArea | 'All'>('All');
  const [dueFilter, setDueFilter] = useState<'all' | 'due' | 'current'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'last-service' | 'charges'>('name');
  const [page, setPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const perPage = 15;

  const effectiveSearch = searchQuery || localSearch;

  const filtered = useMemo(() => {
    let result = [...contacts];

    if (areaFilter !== 'All') result = result.filter(c => c.serviceArea === areaFilter);
    if (dueFilter === 'due') result = result.filter(c => c.serviceDue);
    if (dueFilter === 'current') result = result.filter(c => !c.serviceDue);

    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      result = result.filter(c =>
        c.customerName.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'name': result.sort((a, b) => a.customerName.localeCompare(b.customerName)); break;
      case 'last-service': result.sort((a, b) => new Date(a.lastServiceDate).getTime() - new Date(b.lastServiceDate).getTime()); break;
      case 'charges': result.sort((a, b) => b.totalCharges - a.totalCharges); break;
    }

    return result;
  }, [contacts, areaFilter, dueFilter, effectiveSearch, sortBy]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const dueCount = contacts.filter(c => c.serviceDue).length;
  const selected = contacts.find(c => c.id === selectedContact);

  const daysSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / 86400000);
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Contacts', value: contacts.length.toLocaleString(), icon: <Home size={18} />, color: 'text-blue-600 bg-blue-50' },
          { label: 'Service Due', value: dueCount, icon: <AlertTriangle size={18} />, color: 'text-amber-600 bg-amber-50' },
          { label: 'Current', value: contacts.length - dueCount, icon: <CheckCircle2 size={18} />, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Total Revenue', value: `$${(contacts.reduce((s, c) => s + c.totalCharges, 0) / 1000).toFixed(1)}K`, icon: <DollarSign size={18} />, color: 'text-violet-600 bg-violet-50' },
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
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={localSearch}
              onChange={e => { setLocalSearch(e.target.value); setPage(1); }}
              placeholder="Search contacts..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none"
            />
          </div>

          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            {[
              { key: 'all', label: 'All' },
              { key: 'due', label: `Due (${dueCount})` },
              { key: 'current', label: 'Current' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => { setDueFilter(f.key as any); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  dueFilter === f.key ? 'bg-white text-[#0A1628] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={areaFilter}
              onChange={e => { setAreaFilter(e.target.value as any); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-orange-400 outline-none cursor-pointer"
            >
              <option value="All">All Areas</option>
              {(['Bellaire', 'River Oaks', 'Galleria', 'Med Center', 'West University', 'Heights', 'Stafford', 'Missouri City'] as ServiceArea[]).map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-orange-400 outline-none cursor-pointer"
            >
              <option value="name">Sort: Name</option>
              <option value="last-service">Sort: Last Service</option>
              <option value="charges">Sort: Revenue</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Area</th>
                <th className="px-4 py-3 font-semibold">Last Service</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Last Contact</th>
                <th className="px-4 py-3 font-semibold">Charges</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(contact => {
                const days = daysSince(contact.lastServiceDate);
                return (
                  <tr
                    key={contact.id}
                    onClick={() => setSelectedContact(selectedContact === contact.id ? null : contact.id)}
                    className={`border-t border-gray-50 cursor-pointer transition-colors ${
                      selectedContact === contact.id ? 'bg-orange-50/50' : 'hover:bg-gray-50'
                    } ${contact.serviceDue ? '' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#0A1628]">{contact.customerName}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">{contact.address}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                        <MapPin size={12} className="text-orange-400" /> {contact.serviceArea}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{contact.lastServiceDate}</p>
                      <p className={`text-xs font-medium ${days > 365 ? 'text-red-500' : days > 300 ? 'text-amber-500' : 'text-gray-400'}`}>
                        {days} days ago
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600">{contact.lastContactDate}</td>
                    <td className="px-4 py-3 font-bold font-mono text-[#0A1628]">${contact.totalCharges}</td>
                    <td className="px-4 py-3">
                      {contact.serviceDue ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                          <AlertTriangle size={10} /> Due
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full">
                          <CheckCircle2 size={10} /> Current
                        </span>
                      )}
                      {contact.optedOut && (
                        <span className="ml-1 text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">Opted Out</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <a
                          href={`tel:${contact.phone}`}
                          onClick={e => e.stopPropagation()}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Call"
                        >
                          <Phone size={14} className="text-blue-500" />
                        </a>
                        <a
                          href={`mailto:${contact.email}`}
                          onClick={e => e.stopPropagation()}
                          className="p-1.5 hover:bg-violet-50 rounded-lg transition-colors"
                          title="Email"
                        >
                          <Mail size={14} className="text-violet-500" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expanded detail */}
        {selected && (
          <div className="border-t border-orange-200 bg-orange-50/30 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Full Address</p>
                <p className="text-sm font-medium text-[#0A1628]">{selected.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Contact Info</p>
                <p className="text-sm">{selected.phone}</p>
                <p className="text-sm text-blue-600">{selected.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Automation</p>
                {selected.automationActive ? (
                  <p className="text-sm text-orange-600 font-medium">Active - Step {selected.automationStep}/10</p>
                ) : (
                  <p className="text-sm text-gray-400">Inactive</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 hover:bg-gray-200 rounded-lg disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 text-xs font-semibold rounded-lg transition-colors ${
                    page === pageNum ? 'bg-orange-500 text-white' : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && <span className="text-xs text-gray-400 px-1">...</span>}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 hover:bg-gray-200 rounded-lg disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentialContacts;
