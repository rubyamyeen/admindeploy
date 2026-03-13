import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/DataTable";
import type { LlmModelResponse } from "@/types/database";

async function getData() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("llm_model_responses")
    .select("*, llm_models(name), humor_flavors(slug)")
    .order("created_datetime_utc", { ascending: false })
    .limit(200);
  return (data ?? []) as (LlmModelResponse & {
    llm_models: { name: string } | null;
    humor_flavors: { slug: string } | null;
  })[];
}

export default async function LlmResponsesPage() {
  const data = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">LLM Responses</h1>
        <span className="text-sm text-gray-500">{data.length} shown (max 200)</span>
      </div>

      <DataTable
        data={data}
        columns={[
          { key: "id", label: "ID", render: (v) => (
            <span className="font-mono text-xs">{String(v).slice(0, 8)}...</span>
          )},
          { key: "llm_models.name", label: "Model", render: (_, row) =>
            (row as { llm_models?: { name: string } | null }).llm_models?.name ?? "—"
          },
          { key: "humor_flavors.slug", label: "Flavor", render: (_, row) =>
            (row as { humor_flavors?: { slug: string } | null }).humor_flavors?.slug ?? "—"
          },
          { key: "processing_time_seconds", label: "Time (s)" },
          { key: "llm_model_response", label: "Response", render: (v) => (
            <span className="max-w-xs truncate block text-xs">{String(v ?? "—").slice(0, 100)}</span>
          )},
          { key: "created_datetime_utc", label: "Created", render: (v) =>
            new Date(String(v)).toLocaleString()
          },
        ]}
        searchKeys={[]}
      />
    </div>
  );
}
