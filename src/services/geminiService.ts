import { GoogleGenAI } from '@google/genai';
import { UserProfile } from '../types';
import { AnalysisBreakdown } from '../utils/jobMatchEngine';

export interface GeneratedInterviewQuestion {
  id: string;
  question: string;
  category: 'Technique' | 'Mise en situation' | 'Comportementale' | 'Motivation';
  advice: string;
  suggestedAnswerKeypoints: string[];
}

/**
 * Gets the Gemini API key from environment variable or localStorage.
 */
export function getGeminiApiKey(): string {
  try {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim().length > 5) {
      return envKey.trim();
    }
  } catch (e) {
    // Ignore env error
  }
  try {
    const storedKey = localStorage.getItem('candidly_gemini_api_key');
    if (storedKey && storedKey.trim().length > 5) {
      return storedKey.trim();
    }
  } catch (e) {
    // Ignore localStorage error
  }
  return '';
}

/**
 * Saves user Gemini API key to localStorage.
 */
export function saveGeminiApiKey(key: string): void {
  try {
    localStorage.setItem('candidly_gemini_api_key', key.trim());
  } catch (e) {
    console.error(e);
  }
}

/**
 * Deterministic local fallback generator for interview questions across all domains.
 */
export function generateLocalInterviewQuestions(
  analysis: AnalysisBreakdown,
  userProfile: UserProfile
): GeneratedInterviewQuestion[] {
  const questions: GeneratedInterviewQuestion[] = [];
  const exact = analysis.exactMatches;
  const missing = analysis.missingSkills;
  const partial = analysis.partialMatches;
  const spec = userProfile.specialization || 'Candidat';

  // Question 1: Presentation & Motivation
  questions.push({
    id: 'q-1',
    question: `Pouvez-vous vous présenter et nous expliquer ce qui vous attire particulièrement dans ce poste chez ${
      analysis.detectedJob.company || "notre entreprise"
    } ?`,
    category: 'Motivation',
    advice: `Faites le lien entre votre formation (${userProfile.education || spec}) et les besoins exprimés dans l'offre.`,
    suggestedAnswerKeypoints: [
      `Mettre en avant votre parcours (${spec}).`,
      `Mentionner vos compétences clés : ${exact.slice(0, 2).join(', ') || 'vos expertises principales'}.`,
      `Exprimer votre intérêt réel pour la structure et la mission.`,
    ],
  });

  // Question 2: Top Technical Skill (Exact Match)
  if (exact.length > 0) {
    const topSkill = exact[0];
    questions.push({
      id: 'q-2',
      question: `L'offre exige une bonne maîtrise de ${topSkill}. Pouvez-vous nous décrire un projet marquant où vous avez utilisé cette compétence ?`,
      category: 'Technique',
      advice: `Appuyez-vous sur la méthode STAR (Situation, Tâche, Action, Résultat) pour structurer votre exemple.`,
      suggestedAnswerKeypoints: [
        `Cadrer le projet (contexte universitaire ou professionnel).`,
        `Détailler l'action concrète réalisée avec ${topSkill}.`,
        `Quantifier le résultat ou la valeur apportée.`,
      ],
    });
  }

  // Question 3: Partial Match / Adaptability
  if (partial.length > 0) {
    const p = partial[0];
    questions.push({
      id: 'q-3',
      question: `Sur votre profil, vous maîtrisez ${p.skill}, mais notre poste nécessite ${p.targetSkill}. Comment appréhendez-vous ce passage ?`,
      category: 'Mise en situation',
      advice: `Montrez que vous connaissez les bases communes et que vous êtes en mesure de monter en compétence très rapidement.`,
      suggestedAnswerKeypoints: [
        `Démontrer la proximité entre ${p.skill} et ${p.targetSkill}.`,
        `Donner un exemple où vous avez appris un nouvel outil rapidement.`,
        `Confirmer votre motivation à approfondir ${p.targetSkill}.`,
      ],
    });
  }

  // Question 4: Missing Skill / Behavioral
  if (missing.length > 0) {
    const m = missing[0].skill;
    questions.push({
      id: 'q-4',
      question: `Comment réagissez-vous si une mission nécessite l'utilisation immédiate d'un outil comme ${m} que vous n'avez pas pratiqué ?`,
      category: 'Comportementale',
      advice: `Valorisez votre autonomie, votre méthodologie de recherche et votre curiosité professionnelle.`,
      suggestedAnswerKeypoints: [
        `Consulter la documentation officielle et suivre un tutoriel accéléré.`,
        `Demander conseil aux collaborateurs experts de l'équipe.`,
        `Proposer une première version et solliciter un retour d'amélioration.`,
      ],
    });
  } else {
    questions.push({
      id: 'q-4-b',
      question: `Comment organisez-vous votre travail face à des priorités simultanées et des délais serrés ?`,
      category: 'Comportementale',
      advice: `Montrez votre rigueur d'organisation et votre communication avec l'équipe.`,
      suggestedAnswerKeypoints: [
        `Hiérarchiser les tâches selon l'urgence et l'impact.`,
        `Informer la hiérarchie en cas de blocage.`,
        `Utiliser des outils de suivi (Gantt, Kanban).`,
      ],
    });
  }

  // Question 5: Functional & Analytical
  questions.push({
    id: 'q-5',
    question: `Racontez-nous une situation où vous avez dû résoudre un problème complexe ou un imprévu dans un projet.`,
    category: 'Mise en situation',
    advice: `Faites preuve d'esprit d'analyse et de calme face à l'imprévu.`,
    suggestedAnswerKeypoints: [
      `Identifier la cause racine du problème.`,
      `Évaluer les alternatives de solution.`,
      `Communiquer la solution retenue et documenter pour l'avenir.`,
    ],
  });

  return questions;
}

