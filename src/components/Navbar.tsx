import React, { useState, useRef, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Moon,
  Sun,
  RotateCcw,
  Menu,
  Search,
  Bell,
  ChevronDown,
  Clock,
  Calendar,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    userProfile,
    isDarkMode,
    toggleDarkMode,
    setIsAddModalOpen,
    setEditingApplication,
    clearAllApplications,
    setActiveTab,
    applications,
    setSelectedApplicationId,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute upcoming follow-ups and interviews
  const upcomingReminders = applications.filter(
    (app) => app.nextFollowUpDate || app.interviewDate
  );

  const handleOpenAddModal = () => {
    setEditingApplication(null);
    setIsAddModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E1ECEE] bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Left: Mobile Menu & Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 md:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#185868] text-white shadow-sm shadow-[#185868]/20">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-[#185868] dark:text-white">
                candid<span className="text-[#2A9D8F] dark:text-teal-300">ly</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Search Input */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une entreprise, un poste, une ville..."
            className="w-full rounded-full border border-slate-200/80 bg-[#F4F8F9] pl-10 pr-4 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-[#185868] focus:outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Clear Demo Button */}
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                'Voulez-vous vider les candidatures de démonstration et commencer votre vrai suivi ?'
              )
            ) {
              clearAllApplications();
              setEditingApplication(null);
            }
          }}
          title="Réinitialiser l'espace et commencer mon vrai suivi"
          className="hidden md:flex items-center gap-1.5 rounded-full border border-[#D5E3E7] bg-[#E6F0F2] px-3 py-1.5 text-xs font-semibold text-[#185868] transition-colors hover:bg-[#D4E5E9] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Vider la démo</span>
        </button>

        {/* Bell Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-[#F4F8F9] dark:text-slate-300 dark:hover:bg-slate-800"
            title="Notifications et relances"
          >
            <Bell className="h-4 w-4" />
            {upcomingReminders.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {upcomingReminders.length}
              </span>
            )}
          </button>

          {/* Floating Notification Panel */}
          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Rappels de relances et entretiens ({upcomingReminders.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {upcomingReminders.length > 0 ? (
                  upcomingReminders.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => {
                        setSelectedApplicationId(app.id);
                        setShowNotifications(false);
                      }}
                      className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-[#F4F8F9]/50 p-2.5 transition-colors hover:border-teal-400 hover:bg-white dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs ${app.logoBg || 'bg-teal-700'}`}
                      >
                        {app.logoLetter || app.company.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 truncate">
                            {app.company}
                          </p>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {app.jobTitle}
                          </span>
                        </div>

                        {app.nextFollowUpDate && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>Relance prévue : {app.nextFollowUpDate}</span>
                          </div>
                        )}

                        {app.interviewDate && (
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-purple-600 dark:text-purple-400">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>Entretien : {app.interviewDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <p className="font-semibold text-slate-600 dark:text-slate-300">
                      Aucune relance en attente !
                    </p>
                    <p className="mt-1 text-[11px]">
                      Ajoutez des dates de relance à vos candidatures pour recevoir des rappels ici.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('calendar');
                    setShowNotifications(false);
                  }}
                  className="text-xs font-bold text-teal-700 hover:underline dark:text-teal-400"
                >
                  Voir tout dans le Calendrier →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-[#F4F8F9] dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Basculer thème"
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Add Application Button */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 rounded-full bg-[#185868] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#124552] active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Ajouter</span>
        </button>

        {/* User Avatar & Profile Quick Link */}
        <div
          onClick={() => setActiveTab('profile')}
          className="flex cursor-pointer items-center gap-2.5 rounded-full p-1 pl-2 hover:bg-[#F4F8F9] dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34495E] text-xs font-bold text-white shadow-xs">
            {userProfile.firstName.charAt(0)}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-bold leading-tight text-slate-800 dark:text-slate-200">
              {userProfile.firstName}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
              {userProfile.specialization || 'Candidat'}
            </p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
};

