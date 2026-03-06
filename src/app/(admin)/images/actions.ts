"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ImageFormData {
  url: string;
  is_public: boolean;
  is_common_use: boolean;
  additional_context: string;
  image_description: string;
}

export async function createImage(formData: ImageFormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("images")
    .insert({
      url: formData.url,
      is_public: formData.is_public,
      is_common_use: formData.is_common_use,
      additional_context: formData.additional_context || null,
      image_description: formData.image_description || null,
      profile_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/images");
  return { data };
}

export async function updateImage(id: string, formData: ImageFormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("images")
    .update({
      url: formData.url,
      is_public: formData.is_public,
      is_common_use: formData.is_common_use,
      additional_context: formData.additional_context || null,
      image_description: formData.image_description || null,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/images");
  return { data };
}

export async function deleteImage(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("images").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/images");
  return { success: true };
}
