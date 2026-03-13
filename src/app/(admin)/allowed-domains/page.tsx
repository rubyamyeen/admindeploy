import { createClient } from "@/lib/supabase/server";
import type { AllowedSignupDomain } from "@/types/database";
import AllowedDomainsTable from "./AllowedDomainsTable";

async function getData() {
  const supabase = await createClient();
  const { data } = await supabase.from("allowed_signup_domains").select("*").order("apex_domain", { ascending: true });
  return (data ?? []) as AllowedSignupDomain[];
}

export default async function AllowedDomainsPage() {
  const data = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Allowed Signup Domains</h1>
        <span className="text-sm text-gray-500">{data.length} total</span>
      </div>
      <AllowedDomainsTable initialData={data} />
    </div>
  );
}
