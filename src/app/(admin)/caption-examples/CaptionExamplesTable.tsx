"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { createCaptionExample, updateCaptionExample, deleteCaptionExample } from "@/lib/actions";

interface CaptionExampleRow {
  id: number;
  created_datetime_utc: string;
  image_description: string;
  caption: string;
  explanation: string;
  priority: number;
  image_id: string | null;
}

const emptyForm = {
  image_description: "",
  caption: "",
  explanation: "",
  priority: 0,
  image_id: null as string | null,
};

export default function CaptionExamplesTable({ initialData }: { initialData: CaptionExampleRow[] }) {
  const [items, setItems] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CaptionExampleRow | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = items.filter((i) =>
    i.caption.toLowerCase().includes(search.toLowerCase()) ||
    i.image_description.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (item: CaptionExampleRow) => {
    setEditing(item);
    setFormData({
      image_description: item.image_description,
      caption: item.caption,
      explanation: item.explanation,
      priority: item.priority,
      image_id: item.image_id,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const result = editing
      ? await updateCaptionExample(editing.id, formData)
      : await createCaptionExample(formData);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    if (editing) {
      setItems(items.map((i) => (i.id === editing.id ? { ...i, ...formData } : i)));
    } else {
      setItems([result.data as CaptionExampleRow, ...items]);
    }

    setModalOpen(false);
    setSaving(false);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    const result = await deleteCaptionExample(id);
    if (result.error) {
      alert(result.error);
      return;
    }
    setItems(items.filter((i) => i.id !== id));
    setDeleteId(null);
    router.refresh();
  };

  return (
    <>
      <div className="bg-[#1a2332] rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-500 w-full sm:max-w-sm"
          />
          <button onClick={openCreate} className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all">
            Add Example
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#151d2e]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Image Desc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Caption</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No examples found</td></tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate">{item.image_description}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">{item.caption}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs">
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {deleteId === item.id ? (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleDelete(item.id)} className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Confirm</button>
                          <button onClick={() => setDeleteId(null)} className="text-xs px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => openEdit(item)} className="text-xs px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">Edit</button>
                          <button onClick={() => setDeleteId(item.id)} className="text-xs px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Example" : "Add Example"}>
        {error && <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/20"><p className="text-sm text-red-400">{error}</p></div>}
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Image Description *</label>
            <textarea rows={2} required value={formData.image_description} onChange={(e) => setFormData({ ...formData, image_description: e.target.value })} className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Caption *</label>
            <textarea rows={2} required value={formData.caption} onChange={(e) => setFormData({ ...formData, caption: e.target.value })} className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Explanation *</label>
            <textarea rows={2} required value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
            <input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })} className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Image ID (optional)</label>
            <input type="text" value={formData.image_id ?? ""} onChange={(e) => setFormData({ ...formData, image_id: e.target.value || null })} className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-500" placeholder="UUID" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 transition-all">
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </button>
        </div>
      </Modal>
    </>
  );
}
