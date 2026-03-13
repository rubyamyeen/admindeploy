"use client";

import DataTable from "@/components/DataTable";

interface HumorFlavorRow {
  id: number;
  slug: string;
  description: string | null;
  created_datetime_utc: string;
}

interface HumorFlavorsTableProps {
  initialData: HumorFlavorRow[];
}

export default function HumorFlavorsTable({ initialData }: HumorFlavorsTableProps) {
  return (
    <DataTable
      data={initialData}
      columns={[
        { key: "id", label: "ID", render: (v) => v != null ? String(v) : "—" },
        { key: "slug", label: "Slug", render: (v) => v != null ? String(v) : "—" },
        { key: "description", label: "Description", render: (v) => (
          <span className="max-w-md truncate block">{v != null ? String(v) : "—"}</span>
        )},
        { key: "created_datetime_utc", label: "Created", render: (v) => {
          if (!v) return "—";
          try {
            return new Date(String(v)).toLocaleDateString();
          } catch {
            return "—";
          }
        }},
      ]}
      searchKeys={["slug", "description"]}
    />
  );
}
