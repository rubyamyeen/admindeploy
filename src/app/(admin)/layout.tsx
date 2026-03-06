import { requireSuperAdmin } from "@/lib/auth";
import AdminLayout from "@/components/AdminLayout";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireSuperAdmin();

  return <AdminLayout userEmail={user.email}>{children}</AdminLayout>;
}
