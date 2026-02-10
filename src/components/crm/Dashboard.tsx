import React from 'react';
import { useCRM } from '@/contexts/CRMContext';
import StatusBadge from './StatusBadge';
import {
  Building2, Home, DollarSign, TrendingUp, AlertTriangle, Zap,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle, MessageSquare
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const {
    bids, contacts, messages, sequences,
    activeBidCount, dueMaintenanceCount, revenuePipeline, wonRevenue, unreadCount,
    setActiveView, setSelectedBidId
  } = useCRM();

  const metrics = [
    { label: 'Active Bids', value: activeBidCount, icon: <Building2 size={22} />, color: 'from-blue-500 to-blue-600', change: '+3', up: true },
    { label: 'Service Due', value: dueMaintenanceCount, icon: <AlertTriangle size={22} />, color: 'from-amber-500 to-orange-500', change: `${dueMaintenanceCount}`, up: false },
    { label: 'Revenue Pipeline', value: `$${(revenuePipeline / 1000).toFixed(1)}K`, icon: <TrendingUp size={22} />, color: 'from-emerald-500 to-emerald-600', change: '+12%', up: true },
    { label: 'Won Revenue', value: `$${(wonRevenue / 1000).toFixed(1)}K`, icon: <DollarSign size={22} />, color: 'from-violet-500 to-purple-600', change: '+8%', up: true },
    { label: 'Active Sequences', value: sequences.filter(s => s.status === 'active').length, icon: <Zap size={22} />, color: 'from-orange-500 to-red-500', change: '', up: true },
    { label: 'Unread Messages', value: unreadCount, icon: <MessageSquare size={22} />, color: 'from-cyan-500 to-blue-500', change: '', up: false },
  ];

  // Status distribution for pie chart
  const statusCounts = ['Request', 'Draft', 'Submitted', 'Under Review', 'Won', 'Lost', 'Deferred', 'Cancelled'].map(s => ({
    name: s,
    value: bids.filter(b => b.status === s).length,
  })).filter(s => s.value > 0);

  const PIE_COLORS = ['#8B5CF6', '#6B7280', '#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#F97316', '#9CA3AF'];

  // Service area distribution for bar chart
  const areaCounts = ['Bellaire', 'River Oaks', 'Galleria', 'Med Center', 'West University', 'Heights', 'Stafford', 'Missouri City'].map(a => ({
    area: a.length > 8 ? a.slice(0, 8) + '.' : a,
    bids: bids.filter(b => b.serviceArea === a).length,
    contacts: contacts.filter(c => c.serviceArea === a).length,
  }));

  const recentBids = [...bids].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#0A1628] via-[#132240] to-[#0A1628] rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10">
          <p className="text-orange-400 text-sm font-semibold mb-1">Monday, February 9, 2026</p>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Good afternoon, Dryer Vent Wizard</h1>
          <p className="text-gray-300 text-sm lg:text-base max-w-xl">
            You have <span className="text-orange-400 font-semibold">{activeBidCount} active bids</span> in the pipeline and{' '}
            <span className="text-amber-400 font-semibold">{dueMaintenanceCount} customers</span> due for annual maintenance.
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setActiveView('commercial')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              View Bids
            </button>
            <button
              onClick={() => setActiveView('residential')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-colors border border-white/20"
            >
              Check Maintenance
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center text-white`}>
                {m.icon}
              </div>
              {m.change && (
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${m.up ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {m.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {m.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-[#0A1628]">{m.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Area Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-[#0A1628] mb-4">Service Area Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaCounts} barGap={4}>
                <XAxis dataKey="area" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="bids" fill="#FF6B2C" radius={[4, 4, 0, 0]} name="Bids" />
                <Bar dataKey="contacts" fill="#0A1628" radius={[4, 4, 0, 0]} name="Contacts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bid Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-[#0A1628] mb-4">Bid Status Breakdown</h3>
          <div className="flex items-center gap-6">
            <div className="h-52 w-52 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                    {statusCounts.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {statusCounts.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-gray-600">{s.name}</span>
                  </div>
                  <span className="font-bold text-[#0A1628]">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bids + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bids */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#0A1628]">Recent Commercial Bids</h3>
            <button onClick={() => setActiveView('commercial')} className="text-xs text-orange-500 hover:text-orange-600 font-semibold">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-2 font-medium">Bid #</th>
                  <th className="pb-2 font-medium">Property</th>
                  <th className="pb-2 font-medium hidden sm:table-cell">Area</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBids.map(bid => (
                  <tr
                    key={bid.id}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => { setSelectedBidId(bid.id); setActiveView('commercial'); }}
                  >
                    <td className="py-3 font-mono text-xs text-gray-500">#{bid.bidNumber}</td>
                    <td className="py-3">
                      <p className="font-medium text-[#0A1628] truncate max-w-[200px]">{bid.propertyName}</p>
                      <p className="text-xs text-gray-400">{bid.companyName}</p>
                    </td>
                    <td className="py-3 text-gray-600 hidden sm:table-cell">{bid.serviceArea}</td>
                    <td className="py-3 font-semibold font-mono">${bid.totalBidPrice.toLocaleString()}</td>
                    <td className="py-3"><StatusBadge status={bid.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-[#0A1628] mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { icon: <CheckCircle2 size={16} className="text-emerald-500" />, text: 'Galleria Tower bid marked Won', time: '2h ago' },
              { icon: <MessageSquare size={16} className="text-blue-500" />, text: 'New reply from James Mitchell', time: '3h ago' },
              { icon: <Zap size={16} className="text-orange-500" />, text: 'Automation step 4 sent to River Oaks', time: '5h ago' },
              { icon: <AlertTriangle size={16} className="text-amber-500" />, text: '12 residential customers overdue', time: '6h ago' },
              { icon: <XCircle size={16} className="text-red-500" />, text: 'Stafford Business Park bid lost', time: '1d ago' },
              { icon: <Clock size={16} className="text-gray-400" />, text: 'Med Center Plaza under review', time: '1d ago' },
              { icon: <Building2 size={16} className="text-violet-500" />, text: 'New bid request from Heights Lofts', time: '2d ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{item.text}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
