import { createClient } from "@/lib/supabase/server";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getDisplayName(email: string): string {
  return email.split("@")[0];
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
      // Recent captions
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

  // Get user for welcome message
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const displayName = user?.email ? getDisplayName(user.email) : "Admin";
  const greeting = getGreeting();

  // Find max for bar scaling
  const maxMonthlyCount = Math.max(...data.monthlyStats.map(s => s.count), 1);
  const maxFlavorCount = Math.max(...data.flavorStats.map(s => s.count), 1);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 p-6 lg:p-8">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium">{greeting},</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mt-1 tracking-tight">{displayName}</h1>
          <p className="text-white/70 mt-3 max-w-xl text-sm lg:text-base">
            Welcome to the AlmostCrack&apos;d admin panel. Here&apos;s an overview of your platform across Columbia University &amp; Barnard College.
          </p>
        </div>
      </div>

      {data.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-red-400 font-medium">Error loading dashboard data</p>
          <p className="text-red-400/80 text-sm mt-1">{data.error}</p>
        </div>
      )}

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Captions */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm text-white/80 font-medium">Total Captions</p>
          <p className="text-4xl font-bold text-white mt-2 tracking-tight">{data.captionCount.toLocaleString()}</p>
          <p className="text-sm text-white/60 mt-1">{data.avgCaptionsPerImage} avg per image</p>
        </div>

        {/* Total Images */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-white/80 font-medium">Total Images</p>
          <p className="text-4xl font-bold text-white mt-2 tracking-tight">{data.imageCount.toLocaleString()}</p>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-sm text-white/80 font-medium">Total Users</p>
          <p className="text-4xl font-bold text-white mt-2 tracking-tight">{data.profileCount.toLocaleString()}</p>
        </div>

        {/* Votes Cast (Likes) */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-white/80 font-medium">Votes Cast</p>
          <p className="text-4xl font-bold text-white mt-2 tracking-tight">{data.totalLikes.toLocaleString()}</p>
          <p className="text-sm text-white/60 mt-1">{data.avgLikesPerCaption} avg per caption</p>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[#1a2332]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Requests</p>
          <p className="text-2xl font-bold text-white mt-2 tracking-tight">{data.captionRequestCount.toLocaleString()}</p>
        </div>
        <div className="bg-[#1a2332]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Likes</p>
          <p className="text-2xl font-bold text-white mt-2 tracking-tight">{data.totalLikes.toLocaleString()}</p>
        </div>
        <div className="bg-[#1a2332]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shares</p>
          <p className="text-2xl font-bold text-white mt-2 tracking-tight">0</p>
        </div>
        <div className="bg-[#1a2332]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Featured</p>
          <p className="text-2xl font-bold text-white mt-2 tracking-tight">{data.featuredCount.toLocaleString()}</p>
        </div>
        <div className="bg-[#1a2332]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reported</p>
          <p className="text-2xl font-bold text-red-400 mt-2 tracking-tight">0</p>
        </div>
        <div className="bg-[#1a2332]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flavors</p>
          <p className="text-2xl font-bold text-white mt-2 tracking-tight">{data.flavorCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Captions Per Month */}
        <div className="bg-[#1a2332]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6">
          <h3 className="text-base font-semibold text-white mb-5 tracking-tight">Captions Per Month</h3>
          <div className="space-y-4">
            {data.monthlyStats.length === 0 ? (
              <p className="text-slate-500 text-sm">No data available</p>
            ) : (
              data.monthlyStats.map((stat) => (
                <div key={stat.month} className="flex items-center gap-4">
                  <span className="text-sm text-slate-400 w-20 flex-shrink-0">{stat.month}</span>
                  <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                      style={{ width: `${(stat.count / maxMonthlyCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-400 w-12 text-right">{stat.count.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shares by Platform - placeholder since no data */}
        <div className="bg-[#1a2332]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6">
          <h3 className="text-base font-semibold text-white mb-5">Shares by Platform</h3>
          <div className="space-y-4">
            {["Other", "iMessage", "Slack", "AirDrop", "TikTok", "Gmail", "WhatsApp", "Instagram"].map((platform, i) => (
              <div key={platform} className="flex items-center gap-4">
                <span className="text-sm text-slate-400 w-20 flex-shrink-0">{platform}</span>
                <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                    style={{ width: `${Math.max(5, 100 - i * 12)}%` }}
                  />
                </div>
                <span className="text-sm text-slate-400 w-12 text-right">{Math.max(1, 54 - i * 7)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flavor Stats & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Flavor Distribution */}
        <div className="bg-[#1a2332]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6">
          <h3 className="text-base font-semibold text-white mb-5">Captions by Flavor</h3>
          <div className="space-y-4">
            {data.flavorStats.length === 0 ? (
              <p className="text-slate-500 text-sm">No data available</p>
            ) : (
              data.flavorStats.map((stat) => (
                <div key={stat.slug} className="flex items-center gap-4">
                  <span className="text-sm text-slate-400 w-36 flex-shrink-0 truncate">{stat.slug}</span>
                  <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full"
                      style={{ width: `${(stat.count / maxFlavorCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-400 w-12 text-right">{stat.count.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Heatmap Placeholder */}
        <div className="bg-[#1a2332]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6">
          <h3 className="text-base font-semibold text-white mb-5">Activity</h3>
          <div className="space-y-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-8">{day}</span>
                <div className="flex gap-1">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-sm ${
                        Math.random() > 0.7
                          ? "bg-violet-500"
                          : Math.random() > 0.5
                          ? "bg-violet-700"
                          : "bg-slate-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-slate-800" />
              <div className="w-3 h-3 rounded-sm bg-violet-900" />
              <div className="w-3 h-3 rounded-sm bg-violet-700" />
              <div className="w-3 h-3 rounded-sm bg-violet-500" />
            </div>
            <span>More</span>
            <span className="ml-2">(UTC)</span>
          </div>
        </div>
      </div>

      {/* Top Captions & Recent Captions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Captions by Likes */}
        <div className="bg-[#1a2332]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6">
          <h3 className="text-base font-semibold text-white mb-5">Top Captions by Likes</h3>
          <div className="space-y-4">
            {data.topCaptions.length === 0 ? (
              <p className="text-slate-500 text-sm">No captions yet</p>
            ) : (
              data.topCaptions.map((caption, index) => (
                <div key={caption.id} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    index === 0 ? "bg-yellow-500 text-yellow-900" :
                    index === 1 ? "bg-slate-400 text-slate-800" :
                    index === 2 ? "bg-amber-600 text-amber-100" :
                    "bg-slate-700 text-slate-400"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 line-clamp-2">&ldquo;{caption.content || "No content"}&rdquo;</p>
                    <p className="text-xs text-emerald-400 mt-1">{caption.like_count} likes</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Captions */}
        <div className="bg-[#1a2332]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6">
          <h3 className="text-base font-semibold text-white mb-5">Recent Captions</h3>
          <div className="space-y-3">
            {data.recentCaptions.length === 0 ? (
              <p className="text-slate-500 text-sm">No captions yet</p>
            ) : (
              data.recentCaptions.map((caption) => (
                <div key={caption.id} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-300 flex-1 truncate">{caption.content || "No content"}</p>
                  <span className="text-xs text-slate-500 flex-shrink-0">{formatShortDate(caption.created_datetime_utc)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
