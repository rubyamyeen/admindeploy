import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/DataTable";

interface ProfileRow {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  is_superadmin: boolean;
  is_matrix_admin: boolean;
  is_in_study: boolean;
  created_datetime_utc: string | null;
}

async function getProfiles(): Promise<{ data: ProfileRow[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name, is_superadmin, is_matrix_admin, is_in_study, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false });

    if (error) {
      console.error("[Profiles] Supabase query error:", error);
      return { data: [], error: error.message };
    }

    return { data: (data ?? []) as ProfileRow[], error: null };
  } catch (err) {
    console.error("[Profiles] Unexpected error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export default async function ProfilesPage() {
  const { data: profiles, error } = await getProfiles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profiles</h1>
        <span className="text-sm text-gray-500">{profiles.length} total</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Failed to load profiles</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      <DataTable
        data={profiles}
        columns={[
          {
            key: "email",
            label: "Email",
            render: (v) => <span className="font-medium">{v != null ? String(v) : "—"}</span>,
          },
          {
            key: "first_name",
            label: "Name",
            render: (_, row) => {
              const p = row as ProfileRow;
              const parts = [p.first_name, p.last_name].filter(Boolean);
              return parts.length > 0 ? parts.join(" ") : "—";
            },
          },
          {
            key: "id",
            label: "ID",
            render: (v) => <span className="font-mono text-xs">{v != null ? String(v).slice(0, 8) + "..." : "—"}</span>,
          },
          {
            key: "is_superadmin",
            label: "Roles",
            sortable: false,
            render: (_, row) => {
              const p = row as ProfileRow;
              const roles = [];
              if (p.is_superadmin) roles.push(<span key="sa" className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Superadmin</span>);
              if (p.is_matrix_admin) roles.push(<span key="ma" className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">Matrix</span>);
              if (p.is_in_study) roles.push(<span key="is" className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Study</span>);
              return <div className="flex gap-1 flex-wrap">{roles.length > 0 ? roles : <span className="text-gray-400">—</span>}</div>;
            },
          },
          {
            key: "created_datetime_utc",
            label: "Created",
            render: (v) => {
              if (!v) return "—";
              try {
                return new Date(String(v)).toLocaleDateString();
              } catch {
                return "—";
              }
            },
          },
        ]}
        searchKeys={["email", "first_name", "last_name"]}
      />
    </div>
  );
}
