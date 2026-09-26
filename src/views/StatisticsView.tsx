import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Percent,
  Clock,
  CheckCircle2,
  CalendarCheck,
  Building2,
  MapPin,
  Briefcase,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CONTRACT_TYPES, DOMAINS } from '../data/initialData';

export const StatisticsView: React.FC = () => {
  const { applications } = useApp();

  const total = applications.length;
  const answered = applications.filter((a) => a.status !== 'ENVOYEE' && a.status !== 'A_CONTACTER').length;
  const interviews = applications.filter(
    (a) => a.status === 'ENTRETIEN' || a.status === 'OFFRE_RECUE' || a.status === 'ACCEPTEE'
  ).length;
  const accepted = applications.filter((a) => a.status === 'ACCEPTEE').length;
  const rejected = applications.filter((a) => a.status === 'REFUSEE').length;
  const offers = applications.filter((a) => a.status === 'OFFRE_RECUE' || a.status === 'ACCEPTEE').length;

  // Key Rates
  const responseRate = total > 0 ? Math.round((answered / total) * 100) : 0;
  const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;
  const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;
  const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
  const avgResponseDays = 8; // Average in days

  // Monthly stats (fictional comparison as requested: Septembre 12, Octobre 18, etc.)
  const monthlyData = [
    { month: 'Juillet', count: 4, height: 25 },
    { month: 'Août', count: 8, height: 45 },
    { month: 'Septembre', count: 14, height: 75 },
    { month: 'Octobre (Objectif)', count: 18, height: 95 },
  ];

  // Contract Breakdown
  const contractStats = CONTRACT_TYPES.map((type) => {
    const count = applications.filter((a) => a.contractType === type).length;
    return {
      type,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  }).filter((c) => c.count > 0);

  // Cities breakdown
  const cityCounts: { [key: string]: number } = {};
  applications.forEach((a) => {
    const city = a.location.split('(')[0].trim();
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });
  const cityStats = Object.entries(cityCounts)
    .map(([city, count]) => ({
      city,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Domain Breakdown
  const domainStats = DOMAINS.map((domain) => {
    const count = applications.filter((a) => a.domain === domain).length;
    return {
      domain,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  }).filter((d) => d.count > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Statistiques et Ratios de Conversion
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Analyse quantitative de l'efficacité de vos candidatures
        </p>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Taux de réponse */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taux de réponse</span>
            <Percent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400 sm:text-3xl">
            {responseRate}%
          </p>
          <span className="text-[10px] text-slate-500">Moyenne secteur tech : 35%</span>
        </div>

        {/* Taux d'entretien */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taux d'entretien</span>
            <CalendarCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400 sm:text-3xl">
            {interviewRate}%
          </p>
          <span className="text-[10px] text-slate-500">{interviews} candidatures en entretien</span>
        </div>

        {/* Taux de refus */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taux de refus</span>
            <span className="text-rose-500 font-bold text-xs">✕</span>
          </div>
          <p className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400 sm:text-3xl">
            {rejectionRate}%
          </p>
          <span className="text-[10px] text-slate-500">{rejected} refus direct(s)</span>
        </div>

        {/* Taux d'acceptation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taux d'acceptation</span>
            <CheckCircle2 className="h-4 w-4 text-teal-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-teal-600 dark:text-teal-400 sm:text-3xl">
            {acceptanceRate}%
          </p>
          <span className="text-[10px] text-slate-500">{accepted} offre(s) acceptée(s)</span>
        </div>

        {/* Délai moyen de réponse */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Délai moyen</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400 sm:text-3xl">
            ~{avgResponseDays}j
          </p>
          <span className="text-[10px] text-slate-500">Entre envoi et 1er contact</span>
        </div>
      </div>

      {/* Funnel de Recrutement */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
          Entonnoir de conversion (Recruitment Funnel)
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6">
          Visualisation de la déperdition et du taux de passage entre chaque étape clé
        </p>

        <div className="space-y-3">
          {/* Step 1 */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700 dark:text-slate-300">1. Candidatures envoyées</span>
              <span className="font-mono text-slate-900 dark:text-white">{total} (100%)</span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-teal-700 transition-all duration-500 w-full" />
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700 dark:text-slate-300">2. Retours et Prises de contact</span>
              <span className="font-mono text-slate-900 dark:text-white">
                {answered} ({responseRate}%)
              </span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${responseRate}%` }}
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
              />
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700 dark:text-slate-300">3. Entretiens obtenus</span>
              <span className="font-mono text-slate-900 dark:text-white">
                {interviews} ({interviewRate}%)
              </span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${interviewRate}%` }}
                className="h-full rounded-full bg-purple-500 transition-all duration-500"
              />
            </div>
          </div>

          {/* Step 4 */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700 dark:text-slate-300">4. Propositions et Offres formelles</span>
              <span className="font-mono text-slate-900 dark:text-white">
                {offers} ({total > 0 ? Math.round((offers / total) * 100) : 0}%)
              </span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${total > 0 ? (offers / total) * 100 : 0}%` }}
                className="h-full rounded-full bg-teal-500 transition-all duration-500"
              />
            </div>
          </div>

          {/* Step 5 */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700 dark:text-slate-300">5. Offres acceptées (Signature)</span>
              <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">
                {accepted} ({acceptanceRate}%)
              </span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${acceptanceRate}%` }}
                className="h-full rounded-full bg-teal-500 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 Columns: Monthly comparison & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparaison mensuelle */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Comparaison mensuelle du volume
              </h3>
              <p className="text-[11px] text-slate-500">Intensité des candidatures par mois</p>
            </div>
            <TrendingUp className="h-4 w-4 text-teal-700 dark:text-teal-500" />
          </div>

          <div className="h-48 flex items-end justify-between gap-4 pt-4 pb-2 px-3">
            {monthlyData.map((d, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-teal-700">
                  {d.count}
                </span>
                <div className="w-full bg-slate-100 rounded-t-lg h-32 relative flex items-end overflow-hidden dark:bg-slate-800">
                  <div
                    style={{ height: `${d.height}%` }}
                    className="w-full bg-gradient-to-t from-teal-700 to-teal-500 rounded-t-lg transition-all duration-500 group-hover:from-teal-800 group-hover:to-teal-500"
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 text-center">
                  {d.month}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[11px] text-slate-500 border-t border-slate-100 pt-3 dark:border-slate-800">
            📈 La période septembre-octobre est traditionnellement la plus active pour les recrutements de stages et premier emploi.
          </p>
        </div>

        {/* Répartition par ville et par contrat */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          {/* Villes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-teal-600" />
              Répartition par ville
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">Concentration géographique</p>

            <div className="space-y-2">
              {cityStats.map((c) => (
                <div key={c.city} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {c.city}
                    </span>
                    <span className="font-mono text-slate-500">
                      {c.count} ({c.percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${c.percent}%` }}
                      className="h-full rounded-full bg-teal-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Types de contrat */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-teal-500" />
              Répartition par type de contrat
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">Nature des contrats ciblés</p>

            <div className="grid grid-cols-2 gap-2">
              {contractStats.map((cs) => (
                <div
                  key={cs.type}
                  className="rounded-xl border border-slate-100 p-2.5 dark:border-slate-800 bg-[#F4EFE6]/50 dark:bg-slate-800/40"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{cs.type}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{cs.count} candidature(s)</span>
                    <span className="font-bold text-teal-700 dark:text-teal-500">{cs.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
