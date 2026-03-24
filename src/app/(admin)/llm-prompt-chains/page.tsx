import { createClient } from "@/lib/supabase/server";
import LlmPromptChainsTable from "./LlmPromptChainsTable";

interface LlmPromptChainRow {
  id: number;
  created_datetime_utc: string;
  caption_request_id: number;
}

async function getData(): Promise<{ data: LlmPromptChainRow[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("llm_prompt_chains")
      .select("id, created_datetime_utc, caption_request_id")
      .order("created_datetime_utc", { ascending: false })
      .limit(500);

    if (error) {
      console.error("[LlmPromptChains] Supabase query error:", error);
      return { data: [], error: error.message };
    }

    return { data: (data ?? []) as LlmPromptChainRow[], error: null };
  } catch (err) {
    console.error("[LlmPromptChains] Unexpected error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export default async function LlmPromptChainsPage() {
  const { data, error } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">LLM Prompt Chains</h1>
        <span className="text-sm text-slate-400">{data.length} shown (max 500)</span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 font-medium">Failed to load prompt chains</p>
          <p className="text-red-400/80 text-sm mt-1">{error}</p>
        </div>
      )}

      <LlmPromptChainsTable initialData={data} />
    </div>
  );
}
