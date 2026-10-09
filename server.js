import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const requestWindows = new Map();

app.use(express.json({ limit: '100kb' }));

function isRateLimited(ip) {
  const now = Date.now();
  const windowStart = requestWindows.get(ip);
  if (!windowStart || now - windowStart.startedAt >= 60_000) {
    requestWindows.set(ip, { startedAt: now, count: 1 });
    return false;
  }

  windowStart.count += 1;
  return windowStart.count > 10;
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function getErrorStatus(error) {
  return isRecord(error) && typeof error.status === 'number' ? error.status : undefined;
}

function getErrorCode(error) {
  return isRecord(error) && typeof error.code === 'string' ? error.code : undefined;
}

function isAnalysisBreakdown(value) {
  if (!isRecord(value) || !isRecord(value.subScores) || !isRecord(value.detectedJob)) {
    return false;
  }

  const scores = [
    value.scoreGlobal,
    value.subScores.skillsScore,
    value.subScores.keywordsScore,
    value.subScores.profileDomainScore,
  ];
  const job = value.detectedJob;
  const jobStringFields = [
    'company',
    'jobTitle',
    'domain',
    'contractType',
    'location',
    'jobUrl',
    'experienceRequired',
  ];

  return (
    scores.every((score) => Number.isFinite(score) && score >= 0 && score <= 100) &&
    typeof value.labelScore === 'string' &&
    typeof value.summaryText === 'string' &&
    jobStringFields.every((field) => job[field] === undefined || typeof job[field] === 'string') &&
    isStringArray(job.tags) &&
    isStringArray(value.exactMatches) &&
    isStringArray(value.keywords) &&
    isStringArray(value.recommendations) &&
    Array.isArray(value.partialMatches) &&
    value.partialMatches.every(
      (item) =>
        isRecord(item) &&
        typeof item.skill === 'string' &&
        typeof item.targetSkill === 'string' &&
        typeof item.reason === 'string'
    ) &&
    Array.isArray(value.missingSkills) &&
    value.missingSkills.every(
      (item) =>
        isRecord(item) &&
        typeof item.skill === 'string' &&
        ['Haute', 'Moyenne', 'Essentielle'].includes(item.importance) &&
        typeof item.reason === 'string'
    ) &&
    Array.isArray(value.topStrengthsToHighlight) &&
    value.topStrengthsToHighlight.every(
      (item) => isRecord(item) && typeof item.title === 'string' && typeof item.description === 'string'
    ) &&
    Array.isArray(value.elementsToPrepare) &&
    value.elementsToPrepare.every(
      (item) =>
        isRecord(item) &&
        typeof item.item === 'string' &&
        ['Manquante', 'Partielle', 'Exigence'].includes(item.statusType) &&
        typeof item.explanation === 'string'
    )
  );
}

function isInterviewQuestions(value) {
  const categories = ['Technique', 'Mise en situation', 'Comportementale', 'Motivation'];
  return (
    Array.isArray(value) &&
    value.length >= 3 &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.question === 'string' &&
        item.question.trim().length > 0 &&
        categories.includes(item.category) &&
        typeof item.advice === 'string' &&
        item.advice.trim().length > 0 &&
        isStringArray(item.suggestedAnswerKeypoints) &&
        item.suggestedAnswerKeypoints.length > 0
    )
  );
}

