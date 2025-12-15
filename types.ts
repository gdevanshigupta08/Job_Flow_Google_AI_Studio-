export type JobStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Accepted';

export interface Job {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  salary: string;
  location: string;
  dateApplied: string;
  description: string;
  coverLetter: string;
  interviewGuide?: string; // AI Generated guide
  origin: 'application' | 'offer';
}

export interface UserProfile {
  fullName: string;
  skills: string;
}

export type ViewState = 'dashboard' | 'jobs' | 'offers' | 'settings' | 'resume' | 'claire' | 'avatar-builder';

// Phase 2: Resume Types
export interface Section {
  id: string;
  title: string;
  content: string; // Description or bullet points
  date: string;
  subtitle?: string; // e.g. Company or School
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tech: string[];
}

export interface Resume {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Section[];
  education: Section[];
  projects: Project[];
  skills: string; // Comma separated for simplicity in UI, but could be array
  avatar: string; // Base64 or URL
}

// Phase 2: Chat Types
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}