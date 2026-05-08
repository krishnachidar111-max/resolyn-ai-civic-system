import { useState } from 'react';
import type React from 'react';
import { motion } from 'framer-motion';
import { Eye, LockKeyhole, Mail, MapPin, Phone, Shield, UserRound } from 'lucide-react';
import type { Role, User } from '../types';
import { saveUser } from '../lib/storage';
import { loginApi, registerApi } from '../lib/api';

interface AuthProps {
  onLogin: (user: User) => void;
}

const roles: Role[] = ['Citizen', 'Admin', 'Department Officer', 'NGO Partner'];

export default function Auth({ onLogin }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    city: '',
    state: 'Madhya Pradesh',
    pincode: '',
    role: 'Citizen' as Role
  });
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    try {
      let user: User;
      if (mode === 'login') {
        if (!form.email || !form.password) {
          setMessage('Email aur password enter karo. Demo admin: admin@resolyn.in / admin123');
          return;
        }
        user = await loginApi(form.email, form.password);
      } else {
        user = await registerApi({
          fullName: form.fullName || 'Resolyn User',
          email: form.email,
          mobile: form.mobile || '9999999999',
          password: form.password,
          city: form.city || 'Bhopal',
          state: form.state || 'Madhya Pradesh',
          pincode: form.pincode || '462001',
          role: form.role
        });
      }
      saveUser(user);
      onLogin(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Backend connect nahi ho paaya.';
      setMessage(`${message}  |  Backend run karo: cd backend && uvicorn app.main:app --reload`);
    }
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white relative overflow-hidden px-4 py-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,.2),transparent_32%)]" />
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_1.05fr]"
      >
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-10 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              <Shield className="h-4 w-4" /> AI Civic Intelligence
            </div>
            <h1 className="mt-8 text-4xl md:text-6xl font-black leading-tight">
              Welcome to <span className="text-cyan-300">Resolyn</span>
            </h1>
            <p className="mt-5 text-slate-300 text-lg leading-relaxed">
              Citizens complaints ko AI analyze karega, urgency detect karega, correct department assign karega aur transparent tracking provide karega.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {['JWT Auth', 'AI Routing', 'Live Map', 'Admin Analytics'].map((item) => (
              <div key={item} className="rounded-2xl bg-white/5 border border-white/10 p-4 text-slate-200">
                <div className="h-2 w-2 rounded-full bg-emerald-300 mb-3" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/10 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex rounded-2xl bg-black/30 p-1 mb-7">
            <button type="button" onClick={() => setMode('register')} className={`flex-1 rounded-xl py-3 font-semibold transition ${mode === 'register' ? 'bg-cyan-300 text-slate-950' : 'text-slate-300'}`}>Register</button>
            <button type="button" onClick={() => setMode('login')} className={`flex-1 rounded-xl py-3 font-semibold transition ${mode === 'login' ? 'bg-cyan-300 text-slate-950' : 'text-slate-300'}`}>Login</button>
          </div>

          <h2 className="text-3xl font-bold">{mode === 'register' ? 'Create your civic account' : 'Login to dashboard'}</h2>
          <p className="mt-2 text-slate-400">Demo admin: admin@resolyn.in / admin123 • Demo citizen: citizen@resolyn.in / citizen123</p>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {mode === 'register' && (
              <>
                <Field icon={<UserRound />} placeholder="Full Name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
                <Field icon={<Phone />} placeholder="Mobile Number" value={form.mobile} onChange={(v) => setForm({ ...form, mobile: v })} />
              </>
            )}
            <Field icon={<Mail />} placeholder="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field icon={<LockKeyhole />} placeholder="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
            {mode === 'register' && (
              <>
                <Field icon={<MapPin />} placeholder="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <Field icon={<MapPin />} placeholder="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} />
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="md:col-span-2 input">
                  {roles.map((role) => <option className="bg-slate-900" key={role}>{role}</option>)}
                </select>
              </>
            )}
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">
            <Eye className="h-4 w-4" /> Email verification & forgot password UI included for demo flow.
          </div>
          {message && <p className="mt-4 rounded-xl border border-red-300/20 bg-red-400/10 p-3 text-red-200">{message}</p>}
          <button className="mt-7 w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-emerald-300 py-4 font-bold text-slate-950 shadow-glow hover:scale-[1.01] transition">
            {mode === 'register' ? 'Register & Continue' : 'Login'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function Field({ icon, placeholder, value, onChange, type = 'text' }: { icon: React.ReactNode; placeholder: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="relative block">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <input className="input pl-12" type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
