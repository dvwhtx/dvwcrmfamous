import React, { useState, useMemo } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { SEQUENCE_DAYS, SEQUENCE_TYPES } from '@/data/crmData';
import {
  Zap, AlertTriangle, CheckCircle2, XCircle, Pause, Play,
  Building2, Home, Clock, Mail, MessageSquare, Shield, ChevronDown,
  AlertCircle, StopCircle
} from 'lucide-react';

const AutomationPanel: React.FC = () => {
  const { sequences, killSequence } = useCRM();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'killed' | 'completed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'commercial' | 'residential'>('all');
  const [showSequenceMap, setShowSequenceMap] = useState(true);

  const filtered = useMemo(() => {
    let result = [...sequences];
    if (statusFilter !== 'all') result = result.filter(s => s.status === statusFilter);
    if (typeFilter !== 'all') result = result.filter(s => s.recordType === typeFilter);
    return result;
  }, [sequences, statusFilter, typeFilter]);

  const activeCount = sequences.filter(s => s.status === 'active').length;
  const killedCount = sequences.filter(s => s.status === 'killed').length;
  const completedCount = sequences.filter(s => s.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Compliance Banner */}
      <div className="bg-gradient-to-r from-[#0A1628] via-[#132240] to-[#0A1628] rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Shield size={24} className="text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold mb-1">10DLC Compliance Engine</h2>
            <p className="text-sm text-gray-300 max-w-xl">
              All outbound SMS messages include mandatory "Reply STOP to opt out" footer. 
              Kill-switch automatically terminates sequences on status change or inbound message detection.
            </p>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 size={14} /> STOP opt-out enabled
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 size={14} /> Kill-switch active
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 size={14} /> A2P monitoring
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Sequences', value: activeCount, icon: <Play size={18} />, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Killed (Safety)', value: killedCount, icon: <StopCircle size={18} />, color: 'text-red-600 bg-red-50' },
          { label: 'Completed', value: completedCount, icon: <CheckCircle2 size={18} />, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Sequences', value: sequences.length, icon: <Zap size={18} />, color: 'text-orange-600 bg-orange-50' },
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

      {/* Sequence Map */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <button
          onClick={() => setShowSequenceMap(!showSequenceMap)}
          className="flex items-center justify-between w-full mb-4"
        >
          <h3 className="text-sm font-bold text-[#0A1628]">30-Day Sequence Map (10 Steps)</h3>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${showSequenceMap ? 'rotate-180' : ''}`} />
        </button>
        {showSequenceMap && (
          <div className="overflow-x-auto">
            <div className="flex items-center gap-2 min-w-[600px]">
              {SEQUENCE_DAYS.map((day, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      SEQUENCE_TYPES[i] === 'email' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {SEQUENCE_TYPES[i] === 'email' ? <Mail size={18} /> : <MessageSquare size={18} />}
                    </div>
                    <p className="text-[10px] font-bold text-[#0A1628]">Day {day}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{SEQUENCE_TYPES[i]}</p>
                    <p className="text-[10px] text-gray-400">Step {i + 1}</p>
                  </div>
                  {i < 9 && (
                    <div className="w-6 h-px bg-gray-200 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Every SMS step includes "Reply STOP to opt out" footer. Sequence auto-terminates on inbound reply or status change.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {(['all', 'active', 'killed', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                statusFilter === f ? 'bg-white text-[#0A1628] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {(['all', 'commercial', 'residential'] as const).map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                typeFilter === f ? 'bg-white text-[#0A1628] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Sequences Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Progress</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Next Action</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(seq => (
                <tr key={seq.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#0A1628]">{seq.contactName}</p>
                    <p className="text-xs text-gray-400">Started {new Date(seq.startDate).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      seq.recordType === 'commercial' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {seq.recordType === 'commercial' ? <Building2 size={10} /> : <Home size={10} />}
                      {seq.recordType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            seq.status === 'killed' ? 'bg-red-400' :
                            seq.status === 'completed' ? 'bg-emerald-400' : 'bg-orange-400'
                          }`}
                          style={{ width: `${(seq.currentStep / seq.totalSteps) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-500">{seq.currentStep}/{seq.totalSteps}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {seq.status === 'active' && seq.nextActionDate ? (
                      <div className="flex items-center gap-1.5">
                        {seq.nextActionType === 'email' ? (
                          <Mail size={12} className="text-blue-500" />
                        ) : (
                          <MessageSquare size={12} className="text-green-500" />
                        )}
                        <span className="text-xs text-gray-600">
                          {new Date(seq.nextActionDate).toLocaleDateString()} - {seq.nextActionType.toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                      seq.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                      seq.status === 'killed' ? 'bg-red-50 text-red-600' :
                      seq.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {seq.status === 'active' && <Play size={10} />}
                      {seq.status === 'killed' && <XCircle size={10} />}
                      {seq.status === 'completed' && <CheckCircle2 size={10} />}
                      {seq.status === 'paused' && <Pause size={10} />}
                      {seq.status}
                    </span>
                    {seq.killReason && (
                      <p className="text-[10px] text-red-400 mt-0.5">{seq.killReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {seq.status === 'active' && (
                      <button
                        onClick={() => killSequence(seq.id, 'Manual kill-switch activated')}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <StopCircle size={12} /> Kill
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <Zap size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No sequences match your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AutomationPanel;
