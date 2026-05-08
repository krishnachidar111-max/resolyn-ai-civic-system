import { Bell, Menu, Search, Sparkles } from 'lucide-react';
import type { User } from '../types';

export default function Topbar({ user }: { user: User }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050816]/80 px-4 py-4 backdrop-blur-xl md:px-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-cyan-200">
            <Sparkles className="h-4 w-4" /> Live AI Civic Command Center
          </div>
          <h2 className="mt-1 text-xl md:text-2xl font-bold">Hi, {user.fullName}</h2>
        </div>
        <div className="hidden md:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 w-80">
          <Search className="h-4 w-4 text-slate-400" />
          <input placeholder="Search complaint, ID, city..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500" />
        </div>
        <div className="flex items-center gap-3">
          <button className="relative rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-400" />
          </button>
          <button className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
