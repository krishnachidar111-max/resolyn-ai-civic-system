import { useState } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { askChatbotApi, hasToken } from '../lib/api';

const quickReplies = [
  'Road issue kaha report karun?',
  'Complaint ka status kaise track hoga?',
  'Animal rescue kaise report karu?',
  'Emergency complaint priority kaise detect hoti hai?'
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Namaste! Main Resolyn AI civic assistant hoon. Complaint submit, track, department guidance aur emergency help me assist kar sakta hoon.' }
  ]);
  const [text, setText] = useState('');

  async function send(value = text) {
    if (!value.trim()) return;
    setMessages((prev) => [...prev, { from: 'user', text: value }]);
    setText('');
    let reply = getReply(value);
    if (hasToken()) {
      try {
        const data = await askChatbotApi(value);
        reply = data.reply;
      } catch (error) {
        console.warn('Chatbot API failed, using local reply:', error);
      }
    }
    setMessages((prev) => [...prev, { from: 'bot', text: reply }]);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-24 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-300 to-emerald-300 text-slate-950 shadow-glow lg:bottom-6">
        <Bot className="h-8 w-8" />
      </button>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[560px] w-[min(92vw,390px)] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f]/95 shadow-2xl backdrop-blur-2xl lg:bottom-6">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-3"><div className="rounded-2xl bg-cyan-300/15 p-2 text-cyan-200"><Bot className="h-5 w-5" /></div><div><p className="font-bold">AI Civic Assistant</p><p className="text-xs text-slate-400">Online demo mode</p></div></div>
            <button onClick={() => setOpen(false)} className="rounded-xl p-2 hover:bg-white/10"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.from === 'bot' ? 'bg-white/10 text-slate-200' : 'ml-auto bg-cyan-300 text-slate-950'}`}>{msg.text}</div>
            ))}
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => <button key={reply} onClick={() => send(reply)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10">{reply}</button>)}
            </div>
          </div>
          <div className="border-t border-white/10 p-3">
            <div className="flex gap-2 rounded-2xl bg-white/5 p-2">
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask civic assistant..." className="flex-1 bg-transparent px-2 outline-none placeholder:text-slate-500" />
              <button onClick={() => send()} className="rounded-xl bg-cyan-300 p-2 text-slate-950"><Send className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getReply(input: string) {
  const text = input.toLowerCase();
  if (text.includes('road')) return 'Road issue ke liye New Complaint page me Road Damage category select karo, photo aur map location add karo. AI usse Road Department ko route karega.';
  if (text.includes('track') || text.includes('status')) return 'Track Complaint page me complaint number enter karo. Timeline, status, department remark aur estimated resolution time show hoga.';
  if (text.includes('animal')) return 'Animal Emergency page se injured animal photo, location aur description submit karo. System nearest verified NGO ko alert karega.';
  if (text.includes('emergency') || text.includes('priority')) return 'Priority AI severity words, category, image result, duplicate reports, sensitive zones aur upvotes ke basis par Low/Medium/High/Emergency assign karta hai.';
  return 'Aap complaint text, image, voice aur location ke saath submit kar sakte ho. Main category, department aur urgency samjhane me help karunga.';
}
