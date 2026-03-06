import { createClient } from "@/lib/supabase/server";
import type { Caption, Profile } from "@/types/database";

async function getCaptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("captions")
    .select("*, profiles(email, first_name, last_name)")
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    console.error("Error fetching captions:", error);
    return [];
  }

  return data as (Caption & {
    profiles: Pick<Profile, "email" | "first_name" | "last_name"> | null;
  })[];
}

export default async function CaptionsPage() {
  const captions = await getCaptions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Captions</h1>
        <span className="text-sm text-gray-500">
          {captions.length} total captions
        </span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Likes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {captions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No captions found
                  </td>
                </tr>
              ) : (
                captions.map((caption) => (
                  <tr key={caption.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md">
                        {caption.content || "No content"}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-1">
                        ID: {caption.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {caption.profiles?.email ||
                        (caption.profiles?.first_name &&
                          `${caption.profiles.first_name} ${caption.profiles.last_name || ""}`.trim()) ||
                        "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {caption.like_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1 flex-wrap">
                        {caption.is_public && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                            Public
                          </span>
                        )}
                        {caption.is_featured && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                            Featured
                          </span>
                        )}
                        {!caption.is_public && !caption.is_featured && (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(caption.created_datetime_utc).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
