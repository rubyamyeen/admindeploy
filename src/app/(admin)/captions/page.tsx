import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/DataTable";
import type { Caption, Profile } from "@/types/database";

async function getCaptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("captions")
    .select("*, profiles(email, first_name, last_name), humor_flavors(slug)")
    .order("created_datetime_utc", { ascending: false })
    .limit(500);
  return (data ?? []) as (Caption & {
    profiles: Pick<Profile, "email" | "first_name" | "last_name"> | null;
    humor_flavors: { slug: string } | null;
  })[];
}

export default async function CaptionsPage() {
  const captions = await getCaptions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Captions</h1>
        <span className="text-sm text-gray-500">{captions.length} shown (max 500)</span>
      </div>

      <DataTable
        data={captions}
        columns={[
          {
            key: "content",
            label: "Content",
            render: (v) => (
              <span className="max-w-md block truncate">{String(v ?? "—")}</span>
            ),
          },
          {
            key: "profiles.email",
            label: "Author",
            render: (_, row) => {
              const r = row as { profiles?: { email?: string; first_name?: string } | null };
              return r.profiles?.email || r.profiles?.first_name || "—";
            },
          },
          {
            key: "humor_flavors.slug",
            label: "Flavor",
            render: (_, row) => {
              const r = row as { humor_flavors?: { slug: string } | null };
              return r.humor_flavors?.slug || "—";
            },
          },
          {
            key: "like_count",
            label: "Likes",
          },
          {
            key: "is_public",
            label: "Flags",
            sortable: false,
            render: (_, row) => {
              const c = row as Caption;
              const flags = [];
              if (c.is_public) flags.push(<span key="p" className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Public</span>);
              if (c.is_featured) flags.push(<span key="f" className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">Featured</span>);
              return <div className="flex gap-1">{flags.length > 0 ? flags : <span className="text-gray-400">—</span>}</div>;
            },
          },
          {
            key: "created_datetime_utc",
            label: "Created",
            render: (v) => new Date(String(v)).toLocaleDateString(),
          },
        ]}
        searchKeys={["content"]}
      />
    </div>
  );
}
