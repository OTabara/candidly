import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Link,
  DollarSign,
  User,
  Mail,
  Phone,
  Clock,
  FileText,
  Tag,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApplicationStatus, ContractType, Domain, JobApplication } from '../types';
import { DOMAINS, CONTRACT_TYPES, STATUS_CONFIG } from '../data/initialData';

export const ApplicationModal: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    editingApplication,
    setEditingApplication,
    addApplication,
    updateApplication,
    userProfile,
  } = useApp();

  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [contractType, setContractType] = useState<ContractType>('Stage');
  const [domain, setDomain] = useState<Domain>('Data');
  const [location, setLocation] = useState('');
  const [applicationDate, setApplicationDate] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('ENVOYEE');
  const [jobUrl, setJobUrl] = useState('');
  const [salaryGratification, setSalaryGratification] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [recruiterPhone, setRecruiterPhone] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [notes, setNotes] = useState('');
  const [resumeUsed, setResumeUsed] = useState('');
  const [coverLetterUsed, setCoverLetterUsed] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingApplication) {
      setCompany(editingApplication.company);
      setJobTitle(editingApplication.jobTitle);
      setContractType(editingApplication.contractType);
      setDomain(editingApplication.domain);
      setLocation(editingApplication.location);
      setApplicationDate(editingApplication.applicationDate);
      setStatus(editingApplication.status);
      setJobUrl(editingApplication.jobUrl || '');
      setSalaryGratification(editingApplication.salaryGratification || '');
      setRecruiterName(editingApplication.recruiterName || '');
      setRecruiterEmail(editingApplication.recruiterEmail || '');
      setRecruiterPhone(editingApplication.recruiterPhone || '');
      setNextFollowUpDate(editingApplication.nextFollowUpDate || '');
      setInterviewDate(editingApplication.interviewDate || '');
      setNotes(editingApplication.notes || '');
      setResumeUsed(editingApplication.resumeUsed || userProfile.primaryResume);
      setCoverLetterUsed(editingApplication.coverLetterUsed || '');
      setTagsInput(editingApplication.tags ? editingApplication.tags.join(', ') : '');
    } else {
      // Default new form values
      const today = new Date().toISOString().substring(0, 10);
      setCompany('');
      setJobTitle('');
      setContractType('Stage');
      setDomain('Business Intelligence');
      setLocation('Toulouse');
      setApplicationDate(today);
      setStatus('ENVOYEE');
      setJobUrl('');
      setSalaryGratification('1 300 € / mois');
      setRecruiterName('');
      setRecruiterEmail('');
      setRecruiterPhone('');
      setNextFollowUpDate('');
      setInterviewDate('');
      setNotes('');
      setResumeUsed(userProfile.primaryResume || 'CV_Principal_MIAGE.pdf');
      setCoverLetterUsed('');
      setTagsInput('');
    }
    setErrors({});
  }, [editingApplication, isAddModalOpen, userProfile]);

  if (!isAddModalOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!company.trim()) {
      newErrors.company = "Le nom de l'entreprise est obligatoire.";
    }
    if (!jobTitle.trim()) {
      newErrors.jobTitle = "L'intitulé du poste est obligatoire.";
    }
    if (!applicationDate) {
      newErrors.applicationDate = 'La date de candidature est obligatoire.';
    }
    if (recruiterEmail && !recruiterEmail.includes('@')) {
      newErrors.recruiterEmail = 'Adresse email invalide.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload: Partial<JobApplication> = {
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      contractType,
      domain,
      location: location.trim() || 'France',
      applicationDate,
      status,
      jobUrl: jobUrl.trim() || undefined,
      salaryGratification: salaryGratification.trim() || undefined,
      recruiterName: recruiterName.trim() || undefined,
      recruiterEmail: recruiterEmail.trim() || undefined,
      recruiterPhone: recruiterPhone.trim() || undefined,
      nextFollowUpDate: nextFollowUpDate || undefined,
      interviewDate: interviewDate || undefined,
      notes: notes.trim() || undefined,
      resumeUsed: resumeUsed.trim() || undefined,
      coverLetterUsed: coverLetterUsed.trim() || undefined,
      tags,
    };

    if (editingApplication) {
      updateApplication(editingApplication.id, payload);
    } else {
      addApplication(payload);
    }

    setIsAddModalOpen(false);
    setEditingApplication(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingApplication ? 'Modifier la candidature' : 'Nouvelle candidature'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Renseignez les détails pour suivre efficacement vos étapes de recrutement
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsAddModalOpen(false);
              setEditingApplication(null);
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Section 1: Informations Générales */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-500">
              1. L'opportunité
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Entreprise */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nom de l'entreprise <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ex: Orange, Wavestone, Capgemini..."
                    className={`w-full rounded-xl border pl-9 pr-3 py-2 text-xs transition-colors focus:outline-none focus:ring-2 dark:bg-slate-800/80 dark:text-white ${
                      errors.company
                        ? 'border-rose-400 focus:ring-rose-400'
                        : 'border-slate-300 focus:ring-teal-600 dark:border-slate-700'
                    }`}
                  />
                </div>
                {errors.company && (
                  <p className="mt-1 text-[11px] text-rose-500">{errors.company}</p>
                )}
              </div>

              {/* Intitulé du poste */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Intitulé du poste <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Ex: Consultant BI, Data Analyst..."
                    className={`w-full rounded-xl border pl-9 pr-3 py-2 text-xs transition-colors focus:outline-none focus:ring-2 dark:bg-slate-800/80 dark:text-white ${
                      errors.jobTitle
                        ? 'border-rose-400 focus:ring-rose-400'
                        : 'border-slate-300 focus:ring-teal-600 dark:border-slate-700'
                    }`}
                  />
                </div>
                {errors.jobTitle && (
                  <p className="mt-1 text-[11px] text-rose-500">{errors.jobTitle}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Type de contrat */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Type de contrat
                </label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value as ContractType)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                >
                  {CONTRACT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Domaine */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Domaine
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as Domain)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                >
                  {DOMAINS.map((dom) => (
                    <option key={dom} value={dom}>
                      {dom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Localisation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Localisation
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Toulouse, Paris, Full Remote..."
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Statut & Dates */}
          <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-500">
              2. Statut & Calendrier
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Statut initial */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Statut actuel
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date de candidature */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date de candidature <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={applicationDate}
                    onChange={(e) => setApplicationDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date de relance */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date de relance prévue
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
              </div>

              {/* Date d'entretien */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date d'entretien
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Recruteur & Lien */}
          <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-500">
              3. Contact & Rémunération
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Nom Recruteur */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nom du contact / Recruteur
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    placeholder="Ex: Sophie Bernard"
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
              </div>

              {/* Email Recruteur */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email du recruteur
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                    placeholder="recrutement@entreprise.com"
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
                {errors.recruiterEmail && (
                  <p className="mt-1 text-[11px] text-rose-500">{errors.recruiterEmail}</p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={recruiterPhone}
                    onChange={(e) => setRecruiterPhone(e.target.value)}
                    placeholder="+33 6..."
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* URL Offre */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lien de l'offre
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
              </div>

              {/* Salaire / Gratification */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Salaire ou Gratification
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={salaryGratification}
                    onChange={(e) => setSalaryGratification(e.target.value)}
                    placeholder="Ex: 1 350 € / mois ou 42k€"
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Documents & Notes */}
          <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-500">
              4. Documents & Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CV Utilisé */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CV envoyé (Fichier PDF/DOCX)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-[#F4F8F9] px-3 py-2 text-xs text-slate-600 hover:bg-[#E6F0F2] transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <FileText className="h-4 w-4 text-[#185868] shrink-0" />
                    <span className="truncate flex-1 font-medium">
                      {resumeUsed || userProfile.primaryResume || 'Choisir un fichier CV (.pdf, .docx)...'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setResumeUsed(file.name);
                      }}
                    />
                  </label>
                  {resumeUsed && (
                    <button
                      type="button"
                      onClick={() => setResumeUsed('')}
                      className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors"
                      title="Retirer le fichier"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lettre de motivation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lettre de motivation (Fichier PDF/DOCX)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-[#F4F8F9] px-3 py-2 text-xs text-slate-600 hover:bg-[#E6F0F2] transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <FileText className="h-4 w-4 text-[#2A9D8F] shrink-0" />
                    <span className="truncate flex-1 font-medium">
                      {coverLetterUsed || 'Choisir une lettre de motivation (.pdf, .docx)...'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setCoverLetterUsed(file.name);
                      }}
                    />
                  </label>
                  {coverLetterUsed && (
                    <button
                      type="button"
                      onClick={() => setCoverLetterUsed('')}
                      className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors"
                      title="Retirer le fichier"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tags & Mots-clés (séparés par des virgules)
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="SQL, Power BI, Process Mining, Télétravail..."
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes et impressions
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Détails sur l'équipe, questions posées en entretien, points clés à aborder..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:ring-2 focus:ring-teal-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingApplication(null);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-5 py-2 text-xs font-semibold text-white shadow-sm shadow-teal-700/30 hover:bg-teal-800"
            >
              <Check className="h-4 w-4" />
              <span>{editingApplication ? 'Enregistrer les modifications' : 'Ajouter la candidature'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
