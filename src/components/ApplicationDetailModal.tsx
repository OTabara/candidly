import React, { useState } from 'react';
import {
  X,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  DollarSign,
  User,
  Mail,
  Phone,
  Clock,
  FileText,
  Tag,
  Edit3,
  Trash2,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApplicationStatus } from '../types';
import { STATUS_CONFIG } from '../data/initialData';

export const ApplicationDetailModal: React.FC = () => {
  const {
    applications,
    selectedApplicationId,
    setSelectedApplicationId,
    setIsAddModalOpen,
    setEditingApplication,
    deleteApplication,
    updateStatus,
    addTimelineEvent,
    setActiveTab,
  } = useApp();

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const application = applications.find((a) => a.id === selectedApplicationId);

  if (!selectedApplicationId || !application) return null;

  const currentStatusConfig = STATUS_CONFIG[application.status];

  const handleEdit = () => {
    setEditingApplication(application);
    setIsAddModalOpen(true);
  };

  const handleDelete = () => {
    deleteApplication(application.id);
    setIsConfirmDeleteOpen(false);
  };

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    updateStatus(application.id, newStatus);
  };

  const handleAddTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    addTimelineEvent(application.id, {
      date: new Date().toISOString().substring(0, 10),
      title: newEventTitle.trim(),
      description: newEventDesc.trim() || undefined,
      type: 'NOTE',
    });

    setNewEventTitle('');
    setNewEventDesc('');
    setIsAddingEvent(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      <div className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-0 sm:my-6 overflow-hidden">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-200 p-4 sm:p-6 dark:border-slate-800 gap-3 sm:gap-4 shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <div
              className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl text-lg sm:text-xl font-bold text-white shadow-md ${application.logoBg || 'bg-teal-700'}`}
            >
              {application.logoLetter || application.company.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white break-words leading-tight">
                  {application.jobTitle}
                </h2>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {application.contractType}
                </span>
                <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-teal-800 dark:bg-cyan-950/60 dark:text-teal-400">
                  {application.domain}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 truncate">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-teal-600" />
                  {application.company}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {application.location}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  Postulé le {application.applicationDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 self-end sm:self-start">
            <button
              type="button"
              onClick={handleEdit}
              title="Modifier"
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5 text-teal-600" />
              <span className="hidden sm:inline">Modifier</span>
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmDeleteOpen(true)}
              title="Supprimer"
              className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Supprimer</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedApplicationId(null)}
              className="rounded-xl border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
              title="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Popup */}
        {isConfirmDeleteOpen && (
          <div className="border-b border-rose-200 bg-rose-50 p-3 sm:p-4 text-xs dark:border-rose-900/50 dark:bg-rose-950/40 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-bold text-rose-800 dark:text-rose-300">
                  Confirmer la suppression de cette candidature ?
                </p>
                <p className="text-rose-600 dark:text-rose-400">
                  Cette action retirera {application.company} de votre suivi.
                </p>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-semibold text-slate-700 hover:bg-[#F4EFE6] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-lg bg-rose-600 px-3 py-1 font-semibold text-white hover:bg-rose-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 bg-[#F4EFE6]/50 px-4 sm:px-6 py-2.5 sm:py-3 dark:border-slate-800 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Statut actuel :
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${currentStatusConfig.badgeClass}`}
            >
              <span className={`h-2 w-2 rounded-full ${currentStatusConfig.dotColor}`} />
              {currentStatusConfig.label}
            </span>
          </div>

          {/* Quick status selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full scrollbar-none">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0">Changer :</span>
            {(['A_CONTACTER', 'ENVOYEE', 'EN_ATTENTE', 'ENTRETIEN', 'OFFRE_RECUE', 'ACCEPTEE', 'REFUSEE'] as ApplicationStatus[]).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    application.status === st
                      ? 'bg-teal-700 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {STATUS_CONFIG[st].label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/50">
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <DollarSign className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                Rémunération / Gratification
              </span>
              <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                {application.salaryGratification || 'Non précisé'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/50">
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                Prochaine relance
              </span>
              <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                {application.nextFollowUpDate ? application.nextFollowUpDate : 'Aucune date'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/50">
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                Date d'entretien
              </span>
              <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                {application.interviewDate ? application.interviewDate : 'Non planifié'}
              </p>
            </div>
          </div>

          {/* Section: Contact Recruteur */}
          <div className="rounded-xl border border-slate-200 p-3.5 sm:p-4 dark:border-slate-800 bg-white dark:bg-slate-800/40">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              <User className="h-4 w-4 text-teal-600 shrink-0" />
              Contact Recruteur et Entreprise
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="min-w-0">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Nom</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {application.recruiterName || 'Non renseigné'}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Email</span>
                {application.recruiterEmail ? (
                  <a
                    href={`mailto:${application.recruiterEmail}`}
                    className="font-semibold text-teal-700 hover:underline dark:text-teal-400 flex items-center gap-1 truncate block"
                    title={application.recruiterEmail}
                  >
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{application.recruiterEmail}</span>
                  </a>
                ) : (
                  <span className="text-slate-400">Non renseigné</span>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Téléphone</span>
                {application.recruiterPhone ? (
                  <a
                    href={`tel:${application.recruiterPhone}`}
                    className="font-semibold text-teal-700 hover:underline dark:text-teal-400 flex items-center gap-1 truncate block"
                  >
                    <Phone className="h-3 w-3 shrink-0" />
                    <span className="truncate">{application.recruiterPhone}</span>
                  </a>
                ) : (
                  <span className="text-slate-400">Non renseigné</span>
                )}
              </div>
            </div>

            {application.jobUrl && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-400 break-all"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span>Consulter l'offre originale sur le site carrières</span>
                </a>
              </div>
            )}
          </div>

          {/* Section: Documents Associés */}
          <div className="rounded-xl border border-slate-200 p-3.5 sm:p-4 dark:border-slate-800 bg-white dark:bg-slate-800/40">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              <FileText className="h-4 w-4 text-teal-500 shrink-0" />
              Documents associés
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-2.5 dark:border-slate-700 bg-[#F4EFE6]/50 dark:bg-slate-800/60 min-w-0">
                <FileText className="h-5 w-5 text-teal-700 dark:text-teal-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Curriculum Vitae :</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={application.resumeUsed || 'CV_Principal_MIAGE.pdf'}>
                    {application.resumeUsed || 'CV_Principal_MIAGE.pdf'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-2.5 dark:border-slate-700 bg-[#F4EFE6]/50 dark:bg-slate-800/60 min-w-0">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Lettre de motivation :</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={application.coverLetterUsed || 'Non attachée'}>
                    {application.coverLetterUsed || 'Non attachée'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Notes et Tags */}
          {(application.notes || (application.tags && application.tags.length > 0)) && (
            <div className="rounded-xl border border-slate-200 p-3.5 sm:p-4 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-3">
              {application.tags && application.tags.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                    <Tag className="h-3 w-3 shrink-0" /> Mots-clés et Processus :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {application.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {application.notes && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                    Notes et impressions :
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words leading-relaxed bg-[#F4EFE6] dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    {application.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Section: Timeline Historique */}
          <div className="rounded-xl border border-slate-200 p-3.5 sm:p-4 dark:border-slate-800 bg-white dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                <Clock className="h-4 w-4 text-teal-600 shrink-0" />
                Historique chronologique
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingEvent(!isAddingEvent)}
                className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-400"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                {isAddingEvent ? 'Fermer' : 'Ajouter un événement'}
              </button>
            </div>

            {/* Quick add event input form */}
            {isAddingEvent && (
              <form
                onSubmit={handleAddTimeline}
                className="mb-4 rounded-xl border border-teal-100 bg-teal-50/50 p-3 dark:border-cyan-950/40 dark:bg-cyan-950/30 space-y-2"
              >
                <p className="text-[11px] font-bold text-cyan-950 dark:text-teal-300">
                  Nouvelle étape dans l'historique
                </p>
                <input
                  type="text"
                  placeholder="Titre (ex: Entretien téléphonique RH, Relance envoyée...)"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <textarea
                  rows={2}
                  placeholder="Détails complémentaires (optionnel)"
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingEvent(false)}
                    className="rounded-lg px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-lg bg-teal-700 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-800"
                  >
                    <Send className="h-3 w-3" />
                    Enregistrer
                  </button>
                </div>
              </form>
            )}

            {/* Timeline Events List */}
            <div className="relative pl-5 sm:pl-6 space-y-4 sm:space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {application.timeline && application.timeline.length > 0 ? (
                application.timeline.map((event) => (
                  <div key={event.id} className="relative">
                    <span className="absolute -left-[19px] sm:-left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-teal-700 dark:border-slate-900" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {event.date}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 break-words">
                          {event.title}
                        </span>
                      </div>
                      {event.description && (
                        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 break-words">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative">
                  <span className="absolute -left-[19px] sm:-left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-teal-700 dark:border-slate-900" />
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {application.applicationDate}
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Candidature envoyée
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 dark:border-slate-800 gap-2 sm:gap-4 shrink-0 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => {
              setSelectedApplicationId(null);
              setActiveTab('ai-match');
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-300 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Tester avec AI Job Match</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedApplicationId(null)}
            className="w-full sm:w-auto rounded-xl border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

