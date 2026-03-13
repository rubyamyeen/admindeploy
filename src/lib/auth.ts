import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Profile {
  id: string;
  email: string | null;
  is_superadmin: boolean;
}

interface AuthResult {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  error: string | null;
}

export async function requireSuperAdmin(): Promise<AuthResult> {
  try {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("[Auth] getUser error:", authError);
      return { user: null, profile: null, error: authError.message };
    }

    if (!authData.user) {
      redirect("/login");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, is_superadmin")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      console.error("[Auth] profiles query error:", profileError);
      return {
        user: { id: authData.user.id, email: authData.user.email ?? "" },
        profile: null,
        error: `Failed to load profile: ${profileError.message}`,
      };
    }

    if (!profile || !profile.is_superadmin) {
      redirect("/unauthorized");
    }

    return {
      user: { id: authData.user.id, email: authData.user.email ?? "" },
      profile: profile as Profile,
      error: null,
    };
  } catch (err) {
    // Re-throw redirect errors (they're not real errors)
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("[Auth] Unexpected error:", err);
    return {
      user: null,
      profile: null,
      error: err instanceof Error ? err.message : "Unknown auth error",
    };
  }
}
