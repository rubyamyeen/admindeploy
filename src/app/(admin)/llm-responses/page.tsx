import { createClient } from "@/lib/supabase/server";
import LlmResponsesTable from "./LlmResponsesTable";

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
        <h1 className="text-2xl font-bold text-white">LLM Responses</h1>
        <span className="text-sm text-slate-400">{data.length} shown (max 200)</span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 font-medium">Failed to load LLM responses</p>
          <p className="text-red-400/80 text-sm mt-1">{error}</p>
        </div>
      )}

      <LlmResponsesTable initialData={data} />
    </div>
  );
}
