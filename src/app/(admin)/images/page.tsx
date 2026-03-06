import { createClient } from "@/lib/supabase/server";
import type { Image } from "@/types/database";
import ImageTable from "./ImageTable";

async function getImages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    console.error("Error fetching images:", error);
    return [];
  }

  return data as Image[];
}

export default async function ImagesPage() {
  const images = await getImages();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Images</h1>
        <span className="text-sm text-gray-500">
          {images.length} total images
        </span>
      </div>

      <ImageTable initialImages={images} />
    </div>
  );
}
