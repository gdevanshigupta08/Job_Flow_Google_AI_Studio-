import React, { useState, useRef } from 'react';
import { useResumeContext } from '../context/ResumeContext';
import { Section, Project, Resume } from '../types';
import { parseResumeImage, generateProfessionalHeadshot } from '../services/gemini';
import { 
  Upload, Sparkles, User, Trash2, Plus, GripVertical, FileText, 
  MapPin, Mail, Phone, Loader2, Camera, Download 
} from 'lucide-react';

const FormSection: React.FC<{
  title: string;
  items: Section[];
  onUpdate: (id: string, data: Partial<Section>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}> = ({ title, items, onUpdate, onAdd, onRemove }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <button onClick={onAdd} className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1">
        <Plus className="w-4 h-4" /> Add
      </button>
    </div>
    {items.map((item) => (
      <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 group">
        <div className="grid grid-cols-2 gap-3">
          <input 
            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
            placeholder="Title / Degree"
            value={item.title}
            onChange={(e) => onUpdate(item.id, { title: e.target.value })}
          />
          <input 
            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
            placeholder="Company / School"
            value={item.subtitle}
            onChange={(e) => onUpdate(item.id, { subtitle: e.target.value })}
          />
        </div>
        <input 
          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
          placeholder="Date Range"
          value={item.date}
          onChange={(e) => onUpdate(item.id, { date: e.target.value })}
        />
        <textarea 
          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm min-h-[80px]"
          placeholder="Description (Markdown supported)"
          value={item.content}
          onChange={(e) => onUpdate(item.id, { content: e.target.value })}
        />
        <div className="flex justify-end">
          <button onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-600 p-1">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    ))}
  </div>
);

export const ResumeBuilder: React.FC = () => {
  const { resume, updateResume, updateSection, addSection, removeSection } = useResumeContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Helper to read file as Base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const base64 = await readFileAsBase64(file);
      const parsedData = await parseResumeImage(base64);
      
      // Merge parsed data, generating IDs for arrays
      const newResume: Partial<Resume> = {
        ...parsedData,
        experience: parsedData.experience?.map(i => ({ ...i, id: crypto.randomUUID() })) || [],
        education: parsedData.education?.map(i => ({ ...i, id: crypto.randomUUID() })) || [],
        projects: parsedData.projects?.map(i => ({ ...i, id: crypto.randomUUID() })) || [],
      };
      
      updateResume(newResume);
    } catch (error) {
      alert("Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsGeneratingAvatar(true);
    try {
      // First show local preview
      const reader = new FileReader();
      reader.onload = (ev) => updateResume({ avatar: ev.target?.result as string });
      reader.readAsDataURL(file);

      // Then generate professional version
      const base64 = await readFileAsBase64(file);
      const generatedAvatarBase64 = await generateProfessionalHeadshot(base64);
      updateResume({ avatar: `data:image/jpeg;base64,${generatedAvatarBase64}` });
    } catch (error) {
      alert("Failed to generate avatar. Showing original image.");
    } finally {
      setIsGeneratingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col lg:flex-row gap-6">
      
      {/* LEFT COLUMN: EDITOR */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-8 pb-12">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm sticky top-0 z-10">
          <h2 className="font-bold text-slate-800 text-lg">Editor</h2>
          <div className="flex gap-2">
             <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleResumeUpload} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-100 transition-colors"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Import Resume
            </button>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="relative group shrink-0">
               <input 
                type="file" 
                ref={avatarInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
              />
              <div 
                onClick={() => avatarInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden cursor-pointer border-2 border-slate-200 hover:border-emerald-500 transition-colors relative"
              >
                {resume.avatar ? (
                  <img src={resume.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User className="w-10 h-10" />
                  </div>
                )}
                
                {isGeneratingAvatar && (
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                     <Loader2 className="w-8 h-8 text-white animate-spin" />
                   </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1.5 rounded-full shadow-md">
                 <Camera className="w-3 h-3" />
              </div>
              <p className="text-[10px] text-center mt-2 text-slate-500 font-medium">AI Enhanced</p>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                className="w-full p-2 border border-slate-200 rounded-lg"
                placeholder="Full Name"
                value={resume.fullName}
                onChange={e => updateResume({ fullName: e.target.value })}
              />
              <input 
                className="w-full p-2 border border-slate-200 rounded-lg"
                placeholder="Job Title"
                value={resume.title}
                onChange={e => updateResume({ title: e.target.value })}
              />
              <input 
                className="w-full p-2 border border-slate-200 rounded-lg"
                placeholder="Email"
                value={resume.email}
                onChange={e => updateResume({ email: e.target.value })}
              />
              <input 
                className="w-full p-2 border border-slate-200 rounded-lg"
                placeholder="Location"
                value={resume.location}
                onChange={e => updateResume({ location: e.target.value })}
              />
            </div>
          </div>
          <textarea 
             className="w-full p-3 border border-slate-200 rounded-lg min-h-[100px]"
             placeholder="Professional Summary"
             value={resume.summary}
             onChange={e => updateResume({ summary: e.target.value })}
          />
           <textarea 
             className="w-full p-3 border border-slate-200 rounded-lg min-h-[60px]"
             placeholder="Skills (comma separated)"
             value={resume.skills}
             onChange={e => updateResume({ skills: e.target.value })}
          />
        </div>

        {/* Dynamic Sections */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-8">
           <FormSection 
             title="Experience" 
             items={resume.experience} 
             onUpdate={(id, data) => updateSection('experience', id, data)} 
             onAdd={() => addSection('experience')}
             onRemove={(id) => removeSection('experience', id)}
           />
           <hr className="border-slate-100" />
           <FormSection 
             title="Education" 
             items={resume.education} 
             onUpdate={(id, data) => updateSection('education', id, data)} 
             onAdd={() => addSection('education')}
             onRemove={(id) => removeSection('education', id)}
           />
        </div>

      </div>

      {/* RIGHT COLUMN: PREVIEW */}
      <div className="flex-1 bg-slate-200 rounded-2xl p-6 overflow-hidden flex items-start justify-center shadow-inner">
        <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl p-[10mm] text-slate-800 text-sm leading-normal origin-top scale-[0.55] sm:scale-75 md:scale-90 lg:scale-[0.65] xl:scale-75 2xl:scale-90 transition-transform">
            {/* Resume Header */}
            <div className="flex gap-6 border-b-2 border-slate-800 pb-6 mb-6">
              {resume.avatar && (
                 <img src={resume.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-slate-100 shadow-sm" />
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-bold uppercase tracking-tight text-slate-900">{resume.fullName || 'Your Name'}</h1>
                <p className="text-xl text-emerald-600 font-medium mt-1">{resume.title || 'Professional Title'}</p>
                
                <div className="flex flex-wrap gap-4 mt-4 text-slate-500 text-xs">
                   {resume.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {resume.email}</div>}
                   {resume.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {resume.phone}</div>}
                   {resume.location && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {resume.location}</div>}
                </div>
              </div>
            </div>

            {/* Resume Content */}
            <div className="space-y-6">
               {/* Summary */}
               {resume.summary && (
                 <section>
                   <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 border-b border-slate-100 pb-1">Profile</h3>
                   <p className="text-slate-700 leading-relaxed">{resume.summary}</p>
                 </section>
               )}

               {/* Experience */}
               {resume.experience.length > 0 && (
                 <section>
                   <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-1">Experience</h3>
                   <div className="space-y-4">
                     {resume.experience.map(exp => (
                       <div key={exp.id}>
                         <div className="flex justify-between items-baseline">
                            <h4 className="font-bold text-slate-900 text-base">{exp.title}</h4>
                            <span className="text-slate-500 text-xs font-medium">{exp.date}</span>
                         </div>
                         <p className="text-emerald-700 font-medium text-xs mb-2">{exp.subtitle}</p>
                         <p className="text-slate-600 whitespace-pre-line">{exp.content}</p>
                       </div>
                     ))}
                   </div>
                 </section>
               )}

               {/* Education */}
               {resume.education.length > 0 && (
                 <section>
                   <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-1">Education</h3>
                   <div className="space-y-4">
                     {resume.education.map(edu => (
                       <div key={edu.id}>
                         <div className="flex justify-between items-baseline">
                            <h4 className="font-bold text-slate-900 text-base">{edu.subtitle}</h4>
                            <span className="text-slate-500 text-xs font-medium">{edu.date}</span>
                         </div>
                         <p className="text-emerald-700 font-medium text-xs mb-1">{edu.title}</p>
                         <p className="text-slate-600">{edu.content}</p>
                       </div>
                     ))}
                   </div>
                 </section>
               )}

               {/* Skills */}
               {resume.skills && (
                 <section>
                   <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-1">Skills</h3>
                   <div className="flex flex-wrap gap-2">
                     {resume.skills.split(',').map((skill, i) => (
                       <span key={i} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">
                         {skill.trim()}
                       </span>
                     ))}
                   </div>
                 </section>
               )}
            </div>
        </div>
      </div>

    </div>
  );
};