async function generateWithFallback(ai, prompt) {
  const retryDelays = [700, 1500];
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastError;

  for (const model of models) {
    for (let attempt = 0; attempt <= retryDelays.length; attempt += 1) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        if (model !== models[0]) {
          console.info(`Gemini request completed with fallback model ${model}.`);
        }
        return response;
      } catch (error) {
        lastError = error;
        if (getErrorStatus(error) !== 503 || attempt === retryDelays.length) break;
        console.warn(`Gemini model ${model} temporarily unavailable; retrying (${attempt + 1}/${retryDelays.length})...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelays[attempt]));
      }
    }

    if (getErrorStatus(lastError) !== 503) throw lastError;
    console.warn(`Gemini model ${model} remains unavailable; trying the next model.`);
  }

  throw lastError || new Error('Gemini did not return a response after retrying.');
}

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("Ajoutez GEMINI_API_KEY=votre_clé dans .env (sans préfixe VITE_) puis redémarrez le serveur.");
    error.status = 503;
    error.code = 'MISSING_GEMINI_API_KEY';
    throw error;
  }
  return apiKey;
}

app.post('/api/job-match', async (req, res) => {
  if (isRateLimited(req.ip)) {
    return res.status(429).json({ error: 'Trop de demandes. Patientez une minute avant de réessayer.' });
  }

  const { jobText, profile } = req.body ?? {};
  if (typeof jobText !== 'string' || jobText.trim().length < 30 || jobText.length > 30000) {
    return res.status(400).json({ error: "L'offre doit contenir entre 30 et 30 000 caractères." });
  }

  if (
    !isRecord(profile) ||
    typeof profile.education !== 'string' ||
    typeof profile.specialization !== 'string' ||
    typeof profile.bio !== 'string' ||
    !isStringArray(profile.skills) ||
    !isStringArray(profile.targetDomains) ||
    !isStringArray(profile.targetContracts)
  ) {
    return res.status(400).json({ error: 'Les informations du profil sont incomplètes.' });
  }

  const prompt = `Analyse la compatibilité de l'offre et du profil candidat ci-dessous. Tu es spécialiste du recrutement tous métiers et secteurs confondus. Identifie les compétences et expériences réellement demandées ; ne traite pas les noms d'entreprise, les lieux, les intitulés de sections ou les qualités génériques comme des compétences techniques. Distingue correspondances exactes, compétences transférables (à justifier) et exigences absentes. N'invente aucune expérience ni compétence. Adapte toute l'analyse au domaine réel de l'offre et du candidat.

OFFRE :
<offre>
${jobText.trim()}
</offre>

PROFIL CANDIDAT :
<profil>
Formation : ${profile.education || 'Non renseignée'}
Spécialisation : ${profile.specialization || 'Non renseignée'}
Compétences : ${profile.skills.join(', ') || 'Non renseignées'}
Domaines recherchés : ${profile.targetDomains.join(', ') || 'Non renseignés'}
Contrats recherchés : ${profile.targetContracts.join(', ') || 'Non renseignés'}
Présentation : ${profile.bio || 'Non renseignée'}
</profil>

Retourne uniquement un JSON valide avec exactement les champs de cette structure :
{
  "scoreGlobal": 0,
  "labelScore": "Faible correspondance | Correspondance partielle | Bonne correspondance | Très bonne correspondance",
  "subScores": { "skillsScore": 0, "keywordsScore": 0, "profileDomainScore": 0 },
  "detectedJob": {
    "company": "",
    "jobTitle": "",
    "domain": "",
    "contractType": "",
    "location": "",
    "jobUrl": "",
    "tags": [],
    "experienceRequired": ""
  },
  "exactMatches": [],
  "partialMatches": [{ "skill": "", "targetSkill": "", "reason": "" }],
  "missingSkills": [{ "skill": "", "importance": "Haute", "reason": "" }],
  "keywords": [],
  "topStrengthsToHighlight": [{ "title": "", "description": "" }],
  "elementsToPrepare": [{ "item": "", "statusType": "Manquante", "explanation": "" }],
  "recommendations": [],
  "summaryText": ""
}
Les scores sont des nombres de 0 à 100. Score global = skillsScore * 0,5 + keywordsScore * 0,3 + profileDomainScore * 0,2. Utilise le libellé correspondant au score : 0-39 faible, 40-59 partielle, 60-79 bonne, 80-100 très bonne. Dans missingSkills.importance, utilise uniquement "Haute", "Moyenne" ou "Essentielle". Dans elementsToPrepare.statusType, utilise uniquement "Manquante", "Partielle" ou "Exigence". Les champs texte détectés mais absents doivent être des chaînes vides. Retourne des tableaux vides quand aucune donnée fiable n'est disponible. Les tags et mots-clés doivent être pertinents pour le poste, sans noms propres ni bruit.`;

  try {
    const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
    const response = await generateWithFallback(ai, prompt);

    const text = response.text?.trim();
    if (!text) {
      return res.status(502).json({ error: "Gemini n'a pas renvoyé d'analyse." });
    }

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: "Gemini a renvoyé une analyse JSON invalide." });
    }

    if (!isAnalysisBreakdown(analysis)) {
      return res.status(502).json({ error: "La réponse Gemini ne respecte pas le format d'analyse attendu." });
    }

    return res.json(analysis);
  } catch (error) {
    console.error('Gemini job match request failed:', error);
    if (getErrorCode(error) === 'MISSING_GEMINI_API_KEY') {
      return res.status(503).json({ error: error.message });
    }
    if (getErrorStatus(error) === 503) {
      return res.status(503).json({
        error: "Les modèles Gemini sont temporairement indisponibles. Réessayez dans quelques instants.",
      });
    }
    return res.status(502).json({ error: "L'analyse par Gemini a échoué. Vérifiez la configuration de l'API et réessayez." });
  }
});

