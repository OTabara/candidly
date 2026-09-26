import React, { useState, useRef, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Moon,
  Sun,
  Menu,
  Search,
  Bell,
  ChevronDown,
  Clock,
  Calendar,
  X,
  Download,
  Upload,
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
    activeTab,
    setActiveTab,
    applications,
    setSelectedApplicationId,
    updateApplication,
    addToast,
    exportData,
    importData,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        importData(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Track read notification keys in localStorage
  const [readNotifKeys, setReadNotifKeys] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('candidly_read_notifs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

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

  // Compute upcoming follow-ups and interviews (excluding final statuses)
  const upcomingReminders = applications.filter(
    (app) =>
      !['ACCEPTEE', 'REFUSEE', 'ABANDONNEE'].includes(app.status) &&
      (app.nextFollowUpDate || app.interviewDate)
  );

  const getNotifKey = (app: typeof applications[0]) =>
    `${app.id}-${app.nextFollowUpDate || ''}-${app.interviewDate || ''}`;

  // Unread count
  const unreadReminders = upcomingReminders.filter(
    (app) => !readNotifKeys.includes(getNotifKey(app))
  );

  const markAllAsRead = () => {
    const keys = upcomingReminders.map(getNotifKey);
    setReadNotifKeys(keys);
    try {
      localStorage.setItem('candidly_read_notifs', JSON.stringify(keys));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState) {
      markAllAsRead();
    }
  };

  const handleMarkFollowUpDone = (appId: string, company: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateApplication(appId, { nextFollowUpDate: '' });
    addToast(`Relance marquée comme faite pour ${company} !`, 'success');
  };

  const handleOpenAddModal = () => {
    setEditingApplication(null);
    setIsAddModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#E1ECEE] bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
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
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Hidden File Input for Import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        {/* Export / Import Data Buttons */}
        <button
          type="button"
          onClick={exportData}
          title="Sauvegarder mes données dans un fichier JSON pour passer d'un appareil à l'autre"
          className="hidden lg:flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 transition-colors hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-300"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Sauvegarder</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Importer un fichier de sauvegarde JSON pour restaurer vos candidatures"
          className="hidden lg:flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-[#F4F8F9] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <Upload className="h-3.5 w-3.5" />
          <span>Importer</span>
        </button>

        {/* Bell Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={handleToggleNotifications}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-[#F4F8F9] dark:text-slate-300 dark:hover:bg-slate-800"
            title="Notifications et relances"
          >
            <Bell className="h-4 w-4" />
            {unreadReminders.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadReminders.length}
              </span>
            )}
          </button>

          {/* Floating Notification Panel */}
          {showNotifications && (
            <div className="fixed inset-x-3 top-16 md:absolute md:inset-auto md:right-0 md:top-11 w-auto md:w-96 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-[60]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Rappels ({upcomingReminders.length})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {upcomingReminders.length > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[11px] font-semibold text-teal-700 hover:underline dark:text-teal-400"
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
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
                      className="group flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-[#F4F8F9]/50 p-2.5 transition-colors hover:border-teal-400 hover:bg-white dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
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
                            <span className="text-[10px] font-semibold text-slate-400 truncate ml-1">
                              {app.jobTitle}
                            </span>
                          </div>

                          {app.nextFollowUpDate && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span>Relance : {app.nextFollowUpDate}</span>
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

                      {/* Quick Mark Done Button */}
                      {app.nextFollowUpDate && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkFollowUpDone(app.id, app.company, e)}
                          title="Marquer la relance comme faite"
                          className="shrink-0 rounded-lg border border-teal-200 bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-800 transition-colors hover:bg-teal-600 hover:text-white dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-300"
                        >
                          ✓ Faite
                        </button>
                      )}
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
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          title="Accéder à mon Profil et CV"
          className={`flex cursor-pointer items-center gap-2 rounded-full p-1 transition-all ${
            activeTab === 'profile'
              ? 'ring-2 ring-[#185868] bg-[#E6F0F2] dark:bg-slate-800'
              : 'hover:bg-[#F4F8F9] dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#185868] text-xs font-black text-white shadow-xs">
            {userProfile.firstName.charAt(0)}
          </div>
          <div className="hidden text-left sm:block pr-1">
            <p className="text-xs font-bold leading-tight text-slate-800 dark:text-slate-200">
              {userProfile.firstName}
            </p>
            <p className="text-[10px] font-semibold text-teal-700 dark:text-teal-400 truncate max-w-[120px]">
              Profil et CV
            </p>
          </div>
        </button>
      </div>
    </header>
  );
};

