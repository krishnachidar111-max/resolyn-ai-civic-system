import { Bell, Bot, BrainCircuit, Building2, ChartNoAxesCombined, ClipboardList, Home, LogOut, MapPinned, MessageSquareText, PawPrint, Search, ShieldCheck, UserRound } from 'lucide-react';
import type { Role } from '../types';

export type PageKey = 'dashboard' | 'new-complaint' | 'track' | 'map' | 'animal' | 'ai-lab' | 'realtime' | 'admin' | 'notifications' | 'profile';

interface SidebarProps {
  active: PageKey;
  role: Role;
  onChange: (page: PageKey) => void;
  onLogout: () => void;
}

const citizenItems = [
  { key: 'dashboard', label: 'Dashboard', icon: Home },
  { key: 'new-complaint', label: 'New Complaint', icon: ClipboardList },
  { key: 'track', label: 'Track Complaint', icon: Search },
  { key: 'map', label: 'Live Civic Map', icon: MapPinned },
  { key: 'animal', label: 'Animal Emergency', icon: PawPrint },
  { key: 'ai-lab', label: 'Phase-3 AI Lab', icon: BrainCircuit },
  { key: 'realtime', label: 'Real-Time Hub', icon: MessageSquareText },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'profile', label: 'Profile', icon: UserRound }
] as const;

const adminItems = [
  { key: 'dashboard', label: 'Overview', icon: ChartNoAxesCombined },
  { key: 'admin', label: 'Admin Control', icon: Building2 },
  { key: 'map', label: 'Civic Map', icon: MapPinned },
  { key: 'animal', label: 'NGO / Animal Cases', icon: PawPrint },
  { key: 'ai-lab', label: 'AI Engine Lab', icon: BrainCircuit },
  { key: 'realtime', label: 'Ops & Escalation', icon: MessageSquareText },
  { key: 'notifications', label: 'Alerts', icon: Bell },
  { key: 'profile', label: 'Profile', icon: UserRound }
] as const;

export default function Sidebar({ active, role, onChange, onLogout }: SidebarProps) {
  const items = role === 'Admin' ? adminItems : citizenItems;
  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-white/10 bg-[#050816]/90 p-5 backdrop-blur-2xl lg:block">
      <div className="flex items-center gap-3 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Resolyn</h1>
          <p className="text-xs text-cyan-100">Smart Civic AI</p>
        </div>
      </div>

      <nav className="mt-8 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const selected = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${selected ? 'bg-white text-slate-950 shadow-glow' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button onClick={onLogout} className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-red-100 hover:bg-red-400/20 transition">
        <LogOut className="h-5 w-5" /> Logout
      </button>
    </aside>
  );
}

export function MobileNav({ active, role, onChange }: Omit<SidebarProps, 'onLogout'>) {
  const items = role === 'Admin' ? adminItems.slice(0, 5) : citizenItems.slice(0, 5);
  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 grid grid-cols-5 gap-2 rounded-3xl border border-white/10 bg-[#050816]/95 p-2 backdrop-blur-xl lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const selected = active === item.key;
        return (
          <button key={item.key} onClick={() => onChange(item.key)} className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] ${selected ? 'bg-cyan-300 text-slate-950' : 'text-slate-300'}`}>
            <Icon className="h-5 w-5" />
            <span>{item.label.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
}
