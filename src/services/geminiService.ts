import { AnalysisBreakdown, UserProfile } from '../types';

export interface GeneratedInterviewQuestion {
  id: string;
  question: string;
  category: 'Technique' | 'Mise en situation' | 'Comportementale' | 'Motivation';
  advice: string;
  suggestedAnswerKeypoints: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isGeneratedQuestions(value: unknown): value is GeneratedInterviewQuestion[] {
  const categories = ['Technique', 'Mise en situation', 'Comportementale', 'Motivation'];
  return (
    Array.isArray(value) &&
    value.length >= 3 &&
    value.every(
      (question) =>
        isRecord(question) &&
        typeof question.id === 'string' &&
        typeof question.question === 'string' &&
        categories.includes(String(question.category)) &&
        typeof question.advice === 'string' &&
        Array.isArray(question.suggestedAnswerKeypoints) &&
        question.suggestedAnswerKeypoints.length > 0 &&
        question.suggestedAnswerKeypoints.every((point) => typeof point === 'string')
    )
  );
}

export async function generateGeminiInterviewQuestions(
  jobText: string,
  analysis: AnalysisBreakdown,
  userProfile: UserProfile
): Promise<GeneratedInterviewQuestion[]> {
  let response: Response;
  try {
    response = await fetch('/api/interview-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobText,
        analysis,
        userProfile: {
          education: userProfile.education,
          specialization: userProfile.specialization,
          skills: userProfile.skills,
          bio: userProfile.bio,
        },
      }),
    });
  } catch (error) {
    console.error('Interview questions API request failed:', error);
    throw new Error("Impossible de joindre le serveur pour générer les questions. Vérifiez qu'il est démarré puis réessayez.");
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.error === 'string'
        ? data.error
        : `Le serveur a répondu avec le statut ${response.status}.`;
    throw new Error(message);
  }

  if (!isRecord(data) || !isGeneratedQuestions(data.questions)) {
    throw new Error("Le serveur a renvoyé des questions dans un format invalide.");
  }

  return data.questions;
}
