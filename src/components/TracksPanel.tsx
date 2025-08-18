'use client';

import {
  ComposedChart,
  ResponsiveContainer,
  YAxis,
  XAxis,
  Tooltip,
  Line,
  Area,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
const API = process.env.NEXT_PUBLIC_SUPABASE_FN!;

type Row = {
  id: number;
  well_id: string;
  depth: number;
  dt: number;
  gr: number;
  sh_percent: number | null;
  ss_percent: number | null;
  ls_percent: number | null;
  dol_percent: number | null;
  anh_percent: number | null;
  coal_percent: number | null;
  salt_percent: number | null;
};

export default function TracksPanel({ wellId }: { wellId: string }) {
  const { data } = useQuery<Row[]>({
    queryKey: ['tracks', wellId],
    queryFn: async () => {
      const res = await fetch(`${API}/wells/${wellId}/tracks`);
      if (!res.ok) {
        const text = await res.text();
        console.error("Fetch error:", text);
        throw new Error(`Failed to fetch tracks: ${res.status} ${res.statusText} - ${text}`);
      }
      return res.json();
    },
  });

  if (!data || data.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-500">No data available</div>
      </div>
    );
  }

  // Map data for charts, multiply percentages by 100 for area chart display
  const compData = data.map(r => ({
    depth: r.depth,
    DT: r.dt,
    GR: r.gr,
    sh: (r.sh_percent ?? 0) * 100,
    ss: (r.ss_percent ?? 0) * 100,
    ls: (r.ls_percent ?? 0) * 100,
    dol: (r.dol_percent ?? 0) * 100,
    anh: (r.anh_percent ?? 0) * 100,
    coal: (r.coal_percent ?? 0) * 100,
    salt: (r.salt_percent ?? 0) * 100,
  })).sort((a, b) => a.depth - b.depth);

  const depths = compData.map(d => d.depth);
  const minDepth = Math.min(...depths);
  const maxDepth = Math.max(...depths);

  const compositionColors: Record<string, string> = {
    sh: '#f48fb1',
    ss: '#90caf9',
    ls: '#fff176',
    dol: '#4db6ac',
    anh: '#ba68c8',
    coal: '#ff9800',
    salt: '#9e9e9e',
  };

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
        {/* Rock Composition */}
        <div>
          <div className="text-sm font-semibold mb-2">Rock Composition</div>
          <div className="h-[80vh] border border-gray-300">
            <ResponsiveContainer>
              <ComposedChart
                layout="vertical"
                data={compData}
                margin={{ top: 20, right: 12, bottom: 10, left: 12 }}
              >
                <YAxis
                  dataKey="depth"
                  type="number"
                  domain={[minDepth, maxDepth]}
                  reversed
                  tickCount={6}
                  width={40}
                />
                <XAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} orientation="top" />
                <Tooltip
                  formatter={(value, name) => {
                    const labels: Record<string, string> = {
                      sh: 'Shale (SH)',
                      ss: 'Sandstone (SS)',
                      ls: 'Limestone (LS)',
                      dol: 'Dolomite (DOL)',
                      anh: 'Anhydrite (ANH)',
                      coal: 'Coal',
                      salt: 'Salt'
                    };
                    return value !== null ? [`${(value as number).toFixed(1)}%`, labels[name] || name] : ['N/A', labels[name] || name];
                  }}
                />
                {Object.keys(compositionColors).map(key => (
                  <Area
                    key={key}
                    type="stepAfter"
                    dataKey={key}
                    stackId="1"
                    stroke="none"
                    fill={compositionColors[key]}
                    isAnimationActive={false}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DT */}
        <div>
          <div className="text-sm font-semibold mb-2">DT</div>
          <div className="h-[80vh] border border-gray-300">
            <ResponsiveContainer>
              <ComposedChart
                layout="vertical"
                data={compData}
                margin={{ top: 20, right: 12, bottom: 10, left: 12 }}
              >
                <YAxis dataKey="depth" type="number" domain={[minDepth, maxDepth]} reversed tickCount={6} width={40} />
                <XAxis type="number" domain={[40, 110]} orientation="top" />
                <Tooltip formatter={(value, name) => value !== null ? [value, name] : ['N/A', name]} />
                <Line type="linear" dataKey="DT" stroke="#e91e63" strokeWidth={1.4} dot={false} connectNulls isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GR */}
        <div>
          <div className="text-sm font-semibold mb-2">GR</div>
          <div className="h-[80vh] border border-gray-300">
            <ResponsiveContainer>
              <ComposedChart
                layout="vertical"
                data={compData}
                margin={{ top: 20, right: 12, bottom: 10, left: 12 }}
              >
                <YAxis dataKey="depth" type="number" domain={[minDepth, maxDepth]} reversed tickCount={6} width={40} />
                <XAxis type="number" domain={[20, 140]} orientation="top" />
                <Tooltip formatter={(value, name) => value !== null ? [value, name] : ['N/A', name]} />
                <Line type="linear" dataKey="GR" stroke="#2196f3" strokeWidth={1.4} dot={false} connectNulls isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}