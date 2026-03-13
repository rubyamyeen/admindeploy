import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/DataTable";

interface CaptionRow {
  id: string;
  created_datetime_utc: string;
  content: string | null;
  is_public: boolean;
  is_featured: boolean;
  like_count: number;
  profiles: { email: string | null; first_name: string | null } | null;
  humor_flavors: { slug: string } | null;
}

async function getCaptions(): Promise<{ data: CaptionRow[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("captions")
      .select("id, created_datetime_utc, content, is_public, is_featured, like_count, profiles(email, first_name), humor_flavors(slug)")
      .order("created_datetime_utc", { ascending: false })
      .limit(500);

    if (error) {
      console.error("[Captions] Supabase query error:", error);
      return { data: [], error: error.message };
    }

    return { data: (data ?? []) as unknown as CaptionRow[], error: null };
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

      <DataTable
        data={captions}
        columns={[
          {
            key: "content",
            label: "Content",
            render: (v) => (
              <span className="max-w-md block truncate">{v != null ? String(v) : "—"}</span>
            ),
          },
          {
            key: "profiles",
            label: "Author",
            sortable: false,
            render: (_, row) => {
              const r = row as CaptionRow;
              return r.profiles?.email || r.profiles?.first_name || "—";
            },
          },
          {
            key: "humor_flavors",
            label: "Flavor",
            sortable: false,
            render: (_, row) => {
              const r = row as CaptionRow;
              return r.humor_flavors?.slug || "—";
            },
          },
          {
            key: "like_count",
            label: "Likes",
            render: (v) => v != null ? String(v) : "0",
          },
          {
            key: "is_public",
            label: "Flags",
            sortable: false,
            render: (_, row) => {
              const c = row as CaptionRow;
              const flags = [];
              if (c.is_public) flags.push(<span key="p" className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Public</span>);
              if (c.is_featured) flags.push(<span key="f" className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">Featured</span>);
              return <div className="flex gap-1">{flags.length > 0 ? flags : <span className="text-gray-400">—</span>}</div>;
            },
          },
          {
            key: "created_datetime_utc",
            label: "Created",
            render: (v) => {
              if (!v) return "—";
              try {
                return new Date(String(v)).toLocaleDateString();
              } catch {
                return "—";
              }
            },
          },
        ]}
        searchKeys={["content"]}
      />
    </div>
  );
}
