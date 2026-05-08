import type { LucideIcon } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, tone = 'cyan', subtitle }: { title: string; value: string | number; icon: LucideIcon; tone?: 'cyan' | 'green' | 'yellow' | 'red' | 'violet'; subtitle?: string }) {
  const tones = {
    cyan: 'from-cyan-300/20 to-blue-500/10 text-cyan-200',
    green: 'from-emerald-300/20 to-green-500/10 text-emerald-200',
    yellow: 'from-yellow-300/20 to-orange-500/10 text-yellow-200',
    red: 'from-red-300/20 to-rose-500/10 text-red-200',
    violet: 'from-violet-300/20 to-purple-500/10 text-violet-200'
  };
  return (
    <div className={`rounded-[1.7rem] border border-white/10 bg-gradient-to-br ${tones[tone]} p-5 shadow-xl backdrop-blur-xl`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-300">{title}</p>
          <h3 className="mt-2 text-3xl font-black text-white">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
