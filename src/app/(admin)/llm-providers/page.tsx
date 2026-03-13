import { createClient } from "@/lib/supabase/server";
import type { LlmProvider } from "@/types/database";
import LlmProvidersTable from "./LlmProvidersTable";

async function getData() {
  const supabase = await createClient();
  const { data } = await supabase.from("llm_providers").select("*").order("id", { ascending: true });
  return (data ?? []) as LlmProvider[];
}

export default async function LlmProvidersPage() {
  const data = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">LLM Providers</h1>
        <span className="text-sm text-gray-500">{data.length} total</span>
      </div>
      <LlmProvidersTable initialData={data} />
    </div>
  );
}
