import React, { useMemo, useState } from "react";

// ---------------------------------------------
// Types
// ---------------------------------------------

type RoleCardData = {
  id: string;
  name: string;
  totalUsers: number;
  avatars: string[]; // image urls
  extraCount?: number; // e.g. +4
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  plan: "Basic" | "Team" | "Enterprise" | "Company";
  billing: "Auto Debit" | "Manual - Cash" | "Manual - Paypal";
  status: "Active" | "Pending" | "Inactive";
};

type Permission = {
  id: string;
  label: string;
};

// ---------------------------------------------
// Mock Data
// ---------------------------------------------

const MOCK_ROLES: RoleCardData[] = [
  {
    id: "admin",
    name: "Administrator",
    totalUsers: 4,
    avatars: [5, 6, 7, 8].map((i) => `https://i.pravatar.cc/96?img=${i}`),
  },
  {
    id: "manager",
    name: "Manager",
    totalUsers: 7,
    avatars: [9, 10, 11].map((i) => `https://i.pravatar.cc/96?img=${i}`),
    extraCount: 4,
  },
  {
    id: "users",
    name: "Users",
    totalUsers: 5,
    avatars: [12, 13, 14].map((i) => `https://i.pravatar.cc/96?img=${i}`),
    extraCount: 2,
  },
  {
    id: "support",
    name: "Support",
    totalUsers: 3,
    avatars: [21, 22, 23].map((i) => `https://i.pravatar.cc/96?img=${i}`),
    extraCount: 3,
  },
  {
    id: "restricted",
    name: "Restricted User",
    totalUsers: 2,
    avatars: [24, 25].map((i) => `https://i.pravatar.cc/96?img=${i}`),
    extraCount: 7,
  },
];

const MOCK_USERS: UserRow[] = [
  {
    id: "u1",
    name: "Zsasza McCleverty",
    email: "@zmccleverty@soundcloud.com",
    avatar: "https://i.pravatar.cc/96?img=31",
    role: "Maintainer",
    plan: "Enterprise",
    billing: "Auto Debit",
    status: "Active",
  },
  {
    id: "u2",
    name: "Yoko Pottie",
    email: "@ypottie@privacy.gov.au",
    avatar: "https://i.pravatar.cc/96?img=32",
    role: "Subscriber",
    plan: "Basic",
    billing: "Auto Debit",
    status: "Inactive",
  },
  {
    id: "u3",
    name: "Wesley Burland",
    email: "@wburland@uiuc.edu",
    avatar: "https://i.pravatar.cc/96?img=33",
    role: "Editor",
    plan: "Team",
    billing: "Auto Debit",
    status: "Inactive",
  },
  {
    id: "u4",
    name: "Vladamir Koschek",
    email: "@vkoschek17@abc.net.au",
    avatar: "https://i.pravatar.cc/96?img=34",
    role: "Author",
    plan: "Team",
    billing: "Manual - Paypal",
    status: "Active",
  },
  {
    id: "u5",
    name: "Tyne Widmore",
    email: "@twidmore12@bravesites.com",
    avatar: "https://i.pravatar.cc/96?img=35",
    role: "Subscriber",
    plan: "Team",
    billing: "Manual - Cash",
    status: "Pending",
  },
  {
    id: "u6",
    name: "Travus Bruntjen",
    email: "@tbruntjen@site-meter.com",
    avatar: "https://i.pravatar.cc/96?img=36",
    role: "Admin",
    plan: "Enterprise",
    billing: "Manual - Cash",
    status: "Active",
  },
  {
    id: "u7",
    name: "Stu Delamaine",
    email: "@sdelamainek@who.int",
    avatar: "https://i.pravatar.cc/96?img=37",
    role: "Author",
    plan: "Basic",
    billing: "Auto Debit",
    status: "Pending",
  },
  {
    id: "u8",
    name: "Saunder Offner",
    email: "@soffner19@mac.com",
    avatar: "https://i.pravatar.cc/96?img=38",
    role: "Maintainer",
    plan: "Enterprise",
    billing: "Auto Debit",
    status: "Pending",
  },
  {
    id: "u9",
    name: "Stephen MacGilfoyle",
    email: "@smacgilfoyley@bigcartel.com",
    avatar: "https://i.pravatar.cc/96?img=39",
    role: "Maintainer",
    plan: "Company",
    billing: "Manual - Paypal",
    status: "Pending",
  },
  {
    id: "u10",
    name: "Skip Hebblethwaite",
    email: "@shebblethwaite10@arizona.edu",
    avatar: "https://i.pravatar.cc/96?img=40",
    role: "Admin",
    plan: "Company",
    billing: "Manual - Cash",
    status: "Inactive",
  },
];

