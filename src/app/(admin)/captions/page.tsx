import { createClient } from "@/lib/supabase/server";
import CaptionsTable from "./CaptionsTable";

interface CaptionRow {
  id: string;
  created_datetime_utc: string;
  content: string | null;
  is_public: boolean;
  is_featured: boolean;
  like_count: number;
  profile_id: string | null;
  humor_flavor_id: number | null;
}

async function getCaptions(): Promise<{ data: CaptionRow[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("captions")
      .select("id, created_datetime_utc, content, is_public, is_featured, like_count, profile_id, humor_flavor_id")
      .order("created_datetime_utc", { ascending: false })
      .limit(500);

    if (error) {
      console.error("[Captions] Supabase query error:", error);
      return { data: [], error: error.message };
    }

    return { data: (data ?? []) as CaptionRow[], error: null };
  } catch (err) {
    console.error("[Captions] Unexpected error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export default async function CaptionsPage() {
  const { data: captions, error } = await getCaptions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Captions</h1>
        <span className="text-sm text-gray-500">{captions.length} shown (max 500)</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Failed to load captions</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      <CaptionsTable initialData={captions} />
    </div>
  );
}
