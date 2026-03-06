import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function requireSuperAdmin(): Promise<{
  user: { id: string; email: string };
  profile: Profile;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_superadmin) {
    redirect("/unauthorized");
  }

  return {
    user: { id: user.id, email: user.email ?? "" },
    profile: profile as Profile,
  };
}
