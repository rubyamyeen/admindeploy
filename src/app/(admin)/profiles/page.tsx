import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/DataTable";
import type { Profile } from "@/types/database";

async function getProfiles() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_datetime_utc", { ascending: false });
  return (data ?? []) as Profile[];
}

export default async function ProfilesPage() {
  const profiles = await getProfiles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profiles</h1>
        <span className="text-sm text-gray-500">{profiles.length} total</span>
      </div>

      <DataTable
        data={profiles}
        columns={[
          {
            key: "email",
            label: "Email",
            render: (v) => <span className="font-medium">{String(v ?? "—")}</span>,
          },
          {
            key: "first_name",
            label: "Name",
            render: (_, row) => {
              const p = row as Profile;
              const name = [p.first_name, p.last_name].filter(Boolean).join(" ");
              return name || "—";
            },
          },
          {
            key: "id",
            label: "ID",
            render: (v) => <span className="font-mono text-xs">{String(v).slice(0, 8)}...</span>,
          },
          {
            key: "is_superadmin",
            label: "Roles",
            sortable: false,
            render: (_, row) => {
              const p = row as Profile;
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
            render: (v) => v ? new Date(String(v)).toLocaleDateString() : "—",
          },
        ]}
        searchKeys={["email", "first_name", "last_name"]}
      />
    </div>
  );
}
