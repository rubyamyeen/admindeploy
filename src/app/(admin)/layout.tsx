import { requireSuperAdmin } from "@/lib/auth";
import AdminLayout from "@/components/AdminLayout";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, error } = await requireSuperAdmin();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
          <h1 className="text-xl font-bold text-red-700 mb-4">Admin Error</h1>
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-800 font-medium">Failed to load admin area</p>
            <p className="text-red-600 text-sm mt-2">{error}</p>
          </div>
          <p className="text-gray-600 text-sm mt-4">
            Check Vercel logs for more details.
          </p>
          <a
            href="/login"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return <AdminLayout userEmail={user?.email ?? "Unknown"}>{children}</AdminLayout>;
}
