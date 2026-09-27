import { UserProfile } from '../types';

export interface AnalysisBreakdown {
  scoreGlobal: number;
  labelScore: string;
  subScores: {
    skillsScore: number;
    keywordsScore: number;
    profileDomainScore: number;
  };
  detectedJob: {
    company?: string;
    jobTitle?: string;
    domain?: string;
    contractType?: string;
    location?: string;
    jobUrl?: string;
    tags: string[];
    experienceRequired?: string;
  };
  exactMatches: string[];
  partialMatches: {
    skill: string;
    targetSkill: string;
    reason: string;
  }[];
  missingSkills: {
    skill: string;
    importance: 'Haute' | 'Moyenne' | 'Essentielle';
    reason: string;
  }[];
  keywords: string[];
  topStrengthsToHighlight: {
    title: string;
    description: string;
  }[];
  elementsToPrepare: {
    item: string;
    statusType: 'Manquante' | 'Partielle' | 'Exigence';
    explanation: string;
  }[];
  recommendations: string[];
  summaryText: string;
}

// French and English Stopwords for text parsing
const STOP_WORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'd', 'en', 'pour', 'avec', 'dans', 'sur', 'par',
  'et', 'ou', 'au', 'aux', 'ce', 'cette', 'ces', 'est', 'sont', 'seront', 'avoir', 'etre', 'faire',
  'plus', 'moines', 'tres', 'tout', 'tous', 'toute', 'toutes', 'son', 'sa', 'ses', 'nos', 'vos', 'leur',
  'notre', 'votre', 'afin', 'dans', 'sous', 'vers', 'chez', 'ainsi', 'comme', 'qui', 'que', 'quoi', 'dont',
  'dans', 'lors', 'sans', 'avec', 'plusieurs', 'chaque', 'entre', 'autre', 'autres', 'meme', 'memes',
  'a', 'the', 'and', 'or', 'for', 'with', 'in', 'on', 'at', 'to', 'from', 'by', 'an', 'be', 'is', 'are',
]);

