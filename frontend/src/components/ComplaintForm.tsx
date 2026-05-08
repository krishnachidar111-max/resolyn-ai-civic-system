import { useMemo, useState } from 'react';
import type React from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, Clock, FileAudio, MapPin, Mic, Sparkles, Upload } from 'lucide-react';
import type { Complaint, User } from '../types';
import { analyzeComplaint } from '../lib/aiEngine';
import { makeComplaintId } from '../lib/storage';
import { createComplaintApi, hasToken } from '../lib/api';

const complaintTypes = ['Auto Detect', 'Road Damage', 'Water Supply', 'Electricity', 'Garbage/Sanitation', 'Drainage', 'Street Light', 'Public Safety', 'Animal Emergency', 'Social Help', 'Other'];
const demoLocations = [
  { label: 'Bhopal - MP Nagar', lat: 23.2599, lng: 77.4126, pincode: '462001' },
  { label: 'Indore - Rajwada', lat: 22.7196, lng: 75.8577, pincode: '452001' },
  { label: 'Delhi - Connaught Place', lat: 28.6139, lng: 77.209, pincode: '110001' },
  { label: 'Mumbai - Andheri', lat: 19.1197, lng: 72.8468, pincode: '400053' },
  { label: 'Bengaluru - MG Road', lat: 12.9716, lng: 77.5946, pincode: '560001' }
];

interface ComplaintFormProps {
  user: User;
  complaints: Complaint[];
  onAdd: (complaint: Complaint) => void;
}

