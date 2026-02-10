import React, { useMemo } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
  DollarSign, TrendingUp, Building2, Home, Calendar, Target,
  ArrowUpRight, Users, Zap
} from 'lucide-react';

const ReportsPanel: React.FC = () => {
  const { bids, contacts, sequences } = useCRM();

  const wonBids = bids.filter(b => b.status === 'Won');
  const totalWonRevenue = wonBids.reduce((s, b) => s + (b.finalPrice || b.totalBidPrice), 0);
  const avgBidSize = bids.length > 0 ? bids.reduce((s, b) => s + b.totalBidPrice, 0) / bids.length : 0;
  const winRate = bids.length > 0 ? ((wonBids.length / bids.filter(b => ['Won', 'Lost'].includes(b.status)).length) * 100) || 0 : 0;
  const totalVentsCleaned = wonBids.reduce((s, b) => s + b.numberOfVents, 0);

  // Monthly revenue simulation
  const monthlyData = [
    { month: 'Sep', commercial: 8200, residential: 4100 },
    { month: 'Oct', commercial: 12500, residential: 5200 },
    { month: 'Nov', commercial: 9800, residential: 6800 },
    { month: 'Dec', commercial: 15200, residential: 7100 },
    { month: 'Jan', commercial: 18400, residential: 5900 },
    { month: 'Feb', commercial: totalWonRevenue * 0.3, residential: contacts.slice(0, 20).reduce((s, c) => s + c.totalCharges, 0) * 0.2 },
  ];

  // Service area revenue
  const areaRevenue = ['Bellaire', 'River Oaks', 'Galleria', 'Med Center', 'West University', 'Heights', 'Stafford', 'Missouri City'].map(area => ({
    area: area.length > 10 ? area.slice(0, 10) + '.' : area,
    revenue: bids.filter(b => b.serviceArea === area && b.status === 'Won').reduce((s, b) => s + (b.finalPrice || b.totalBidPrice), 0),
    pipeline: bids.filter(b => b.serviceArea === area && ['Submitted', 'Under Review'].includes(b.status)).reduce((s, b) => s + b.totalBidPrice, 0),
  }));

  // Conversion funnel
  const funnel = [
    { stage: 'Requests', count: bids.filter(b => b.status === 'Request').length + bids.length, fill: '#6366F1' },
    { stage: 'Drafted', count: bids.filter(b => !['Request'].includes(b.status)).length, fill: '#3B82F6' },
    { stage: 'Submitted', count: bids.filter(b => ['Submitted', 'Under Review', 'Won', 'Lost'].includes(b.status)).length, fill: '#F59E0B' },
    { stage: 'Reviewed', count: bids.filter(b => ['Under Review', 'Won', 'Lost'].includes(b.status)).length, fill: '#F97316' },
    { stage: 'Won', count: wonBids.length, fill: '#10B981' },
  ];

  // Automation effectiveness
  const automationData = [
    { name: 'Active', value: sequences.filter(s => s.status === 'active').length, fill: '#10B981' },
    { name: 'Completed', value: sequences.filter(s => s.status === 'completed').length, fill: '#3B82F6' },
    { name: 'Killed', value: sequences.filter(s => s.status === 'killed').length, fill: '#EF4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Won Revenue', value: `$${(totalWonRevenue / 1000).toFixed(1)}K`, icon: <DollarSign size={20} />, color: 'from-emerald-500 to-emerald-600', change: '+18%' },
          { label: 'Win Rate', value: `${winRate.toFixed(0)}%`, icon: <Target size={20} />, color: 'from-blue-500 to-blue-600', change: '+5%' },
          { label: 'Avg Bid Size', value: `$${(avgBidSize / 1000).toFixed(1)}K`, icon: <TrendingUp size={20} />, color: 'from-violet-500 to-purple-600', change: '+12%' },
          { label: 'Vents Cleaned', value: totalVentsCleaned.toLocaleString(), icon: <Building2 size={20} />, color: 'from-orange-500 to-red-500', change: '' },
        ].map((m, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center text-white`}>
                {m.icon}
              </div>
              {m.change && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight size={12} /> {m.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-[#0A1628]">{m.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Trend */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-[#0A1628] mb-4">Revenue Trend (6 Months)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B2C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B2C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A1628" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0A1628" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="commercial" stroke="#FF6B2C" fill="url(#colorComm)" strokeWidth={2} name="Commercial" />
              <Area type="monotone" dataKey="residential" stroke="#0A1628" fill="url(#colorRes)" strokeWidth={2} name="Residential" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Area Revenue */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-[#0A1628] mb-4">Revenue by Service Area</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaRevenue} layout="vertical" barGap={2}>
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="area" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#10B981" radius={[0, 4, 4, 0]} name="Won Revenue" />
                <Bar dataKey="pipeline" fill="#F59E0B" radius={[0, 4, 4, 0]} name="Pipeline" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-[#0A1628] mb-4">Bid Conversion Funnel</h3>
          <div className="space-y-3">
            {funnel.map((stage, i) => {
              const maxCount = funnel[0].count || 1;
              const pct = (stage.count / maxCount) * 100;
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{stage.stage}</span>
                    <span className="font-bold text-[#0A1628]">{stage.count}</span>
                  </div>
                  <div className="h-8 bg-gray-50 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all flex items-center px-3"
                      style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: stage.fill }}
                    >
                      <span className="text-xs font-bold text-white">{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Automation & Residential */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Automation Effectiveness */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-[#0A1628] mb-4">Automation Sequences</h3>
          <div className="flex items-center gap-6">
            <div className="h-40 w-40 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={automationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                    {automationData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {automationData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.fill }} />
                    <span className="text-sm text-gray-600">{d.name}</span>
                  </div>
                  <span className="font-bold text-[#0A1628]">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Residential Summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-[#0A1628] mb-4">Residential Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-emerald-600" />
                <span className="text-sm text-gray-700">Total Contacts</span>
              </div>
              <span className="font-bold text-[#0A1628]">{contacts.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-red-600" />
                <span className="text-sm text-gray-700">Service Overdue ({'>'}365 days)</span>
              </div>
              <span className="font-bold text-red-600">{contacts.filter(c => c.serviceDue).length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-600" />
                <span className="text-sm text-gray-700">Active Reminders</span>
              </div>
              <span className="font-bold text-amber-600">{contacts.filter(c => c.automationActive).length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-gray-600" />
                <span className="text-sm text-gray-700">Lifetime Revenue</span>
              </div>
              <span className="font-bold text-[#0A1628]">${contacts.reduce((s, c) => s + c.totalCharges, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPanel;
