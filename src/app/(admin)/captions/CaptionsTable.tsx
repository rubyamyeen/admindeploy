"use client";

import DataTable from "@/components/DataTable";

interface CaptionRow {
  id: string;
  created_datetime_utc: string;
  content: string | null;
  is_public: boolean;
  is_featured: boolean;
  like_count: number;
  profile_id: string | null;
  humor_flavor_id: number | null;
}

interface CaptionsTableProps {
  initialData: CaptionRow[];
}

export default function CaptionsTable({ initialData }: CaptionsTableProps) {
  return (
    <DataTable
      data={initialData}
      columns={[
        {
          key: "content",
          label: "Content",
          render: (v) => (
            <span className="max-w-md block truncate">{v != null ? String(v) : "—"}</span>
          ),
        },
        {
          key: "profile_id",
          label: "Profile ID",
          sortable: false,
          render: (v) => (
            <span className="font-mono text-xs">{v != null ? String(v).slice(0, 8) + "..." : "—"}</span>
          ),
        },
        {
          key: "humor_flavor_id",
          label: "Flavor ID",
          render: (v) => v != null ? String(v) : "—",
        },
        {
          key: "like_count",
          label: "Likes",
          render: (v) => v != null ? String(v) : "0",
        },
        {
          key: "is_public",
          label: "Flags",
          sortable: false,
          render: (_, row) => {
            const c = row as CaptionRow;
            const flags = [];
            if (c.is_public) flags.push(<span key="p" className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-lg">Public</span>);
            if (c.is_featured) flags.push(<span key="f" className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-lg">Featured</span>);
            return <div className="flex gap-1">{flags.length > 0 ? flags : <span className="text-slate-500">—</span>}</div>;
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
      searchKeys={["content"]}
    />
  );
}
