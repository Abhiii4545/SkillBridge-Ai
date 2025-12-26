export interface Skill {
  name: string;
  category?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Remote' | 'On-site' | 'Hybrid';
  stipend: string;
  description: string;
  requiredSkills: string[];
  matchScore?: number; // Calculated by AI or simulated logic
  matchReason?: string;
  postedDate: string;
  logoUrl?: string;
  applicants?: number;
  status?: 'Active' | 'Closed' | 'Draft';
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'student' | 'recruiter';
  university?: string;
  skills: string[];
  missingSkills?: string[];
  summary?: string;
  experienceLevel?: string;
  resumeText?: string;
  // Recruiter Specific
  companyName?: string;
  companyWebsite?: string;
  companyDescription?: string;
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string; // email as ID for simplicity
  studentName: string;
  studentEmail: string;
  jobTitle: string;
  companyName: string;
  status: 'Pending' | 'Shortlisted' | 'Rejected' | 'Accepted';
  appliedDate: string;
  matchScore: number;
  resumeBase64?: string;
  resumeMimeType?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface LearningRoadmap {
  readinessScore: number;
  strongSkills: { skill: string; reason: string }[];
  skillsToImprove: { skill: string; reason: string }[];
  skillsToLearn: { skill: string; reason: string }[];
  roadmap: {
    month: string;
    skills: string[];
    tools: string[];
    task: string;
  }[];
  recommendedProjects: {
    name: string;
    skillsCovered: string[];
    reason: string;
  }[];
  profileSuggestions: string[];
  nextImmediateStep: string;
}

export type ViewState = 'landing' | 'login' | 'student-onboarding' | 'student-dashboard' | 'recruiter-dashboard';

export interface SectionProps {
  id: string;
  className?: string;
}

// --- Resume Builder Types ---

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  year: string;
  gpa: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  techStack: string[];
  description: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
  certifications: string[];
  summary: string;
}