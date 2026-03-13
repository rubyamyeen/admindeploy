"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import type { WhitelistedEmailAddress } from "@/types/database";
import { createWhitelistedEmail, updateWhitelistedEmail, deleteWhitelistedEmail } from "@/lib/actions";

export default function WhitelistedEmailsTable({ initialData }: { initialData: WhitelistedEmailAddress[] }) {
  const [items, setItems] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WhitelistedEmailAddress | null>(null);
  const [formData, setFormData] = useState({ id: 0, email: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = items.filter((i) => i.email.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditing(null);
    setFormData({ id: 0, email: "" });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (item: WhitelistedEmailAddress) => {
    setEditing(item);
    setFormData({ id: item.id, email: item.email });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const result = editing
      ? await updateWhitelistedEmail(editing.id, { email: formData.email })
      : await createWhitelistedEmail(formData);

    if (result.error) { setError(result.error); setSaving(false); return; }

    if (editing) {
      setItems(items.map((i) => (i.id === editing.id ? { ...i, email: formData.email } : i)));
    } else {
      setItems([...items, result.data as WhitelistedEmailAddress].sort((a, b) => a.email.localeCompare(b.email)));
    }

    setModalOpen(false);
    setSaving(false);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    const result = await deleteWhitelistedEmail(id);
    if (result.error) { alert(result.error); return; }
    setItems(items.filter((i) => i.id !== id));
    setDeleteId(null);
    router.refresh();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex flex-col sm:flex-row gap-4 justify-between">
          <input type="text" placeholder="Search emails..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 w-full sm:max-w-sm" />
          <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Add Email</button>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No emails found</td></tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.created_datetime_utc).toLocaleDateString()}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Email" : "Add Email"}>
        {error && <div className="px-6 py-3 bg-red-50 border-b border-red-200"><p className="text-sm text-red-700">{error}</p></div>}
        <div className="px-6 py-4 space-y-4">
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID *</label>
              <input type="number" required value={formData.id} onChange={(e) => setFormData({ ...formData, id: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="user@example.com" />
          </div>
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
        </div>
      </Modal>
    </>
  );
}
