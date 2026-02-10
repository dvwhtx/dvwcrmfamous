import React from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { Search, Bell, Menu, Plus, MessageSquare } from 'lucide-react';

interface TopBarProps {
  onMenuToggle: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const { searchQuery, setSearchQuery, unreadCount, activeView, setShowBidForm, setActiveView } = useCRM();

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    commercial: 'Commercial Bids',
    residential: 'Residential Maintenance',
    inbox: 'Communications Center',
    automation: 'Automation Engine',
    reports: 'Reports & Analytics',
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu size={20} className="text-gray-600" />
        </button>
        <h2 className="text-lg font-bold text-[#0A1628] hidden sm:block">{viewTitles[activeView]}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
        {/* Search */}
        <div className="relative max-w-xs w-full hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none transition-all"
          />
        </div>

        {/* Quick actions */}
        {activeView === 'commercial' && (
          <button
            onClick={() => setShowBidForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Bid</span>
          </button>
        )}

        {/* Inbox shortcut */}
        <button
          onClick={() => setActiveView('inbox')}
          className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MessageSquare size={20} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-[#0A1628] text-white flex items-center justify-center text-sm font-bold ml-1">
          DV
        </div>
      </div>
    </header>
  );
};

export default TopBar;
