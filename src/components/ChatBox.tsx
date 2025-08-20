// src/components/ChatBox.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
const API = process.env.NEXT_PUBLIC_SUPABASE_FN!;

export default function ChatBox({ wellId }:{ wellId:string }) {
  const [q, setQ] = useState('Summarize DT and GR trends by depth and composition.');
  const [msgs, setMsgs] = useState<{role:'user'|'assistant', text:string}[]>([
    { role:'assistant', text:"Hi, I’m Drill AI. Ask me anything about this well!" }
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  async function send() {
    if (!q.trim()) return;
    setLoading(true);
    try {
      setMsgs(m=>[...m, { role:'user', text:q }]);
      setQ('');
      const res = await fetch(`${API}/chat`, {
        method:'POST',
        headers:{ 'content-type':'application/json' },
        body: JSON.stringify({ wellId, question: q })
      });
      if (!res.ok) {
        console.error(`HTTP error! status: ${res.status}`);
        setMsgs(m=>[...m, { role:'assistant', text: 'Sorry, something went wrong while fetching the answer.' }]);
        return;
      }
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        setMsgs(m=>[...m, { role:'assistant', text: 'Sorry, received invalid response from the server.' }]);
        return;
      }
      console.log("🚀 ~ send ~ data:", data)
      setMsgs(m=>[...m, { role:'assistant', text:data.answer ?? 'No answer' }]);
    } catch (error) {
      console.error('Network or unexpected error:', error);
      setMsgs(m=>[...m, { role:'assistant', text: 'Sorry, failed to send your question. Please try again.' }]);
    } finally {
      setLoading(false);
    }
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
        <div ref={endRef}></div>
      </div>
      {loading && (
        <div className="p-3">
          <div className="inline-block px-3 py-2 rounded-xl bg-gray-200 italic">Thinking...</div>
        </div>
      )}
      <div className="p-3 flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} placeholder="Type messages here" className="flex-1 border rounded-lg px-3 py-2"/>
        <button onClick={send} disabled={!q.trim() || loading} className={`px-3 py-2 rounded-lg text-white ${(!q.trim() || loading) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600'}`}>{loading ? '...' : 'Send'}</button>
      </div>
    </div>
  );
}