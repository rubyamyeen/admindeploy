import { createClient } from "@/lib/supabase/server";
import type { CaptionExample } from "@/types/database";
import CaptionExamplesTable from "./CaptionExamplesTable";

async function getData() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("caption_examples")
    .select("*")
    .order("priority", { ascending: false })
    .order("created_datetime_utc", { ascending: false });
  return (data ?? []) as CaptionExample[];
}

export default async function CaptionExamplesPage() {
  const data = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Caption Examples</h1>
        <span className="text-sm text-gray-500">{data.length} total</span>
      </div>

      <CaptionExamplesTable initialData={data} />
    </div>
  );
}
