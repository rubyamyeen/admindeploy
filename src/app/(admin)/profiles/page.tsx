import { createClient } from "@/lib/supabase/server";
import ProfilesTable from "./ProfilesTable";

interface ProfileRow {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  is_superadmin: boolean;
  is_matrix_admin: boolean;
  is_in_study: boolean;
  created_datetime_utc: string | null;
}

async function getProfiles(): Promise<{ data: ProfileRow[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name, is_superadmin, is_matrix_admin, is_in_study, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false });

    if (error) {
      console.error("[Profiles] Supabase query error:", error);
      return { data: [], error: error.message };
    }

    return { data: (data ?? []) as ProfileRow[], error: null };
  } catch (err) {
    console.error("[Profiles] Unexpected error:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export default async function ProfilesPage() {
  const { data: profiles, error } = await getProfiles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profiles</h1>
        <span className="text-sm text-gray-500">{profiles.length} total</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Failed to load profiles</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      <ProfilesTable initialData={profiles} />
    </div>
  );
}
