import React, { useState } from 'react';
import { JobProvider } from './context/JobContext';
import { ResumeProvider } from './context/ResumeContext';
import { Dashboard } from './components/Dashboard';
import { JobTracker } from './components/JobTracker';
import { Offers } from './components/Offers';
import { ResumeBuilder } from './components/ResumeBuilder';
import { ClaireChat } from './components/ClaireChat';
import { AvatarBuilder } from './components/AvatarBuilder';
import { LayoutDashboard, Briefcase, Award, Settings, User, Menu, FileText, Bot, Camera } from 'lucide-react';
import { ViewState, UserProfile } from './types';
import { useJobContext } from './context/JobContext';
import { useResumeContext } from './context/ResumeContext';

// Sidebar Component
const Sidebar: React.FC<{ 
  currentView: ViewState; 
  setView: (v: ViewState) => void; 
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
}> = ({ currentView, setView, isMobileOpen, setIsMobileOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Applications', icon: Briefcase },
    { id: 'offers', label: 'Offers & Interview', icon: Award },
    { id: 'resume', label: 'Resume Builder', icon: FileText },
    { id: 'avatar-builder', label: 'AI Avatar Studio', icon: Camera },
    { id: 'claire', label: 'Claire AI', icon: Bot },
  ];

  const sidebarClass = `
    fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={sidebarClass}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">JobFlow</span>
          </div>

          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id as ViewState);
                    setIsMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                    ${isActive 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                  {item.id === 'claire' && (
                    <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-slate-800">
            <button 
               onClick={() => setView('settings')}
               className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${currentView === 'settings' ? 'bg-slate-800 text-white' : ''}`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
            <div className="flex items-center gap-3 mt-6 px-4 py-3 bg-slate-800/50 rounded-xl">
               <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">AD</div>
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-white truncate">Alex Developer</p>
                 <p className="text-xs text-slate-500 truncate">Free Plan</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Settings View Component
const SettingsView: React.FC = () => {
  const { userProfile, updateUserProfile } = useJobContext();
  const [localProfile, setLocalProfile] = useState<UserProfile>(userProfile);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateUserProfile(localProfile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your profile and AI preferences.</p>
      </header>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600" />
          Profile Information
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              value={localProfile.fullName}
              onChange={e => setLocalProfile({...localProfile, fullName: e.target.value})}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Skills & Expertise
              <span className="text-slate-400 font-normal ml-2">(Used for AI generation)</span>
            </label>
            <textarea 
              value={localProfile.skills}
              onChange={e => setLocalProfile({...localProfile, skills: e.target.value})}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none h-32"
              placeholder="e.g. React, Node.js, Project Management..."
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button 
            onClick={handleSave}
            className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-100 p-4 flex items-center justify-between">
           <div className="flex items-center gap-2 font-bold text-slate-900">
             <Briefcase className="w-6 h-6 text-emerald-600" />
             JobFlow
           </div>
           <button onClick={() => setIsMobileOpen(true)} className="text-slate-600">
             <Menu className="w-6 h-6" />
           </button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {view === 'dashboard' && <Dashboard />}
            {view === 'jobs' && <JobTracker />}
            {view === 'offers' && <Offers />}
            {view === 'resume' && <ResumeBuilder />}
            {view === 'avatar-builder' && <AvatarBuilder />}
            {view === 'claire' && <ClaireChat />}
            {view === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <JobProvider>
      <ResumeProvider>
        <MainContent />
      </ResumeProvider>
    </JobProvider>
  );
};

export default App;