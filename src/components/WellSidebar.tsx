// src/components/WellSidebar.tsx
'use client';
import { useState } from 'react';
const WELLS = [
  { id: 'well-a', name: 'Well A', depth: 5000 },
  { id: 'well-aa', name: 'Well AA', depth: 4500 },
  { id: 'well-aaa', name: 'Well AAA', depth: 5200 },
  { id: 'well-b', name: 'Well B', depth: 4800 },
];

export default function WellSidebar({ selected, onSelect, className }:{
  selected:string; onSelect:(id:string)=>void; className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="sm:hidden p-2 m-2 border rounded"
        onClick={() => setIsOpen(true)}
        aria-label="Open sidebar"
      >
        ☰
      </button>
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r overflow-auto transform transition-transform duration-300 ease-in-out z-50
          ${className ? ' ' + className : ''}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:translate-x-0 sm:static sm:block sm:h-auto sm:w-auto`}
      >
        <div className="p-3 font-semibold flex justify-between items-center">
          Well List
          <button
            className="sm:hidden text-xl font-bold"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <ul className="px-2 pb-3 space-y-1">
          {WELLS.map(w => (
            <li key={w.id}>
              <button
                onClick={() => {
                  onSelect(w.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left rounded-lg px-3 py-2 ${selected===w.id?'bg-blue-50 ring-1 ring-blue-200':''}`}
              >
                <div className="font-medium">{w.name}</div>
                <div className="text-sm text-gray-500">Depth: {w.depth} ft</div>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}