import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Kanban,
  Calendar,
  BarChart3,
  User,
  Sparkles,
  Code2,
  X,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ViewTab } from '../types';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, applications } = useApp();

  const navItems: { id: ViewTab; label: string; icon: React.ElementType; badge?: string | number; isNew?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'applications',
      label: 'Mes candidatures',
      icon: Briefcase,
      badge: applications.length,
    },
    { id: 'kanban', label: 'Vue Kanban', icon: Kanban },
    { id: 'calendar', label: 'Calendrier et Relances', icon: Calendar },
    { id: 'statistics', label: 'Statistiques et Ratios', icon: BarChart3 },
    { id: 'profile', label: 'Profil Candidat', icon: User },
    {
      id: 'ai-match',
      label: 'AI Job Match',
      icon: Sparkles,
      isNew: true,
    },
    {
      id: 'spring-code',
      label: 'Code Spring Boot et BDD',
      icon: Code2,
      badge: 'Portfolio',
    },
  ];

  const handleSelectTab = (tab: ViewTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  // Quick stats for sidebar
  const pendingCount = applications.filter(
    (a) => a.status === 'ENVOYEE' || a.status === 'EN_ATTENTE'
  ).length;
  const interviewCount = applications.filter((a) => a.status === 'ENTRETIEN').length;
  const acceptedCount = applications.filter((a) => a.status === 'ACCEPTEE').length;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#D5E3E7] bg-[#E6F0F2] transition-transform duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 md:static md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#D5E3E7] px-4 dark:border-slate-800 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#185868] text-white font-black text-sm">
              C
            </div>
            <span className="font-black text-[#185868] dark:text-white">candidly</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-2 text-slate-500 hover:bg-[#D5E5E9] dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Academic Program Banner */}
        <div className="p-4 pb-2">
          <div className="rounded-xl border border-[#C5DCF0] bg-white/70 backdrop-blur-sm p-3 shadow-xs dark:border-cyan-950/40 dark:bg-slate-800/80">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 rounded-lg bg-[#185868] p-1.5 text-white shadow-xs">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#185868] dark:text-slate-100">
                  Espace Candidat
                </p>
                <p className="text-[11px] text-[#52707D] dark:text-slate-400 leading-tight">
                  Gestion de Carrière
                </p>
                <span className="mt-1.5 inline-flex items-center rounded-md bg-[#D9ECF0] px-1.5 py-0.5 text-[10px] font-semibold text-[#185868] dark:bg-teal-950 dark:text-teal-300">
                  Recherche d'emploi 2026
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#185868] text-white shadow-md shadow-[#185868]/20 dark:bg-[#185868] dark:text-white'
                    : 'text-[#456875] hover:bg-[#D8E7EA] hover:text-[#185868] dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-[#5E808E] group-hover:text-[#185868] dark:text-slate-400 dark:group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.isNew && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#CBE5EA] text-[#185868] dark:bg-teal-950 dark:text-teal-300'
                      }`}
                    >
                      BETA
                    </span>
                  )}
                  {item.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-[#D6E6E9] text-[#185868] dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Botanical Artwork & Quote (Matching the reference image) */}
        <div className="p-4 pt-2 border-t border-[#D5E3E7] dark:border-slate-800/80">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#DCEDF0] to-[#CFE4E8] p-3.5 text-center text-[#185868] dark:from-slate-800 dark:to-slate-800/60 dark:text-slate-200">
            {/* Soft decorative botanical leaf SVG */}
            <svg
              className="absolute -bottom-2 -left-2 h-16 w-16 text-[#185868]/15 dark:text-teal-400/10 pointer-events-none"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path d="M20,90 Q40,40 80,20 Q60,70 20,90 Z" />
              <path d="M30,80 Q50,45 85,35" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M15,95 Q35,60 65,30 Q50,80 15,95 Z" />
            </svg>

            <p className="relative z-10 font-serif italic text-[11px] leading-relaxed font-medium text-[#1C5A69] dark:text-teal-200">
              "Chaque candidature est une étape vers ton objectif."
            </p>
            <div className="mt-1.5 mx-auto h-0.5 w-6 rounded-full bg-[#185868]/30 dark:bg-teal-400/30" />
          </div>
        </div>
      </aside>
    </>
  );
};
