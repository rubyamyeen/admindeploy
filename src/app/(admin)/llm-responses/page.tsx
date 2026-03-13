import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/DataTable";

interface LlmModelResponseRow {
  id: string;
  created_datetime_utc: string;
  llm_model_response: string | null;
  processing_time_seconds: number | null;
  llm_models: { name: string } | null;
  humor_flavors: { slug: string } | null;
}

async function getData(): Promise<{ data: LlmModelResponseRow[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("llm_model_responses")
      .select("id, created_datetime_utc, llm_model_response, processing_time_seconds, llm_models(name), humor_flavors(slug)")
      .order("created_datetime_utc", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[LlmModelResponses] Supabase query error:", error);
      return { data: [], error: error.message };
    }

    return { data: (data ?? []) as unknown as LlmModelResponseRow[], error: null };
  } catch (err) {
    console.error("[LlmModelResponses] Unexpected error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export default async function LlmResponsesPage() {
  const { data, error } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">LLM Responses</h1>
        <span className="text-sm text-gray-500">{data.length} shown (max 200)</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Failed to load LLM responses</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      <DataTable
        data={data}
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
    </div>
  );
}
