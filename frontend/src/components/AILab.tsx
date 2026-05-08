import { useEffect, useState } from 'react';
import { Bot, BrainCircuit, FileAudio, ImagePlus, Loader2, Radar, ShieldAlert, Sparkles, UploadCloud, Zap } from 'lucide-react';
import { analyzeImageApi, analyzeTextApi, modelStatusApi, riskZonesApi, transcribeVoiceApi, type Phase3AIResult } from '../lib/api';

const demoTexts = [
  'Hamare area me road par bada pothole hai, accident ho sakta hai.',
  'Electric wire toot gaya hai aur sparks aa rahe hain, emergency hai.',
  'Sadak ke side injured dog pada hai, rescue urgently required.',
  'Garbage collection 5 din se nahi hua, bad smell aa rahi hai.'
];

export default function AILab() {
  const [title, setTitle] = useState('AI Complaint Analysis');
  const [description, setDescription] = useState(demoTexts[0]);
  const [city, setCity] = useState('Bhopal');
  const [type, setType] = useState('Auto Detect');
  const [result, setResult] = useState<Phase3AIResult | null>(null);
  const [status, setStatus] = useState<Record<string, string>>({});
  const [imageResult, setImageResult] = useState<any>(null);
  const [voiceResult, setVoiceResult] = useState<any>(null);
  const [riskZones, setRiskZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    modelStatusApi().then(setStatus).catch(() => setStatus({ phase: 'Frontend demo mode', note: 'Backend connect nahi hua.' }));
    riskZonesApi().then(setRiskZones).catch(() => setRiskZones([]));
  }, []);

  async function runAnalysis() {
    setLoading(true);
    setNotice('');
    try {
      const data = await analyzeTextApi({ title, description, type, city, lat: 23.2599, lng: 77.4126, voiceText: voiceResult?.transcript, imageName: imageResult?.fileName });
      setResult(data);
    } catch (error: any) {
      setNotice(error.message || 'Backend not connected. Start backend on http://localhost:8000');
    } finally {
      setLoading(false);
    }
  }

  async function handleImage(file?: File) {
    if (!file) return;
    setLoading(true);
    try {
      const data = await analyzeImageApi(file);
      setImageResult(data);
    } catch (error: any) {
      setNotice(error.message || 'Image analysis failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVoice(file?: File) {
    if (!file) return;
    setLoading(true);
    try {
      const data = await transcribeVoiceApi(file);
      setVoiceResult(data);
      setDescription((old) => old ? `${old}\n\nVoice: ${data.transcript}` : data.transcript);
    } catch (error: any) {
      setNotice(error.message || 'Voice transcription failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-cyan-200"><BrainCircuit className="h-4 w-4" /> Phase-3 AI Engine</p>
            <h2 className="mt-2 text-3xl font-black">Real AI-ready civic analysis lab</h2>
            <p className="mt-2 max-w-3xl text-slate-300">Test NLP category detection, Whisper-ready voice-to-text, YOLOv8-ready image detection, duplicate risk, fraud risk and smart priority scoring.</p>
          </div>
          <button onClick={runAnalysis} disabled={loading} className="rounded-2xl bg-cyan-300 px-6 py-3 font-bold text-slate-950 hover:bg-cyan-200 disabled:opacity-60">
            {loading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Running AI</span> : 'Run AI Analysis'}
          </button>
        </div>
      </div>

      {notice && <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-amber-100">{notice}</div>}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-slate-300">Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-300" />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-slate-300">City</span>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-300" />
            </label>
          </div>
          <label className="mt-4 block space-y-2">
            <span className="text-sm text-slate-300">Complaint Type</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-cyan-300">
              {['Auto Detect', 'Road Damage', 'Water Supply', 'Electricity', 'Garbage/Sanitation', 'Drainage', 'Public Safety', 'Animal Emergency', 'Social Help', 'Other'].map(item => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="mt-4 block space-y-2">
            <span className="text-sm text-slate-300">Complaint Text</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={7} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-300" />
          </label>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="cursor-pointer rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 hover:bg-cyan-300/15">
              <div className="flex items-center gap-3 font-semibold text-cyan-100"><ImagePlus className="h-5 w-5" /> Upload civic image</div>
              <p className="mt-1 text-xs text-slate-300">Filename based demo detection: pothole, garbage, dog, wire, water etc.</p>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files?.[0])} />
            </label>
            <label className="cursor-pointer rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 hover:bg-emerald-300/15">
              <div className="flex items-center gap-3 font-semibold text-emerald-100"><FileAudio className="h-5 w-5" /> Upload voice note</div>
              <p className="mt-1 text-xs text-slate-300">Whisper-ready adapter returns transcript for demo.</p>
              <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleVoice(e.target.files?.[0])} />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {demoTexts.map((text) => <button key={text} onClick={() => setDescription(text)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/10">{text.slice(0, 44)}...</button>)}
          </div>
        </div>

        <div className="space-y-4">
          <InfoCard icon={Bot} title="Model Status" items={Object.entries(status).slice(0, 7).map(([k, v]) => `${k}: ${v}`)} />
          {imageResult && <InfoCard icon={UploadCloud} title="YOLOv8-ready Image Result" items={[`File: ${imageResult.fileName}`, `Detected: ${imageResult.detectedObjects.join(', ')}`, `Confidence: ${imageResult.confidence}%`]} />}
          {voiceResult && <InfoCard icon={FileAudio} title="Whisper-ready Voice Result" items={[`Transcript: ${voiceResult.transcript}`, `Confidence: ${voiceResult.confidence}%`]} />}
        </div>
      </div>

      {result && (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6">
            <div className="flex items-center gap-3 text-cyan-100"><Sparkles className="h-6 w-6" /><h3 className="text-xl font-black">AI Classification</h3></div>
            <div className="mt-5 space-y-3 text-sm">
              <Metric label="Category" value={result.category} />
              <Metric label="Department" value={result.department} />
              <Metric label="Confidence" value={`${result.ai_confidence}%`} />
              <Metric label="Detected Objects" value={result.detected_objects.join(', ') || 'Text-only'} />
            </div>
          </div>
          <div className="rounded-[2rem] border border-red-300/20 bg-red-300/10 p-6">
            <div className="flex items-center gap-3 text-red-100"><ShieldAlert className="h-6 w-6" /><h3 className="text-xl font-black">Smart Priority</h3></div>
            <div className="mt-5 space-y-3 text-sm">
              <Metric label="Priority" value={result.priority} />
              <Metric label="Priority Score" value={`${result.priority_score}/100`} />
              <Metric label="ETA" value={result.estimated_time} />
              <Metric label="Fraud Risk" value={`${result.fraud_risk}%`} />
              <Metric label="Duplicate Risk" value={`${result.duplicate_risk}%`} />
            </div>
          </div>
          <div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-6">
            <div className="flex items-center gap-3 text-emerald-100"><Zap className="h-6 w-6" /><h3 className="text-xl font-black">Suggested Actions</h3></div>
            <ul className="mt-5 space-y-3 text-sm text-slate-100">
              {result.suggested_actions.map((item) => <li key={item} className="rounded-2xl bg-black/20 p-3">{item}</li>)}
            </ul>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 xl:col-span-2">
            <h3 className="text-xl font-black">AI Reasoning Trail</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {result.severity_reasons.map((reason) => <div key={reason} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">{reason}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
            <div className="flex items-center gap-3"><Radar className="h-6 w-6 text-amber-200" /><h3 className="text-xl font-black">Predicted Risk Zones</h3></div>
            <div className="mt-4 space-y-3">
              {riskZones.slice(0, 4).map(zone => <div key={zone.city} className="rounded-2xl bg-black/20 p-3 text-sm"><b>{zone.city}</b><br/><span className="text-slate-300">Risk {zone.riskScore}/100 • {zone.prediction}</span></div>)}
              {!riskZones.length && <p className="text-sm text-slate-400">Backend se risk zones load honge.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/20 px-4 py-3"><span className="text-slate-300">{label}</span><b className="text-right text-white">{value}</b></div>;
}

function InfoCard({ icon: Icon, title, items }: { icon: any; title: string; items: string[] }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
      <div className="flex items-center gap-3"><Icon className="h-5 w-5 text-cyan-200" /><h3 className="font-black">{title}</h3></div>
      <div className="mt-4 space-y-2">
        {items.map((item) => <p key={item} className="rounded-2xl bg-black/20 p-3 text-xs text-slate-300">{item}</p>)}
      </div>
    </div>
  );
}
