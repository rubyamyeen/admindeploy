import { createClient } from "@/lib/supabase/server";
import ImageTable from "./ImageTable";

interface ImageRow {
  id: string;
  created_datetime_utc: string;
  modified_datetime_utc: string | null;
  url: string | null;
  is_common_use: boolean;
  profile_id: string | null;
  additional_context: string | null;
  is_public: boolean;
  image_description: string | null;
  celebrity_recognition: string | null;
}

async function getImages(): Promise<{ data: ImageRow[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("images")
      .select("id, created_datetime_utc, modified_datetime_utc, url, is_common_use, profile_id, additional_context, is_public, image_description, celebrity_recognition")
      .order("created_datetime_utc", { ascending: false });

    if (error) {
      console.error("[Images] Supabase error:", error);
      console.error("[Images] Table: images");
      return { data: [], error: `Table: images - ${error.message}` };
    }

    return { data: (data ?? []) as ImageRow[], error: null };
  } catch (err) {
    console.error("[Images] Unexpected error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export default async function ImagesPage() {
  const { data: images, error } = await getImages();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Images</h1>
        <span className="text-sm text-slate-400">{images.length} total</span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 font-medium">Failed to load data</p>
          <p className="text-red-400/80 text-sm mt-1 font-mono">{error}</p>
        </div>
      )}

      <ImageTable initialImages={images} />
    </div>
  );
}
