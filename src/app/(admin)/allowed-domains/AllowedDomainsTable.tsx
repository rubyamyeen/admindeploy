"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { createAllowedDomain, updateAllowedDomain, deleteAllowedDomain } from "@/lib/actions";

interface AllowedDomainRow {
  id: number;
  created_datetime_utc: string;
  apex_domain: string;
}

export default function AllowedDomainsTable({ initialData }: { initialData: AllowedDomainRow[] }) {
  const [items, setItems] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AllowedDomainRow | null>(null);
  const [formData, setFormData] = useState({ id: 0, apex_domain: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = items.filter((i) => i.apex_domain.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditing(null);
    setFormData({ id: 0, apex_domain: "" });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (item: AllowedDomainRow) => {
    setEditing(item);
    setFormData({ id: item.id, apex_domain: item.apex_domain });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const result = editing
      ? await updateAllowedDomain(editing.id, { apex_domain: formData.apex_domain })
      : await createAllowedDomain(formData);

    if (result.error) { setError(result.error); setSaving(false); return; }

    if (editing) {
      setItems(items.map((i) => (i.id === editing.id ? { ...i, apex_domain: formData.apex_domain } : i)));
    } else {
      setItems([...items, result.data as AllowedDomainRow].sort((a, b) => a.apex_domain.localeCompare(b.apex_domain)));
    }

    setModalOpen(false);
    setSaving(false);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    const result = await deleteAllowedDomain(id);
    if (result.error) { alert(result.error); return; }
    setItems(items.filter((i) => i.id !== id));
    setDeleteId(null);
    router.refresh();
  };

  return (
    <>
      <div className="bg-[#1a2332] rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <input type="text" placeholder="Search domains..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-500 w-full sm:max-w-sm" />
          <button onClick={openCreate} className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all">Add Domain</button>
        </div>
        <table className="w-full">
          <thead className="bg-[#151d2e]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Apex Domain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No domains found</td></tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-300">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 font-mono">{item.apex_domain}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{new Date(item.created_datetime_utc).toLocaleDateString()}</td>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Domain" : "Add Domain"}>
        {error && <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/20"><p className="text-sm text-red-400">{error}</p></div>}
        <div className="px-6 py-4 space-y-4">
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">ID *</label>
              <input type="number" required value={formData.id} onChange={(e) => setFormData({ ...formData, id: Number(e.target.value) })} className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Apex Domain *</label>
            <input type="text" required value={formData.apex_domain} onChange={(e) => setFormData({ ...formData, apex_domain: e.target.value })} className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-500" placeholder="example.com" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 transition-all">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
        </div>
      </Modal>
    </>
  );
}
