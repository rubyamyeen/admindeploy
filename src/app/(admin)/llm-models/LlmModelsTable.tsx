"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { createLlmModel, updateLlmModel, deleteLlmModel } from "@/lib/actions";

interface LlmModelRow {
  id: number;
  created_datetime_utc: string;
  name: string;
  llm_provider_id: number;
  provider_model_id: string;
  is_temperature_supported: boolean;
  llm_providers: { name: string } | null;
}

interface LlmProviderOption {
  id: number;
  name: string;
}

export default function LlmModelsTable({
  initialData,
  providers,
}: {
  initialData: LlmModelRow[];
  providers: LlmProviderOption[];
}) {
  const [items, setItems] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LlmModelRow | null>(null);
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    llm_provider_id: providers[0]?.id ?? 0,
    provider_model_id: "",
    is_temperature_supported: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  const openCreate = () => {
    setEditing(null);
    setFormData({ id: 0, name: "", llm_provider_id: providers[0]?.id ?? 0, provider_model_id: "", is_temperature_supported: false });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (item: LlmModelRow) => {
    setEditing(item);
    setFormData({
      id: item.id,
      name: item.name,
      llm_provider_id: item.llm_provider_id,
      provider_model_id: item.provider_model_id,
      is_temperature_supported: item.is_temperature_supported,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const result = editing
      ? await updateLlmModel(editing.id, {
          name: formData.name,
          llm_provider_id: formData.llm_provider_id,
          provider_model_id: formData.provider_model_id,
          is_temperature_supported: formData.is_temperature_supported,
        })
      : await createLlmModel(formData);

    if (result.error) { setError(result.error); setSaving(false); return; }

    const provider = providers.find((p) => p.id === formData.llm_provider_id);
    if (editing) {
      setItems(items.map((i) => i.id === editing.id ? { ...i, ...formData, llm_providers: provider ? { name: provider.name } : null } : i));
    } else {
      setItems([...items, { ...(result.data as LlmModelRow), llm_providers: provider ? { name: provider.name } : null }].sort((a, b) => a.id - b.id));
    }

    setModalOpen(false);
    setSaving(false);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    const result = await deleteLlmModel(id);
    if (result.error) { alert(result.error); return; }
    setItems(items.filter((i) => i.id !== id));
    setDeleteId(null);
    router.refresh();
  };

  return (
    <>
      <div className="bg-[#1a2332] rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-end">
          <button onClick={openCreate} className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all">Add Model</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#151d2e]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Model ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Temp</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-300">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{item.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                      {item.llm_providers?.name ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">{item.provider_model_id}</td>
                  <td className="px-6 py-4 text-sm">{item.is_temperature_supported ? <span className="text-emerald-400">Yes</span> : <span className="text-slate-500">No</span>}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Model" : "Add Model"}>
        {error && <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/20"><p className="text-sm text-red-400">{error}</p></div>}
        <div className="px-6 py-4 space-y-4">
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">ID *</label>
              <input type="number" required value={formData.id} onChange={(e) => setFormData({ ...formData, id: Number(e.target.value) })} className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Provider *</label>
            <select value={formData.llm_provider_id} onChange={(e) => setFormData({ ...formData, llm_provider_id: Number(e.target.value) })} className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white">
              {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Provider Model ID *</label>
            <input type="text" required value={formData.provider_model_id} onChange={(e) => setFormData({ ...formData, provider_model_id: e.target.value })} className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-500" placeholder="e.g. gpt-4-turbo" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formData.is_temperature_supported} onChange={(e) => setFormData({ ...formData, is_temperature_supported: e.target.checked })} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50" />
            <span className="text-sm text-slate-300">Temperature Supported</span>
          </label>
        </div>
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 transition-all">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
        </div>
      </Modal>
    </>
  );
}
