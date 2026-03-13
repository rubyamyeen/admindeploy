import { createClient } from "@/lib/supabase/server";
import type { LlmModel, LlmProvider } from "@/types/database";
import LlmModelsTable from "./LlmModelsTable";

async function getData() {
  const supabase = await createClient();
  const [{ data: models }, { data: providers }] = await Promise.all([
    supabase.from("llm_models").select("*, llm_providers(name)").order("id", { ascending: true }),
    supabase.from("llm_providers").select("id, name").order("name"),
  ]);
  return {
    models: (models ?? []) as (LlmModel & { llm_providers: { name: string } | null })[],
    providers: (providers ?? []) as Pick<LlmProvider, "id" | "name">[],
  };
}

export default async function LlmModelsPage() {
  const { models, providers } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">LLM Models</h1>
        <span className="text-sm text-gray-500">{models.length} total</span>
      </div>
      <LlmModelsTable initialData={models} providers={providers} />
    </div>
  );
}
