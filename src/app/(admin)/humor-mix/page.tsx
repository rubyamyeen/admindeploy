import { createClient } from "@/lib/supabase/server";
import HumorMixTable from "./HumorMixTable";

interface HumorFlavorMixRow {
  id: number;
  created_datetime_utc: string;
  humor_flavor_id: number;
  caption_count: number;
  humor_flavors: { slug: string } | null;
}

interface HumorFlavorOption {
  id: number;
  slug: string;
}

async function getData(): Promise<{
  mix: HumorFlavorMixRow[];
  flavors: HumorFlavorOption[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const [mixResult, flavorsResult] = await Promise.all([
      supabase
        .from("humor_flavor_mix")
        .select("id, created_datetime_utc, humor_flavor_id, caption_count, humor_flavors(slug)")
        .order("id", { ascending: true }),
      supabase.from("humor_flavors").select("id, slug").order("slug"),
    ]);

    if (mixResult.error) {
      console.error("[HumorMix] Supabase mix query error:", mixResult.error);
      return { mix: [], flavors: [], error: mixResult.error.message };
    }

    if (flavorsResult.error) {
      console.error("[HumorMix] Supabase flavors query error:", flavorsResult.error);
      return { mix: [], flavors: [], error: flavorsResult.error.message };
    }

    return {
      mix: (mixResult.data ?? []) as unknown as HumorFlavorMixRow[],
      flavors: (flavorsResult.data ?? []) as unknown as HumorFlavorOption[],
      error: null,
    };
  } catch (err) {
    console.error("[HumorMix] Unexpected error:", err);
    return { mix: [], flavors: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export default async function HumorMixPage() {
  const { mix, flavors, error } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Humor Mix</h1>
        <span className="text-sm text-gray-500">{mix.length} total</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Failed to load humor mix</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      <HumorMixTable data={mix} flavors={flavors} />
    </div>
  );
}
