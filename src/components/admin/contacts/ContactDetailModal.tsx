import { StatusPill } from "./StatusPill";

export const ContactDetailModal: React.FC<{ open: boolean; item?: ContactMessage | null; onClose: () => void }>
= ({ open, item, onClose }) => {
  if (!open || !item) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-auto my-10 max-w-2xl w-[92%] bg-white rounded-2xl border border-gray-200 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">Contact Detail</h3>
            <p className="text-sm text-gray-500">#{item.id}</p>
          </div>
          <button onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
            <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Full name</span><div className="font-medium">{item.full_name}</div></div>
            <div><span className="text-gray-500">Email</span><div className="font-medium">{item.email}</div></div>
            {item.phone && (<div><span className="text-gray-500">Phone</span><div className="font-medium">{item.phone}</div></div>)}
            <div><span className="text-gray-500">Status</span><div className="mt-1"><StatusPill status={item.status} /></div></div>
            <div><span className="text-gray-500">Created</span><div className="font-medium">{new Date(item.created_at).toLocaleString()}</div></div>
            <div><span className="text-gray-500">Updated</span><div className="font-medium">{new Date(item.updated_at).toLocaleString()}</div></div>
          </div>
          {item.subject && (
            <div>
              <div className="text-sm text-gray-500">Subject</div>
              <div className="font-medium">{item.subject}</div>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-500">Message</div>
            <div className="whitespace-pre-wrap leading-relaxed border rounded-lg p-3 bg-gray-50 text-gray-800">{item.message}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

