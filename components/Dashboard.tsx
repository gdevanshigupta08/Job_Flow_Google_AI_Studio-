import React, { useMemo } from 'react';
import { useJobContext } from '../context/JobContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`p-4 rounded-xl ${colorClass}`}>
      {icon}
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { jobs } = useJobContext();

  const stats = useMemo(() => {
    return {
      total: jobs.length,
      applied: jobs.filter(j => j.status === 'Applied').length,
      interviewing: jobs.filter(j => j.status === 'Interview').length,
      offers: jobs.filter(j => j.status === 'Offer' || j.status === 'Accepted').length,
    };
  }, [jobs]);

  const chartData = useMemo(() => {
    const last30Days = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        applications: jobs.filter(j => j.dateApplied.startsWith(date)).length
      };
    });
  }, [jobs]);

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your job search progress.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Jobs" 
          value={stats.total} 
          icon={<Briefcase className="w-6 h-6 text-indigo-600" />} 
          colorClass="bg-indigo-50"
        />
        <StatCard 
          title="Applied" 
          value={stats.applied} 
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />} 
          colorClass="bg-blue-50"
        />
        <StatCard 
          title="Interviews" 
          value={stats.interviewing} 
          icon={<Clock className="w-6 h-6 text-amber-600" />} 
          colorClass="bg-amber-50"
        />
        <StatCard 
          title="Offers" 
          value={stats.offers} 
          icon={<CheckCircle className="w-6 h-6 text-emerald-600" />} 
          colorClass="bg-emerald-50"
        />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Application Activity (30 Days)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="applications" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorApps)" 
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
