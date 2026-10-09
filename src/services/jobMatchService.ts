import { AnalysisBreakdown, UserProfile } from '../types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isAnalysisBreakdown(value: unknown): value is AnalysisBreakdown {
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
    scores.every((score) => typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100) &&
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
        ['Haute', 'Moyenne', 'Essentielle'].includes(String(item.importance)) &&
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
        ['Manquante', 'Partielle', 'Exigence'].includes(String(item.statusType)) &&
        typeof item.explanation === 'string'
    )
  );
}

export async function analyzeJobOfferWithApi(
  jobText: string,
  userProfile: UserProfile
): Promise<AnalysisBreakdown> {
  let response: Response;
  try {
    response = await fetch('/api/job-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobText,
        profile: {
          education: userProfile.education,
          specialization: userProfile.specialization,
          skills: userProfile.skills,
          targetDomains: userProfile.targetDomains,
          targetContracts: userProfile.targetContracts,
          bio: userProfile.bio,
        },
      }),
    });
  } catch (error) {
    console.error('Job-match API request failed:', error);
    throw new Error("Impossible de joindre le serveur d'analyse. Vérifiez qu'il est démarré puis réessayez.");
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.error === 'string'
        ? data.error
        : `Le serveur d'analyse a répondu avec le statut ${response.status}.`;
    throw new Error(message);
  }

  if (!isAnalysisBreakdown(data)) {
    throw new Error("Le serveur d'analyse a renvoyé un résultat invalide.");
  }

  return data;
}
