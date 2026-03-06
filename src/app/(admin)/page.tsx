import { createClient } from "@/lib/supabase/server";
import type { Image, Caption, Profile } from "@/types/database";

async function getDashboardData() {
  const supabase = await createClient();

  const [
    { count: profileCount },
    { count: imageCount },
    { count: captionCount },
    { count: publicImageCount },
    { count: commonUseImageCount },
    { data: recentImages },
    { data: recentCaptions },
    { data: topUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("images").select("*", { count: "exact", head: true }),
    supabase.from("captions").select("*", { count: "exact", head: true }),
    supabase
      .from("images")
      .select("*", { count: "exact", head: true })
      .eq("is_public", true),
    supabase
      .from("images")
      .select("*", { count: "exact", head: true })
      .eq("is_common_use", true),
    supabase
      .from("images")
      .select("*")
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
    supabase
      .from("captions")
      .select("*, profiles(email, first_name, last_name)")
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
    supabase.rpc("get_top_users_by_image_count").limit(5),
  ]);

  return {
    profileCount: profileCount ?? 0,
    imageCount: imageCount ?? 0,
    captionCount: captionCount ?? 0,
    publicImageCount: publicImageCount ?? 0,
    commonUseImageCount: commonUseImageCount ?? 0,
    recentImages: (recentImages as Image[]) ?? [],
    recentCaptions: (recentCaptions as (Caption & { profiles: Pick<Profile, "email" | "first_name" | "last_name"> | null })[]) ?? [],
    topUsers: topUsers ?? [],
  };
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Profiles"
          value={data.profileCount}
          color="text-blue-600"
        />
        <StatCard
          title="Total Images"
          value={data.imageCount}
          color="text-green-600"
        />
        <StatCard
          title="Total Captions"
          value={data.captionCount}
          color="text-purple-600"
        />
        <StatCard
          title="Public Images"
          value={data.publicImageCount}
          color="text-orange-600"
        />
        <StatCard
          title="Common Use Images"
          value={data.commonUseImageCount}
          color="text-teal-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Images */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Images
            </h2>
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
                        <img
                          src={image.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {image.image_description || image.url}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(image.created_datetime_utc).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {image.is_public && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          Public
                        </span>
                      )}
                      {image.is_common_use && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                          Common
                        </span>
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
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Captions
            </h2>
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
                    <span>
                      {caption.profiles?.email ||
                        caption.profiles?.first_name ||
                        "Unknown"}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(caption.created_datetime_utc).toLocaleString()}
                    </span>
                    {caption.like_count > 0 && (
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

      {/* Top Users */}
      {data.topUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Top Users by Image Count
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Image Count
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.topUsers.map((user: { email: string; image_count: number }, idx: number) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.image_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
