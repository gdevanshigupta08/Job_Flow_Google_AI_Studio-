import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Job, UserProfile } from '../types';

interface JobContextType {
  jobs: Job[];
  userProfile: UserProfile;
  addJob: (job: Job) => void;
  updateJob: (id: string, updatedJob: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  updateUserProfile: (profile: UserProfile) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

const DEFAULT_JOBS: Job[] = [
  {
    id: '1',
    company: 'TechNova',
    role: 'Senior Frontend Engineer',
    status: 'Interview',
    salary: '$140k - $160k',
    location: 'Remote',
    dateApplied: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    description: 'We are looking for a React expert with Tailwind experience.',
    coverLetter: '',
    origin: 'application'
  },
  {
    id: '2',
    company: 'GreenStream',
    role: 'Full Stack Developer',
    status: 'Applied',
    salary: '$120k',
    location: 'Austin, TX',
    dateApplied: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    description: 'Build sustainable energy solutions.',
    coverLetter: '',
    origin: 'application'
  },
  {
    id: '3',
    company: 'Orbit AI',
    role: 'AI Interface Designer',
    status: 'Offer',
    salary: '$155k',
    location: 'San Francisco, CA',
    dateApplied: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    description: 'Design the future of AI interaction.',
    coverLetter: '',
    origin: 'offer'
  }
];

const DEFAULT_PROFILE: UserProfile = {
  fullName: 'Alex Developer',
  skills: 'React, TypeScript, Tailwind CSS, Node.js, UI/UX Design'
};

export const JobProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('jobflow_jobs');
    return saved ? JSON.parse(saved) : DEFAULT_JOBS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('jobflow_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem('jobflow_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('jobflow_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const addJob = (job: Job) => {
    setJobs(prev => [job, ...prev]);
  };

  const updateJob = (id: string, updatedJob: Partial<Job>) => {
    setJobs(prev => prev.map(job => job.id === id ? { ...job, ...updatedJob } : job));
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  return (
    <JobContext.Provider value={{ jobs, userProfile, addJob, updateJob, deleteJob, updateUserProfile }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobContext must be used within a JobProvider');
  }
  return context;
};
