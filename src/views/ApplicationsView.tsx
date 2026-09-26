import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  DollarSign,
  Clock,
  ArrowUpDown,
  Download,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STATUS_CONFIG, DOMAINS, CONTRACT_TYPES } from '../data/initialData';
import { ApplicationStatus, Domain, ContractType, JobApplication } from '../types';

export const ApplicationsView: React.FC = () => {
  const {
    applications,
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
    setSelectedApplicationId,
    setIsAddModalOpen,
    setEditingApplication,
    addToast,
  } = useApp();

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Extract unique locations from applications for quick select
  const locations = useMemo(() => {
    const locSet = new Set<string>();
    applications.forEach((a) => {
      if (a.location) locSet.add(a.location);
    });
    return Array.from(locSet);
  }, [applications]);

  // Filtering & Sorting logic
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCompany = app.company.toLowerCase().includes(q);
          const matchTitle = app.jobTitle.toLowerCase().includes(q);
          const matchLocation = app.location.toLowerCase().includes(q);
          const matchTags = app.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchCompany && !matchTitle && !matchLocation && !matchTags) {
            return false;
          }
        }
        // Status filter
        if (filterStatus !== 'ALL' && app.status !== filterStatus) {
          return false;
        }
        // Domain filter
        if (filterDomain !== 'ALL' && app.domain !== filterDomain) {
          return false;
        }
        // Contract filter
        if (filterContract !== 'ALL' && app.contractType !== filterContract) {
          return false;
        }
        // Location filter
        if (filterLocation && !app.location.toLowerCase().includes(filterLocation.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime();
        }
        if (sortBy === 'company') {
          return a.company.localeCompare(b.company);
        }
        if (sortBy === 'status') {
          return STATUS_CONFIG[a.status].kanbanOrder - STATUS_CONFIG[b.status].kanbanOrder;
        }
        return 0;
      });
  }, [applications, searchQuery, filterStatus, filterDomain, filterContract, filterLocation, sortBy]);

  const hasActiveFilters =
    searchQuery !== '' ||
    filterStatus !== 'ALL' ||
    filterDomain !== 'ALL' ||
    filterContract !== 'ALL' ||
    filterLocation !== '';

  const handleOpenAddModal = () => {
    setEditingApplication(null);
    setIsAddModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      'Entreprise',
      'Poste',
      'Type de contrat',
      'Domaine',
      'Localisation',
      'Date de candidature',
      'Statut',
      'Salaire/Gratification',
      'Recruteur',
      'Email recruteur',
      'Prochaine relance',
      'Date entretien',
      'Notes',
    ];

    const rows = filteredApplications.map((app) => [
      `"${app.company.replace(/"/g, '""')}"`,
      `"${app.jobTitle.replace(/"/g, '""')}"`,
      `"${app.contractType}"`,
      `"${app.domain}"`,
      `"${app.location.replace(/"/g, '""')}"`,
      `"${app.applicationDate}"`,
      `"${STATUS_CONFIG[app.status].label}"`,
      `"${(app.salaryGratification || '').replace(/"/g, '""')}"`,
      `"${(app.recruiterName || '').replace(/"/g, '""')}"`,
      `"${(app.recruiterEmail || '').replace(/"/g, '""')}"`,
      `"${app.nextFollowUpDate || ''}"`,
      `"${app.interviewDate || ''}"`,
      `"${(app.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Candidly_Candidatures_MIAGE_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Export CSV téléchargé avec succès !', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Mes candidatures
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filteredApplications.length} candidature(s) affichée(s) sur {applications.length} au total
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            title="Exporter les candidatures au format CSV (Excel)"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-[#F4EFE6] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <FileSpreadsheet className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">Export Excel / CSV</span>
            <span className="sm:hidden">Export</span>
          </button>

          {/* Toggle View (Cards / Table) */}
          <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-500'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
              title="Vue Cartes"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-500'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
              title="Vue Tableau"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* "+ Ajouter une candidature" - Highlighted Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-[#185868] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#185868]/20 transition-all hover:bg-[#124552] active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter une candidature</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Recherche */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par entreprise, poste, mot-clé..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filtre Statut */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ApplicationStatus | 'ALL')}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">Tous les statuts</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Domaine */}
          <div>
            <select
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value as Domain | 'ALL')}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">Tous les domaines</option>
              {DOMAINS.map((dom) => (
                <option key={dom} value={dom}>
                  {dom}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Type Contrat */}
          <div>
            <select
              value={filterContract}
              onChange={(e) => setFilterContract(e.target.value as ContractType | 'ALL')}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">Tous les contrats</option>
              {CONTRACT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Row: Localisation & Tri */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            {/* Localisation filter input / select */}
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrer par ville (Toulouse, Paris...)"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300"
              >
                <X className="h-3 w-3" />
                <span>Réinitialiser les filtres</span>
              </button>
            )}
          </div>

          {/* Tri par date / entreprise */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="font-medium">Trier par :</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'date-desc' | 'date-asc' | 'company' | 'status')
              }
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="date-desc">Date (plus récente)</option>
              <option value="date-asc">Date (plus ancienne)</option>
              <option value="company">Entreprise (A-Z)</option>
              <option value="status">Statut de la candidature</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredApplications.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-cyan-950/60 dark:text-teal-500">
            <Building2 className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
            {hasActiveFilters
              ? 'Aucune candidature ne correspond à vos filtres'
              : 'Tu n\'as encore aucune candidature.'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Essayez de modifier ou réinitialiser vos critères de recherche.'
              : 'Commence à suivre ta recherche de stage et premier emploi dès maintenant.'}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F4EFE6] dark:border-slate-700 dark:text-slate-300"
              >
                Réinitialiser les filtres
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-800"
              >
                <Plus className="h-4 w-4" />
                <span>+ Ajouter ma première candidature</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mode Cartes */}
      {viewMode === 'cards' && filteredApplications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplications.map((app) => {
            const cfg = STATUS_CONFIG[app.status];
            return (
              <div
                key={app.id}
                onClick={() => setSelectedApplicationId(app.id)}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-teal-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-950 cursor-pointer"
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white shadow-sm ${app.logoBg || 'bg-teal-700'}`}
                      >
                        {app.logoLetter || app.company.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-500 transition-colors">
                          {app.company}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-1">
                          {app.jobTitle}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${cfg.badgeClass}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Badges Info */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {app.contractType}
                    </span>
                    <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-800 dark:bg-cyan-950 dark:text-teal-400">
                      {app.domain}
                    </span>
                    {app.salaryGratification && (
                      <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                        {app.salaryGratification}
                      </span>
                    )}
                  </div>

                  {/* Notes / Tags snippet */}
                  {app.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 bg-[#F4EFE6] dark:bg-slate-800/50 p-2 rounded-lg">
                      {app.notes}
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {app.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {app.applicationDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode Tableau */}
      {viewMode === 'table' && filteredApplications.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-[#F4EFE6]/70 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="p-3.5">Entreprise & Poste</th>
                  <th className="p-3.5">Contrat</th>
                  <th className="p-3.5">Domaine</th>
                  <th className="p-3.5">Localisation</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Statut</th>
                  <th className="p-3.5">Prochaine étape</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {filteredApplications.map((app) => {
                  const cfg = STATUS_CONFIG[app.status];
                  return (
                    <tr
                      key={app.id}
                      className="group hover:bg-[#F4EFE6]/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5">
                        <div
                          onClick={() => setSelectedApplicationId(app.id)}
                          className="flex cursor-pointer items-center gap-3"
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm ${app.logoBg || 'bg-teal-700'}`}
                          >
                            {app.logoLetter || app.company.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-500">
                              {app.company}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {app.jobTitle}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {app.contractType}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-800 dark:bg-cyan-950 dark:text-teal-400">
                          {app.domain}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {app.location}
                      </td>

                      <td className="p-3.5 text-slate-500">{app.applicationDate}</td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${cfg.badgeClass}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
                          {cfg.label}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {app.nextFollowUpDate ? (
                          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Relance : {app.nextFollowUpDate}
                          </span>
                        ) : app.interviewDate ? (
                          <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Entretien : {app.interviewDate}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedApplicationId(app.id)}
                          className="rounded-lg bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-800 hover:bg-teal-100 dark:bg-cyan-950/60 dark:text-teal-400 dark:hover:bg-cyan-950/60"
                        >
                          Voir détails
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
