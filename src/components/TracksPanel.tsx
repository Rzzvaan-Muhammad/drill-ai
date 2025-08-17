// src/components/TracksPanel.tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { ComposedChart, ResponsiveContainer, YAxis, XAxis, Tooltip, Legend, Line, Bar, CartesianGrid } from 'recharts';

const API = process.env.NEXT_PUBLIC_SUPABASE_FN!;

type Row = { depth:number; composition:string; dt:number; gr:number };

const COLORS = ['#e91e63','#ff9800','#ffc107','#8bc34a','#4caf50','#00bcd4','#9c27b0','#3f51b5']; // auto palette
const COMPOSITION_ORDER = ['SH','SS','LS','DOL','ANH','Coal','Salt','MINERAL','Other'];

function toStack(rows: Row[]) {
  // Map composition categories to one-hot numeric bars per row (0..100 scale)
  const cats = COMPOSITION_ORDER;
  return rows.map(r=>{
    const obj:any = { depth:r.depth, DT:r.dt, GR:r.gr };
    cats.forEach(c=>obj[c]=0);
    const key = cats.includes(r.composition) ? r.composition : 'Other';
    obj[key] = 100; // full-width band; tooltip shows category
    return obj;
  });
}

export default function TracksPanel({ wellId }:{ wellId:string }) {
  const { data } = useQuery<Row[]>({
    queryKey:['tracks', wellId],
    queryFn: async() => fetch(`${API}/wells/${wellId}/tracks`).then(r=>r.json())
  });

  const rows = data ?? [];
  const stacked = toStack(rows);

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rock Composition */}
        <div>
          <div className="text-sm font-semibold mb-2">Rock Composition</div>
          <div className="h-[560px] border rounded-lg">
            <ResponsiveContainer>
              <ComposedChart data={stacked} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <YAxis dataKey="depth" type="number" reversed />
                <XAxis type="number" domain={[0,100]} />
                <Tooltip />
                <Legend />
                {COMPOSITION_ORDER.map((c, i)=>(
                  <Bar key={c} dataKey={c} stackId="comp" fill={COLORS[i % COLORS.length]} />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DT */}
        <div>
          <div className="text-sm font-semibold mb-2">DT</div>
          <div className="h-[560px] border rounded-lg">
            <ResponsiveContainer>
              <ComposedChart data={rows as any}>
                <CartesianGrid strokeDasharray="3 3" />
                <YAxis dataKey="depth" type="number" reversed />
                <XAxis dataKey="dt" type="number" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="dt" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GR */}
        <div>
          <div className="text-sm font-semibold mb-2">GR</div>
          <div className="h-[560px] border rounded-lg">
            <ResponsiveContainer>
              <ComposedChart data={rows as any}>
                <CartesianGrid strokeDasharray="3 3" />
                <YAxis dataKey="depth" type="number" reversed />
                <XAxis dataKey="gr" type="number" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="gr" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}