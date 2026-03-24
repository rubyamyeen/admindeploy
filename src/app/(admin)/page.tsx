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
}

interface TopCaption {
  id: string;
  content: string | null;
  like_count: number;
}

interface FlavorStat {
  slug: string;
  count: number;
}

interface MonthlyStat {
  month: string;
  count: number;
}

interface DashboardData {
  // Core counts
  profileCount: number;
  imageCount: number;
  captionCount: number;
  captionRequestCount: number;
  featuredCount: number;
  flavorCount: number;
  totalLikes: number;
  // Lists
  recentImages: RecentImage[];
  recentCaptions: RecentCaption[];
  topCaptions: TopCaption[];
  flavorStats: FlavorStat[];
  monthlyStats: MonthlyStat[];
  // Computed
  avgCaptionsPerImage: number;
  avgLikesPerCaption: number;
  error: string | null;
}

async function getDashboardData(): Promise<DashboardData> {
  try {
    const supabase = await createClient();

    const [
      profilesResult,
      imagesResult,
      captionsResult,
      captionRequestsResult,
      featuredResult,
      flavorsResult,
      recentImagesResult,
      recentCaptionsResult,
      topCaptionsResult,
      flavorMixResult,
      likesResult,
    ] = await Promise.all([
      // Counts
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("images").select("*", { count: "exact", head: true }),
      supabase.from("captions").select("*", { count: "exact", head: true }),
      supabase.from("caption_requests").select("*", { count: "exact", head: true }),
      supabase.from("captions").select("*", { count: "exact", head: true }).eq("is_featured", true),
      supabase.from("humor_flavors").select("*", { count: "exact", head: true }),
      // Recent data
      supabase.from("images").select("id, url, image_description, is_public, is_common_use, created_datetime_utc").order("created_datetime_utc", { ascending: false }).limit(5),
      supabase.from("captions").select("id, content, like_count, created_datetime_utc").order("created_datetime_utc", { ascending: false }).limit(10),
      // Top captions by likes
      supabase.from("captions").select("id, content, like_count").order("like_count", { ascending: false }).limit(5),
      // Flavor distribution
      supabase.from("humor_flavor_mix").select("caption_count, humor_flavors(slug)").order("caption_count", { ascending: false }).limit(8),
      // Total likes (sum)
      supabase.from("captions").select("like_count"),
    ]);

    // Calculate total likes
    let totalLikes = 0;
    if (likesResult.data) {
      totalLikes = likesResult.data.reduce((sum, row) => sum + (row.like_count || 0), 0);
    }

    // Process flavor stats
    const flavorStats: FlavorStat[] = [];
    if (flavorMixResult.data) {
      for (const row of flavorMixResult.data) {
        const flavorData = row.humor_flavors as unknown as { slug: string } | null;
        if (flavorData?.slug) {
          flavorStats.push({
            slug: flavorData.slug,
            count: row.caption_count || 0,
          });
        }
      }
    }

    // Get monthly caption stats (last 6 months)
    const monthlyStats: MonthlyStat[] = [];
    const captionsForMonthly = await supabase
      .from("captions")
      .select("created_datetime_utc")
      .gte("created_datetime_utc", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_datetime_utc", { ascending: true });

    if (captionsForMonthly.data) {
      const monthCounts: Record<string, number> = {};
      for (const row of captionsForMonthly.data) {
        const date = new Date(row.created_datetime_utc);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
      }
      for (const [month, count] of Object.entries(monthCounts)) {
        monthlyStats.push({ month, count });
      }
    }

    const captionCount = captionsResult.count ?? 0;
    const imageCount = imagesResult.count ?? 0;

    return {
      profileCount: profilesResult.count ?? 0,
      imageCount,
      captionCount,
      captionRequestCount: captionRequestsResult.count ?? 0,
      featuredCount: featuredResult.count ?? 0,
      flavorCount: flavorsResult.count ?? 0,
      totalLikes,
      recentImages: (recentImagesResult.data ?? []) as RecentImage[],
      recentCaptions: (recentCaptionsResult.data ?? []) as RecentCaption[],
      topCaptions: (topCaptionsResult.data ?? []) as TopCaption[],
      flavorStats,
      monthlyStats,
      avgCaptionsPerImage: imageCount > 0 ? Math.round(captionCount / imageCount) : 0,
      avgLikesPerCaption: captionCount > 0 ? Math.round((totalLikes / captionCount) * 10) / 10 : 0,
      error: null,
    };
  } catch (err) {
    console.error("[Dashboard] Unexpected error:", err);
    return {
      profileCount: 0,
      imageCount: 0,
      captionCount: 0,
      captionRequestCount: 0,
      featuredCount: 0,
      flavorCount: 0,
      totalLikes: 0,
      recentImages: [],
      recentCaptions: [],
      topCaptions: [],
      flavorStats: [],
      monthlyStats: [],
      avgCaptionsPerImage: 0,
      avgLikesPerCaption: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// Icon components
function CaptionIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function formatShortDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  // Find max for bar scaling
  const maxMonthlyCount = Math.max(...data.monthlyStats.map(s => s.count), 1);
  const maxFlavorCount = Math.max(...data.flavorStats.map(s => s.count), 1);

  return (
    <div className="space-y-6">
      {/* Gradient Hero Bar */}
      <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 via-rose-500 via-orange-500 to-cyan-500" />

      {data.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 font-medium">Error loading dashboard data</p>
          <p className="text-red-400/80 text-sm mt-1">{data.error}</p>
        </div>
      )}

      {/* Primary Stat Cards - Large Gradient */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Captions */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
            <CaptionIcon />
          </div>
          <p className="text-sm font-medium text-white/80">Total Captions</p>
          <p className="text-4xl font-bold text-white mt-2">{data.captionCount.toLocaleString()}</p>
          <p className="text-sm text-white/60 mt-1">{data.avgCaptionsPerImage} avg per image</p>
        </div>

        {/* Total Images */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
            <ImageIcon />
          </div>
          <p className="text-sm font-medium text-white/80">Total Images</p>
          <p className="text-4xl font-bold text-white mt-2">{data.imageCount.toLocaleString()}</p>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
            <UsersIcon />
          </div>
          <p className="text-sm font-medium text-white/80">Total Users</p>
          <p className="text-4xl font-bold text-white mt-2">{data.profileCount.toLocaleString()}</p>
        </div>

        {/* Total Likes (Votes) */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
            <ChartIcon />
          </div>
          <p className="text-sm font-medium text-white/80">Total Likes</p>
          <p className="text-4xl font-bold text-white mt-2">{data.totalLikes.toLocaleString()}</p>
          <p className="text-sm text-white/60 mt-1">{data.avgLikesPerCaption} avg per caption</p>
        </div>
      </div>

      {/* Secondary Stats - Smaller Dark Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Requests</p>
          <p className="text-2xl font-bold text-white mt-1">{data.captionRequestCount.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Likes</p>
          <p className="text-2xl font-bold text-white mt-1">{data.totalLikes.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Images</p>
          <p className="text-2xl font-bold text-white mt-1">{data.imageCount.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Featured</p>
          <p className="text-2xl font-bold text-white mt-1">{data.featuredCount.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Users</p>
          <p className="text-2xl font-bold text-white mt-1">{data.profileCount.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Flavors</p>
          <p className="text-2xl font-bold text-white mt-1">{data.flavorCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Captions Per Month */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Captions Per Month</h3>
          <div className="space-y-3">
            {data.monthlyStats.length === 0 ? (
              <p className="text-slate-400 text-sm">No data available</p>
            ) : (
              data.monthlyStats.map((stat) => (
                <div key={stat.month} className="flex items-center gap-4">
                  <span className="text-sm text-slate-400 w-20 flex-shrink-0">{stat.month}</span>
                  <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${(stat.count / maxMonthlyCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-300 w-16 text-right">{stat.count.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Flavor Distribution */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Captions by Flavor</h3>
          <div className="space-y-3">
            {data.flavorStats.length === 0 ? (
              <p className="text-slate-400 text-sm">No data available</p>
            ) : (
              data.flavorStats.map((stat) => (
                <div key={stat.slug} className="flex items-center gap-4">
                  <span className="text-sm text-slate-400 w-40 flex-shrink-0 truncate">{stat.slug}</span>
                  <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
                      style={{ width: `${(stat.count / maxFlavorCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-300 w-16 text-right">{stat.count.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Captions & Recent Captions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Captions by Likes */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Captions by Likes</h3>
          <div className="space-y-4">
            {data.topCaptions.length === 0 ? (
              <p className="text-slate-400 text-sm">No captions yet</p>
            ) : (
              data.topCaptions.map((caption, index) => (
                <div key={caption.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    index === 0 ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" :
                    index === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800" :
                    index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white" :
                    "bg-slate-700 text-slate-400"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white line-clamp-2">&ldquo;{caption.content || "No content"}&rdquo;</p>
                    <p className="text-xs text-emerald-400 mt-1">{caption.like_count} likes</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Captions */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Captions</h3>
          <div className="space-y-3">
            {data.recentCaptions.length === 0 ? (
              <p className="text-slate-400 text-sm">No captions yet</p>
            ) : (
              data.recentCaptions.map((caption) => (
                <div key={caption.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-white flex-1 truncate">{caption.content || "No content"}</p>
                  <span className="text-xs text-slate-500 flex-shrink-0">{formatShortDate(caption.created_datetime_utc)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Images */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">Recent Images</h3>
        </div>
        <div className="divide-y divide-slate-700/50">
          {data.recentImages.length === 0 ? (
            <p className="px-6 py-4 text-slate-400">No images yet</p>
          ) : (
            data.recentImages.map((image) => (
              <div key={image.id} className="px-6 py-4 hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-700 rounded-lg flex-shrink-0 overflow-hidden">
                    {image.url && (
                      <img src={image.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {image.image_description || "No description"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{formatShortDate(image.created_datetime_utc)}</p>
                  </div>
                  <div className="flex gap-2">
                    {image.is_public && (
                      <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-lg">Public</span>
                    )}
                    {image.is_common_use && (
                      <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg">Common</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
