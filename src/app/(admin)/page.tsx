import { createClient } from "@/lib/supabase/server";

interface RecentImage {
  id: string;
  url: string | null;
  image_description: string | null;
  is_public: boolean;
  is_common_use: boolean;
  created_datetime_utc: string;
}

interface RecentCaption {
  id: string;
  content: string | null;
  like_count: number;
  created_datetime_utc: string;
  profiles: { email: string | null; first_name: string | null } | null;
}

interface DashboardData {
  profileCount: number;
  imageCount: number;
  captionCount: number;
  publicImageCount: number;
  commonUseImageCount: number;
  recentImages: RecentImage[];
  recentCaptions: RecentCaption[];
  error: string | null;
}

async function getDashboardData(): Promise<DashboardData> {
  try {
    const supabase = await createClient();

    const [
      profilesResult,
      imagesResult,
      captionsResult,
      publicImagesResult,
      commonUseImagesResult,
      recentImagesResult,
      recentCaptionsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("images").select("*", { count: "exact", head: true }),
      supabase.from("captions").select("*", { count: "exact", head: true }),
      supabase.from("images").select("*", { count: "exact", head: true }).eq("is_public", true),
      supabase.from("images").select("*", { count: "exact", head: true }).eq("is_common_use", true),
      supabase.from("images").select("id, url, image_description, is_public, is_common_use, created_datetime_utc").order("created_datetime_utc", { ascending: false }).limit(5),
      supabase.from("captions").select("id, content, like_count, created_datetime_utc, profiles(email, first_name)").order("created_datetime_utc", { ascending: false }).limit(5),
    ]);

    // Log any errors
    if (profilesResult.error) console.error("[Dashboard] profiles error:", profilesResult.error);
    if (imagesResult.error) console.error("[Dashboard] images error:", imagesResult.error);
    if (captionsResult.error) console.error("[Dashboard] captions error:", captionsResult.error);
    if (recentImagesResult.error) console.error("[Dashboard] recentImages error:", recentImagesResult.error);
    if (recentCaptionsResult.error) console.error("[Dashboard] recentCaptions error:", recentCaptionsResult.error);

    return {
      profileCount: profilesResult.count ?? 0,
      imageCount: imagesResult.count ?? 0,
      captionCount: captionsResult.count ?? 0,
      publicImageCount: publicImagesResult.count ?? 0,
      commonUseImageCount: commonUseImagesResult.count ?? 0,
      recentImages: (recentImagesResult.data ?? []) as unknown as RecentImage[],
      recentCaptions: (recentCaptionsResult.data ?? []) as unknown as RecentCaption[],
      error: null,
    };
  } catch (err) {
    console.error("[Dashboard] Unexpected error:", err);
    return {
      profileCount: 0,
      imageCount: 0,
      captionCount: 0,
      publicImageCount: 0,
      commonUseImageCount: 0,
      recentImages: [],
      recentCaptions: [],
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
    </div>
  );
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return "—";
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {data.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Error loading dashboard data</p>
          <p className="text-red-600 text-sm mt-1">{data.error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Profiles" value={data.profileCount} color="text-blue-600" />
        <StatCard title="Total Images" value={data.imageCount} color="text-green-600" />
        <StatCard title="Total Captions" value={data.captionCount} color="text-purple-600" />
        <StatCard title="Public Images" value={data.publicImageCount} color="text-orange-600" />
        <StatCard title="Common Use Images" value={data.commonUseImageCount} color="text-teal-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Images */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Images</h2>
          </div>
          <div className="divide-y">
            {data.recentImages.length === 0 ? (
              <p className="px-6 py-4 text-gray-500">No images yet</p>
            ) : (
              data.recentImages.map((image) => (
                <div key={image.id} className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                      {image.url && (
                        <img src={image.url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {image.image_description || image.url || "No description"}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(image.created_datetime_utc)}</p>
                    </div>
                    <div className="flex gap-2">
                      {image.is_public && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Public</span>
                      )}
                      {image.is_common_use && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Common</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Captions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Captions</h2>
          </div>
          <div className="divide-y">
            {data.recentCaptions.length === 0 ? (
              <p className="px-6 py-4 text-gray-500">No captions yet</p>
            ) : (
              data.recentCaptions.map((caption) => (
                <div key={caption.id} className="px-6 py-4">
                  <p className="text-sm text-gray-900 line-clamp-2">
                    {caption.content || "No content"}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>{caption.profiles?.email || caption.profiles?.first_name || "Unknown"}</span>
                    <span>•</span>
                    <span>{formatDate(caption.created_datetime_utc)}</span>
                    {(caption.like_count ?? 0) > 0 && (
                      <>
                        <span>•</span>
                        <span>{caption.like_count} likes</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
