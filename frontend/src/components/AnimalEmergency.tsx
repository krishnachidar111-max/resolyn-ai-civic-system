import { useState } from 'react';
import { HeartHandshake, MapPin, PawPrint, ShieldCheck, Upload } from 'lucide-react';
import type { Complaint, User } from '../types';
import { makeComplaintId } from '../lib/storage';
import { createComplaintApi, hasToken } from '../lib/api';

export default function AnimalEmergency({ user, onAdd }: { user: User; onAdd: (complaint: Complaint) => void }) {
  const [submitted, setSubmitted] = useState<string | null>(null);

  async function submitCase() {
    if (hasToken()) {
      try {
        const complaint = await createComplaintApi({
          title: 'Animal rescue emergency',
          description: 'Injured animal reported through dedicated animal emergency system.',
          type: 'Animal Emergency',
          city: user.city || 'Bhopal',
          pincode: user.pincode || '462001',
          address: 'Selected rescue location, India',
          lat: 23.2599,
          lng: 77.4126
        });
        onAdd(complaint);
        setSubmitted(complaint.id);
        return;
      } catch (error) {
        console.warn('Backend animal report failed, using local fallback:', error);
      }
    }
    const id = makeComplaintId();
    const now = new Date();
    onAdd({
      id,
      title: 'Animal rescue emergency',
      description: 'Injured animal reported through dedicated animal emergency system.',
      type: 'Animal Emergency',
      city: user.city || 'Bhopal',
      pincode: user.pincode || '462001',
      address: 'Selected rescue location, India',
      location: { lat: 23.2599, lng: 77.4126, address: 'Selected rescue location, India' },
      createdAt: now.toISOString(),
      citizenName: user.fullName,
      citizenEmail: user.email,
      category: 'Animal Emergency',
      department: 'Verified NGO Rescue Network',
      priority: 'Emergency',
      status: 'Assigned to Department',
      estimatedTime: 'Within 24 hours',
      aiConfidence: 96,
      duplicateRisk: 12,
      fraudRisk: 5,
      upvotes: 0,
      officerRemark: 'Nearest NGO rescue team has been notified.',
      timeline: [
        { label: 'Submitted', time: now.toLocaleString(), note: 'Animal emergency report submitted.' },
        { label: 'AI Analyzed', time: now.toLocaleString(), note: 'AI marked emergency rescue priority.' },
        { label: 'Assigned to Department', time: now.toLocaleString(), note: 'Verified NGO partner notified.' }
      ]
    });
    setSubmitted(id);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_.95fr]">
      <section className="panel p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-3xl bg-rose-300/15 p-4 text-rose-200"><PawPrint className="h-9 w-9" /></div>
          <div>
            <h2 className="text-3xl font-black">Animal Emergency System</h2>
            <p className="mt-2 text-slate-400">Injured animal reporting, NGO alerts and rescue coordination. This feature makes Resolyn unique and emotionally impactful.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <input className="input" placeholder="Animal type e.g. Dog, Cow, Cat" />
          <select className="input"><option className="bg-slate-900">Emergency Level: AI Auto Detect</option><option className="bg-slate-900">Injured</option><option className="bg-slate-900">Trapped</option><option className="bg-slate-900">Aggressive / Public Safety</option></select>
          <textarea className="input md:col-span-2 min-h-32" placeholder="Describe animal condition and surroundings" />
          <input className="input" placeholder="Location / landmark" />
          <label className="upload-box"><Upload className="h-5 w-5 text-rose-200" /> Upload animal photo<input type="file" className="hidden" /></label>
        </div>
        <button onClick={submitCase} className="mt-7 w-full rounded-2xl bg-gradient-to-r from-rose-300 to-orange-300 py-4 font-black text-slate-950 shadow-glow hover:scale-[1.01] transition">Report Animal Emergency</button>
        {submitted && <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-emerald-100">Case submitted successfully. Rescue ID: <b>{submitted}</b></div>}
      </section>

      <section className="space-y-6">
        <div className="panel p-6">
          <h3 className="text-2xl font-black"><HeartHandshake className="mr-2 inline h-6 w-6 text-rose-200" />Verified NGO Panel</h3>
          <div className="mt-5 space-y-4">
            {['Paws Care Foundation', 'City Animal Rescue', 'Street Life NGO'].map((ngo, index) => (
              <div key={ngo} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{ngo}</p>
                    <p className="text-sm text-slate-400">Transparency Score: {92 - index * 4}% • Response: {18 + index * 7} min</p>
                  </div>
                  <ShieldCheck className="h-6 w-6 text-emerald-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-6">
          <h3 className="text-xl font-bold"><MapPin className="mr-2 inline h-5 w-5 text-cyan-200" />Rescue Coordination</h3>
          <p className="mt-3 text-slate-400">NGO can accept rescue case, update status, add remarks and upload rescue proof. For hackathon demo this is represented as a realistic mock workflow.</p>
        </div>
      </section>
    </div>
  );
}
