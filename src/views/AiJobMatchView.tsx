import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Briefcase,
  Layers,
  ArrowRight,
  Target,
  BookmarkPlus,
  HelpCircle,
  Clock,
  BookOpen,
  Star,
  Check,
  Building2,
  MapPin,
  Tag,
  FileText,
  MessageSquare,
  Key,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyzeJobOffer, AnalysisBreakdown } from '../utils/jobMatchEngine';
import {
  generateGeminiInterviewQuestions,
  getGeminiApiKey,
  saveGeminiApiKey,
  GeneratedInterviewQuestion,
} from '../services/geminiService';

export const AiJobMatchView: React.FC = () => {
  const { userProfile, setIsAddModalOpen, setEditingApplication, addToast } = useApp();

  const [jobText, setJobText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisBreakdown | null>(null);

  // Gemini API et questions d'entretien
  const [questions, setQuestions] = useState<GeneratedInterviewQuestion[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [usedGeminiApi, setUsedGeminiApi] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getGeminiApiKey());

  // Sample real job offer templates for MIAGE profile
  const sampleJob1 = `Offre : Consultant Business Intelligence et Data (Stage fin d'études / CDI) - Wavestone Paris
Missions :
- Participer à la conception et à la mise en œuvre de solutions décisionnelles (ETL, Data Warehouse, Datamart).
- Modéliser et optimiser les processus métiers (BPMN 2.0) pour nos clients grands comptes.
- Développer des tableaux de bord interactifs sous Power BI et Tableau.
- Rédiger les spécifications fonctionnelles et techniques dans un cadre Agile / Scrum.

Profil recherché :
- Étudiant(e) en dernière année d'école d'ingénieurs ou Master MIAGE.
- Compétences solides en SQL, modélisation de données (Merise / UML / Schéma en étoile) et outils décisionnels.
- Connaissance de Python pour l'analyse de données et d'outils de Process Mining appréciée.
- Bonne aisance relationnelle et esprit d'analyse.`;

  const sampleJob2 = `Offre : Data Analyst et Process Mining Junior - Orange Business Toulouse
Dans le cadre de l'optimisation des flux de facturation télécom, vos missions :
- Extraire et traiter des volumes massifs de logs avec SQL et Python.
- Mettre en place un outil de Process Mining (Celonis) pour détecter les goulots d'étranglement.
- Analyser les KPIs de performance et collaborer avec les directions métiers.
- Compétences demandées : SQL, PostgreSQL, Python, Docker, modélisation BPMN, outils BI.`;

  const handleAnalyze = () => {
    if (!jobText.trim()) return;

    if (jobText.trim().length < 30) {
      addToast("L'offre d'emploi est trop courte pour effectuer une analyse précise.", 'warning');
      return;
    }

    setIsAnalyzing(true);
    setLoadingStep(1);
    setQuestions([]); // reset questions on new analysis

    // Step-by-step progress animation for transparent UX
    setTimeout(() => {
      setLoadingStep(2);
    }, 250);

    setTimeout(() => {
      setLoadingStep(3);
    }, 500);

    setTimeout(() => {
      const result = analyzeJobOffer(jobText, userProfile);
      setAnalysisResult(result);
      setIsAnalyzing(false);
      setLoadingStep(0);
      addToast('Analyse de correspondance terminée !', 'success');
    }, 750);
  };

  // Generate interview questions using Gemini API or local fallback
  const handleGenerateQuestions = async () => {
    if (!analysisResult || !jobText) return;

    setIsGeneratingQuestions(true);
    try {
      const res = await generateGeminiInterviewQuestions(jobText, analysisResult, userProfile);
      setQuestions(res.questions);
      setUsedGeminiApi(res.usedApi);
      if (res.usedApi) {
        addToast('Questions d\'entretien sur-mesure générées via Google Gemini API !', 'success');
      } else {
        addToast('Questions d\'entretien préparatoires générées par le moteur local.', 'info');
      }
    } catch (e) {
      console.error(e);
      addToast('Erreur lors de la génération des questions.', 'error');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveGeminiApiKey(apiKeyInput);
    setShowApiKeyInput(false);
    addToast('Clé d\'API Google Gemini enregistrée !', 'success');
  };

  // Pre-fill existing Candidly ApplicationModal with extracted offer details
  const handleCreateApplicationFromJob = () => {
    if (!analysisResult) return;

    const detected = analysisResult.detectedJob;
    const today = new Date().toISOString().substring(0, 10);

    let notesText = `Analyse AI Job Match : Score de correspondance ${analysisResult.scoreGlobal}% (${analysisResult.labelScore}). Compétences clés : ${analysisResult.exactMatches.join(', ')}.`;
    if (questions.length > 0) {
      notesText += `\n\nQuestions d'entretien préparées :\n` + questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n');
    }

    setEditingApplication({
      id: '',
      company: detected.company || '',
      jobTitle: detected.jobTitle || 'Poste Analysé (AI Job Match)',
      contractType: (detected.contractType as any) || 'Stage',
      domain: (detected.domain as any) || 'Business Intelligence',
      location: detected.location || 'France',
      applicationDate: today,
      status: 'A_CONTACTER',
      jobUrl: detected.jobUrl || '',
      notes: notesText,
      tags: detected.tags.length > 0 ? detected.tags : ['AI Job Match'],
      createdAt: today,
      updatedAt: today,
    });

    setIsAddModalOpen(true);
    addToast('Formulaire de candidature pré-rempli. Vous pouvez le vérifier et valider.', 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F0F2] px-3.5 py-1 text-xs font-bold text-[#185868] dark:bg-cyan-950/60 dark:text-teal-300 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-[#2A9D8F]" />
          <span>Module d'analyse d'offres, conseils et questions d'entretien</span>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-[#164E63] dark:text-white sm:text-2xl">
          AI Job Match : Analyseur d'Offre et Préparation d'Entretien
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Collez le texte d'une offre d'emploi pour évaluer votre adéquation avec votre profil {userProfile.specialization || 'Master MIAGE'}, identifier vos points forts et générer vos questions d'entretien.
        </p>
      </div>

      {/* Input Box et Templates */}
      <div className="rounded-2xl border border-[#E1ECEE] bg-[#FCFCFA] p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        {/* Sample job buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Tester avec une offre exemple :
            </span>
            <button
              type="button"
              onClick={() => setJobText(sampleJob1)}
              className="rounded-lg border border-slate-200 bg-[#F4EFE6] px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-[#EBE2D3] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              Wavestone (Consultant BI)
            </button>
            <button
              type="button"
              onClick={() => setJobText(sampleJob2)}
              className="rounded-lg border border-slate-200 bg-[#F4EFE6] px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-[#EBE2D3] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              Orange Business (Process Mining)
            </button>
          </div>

          {/* Configuration Clé Gemini API */}
          <button
            type="button"
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#185868] hover:underline dark:text-teal-400"
          >
            <Key className="h-3.5 w-3.5" />
            <span>{getGeminiApiKey() ? 'Clé Gemini configurée' : 'Configurer clé Gemini API (Optionnel)'}</span>
          </button>
        </div>

        {/* Input Clé Gemini API si déplié */}
        {showApiKeyInput && (
          <form onSubmit={handleSaveApiKey} className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 dark:border-teal-900/60 dark:bg-slate-800/80 flex gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Saisir votre clé Google Gemini API (ex: AIzaSy...)"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#164E63] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#124552]"
            >
              Enregistrer
            </button>
          </form>
        )}

        {/* Text Area */}
        <div className="relative">
          <textarea
            rows={7}
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Collez ici l'intitulé, les missions et le profil recherché de l'offre d'emploi..."
            className="w-full rounded-xl border border-slate-300 p-4 text-xs focus:ring-2 focus:ring-[#2A9D8F] dark:border-slate-700 dark:bg-slate-800 dark:text-white leading-relaxed font-sans"
          />
          {jobText.trim().length > 0 && jobText.trim().length < 30 && (
            <p className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              ⚠️ Offre très courte : collez la description complète du poste pour un résultat optimal.
            </p>
          )}
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Profil comparé : <strong>{userProfile.firstName} {userProfile.lastName}</strong> ({userProfile.specialization || 'MIAGE'})
          </span>
          <button
            type="button"
            disabled={!jobText.trim() || isAnalyzing}
            onClick={handleAnalyze}
            className="inline-flex items-center gap-2 rounded-xl bg-[#164E63] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#124552] disabled:opacity-50 transition-all active:scale-95 self-end sm:self-auto"
          >
            <Sparkles className="h-4 w-4 text-[#2A9D8F]" />
            <span>{isAnalyzing ? 'Analyse en cours...' : "Analyser l'offre"}</span>
          </button>
        </div>
      </div>

      {/* Loading Step Animation State */}
      {isAnalyzing && (
        <div className="rounded-2xl border border-teal-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F0F2] text-[#164E63] animate-spin">
            <Sparkles className="h-6 w-6 text-[#2A9D8F]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#164E63] dark:text-white">
              Analyse déterministe de l'offre d'emploi...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {loadingStep === 1 && "Extraction des compétences et des mots-clés de l'offre..."}
              {loadingStep === 2 && "Comparaison avec l'arbre hiérarchique de vos compétences..."}
              {loadingStep === 3 && "Calcul du score explicable et génération des conseils..."}
            </p>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysisResult && !isAnalyzing && (
        <div className="space-y-6">
          {/* Section 1: Score et Sub-scores */}
          <div className="rounded-2xl border border-teal-200 bg-[#FCFCFA] p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300 mb-1">
                  <Target className="h-3.5 w-3.5" />
                  <span>Score d'adéquation global</span>
                </div>
                <h2 className="text-lg font-extrabold text-[#164E63] dark:text-white flex items-center gap-2">
                  <span>{analysisResult.labelScore}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Niveau d'expérience détecté : {analysisResult.detectedJob.experienceRequired}
                </p>
              </div>

              {/* Big Score Gauge Badge */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score Global</span>
                  <p className="text-3xl font-black text-[#164E63] dark:text-teal-400">
                    {analysisResult.scoreGlobal}%
                  </p>
                </div>
                <div
                  className={`h-14 w-14 rounded-2xl border-4 flex items-center justify-center font-black text-sm shadow-xs ${
                    analysisResult.scoreGlobal >= 80
                      ? 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300'
                      : analysisResult.scoreGlobal >= 60
                      ? 'border-[#2A9D8F] text-[#164E63] bg-teal-50 dark:bg-teal-950 dark:text-teal-300'
                      : analysisResult.scoreGlobal >= 40
                      ? 'border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300'
                      : 'border-rose-500 text-rose-700 bg-rose-50 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {analysisResult.scoreGlobal}%
                </div>
              </div>
            </div>

            {/* Sub-scores Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Correspondance des compétences (50%)
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-[#164E63] dark:text-white">
                    {analysisResult.subScores.skillsScore}%
                  </span>
                  <div className="h-2 w-20 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-700">
                    <div
                      className="h-full bg-[#2A9D8F] rounded-full transition-all"
                      style={{ width: `${analysisResult.subScores.skillsScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Mots-clés du poste (30%)
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-[#164E63] dark:text-white">
                    {analysisResult.subScores.keywordsScore}%
                  </span>
                  <div className="h-2 w-20 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-700">
                    <div
                      className="h-full bg-[#164E63] rounded-full transition-all"
                      style={{ width: `${analysisResult.subScores.keywordsScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Adéquation profil et domaine (20%)
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-[#164E63] dark:text-white">
                    {analysisResult.subScores.profileDomainScore}%
                  </span>
                  <div className="h-2 w-20 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-700">
                    <div
                      className="h-full bg-[#2A9D8F] rounded-full transition-all"
                      style={{ width: `${analysisResult.subScores.profileDomainScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Synthèse textuelle */}
            <div className="rounded-xl bg-[#E6F0F2] p-4 border border-[#D5E3E7] dark:bg-slate-800 dark:border-slate-700">
              <p className="text-xs text-[#164E63] dark:text-slate-200 leading-relaxed font-medium">
                {analysisResult.summaryText}
              </p>
            </div>
          </div>

          {/* Section 2: Tripartite Skills Categorization */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Exact Matches */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs dark:border-emerald-950/60 dark:bg-slate-900 space-y-3">
              <h3 className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>✓ Correspondances ({analysisResult.exactMatches.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Compétences demandées et directement présentes sur votre profil.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {analysisResult.exactMatches.length > 0 ? (
                  analysisResult.exactMatches.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-300"
                    >
                      ✓ {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Aucune correspondance exacte directe</span>
                )}
              </div>
            </div>

            {/* Partial Matches (Skill Hierarchy) */}
            <div className="rounded-2xl border border-[#2A9D8F]/30 bg-white p-5 shadow-xs dark:border-teal-950/60 dark:bg-slate-900 space-y-3">
              <h3 className="flex items-center gap-2 text-xs font-bold text-[#164E63] dark:text-teal-400 uppercase tracking-wider">
                <Layers className="h-4 w-4 text-[#2A9D8F]" />
                <span>◐ Correspondances partielles ({analysisResult.partialMatches.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Compétences proches ou appartenant à la même famille hiérarchique.
              </p>
              <div className="space-y-2 pt-1">
                {analysisResult.partialMatches.length > 0 ? (
                  analysisResult.partialMatches.map((p, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-teal-50/60 border border-teal-100 p-2.5 text-xs dark:bg-teal-950/40 dark:border-teal-900/40"
                    >
                      <div className="flex items-center justify-between font-bold text-[#164E63] dark:text-teal-300 mb-0.5">
                        <span>{p.skill} ➔ {p.targetSkill}</span>
                        <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400">Partiel</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                        {p.reason}
                      </p>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Aucune correspondance partielle</span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-xs dark:border-amber-950/60 dark:bg-slate-900 space-y-3">
              <h3 className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>! Compétences à renforcer ({analysisResult.missingSkills.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Exigences de l'offre absentes de votre profil à préparer.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {analysisResult.missingSkills.length > 0 ? (
                  analysisResult.missingSkills.map((m, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-300"
                    >
                      ! {m.skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Aucune lacune majeure détectée</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: "À mettre en avant" et "À préparer" */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 📌 À mettre en avant dans votre candidature */}
            <div className="rounded-2xl border border-[#E1ECEE] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#164E63] dark:text-white">
                  📌 À mettre en avant dans votre candidature
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Les 3 à 5 éléments prioritaires de votre profil qui valorisent le mieux votre dossier pour cette offre :
              </p>

              <div className="space-y-2.5">
                {analysisResult.topStrengthsToHighlight.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl bg-[#F4EFE6]/60 p-3 border border-[#EBE2D3] dark:bg-slate-800/80 dark:border-slate-700"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#164E63] text-xs font-black text-white">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#164E63] dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 📚 À préparer avant de postuler */}
            <div className="rounded-2xl border border-[#E1ECEE] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <BookOpen className="h-4 w-4 text-[#164E63] dark:text-teal-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#164E63] dark:text-white">
                  📚 À préparer avant de postuler
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Points à travailler ou à anticiper pour vos entretiens techniques et RH :
              </p>

              <div className="space-y-2.5">
                {analysisResult.elementsToPrepare.map((prep, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/60 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#164E63] dark:text-white">
                        {prep.item}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          prep.statusType === 'Manquante'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : prep.statusType === 'Partielle'
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {prep.statusType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {prep.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Générateur de Questions d'Entretien (avec Gemini API et Fallback Local) */}
          <div className="rounded-2xl border border-teal-200 bg-[#FCFCFA] p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#2A9D8F]" />
                  <h3 className="text-sm font-bold text-[#164E63] dark:text-white">
                    Générateur de Questions d'Entretien Préparatoires
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Simulez les questions des recruteurs adaptées à l'offre et préparez vos réponses stratégiques.
                </p>
              </div>

              <button
                type="button"
                disabled={isGeneratingQuestions}
                onClick={handleGenerateQuestions}
                className="flex items-center gap-2 rounded-xl bg-[#164E63] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#124552] disabled:opacity-50 transition-colors shrink-0"
              >
                <Sparkles className="h-4 w-4 text-[#2A9D8F]" />
                <span>
                  {isGeneratingQuestions
                    ? 'Génération...'
                    : questions.length > 0
                    ? 'Régénérer les questions'
                    : 'Générer mes questions d\'entretien'}
                </span>
              </button>
            </div>

            {/* Accordion Questions List */}
            {questions.length > 0 && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Questions d'entretien ciblées ({questions.length})
                  </span>
                  <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md">
                    {usedGeminiApi ? '🤖 Mode IA (Google Gemini)' : '⚡ Mode Moteur Local'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {questions.map((q, idx) => {
                    const isExpanded = expandedQuestionId === q.id;
                    return (
                      <div
                        key={q.id || idx}
                        className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800/80 overflow-hidden transition-all"
                      >
                        {/* Question Header */}
                        <div
                          onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                          className="flex cursor-pointer items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#E6F0F2] text-xs font-bold text-[#164E63] dark:bg-cyan-950 dark:text-teal-300">
                              Q{idx + 1}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-[#164E63] dark:text-white leading-snug">
                                {q.question}
                              </p>
                              <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                {q.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Question Content (Advice et Keypoints) */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-[#FCFCFA] p-4 text-xs dark:border-slate-700 dark:bg-slate-900/90 space-y-3">
                            <div className="rounded-lg bg-teal-50/70 p-3 border border-teal-100 dark:bg-teal-950/40 dark:border-teal-900/40">
                              <p className="font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5 mb-0.5">
                                <Lightbulb className="h-3.5 w-3.5 text-[#2A9D8F]" />
                                Conseil du coach en entretien :
                              </p>
                              <p className="text-[11px] text-teal-800 dark:text-teal-200 leading-relaxed">
                                {q.advice}
                              </p>
                            </div>

                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                                Points clés conseillés dans votre réponse :
                              </p>
                              <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 pl-2">
                                {q.suggestedAnswerKeypoints.map((kp, kIdx) => (
                                  <li key={kIdx} className="flex items-start gap-2">
                                    <span className="text-[#2A9D8F] font-bold">✓</span>
                                    <span>{kp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Mots-clés et Recommandations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 🔑 Mots-clés de l'offre */}
            <div className="rounded-2xl border border-[#E1ECEE] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#164E63] dark:text-white">
                🔑 Mots-clés de l'offre pour votre CV et Lettre de Motivation
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {analysisResult.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-lg bg-[#E6F0F2] border border-[#D5E3E7] px-2.5 py-1 text-xs font-semibold text-[#164E63] dark:bg-cyan-950/60 dark:border-cyan-950/60 dark:text-teal-300"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* 💡 Recommandations stratégiques */}
            <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-5 shadow-xs dark:border-teal-950/60 dark:bg-teal-950/20 space-y-3">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#164E63] dark:text-teal-300">
                <Lightbulb className="h-4 w-4 text-[#2A9D8F]" />
                <span>💡 Recommandations stratégiques</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {analysisResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#2A9D8F] font-bold">•</span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Existing "Enregistrer cette offre comme candidature" Action Button */}
          <div className="rounded-2xl border border-[#E1ECEE] bg-[#FCFCFA] p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-[#164E63] dark:text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#2A9D8F]" />
                <span>Poursuivre votre processus de recrutement</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pré-remplissez le formulaire de candidature existant dans Candidly avec les informations détectées dans l'offre.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateApplicationFromJob}
              className="flex items-center gap-2 rounded-xl bg-[#164E63] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#124552] transition-colors shrink-0"
            >
              <BookmarkPlus className="h-4 w-4 text-[#2A9D8F]" />
              <span>Enregistrer cette offre comme candidature</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
