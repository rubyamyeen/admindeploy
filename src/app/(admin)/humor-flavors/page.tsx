import { createClient } from "@/lib/supabase/server";
import HumorFlavorsTable from "./HumorFlavorsTable";

interface HumorFlavorRow {
  id: number;
  slug: string;
  description: string | null;
  created_datetime_utc: string;
}

async function getData(): Promise<{ data: HumorFlavorRow[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("humor_flavors")
      .select("id, slug, description, created_datetime_utc")
      .order("id", { ascending: true });

    if (error) {
      console.error("[HumorFlavors] Supabase query error:", error);
      return { data: [], error: error.message };
    }

    return { data: (data ?? []) as HumorFlavorRow[], error: null };
  } catch (err) {
    console.error("[HumorFlavors] Unexpected error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export default async function HumorFlavorsPage() {
  const { data, error } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Humor Flavors</h1>
        <span className="text-sm text-slate-400">{data.length} total</span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 font-medium">Failed to load humor flavors</p>
          <p className="text-red-400/80 text-sm mt-1">{error}</p>
        </div>
      )}

      <HumorFlavorsTable initialData={data} />
    </div>
  );
}
