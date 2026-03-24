"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { createTerm, updateTerm, deleteTerm } from "@/lib/actions";

interface TermRow {
  id: number;
  created_datetime_utc: string;
  term: string;
  definition: string;
  example: string;
  priority: number;
  term_type_id: number | null;
}

const emptyForm = { term: "", definition: "", example: "", priority: 0, term_type_id: null as number | null };

export default function TermsTable({ initialData }: { initialData: TermRow[] }) {
  const [items, setItems] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TermRow | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = items.filter((i) =>
    i.term.toLowerCase().includes(search.toLowerCase()) ||
    i.definition.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (item: TermRow) => {
    setEditing(item);
    setFormData({
      term: item.term,
      definition: item.definition,
      example: item.example,
      priority: item.priority,
      term_type_id: item.term_type_id,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const result = editing
      ? await updateTerm(editing.id, formData)
      : await createTerm(formData);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    if (editing) {
      setItems(items.map((i) => (i.id === editing.id ? { ...i, ...formData } : i)));
    } else {
      setItems([result.data as TermRow, ...items]);
    }

    setModalOpen(false);
    setSaving(false);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    const result = await deleteTerm(id);
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
            placeholder="Search terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-500 w-full sm:max-w-sm"
          />
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all"
          >
            Add Term
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#151d2e]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Term</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Definition</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No terms found</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-300">{item.term}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 max-w-md truncate">{item.definition}</td>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Term" : "Add Term"}>
        {error && (
          <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Term *</label>
            <input
              type="text"
              required
              value={formData.term}
              onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Definition *</label>
            <textarea
              required
              rows={3}
              value={formData.definition}
              onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
              className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Example *</label>
            <textarea
              required
              rows={2}
              value={formData.example}
              onChange={(e) => setFormData({ ...formData, example: e.target.value })}
              className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
            <input
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white"
            />
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
