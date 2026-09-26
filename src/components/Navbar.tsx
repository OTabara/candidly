import React from 'react';
import {
  Briefcase,
  Plus,
  Moon,
  Sun,
  RotateCcw,
  Sparkles,
  Menu,
  Search,
  Bell,
  ChevronDown,
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
    resetToDemoData,
    clearAllApplications,
    setActiveTab,
  } = useApp();

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

      {/* Middle: Search Input (matching reference image) */}
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
        {/* Clear Demo & Start Real Tracking Button */}
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
              setIsAddModalOpen(true);
            }
          }}
          title="Réinitialiser l'espace et commencer mon vrai suivi"
          className="hidden md:flex items-center gap-1.5 rounded-full border border-[#D5E3E7] bg-[#E6F0F2] px-3 py-1.5 text-xs font-semibold text-[#185868] transition-colors hover:bg-[#D4E5E9] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Vider la démo</span>
        </button>

        {/* Bell Notifications */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-[#F4F8F9] dark:text-slate-300 dark:hover:bg-slate-800"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

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

        {/* User Avatar & Profile Quick Link (Matching reference top-right) */}
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
