import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

async function getProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }

  return data as Profile[];
}

export default async function ProfilesPage() {
  const profiles = await getProfiles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profiles</h1>
        <span className="text-sm text-gray-500">
          {profiles.length} total profiles
        </span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {profiles.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No profiles found
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {profile.first_name || profile.last_name
                          ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
                          : "—"}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {profile.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {profile.email || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(profile.created_datetime_utc).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1 flex-wrap">
                        {profile.is_superadmin && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                            Superadmin
                          </span>
                        )}
                        {profile.is_matrix_admin && (
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                            Matrix Admin
                          </span>
                        )}
                        {profile.is_in_study && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                            In Study
                          </span>
                        )}
                        {!profile.is_superadmin &&
                          !profile.is_matrix_admin &&
                          !profile.is_in_study && (
                            <span className="text-xs text-gray-400">
                              No roles
                            </span>
                          )}
                      </div>
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
