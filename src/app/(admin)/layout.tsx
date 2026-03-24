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
      <div className="min-h-screen bg-[#0f1623] flex items-center justify-center p-4">
        <div className="bg-[#1a2332] rounded-xl border border-slate-800 p-6 max-w-lg w-full">
          <h1 className="text-xl font-bold text-red-400 mb-4">Admin Error</h1>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 font-medium">Failed to load admin area</p>
            <p className="text-red-400/80 text-sm mt-2">{error}</p>
          </div>
          <p className="text-slate-400 text-sm mt-4">
            Check Vercel logs for more details.
          </p>
          <a
            href="/login"
            className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return <AdminLayout userEmail={user?.email ?? "Unknown"}>{children}</AdminLayout>;
}
