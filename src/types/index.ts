export type ApplicationStatus =
  | 'A_CONTACTER'
  | 'ENVOYEE'
  | 'EN_ATTENTE'
  | 'ENTRETIEN'
  | 'OFFRE_RECUE'
  | 'ACCEPTEE'
  | 'REFUSEE'
  | 'ABANDONNEE';

export type ContractType = 'Stage' | 'Alternance' | 'CDI' | 'CDD' | 'Autre';

export type Domain =
  | 'Data'
  | 'Business Intelligence'
  | 'Développement'
  | 'IA'
  | 'DevOps'
  | 'Consulting / AMOA'
  | 'Autre';

export interface Interview {
  id: string;
  applicationId: string;
  date: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  type: 'RH' | 'Technique' | 'Manager' | 'Final' | 'Fit';
  interviewer?: string;
  locationOrLink?: string;
  notes?: string;
  completed: boolean;
}

export interface TimelineEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  type: 'STATUS_CHANGE' | 'FOLLOW_UP' | 'INTERVIEW' | 'NOTE' | 'OFFER';
}

export interface JobApplication {
  id: string;
  company: string;
  jobTitle: string;
  contractType: ContractType;
  domain: Domain;
  location: string;
  applicationDate: string; // YYYY-MM-DD
  status: ApplicationStatus;
  jobUrl?: string;
  salaryGratification?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  nextFollowUpDate?: string; // YYYY-MM-DD
  interviewDate?: string; // YYYY-MM-DD
  notes?: string;
  resumeUsed?: string;
  coverLetterUsed?: string;
  logoBg?: string;
  logoLetter?: string;
  interviews?: Interview[];
  timeline?: TimelineEvent[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  education: string;
  specialization: string;
  skills: string[];
  targetDomains: (Domain | string)[];
  targetContracts: (ContractType | string)[];
  customContract?: string;
  primaryResume: string;
  primaryResumeDataUrl?: string;
  primaryResumeSize?: string;
  primaryResumeUpdatedAt?: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl?: string;
  bio: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export type ViewTab =
  | 'dashboard'
  | 'applications'
  | 'kanban'
  | 'calendar'
  | 'statistics'
  | 'profile'
  | 'ai-match'
  | 'spring-code';