export default function ComplaintForm({ user, complaints, onAdd }: ComplaintFormProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'Auto Detect',
    city: user.city || 'Bhopal',
    pincode: user.pincode || '462001',
    address: 'MP Nagar Zone 1, Bhopal',
    locationLabel: 'Bhopal - MP Nagar',
    imageName: '',
    voiceText: ''
  });
  const [submitted, setSubmitted] = useState<Complaint | null>(null);
  const selectedLocation = useMemo(() => demoLocations.find((item) => item.label === form.locationLabel) ?? demoLocations[0], [form.locationLabel]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hasToken()) {
      try {
        const complaint = await createComplaintApi({
          title: form.title || 'Untitled civic complaint',
          description: form.description || form.voiceText || 'Complaint description not provided.',
          type: form.type,
          city: form.city,
          pincode: form.pincode,
          address: form.address,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          imageName: form.imageName || undefined,
          voiceText: form.voiceText || undefined
        });
        onAdd(complaint);
        setSubmitted(complaint);
        return;
      } catch (error) {
        console.warn('Backend complaint submit failed, using local AI fallback:', error);
      }
    }
    const ai = analyzeComplaint({ title: form.title, description: form.description, selectedType: form.type, imageName: form.imageName, existingComplaints: complaints, locationText: form.address });
    const now = new Date();
    const complaint: Complaint = {
      id: makeComplaintId(),
      title: form.title || 'Untitled civic complaint',
      description: form.description || form.voiceText || 'Complaint description not provided.',
      type: form.type,
      city: form.city,
      pincode: form.pincode,
      address: form.address,
      location: { lat: selectedLocation.lat, lng: selectedLocation.lng, address: form.address },
      createdAt: now.toISOString(),
      citizenName: user.fullName,
      citizenEmail: user.email,
      category: ai.category,
      department: ai.department,
      priority: ai.priority,
      status: 'AI Analyzed',
      estimatedTime: ai.estimatedTime,
      aiConfidence: ai.aiConfidence,
      duplicateRisk: ai.duplicateRisk,
      fraudRisk: ai.fraudRisk,
      upvotes: Math.round(Math.random() * 12),
      imageName: form.imageName || undefined,
      voiceText: form.voiceText || undefined,
      officerRemark: 'Waiting for department acknowledgement.',
      timeline: [
        { label: 'Submitted', time: now.toLocaleString(), note: 'Complaint submitted successfully.' },
        { label: 'AI Analyzed', time: now.toLocaleString(), note: `AI detected ${ai.category}, ${ai.priority} priority and assigned ${ai.department}.` }
      ]
    };
    onAdd(complaint);
    setSubmitted(complaint);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
      <form onSubmit={handleSubmit} className="panel p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-300/15 p-3 text-cyan-200"><Sparkles className="h-6 w-6" /></div>
          <div>
            <h2 className="text-2xl font-black">AI Smart Complaint System</h2>
            <p className="text-slate-400">Text, image, voice, map location and AI auto-routing</p>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <input className="input md:col-span-2" placeholder="Complaint Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {complaintTypes.map((type) => <option className="bg-slate-900" key={type}>{type}</option>)}
          </select>
          <input className="input" value={new Date().toLocaleString()} readOnly />
          <textarea className="input md:col-span-2 min-h-36 resize-none" placeholder="Describe your issue. Example: Hamare area me road par bada pothole hai, accident ho sakta hai." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <select className="input" value={form.locationLabel} onChange={(e) => {
            const loc = demoLocations.find((item) => item.label === e.target.value)!;
            setForm({ ...form, locationLabel: loc.label, address: loc.label, city: loc.label.split(' - ')[0], pincode: loc.pincode });
          }}>
            {demoLocations.map((loc) => <option className="bg-slate-900" key={loc.label}>{loc.label}</option>)}
          </select>
          <input className="input" placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
          <input className="input md:col-span-2" placeholder="Place / address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

          <label className="upload-box">
            <Camera className="h-6 w-6 text-cyan-200" />
            <span>{form.imageName || 'Upload image proof'}</span>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => setForm({ ...form, imageName: e.target.files?.[0]?.name ?? '' })} />
          </label>
          <button type="button" className="upload-box" onClick={() => setForm({ ...form, voiceText: 'Voice mock: Mere area me kachra 5 din se nahi utha hai aur smell aa rahi hai.' })}>
            <Mic className="h-6 w-6 text-emerald-200" />
            <span>{form.voiceText ? 'Voice converted to text' : 'Record voice complaint'}</span>
          </button>
          {form.voiceText && <div className="md:col-span-2 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-emerald-100"><FileAudio className="mr-2 inline h-4 w-4" /> {form.voiceText}</div>}
        </div>

        <button className="mt-7 w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-emerald-300 py-4 font-black text-slate-950 shadow-glow hover:scale-[1.01] transition">
          Submit Complaint & Run AI Analysis
        </button>
      </form>

      <div className="space-y-6">
        <div className="panel p-6">
          <h3 className="text-xl font-bold">Select Location on Indian Map</h3>
          <p className="mt-1 text-slate-400">Demo map selection for citizen complaint place.</p>
          <div className="relative mt-5 h-72 overflow-hidden rounded-[1.7rem] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950">
            <div className="absolute inset-4 rounded-[45%_55%_35%_65%] border border-cyan-300/25 bg-cyan-300/5" />
            <div className="absolute left-[42%] top-[46%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-400 shadow-[0_0_25px_rgba(248,113,113,.8)]" />
            <div className="absolute bottom-5 left-5 rounded-2xl bg-black/35 px-4 py-3 text-sm text-slate-200 backdrop-blur-xl">
              <MapPin className="mr-2 inline h-4 w-4 text-cyan-200" /> {form.locationLabel}<br />
              Lat {selectedLocation.lat}, Lng {selectedLocation.lng}
            </div>
          </div>
        </div>

        {submitted && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="panel p-6 border-emerald-300/25">
            <div className="flex items-center gap-3 text-emerald-200">
              <CheckCircle2 className="h-7 w-7" />
              <h3 className="text-2xl font-black">Complaint Submitted</h3>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <Info label="Complaint Number" value={submitted.id} highlight />
              <Info label="AI Category" value={submitted.category} />
              <Info label="Assigned Department" value={submitted.department} />
              <Info label="Urgency" value={submitted.priority} />
              <Info label="Estimated Response" value={submitted.estimatedTime} />
              <Info label="AI Confidence" value={`${submitted.aiConfidence}%`} />
              <Info label="Duplicate Risk" value={`${submitted.duplicateRisk}%`} />
              <Info label="Fraud Risk" value={`${submitted.fraudRisk}%`} />
            </div>
          </motion.div>
        )}

        <div className="panel p-6">
          <h3 className="font-bold text-xl">AI Modules Active</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {['NLP Category', 'Severity AI', 'YOLOv8 Mock', 'Whisper Mock', 'Duplicate AI', 'Fraud Detection'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-3"><Upload className="mr-2 inline h-4 w-4 text-cyan-200" />{item}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 p-3">
      <span className="text-slate-400">{label}</span>
      <span className={highlight ? 'font-black text-cyan-200' : 'font-semibold'}>{value}</span>
    </div>
  );
}
