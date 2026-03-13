"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult<T = unknown> = { data?: T; error?: string };

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

// Terms CRUD
export async function createTerm(data: {
  term: string;
  definition: string;
  example: string;
  priority: number;
  term_type_id: number | null;
}): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { data: result, error } = await supabase.from("terms").insert(data).select().single();
  if (error) return { error: error.message };
  revalidatePath("/terms");
  return { data: result };
}

export async function updateTerm(id: number, data: {
  term: string;
  definition: string;
  example: string;
  priority: number;
  term_type_id: number | null;
}): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { data: result, error } = await supabase
    .from("terms")
    .update({ ...data, modified_datetime_utc: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/terms");
  return { data: result };
}

export async function deleteTerm(id: number): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { error } = await supabase.from("terms").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/terms");
  return { data: { success: true } };
}

// Caption Examples CRUD
export async function createCaptionExample(data: {
  image_description: string;
  caption: string;
  explanation: string;
  priority: number;
  image_id: string | null;
}): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { data: result, error } = await supabase.from("caption_examples").insert(data).select().single();
  if (error) return { error: error.message };
  revalidatePath("/caption-examples");
  return { data: result };
}

export async function updateCaptionExample(id: number, data: {
  image_description: string;
  caption: string;
  explanation: string;
  priority: number;
  image_id: string | null;
}): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { data: result, error } = await supabase
    .from("caption_examples")
    .update({ ...data, modified_datetime_utc: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/caption-examples");
  return { data: result };
}

export async function deleteCaptionExample(id: number): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { error } = await supabase.from("caption_examples").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/caption-examples");
  return { data: { success: true } };
}

// LLM Models CRUD
export async function createLlmModel(data: {
  id: number;
  name: string;
  llm_provider_id: number;
  provider_model_id: string;
  is_temperature_supported: boolean;
}): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { data: result, error } = await supabase.from("llm_models").insert(data).select().single();
  if (error) return { error: error.message };
  revalidatePath("/llm-models");
  return { data: result };
}

export async function updateLlmModel(id: number, data: {
  name: string;
  llm_provider_id: number;
  provider_model_id: string;
  is_temperature_supported: boolean;
}): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { data: result, error } = await supabase
    .from("llm_models")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/llm-models");
  return { data: result };
}

export async function deleteLlmModel(id: number): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { error } = await supabase.from("llm_models").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/llm-models");
  return { data: { success: true } };
}

// LLM Providers CRUD
export async function createLlmProvider(data: {
  id: number;
  name: string;
}): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { data: result, error } = await supabase.from("llm_providers").insert(data).select().single();
  if (error) return { error: error.message };
  revalidatePath("/llm-providers");
  return { data: result };
}

export async function updateLlmProvider(id: number, data: {
  name: string;
}): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { data: result, error } = await supabase
    .from("llm_providers")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/llm-providers");
  return { data: result };
}

export async function deleteLlmProvider(id: number): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { error } = await supabase.from("llm_providers").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/llm-providers");
  return { data: { success: true } };
}

// Allowed Signup Domains CRUD
export async function createAllowedDomain(data: {
  id: number;
  apex_domain: string;
}): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { data: result, error } = await supabase.from("allowed_signup_domains").insert(data).select().single();
  if (error) return { error: error.message };
  revalidatePath("/allowed-domains");
  return { data: result };
}

export async function updateAllowedDomain(id: number, data: {
  apex_domain: string;
}): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { data: result, error } = await supabase
    .from("allowed_signup_domains")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/allowed-domains");
  return { data: result };
}

export async function deleteAllowedDomain(id: number): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { error } = await supabase.from("allowed_signup_domains").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/allowed-domains");
  return { data: { success: true } };
}

// Whitelisted Email Addresses CRUD
export async function createWhitelistedEmail(data: {
  id: number;
  email_address: string;
}): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { data: result, error } = await supabase.from("whitelist_email_addresses").insert(data).select().single();
  if (error) return { error: error.message };
  revalidatePath("/whitelisted-emails");
  return { data: result };
}

export async function updateWhitelistedEmail(id: number, data: {
  email_address: string;
}): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { data: result, error } = await supabase
    .from("whitelist_email_addresses")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/whitelisted-emails");
  return { data: result };
}

export async function deleteWhitelistedEmail(id: number): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { error } = await supabase.from("whitelist_email_addresses").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/whitelisted-emails");
  return { data: { success: true } };
}

// Humor Flavor Mix (Read + Update only)
export async function updateHumorFlavorMix(id: number, data: {
  humor_flavor_id: number;
  caption_count: number;
}): Promise<ActionResult> {
  const { supabase } = await requireAuth();
  const { data: result, error } = await supabase
    .from("humor_flavor_mix")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/humor-mix");
  return { data: result };
}

// Image upload
export async function uploadImage(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireAuth();

  const file = formData.get("file") as File;
  const is_public = formData.get("is_public") === "true";
  const is_common_use = formData.get("is_common_use") === "true";
  const image_description = formData.get("image_description") as string || null;
  const additional_context = formData.get("additional_context") as string || null;

  if (!file) return { error: "No file provided" };

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(fileName, file);

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);

  const { data: result, error } = await supabase
    .from("images")
    .insert({
      url: urlData.publicUrl,
      is_public,
      is_common_use,
      image_description,
      additional_context,
      profile_id: user.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/images");
  return { data: result };
}
