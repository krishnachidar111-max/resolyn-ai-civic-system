import { Building2, Mail, MapPin, Phone, ShieldCheck, UserRound } from 'lucide-react';
import type React from 'react';
import type { User } from '../types';

export default function Profile({ user }: { user: User }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
      <section className="panel p-8 text-center">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-cyan-300 to-emerald-300 text-slate-950 shadow-glow">
          <UserRound className="h-14 w-14" />
        </div>
        <h2 className="mt-5 text-3xl font-black">{user.fullName}</h2>
        <p className="mt-2 text-cyan-200">{user.role}</p>
        <div className="mt-6 rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-emerald-100">
          <ShieldCheck className="mx-auto mb-2 h-6 w-6" /> Email Verified UI
        </div>
      </section>

      <section className="panel p-8">
        <h3 className="text-2xl font-black">Account Details</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Info icon={<Mail />} label="Email" value={user.email} />
          <Info icon={<Phone />} label="Mobile" value={user.mobile} />
          <Info icon={<Building2 />} label="City / State" value={`${user.city}, ${user.state}`} />
          <Info icon={<MapPin />} label="Pincode" value={user.pincode} />
        </div>
        <div className="mt-7 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h4 className="text-xl font-bold">Future Security Features</h4>
          <p className="mt-2 text-slate-400">Real backend me JWT authentication, role-based access, forgot password, email verification and audit logs connect honge.</p>
        </div>
      </section>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-cyan-200 [&>svg]:h-5 [&>svg]:w-5">{icon}</div><p className="mt-3 text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}
