import React from 'react';
import {
  Briefcase,
  Clock,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  AlertTriangle,
  Send,
  Hourglass,
  FileText,
  Check,
  MoreVertical,
  BarChart2,
  User,
  Quote,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STATUS_CONFIG, DOMAINS } from '../data/initialData';
import { ApplicationStatus } from '../types';

export const DashboardView: React.FC = () => {
  const {
    applications,
    userProfile,
    setActiveTab,
    setIsAddModalOpen,
    setSelectedApplicationId,
    setEditingApplication,
  } = useApp();

  const total = applications.length;
  const sent = applications.filter((a) => a.status === 'ENVOYEE').length;
  const pending = applications.filter((a) => a.status === 'EN_ATTENTE').length;
  const interviews = applications.filter((a) => a.status === 'ENTRETIEN').length;
  const accepted = applications.filter((a) => a.status === 'ACCEPTEE' || a.status === 'OFFRE_RECUE').length;
  const rejected = applications.filter((a) => a.status === 'REFUSEE').length;

  // Domain breakdown calculated dynamically from active applications
  const domainCounts = React.useMemo(() => {
    if (applications.length === 0) {
      return [
        { domain: 'Data', count: 0, percent: 0, color: '#185868' },
        { domain: 'BI', count: 0, percent: 0, color: '#2A9D8F' },
        { domain: 'Développement', count: 0, percent: 0, color: '#64B5F6' },
        { domain: 'IA', count: 0, percent: 0, color: '#E0A96D' },
        { domain: 'DevOps', count: 0, percent: 0, color: '#81D4FA' },
        { domain: 'Autre', count: 0, percent: 0, color: '#CFD8DC' },
      ];
    }
    const counts: Record<string, number> = {};
    applications.forEach((app) => {
      const d = app.domain || 'Autre';
      counts[d] = (counts[d] || 0) + 1;
    });
    const palette = ['#185868', '#2A9D8F', '#64B5F6', '#E0A96D', '#81D4FA', '#CFD8DC', '#4EAA78', '#A5D6A7'];
    const totalApps = applications.length;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([domain, count], idx) => ({
        domain,
        count,
        percent: Math.round((count / totalApps) * 100),
        color: palette[idx % palette.length],
      }));
  }, [applications]);

  // Status breakdown calculated dynamically
  const statusStats = React.useMemo(() => {
    const totalCount = applications.length;
    const stats = [
      { key: 'A_CONTACTER', label: 'À contacter', color: STATUS_CONFIG['A_CONTACTER']?.color || '#90A4AE', count: 0 },
      { key: 'ENVOYEE', label: 'Envoyées', color: STATUS_CONFIG['ENVOYEE']?.color || '#2E8B9A', count: 0 },
      { key: 'EN_ATTENTE', label: 'En attente', color: STATUS_CONFIG['EN_ATTENTE']?.color || '#E6A15C', count: 0 },
      { key: 'ENTRETIEN', label: 'Entretiens', color: STATUS_CONFIG['ENTRETIEN']?.color || '#2A9D8F', count: 0 },
      { key: 'REFUSEE', label: 'Refus', color: STATUS_CONFIG['REFUSEE']?.color || '#E57373', count: 0 },
      { key: 'ACCEPTEE', label: 'Acceptées', color: STATUS_CONFIG['ACCEPTEE']?.color || '#4EAA78', count: 0 },
    ];

    applications.forEach((app) => {
      const target = stats.find((s) => s.key === app.status);
      if (target) {
        target.count += 1;
      } else if (app.status === 'OFFRE_RECUE') {
        const acc = stats.find((s) => s.key === 'ACCEPTEE');
        if (acc) acc.count += 1;
      }
    });

    return stats.map((s) => ({
      ...s,
      percent: totalCount > 0 ? Math.round((s.count / totalCount) * 100) : 0,
    }));
  }, [applications]);

  // Specific "Prochaines actions" matching the reference screenshot
  const upcomingActions = [
    {
      id: 'act-1',
      company: 'Orange Business',
      action: 'Relancer Orange Business',
      subtitle: 'Relance • Demain, 10:00',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Send,
      appId: applications.find((a) => a.company.includes('Orange'))?.id,
    },
    {
      id: 'act-2',
      company: 'Wavestone',
      action: 'Entretien Wavestone',
      subtitle: 'Entretien • Dans 3 jours',
      badgeColor: 'bg-cyan-50 text-[#185868] border-cyan-200',
      icon: CalendarCheck,
      appId: applications.find((a) => a.company.includes('Wavestone'))?.id,
    },
    {
      id: 'act-3',
      company: 'Capgemini',
      action: 'Candidature Capgemini',
      subtitle: 'Suivi • Il y a 7 jours',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Clock,
      appId: applications.find((a) => a.company.includes('Capgemini'))?.id,
    },
    {
      id: 'act-4',
      company: 'Sopra Steria',
      action: 'Relance Sopra Steria',
      subtitle: 'Relance • 10 jours',
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: Send,
      appId: applications.find((a) => a.company.includes('Sopra'))?.id,
    },
  ];

  const handleOpenAddModal = () => {
    setEditingApplication(null);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#185868] dark:text-white sm:text-3xl flex items-center gap-2">
            Bonjour {userProfile.firstName} <span className="animate-wave inline-block">👋</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Voici un aperçu de votre recherche d'emploi et de vos prochaines actions.
          </p>
        </div>
        <div className="text-xs font-semibold text-[#185868]/80 dark:text-teal-300 bg-[#E6F0F2] dark:bg-slate-800 px-3.5 py-1.5 rounded-full self-start sm:self-center">
          Jeudi 24 avril 2025
        </div>
      </div>

      {/* 6 Metric KPI Cards Grid (Matches Reference Image Exactly) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* TOTAL */}
        <div className="rounded-2xl border border-[#E1ECEE] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E5F2F7] text-[#0282AD]">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-[11px] font-semibold text-slate-500">Total</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{total}</span>
            <span className="text-[10px] text-slate-400">candidatures</span>
          </div>
          <div className="mt-2 text-[10px] font-medium text-[#0282AD] flex items-center gap-1">
            <span>↑ +3 cette semaine</span>
          </div>
        </div>

        {/* ENVOYÉES */}
        <div className="rounded-2xl border border-[#E1ECEE] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E1F5F2] text-[#1E8B83]">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-[11px] font-semibold text-slate-500">Envoyées</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{sent}</span>
            <span className="text-[10px] text-slate-400">candidatures</span>
          </div>
          <div className="mt-2 text-[10px] font-medium text-[#1E8B83] flex items-center gap-1">
            <span>↑ +2 cette semaine</span>
          </div>
        </div>

        {/* EN ATTENTE */}
        <div className="rounded-2xl border border-[#E1ECEE] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF3E4] text-[#D97706]">
              <Hourglass className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-[11px] font-semibold text-slate-500">En attente</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{pending}</span>
            <span className="text-[10px] text-slate-400">candidatures</span>
          </div>
          <div className="mt-2 text-[10px] font-medium text-slate-400 flex items-center gap-1">
            <span>→ 0 cette semaine</span>
          </div>
        </div>

        {/* ENTRETIENS */}
        <div className="rounded-2xl border border-[#E1ECEE] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E4F6F8] text-[#029EB4]">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-[11px] font-semibold text-slate-500">Entretiens</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{interviews}</span>
            <span className="text-[10px] text-slate-400">candidatures</span>
          </div>
          <div className="mt-2 text-[10px] font-medium text-[#029EB4] flex items-center gap-1">
            <span>↑ +1 cette semaine</span>
          </div>
        </div>

        {/* REFUS */}
        <div className="rounded-2xl border border-[#E1ECEE] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDEEEE] text-[#D9534F]">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-[11px] font-semibold text-slate-500">Refus</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{rejected}</span>
            <span className="text-[10px] text-slate-400">candidature</span>
          </div>
          <div className="mt-2 text-[10px] font-medium text-slate-400 flex items-center gap-1">
            <span>→ 0 cette semaine</span>
          </div>
        </div>

        {/* ACCEPTÉES */}
        <div className="rounded-2xl border border-[#E1ECEE] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F6ED] text-[#2E7D32]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-[11px] font-semibold text-slate-500">Acceptées</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{accepted}</span>
            <span className="text-[10px] text-slate-400">candidature</span>
          </div>
          <div className="mt-2 text-[10px] font-medium text-[#2E7D32] flex items-center gap-1">
            <span>↑ +1 cette semaine</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Row 1: 2 Charts Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: Évolution de vos candidatures */}
            <div className="rounded-2xl border border-[#E1ECEE] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-[#185868] dark:text-white">
                  Évolution de vos candidatures
                </h2>
                <select className="rounded-lg border border-slate-200 bg-[#F4F8F9] px-2.5 py-1 text-[11px] font-medium text-slate-600 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                  <option>8 dernières semaines</option>
                  <option>4 dernières semaines</option>
                  <option>Ce mois-ci</option>
                </select>
              </div>

              {/* Area Chart SVG Graphic matching the reference */}
              <div className="h-48 w-full pt-2">
                <svg className="h-full w-full overflow-visible" viewBox="0 0 400 160">
                  <defs>
                    <linearGradient id="petrolGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2A9D8F" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#185868" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="400" y2="30" stroke="#F0F4F5" strokeDasharray="3 3" />
                  <line x1="0" y1="70" x2="400" y2="70" stroke="#F0F4F5" strokeDasharray="3 3" />
                  <line x1="0" y1="110" x2="400" y2="110" stroke="#F0F4F5" strokeDasharray="3 3" />

                  {/* Y Axis labels */}
                  <text x="0" y="33" fill="#94A3B8" fontSize="9">25</text>
                  <text x="0" y="73" fill="#94A3B8" fontSize="9">15</text>
                  <text x="0" y="113" fill="#94A3B8" fontSize="9">5</text>
                  <text x="0" y="145" fill="#94A3B8" fontSize="9">0</text>

                  {/* Area Fill */}
                  <path
                    d="M 25,115 L 75,98 L 125,75 L 175,77 L 225,58 L 275,52 L 325,38 L 375,22 L 375,145 L 25,145 Z"
                    fill="url(#petrolGradient)"
                  />

                  {/* Trend Line */}
                  <path
                    d="M 25,115 L 75,98 L 125,75 L 175,77 L 225,58 L 275,52 L 325,38 L 375,22"
                    fill="none"
                    stroke="#185868"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Line Dots */}
                  <circle cx="25" cy="115" r="3.5" fill="#185868" />
                  <circle cx="75" cy="98" r="3.5" fill="#185868" />
                  <circle cx="125" cy="75" r="3.5" fill="#185868" />
                  <circle cx="175" cy="77" r="3.5" fill="#185868" />
                  <circle cx="225" cy="58" r="3.5" fill="#185868" />
                  <circle cx="275" cy="52" r="3.5" fill="#185868" />
                  <circle cx="325" cy="38" r="3.5" fill="#185868" />
                  <circle cx="375" cy="22" r="4.5" fill="#2A9D8F" stroke="#FFFFFF" strokeWidth="2" />

                  {/* X Axis Labels */}
                  <text x="22" y="158" fill="#94A3B8" fontSize="10">S1</text>
                  <text x="72" y="158" fill="#94A3B8" fontSize="10">S2</text>
                  <text x="122" y="158" fill="#94A3B8" fontSize="10">S3</text>
                  <text x="172" y="158" fill="#94A3B8" fontSize="10">S4</text>
                  <text x="222" y="158" fill="#94A3B8" fontSize="10">S5</text>
                  <text x="272" y="158" fill="#94A3B8" fontSize="10">S6</text>
                  <text x="322" y="158" fill="#94A3B8" fontSize="10">S7</text>
                  <text x="372" y="158" fill="#94A3B8" fontSize="10">S8</text>
                </svg>
              </div>
            </div>

            {/* Chart 2: Répartition par statut (Donut Chart) */}
            <div className="rounded-2xl border border-[#E1ECEE] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <h2 className="text-xs font-bold text-[#185868] dark:text-white mb-4">
                Répartition par statut
              </h2>

              <div className="flex items-center justify-between gap-4">
                {/* SVG Donut */}
                <div className="relative h-36 w-36 shrink-0">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#E6F0F2" strokeWidth="14" className="dark:stroke-slate-800" />
                    {/* Envoyées (50%) */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#2E8B9A" strokeWidth="14" strokeDasharray="119.38 119.38" strokeDashoffset="0" />
                    {/* En attente (25%) */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#E6A15C" strokeWidth="14" strokeDasharray="59.69 179.07" strokeDashoffset="-119.38" />
                    {/* Entretiens (17%) */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#2A9D8F" strokeWidth="14" strokeDasharray="40.58 198.18" strokeDashoffset="-179.07" />
                    {/* Refus & Acceptées (8%) */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#E57373" strokeWidth="14" strokeDasharray="19.1 219.66" strokeDashoffset="-219.65" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-black text-slate-900 dark:text-white">{total > 0 ? total : 24}</span>
                    <span className="text-[9px] text-slate-400">candidatures</span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="space-y-1.5 text-[10px] flex-1 min-w-0">
                  {statusStats.map((st) => (
                    <div key={st.key} className="flex items-center justify-between text-slate-600 dark:text-slate-300 gap-2 min-w-0">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                        <span className="truncate" title={st.label}>{st.label}</span>
                      </span>
                      <span className="font-bold shrink-0">
                        {st.count} <span className="text-slate-400 font-normal ml-0.5">{st.percent}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Row 2: Répartition par domaine & Prochaines Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Répartition par domaine (Bar Chart) */}
            <div className="rounded-2xl border border-[#E1ECEE] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-[#185868] dark:text-white">
                  Répartition par domaine
                </h2>
                <span className="text-[10px] font-medium text-slate-400">
                  {total > 0 ? `${total} candidatures` : 'Aucune donnée'}
                </span>
              </div>

              <div className="w-full min-h-[140px] flex items-end justify-between gap-1.5 sm:gap-2.5 pt-2 overflow-x-auto overflow-y-hidden pb-1 scrollbar-thin">
                {domainCounts.map((item, i) => {
                  const barHeightPercent = item.percent > 0 ? Math.min(Math.max(item.percent * 2.2, 8), 100) : 4;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group min-w-[36px]">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                        {item.percent}%
                      </span>
                      <div className="w-full bg-[#F4F8F9] rounded-t-lg h-24 relative flex items-end overflow-hidden dark:bg-slate-800 shrink-0">
                        <div
                          style={{ height: `${barHeightPercent}%`, backgroundColor: item.color }}
                          className="w-full rounded-t-lg transition-all duration-500 group-hover:opacity-90"
                        />
                      </div>
                      <span
                        className="text-[9px] font-medium text-slate-400 text-center truncate w-full px-0.5"
                        title={item.domain}
                      >
                        {item.domain}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prochaines Actions */}
            <div className="rounded-2xl border border-[#E1ECEE] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-[#185868] dark:text-white">
                  Prochaines actions
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('calendar')}
                  className="text-[10px] font-semibold text-[#185868] hover:underline flex items-center gap-0.5"
                >
                  Voir tout →
                </button>
              </div>

              <div className="space-y-2.5">
                {upcomingActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div
                      key={act.id}
                      onClick={() => {
                        if (act.appId) setSelectedApplicationId(act.appId);
                      }}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 p-2.5 transition-all hover:bg-[#F4F8F9] dark:border-slate-800 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${act.badgeColor}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-white">
                            {act.action}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {act.subtitle}
                          </p>
                        </div>
                      </div>
                      <span className="text-slate-300 hover:text-slate-600 text-xs">›</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Row 3: Mes candidatures récentes Table */}
          <div className="rounded-2xl border border-[#E1ECEE] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-[#185868] dark:text-white">
                Mes candidatures récentes
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('applications')}
                className="text-[11px] font-semibold text-[#185868] hover:underline flex items-center gap-1"
              >
                <span>Voir toutes</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                    <th className="pb-2.5 font-semibold">Entreprise</th>
                    <th className="pb-2.5 font-semibold">Poste</th>
                    <th className="pb-2.5 font-semibold">Domaine</th>
                    <th className="pb-2.5 font-semibold">Localisation</th>
                    <th className="pb-2.5 font-semibold">Statut</th>
                    <th className="pb-2.5 font-semibold">Date de candidature</th>
                    <th className="pb-2.5 text-right font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.slice(0, 5).map((app) => {
                    const cfg = STATUS_CONFIG[app.status];
                    return (
                      <tr
                        key={app.id}
                        className="group transition-colors hover:bg-[#F4F8F9] dark:hover:bg-slate-800/50"
                      >
                        <td className="py-3 pr-3 font-semibold text-slate-800 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold text-white shadow-xs ${app.logoBg || 'bg-[#185868]'}`}>
                              {app.logoLetter || app.company.charAt(0)}
                            </div>
                            <span>{app.company}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-slate-600 dark:text-slate-300 font-medium">
                          {app.jobTitle}
                        </td>
                        <td className="py-3 pr-3 text-slate-500">
                          {app.domain}
                        </td>
                        <td className="py-3 pr-3 text-slate-500">
                          {app.location}
                        </td>
                        <td className="py-3 pr-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${cfg.badgeClass}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-slate-400 text-[11px]">
                          12 avr. 2025
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedApplicationId(app.id)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (4 Columns - Side Widgets Matching Image) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Scenic Quote Banner (Matching the image's top-right card) */}
          <div className="relative overflow-hidden rounded-2xl h-44 shadow-sm border border-[#E1ECEE] flex items-end p-5 text-white">
            {/* Coastal scenic background picture */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80")',
              }}
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#185868]/90 via-[#185868]/40 to-transparent" />

            <div className="relative z-10">
              <p className="font-serif italic text-base leading-snug font-medium text-white/95 drop-shadow-sm">
                "Un bon processus mène toujours à de belles opportunités."
              </p>
            </div>
          </div>

          {/* Votre processus de candidature Step Widget */}
          <div className="rounded-2xl border border-[#E1ECEE] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xs font-bold text-[#185868] dark:text-white mb-4">
              Votre processus de candidature
            </h2>

            <div className="relative pl-6 space-y-4 text-xs">
              {/* Vertical connecting line */}
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[#E1ECEE] dark:bg-slate-800" />

              <div className="relative flex items-center gap-3">
                <div className="absolute -left-6 flex h-5 w-5 items-center justify-center rounded-full bg-[#185868] text-white ring-4 ring-white dark:ring-slate-900 text-[10px]">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Offre trouvée</span>
              </div>

              <div className="relative flex items-center gap-3">
                <div className="absolute -left-6 flex h-5 w-5 items-center justify-center rounded-full bg-[#185868] text-white ring-4 ring-white dark:ring-slate-900 text-[10px]">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Qualification</span>
              </div>

              <div className="relative flex items-center gap-3">
                <div className="absolute -left-6 flex h-5 w-5 items-center justify-center rounded-full bg-[#185868] text-white ring-4 ring-white dark:ring-slate-900 text-[10px]">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Candidature</span>
              </div>

              <div className="relative flex items-center gap-3">
                <div className="absolute -left-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#185868] bg-white ring-4 ring-white dark:ring-slate-900" />
                <span className="font-medium text-slate-600 dark:text-slate-400">Relance</span>
              </div>

              <div className="relative flex items-center gap-3">
                <div className="absolute -left-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 bg-white ring-4 ring-white dark:ring-slate-900" />
                <span className="font-medium text-slate-400">Entretien</span>
              </div>

              <div className="relative flex items-center gap-3">
                <div className="absolute -left-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 bg-white ring-4 ring-white dark:ring-slate-900" />
                <span className="font-medium text-slate-400">Décision</span>
              </div>

              <div className="relative flex items-center gap-3">
                <div className="absolute -left-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 bg-white ring-4 ring-white dark:ring-slate-900" />
                <span className="font-medium text-slate-400">Acceptation / Refus</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('kanban')}
              className="mt-4 text-[11px] font-semibold text-[#185868] hover:underline flex items-center gap-1"
            >
              <span>Voir le détail</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Raccourcis Widget */}
          <div className="rounded-2xl border border-[#E1ECEE] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xs font-bold text-[#185868] dark:text-white mb-3">
              Raccourcis
            </h2>

            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F4F8F9] transition-colors text-slate-700 font-medium dark:text-slate-200"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#185868] text-white">
                  <Plus className="h-4 w-4" />
                </div>
                <span>Ajouter une candidature</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F4F8F9] transition-colors text-slate-700 font-medium dark:text-slate-200"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E4F6F8] text-[#029EB4]">
                  <Calendar className="h-4 w-4" />
                </div>
                <span>Voir le calendrier</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('statistics')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F4F8F9] transition-colors text-slate-700 font-medium dark:text-slate-200"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E1F5F2] text-[#1E8B83]">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <span>Consulter les statistiques</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F4F8F9] transition-colors text-slate-700 font-medium dark:text-slate-200"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E5F2F7] text-[#0282AD]">
                  <User className="h-4 w-4" />
                </div>
                <span>Mon profil</span>
              </button>
            </div>
          </div>

          {/* Bottom Quote Card */}
          <div className="rounded-2xl border border-[#E1ECEE] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <Quote className="h-5 w-5 text-slate-400 mb-2" />
            <p className="text-xs font-medium italic text-slate-600 leading-relaxed dark:text-slate-300">
              "L'amélioration continue commence par la mesure."
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-0.5 w-4 bg-[#185868]" />
              <span className="text-[10px] font-extrabold text-[#185868] dark:text-teal-400">Candidly</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
