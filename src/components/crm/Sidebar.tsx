import React from 'react';
import { useCRM, ActiveView } from '@/contexts/CRMContext';
import {
  LayoutDashboard, Building2, Home, MessageSquare, Zap, BarChart3,
  ChevronLeft, ChevronRight, Flame, X
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const { activeView, setActiveView, activeBidCount, dueMaintenanceCount, unreadCount } = useCRM();

  const navItems: { key: ActiveView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { key: 'commercial', label: 'Commercial Bids', icon: <Building2 size={20} />, badge: activeBidCount },
    { key: 'residential', label: 'Residential', icon: <Home size={20} />, badge: dueMaintenanceCount },
    { key: 'inbox', label: 'Inbox', icon: <MessageSquare size={20} />, badge: unreadCount },
    { key: 'automation', label: 'Automation', icon: <Zap size={20} /> },
    { key: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
  ];

  const handleNav = (key: ActiveView) => {
    setActiveView(key);
    onMobileClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onMobileClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 bg-[#0A1628] text-white flex flex-col transition-all duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}>
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-white/10 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <Flame size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold truncate leading-tight">Dryer Vent Wizard</h1>
                <p className="text-[10px] text-orange-400 truncate leading-tight">Bellaire CRM</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Flame size={18} className="text-white" />
            </div>
          )}
          <button onClick={onMobileClose} className="lg:hidden p-1 hover:bg-white/10 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-orange-500/20 text-orange-400 shadow-lg shadow-orange-500/10'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-orange-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle - desktop only */}
        <div className="hidden lg:flex border-t border-white/10 p-2">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white text-sm transition-all"
          >
            {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
