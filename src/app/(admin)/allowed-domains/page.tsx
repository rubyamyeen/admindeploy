import { createClient } from "@/lib/supabase/server";
import AllowedDomainsTable from "./AllowedDomainsTable";

interface AllowedSignupDomainRow {
  id: number;
  created_datetime_utc: string;
  apex_domain: string;
}

async function getData(): Promise<{ data: AllowedSignupDomainRow[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("allowed_signup_domains")
      .select("id, created_datetime_utc, apex_domain")
      .order("apex_domain", { ascending: true });

    if (error) {
      console.error("[AllowedDomains] Supabase error:", error);
      console.error("[AllowedDomains] Table: allowed_signup_domains");
      return { data: [], error: `Table: allowed_signup_domains - ${error.message}` };
    }

    return { data: (data ?? []) as AllowedSignupDomainRow[], error: null };
  } catch (err) {
    console.error("[AllowedDomains] Unexpected error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export default async function AllowedDomainsPage() {
  const { data, error } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Allowed Signup Domains</h1>
        <span className="text-sm text-slate-400">{data.length} total</span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 font-medium">Failed to load data</p>
          <p className="text-red-400/80 text-sm mt-1 font-mono">{error}</p>
        </div>
      )}

      <AllowedDomainsTable initialData={data} />
    </div>
  );
}