// Multi-domain Known Terms Dictionary (Comptabilité, Finance, RH, Marketing, Droit, Logistique, IT, etc.)
const MULTI_DOMAIN_DICTIONARY: { term: string; regex: RegExp; category: 'comptabilite' | 'finance' | 'rh' | 'marketing' | 'droit' | 'it' | 'outil' }[] = [
  // Comptabilité et Gestion
  { term: 'Comptabilité générale', regex: /\bcomptabilit[eé]\s+g[eé]n[eé]rale\b/i, category: 'comptabilite' },
  { term: 'Comptabilité analytique', regex: /\bcomptabilit[eé]\s+analytique\b/i, category: 'comptabilite' },
  { term: 'Bilan comptable', regex: /\bbilan\s+(?:comptable|annuel)\b/i, category: 'comptabilite' },
  { term: 'Compte de résultat', regex: /\bcompte\s+de\s+r[eé]sultat\b/i, category: 'comptabilite' },
  { term: 'Gestion de la paie', regex: /\b(?:gestion\s+de\s+la\s+paie|bulletin\s+de\s+paie|fiches\s+de\s+paie)\b/i, category: 'comptabilite' },
  { term: 'Audit financier', regex: /\baudit\s+financier\b/i, category: 'finance' },
  { term: 'Contrôle de gestion', regex: /\bcontr[oô]le\s+de\s+gestion\b/i, category: 'comptabilite' },
  { term: 'Sage 100', regex: /\bsage(?:\s*100|\s*co|\s*compta)?\b/i, category: 'outil' },
  { term: 'SAP FiCo', regex: /\bsap(?:\s*fico|\s*fi|\s*co)?\b/i, category: 'outil' },
  { term: 'Ciel Compta', regex: /\bciel\s*compta\b/i, category: 'outil' },
  { term: 'Excel avancé', regex: /\bexcel\s*(?:avanc[eé]|macro|vba)?\b/i, category: 'outil' },
  { term: 'TVA et Déclarations fiscales', regex: /\b(?:tva|déclaration\s+fiscale|liasse\s+fiscale)\b/i, category: 'comptabilite' },

  // Finance et Banque
  { term: 'Analyse financière', regex: /\banalyse\s+financi[eè]re\b/i, category: 'finance' },
  { term: 'Trésorerie', regex: /\btr[eé]sorerie\b/i, category: 'finance' },
  { term: 'Gestion du risque', regex: /\bgestion\s+du\s+risque\b/i, category: 'finance' },

  // Ressources Humaines
  { term: 'Recrutement', regex: /\brecrutement\b/i, category: 'rh' },
  { term: 'Gestion des compétences', regex: /\bgestion\s+des\s+comp[eé]tences\b/i, category: 'rh' },
  { term: 'Droit du travail', regex: /\bdroit\s+du\s+travail\b/i, category: 'droit' },
  { term: 'SIRH', regex: /\bsirh\b/i, category: 'rh' },

  // Marketing et Vente
  { term: 'Marketing digital', regex: /\bmarketing\s+digital\b/i, category: 'marketing' },
  { term: 'SEO / Référencement', regex: /\b(?:seo|référencement)\b/i, category: 'marketing' },
  { term: 'Gestion de la relation client', regex: /\b(?:crm|relation\s+client)\b/i, category: 'marketing' },
  { term: 'Salesforce', regex: /\bsalesforce\b/i, category: 'outil' },

  // IT et Data
  { term: 'SQL', regex: /\bsql\b/i, category: 'it' },
  { term: 'PostgreSQL', regex: /\bpostgre(?:sql)?\b/i, category: 'it' },
  { term: 'Java', regex: /\bjava\b(?!script)/i, category: 'it' }, // Strict Java
  { term: 'JavaScript', regex: /\b(?:javascript|js)\b/i, category: 'it' },
  { term: 'TypeScript', regex: /\b(?:typescript|ts)\b/i, category: 'it' },
  { term: 'React', regex: /\breact(?:\.js)?\b/i, category: 'it' },
  { term: 'Python', regex: /\bpython\b/i, category: 'it' },
  { term: 'Power BI', regex: /\bpower\s*bi\b/i, category: 'outil' },
  { term: 'Tableau', regex: /\btableau\b/i, category: 'outil' },
  { term: 'Docker', regex: /\bdocker\b/i, category: 'outil' },
  { term: 'Process Mining', regex: /\bprocess\s*mining\b/i, category: 'it' },
  { term: 'BPMN 2.0', regex: /\bbpmn(?:\s*2\.0)?\b/i, category: 'it' },
  { term: 'Business Intelligence', regex: /\b(?:business\s+intelligence|bi|décisionnel)\b/i, category: 'it' },
];

/**
 * Normalizes term string for comparison.
 */
