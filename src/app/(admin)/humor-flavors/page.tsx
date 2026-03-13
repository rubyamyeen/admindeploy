import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/DataTable";
import type { HumorFlavor } from "@/types/database";

async function getData() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("humor_flavors")
    .select("*")
    .order("id", { ascending: true });
  return (data ?? []) as HumorFlavor[];
}

export default async function HumorFlavorsPage() {
  const data = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Humor Flavors</h1>
        <span className="text-sm text-gray-500">{data.length} total</span>
      </div>

      <DataTable
        data={data}
        columns={[
          { key: "id", label: "ID" },
          { key: "slug", label: "Slug" },
          { key: "description", label: "Description", render: (v) => (
            <span className="max-w-md truncate block">{String(v ?? "—")}</span>
          )},
          { key: "created_datetime_utc", label: "Created", render: (v) =>
            new Date(String(v)).toLocaleDateString()
          },
        ]}
        searchKeys={["slug", "description"]}
      />
    </div>
  );
}
