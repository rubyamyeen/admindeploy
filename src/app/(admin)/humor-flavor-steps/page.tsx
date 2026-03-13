import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/DataTable";

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
        <h1 className="text-2xl font-bold text-gray-900">Humor Flavor Steps</h1>
        <span className="text-sm text-gray-500">{data.length} total</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Failed to load humor flavor steps</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      <DataTable
        data={data}
        columns={[
          { key: "id", label: "ID", render: (v) => v != null ? String(v) : "—" },
          { key: "humor_flavors", label: "Flavor", sortable: false, render: (_, row) => {
            const r = row as HumorFlavorStepRow;
            return r.humor_flavors?.slug ?? "—";
          }},
          { key: "order_by", label: "Order", render: (v) => v != null ? String(v) : "—" },
          { key: "description", label: "Description", render: (v) => (
            <span className="max-w-xs truncate block">{v != null ? String(v) : "—"}</span>
          )},
          { key: "llm_model_id", label: "Model ID", render: (v) => v != null ? String(v) : "—" },
          { key: "llm_temperature", label: "Temp", render: (v) => v != null ? String(v) : "—" },
        ]}
        searchKeys={["description"]}
      />
    </div>
  );
}
