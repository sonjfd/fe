export const FiltersBar: React.FC<{
  status: ContactStatus | 'ALL';
  setStatus: (s: ContactStatus | 'ALL') => void;
  search: string; setSearch: (v: string) => void;
  size: number; setSize: (n: number) => void;
}> = ({ status, setStatus, search, setSearch, size, setSize }) => {
  return (
    <div className="p-4 flex flex-wrap gap-3 items-center">
      <div className="flex gap-2 text-sm">
        {(['ALL','PENDING','READ','RESOLVED'] as const).map(s => (
          <button key={s}
            onClick={()=>setStatus(s)}
            className={`h-9 px-3 rounded-lg border ${status===s? 'border-indigo-300 bg-indigo-50 text-indigo-700':'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{s}</button>
        ))}
      </div>
      <div className="ml-auto flex gap-3 items-center">
        <div className="relative">
          <input value={search} onChange={e=>setSearch(e.target.value)}
            className="h-10 w-72 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Search name / email / subject" />
          <svg className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"/></svg>
        </div>
        <select value={size} onChange={e=>setSize(Number(e.target.value))}
          className="h-10 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm">
          {[10,20,50].map(n=> <option key={n} value={n}>{n}/page</option>)}
        </select>
      </div>
    </div>
  );
};
