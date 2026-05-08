import { AlertTriangle, CheckCircle2, Clock3, ClipboardList, MapPinned, PawPrint } from 'lucide-react';
import type React from 'react';
import type { Complaint, User } from '../types';
import StatCard from './StatCard';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DashboardProps {
  user: User;
  complaints: Complaint[];
  onNavigate: (page: 'new-complaint' | 'track' | 'map' | 'animal') => void;
}

export default function Dashboard({ user, complaints, onNavigate }: DashboardProps) {
  const citizenComplaints = user.role === 'Admin' ? complaints : complaints.filter((item) => item.citizenEmail === user.email || item.citizenEmail.includes('demo'));
  const pending = citizenComplaints.filter((c) => !['Resolved', 'Closed', 'Verified by Citizen'].includes(c.status)).length;
  const resolved = citizenComplaints.filter((c) => ['Resolved', 'Closed', 'Verified by Citizen'].includes(c.status)).length;
  const emergency = citizenComplaints.filter((c) => c.priority === 'Emergency').length;

  const categoryData = Object.entries(
    complaints.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const statusData = Object.entries(
    complaints.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-7">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Complaints" value={citizenComplaints.length} icon={ClipboardList} tone="cyan" subtitle="All civic reports" />
        <StatCard title="Pending / Active" value={pending} icon={Clock3} tone="yellow" subtitle="Needs action" />
        <StatCard title="Resolved" value={resolved} icon={CheckCircle2} tone="green" subtitle="Verified workflow" />
        <StatCard title="Emergency" value={emergency} icon={AlertTriangle} tone="red" subtitle="High priority alerts" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="panel p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-bold">AI Civic Overview</h3>
              <p className="text-slate-400">Department-wise smart complaint intelligence</p>
            </div>
            <button onClick={() => onNavigate('new-complaint')} className="btn-primary">New Complaint</button>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16, color: '#fff' }} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#67e8f9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-6">
          <h3 className="text-2xl font-bold">Status Distribution</h3>
          <p className="text-slate-400">Live resolution pipeline</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={5}>
                  {statusData.map((_, index) => <Cell key={index} fill={['#67e8f9', '#34d399', '#fbbf24', '#fb7185', '#a78bfa'][index % 5]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <ActionCard icon={<MapPinned />} title="Live Indian Civic Map" text="Nearby issues, severity markers and city heatmap." onClick={() => onNavigate('map')} />
        <ActionCard icon={<PawPrint />} title="Animal Emergency" text="Injured animal reporting with NGO rescue workflow." onClick={() => onNavigate('animal')} />
        <ActionCard icon={<AlertTriangle />} title="Complaint Tracking" text="Track status, timeline, department and officer remarks." onClick={() => onNavigate('track')} />
      </section>

      <section className="panel p-6">
        <h3 className="text-2xl font-bold">Recent Complaints</h3>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="py-3">ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {complaints.slice(0, 6).map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="py-4 font-semibold text-cyan-200">{item.id}</td>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td><span className={`badge ${priorityClass(item.priority)}`}>{item.priority}</span></td>
                  <td>{item.status}</td>
                  <td className="text-slate-400">{item.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ActionCard({ icon, title, text, onClick }: { icon: React.ReactNode; title: string; text: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="panel p-6 text-left transition hover:-translate-y-1 hover:border-cyan-300/40">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-200 [&>svg]:h-7 [&>svg]:w-7">{icon}</div>
      <h4 className="text-xl font-bold">{title}</h4>
      <p className="mt-2 text-slate-400">{text}</p>
    </button>
  );
}

function priorityClass(priority: string) {
  if (priority === 'Emergency') return 'badge-red';
  if (priority === 'High') return 'badge-orange';
  if (priority === 'Medium') return 'badge-yellow';
  return 'badge-green';
}