/**
 * Generates tailor-made interview questions using Google Gemini API (@google/genai)
 * with automatic fallback to local deterministic generator if no API key or network failure.
 */
export async function generateGeminiInterviewQuestions(
  jobText: string,
  analysis: AnalysisBreakdown,
  userProfile: UserProfile
): Promise<{ questions: GeneratedInterviewQuestion[]; usedApi: boolean }> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    // Return local questions fallback
    return {
      questions: generateLocalInterviewQuestions(analysis, userProfile),
      usedApi: false,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Tu es un Recruteur Senior et Coach en Entretiens d'Embauche pour des candidats en ${
      userProfile.specialization || 'MIAGE / Gestion de Projets et IT'
    }.

OFFRE D'EMPLOI :
${jobText.substring(0, 1500)}

PROFIL DU CANDIDAT :
- Nom : ${userProfile.firstName} ${userProfile.lastName}
- Formation : ${userProfile.education || 'Master MIAGE'}
- Spécialisation : ${userProfile.specialization || 'Ingénierie de processus'}
- Compétences maîtrisées : ${userProfile.skills.join(', ')}
- Compétences en correspondance exacte : ${analysis.exactMatches.join(', ')}
- Compétences manquantes ou partielles : ${analysis.missingSkills.map((m) => m.skill).join(', ')}

TACHE :
Génère 5 questions d'entretien réelles et pertinentes que le recruteur va poser à ce candidat pour cette offre spécifique.

Formate impérativement la réponse en JSON strict sans aucun texte autour, sous la forme d'un tableau d'objets :
[
  {
    "id": "q-1",
    "question": "Texte exact de la question d'entretien",
    "category": "Technique" | "Mise en situation" | "Comportementale" | "Motivation",
    "advice": "Conseil de préparation pour le candidat",
    "suggestedAnswerKeypoints": ["Point clé 1 à aborder", "Point clé 2", "Point clé 3"]
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const responseText = response.text || '';
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedQuestions = JSON.parse(cleanJson);

    if (Array.isArray(parsedQuestions) && parsedQuestions.length >= 3) {
      return {
        questions: parsedQuestions.map((q, idx) => ({
          id: q.id || `q-gemini-${idx + 1}`,
          question: q.question || 'Question d\'entretien',
          category: q.category || 'Technique',
          advice: q.advice || 'Préparez votre réponse en vous basant sur vos projets.',
          suggestedAnswerKeypoints: q.suggestedAnswerKeypoints || ['Point 1', 'Point 2'],
        })),
        usedApi: true,
      };
    }
  } catch (error) {
    console.warn('Gemini API call failed or key invalid, falling back to local generator:', error);
  }

  // Fallback to local deterministic generator
  return {
    questions: generateLocalInterviewQuestions(analysis, userProfile),
    usedApi: false,
  };
}