const PERMISSIONS: Permission[] = [
  { id: "admin", label: "Administrator Access" },
  { id: "user_mgmt", label: "User Management" },
  { id: "content_mgmt", label: "Content Management" },
  { id: "disputes_mgmt", label: "Disputes Management" },
  { id: "db_mgmt", label: "Database Management" },
  { id: "financial_mgmt", label: "Financial Management" },
  { id: "reporting", label: "Reporting" },
  { id: "api_control", label: "API Control" },
  { id: "repo_mgmt", label: "Repository Management" },
  { id: "payroll", label: "Payroll" },
];

// ---------------------------------------------
// Small UI helpers
// ---------------------------------------------

const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const IconPlusSquare = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m4-4H8M3.75 7.5A3.75 3.75 0 0 1 7.5 3.75h9A3.75 3.75 0 0 1 20.25 7.5v9a3.75 3.75 0 0 1-3.75 3.75h-9A3.75 3.75 0 0 1 3.75 16.5v-9z"/>
  </svg>
);

const IconX = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
  </svg>
);

// ---------------------------------------------
// Role Card
// ---------------------------------------------

const RoleCard: React.FC<{ data: RoleCardData }> = ({ data }) => {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-500">Total {data.totalUsers} users</p>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
          <IconPlusSquare className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="-space-x-2 flex">
          {data.avatars.map((src, i) => (
            <img key={i} src={src} className="h-9 w-9 rounded-full ring-2 ring-white" />
          ))}
        </div>
        {data.extraCount ? (
          <span className="text-xs rounded-md px-2 py-0.5 font-medium border border-gray-300 text-gray-600">+{data.extraCount}</span>
        ) : null}
      </div>

      <h3 className="mt-6 text-xl font-semibold">{data.name}</h3>
      <a className="mt-2 inline-block text-indigo-600 hover:underline" href="#">Edit Role</a>
    </Card>
  );
};

// ---------------------------------------------
// Users Table
// ---------------------------------------------

const StatusPill: React.FC<{ status: UserRow["status"] }> = ({ status }) => {
  const cls =
    status === "Active"
      ? "border-green-200 text-green-700 bg-green-50"
      : status === "Pending"
      ? "border-amber-200 text-amber-700 bg-amber-50"
      : "border-gray-300 text-gray-600 bg-gray-50";
  return <span className={`text-xs rounded-md px-2 py-0.5 font-medium border ${cls}`}>{status}</span>;
};

const UsersTable: React.FC<{ rows: UserRow[] }> = ({ rows }) => {
  return (
    <Card>
      <div className="p-4 flex flex-wrap items-center gap-3">
        <div className="relative inline-flex items-center gap-2 rounded-lg border border-gray-200 h-10 px-3 hover:bg-gray-50">
          <span className="text-sm text-gray-600">10</span>
          <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.66a.75.75 0 01-1.08 0l-4.25-4.66a.75.75 0 01.02-1.06z"/></svg>
        </div>
        <div className="ml-auto flex gap-3">
          <div className="relative">
            <input className="h-10 w-60 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" placeholder="Search User" />
            <svg className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"/></svg>
          </div>
          <button className="relative inline-flex items-center gap-2 rounded-lg border border-gray-200 h-10 px-3 hover:bg-gray-50"><span className="text-sm text-gray-700">Select Role</span><svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.66a.75.75 0 01-1.08 0l-4.25-4.66a.75.75 0 01.02-1.06z"/></svg></button>
          <button className="relative inline-flex items-center gap-2 rounded-lg border border-gray-200 h-10 px-3 hover:bg-gray-50"><span className="text-sm text-gray-700">Select Plan</span><svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 011.08 1.04l-4.25 4.66a.75.75 0 01-1.08 0l-4.25-4.66a.75.75 0 01.02-1.06z"/></svg></button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/></th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">User</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Plan</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Billing</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={r.avatar} className="h-9 w-9 rounded-full" />
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-gray-500">{r.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"/>
                    <span>{r.role}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{r.plan}</td>
                <td className="px-6 py-4">{r.billing}</td>
                <td className="px-6 py-4"><StatusPill status={r.status} /></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 text-gray-500">
                    <button className="hover:text-gray-700" title="Delete">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m1 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h10z"/></svg>
                    </button>
                    <button className="hover:text-gray-700" title="View">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12S6 5.25 12 5.25 21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z"/><circle cx="12" cy="12" r="3.25"/></svg>
                    </button>
                    <button className="hover:text-gray-700" title="More">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2 p-4">
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200">‹</button>
        <button className="h-9 w-9 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600">1</button>
        {[2,3,4,5].map((n)=> (
          <button key={n} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200">{n}</button>
        ))}
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200">›</button>
      </div>
    </Card>
  );
};

// ---------------------------------------------
// Add Role Modal
// ---------------------------------------------

