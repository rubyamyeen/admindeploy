import { createClient } from "@/lib/supabase/server";
import type { Term } from "@/types/database";
import TermsTable from "./TermsTable";

async function getData() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("terms")
    .select("*")
    .order("priority", { ascending: false })
    .order("term", { ascending: true });
  return (data ?? []) as Term[];
}

export default async function TermsPage() {
  const data = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Terms</h1>
        <span className="text-sm text-gray-500">{data.length} total</span>
      </div>

      <TermsTable initialData={data} />
    </div>
  );
}
