import { createClient } from "@/lib/supabase/server";
import CaptionExamplesTable from "./CaptionExamplesTable";

interface CaptionExampleRow {
  id: number;
  created_datetime_utc: string;
  modified_datetime_utc: string | null;
  image_description: string;
  caption: string;
  explanation: string;
  priority: number;
  image_id: string | null;
}

async function getData(): Promise<{ data: CaptionExampleRow[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("caption_examples")
      .select("id, created_datetime_utc, modified_datetime_utc, image_description, caption, explanation, priority, image_id")
      .order("priority", { ascending: false })
      .order("created_datetime_utc", { ascending: false });

    if (error) {
      console.error("[CaptionExamples] Supabase error:", error);
      console.error("[CaptionExamples] Table: caption_examples");
      return { data: [], error: `Table: caption_examples - ${error.message}` };
    }

    return { data: (data ?? []) as CaptionExampleRow[], error: null };
  } catch (err) {
    console.error("[CaptionExamples] Unexpected error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export default async function CaptionExamplesPage() {
  const { data, error } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Caption Examples</h1>
        <span className="text-sm text-gray-500">{data.length} total</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Failed to load data</p>
          <p className="text-red-600 text-sm mt-1 font-mono">{error}</p>
        </div>
      )}

      <CaptionExamplesTable initialData={data} />
    </div>
  );
}
