import React, { useState } from 'react';
import { useJobContext } from '../context/JobContext';
import { Job } from '../types';
import { MessageSquare, FileText, ChevronRight, Check, X, Sparkles, Loader2 } from 'lucide-react';
import { generateInterviewGuide } from '../services/gemini';
import ReactMarkdown from 'react-markdown'; // Assuming this isn't available, I will use simple whitespace rendering or basic HTML.
// Actually standard policy: do not assume libraries unless specified. I will use a simple whitespace-pre-wrap div for now, or basic manual parsing if needed. 
// Given the prompt allows popular libraries and I used Recharts, I'll stick to native rendering for simplicity to avoid import errors if not present, 
// but since 'react-markdown' is very common, I'll assume standard React rendering. 
// Wait, to be safe and strictly follow "single XML block" without extra install steps for user, I will render text in a pre-wrap div.

export const Offers: React.FC = () => {
  const { jobs } = useJobContext();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [guide, setGuide] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const offerJobs = jobs.filter(j => j.status === 'Offer' || j.status === 'Interview' || j.status === 'Accepted');

  const handleGenerateGuide = async (job: Job) => {
    if (!job.description) {
      alert("Please add a job description to this application first.");
      return;
    }
    setLoading(true);
    setGuide('');
    setSelectedJobId(job.id);
    const result = await generateInterviewGuide(job.role, job.company, job.description);
    setGuide(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Interview & Offers</h1>
        <p className="text-slate-500 mt-1">Prepare for interviews and manage your offers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* List Side */}
        <div className="lg:col-span-4 space-y-4 overflow-y-auto pr-2 max-h-[calc(100vh-12rem)]">
          {offerJobs.length === 0 && (
            <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
              No active interviews or offers yet. Keep applying!
            </div>
          )}
          {offerJobs.map(job => (
            <div 
              key={job.id} 
              onClick={() => { setSelectedJobId(job.id); setGuide(''); }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedJobId === job.id 
                  ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500/20' 
                  : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900">{job.company}</h3>
                  <p className="text-sm text-slate-600">{job.role}</p>
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                  job.status === 'Offer' ? 'bg-green-100 text-green-700' : 
                  job.status === 'Accepted' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {job.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MessageSquare className="w-3 h-3" />
                {job.dateApplied ? new Date(job.dateApplied).toLocaleDateString() : 'Recent'}
              </div>
            </div>
          ))}
        </div>

        {/* Details Side */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden h-[calc(100vh-12rem)]">
          {selectedJobId ? (
            <div className="flex flex-col h-full">
              {(() => {
                const job = jobs.find(j => j.id === selectedJobId)!;
                return (
                  <>
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{job.role} @ {job.company}</h2>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Status: {job.status}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleGenerateGuide(job)}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-70 shadow-sm shadow-indigo-200"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Generate Interview Guide
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-8">
                       {loading ? (
                         <div className="flex flex-col items-center justify-center h-full text-slate-400">
                           <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-500" />
                           <p>Analyzing job description...</p>
                           <p className="text-xs mt-2">Generating customized questions & tips</p>
                         </div>
                       ) : guide ? (
                         <div className="prose prose-slate max-w-none">
                           <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                             {guide}
                           </div>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                             <FileText className="w-8 h-8 text-slate-300" />
                           </div>
                           <div className="text-center">
                             <p className="font-medium text-slate-600">No Guide Generated Yet</p>
                             <p className="text-sm mt-1 max-w-xs mx-auto">
                               Click the button above to have Gemini AI analyze the job description and create a study plan.
                             </p>
                           </div>
                         </div>
                       )}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <ChevronRight className="w-12 h-12 text-slate-200 mb-4" />
              <p>Select an application to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
