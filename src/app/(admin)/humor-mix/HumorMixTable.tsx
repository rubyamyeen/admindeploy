"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { updateHumorFlavorMix } from "@/lib/actions";

interface HumorFlavorMixRow {
  id: number;
  created_datetime_utc: string;
  humor_flavor_id: number;
  caption_count: number;
  humor_flavors: { slug: string } | null;
}

interface HumorFlavorOption {
  id: number;
  slug: string;
}

export default function HumorMixTable({
  data,
  flavors,
}: {
  data: HumorFlavorMixRow[];
  flavors: HumorFlavorOption[];
}) {
  const [items, setItems] = useState(data);
  const [editing, setEditing] = useState<HumorFlavorMixRow | null>(null);
  const [formData, setFormData] = useState({ humor_flavor_id: 0, caption_count: 0 });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const openEdit = (item: HumorFlavorMixRow) => {
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

    const matchedFlavor = flavors.find((f) => f.id === formData.humor_flavor_id);
    setItems(items.map((i) =>
      i.id === editing.id
        ? {
            ...i,
            humor_flavor_id: formData.humor_flavor_id,
            caption_count: formData.caption_count,
            humor_flavors: matchedFlavor ? { slug: matchedFlavor.slug } : null,
          }
        : i
    ));
    setEditing(null);
    setSaving(false);
    router.refresh();
  };

  return (
    <>
      <div className="bg-[#1a2332] rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#151d2e]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Flavor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Caption Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No data found</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-300">{item.id}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-violet-500/20 text-violet-400 rounded text-xs">
                      {item.humor_flavors?.slug ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{item.caption_count}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {item.created_datetime_utc ? new Date(item.created_datetime_utc).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-xs px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Humor Mix">
        {error && (
          <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Humor Flavor</label>
            <select
              value={formData.humor_flavor_id}
              onChange={(e) => setFormData({ ...formData, humor_flavor_id: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white"
            >
              <option value={0}>Select a flavor...</option>
              {flavors.map((f) => (
                <option key={f.id} value={f.id}>{f.slug}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Caption Count</label>
            <input
              type="number"
              value={formData.caption_count}
              onChange={(e) => setFormData({ ...formData, caption_count: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={() => setEditing(null)}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 transition-all"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </Modal>
    </>
  );
}
