import { createClient } from "@/lib/supabase/server";
import TermsTable from "./TermsTable";

interface TermRow {
  id: number;
  created_datetime_utc: string;
  modified_datetime_utc: string | null;
  term: string;
  definition: string;
  example: string;
  priority: number;
  term_type_id: number | null;
}

async function getData(): Promise<{ data: TermRow[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("terms")
      .select("id, created_datetime_utc, modified_datetime_utc, term, definition, example, priority, term_type_id")
      .order("priority", { ascending: false })
      .order("term", { ascending: true });

    if (error) {
      console.error("[Terms] Supabase error:", error);
      console.error("[Terms] Table: terms");
      return { data: [], error: `Table: terms - ${error.message}` };
    }

    return { data: (data ?? []) as TermRow[], error: null };
  } catch (err) {
    console.error("[Terms] Unexpected error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export default async function TermsPage() {
  const { data, error } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Terms</h1>
        <span className="text-sm text-slate-400">{data.length} total</span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 font-medium">Failed to load data</p>
          <p className="text-red-400/80 text-sm mt-1 font-mono">{error}</p>
        </div>
      )}

      <TermsTable initialData={data} />
    </div>
  );
}