const AddRoleModal: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState(""); // optional field
  const [checked, setChecked] = useState<Record<string, { read: boolean; write: boolean; create: boolean }>>({});

  const allIds = useMemo(() => PERMISSIONS.map((p) => p.id), []);

  const toggleAll = (v: boolean) => {
    const next: typeof checked = {};
    allIds.forEach((id) => (next[id] = { read: v, write: v, create: v }));
    setChecked(next);
  };

  const toggle = (id: string, key: keyof (typeof checked)[string]) => {
    setChecked((prev) => ({
      ...prev,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [id]: { read: !!prev[id]?.read, write: !!prev[id]?.write, create: !!prev[id]?.create, [key]: !prev[id]?.[key] } as any,
    }));
  };

  const handleSubmit = () => {
    const payload = { roleName, description, permissions: checked };
    // For demo: log payload
    console.log("SUBMIT ROLE:", payload);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <Card className="relative mx-auto my-10 w-[92%] max-w-3xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="text-xl font-semibold">Add New Role</h3>
            <p className="text-sm text-gray-500">Set role permissions</p>
          </div>
          <button onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"><IconX className="h-5 w-5 text-gray-600"/></button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
            <input value={roleName} onChange={(e)=>setRoleName(e.target.value)} className="w-full h-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" placeholder="Enter a role name" />
          </div>

          {/* Optional description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400">(optional)</span></label>
            <textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={3} className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" placeholder="Short note about this role’s purpose…" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-800">Role Permissions</h4>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" onChange={(e)=>toggleAll(e.currentTarget.checked)} />
                <span>Select All</span>
              </label>
            </div>

            <div className="divide-y rounded-xl border border-gray-200">
              {PERMISSIONS.map((p) => (
                <div key={p.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3">
                  <div className="col-span-6 sm:col-span-5 font-medium text-gray-800">{p.label}</div>
                  <div className="col-span-2 hidden sm:block text-xs text-gray-500 uppercase">Read</div>
                  <div className="col-span-2 hidden sm:block text-xs text-gray-500 uppercase">Write</div>
                  <div className="col-span-2 hidden sm:block text-xs text-gray-500 uppercase">Create</div>
                  <div className="col-span-6 sm:col-span-7 grid grid-cols-3">
                    <label className="flex items-center gap-2"><input checked={!!checked[p.id]?.read} onChange={()=>toggle(p.id,'read')} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /><span className="sm:hidden text-sm">Read</span></label>
                    <label className="flex items-center gap-2"><input checked={!!checked[p.id]?.write} onChange={()=>toggle(p.id,'write')} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /><span className="sm:hidden text-sm">Write</span></label>
                    <label className="flex items-center gap-2"><input checked={!!checked[p.id]?.create} onChange={()=>toggle(p.id,'create')} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /><span className="sm:hidden text-sm">Create</span></label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-t flex items-center justify-end gap-3">
          <button onClick={onClose} className="inline-flex items-center justify-center rounded-lg px-4 h-10 font-medium border border-gray-200 bg-white hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} className="inline-flex items-center justify-center rounded-lg px-4 h-10 font-medium bg-indigo-600 text-white hover:bg-indigo-500">Submit</button>
        </div>
      </Card>
    </div>
  );
};

// ---------------------------------------------
// Page (default export)
// ---------------------------------------------

export default function RoleManagementPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10">
        {/* Roles */}
        <section className="space-y-3">
          <h1 className="text-3xl font-bold">Roles List</h1>
          <p className="text-sm text-gray-500">A role provided access to predefined menus and features so that depending on assigned role an administrator can have access to what user needs.</p>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
            {MOCK_ROLES.map((r) => (
              <RoleCard key={r.id} data={r} />
            ))}

            <Card className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 rounded-full bg-indigo-50 grid place-items-center">
                  <svg className="h-10 w-10 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m8.25-3a9.25 9.25 0 1 1-18.5 0 9.25 9.25 0 0 1 18.5 0Z"/></svg>
                </div>
                <div className="text-gray-600">
                  <p className="font-medium">Add new role,</p>
                  <p className="text-sm text-gray-500">if it doesn't exist.</p>
                </div>
              </div>
              <button onClick={() => setOpen(true)} className="inline-flex items-center justify-center rounded-lg px-4 h-10 font-medium bg-indigo-600 text-white hover:bg-indigo-500">Add New Role</button>
            </Card>
          </div>
        </section>

        {/* Users Table */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Total users with their roles</h2>
          <p className="text-sm text-gray-500">Find all of your company's administrator accounts and their associate roles.</p>
          <UsersTable rows={MOCK_USERS} />
          <p className="text-sm text-gray-500">Showing 1 to 10 of 50 entries</p>
        </section>
      </div>

      <AddRoleModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
