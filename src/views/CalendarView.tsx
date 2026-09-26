import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarCheck,
  Building2,
  MapPin,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CalendarView: React.FC = () => {
  const { applications, setSelectedApplicationId, setIsAddModalOpen } = useApp();

  // Selected date or month
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // September 2026 (local context date)

  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Build calendar matrix
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  // Events gathering
  const calendarEvents = useMemo(() => {
    const list: {
      date: string; // YYYY-MM-DD
      type: 'INTERVIEW' | 'FOLLOW_UP' | 'DEADLINE' | 'APPLICATION';
      title: string;
      subtitle: string;
      appId: string;
      company: string;
      badgeColor: string;
    }[] = [];

    applications.forEach((app) => {
      // Application date
      if (app.applicationDate) {
        list.push({
          date: app.applicationDate,
          type: 'APPLICATION',
          title: `Candidature : ${app.company}`,
          subtitle: app.jobTitle,
          appId: app.id,
          company: app.company,
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
        });
      }

      // Follow-up date
      if (app.nextFollowUpDate) {
        list.push({
          date: app.nextFollowUpDate,
          type: 'FOLLOW_UP',
          title: `Relance : ${app.company}`,
          subtitle: `À contacter (${app.recruiterName || 'RH'})`,
          appId: app.id,
          company: app.company,
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        });
      }

      // Interview date
      if (app.interviewDate) {
        list.push({
          date: app.interviewDate.substring(0, 10),
          type: 'INTERVIEW',
          title: `Entretien : ${app.company}`,
          subtitle: app.jobTitle,
          appId: app.id,
          company: app.company,
          badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
        });
      }

      // Individual interviews from sub-array
      if (app.interviews) {
        app.interviews.forEach((int) => {
          const d = int.date.substring(0, 10);
          if (d !== app.interviewDate?.substring(0, 10)) {
            list.push({
              date: d,
              type: 'INTERVIEW',
              title: `Entretien ${int.type} : ${app.company}`,
              subtitle: int.interviewer || 'RH / Technique',
              appId: app.id,
              company: app.company,
              badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
            });
          }
        });
      }
    });

    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [applications]);

  // Upcoming events from today onwards
  const upcomingEvents = useMemo(() => {
    return calendarEvents.filter((ev) => ev.type === 'INTERVIEW' || ev.type === 'FOLLOW_UP');
  }, [calendarEvents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Calendrier des entretiens et relances
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Visualisez vos rendez-vous, rappels et étapes de recrutement
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-800"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle candidature</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Monthly Calendar (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-teal-700 dark:text-teal-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {monthNames[month]} {year}
              </h2>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(new Date(2026, 8, 1))}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-[#F4EFE6] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Aujourd'hui
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank offset days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-24 rounded-xl border border-transparent p-1.5 bg-[#F4EFE6]/40 dark:bg-slate-800/20 opacity-40"
              />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
              const dayEvents = calendarEvents.filter((e) => e.date === dateString);
              const isToday =
                year === 2026 && month === 8 && dayNumber === 25; // 25 Septembre 2026

              return (
                <div
                  key={dayNumber}
                  className={`h-24 rounded-xl border p-1.5 transition-colors overflow-hidden flex flex-col justify-between ${
                    isToday
                      ? 'border-teal-600 bg-teal-50/30 dark:border-teal-700 dark:bg-cyan-950/20'
                      : 'border-slate-100 bg-white hover:border-slate-300 dark:border-slate-800/70 dark:bg-slate-900 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday
                          ? 'bg-teal-700 text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[58px]">
                    {dayEvents.slice(0, 2).map((ev, evIdx) => (
                      <div
                        key={evIdx}
                        onClick={() => setSelectedApplicationId(ev.appId)}
                        title={`${ev.title} - ${ev.subtitle}`}
                        className={`cursor-pointer truncate rounded px-1.5 py-0.5 text-[9px] font-bold ${ev.badgeColor}`}
                      >
                        {ev.type === 'INTERVIEW'
                          ? '🎤 '
                          : ev.type === 'FOLLOW_UP'
                            ? '⏰ '
                            : '📄 '}
                        {ev.company}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="block text-[9px] text-slate-400 font-medium">
                        +{dayEvents.length - 2} de plus
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 border-t border-slate-100 pt-4 text-[11px] text-slate-600 dark:border-slate-800 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Entretiens
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Relances prévues
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Candidatures envoyées
            </span>
          </div>
        </div>

        {/* Sidebar: Upcoming Agenda */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-700 dark:text-teal-500" />
                Événements à venir
              </h2>
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:bg-cyan-950 dark:text-teal-400">
                {upcomingEvents.length}
              </span>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((ev, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedApplicationId(ev.appId)}
                  className="group cursor-pointer rounded-xl border border-slate-200 p-3 transition-all hover:border-teal-400 hover:shadow-xs dark:border-slate-800 dark:hover:border-cyan-950"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[9px] font-bold ${ev.badgeColor}`}
                    >
                      {ev.type === 'INTERVIEW' ? 'Entretien' : 'Relance'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {ev.date}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-500 transition-colors">
                    {ev.company}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {ev.subtitle}
                  </p>
                </div>
              ))}

              {upcomingEvents.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">
                  Aucun entretien ou relance planifié pour l'instant.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-[#F4EFE6] p-3 text-[11px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
            💡 <strong>Conseil :</strong> Relancez systématiquement 5 à 7 jours ouvrés après l'envoi d'une candidature sans réponse.
          </div>
        </div>
      </div>
    </div>
  );
};
