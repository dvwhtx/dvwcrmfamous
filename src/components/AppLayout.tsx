import React, { useState } from 'react';
import { CRMProvider, useCRM } from '@/contexts/CRMContext';
import Sidebar from './crm/Sidebar';
import TopBar from './crm/TopBar';
import Dashboard from './crm/Dashboard';
import CommercialBids from './crm/CommercialBids';
import ResidentialContacts from './crm/ResidentialContacts';
import CommunicationsCenter from './crm/CommunicationsCenter';
import AutomationPanel from './crm/AutomationPanel';
import ReportsPanel from './crm/ReportsPanel';
import { Flame, Loader2 } from 'lucide-react';

const LoadingScreen: React.FC = () => (
  <div className="flex h-screen items-center justify-center bg-[#0A1628]">
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
        <Flame size={32} className="text-white" />
      </div>
      <h1 className="text-xl font-bold text-white mb-2">Dryer Vent Wizard CRM</h1>
      <p className="text-gray-400 text-sm mb-4">Connecting to database...</p>
      <Loader2 size={24} className="text-orange-400 animate-spin mx-auto" />
    </div>
  </div>
);

const CRMApp: React.FC = () => {
  const { activeView, isLoading } = useCRM();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) return <LoadingScreen />;

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'commercial': return <CommercialBids />;
      case 'residential': return <ResidentialContacts />;
      case 'inbox': return <CommunicationsCenter />;
      case 'automation': return <AutomationPanel />;
      case 'reports': return <ReportsPanel />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F5F6F8] overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <CRMProvider>
      <CRMApp />
    </CRMProvider>
  );
};

export default AppLayout;
