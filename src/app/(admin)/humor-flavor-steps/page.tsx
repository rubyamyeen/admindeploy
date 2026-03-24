import { createClient } from "@/lib/supabase/server";
import HumorFlavorStepsTable from "./HumorFlavorStepsTable";

interface HumorFlavorStepRow {
  id: number;
  humor_flavor_id: number;
  order_by: number;
  description: string | null;
  llm_model_id: number;
  llm_temperature: number | null;
  humor_flavors: { slug: string } | null;
}

async function getData(): Promise<{ data: HumorFlavorStepRow[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("humor_flavor_steps")
      .select("id, humor_flavor_id, order_by, description, llm_model_id, llm_temperature, humor_flavors(slug)")
      .order("humor_flavor_id", { ascending: true })
      .order("order_by", { ascending: true });

    if (error) {
      console.error("[HumorFlavorSteps] Supabase query error:", error);
      return { data: [], error: error.message };
    }

    return { data: (data ?? []) as unknown as HumorFlavorStepRow[], error: null };
  } catch (err) {
    console.error("[HumorFlavorSteps] Unexpected error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export default async function HumorFlavorStepsPage() {
  const { data, error } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Humor Flavor Steps</h1>
        <span className="text-sm text-slate-400">{data.length} total</span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 font-medium">Failed to load humor flavor steps</p>
          <p className="text-red-400/80 text-sm mt-1">{error}</p>
        </div>
      )}

      <HumorFlavorStepsTable initialData={data} />
    </div>
  );
}
