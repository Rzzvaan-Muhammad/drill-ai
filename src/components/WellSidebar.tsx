// src/components/WellSidebar.tsx
'use client';
const WELLS = [
  { id: 'well-a', name: 'Well A', depth: 5000 },
  { id: 'well-aa', name: 'Well AA', depth: 4500 },
  { id: 'well-aaa', name: 'Well AAA', depth: 5200 },
  { id: 'well-b', name: 'Well B', depth: 4800 },
];

export default function WellSidebar({ selected, onSelect }:{
  selected:string; onSelect:(id:string)=>void;
}) {
  return (
    <aside className="border-r overflow-auto">
      <div className="p-3 font-semibold">Well List</div>
      <ul className="px-2 pb-3 space-y-1">
        {WELLS.map(w => (
          <li key={w.id}>
            <button
              onClick={()=>onSelect(w.id)}
              className={`w-full text-left rounded-lg px-3 py-2 ${selected===w.id?'bg-blue-50 ring-1 ring-blue-200':''}`}
            >
              <div className="font-medium">{w.name}</div>
              <div className="text-sm text-gray-500">Depth: {w.depth} ft</div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}