import React, { useState } from 'react';
import {
  Plus,
  MapPin,
  Calendar,
  Building2,
  Clock,
  MoreVertical,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApplicationStatus, JobApplication } from '../types';
import { STATUS_CONFIG } from '../data/initialData';

interface KanbanColumnConfig {
  id: string;
  title: string;
  statuses: ApplicationStatus[];
  color: string;
  badgeBg: string;
  headerBg: string;
}

export const KanbanView: React.FC = () => {
  const {
    applications,
    updateStatus,
    setSelectedApplicationId,
    setIsAddModalOpen,
    setEditingApplication,
  } = useApp();

  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<string | null>(null);

  // Group columns matching Section 8:
  // À contacter -> Candidature envoyée -> En attente -> Entretien -> Offre reçue -> Acceptée / Refusée
  const columns: KanbanColumnConfig[] = [
    {
      id: 'col-contact',
      title: 'À contacter',
      statuses: ['A_CONTACTER'],
      color: 'border-slate-300 dark:border-slate-700',
      badgeBg: 'bg-[#E5F2F7] text-[#0282AD]',
      headerBg: 'bg-slate-50 dark:bg-slate-800/50',
    },
    {
      id: 'col-sent',
      title: 'Candidature envoyée',
      statuses: ['ENVOYEE'],
      color: 'border-blue-400 dark:border-blue-700',
      badgeBg: 'bg-[#E1F5F2] text-[#1E8B83]',
      headerBg: 'bg-teal-50/40 dark:bg-teal-950/20',
    },
    {
      id: 'col-pending',
      title: 'En attente',
      statuses: ['EN_ATTENTE'],
      color: 'border-amber-400 dark:border-amber-700',
      badgeBg: 'bg-[#FFF3E4] text-[#D97706]',
      headerBg: 'bg-amber-50/40 dark:bg-amber-950/20',
    },
    {
      id: 'col-interview',
      title: 'Entretien',
      statuses: ['ENTRETIEN'],
      color: 'border-cyan-400 dark:border-cyan-700',
      badgeBg: 'bg-[#E4F6F8] text-[#029EB4]',
      headerBg: 'bg-cyan-50/40 dark:bg-cyan-950/20',
    },
    {
      id: 'col-offer',
      title: 'Offre reçue',
      statuses: ['OFFRE_RECUE'],
      color: 'border-emerald-400 dark:border-emerald-700',
      badgeBg: 'bg-[#E6F6ED] text-[#2E7D32]',
      headerBg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
    },
    {
      id: 'col-accepted-refused',
      title: 'Acceptée / Refusée',
      statuses: ['ACCEPTEE', 'REFUSEE', 'ABANDONNEE'],
      color: 'border-slate-300 dark:border-slate-700',
      badgeBg: 'bg-[#E6F0F2] text-[#185868]',
      headerBg: 'bg-[#E6F0F2]/50 dark:bg-slate-800/40',
    },
  ];

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedAppId(id);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setActiveDropColumn(colId);
  };

  const handleDragLeave = () => {
    setActiveDropColumn(null);
  };

  const handleDrop = (e: React.DragEvent, column: KanbanColumnConfig) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedAppId;
    setActiveDropColumn(null);
    setDraggedAppId(null);

    if (!id) return;

    let targetStatus: ApplicationStatus = column.statuses[0];
    if (column.id === 'col-accepted-refused') {
      targetStatus = 'ACCEPTEE';
    }

    updateStatus(id, targetStatus);
  };

  const handleQuickAdd = (defaultStatus: ApplicationStatus) => {
    setEditingApplication({
      id: '',
      company: '',
      jobTitle: '',
      contractType: 'Stage',
      domain: 'Data',
      location: 'Toulouse',
      applicationDate: new Date().toISOString().substring(0, 10),
      status: defaultStatus,
      createdAt: '',
      updatedAt: '',
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#185868] dark:text-white sm:text-2xl">
            Tableau Kanban
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Glissez-déposez vos candidatures pour mettre à jour instantanément leur statut
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Astuce : Cliquez sur une carte pour ouvrir le détail
          </span>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
        {columns.map((column) => {
          const colApps = applications.filter((app) => column.statuses.includes(app.status));
          const isOver = activeDropColumn === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column)}
              className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-[#F4F8F9] p-3.5 transition-all dark:bg-slate-900/60 ${
                isOver
                  ? 'border-[#185868] bg-[#E6F0F2] ring-2 ring-[#185868]/20 dark:bg-cyan-950/30'
                  : 'border-[#E1ECEE] dark:border-slate-800'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-[#185868] dark:text-slate-200">
                    {column.title}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${column.badgeBg}`}
                  >
                    {colApps.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickAdd(column.statuses[0])}
                  title={`Ajouter dans "${column.title}"`}
                  className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-[#185868] dark:hover:bg-slate-800 dark:hover:text-teal-400"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-3 min-h-[450px]">
                {colApps.map((app) => {
                  const cfg = STATUS_CONFIG[app.status];
                  return (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      onClick={() => setSelectedApplicationId(app.id)}
                      className="group cursor-grab active:cursor-grabbing rounded-xl border border-[#E1ECEE] bg-white p-3.5 shadow-xs transition-all hover:border-[#185868] hover:shadow-md dark:border-slate-800 dark:bg-slate-800/90 dark:hover:border-cyan-900"
                    >
                      {/* Top: Logo & Company */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs ${app.logoBg || 'bg-[#185868]'}`}
                          >
                            {app.logoLetter || app.company.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#185868] dark:text-white dark:group-hover:text-teal-400 transition-colors">
                              {app.company}
                            </h4>
                            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 line-clamp-1">
                              {app.jobTitle}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Domain & Contract Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700 dark:bg-slate-700/60 dark:text-slate-300">
                          {app.contractType}
                        </span>
                        <span className="rounded-md bg-[#E6F0F2] px-1.5 py-0.5 text-[9px] font-semibold text-[#185868] dark:bg-cyan-950 dark:text-teal-400">
                          {app.domain}
                        </span>
                        {app.status === 'ACCEPTEE' && (
                          <span className="rounded-md bg-[#E6F6ED] px-1.5 py-0.5 text-[9px] font-bold text-[#2E7D32] dark:bg-teal-950 dark:text-teal-300">
                            Acceptée 🎉
                          </span>
                        )}
                        {app.status === 'REFUSEE' && (
                          <span className="rounded-md bg-[#FDEEEE] px-1.5 py-0.5 text-[9px] font-bold text-[#D9534F] dark:bg-rose-950 dark:text-rose-300">
                            Refusée
                          </span>
                        )}
                      </div>

                      {/* Bottom Info: Location & Date */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500 dark:border-slate-700/50 dark:text-slate-400">
                        <span className="flex items-center gap-1 truncate max-w-[130px]">
                          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate">{app.location}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
                          {app.applicationDate.substring(5)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {colApps.length === 0 && (
                  <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center dark:border-slate-800">
                    <p className="text-[11px] text-slate-400">Aucune candidature</p>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(column.statuses[0])}
                      className="mt-1.5 text-[10px] font-semibold text-[#185868] hover:underline dark:text-teal-400"
                    >
                      + Ajouter ici
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
