import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/DataTable";
import type { LlmPromptChain } from "@/types/database";

async function getData() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("llm_prompt_chains")
    .select("*")
    .order("created_datetime_utc", { ascending: false })
    .limit(500);
  return (data ?? []) as LlmPromptChain[];
}

export default async function LlmPromptChainsPage() {
  const data = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">LLM Prompt Chains</h1>
        <span className="text-sm text-gray-500">{data.length} shown (max 500)</span>
      </div>

      <DataTable
        data={data}
        columns={[
          { key: "id", label: "ID" },
          { key: "caption_request_id", label: "Caption Request ID" },
          { key: "created_datetime_utc", label: "Created", render: (v) =>
            new Date(String(v)).toLocaleString()
          },
        ]}
        searchKeys={[]}
      />
    </div>
  );
}
