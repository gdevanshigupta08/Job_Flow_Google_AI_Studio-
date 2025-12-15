import React, { useState } from 'react';
import { useJobContext } from '../context/JobContext';
import { Job, JobStatus } from '../types';
import { Plus, Search, Filter, MoreHorizontal, Sparkles, MapPin, DollarSign, Calendar } from 'lucide-react';
import { generateCoverLetter } from '../services/gemini';

const STATUS_COLORS: Record<JobStatus, string> = {
  Applied: 'bg-blue-100 text-blue-700',
  Interview: 'bg-amber-100 text-amber-700',
  Offer: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
  Accepted: 'bg-indigo-100 text-indigo-700'
};

export const JobTracker: React.FC = () => {
  const { jobs, addJob, updateJob, userProfile } = useJobContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Job>>({
    company: '', role: '', status: 'Applied', location: '', salary: '', description: '', coverLetter: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === 'All' || job.status === filterStatus;
    const matchesSearch = job.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenModal = (job?: Job) => {
    if (job) {
      setEditingId(job.id);
      setFormData(job);
    } else {
      setEditingId(null);
      setFormData({
        company: '', role: '', status: 'Applied', location: '', salary: '', description: '', coverLetter: '', origin: 'application'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.company || !formData.role) return;

    if (editingId) {
      updateJob(editingId, formData);
    } else {
      const newJob: Job = {
        id: crypto.randomUUID(),
        dateApplied: new Date().toISOString(),
        origin: 'application',
        ...formData as Job
      };
      addJob(newJob);
    }
    setIsModalOpen(false);
  };

  const handleGenerateCoverLetter = async () => {
    if (!formData.role || !formData.company) return;
    
    setIsGenerating(true);
    const letter = await generateCoverLetter(formData.role!, formData.company!, userProfile.skills);
    setFormData(prev => ({ ...prev, coverLetter: letter }));
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Applications</h1>
          <p className="text-slate-500 mt-1">Manage and track your job applications.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm shadow-emerald-200"
        >
          <Plus className="w-5 h-5" />
          Add Application
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search companies or roles..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 appearance-none cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Job List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
             <p className="text-slate-500">No applications found matching your criteria.</p>
           </div>
        ) : (
          filteredJobs.map(job => (
            <div key={job.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{job.role}</h3>
                      <p className="text-slate-600 font-medium">{job.company}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[job.status]}`}>
                      {job.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {job.location || 'Remote'}
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Applied {new Date(job.dateApplied).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 md:self-center pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                   <button 
                    onClick={() => handleOpenModal(job)}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                   >
                     <MoreHorizontal className="w-5 h-5" />
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Application' : 'New Application'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Company</label>
                  <input 
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                    placeholder="e.g. Google"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Role</label>
                  <input 
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    placeholder="e.g. Frontend Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select 
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as JobStatus})}
                  >
                    {Object.keys(STATUS_COLORS).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Salary</label>
                  <input 
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    value={formData.salary}
                    onChange={e => setFormData({...formData, salary: e.target.value})}
                    placeholder="e.g. $120k"
                  />
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700">Job Description / Notes</label>
                 <textarea 
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none min-h-[100px]"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Paste JD here..."
                 />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700">Cover Letter</label>
                  <button 
                    onClick={handleGenerateCoverLetter}
                    disabled={isGenerating || !formData.company || !formData.role}
                    className="text-xs flex items-center gap-1 text-emerald-600 font-medium hover:text-emerald-700 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
                <textarea 
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none min-h-[200px]"
                  value={formData.coverLetter}
                  onChange={e => setFormData({...formData, coverLetter: e.target.value})}
                  placeholder="Generated cover letter will appear here..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Save Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
