import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Resume, Section, Project } from '../types';

interface ResumeContextType {
  resume: Resume;
  updateResume: (updates: Partial<Resume>) => void;
  updateSection: (section: 'experience' | 'education', id: string, data: Partial<Section>) => void;
  addSection: (section: 'experience' | 'education') => void;
  removeSection: (section: 'experience' | 'education', id: string) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  addProject: () => void;
  removeProject: (id: string) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

const DEFAULT_RESUME: Resume = {
  fullName: 'Alex Developer',
  title: 'Senior Frontend Engineer',
  email: 'alex.dev@example.com',
  phone: '(555) 123-4567',
  location: 'San Francisco, CA',
  summary: 'Passionate Frontend Engineer with 5+ years of experience building responsive, accessible, and performant web applications using React, TypeScript, and modern UI frameworks.',
  avatar: '',
  skills: 'React, TypeScript, Tailwind CSS, Node.js, Next.js, GraphQL, AWS, UI/UX Design',
  experience: [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      subtitle: 'TechNova Inc.',
      date: '2021 - Present',
      content: '• Led the migration of a legacy jQuery app to React 18, improving load time by 40%.\n• Mentored 3 junior developers and established code review standards.\n• Implemented a design system used across 4 internal products.'
    }
  ],
  education: [
    {
      id: '1',
      title: 'BS Computer Science',
      subtitle: 'University of Technology',
      date: '2016 - 2020',
      content: 'Graduated Cum Laude. President of the Web Development Club.'
    }
  ],
  projects: []
};

export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [resume, setResume] = useState<Resume>(() => {
    const saved = localStorage.getItem('jobflow_resume');
    return saved ? JSON.parse(saved) : DEFAULT_RESUME;
  });

  useEffect(() => {
    localStorage.setItem('jobflow_resume', JSON.stringify(resume));
  }, [resume]);

  const updateResume = (updates: Partial<Resume>) => {
    setResume(prev => ({ ...prev, ...updates }));
  };

  const updateSection = (sectionType: 'experience' | 'education', id: string, data: Partial<Section>) => {
    setResume(prev => ({
      ...prev,
      [sectionType]: prev[sectionType].map(item => item.id === id ? { ...item, ...data } : item)
    }));
  };

  const addSection = (sectionType: 'experience' | 'education') => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      title: 'New Role',
      subtitle: 'Company/School',
      date: 'Date Range',
      content: 'Description...'
    };
    setResume(prev => ({
      ...prev,
      [sectionType]: [...prev[sectionType], newSection]
    }));
  };

  const removeSection = (sectionType: 'experience' | 'education', id: string) => {
    setResume(prev => ({
      ...prev,
      [sectionType]: prev[sectionType].filter(item => item.id !== id)
    }));
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.map(item => item.id === id ? { ...item, ...data } : item)
    }));
  };

  const addProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: 'Project Name',
      description: 'Description...',
      tech: ['React']
    };
    setResume(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const removeProject = (id: string) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.filter(item => item.id !== id)
    }));
  };

  return (
    <ResumeContext.Provider value={{ 
      resume, updateResume, updateSection, addSection, removeSection, 
      updateProject, addProject, removeProject 
    }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResumeContext = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResumeContext must be used within a ResumeProvider');
  }
  return context;
};