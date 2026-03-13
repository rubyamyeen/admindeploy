import { createClient } from "@/lib/supabase/server";
import type { HumorFlavorMix, HumorFlavor } from "@/types/database";
import HumorMixTable from "./HumorMixTable";

async function getData() {
  const supabase = await createClient();
  const [{ data: mix }, { data: flavors }] = await Promise.all([
    supabase
      .from("humor_flavor_mix")
      .select("*, humor_flavors(slug)")
      .order("id", { ascending: true }),
    supabase.from("humor_flavors").select("id, slug").order("slug"),
  ]);
  return {
    mix: (mix ?? []) as (HumorFlavorMix & { humor_flavors: { slug: string } | null })[],
    flavors: (flavors ?? []) as Pick<HumorFlavor, "id" | "slug">[],
  };
}

export default async function HumorMixPage() {
  const { mix, flavors } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Humor Mix</h1>
        <span className="text-sm text-gray-500">{mix.length} total</span>
      </div>

      <HumorMixTable data={mix} flavors={flavors} />
    </div>
  );
}
