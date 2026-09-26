import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  FileText,
  Linkedin,
  Github,
  Plus,
  X,
  Check,
  Globe,
  Tag,
  Save,
  Download,
  Upload,
  Smartphone,
  Laptop,
  RefreshCw,
  Eye,
  Printer,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Domain, ContractType } from '../types';
import { DOMAINS, CONTRACT_TYPES } from '../data/initialData';

export const ProfileView: React.FC = () => {
  const { userProfile, updateUserProfile, exportData, importData, addToast } = useApp();
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const cvUploadInputRef = useRef<HTMLInputElement>(null);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(userProfile.firstName);
  const [lastName, setLastName] = useState(userProfile.lastName);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [city, setCity] = useState(userProfile.city);
  const [education, setEducation] = useState(userProfile.education);
  const [specialization, setSpecialization] = useState(userProfile.specialization);
  const [bio, setBio] = useState(userProfile.bio);
  
  // CV Upload States
  const [primaryResume, setPrimaryResume] = useState(userProfile.primaryResume);
  const [primaryResumeDataUrl, setPrimaryResumeDataUrl] = useState(userProfile.primaryResumeDataUrl || '');
  const [primaryResumeSize, setPrimaryResumeSize] = useState(userProfile.primaryResumeSize || '245 KB');
  const [primaryResumeUpdatedAt, setPrimaryResumeUpdatedAt] = useState(userProfile.primaryResumeUpdatedAt || '26/09/2026');

  const [linkedinUrl, setLinkedinUrl] = useState(userProfile.linkedinUrl);
  const [githubUrl, setGithubUrl] = useState(userProfile.githubUrl);
  const [portfolioUrl, setPortfolioUrl] = useState(userProfile.portfolioUrl || '');

  const [skills, setSkills] = useState<string[]>(userProfile.skills);
  const [newSkill, setNewSkill] = useState('');

  const [targetDomains, setTargetDomains] = useState<string[]>(userProfile.targetDomains || []);
  const [newCustomDomain, setNewCustomDomain] = useState('');
  
  const [targetContracts, setTargetContracts] = useState<string[]>(userProfile.targetContracts || []);
  const [customContract, setCustomContract] = useState(userProfile.customContract || '');

  const handleCvUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKb = (file.size / 1024).toFixed(0) + ' KB';
    const dateStr = new Date().toLocaleDateString('fr-FR');
    setPrimaryResume(file.name);
    setPrimaryResumeSize(sizeKb);
    setPrimaryResumeUpdatedAt(dateStr);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      setPrimaryResumeDataUrl(dataUrl);
      addToast(`CV "${file.name}" téléversé avec succès !`, 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleRemoveDomain = (domToRemove: string) => {
    setTargetDomains(targetDomains.filter((d) => d !== domToRemove));
  };

  const handleAddCustomDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomDomain.trim()) return;
    const trimmed = newCustomDomain.trim();
    if (!targetDomains.includes(trimmed)) {
      setTargetDomains([...targetDomains, trimmed]);
    }
    setNewCustomDomain('');
  };

  const toggleTargetContract = (c: string) => {
    if (targetContracts.includes(c)) {
      setTargetContracts(targetContracts.filter((ct) => ct !== c));
    } else {
      setTargetContracts([...targetContracts, c]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      firstName,
      lastName,
      email,
      phone,
      city,
      education,
      specialization,
      bio,
      primaryResume,
      primaryResumeDataUrl,
      primaryResumeSize,
      primaryResumeUpdatedAt,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      skills,
      targetDomains,
      targetContracts,
      customContract: targetContracts.includes('Autre') ? customContract : '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#185868] dark:text-white sm:text-2xl">
            Profil Candidat et CV
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gérez vos informations de candidature et le matching IA
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            isEditing
              ? 'border border-slate-300 bg-white text-slate-700 hover:bg-[#F4F8F9] dark:border-slate-700 dark:bg-slate-800 dark:text-white'
              : 'bg-[#185868] text-white shadow-sm hover:bg-[#124552]'
          }`}
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4" />
              <span>Annuler</span>
            </>
          ) : (
            <>
              <User className="h-4 w-4" />
              <span>Modifier le profil</span>
            </>
          )}
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="rounded-2xl border border-[#E1ECEE] bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Identity Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#185868] text-2xl font-black text-white shadow-md">
              {firstName.charAt(0)}
              {lastName.charAt(0)}
            </div>

            <div className="flex-1 space-y-2">
              {isEditing ? (
                <div className="space-y-3 max-w-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Prénom</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Prénom"
                        className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Nom</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Nom"
                        className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Spécialisation / Intitulé</label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="Ex: Ingénierie & Gestion de Projets Web..."
                        className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Diplôme / Formation</label>
                      <input
                        type="text"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="Ex: Master Informatique, Diplôme Ingénieur..."
                        className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Ville / Localisation</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: Paris, Toulouse, Remote..."
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-[#185868] dark:text-white">
                      {firstName} {lastName}
                    </h2>
                    <span className="rounded-full bg-[#E6F0F2] px-2.5 py-0.5 text-xs font-bold text-[#185868] dark:bg-cyan-950 dark:text-teal-400">
                      Candidat(e)
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-[#185868]" />
                    {specialization || 'Intitulé non précisé'} • {education || 'Formation non précisée'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {city}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Contact Details & Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 bg-[#F4F8F9] dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Mail className="h-4 w-4 text-[#185868]" />
                  <span>{email}</span>
                </div>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Téléphone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 bg-[#F4F8F9] dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Phone className="h-4 w-4 text-[#185868]" />
                  <span>{phone}</span>
                </div>
              )}
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Profil LinkedIn
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              ) : (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs text-[#185868] hover:underline dark:text-teal-400 bg-[#F4F8F9] dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                  <span className="truncate">{linkedinUrl}</span>
                </a>
              )}
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Profil GitHub
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              ) : (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs text-slate-800 hover:underline dark:text-slate-200 bg-[#F4F8F9] dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <Github className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                  <span className="truncate">{githubUrl}</span>
                </a>
              )}
            </div>
          </div>

          {/* Bio / Synthèse */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Présentation et Projet Professionnel
            </label>
            {isEditing ? (
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-[#F4F8F9] dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {bio}
              </p>
            )}
          </div>

          {/* CV Principal avec Téléversement Réel */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                CV Principal Référencé
              </label>
              <input
                type="file"
                ref={cvUploadInputRef}
                onChange={handleCvUploadFile}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => cvUploadInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-300 transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Uploader mon CV (.pdf, .docx)</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#E1ECEE] p-3.5 bg-[#F4F8F9] dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-3 text-xs">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#185868] text-white shadow-xs">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{primaryResume}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {primaryResumeSize} • Mis à jour le {primaryResumeUpdatedAt}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsCvModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#185868] bg-[#185868] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#124552] transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Apercevoir mon CV</span>
                </button>

                {primaryResumeDataUrl && (
                  <a
                    href={primaryResumeDataUrl}
                    download={primaryResume}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Télécharger</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Compétences (Skills Tags) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Compétences et Technologies maîtrisées
              </label>
              <span className="text-[11px] text-slate-400">Utilisées par l'algorithme AI Job Match</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#E6F0F2] border border-[#D5E3E7] px-3 py-1 text-xs font-semibold text-[#185868] dark:bg-cyan-950/60 dark:border-cyan-950/60 dark:text-teal-400"
                >
                  <span>{skill}</span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-[#185868] hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isEditing && (
              <div className="flex gap-2 max-w-sm pt-2">
                <input
                  type="text"
                  placeholder="Ajouter une compétence..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="rounded-lg bg-[#185868] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#124552]"
                >
                  Ajouter
                </button>
              </div>
            )}
          </div>

          {/* Domaines et Contrats ciblés */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100 dark:border-slate-800">
            {/* Domaines */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Domaines / Secteurs recherchés
                </label>
              </div>

              {/* List of user domain tags */}
              <div className="flex flex-wrap gap-2">
                {targetDomains.length > 0 ? (
                  targetDomains.map((dom) => (
                    <span
                      key={dom}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#E6F0F2] border border-[#D5E3E7] px-3 py-1 text-xs font-semibold text-[#185868] dark:bg-cyan-950/60 dark:border-cyan-950/60 dark:text-teal-400"
                    >
                      <span>{dom}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDomain(dom)}
                          className="text-[#185868] hover:text-rose-600 dark:text-teal-400 dark:hover:text-rose-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Aucun domaine spécifique renseigné. Cliquez sur modifier pour en ajouter.
                  </p>
                )}
              </div>

              {/* Champ d'ajout d'un domaine libre */}
              {isEditing && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newCustomDomain}
                    onChange={(e) => setNewCustomDomain(e.target.value)}
                    placeholder="Saisir un domaine (ex: Cybersécurité, Data, Finance...)"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDomain}
                    className="rounded-lg bg-[#185868] px-3.5 py-1 text-xs font-bold text-white hover:bg-[#124552] transition-colors"
                  >
                    + Domaine
                  </button>
                </div>
              )}
            </div>

            {/* Contrats */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Types de contrats recherchés
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CONTRACT_TYPES.map((ct) => {
                  const selected = targetContracts.includes(ct);
                  return (
                    <button
                      type="button"
                      key={ct}
                      disabled={!isEditing}
                      onClick={() => toggleTargetContract(ct)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                        selected
                          ? 'bg-[#185868] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {ct}
                    </button>
                  );
                })}
              </div>

              {/* Champ personnalisé si 'Autre' est sélectionné */}
              {targetContracts.includes('Autre') && (
                <div className="mt-3">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Préciser le contrat personnalisé :
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={customContract}
                      onChange={(e) => setCustomContract(e.target.value)}
                      placeholder="Ex: Freelance, VIE, Prestation ESN, Graduate Program..."
                      className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  ) : (
                    <p className="text-xs font-medium text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 p-2 rounded-lg border border-teal-200 dark:border-teal-900">
                      Contrat spécifique : {customContract || 'Non précisé'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Save Button when in edit mode */}
          {isEditing && (
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F4F8F9] dark:border-slate-700 dark:text-slate-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-[#185868] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#124552]"
              >
                <Save className="h-4 w-4" />
                <span>Enregistrer les modifications</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Transfer & Backup Card (Téléphone ↔ Ordinateur) */}
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-white to-[#F4F8F9] p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Transfert et Sauvegarde des données</span>
                <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  Téléphone ↔ Ordinateur
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sauvegardez vos candidatures et votre profil pour continuer votre suivi sur un autre appareil ou navigateur.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={profileFileInputRef}
              onChange={handleProfileFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={exportData}
              className="flex items-center gap-1.5 rounded-xl bg-[#185868] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#124552] transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exporter ma sauvegarde (.json)</span>
            </button>
            <button
              type="button"
              onClick={() => profileFileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-[#F4F8F9] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
            >
              <Upload className="h-4 w-4 text-teal-600" />
              <span>Importer un fichier (.json)</span>
            </button>
          </div>
        </div>

        {/* 3 Step Guide */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              <Laptop className="h-4 w-4 text-teal-600" />
              <span>1. Étape 1 : Exportation</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Sur votre premier appareil (ex: PC), cliquez sur <strong>Exporter ma sauvegarde</strong>. Un fichier <code>.json</code> est téléchargé.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              <RefreshCw className="h-4 w-4 text-teal-600" />
              <span>2. Étape 2 : Envoi</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Envoyez-vous le fichier par mail, WhatsApp, AirDrop, Google Drive ou USB vers votre smartphone/PC.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              <Smartphone className="h-4 w-4 text-teal-600" />
              <span>3. Étape 3 : Importation</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Sur votre second appareil (ex: Mobile), cliquez sur <strong>Importer un fichier</strong> et sélectionnez le fichier JSON. Vos données sont synchronisées !
            </p>
          </div>
        </div>
      </div>

      {/* Modal d'Aperçu du CV Actif */}
      {isCvModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-md overflow-hidden">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#185868] text-white shadow-xs">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Aperçu du CV : {primaryResume}</span>
                    <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                      CV Actif
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Mis à jour le {primaryResumeUpdatedAt} • Taille : {primaryResumeSize}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {primaryResumeDataUrl && (
                  <a
                    href={primaryResumeDataUrl}
                    download={primaryResume}
                    className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Télécharger</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Imprimer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCvModalOpen(false)}
                  className="rounded-xl border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Viewer */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950">
              {primaryResumeDataUrl && (primaryResumeDataUrl.startsWith('data:application/pdf') || primaryResumeDataUrl.startsWith('data:image')) ? (
                <iframe
                  src={primaryResumeDataUrl}
                  title="Aperçu du CV"
                  className="w-full h-[72vh] rounded-xl border border-slate-200 dark:border-slate-800 bg-white shadow-sm"
                />
              ) : (
                /* Standard Visual CV Preview Sheet formatted from user profile */
                <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-md text-slate-800 dark:bg-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 space-y-6 font-sans">
                  {/* CV Header */}
                  <div className="border-b border-slate-200 pb-5 dark:border-slate-800 flex justify-between items-start gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-[#185868] dark:text-white tracking-tight">
                        {firstName} {lastName}
                      </h1>
                      <p className="text-sm font-bold text-teal-700 dark:text-teal-400 mt-1">
                        {specialization || 'Candidat(e)'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {education || 'Master Informatique & Management'}
                      </p>
                    </div>

                    <div className="text-right text-xs space-y-1 text-slate-600 dark:text-slate-300 font-medium">
                      <p className="flex items-center justify-end gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#185868]" />
                        <span>{email}</span>
                      </p>
                      <p className="flex items-center justify-end gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-[#185868]" />
                        <span>{phone}</span>
                      </p>
                      <p className="flex items-center justify-end gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{city}</span>
                      </p>
                    </div>
                  </div>

                  {/* Profile Summary */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#185868] dark:text-teal-400 mb-2">
                      Profil & Synthèse Professionnelle
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      {bio || 'Candidat expérimenté en recherche active de nouvelles opportunités.'}
                    </p>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#185868] dark:text-teal-400 mb-2">
                      Compétences Clés & Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s) => (
                        <span key={s} className="rounded-lg bg-[#E6F0F2] px-3 py-1 text-xs font-semibold text-[#185868] dark:bg-teal-950 dark:text-teal-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Targeted Domains */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#185868] dark:text-teal-400 mb-2">
                      Domaines & Contrats Recherchés
                    </h4>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {targetDomains.map((d) => (
                        <span key={d} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {d}
                        </span>
                      ))}
                      {targetContracts.map((c) => (
                        <span key={c} className="rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1 font-bold text-teal-800 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300">
                          {c === 'Autre' && customContract ? customContract : c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-400">
                    Fiche CV générée et référencée dans Candidly JobTracker • Fichier original : {primaryResume}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
