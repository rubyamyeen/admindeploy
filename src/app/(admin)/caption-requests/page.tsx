import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/DataTable";
import type { CaptionRequest } from "@/types/database";

async function getData() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("caption_requests")
    .select("*, profiles(email)")
    .order("created_datetime_utc", { ascending: false })
    .limit(500);
  return (data ?? []) as (CaptionRequest & { profiles: { email: string } | null })[];
}

export default async function CaptionRequestsPage() {
  const data = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Caption Requests</h1>
        <span className="text-sm text-gray-500">{data.length} shown (max 500)</span>
      </div>

      <DataTable
        data={data}
        columns={[
          { key: "id", label: "ID" },
          { key: "profiles.email", label: "User", render: (_, row) =>
            (row as { profiles?: { email: string } | null }).profiles?.email ?? "—"
          },
          { key: "image_id", label: "Image ID", render: (v) => (
            <span className="font-mono text-xs">{String(v).slice(0, 8)}...</span>
          )},
          { key: "created_datetime_utc", label: "Created", render: (v) =>
            new Date(String(v)).toLocaleString()
          },
        ]}
        searchKeys={[]}
      />
    </div>
  );
}
