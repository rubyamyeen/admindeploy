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

// Color mapping for flavor badges
const flavorColors: Record<string, { bg: string; text: string }> = {
  witty: { bg: "bg-violet-500/20", text: "text-violet-400" },
  sarcastic: { bg: "bg-amber-500/20", text: "text-amber-400" },
  punny: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  absurd: { bg: "bg-pink-500/20", text: "text-pink-400" },
  deadpan: { bg: "bg-slate-500/20", text: "text-slate-400" },
  observational: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
  dark: { bg: "bg-red-500/20", text: "text-red-400" },
  wholesome: { bg: "bg-green-500/20", text: "text-green-400" },
  clever: { bg: "bg-blue-500/20", text: "text-blue-400" },
  silly: { bg: "bg-orange-500/20", text: "text-orange-400" },
};

const getFlavorStyle = (slug: string | undefined) => {
  if (!slug) return { bg: "bg-slate-500/20", text: "text-slate-400" };
  const lower = slug.toLowerCase();
  return flavorColors[lower] || { bg: "bg-violet-500/20", text: "text-violet-400" };
};

export default function HumorFlavorStepsTable({ initialData }: HumorFlavorStepsTableProps) {
  return (
    <DataTable
      data={initialData}
      columns={[
        { key: "id", label: "ID", render: (v) => v != null ? String(v) : "—" },
        { key: "humor_flavors", label: "Flavor", sortable: false, render: (_, row) => {
          const r = row as HumorFlavorStepRow;
          const slug = r.humor_flavors?.slug;
          const style = getFlavorStyle(slug);
          return (
            <span className={`px-2 py-1 ${style.bg} ${style.text} rounded text-xs`}>
              {slug ?? "—"}
            </span>
          );
        }},
        { key: "order_by", label: "Order", render: (v) => (
          <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
            {v != null ? String(v) : "—"}
          </span>
        )},
        { key: "description", label: "Description", render: (v) => (
          <span className="max-w-xs truncate block text-slate-300">{v != null ? String(v) : "—"}</span>
        )},
        { key: "llm_model_id", label: "Model ID", render: (v) => (
          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
            {v != null ? String(v) : "—"}
          </span>
        )},
        { key: "llm_temperature", label: "Temp", render: (v) => (
          <span className="text-slate-400">{v != null ? String(v) : "—"}</span>
        )},
      ]}
      searchKeys={["description"]}
    />
  );
}
