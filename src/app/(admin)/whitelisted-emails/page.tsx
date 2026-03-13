import { createClient } from "@/lib/supabase/server";
import type { WhitelistedEmailAddress } from "@/types/database";
import WhitelistedEmailsTable from "./WhitelistedEmailsTable";

async function getData() {
  const supabase = await createClient();
  const { data } = await supabase.from("whitelisted_email_addresses").select("*").order("email", { ascending: true });
  return (data ?? []) as WhitelistedEmailAddress[];
}

export default async function WhitelistedEmailsPage() {
  const data = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Whitelisted Email Addresses</h1>
        <span className="text-sm text-gray-500">{data.length} total</span>
      </div>
      <WhitelistedEmailsTable initialData={data} />
    </div>
  );
}
