import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/DataTable";
import type { HumorFlavorStep } from "@/types/database";

async function getData() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("humor_flavor_steps")
    .select("*, humor_flavors(slug)")
    .order("humor_flavor_id", { ascending: true })
    .order("order_by", { ascending: true });
  return (data ?? []) as (HumorFlavorStep & { humor_flavors: { slug: string } | null })[];
}

export default async function HumorFlavorStepsPage() {
  const data = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Humor Flavor Steps</h1>
        <span className="text-sm text-gray-500">{data.length} total</span>
      </div>

      <DataTable
        data={data}
        columns={[
          { key: "id", label: "ID" },
          { key: "humor_flavors.slug", label: "Flavor", render: (_, row) =>
            (row as { humor_flavors?: { slug: string } | null }).humor_flavors?.slug ?? "—"
          },
          { key: "order_by", label: "Order" },
          { key: "description", label: "Description", render: (v) => (
            <span className="max-w-xs truncate block">{String(v ?? "—")}</span>
          )},
          { key: "llm_model_id", label: "Model ID" },
          { key: "llm_temperature", label: "Temp", render: (v) => v != null ? String(v) : "—" },
        ]}
        searchKeys={["description"]}
      />
    </div>
  );
}
