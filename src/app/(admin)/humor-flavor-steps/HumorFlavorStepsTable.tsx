"use client";

import DataTable from "@/components/DataTable";

interface HumorFlavorStepRow {
  id: number;
  humor_flavor_id: number;
  order_by: number;
  description: string | null;
  llm_model_id: number;
  llm_temperature: number | null;
  humor_flavors: { slug: string } | null;
}

interface HumorFlavorStepsTableProps {
  initialData: HumorFlavorStepRow[];
}

export default function HumorFlavorStepsTable({ initialData }: HumorFlavorStepsTableProps) {
  return (
    <DataTable
      data={initialData}
      columns={[
        { key: "id", label: "ID", render: (v) => v != null ? String(v) : "—" },
        { key: "humor_flavors", label: "Flavor", sortable: false, render: (_, row) => {
          const r = row as HumorFlavorStepRow;
          return r.humor_flavors?.slug ?? "—";
        }},
        { key: "order_by", label: "Order", render: (v) => v != null ? String(v) : "—" },
        { key: "description", label: "Description", render: (v) => (
          <span className="max-w-xs truncate block">{v != null ? String(v) : "—"}</span>
        )},
        { key: "llm_model_id", label: "Model ID", render: (v) => v != null ? String(v) : "—" },
        { key: "llm_temperature", label: "Temp", render: (v) => v != null ? String(v) : "—" },
      ]}
      searchKeys={["description"]}
    />
  );
}
