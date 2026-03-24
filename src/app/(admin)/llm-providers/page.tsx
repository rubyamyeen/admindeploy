import { createClient } from "@/lib/supabase/server";
import LlmProvidersTable from "./LlmProvidersTable";

interface LlmProviderRow {
  id: number;
  created_datetime_utc: string;
  name: string;
}

async function getData(): Promise<{ data: LlmProviderRow[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("llm_providers")
      .select("id, created_datetime_utc, name")
      .order("id", { ascending: true });

    if (error) {
      console.error("[LlmProviders] Supabase error:", error);
      console.error("[LlmProviders] Table: llm_providers");
      return { data: [], error: `Table: llm_providers - ${error.message}` };
    }

    return { data: (data ?? []) as LlmProviderRow[], error: null };
  } catch (err) {
    console.error("[LlmProviders] Unexpected error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export default async function LlmProvidersPage() {
  const { data, error } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">LLM Providers</h1>
        <span className="text-sm text-slate-400">{data.length} total</span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 font-medium">Failed to load data</p>
          <p className="text-red-400/80 text-sm mt-1 font-mono">{error}</p>
        </div>
      )}

      <LlmProvidersTable initialData={data} />
    </div>
  );
}
