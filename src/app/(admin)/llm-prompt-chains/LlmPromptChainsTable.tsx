"use client";

import DataTable from "@/components/DataTable";

interface LlmPromptChainRow {
  id: number;
  created_datetime_utc: string;
  caption_request_id: number;
}

interface LlmPromptChainsTableProps {
  initialData: LlmPromptChainRow[];
}

export default function LlmPromptChainsTable({ initialData }: LlmPromptChainsTableProps) {
  return (
    <DataTable
      data={initialData}
      columns={[
        { key: "id", label: "ID", render: (v) => v != null ? String(v) : "—" },
        { key: "caption_request_id", label: "Caption Request ID", render: (v) => v != null ? String(v) : "—" },
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
