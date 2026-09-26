import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { ApplicationModal } from './components/ApplicationModal';
import { ApplicationDetailModal } from './components/ApplicationDetailModal';
import { DashboardView } from './views/DashboardView';
import { ApplicationsView } from './views/ApplicationsView';
import { KanbanView } from './views/KanbanView';
import { CalendarView } from './views/CalendarView';
import { StatisticsView } from './views/StatisticsView';
import { ProfileView } from './views/ProfileView';
import { AiJobMatchView } from './views/AiJobMatchView';
import { SpringBootCodeView } from './views/SpringBootCodeView';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'applications':
        return <ApplicationsView />;
      case 'kanban':
        return <KanbanView />;
      case 'calendar':
        return <CalendarView />;
      case 'statistics':
        return <StatisticsView />;
      case 'profile':
        return <ProfileView />;
      case 'ai-match':
        return <AiJobMatchView />;
      case 'spring-code':
        return <SpringBootCodeView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#F3F7F8] text-slate-800 dark:bg-slate-950 dark:text-slate-100 overflow-hidden">
      {/* Top Navigation */}
      <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <ApplicationModal />
      <ApplicationDetailModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
