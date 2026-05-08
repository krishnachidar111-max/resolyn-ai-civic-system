import { AlertOctagon, Building2, Clock, FileWarning, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import type React from 'react';
import type { Complaint } from '../types';
import StatCard from './StatCard';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AdminDashboard({ complaints, onStatusUpdate }: { complaints: Complaint[]; onStatusUpdate: (id: string, status: Complaint['status']) => void }) {
  const trend = [
    { day: 'Mon', complaints: 18, resolved: 9 },
    { day: 'Tue', complaints: 25, resolved: 16 },
    { day: 'Wed', complaints: 21, resolved: 14 },
    { day: 'Thu', complaints: 34, resolved: 19 },
    { day: 'Fri', complaints: 29, resolved: 22 },
    { day: 'Sat', complaints: 42, resolved: 27 },
    { day: 'Sun', complaints: 38, resolved: 31 }
  ];

  return (
    <div className="space-y-7">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Complaints" value={complaints.length} icon={Building2} tone="cyan" />
        <StatCard title="Emergency" value={complaints.filter((c) => c.priority === 'Emergency').length} icon={AlertOctagon} tone="red" />
        <StatCard title="Fraud Suspected" value={complaints.filter((c) => c.fraudRisk > 60).length} icon={FileWarning} tone="yellow" />
        <StatCard title="Avg Resolution" value="3.4d" icon={Clock} tone="green" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="panel p-6">
          <h2 className="text-2xl font-black">City Complaint Trend</h2>
          <p className="text-slate-400">Predictive governance analytics for smart city teams</p>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="complaints" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#67e8f9" stopOpacity={0.8}/><stop offset="95%" stopColor="#67e8f9" stopOpacity={0}/></linearGradient>
                  <linearGradient id="resolved" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/><stop offset="95%" stopColor="#34d399" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16, color: '#fff' }} />
                <Legend />
                <Area type="monotone" dataKey="complaints" stroke="#67e8f9" fillOpacity={1} fill="url(#complaints)" />
                <Area type="monotone" dataKey="resolved" stroke="#34d399" fillOpacity={1} fill="url(#resolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="text-2xl font-black">AI Control Layer</h2>
          <div className="mt-5 space-y-3">
            <AdminFeature title="Auto Department Routing" value="Active" />
            <AdminFeature title="Duplicate Detection" value="Embeddings Mock" />
            <AdminFeature title="Fraud Detection" value="Risk Scoring" />
            <AdminFeature title="Escalation Rule" value="7 Days → City Admin" />
            <AdminFeature title="Weather Priority" value="Rain alerts enabled" />
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black">Complaint Monitoring Table</h2>
            <p className="text-slate-400">Admin can update status, monitor AI output, escalation and fraud risk.</p>
          </div>
          <button className="btn-primary"><TrendingUp className="h-4 w-4" /> Export Report</button>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="py-3">Complaint</th>
                <th>Category</th>
                <th>Department</th>
                <th>Priority</th>
                <th>AI</th>
                <th>Duplicate</th>
                <th>Fraud</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="py-4"><p className="font-bold text-cyan-200">{item.id}</p><p>{item.title}</p></td>
                  <td>{item.category}</td>
                  <td className="text-slate-400">{item.department}</td>
                  <td><span className={`badge ${priorityClass(item.priority)}`}>{item.priority}</span></td>
                  <td>{item.aiConfidence}%</td>
                  <td>{item.duplicateRisk}%</td>
                  <td>{item.fraudRisk}%</td>
                  <td>{item.status}</td>
                  <td>
                    <select className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2" value={item.status} onChange={(e) => onStatusUpdate(item.id, e.target.value as Complaint['status'])}>
                      {['Submitted', 'AI Analyzed', 'Assigned to Department', 'In Progress', 'Resolved', 'Verified by Citizen', 'Closed'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <InfoBox icon={<Users />} title="Multi-City Support" text="City switching, state admin panel and city-specific analytics for scalability." />
        <InfoBox icon={<ShieldCheck />} title="Transparency" text="Before/after proof, public timeline, upvotes, department ratings and accountability." />
        <InfoBox icon={<FileWarning />} title="Public API" text="Future API endpoints for researchers, NGOs and smart city teams." />
      </section>
    </div>
  );
}

function AdminFeature({ title, value }: { title: string; value: string }) {
  return <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"><span className="text-slate-300">{title}</span><span className="font-bold text-cyan-200">{value}</span></div>;
}
function InfoBox({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="panel p-6"><div className="mb-4 text-cyan-200 [&>svg]:h-7 [&>svg]:w-7">{icon}</div><h3 className="text-xl font-bold">{title}</h3><p className="mt-2 text-slate-400">{text}</p></div>;
}
function priorityClass(priority: string) {
  if (priority === 'Emergency') return 'badge-red';
  if (priority === 'High') return 'badge-orange';
  if (priority === 'Medium') return 'badge-yellow';
  return 'badge-green';
}
