"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import type { HumorFlavorMix, HumorFlavor } from "@/types/database";
import { updateHumorFlavorMix } from "@/lib/actions";

type MixWithFlavor = HumorFlavorMix & { humor_flavors: { slug: string } | null };

export default function HumorMixTable({
  data,
  flavors,
}: {
  data: MixWithFlavor[];
  flavors: Pick<HumorFlavor, "id" | "slug">[];
}) {
  const [items, setItems] = useState(data);
  const [editing, setEditing] = useState<MixWithFlavor | null>(null);
  const [formData, setFormData] = useState({ humor_flavor_id: 0, caption_count: 0 });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const openEdit = (item: MixWithFlavor) => {
    setEditing(item);
    setFormData({
      humor_flavor_id: item.humor_flavor_id,
      caption_count: item.caption_count,
    });
    setError(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);

    const result = await updateHumorFlavorMix(editing.id, formData);
    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setItems(items.map((i) =>
      i.id === editing.id
        ? {
            ...i,
            ...formData,
            humor_flavors: flavors.find((f) => f.id === formData.humor_flavor_id)
              ? { slug: flavors.find((f) => f.id === formData.humor_flavor_id)!.slug }
              : null,
          }
        : i
    ));
    setEditing(null);
    setSaving(false);
    router.refresh();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flavor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Caption Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{item.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.humor_flavors?.slug ?? "—"}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.caption_count}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(item.created_datetime_utc).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => openEdit(item)}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Humor Mix">
        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Humor Flavor</label>
            <select
              value={formData.humor_flavor_id}
              onChange={(e) => setFormData({ ...formData, humor_flavor_id: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              {flavors.map((f) => (
                <option key={f.id} value={f.id}>{f.slug}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caption Count</label>
            <input
              type="number"
              value={formData.caption_count}
              onChange={(e) => setFormData({ ...formData, caption_count: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={() => setEditing(null)}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </Modal>
    </>
  );
}
