import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  JobApplication,
  UserProfile,
  ApplicationStatus,
  Domain,
  ContractType,
  ViewTab,
  ToastMessage,
  TimelineEvent,
} from '../types';
import { INITIAL_APPLICATIONS, DEFAULT_USER_PROFILE } from '../data/initialData';

interface AppContextType {
  applications: JobApplication[];
  userProfile: UserProfile;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  selectedApplicationId: string | null;
  setSelectedApplicationId: (id: string | null) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingApplication: JobApplication | null;
  setEditingApplication: (app: JobApplication | null) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Search and Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterStatus: ApplicationStatus | 'ALL';
  setFilterStatus: (s: ApplicationStatus | 'ALL') => void;
  filterDomain: Domain | 'ALL';
  setFilterDomain: (d: Domain | 'ALL') => void;
  filterContract: ContractType | 'ALL';
  setFilterContract: (c: ContractType | 'ALL') => void;
  filterLocation: string;
  setFilterLocation: (loc: string) => void;
  sortBy: 'date-desc' | 'date-asc' | 'company' | 'status';
  setSortBy: (sort: 'date-desc' | 'date-asc' | 'company' | 'status') => void;
  clearFilters: () => void;
  
  // Actions
  addApplication: (appData: Partial<JobApplication>) => JobApplication;
  updateApplication: (id: string, updates: Partial<JobApplication>) => void;
  deleteApplication: (id: string) => void;
  updateStatus: (id: string, newStatus: ApplicationStatus) => void;
  addTimelineEvent: (appId: string, event: Omit<TimelineEvent, 'id'>) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  resetToDemoData: () => void;
  clearAllApplications: () => void;
  
  // Toast notifications
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
}

