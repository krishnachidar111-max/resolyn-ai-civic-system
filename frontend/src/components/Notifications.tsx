import { AlertTriangle, Bell, CheckCircle2, Info, Siren } from 'lucide-react';
import type { NotificationItem } from '../types';

export default function Notifications({ notifications }: { notifications: NotificationItem[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[.95fr_1.05fr]">
      <section className="panel p-6 md:p-8">
        <Bell className="h-10 w-10 text-cyan-200" />
        <h2 className="mt-4 text-3xl font-black">Smart Notifications</h2>
        <p className="mt-2 text-slate-400">Complaint updates, officer replies, escalation alerts, NGO rescue alerts and nearby emergency notifications.</p>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
          {['Complaint submitted', 'Status updated', 'Officer replied', 'Emergency escalation', 'NGO rescue alert', 'Nearby issue alert'].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300">{item}</div>
          ))}
        </div>
      </section>

      <section className="panel p-6 md:p-8">
        <h3 className="text-2xl font-black">Notification Feed</h3>
        <div className="mt-6 space-y-4">
          {notifications.map((item) => (
            <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconTone(item.type)}`}>{iconFor(item.type)}</div>
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="mt-1 text-slate-400">{item.message}</p>
                  <p className="mt-2 text-xs text-slate-500">{item.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function iconFor(type: NotificationItem['type']) {
  if (type === 'success') return <CheckCircle2 className="h-5 w-5" />;
  if (type === 'danger') return <Siren className="h-5 w-5" />;
  if (type === 'warning') return <AlertTriangle className="h-5 w-5" />;
  return <Info className="h-5 w-5" />;
}
function iconTone(type: NotificationItem['type']) {
  if (type === 'success') return 'bg-emerald-300/15 text-emerald-200';
  if (type === 'danger') return 'bg-red-300/15 text-red-200';
  if (type === 'warning') return 'bg-yellow-300/15 text-yellow-200';
  return 'bg-cyan-300/15 text-cyan-200';
}
