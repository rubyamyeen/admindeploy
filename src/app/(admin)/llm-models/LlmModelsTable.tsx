"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import type { LlmModel, LlmProvider } from "@/types/database";
import { createLlmModel, updateLlmModel, deleteLlmModel } from "@/lib/actions";

type ModelWithProvider = LlmModel & { llm_providers: { name: string } | null };

export default function LlmModelsTable({
  initialData,
  providers,
}: {
  initialData: ModelWithProvider[];
  providers: Pick<LlmProvider, "id" | "name">[];
}) {
  const [items, setItems] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ModelWithProvider | null>(null);
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

  const openEdit = (item: ModelWithProvider) => {
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
      setItems([...items, { ...(result.data as LlmModel), llm_providers: provider ? { name: provider.name } : null }].sort((a, b) => a.id - b.id));
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-end">
          <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Add Model</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temp</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.llm_providers?.name ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{item.provider_model_id}</td>
                  <td className="px-6 py-4 text-sm">{item.is_temperature_supported ? <span className="text-green-600">Yes</span> : <span className="text-gray-400">No</span>}</td>
                  <td className="px-6 py-4 text-right">
                    {deleteId === item.id ? (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleDelete(item.id)} className="text-xs px-2 py-1 bg-red-600 text-white rounded">Confirm</button>
                        <button onClick={() => setDeleteId(null)} className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(item)} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Edit</button>
                        <button onClick={() => setDeleteId(item.id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Delete</button>
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
        {error && <div className="px-6 py-3 bg-red-50 border-b border-red-200"><p className="text-sm text-red-700">{error}</p></div>}
        <div className="px-6 py-4 space-y-4">
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID *</label>
              <input type="number" required value={formData.id} onChange={(e) => setFormData({ ...formData, id: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
            <select value={formData.llm_provider_id} onChange={(e) => setFormData({ ...formData, llm_provider_id: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
              {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider Model ID *</label>
            <input type="text" required value={formData.provider_model_id} onChange={(e) => setFormData({ ...formData, provider_model_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="e.g. gpt-4-turbo" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formData.is_temperature_supported} onChange={(e) => setFormData({ ...formData, is_temperature_supported: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
            <span className="text-sm text-gray-700">Temperature Supported</span>
          </label>
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
        </div>
      </Modal>
    </>
  );
}
