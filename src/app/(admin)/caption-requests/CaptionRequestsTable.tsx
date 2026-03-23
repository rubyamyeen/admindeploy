"use client";

import DataTable from "@/components/DataTable";

interface CaptionRequestRow {
  id: number;
  created_datetime_utc: string;
  profile_id: string;
  image_id: string;
  created_by_user_id: string | null;
  modified_by_user_id: string | null;
}

interface CaptionRequestsTableProps {
  initialData: CaptionRequestRow[];
}

export default function CaptionRequestsTable({ initialData }: CaptionRequestsTableProps) {
  return (
    <DataTable
      data={initialData}
      columns={[
        { key: "id", label: "ID", render: (v) => v != null ? String(v) : "—" },
        { key: "profile_id", label: "Profile ID", sortable: false, render: (v) => (
          <span className="font-mono text-xs">{v != null ? String(v).slice(0, 8) + "..." : "—"}</span>
        )},
        { key: "image_id", label: "Image ID", render: (v) => (
          <span className="font-mono text-xs">{v != null ? String(v).slice(0, 8) + "..." : "—"}</span>
        )},
        { key: "created_datetime_utc", label: "Created", render: (v) => {
          if (!v) return "—";
          try {
            return new Date(String(v)).toLocaleString();
          } catch {
            return "—";
          }
        }},
      ]}
      searchKeys={[]}
    />
  );
}
