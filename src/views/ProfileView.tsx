import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Domain, ContractType } from '../types';
import { DOMAINS, CONTRACT_TYPES } from '../data/initialData';

export const ProfileView: React.FC = () => {
  const { userProfile, updateUserProfile } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(userProfile.firstName);
  const [lastName, setLastName] = useState(userProfile.lastName);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [city, setCity] = useState(userProfile.city);
  const [education, setEducation] = useState(userProfile.education);
  const [specialization, setSpecialization] = useState(userProfile.specialization);
  const [bio, setBio] = useState(userProfile.bio);
  const [primaryResume, setPrimaryResume] = useState(userProfile.primaryResume);
  const [linkedinUrl, setLinkedinUrl] = useState(userProfile.linkedinUrl);
  const [githubUrl, setGithubUrl] = useState(userProfile.githubUrl);
  const [portfolioUrl, setPortfolioUrl] = useState(userProfile.portfolioUrl || '');

  const [skills, setSkills] = useState<string[]>(userProfile.skills);
  const [newSkill, setNewSkill] = useState('');

  const [targetDomains, setTargetDomains] = useState<Domain[]>(userProfile.targetDomains);
  const [targetContracts, setTargetContracts] = useState<ContractType[]>(userProfile.targetContracts);

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

  const toggleTargetDomain = (dom: Domain) => {
    if (targetDomains.includes(dom)) {
      setTargetDomains(targetDomains.filter((d) => d !== dom));
    } else {
      setTargetDomains([...targetDomains, dom]);
    }
  };

  const toggleTargetContract = (c: ContractType) => {
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
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      skills,
      targetDomains,
      targetContracts,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#185868] dark:text-white sm:text-2xl">
            Profil Candidat & CV
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

            <div className="flex-1 space-y-1">
              {isEditing ? (
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Prénom"
                    className="rounded-lg border border-slate-300 p-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nom"
                    className="rounded-lg border border-slate-300 p-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-[#185868] dark:text-white">
                    {firstName} {lastName}
                  </h2>
                  <span className="rounded-full bg-[#E6F0F2] px-2.5 py-0.5 text-xs font-bold text-[#185868] dark:bg-cyan-950 dark:text-teal-400">
                    Candidat(e)
                  </span>
                </div>
              )}

              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-[#185868]" />
                {specialization} • {education}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {city}
              </p>
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
              Présentation & Projet Professionnel
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

          {/* CV Principal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              CV Principal Référencé
            </label>
            {isEditing ? (
              <input
                type="text"
                value={primaryResume}
                onChange={(e) => setPrimaryResume(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-[#E1ECEE] p-3 bg-[#F4F8F9] dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center gap-2.5 text-xs">
                  <FileText className="h-5 w-5 text-[#185868] dark:text-teal-400" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{primaryResume}</p>
                    <p className="text-[11px] text-slate-400">PDF • Mis à jour pour la recherche 2026</p>
                  </div>
                </div>
                <span className="rounded-md bg-[#E6F0F2] px-2.5 py-0.5 text-[10px] font-bold text-[#185868] dark:bg-teal-950 dark:text-teal-300">
                  Actif
                </span>
              </div>
            )}
          </div>

          {/* Compétences (Skills Tags) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Compétences & Technologies maîtrisées
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

          {/* Domaines & Contrats ciblés */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            {/* Domaines */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Domaines recherchés
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DOMAINS.map((dom) => {
                  const selected = targetDomains.includes(dom);
                  return (
                    <button
                      type="button"
                      key={dom}
                      disabled={!isEditing}
                      onClick={() => toggleTargetDomain(dom)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                        selected
                          ? 'bg-[#185868] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {dom}
                    </button>
                  );
                })}
              </div>
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
    </div>
  );
};
