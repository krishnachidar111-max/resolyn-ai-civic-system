import { useEffect, useState } from 'react';
import { AlertTriangle, BellRing, CheckCircle2, MessageSquareText, RefreshCw, Send, TimerReset } from 'lucide-react';
import type { Complaint, User } from '../types';
import { listChatApi, listEscalationsApi, runEscalationApi, sendChatApi, type DepartmentChatMessage } from '../lib/api';

interface RealtimeHubProps {
  complaints: Complaint[];
  user: User;
}

export default function RealtimeHub({ complaints, user }: RealtimeHubProps) {
  const [selected, setSelected] = useState(complaints[0]?.id || '');
  const [messages, setMessages] = useState<DepartmentChatMessage[]>([]);
  const [message, setMessage] = useState('Please upload a clearer image of the issue.');
  const [escalations, setEscalations] = useState<any[]>([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (selected) loadChat(selected);
    listEscalationsApi().then(setEscalations).catch(() => setEscalations([]));
  }, [selected]);

  async function loadChat(id = selected) {
    if (!id) return;
    try {
      const data = await listChatApi(id);
      setMessages(data);
    } catch (error: any) {
      setNotice(error.message || 'Backend connect nahi hua.');
    }
  }

  async function send() {
    if (!selected || !message.trim()) return;
    try {
      const row = await sendChatApi(selected, message.trim());
      setMessages((old) => [...old, row]);
      setMessage('');
    } catch (error: any) {
      setNotice(error.message || 'Message send failed.');
    }
  }

  async function runEngine() {
    try {
      const data = await runEscalationApi();
      setNotice(`${data.count} escalation(s) generated. ${data.message}`);
      const rows = await listEscalationsApi();
      setEscalations(rows);
    } catch (error: any) {
      setNotice(error.message || 'Escalation engine failed.');
    }
  }

  const selectedComplaint = complaints.find(item => item.id === selected);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-cyan-200"><BellRing className="h-4 w-4" /> Phase-3 Real-Time Operations</p>
            <h2 className="mt-2 text-3xl font-black">Department chat, escalation automation & notification flow</h2>
            <p className="mt-2 max-w-3xl text-slate-300">Use this page to demo Citizen ↔ Officer communication, complaint escalation rules, status visibility and email/push notification simulation.</p>
          </div>
          <button onClick={runEngine} className="rounded-2xl bg-amber-300 px-6 py-3 font-bold text-slate-950 hover:bg-amber-200"><TimerReset className="mr-2 inline h-4 w-4" />Run Escalation</button>
        </div>
      </div>

      {notice && <div className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4 text-cyan-100">{notice}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-black">Real-Time Department Chat</h3>
              <p className="text-sm text-slate-400">Current user: {user.fullName} • {user.role}</p>
            </div>
            <select value={selected} onChange={(e) => setSelected(e.target.value)} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 outline-none">
              {complaints.map(item => <option key={item.id} value={item.id}>{item.id} • {item.title}</option>)}
            </select>
          </div>

          {selectedComplaint && (
            <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
              <b className="text-white">{selectedComplaint.title}</b> • {selectedComplaint.category} • {selectedComplaint.priority} • {selectedComplaint.status}
            </div>
          )}

          <div className="h-[360px] space-y-3 overflow-y-auto rounded-3xl border border-white/10 bg-black/20 p-4">
            {messages.map((row) => (
              <div key={row.id} className={`max-w-[85%] rounded-3xl p-4 ${row.senderRole === user.role ? 'ml-auto bg-cyan-300 text-slate-950' : 'bg-white/10 text-white'}`}>
                <div className="text-xs font-bold opacity-80">{row.senderName} • {row.senderRole}</div>
                <p className="mt-1 text-sm">{row.message}</p>
                <div className="mt-2 text-[10px] opacity-70">{row.time}</div>
              </div>
            ))}
            {!messages.length && <p className="text-center text-sm text-slate-400">Select complaint and chat will load from backend.</p>}
          </div>

          <div className="mt-4 flex gap-3">
            <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-300" placeholder="Type officer/citizen message..." />
            <button onClick={send} className="rounded-2xl bg-cyan-300 px-5 font-bold text-slate-950"><Send className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-xl font-black"><AlertTriangle className="h-5 w-5 text-amber-200" /> Escalation Queue</h3>
              <button onClick={() => listEscalationsApi().then(setEscalations)} className="rounded-xl border border-white/10 p-2 hover:bg-white/10"><RefreshCw className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 space-y-3">
              {escalations.map(row => <div key={row.id} className="rounded-2xl bg-black/20 p-4 text-sm"><b>{row.level}</b><p className="mt-1 text-slate-300">{row.complaintNo}: {row.reason}</p><span className="text-xs text-slate-500">{row.time}</span></div>)}
              {!escalations.length && <p className="rounded-2xl bg-black/20 p-4 text-sm text-slate-400">No escalation yet. Run engine after old pending complaints exist.</p>}
            </div>
          </div>

          <div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-6">
            <h3 className="flex items-center gap-2 text-xl font-black"><CheckCircle2 className="h-5 w-5" /> Notification Simulation</h3>
            <div className="mt-4 space-y-3 text-sm">
              {['Complaint submitted email receipt', 'Officer message push notification', 'Emergency complaint SMS alert', 'NGO rescue notification', 'Resolved proof update'].map(item => <div key={item} className="rounded-2xl bg-black/20 p-3">{item}</div>)}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
            <h3 className="flex items-center gap-2 text-xl font-black"><MessageSquareText className="h-5 w-5 text-cyan-200" /> Transparency Timeline</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {selectedComplaint?.timeline.map((item) => <div key={`${item.label}-${item.time}`} className="rounded-2xl bg-black/20 p-3"><b className="text-white">{item.label}</b><p>{item.note}</p><span className="text-xs text-slate-500">{item.time}</span></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
