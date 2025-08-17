// src/components/UploadPanel.tsx
'use client';
import * as XLSX from 'xlsx';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const API = process.env.NEXT_PUBLIC_SUPABASE_FN!; // e.g. https://.../functions/v1/api

export default function UploadPanel({ wellId }:{ wellId:string }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>('');
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: { rows: any[]; csv?: string }) => {
      const res = await fetch(`${API}/upload/complete`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ wellId, rows: data.rows, csv: data.csv })
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey:['tracks',wellId] }); }
  });

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setStatus('Parsing…');
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];

      // If file is .xlsx, also convert it into CSV string
      let csv: string | undefined;
      if (file.name.endsWith(".xlsx")) {
        csv = XLSX.utils.sheet_to_csv(ws);
        console.log("CSV Preview:", csv.slice(0, 200)); // optional preview
      }

      const json = XLSX.utils.sheet_to_json<any>(ws, { defval: null });
      // normalize
      const rows = json.map(r=>({
        depth: Number(r.depth ?? r.Depth ?? r.DEPTH),
        composition: String(r.composition ?? r.Rock ?? r['rock composition'] ?? ''),
        DT: Number(r.DT ?? r.dt ?? r['Δt'] ?? r['Sonic'] ?? 0),
        GR: Number(r.GR ?? r.gr ?? r['Gamma'] ?? 0)
      })).filter(r=>!Number.isNaN(r.depth));
      await mutateAsync({ rows, csv });
      setStatus(`Uploaded ${rows.length} rows ✅`);
    } catch (err:any) {
      setStatus(`Upload failed: ${err.message}`);
    }
  }

  return (
    <>
      <label className="px-3 py-1.5 rounded-lg bg-blue-500 text-white cursor-pointer">
        Upload
        <input type="file" accept=".xlsx" onChange={onFileChange} className="hidden" />
      </label>
      <span className="text-sm text-gray-600">{isPending?'Uploading…':status}</span>
    </>
  );
}