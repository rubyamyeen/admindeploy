import { createClient } from "@/lib/supabase/server";
import LlmModelsTable from "./LlmModelsTable";

interface LlmModelRow {
  id: number;
  created_datetime_utc: string;
  name: string;
  llm_provider_id: number;
  provider_model_id: string;
  is_temperature_supported: boolean;
  llm_providers: { name: string } | null;
}

interface LlmProviderOption {
  id: number;
  name: string;
}

async function getData(): Promise<{
  models: LlmModelRow[];
  providers: LlmProviderOption[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const [modelsResult, providersResult] = await Promise.all([
      supabase.from("llm_models").select("id, created_datetime_utc, name, llm_provider_id, provider_model_id, is_temperature_supported, llm_providers(name)").order("id", { ascending: true }),
      supabase.from("llm_providers").select("id, name").order("name"),
    ]);

    if (modelsResult.error) {
      console.error("[LlmModels] Supabase error:", modelsResult.error);
      console.error("[LlmModels] Table: llm_models");
      return { models: [], providers: [], error: `Table: llm_models - ${modelsResult.error.message}` };
    }

    if (providersResult.error) {
      console.error("[LlmModels] Providers error:", providersResult.error);
      return { models: [], providers: [], error: `Table: llm_providers - ${providersResult.error.message}` };
    }

    return {
      models: (modelsResult.data ?? []) as unknown as LlmModelRow[],
      providers: (providersResult.data ?? []) as LlmProviderOption[],
      error: null,
    };
  } catch (err) {
    console.error("[LlmModels] Unexpected error:", err);
    return { models: [], providers: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export default async function LlmModelsPage() {
  const { models, providers, error } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">LLM Models</h1>
        <span className="text-sm text-slate-400">{models.length} total</span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 font-medium">Failed to load data</p>
          <p className="text-red-400/80 text-sm mt-1 font-mono">{error}</p>
        </div>
      )}

      <LlmModelsTable initialData={models} providers={providers} />
    </div>
  );
}
