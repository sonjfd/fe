import { ContactTable } from "@/components/admin/contacts/ContactTable";

const PageCard: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <div className={`max-w-7xl mx-auto p-6 lg:p-10 ${className}`}>{children}</div>
);

export default function AdminContactsPage() {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      <PageCard>
        <h1 className="text-3xl font-bold">Danh sách liên hệ</h1>
        <div className="mt-6">
          <ContactTable />
        </div>
      </PageCard>
    </div>
  );
}