const STORAGE_KEY_APPS = 'jobtracker_apps_v1';
const STORAGE_KEY_PROFILE = 'jobtracker_profile_v1';
const STORAGE_KEY_DARK = 'jobtracker_dark_mode_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Applications state
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_APPS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse applications from storage', e);
    }
    return INITIAL_APPLICATIONS;
  });

  // Profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse profile from storage', e);
    }
    return DEFAULT_USER_PROFILE;
  });

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DARK);
      if (stored !== null) return JSON.parse(stored);
    } catch {}
    return false;
  });

  // Navigation
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [filterDomain, setFilterDomain] = useState<Domain | 'ALL'>('ALL');
  const [filterContract, setFilterContract] = useState<ContractType | 'ALL'>('ALL');
  const [filterLocation, setFilterLocation] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'company' | 'status'>('date-desc');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync dark mode class
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_DARK, JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Persist applications
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(applications));
    } catch (e) {
      console.error('Storage write error', e);
    }
  }, [applications]);

  // Persist profile
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
    } catch (e) {
      console.error('Storage write error', e);
    }
  }, [userProfile]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('ALL');
    setFilterDomain('ALL');
    setFilterContract('ALL');
    setFilterLocation('');
    setSortBy('date-desc');
  };

  const addApplication = (appData: Partial<JobApplication>): JobApplication => {
    const now = new Date().toISOString();
    const colors = [
      'bg-teal-700',
      'bg-teal-600',
      'bg-blue-600',
      'bg-violet-600',
      'bg-amber-600',
      'bg-teal-600',
      'bg-rose-600',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const company = appData.company?.trim() || 'Nouvelle Entreprise';

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      company,
      jobTitle: appData.jobTitle?.trim() || 'Poste non précisé',
      contractType: appData.contractType || 'Stage',
      domain: appData.domain || 'Data',
      location: appData.location?.trim() || 'France',
      applicationDate: appData.applicationDate || now.substring(0, 10),
      status: appData.status || 'ENVOYEE',
      jobUrl: appData.jobUrl || '',
      salaryGratification: appData.salaryGratification || '',
      recruiterName: appData.recruiterName || '',
      recruiterEmail: appData.recruiterEmail || '',
      recruiterPhone: appData.recruiterPhone || '',
      nextFollowUpDate: appData.nextFollowUpDate || '',
      interviewDate: appData.interviewDate || '',
      notes: appData.notes || '',
      resumeUsed: appData.resumeUsed || 'CV_Principal.pdf',
      coverLetterUsed: appData.coverLetterUsed || '',
      logoBg: appData.logoBg || randomColor,
      logoLetter: company.charAt(0).toUpperCase() || 'J',
      interviews: appData.interviews || [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          date: appData.applicationDate || now.substring(0, 10),
          title: 'Candidature créée',
          description: `Ajoutée dans JobTracker avec le statut "${appData.status || 'Candidature envoyée'}".`,
          type: 'STATUS_CHANGE',
        },
      ],
      tags: appData.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    setApplications((prev) => [newApp, ...prev]);
    addToast(`Candidature chez ${newApp.company} ajoutée avec succès !`, 'success');
    return newApp;
  };

  const updateApplication = (id: string, updates: Partial<JobApplication>) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;

        // If status changed to ACCEPTEE, REFUSEE, or ABANDONNEE, clear nextFollowUpDate
        const isFinalStatus =
          updates.status && ['ACCEPTEE', 'REFUSEE', 'ABANDONNEE'].includes(updates.status);

        const updated: JobApplication = {
          ...app,
          ...updates,
          nextFollowUpDate: isFinalStatus ? '' : updates.nextFollowUpDate ?? app.nextFollowUpDate,
          updatedAt: new Date().toISOString(),
        };

        // If status changed, add to timeline
        if (updates.status && updates.status !== app.status) {
          const statusLabels: Record<ApplicationStatus, string> = {
            A_CONTACTER: 'À contacter',
            ENVOYEE: 'Candidature envoyée',
            EN_ATTENTE: 'En attente',
            ENTRETIEN: 'Entretien',
            OFFRE_RECUE: 'Offre reçue',
            ACCEPTEE: 'Acceptée 🎉',
            REFUSEE: 'Refusée',
            ABANDONNEE: 'Abandonnée',
          };

          const event: TimelineEvent = {
            id: `tl-${Date.now()}`,
            date: new Date().toISOString().substring(0, 10),
            title: `Statut : ${statusLabels[updates.status]}`,
            description: isFinalStatus
              ? `Le statut a été mis à jour vers "${statusLabels[updates.status]}". Les rappels de relance ont été clôturés.`
              : `Le statut a été mis à jour de "${statusLabels[app.status]}" vers "${statusLabels[updates.status]}".`,
            type: updates.status === 'OFFRE_RECUE' ? 'OFFER' : 'STATUS_CHANGE',
          };
          updated.timeline = [event, ...(updated.timeline || [])];

          if (updates.status === 'ACCEPTEE') {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        }

        return updated;
      })
    );
    addToast('Candidature mise à jour avec succès.', 'success');
  };

  const deleteApplication = (id: string) => {
    const toDelete = applications.find((a) => a.id === id);
    setApplications((prev) => prev.filter((app) => app.id !== id));
    if (selectedApplicationId === id) {
      setSelectedApplicationId(null);
    }
    addToast(
      toDelete ? `Candidature chez ${toDelete.company} supprimée.` : 'Candidature supprimée.',
      'info'
    );
  };

  const updateStatus = (id: string, newStatus: ApplicationStatus) => {
    updateApplication(id, { status: newStatus });
  };

  const addTimelineEvent = (appId: string, event: Omit<TimelineEvent, 'id'>) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const newEvent: TimelineEvent = {
          ...event,
          id: `tl-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        };
        return {
          ...app,
          timeline: [newEvent, ...(app.timeline || [])],
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addToast('Événement ajouté à la timeline.', 'success');
  };

  const updateUserProfile = (profileUpdates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({
      ...prev,
      ...profileUpdates,
    }));
    addToast('Profil mis à jour avec succès.', 'success');
  };

  const resetToDemoData = () => {
    setApplications(INITIAL_APPLICATIONS);
    setUserProfile(DEFAULT_USER_PROFILE);
    clearFilters();
    addToast('Données de démonstration M2 MIAGE réinitialisées.', 'info');
  };

  const clearAllApplications = () => {
    setApplications([]);
    setSelectedApplicationId(null);
    clearFilters();
    addToast('Espace réinitialisé ! Vous pouvez maintenant ajouter vos vraies candidatures.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        applications,
        userProfile,
        activeTab,
        setActiveTab,
        selectedApplicationId,
        setSelectedApplicationId,
        isAddModalOpen,
        setIsAddModalOpen,
        editingApplication,
        setEditingApplication,
        isDarkMode,
        toggleDarkMode,
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        filterDomain,
        setFilterDomain,
        filterContract,
        setFilterContract,
        filterLocation,
        setFilterLocation,
        sortBy,
        setSortBy,
        clearFilters,
        addApplication,
        updateApplication,
        deleteApplication,
        updateStatus,
        addTimelineEvent,
        updateUserProfile,
        resetToDemoData,
        clearAllApplications,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
