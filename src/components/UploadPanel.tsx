// src/components/UploadPanel.tsx
'use client';
import * as XLSX from 'xlsx';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Define the interface for an Excel row after normalization and mapping
export interface ExcelRow {
  depth: number;
  sh_percent: number;
  ss_percent: number;
  ls_percent: number;
  dol_percent: number;
  anh_percent: number;
  coal_percent: number;
  salt_percent: number;
  dt: number;
  gr: number;
}

const API = process.env.NEXT_PUBLIC_SUPABASE_FN!; // e.g. https://.../functions/v1/api

export default function UploadPanel({ wellId }: { wellId: string }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>('');
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (rows: ExcelRow[]) => {
      const res = await fetch(`${API}/upload/complete`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ wellId, rows })
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tracks', wellId] }); }
  });

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setStatus('Parsing…');
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      // Use unknown for the row type from sheet_to_json, since we will normalize it
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null, raw: false });
      // Normalize headers: trim and lowercase all keys in each row
      const normalizedJson: Record<string, unknown>[] = json.map((row) => {
        const normalizedRow: Record<string, unknown> = {};
        Object.keys(row).forEach(key => {
          const normKey = key.trim().toLowerCase();
          normalizedRow[normKey] = row[key];
        });
        return normalizedRow;
      });
      // Now map using normalized keys
      const rows: ExcelRow[] = normalizedJson.map(r => ({
        depth: Number(r['depth']),
        sh_percent: Number(r['%sh'] ?? r['sh_percent'] ?? r['sh %'] ?? 0),
        ss_percent: Number(r['%ss'] ?? r['ss_percent'] ?? r['ss %'] ?? 0),
        ls_percent: Number(r['%ls'] ?? r['ls_percent'] ?? r['ls %'] ?? 0),
        dol_percent: Number(r['%dol'] ?? r['dol_percent'] ?? r['dol %'] ?? 0),
        anh_percent: Number(r['%anh'] ?? r['anh_percent'] ?? r['anh %'] ?? 0),
        coal_percent: Number(r['%coal'] ?? r['coal_percent'] ?? r['coal %'] ?? 0),
        salt_percent: Number(r['%salt'] ?? r['salt_percent'] ?? r['salt %'] ?? 0),
        dt: Number(r['dt'] ?? 0),
        gr: Number(r['gr'] ?? 0)
      })).filter(r => !Number.isNaN(r.depth));
      await mutateAsync(rows);
      setStatus(`Uploaded ${rows.length} rows ✅`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setStatus(`Upload failed: ${error.message}`);
    }
  }

  return (
    <>
      <label className="px-3 py-1.5 rounded-lg bg-blue-500 text-white cursor-pointer">
        Upload
        <input type="file" accept=".xlsx" onChange={onFileChange} className="hidden" />
      </label>
      <span className="text-sm text-gray-600">{isPending ? 'Uploading…' : status}</span>
    </>
  );
}