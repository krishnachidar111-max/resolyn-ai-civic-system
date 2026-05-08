import { useState } from 'react';
import { CheckCircle2, Clock3, Search, ShieldAlert } from 'lucide-react';
import type { Complaint } from '../types';
import { hasToken, trackComplaintApi } from '../lib/api';

export default function TrackComplaint({ complaints }: { complaints: Complaint[] }) {
  const [query, setQuery] = useState(complaints[0]?.id ?? '');
  const [remoteResult, setRemoteResult] = useState<Complaint | null>(null);
  const [searched, setSearched] = useState(false);
  const result = remoteResult ?? complaints.find((item) => item.id.toLowerCase() === query.toLowerCase());

  async function handleTrack() {
    setSearched(true);
    setRemoteResult(null);
    if (hasToken() && query.trim()) {
      try {
        const item = await trackComplaintApi(query.trim());
        setRemoteResult(item);
      } catch (error) {
        console.warn('Backend tracking failed:', error);
      }
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
      <section className="panel p-6 md:p-8">
        <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
          <Search className="h-9 w-9 text-cyan-200" />
          <h2 className="mt-4 text-3xl font-black">Track Complaint</h2>
          <p className="mt-2 text-slate-300">Complaint number enter karke live status, timeline aur department remarks check karo.</p>
        </div>
        <div className="mt-6 space-y-4">
          <input className="input" placeholder="Enter complaint number e.g. RSL-2026-24891" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button onClick={handleTrack} className="btn-primary w-full">Track Now</button>
        </div>
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
          <p className="font-semibold text-white">Demo IDs:</p>
          {complaints.slice(0, 4).map((item) => <button key={item.id} onClick={() => setQuery(item.id)} className="mt-2 block text-cyan-200 hover:underline">{item.id} - {item.title}</button>)}
        </div>
      </section>

      <section className="panel p-6 md:p-8">
        {result ? (
          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-cyan-200 font-black">{result.id}</p>
                <h2 className="mt-2 text-3xl font-black">{result.title}</h2>
                <p className="mt-2 text-slate-400">{result.description}</p>
              </div>
              <span className={`badge ${priorityClass(result.priority)}`}>{result.priority}</span>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <Info label="Category" value={result.category} />
              <Info label="Department" value={result.department} />
              <Info label="Status" value={result.status} />
              <Info label="Estimated Time" value={result.estimatedTime} />
              <Info label="AI Confidence" value={`${result.aiConfidence}%`} />
              <Info label="Location" value={result.address} />
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold">Public Timeline</h3>
              <div className="mt-5 space-y-4">
                {result.timeline.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-300/15 text-emerald-200">
                        {index === result.timeline.length - 1 ? <Clock3 className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                      </div>
                      {index !== result.timeline.length - 1 && <div className="h-10 w-px bg-white/15" />}
                    </div>
                    <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="font-bold">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.time}</p>
                      <p className="mt-2 text-slate-300">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 rounded-3xl border border-yellow-300/20 bg-yellow-300/10 p-5">
              <ShieldAlert className="h-6 w-6 text-yellow-200" />
              <p className="mt-3 text-slate-200"><b>Officer Remark:</b> {result.officerRemark}</p>
              <p className="mt-2 text-slate-400">Before/After proof and citizen verification will be visible after resolution.</p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
            <Search className="h-16 w-16 text-slate-600" />
            <h2 className="mt-4 text-2xl font-bold">Complaint not found</h2>
            <p className="mt-2 text-slate-400">Please check complaint number and try again.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}

function priorityClass(priority: string) {
  if (priority === 'Emergency') return 'badge-red';
  if (priority === 'High') return 'badge-orange';
  if (priority === 'Medium') return 'badge-yellow';
  return 'badge-green';
}
