import { createClient } from "@/lib/supabase/server";
import WhitelistedEmailsTable from "./WhitelistedEmailsTable";

interface WhitelistedEmailRow {
  id: number;
  created_datetime_utc: string;
  email_address: string;
}

async function getData(): Promise<{ data: WhitelistedEmailRow[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("whitelist_email_addresses")
      .select("id, created_datetime_utc, email_address")
      .order("email_address", { ascending: true });

    if (error) {
      console.error("[WhitelistedEmails] Supabase error:", error);
      console.error("[WhitelistedEmails] Table: whitelist_email_addresses");
      return { data: [], error: `Table: whitelist_email_addresses - ${error.message}` };
    }

    return { data: (data ?? []) as WhitelistedEmailRow[], error: null };
  } catch (err) {
    console.error("[WhitelistedEmails] Unexpected error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export default async function WhitelistedEmailsPage() {
  const { data, error } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Whitelisted Email Addresses</h1>
        <span className="text-sm text-slate-400">{data.length} total</span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 font-medium">Failed to load data</p>
          <p className="text-red-400/80 text-sm mt-1 font-mono">{error}</p>
        </div>
      )}

      <WhitelistedEmailsTable initialData={data} />
    </div>
  );
}
