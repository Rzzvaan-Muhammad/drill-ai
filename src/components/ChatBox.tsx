// src/components/ChatBox.tsx
'use client';
import { useState } from 'react';
const API = process.env.NEXT_PUBLIC_SUPABASE_FN!;

export default function ChatBox({ wellId }:{ wellId:string }) {
  const [q, setQ] = useState('Summarize DT and GR trends by depth and composition.');
  const [msgs, setMsgs] = useState<{role:'user'|'assistant', text:string}[]>([
    { role:'assistant', text:"Hi, I’m Drill AI. Ask me anything about this well!" }
  ]);

  async function send() {
    if (!q.trim()) return;
    setMsgs(m=>[...m, { role:'user', text:q }]);
    setQ('');
    const res = await fetch(`${API}/chat`, {
      method:'POST',
      headers:{ 'content-type':'application/json' },
      body: JSON.stringify({ wellId, question: q })
    });
    const data = await res.json();
    setMsgs(m=>[...m, { role:'assistant', text:data.answer ?? 'No answer' }]);
  }

  return (
    <div className="flex flex-col h-full border-l">
      <div className="p-3 border-b font-semibold">Drill AI</div>
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {msgs.map((m,i)=>(
          <div key={i} className={m.role==='user'?'text-right':''}>
            <span className={`inline-block px-3 py-2 rounded-xl ${m.role==='user'?'bg-blue-500 text-white':'bg-gray-100'}`}>{m.text}</span>
          </div>
        ))}
      </div>
      <div className="p-3 flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Type messages here" className="flex-1 border rounded-lg px-3 py-2"/>
        <button onClick={send} className="px-3 py-2 rounded-lg bg-blue-600 text-white">Send</button>
      </div>
    </div>
  );
}