import { createClient } from "@/lib/supabase/server";
import CaptionRequestsTable from "./CaptionRequestsTable";

interface CaptionRequestRow {
  id: number;
  created_datetime_utc: string;
  profile_id: string;
  image_id: string;
  profiles: { email: string | null } | null;
}

async function getData(): Promise<{ data: CaptionRequestRow[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("caption_requests")
      .select("id, created_datetime_utc, profile_id, image_id, profiles(email)")
      .order("created_datetime_utc", { ascending: false })
      .limit(500);

    if (error) {
      console.error("[CaptionRequests] Supabase query error:", error);
      return { data: [], error: error.message };
    }

    return { data: (data ?? []) as unknown as CaptionRequestRow[], error: null };
  } catch (err) {
    console.error("[CaptionRequests] Unexpected error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export default async function CaptionRequestsPage() {
  const { data, error } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Caption Requests</h1>
        <span className="text-sm text-gray-500">{data.length} shown (max 500)</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Failed to load caption requests</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      <CaptionRequestsTable initialData={data} />
    </div>
  );
}
