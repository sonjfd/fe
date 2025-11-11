

export const StatusPill: React.FC<{ status: ContactStatus }> = ({ status }) => {
  const cls = status === 'PENDING'
    ? 'border-amber-200 text-amber-700 bg-amber-50'
    : status === 'READ'
    ? 'border-sky-200 text-sky-700 bg-sky-50'
    : 'border-emerald-200 text-emerald-700 bg-emerald-50';
  return <span className={`text-xs rounded-md px-2 py-0.5 font-medium border ${cls}`}>{status}</span>;
};
