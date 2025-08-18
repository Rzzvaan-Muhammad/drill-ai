// src/app/page.tsx
'use client';
import { useState } from 'react';
import WellSidebar from '@/components/WellSidebar';
import UploadPanel from '@/components/UploadPanel';
import TracksPanel from '@/components/TracksPanel';
import ChatBox from '@/components/ChatBox';

export default function Dashboard() {
  const [wellId, setWellId] = useState('well-a');
  return (
    <main className="flex h-[calc(100vh-56px)]">
      <WellSidebar selected={wellId} onSelect={setWellId} className="w-[260px]" />
      <section className="flex-1 border-r overflow-auto">
        <div className="flex items-center gap-2 p-3 border-b sticky top-0 bg-white">
          <nav className="flex gap-4 text-sm">
            <span className="font-semibold text-blue-600">Drilling Monitoring</span>
            <span className="text-gray-400 line-through">Offset Wells Map</span>
            <span className="text-gray-400 line-through">Bit Summary</span>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border">Filter</button>
            <UploadPanel wellId={wellId} />
            <button className="px-3 py-1.5 rounded-lg border">1x</button>
          </div>
        </div>
        <TracksPanel wellId={wellId} />
      </section>
      <aside className="hidden lg:flex flex-col w-[380px]">
        <ChatBox wellId={wellId} />
      </aside>
    </main>
  );
}