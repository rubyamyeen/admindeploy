"use client";

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

interface ProfilesTableProps {
  initialData: ProfileRow[];
}

export default function ProfilesTable({ initialData }: ProfilesTableProps) {
  return (
    <DataTable
      data={initialData}
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
            if (p.is_superadmin) roles.push(<span key="sa" className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg">Superadmin</span>);
            if (p.is_matrix_admin) roles.push(<span key="ma" className="px-2 py-1 text-xs bg-violet-500/20 text-violet-400 rounded-lg">Matrix</span>);
            if (p.is_in_study) roles.push(<span key="is" className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg">Study</span>);
            return <div className="flex gap-1 flex-wrap">{roles.length > 0 ? roles : <span className="text-slate-500">—</span>}</div>;
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
  );
}
