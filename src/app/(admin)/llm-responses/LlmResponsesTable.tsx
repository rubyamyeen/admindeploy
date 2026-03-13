"use client";

import DataTable from "@/components/DataTable";

interface LlmModelResponseRow {
  id: string;
  created_datetime_utc: string;
  llm_model_response: string | null;
  processing_time_seconds: number | null;
  llm_models: { name: string } | null;
  humor_flavors: { slug: string } | null;
}

interface LlmResponsesTableProps {
  initialData: LlmModelResponseRow[];
}

export default function LlmResponsesTable({ initialData }: LlmResponsesTableProps) {
  return (
    <DataTable
      data={initialData}
      columns={[
        { key: "id", label: "ID", render: (v) => (
          <span className="font-mono text-xs">{v != null ? String(v).slice(0, 8) + "..." : "—"}</span>
        )},
        { key: "llm_models", label: "Model", sortable: false, render: (_, row) => {
          const r = row as LlmModelResponseRow;
          return r.llm_models?.name ?? "—";
        }},
        { key: "humor_flavors", label: "Flavor", sortable: false, render: (_, row) => {
          const r = row as LlmModelResponseRow;
          return r.humor_flavors?.slug ?? "—";
        }},
        { key: "processing_time_seconds", label: "Time (s)", render: (v) => v != null ? String(v) : "—" },
        { key: "llm_model_response", label: "Response", render: (v) => (
          <span className="max-w-xs truncate block text-xs">{v != null ? String(v).slice(0, 100) : "—"}</span>
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