function cleanTerm(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Checks if two skill strings share a partial or parent-child relationship across ANY domain.
 */
function checkUniversalSkillRelationship(candidateSkill: string, offerTerm: string): { isRelated: boolean; reason?: string } {
  const cClean = cleanTerm(candidateSkill);
  const oClean = cleanTerm(offerTerm);

  if (!cClean || !oClean) return { isRelated: false };

  // 1. Exact match after cleaning
  if (cClean === oClean) {
    return { isRelated: true, reason: 'Match exact' };
  }

  // 2. Substring or Parent-Child relationship (e.g. "comptabilite" <-> "comptabilite analytique")
  if (cClean.includes(oClean)) {
    return {
      isRelated: true,
      reason: `Votre compétence globale « ${candidateSkill} » couvre la demande spécifique « ${offerTerm} ».`,
    };
  }
  if (oClean.includes(cClean)) {
    return {
      isRelated: true,
      reason: `Votre expérience en « ${candidateSkill} » constitue un socle directement transférable vers « ${offerTerm} ».`,
    };
  }

  // 3. Significant word overlap (e.g. "audit financier" <-> "audit comptable")
  const cWords = cClean.split(/\s+/).filter((w) => w.length > 3 && !STOP_WORDS.has(w));
  const oWords = oClean.split(/\s+/).filter((w) => w.length > 3 && !STOP_WORDS.has(w));
  const commonWords = cWords.filter((w) => oWords.includes(w));

  if (commonWords.length > 0) {
    return {
      isRelated: true,
      reason: `Vos connaissances autour de « ${candidateSkill} » partagent le même domaine clé que « ${offerTerm} ».`,
    };
  }

  return { isRelated: false };
}

/**
 * Universal analysis function for ANY job offer text across ANY sector (Comptabilité, RH, Finance, Marketing, IT...).
 */
export function analyzeJobOffer(jobText: string, userProfile: UserProfile): AnalysisBreakdown {
  const text = jobText.trim();
  const lowerText = text.toLowerCase();

  // 1. Extract offer terms (both from dictionary & dynamic n-grams)
  const detectedOfferTerms: string[] = [];

  // A. Check multi-domain dictionary
  MULTI_DOMAIN_DICTIONARY.forEach(({ term, regex }) => {
    if (regex.test(text)) {
      if (!detectedOfferTerms.includes(term)) {
        detectedOfferTerms.push(term);
      }
    }
  });

  // B. Dynamically extract user profile skills mentioned in offer text
  const candidateSkills = userProfile.skills || [];
  candidateSkills.forEach((cSkill) => {
    const cClean = cleanTerm(cSkill);
    if (cClean.length > 2) {
      // Build safe boundary pattern for skill
      const escaped = cSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const reg = new RegExp(`\\b${escaped}\\b`, 'i');
      if (reg.test(text) || cleanTerm(text).includes(cClean)) {
        if (!detectedOfferTerms.includes(cSkill)) {
          detectedOfferTerms.push(cSkill);
        }
      }
    }
  });

  // C. Dynamic Extraction of Capitalized N-grams / Technical words if list is small
  if (detectedOfferTerms.length < 3) {
    const words = text.split(/[\s,;:()\/\-\n\r]+/);
    words.forEach((w) => {
      const cleanW = w.trim();
      if (
        cleanW.length >= 4 &&
        !STOP_WORDS.has(cleanW.toLowerCase()) &&
        /^[A-Z][A-Za-z0-9+#\.]+$/.test(cleanW)
      ) {
        if (!detectedOfferTerms.includes(cleanW) && !['Offre', 'Profil', 'Missions', 'Poste', 'France'].includes(cleanW)) {
          detectedOfferTerms.push(cleanW);
        }
      }
    });
  }

  // Fallback terms if text is sparse
  if (detectedOfferTerms.length === 0) {
    if (lowerText.includes('compta')) detectedOfferTerms.push('Comptabilité générale');
    else if (lowerText.includes('paie')) detectedOfferTerms.push('Gestion de la paie');
    else if (lowerText.includes('droit')) detectedOfferTerms.push('Droit du travail');
    else if (lowerText.includes('projet')) detectedOfferTerms.push('Gestion de projet');
    else detectedOfferTerms.push('Analyse et Gestion');
  }

  // 2. Universal Matching Engine: Compare Candidate Skills with Offer Terms
  const exactMatches: string[] = [];
  const partialMatches: { skill: string; targetSkill: string; reason: string }[] = [];
  const missingSkills: { skill: string; importance: 'Haute' | 'Moyenne' | 'Essentielle'; reason: string }[] = [];

  detectedOfferTerms.forEach((offerSkill) => {
    // Exact candidate match check
    const exactFound = candidateSkills.find((cSkill) => {
      const cClean = cleanTerm(cSkill);
      const oClean = cleanTerm(offerSkill);
      return cClean === oClean;
    });

    if (exactFound) {
      if (!exactMatches.includes(offerSkill)) {
        exactMatches.push(offerSkill);
      }
      return;
    }

    // Partial relationship check across all candidate skills
    let partialFound = false;
    for (const cSkill of candidateSkills) {
      const rel = checkUniversalSkillRelationship(cSkill, offerSkill);
      if (rel.isRelated && rel.reason) {
        partialMatches.push({
          skill: cSkill,
          targetSkill: offerSkill,
          reason: rel.reason,
        });
        partialFound = true;
        break;
      }
    }

    if (!partialFound) {
      missingSkills.push({
        skill: offerSkill,
        importance: 'Moyenne',
        reason: `Compétence ou outil demandé dans l'offre mais absent de vos compétences enregistrées.`,
      });
    }
  });

  // 3. Universal Scoring Calculation (0 - 100 %)
  const totalRequired = detectedOfferTerms.length || 1;
  const rawSkillsRatio = (exactMatches.length * 1.0 + partialMatches.length * 0.5) / totalRequired;
  const skillsScore = Math.max(25, Math.min(100, Math.round(rawSkillsRatio * 100)));

  // Sub-score 2: Keywords Match (30%)
  const keywordsScore = Math.max(
    30,
    Math.min(100, Math.round(((exactMatches.length + partialMatches.length + 1) / (totalRequired + 1)) * 100))
  );

  // Sub-score 3: Profile et Sector Alignment (20%)
  const profileDomainScore = candidateSkills.length > 0 ? Math.min(95, 70 + exactMatches.length * 5) : 65;

  // Global Score (Weighted 50% Skills / 30% Keywords / 20% Profile)
  const scoreGlobal = Math.min(
    95,
    Math.max(35, Math.round(skillsScore * 0.5 + keywordsScore * 0.3 + profileDomainScore * 0.2))
  );

  let labelScore = 'Bonne correspondance';
  if (scoreGlobal < 40) labelScore = 'Faible correspondance';
  else if (scoreGlobal < 60) labelScore = 'Correspondance partielle';
  else if (scoreGlobal >= 80) labelScore = 'Très bonne correspondance';

  // 4. "À mettre en avant dans votre candidature"
  const topStrengthsToHighlight: { title: string; description: string }[] = [];
  exactMatches.slice(0, 4).forEach((skill) => {
    topStrengthsToHighlight.push({
      title: skill,
      description: `Compétence parfaitement alignée avec l'offre. À placer en priorité en haut de votre CV et à illustrer par des exemples concrets.`,
    });
  });
  if (topStrengthsToHighlight.length < 3) {
    if (userProfile.specialization) {
      topStrengthsToHighlight.push({
        title: userProfile.specialization,
        description: `Spécialisation et domaine d'expertise valorisables pour cette candidature.`,
      });
    }
    if (userProfile.education) {
      topStrengthsToHighlight.push({
        title: userProfile.education,
        description: `Formation académique pertinente apportant la méthodologie et le cadre professionnel nécessaires.`,
      });
    }
  }

  // 5. "À préparer avant de postuler"
  const elementsToPrepare: { item: string; statusType: 'Manquante' | 'Partielle' | 'Exigence'; explanation: string }[] = [];
  partialMatches.forEach((p) => {
    elementsToPrepare.push({
      item: p.targetSkill,
      statusType: 'Partielle',
      explanation: `${p.reason} Mettez en avant votre maîtrise de ${p.skill} pour prouver votre adaptabilité rapide.`,
    });
  });
  missingSkills.slice(0, 3).forEach((m) => {
    elementsToPrepare.push({
      item: m.skill,
      statusType: 'Manquante',
      explanation: `Élément mentionné dans l'offre mais absent de votre profil. Préparez des exemples théoriques ou votre capacité d'auto-formation.`,
    });
  });
  if (lowerText.includes('anglais') || lowerText.includes('english')) {
    elementsToPrepare.push({
      item: 'Anglais professionnel',
      statusType: 'Exigence',
      explanation: `Exigence linguistique identifiée. Entraînez-vous à présenter votre parcours et vos réussites en anglais.`,
    });
  }

  // 6. Strategic Recommendations
  const recommendations: string[] = [
    `Structurez votre CV en mettant en évidence vos acquis majeurs (${exactMatches.slice(0, 3).join(', ') || 'expertises clés'}).`,
    `Personnalisez votre lettre de motivation en reliant vos réalisations passées aux besoins exprimés dans l'offre.`,
  ];
  if (partialMatches.length > 0) {
    recommendations.push(
      `Pour ${partialMatches[0].targetSkill}, faites le pont lors de l'entretien avec votre expérience en ${partialMatches[0].skill}.`
    );
  }
  if (missingSkills.length > 0) {
    recommendations.push(
      `Consultez une documentation ou un aperçu récent sur ${missingSkills[0].skill} afin d'aborder la question en entretien avec assurance.`
    );
  }

  // 7. Extract Application Fields for Pre-filling
  let company: string | undefined = undefined;
  let jobTitle: string | undefined = undefined;
  let domain: string = userProfile.targetDomains?.[0] || 'Comptabilité / Gestion';
  let contractType: string = 'CDI';
  let location: string = userProfile.city || 'France';
  let jobUrl: string | undefined = undefined;

  // Extract Company heuristics
  const companyMatch = text.match(/(?:chez|groupe|entreprise|société)\s+([A-Z][A-Za-z0-9\s]{2,25})/i);
  if (companyMatch) {
    company = companyMatch[1].trim();
  }

  // Extract Job Title heuristics
  const titleLine = text.split('\n')[0] || '';
  if (titleLine.length > 4 && titleLine.length < 80) {
    jobTitle = titleLine.replace(/^Offre\s*:\s*/i, '').trim();
  } else {
    jobTitle = 'Poste Analysé (AI Job Match)';
  }

  // Extract Contract Type
  if (lowerText.includes('stage')) contractType = 'Stage';
  else if (lowerText.includes('alternance') || lowerText.includes('apprentissage')) contractType = 'Alternance';
  else if (lowerText.includes('cdi')) contractType = 'CDI';
  else if (lowerText.includes('cdd')) contractType = 'CDD';

  // Extract Location
  if (lowerText.includes('paris')) location = 'Paris';
  else if (lowerText.includes('toulouse')) location = 'Toulouse';
  else if (lowerText.includes('lyon')) location = 'Lyon';
  else if (lowerText.includes('bordeaux')) location = 'Bordeaux';
  else if (lowerText.includes('nantes')) location = 'Nantes';
  else if (lowerText.includes('télétravail') || lowerText.includes('remote')) location = 'Télétravail';

  // Extract Job URL
  const urlMatch = text.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) {
    jobUrl = urlMatch[0];
  }

  const experienceRequired = lowerText.includes('junior') || lowerText.includes('débutant') || lowerText.includes('stage')
    ? '0 à 2 ans (Profil Junior / Débutant accepté)'
    : '1 à 5 ans d\'expérience';

  const summaryText = `Cette opportunité présente un taux d'adéquation de ${scoreGlobal}% avec votre profil. Vos compétences en ${exactMatches.slice(0, 3).join(', ') || 'votre domaine d\'expertise'} constituent des atouts directement valorisables.`;

  return {
    scoreGlobal,
    labelScore,
    subScores: {
      skillsScore,
      keywordsScore,
      profileDomainScore,
    },
    detectedJob: {
      company,
      jobTitle,
      domain,
      contractType,
      location,
      jobUrl,
      tags: detectedOfferTerms,
      experienceRequired,
    },
    exactMatches,
    partialMatches,
    missingSkills,
    keywords: detectedOfferTerms,
    topStrengthsToHighlight,
    elementsToPrepare,
    recommendations,
    summaryText,
  };
}