app.post('/api/interview-questions', async (req, res) => {
  if (isRateLimited(req.ip)) {
    return res.status(429).json({ error: 'Trop de demandes. Patientez une minute avant de réessayer.' });
  }

  const { jobText, analysis, userProfile } = req.body ?? {};
  if (typeof jobText !== 'string' || jobText.trim().length < 30 || jobText.length > 30000) {
    return res.status(400).json({ error: "L'offre doit contenir entre 30 et 30 000 caractères." });
  }

  if (
    !isAnalysisBreakdown(analysis) ||
    !isRecord(userProfile) ||
    typeof userProfile.education !== 'string' ||
    typeof userProfile.specialization !== 'string' ||
    typeof userProfile.bio !== 'string' ||
    !isStringArray(userProfile.skills)
  ) {
    return res.status(400).json({ error: "L'analyse ou le profil candidat est incomplet." });
  }

  const prompt = `Tu es un recruteur expérimenté. Prépare 5 questions d'entretien concrètes, variées et réellement spécifiques à cette offre et à ce candidat. Les questions doivent porter sur les missions, outils, responsabilités et contexte métier explicitement présents dans l'offre. Évite absolument les questions génériques qui pourraient convenir à n'importe quel poste. Au moins 3 questions doivent citer ou explorer des éléments uniques de cette offre. Quand une compétence demandée manque au profil, transforme cela en question professionnelle et bienveillante sur l'apprentissage ou l'expérience transférable, sans prétendre que le candidat la maîtrise. Évite les noms, villes et titres de sections utilisés comme compétences. Pour chaque question, donne un conseil de réponse personnalisé au parcours du candidat et 2 à 4 points clés pertinents. Varie les catégories parmi Technique, Mise en situation, Comportementale et Motivation.

OFFRE :
<offre>
${jobText.trim()}
</offre>

ANALYSE DE COMPATIBILITÉ :
<analyse>
Intitulé : ${analysis.detectedJob.jobTitle || 'Non identifié'}
Domaine : ${analysis.detectedJob.domain || 'Non identifié'}
Correspondances : ${analysis.exactMatches.join(', ') || 'Aucune identifiée'}
Compétences transférables : ${analysis.partialMatches.map((item) => `${item.skill} vers ${item.targetSkill}`).join('; ') || 'Aucune identifiée'}
Compétences à renforcer : ${analysis.missingSkills.map((item) => item.skill).join(', ') || 'Aucune identifiée'}
</analyse>

PROFIL :
<profil>
Formation : ${userProfile.education || 'Non renseignée'}
Spécialisation : ${userProfile.specialization || 'Non renseignée'}
Compétences : ${userProfile.skills.join(', ') || 'Non renseignées'}
Présentation : ${userProfile.bio || 'Non renseignée'}
</profil>

Réponds uniquement avec un tableau JSON valide de 5 objets selon cette structure :
[
  {
    "question": "Question précise liée à une mission ou exigence de cette offre",
    "category": "Technique",
    "advice": "Conseil de préparation personnalisé",
    "suggestedAnswerKeypoints": ["Point clé lié à l'offre", "Exemple ou démarche à expliquer"]
  }
]
Les seules catégories autorisées sont "Technique", "Mise en situation", "Comportementale" et "Motivation". N'ajoute aucun texte autour du JSON.`;

  try {
    const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
    const response = await generateWithFallback(ai, prompt);
    const text = response.text?.trim();
    if (!text) {
      return res.status(502).json({ error: "Gemini n'a pas renvoyé de questions." });
    }

    let questions;
    try {
      questions = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: "Gemini a renvoyé des questions dans un format invalide." });
    }

    if (!isInterviewQuestions(questions)) {
      return res.status(502).json({ error: "Les questions générées ne respectent pas le format attendu." });
    }

    return res.json({
      questions: questions.map((question, index) => ({ ...question, id: `q-gemini-${index + 1}` })),
      usedApi: true,
    });
  } catch (error) {
    console.error('Gemini interview questions request failed:', error);
    if (getErrorCode(error) === 'MISSING_GEMINI_API_KEY') {
      return res.status(503).json({ error: error.message });
    }
    if (getErrorStatus(error) === 503) {
      return res.status(503).json({
        error: "Les modèles Gemini sont temporairement indisponibles. Réessayez dans quelques instants.",
      });
    }
    return res.status(502).json({ error: 'La génération des questions par Gemini a échoué.' });
  }
});

const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
const port = Number(process.env.PORT) || 3000;

if (isProduction) {
  const distDir = path.join(rootDir, 'dist');
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
} else {
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Candidly ${isProduction ? 'server' : 'dev server'} running at http://localhost:${port}`);
});
