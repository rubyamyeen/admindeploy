"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createImage, updateImage, deleteImage, type ImageFormData } from "./actions";
import { uploadImage } from "@/lib/actions";
import Modal from "@/components/Modal";

interface ImageRow {
  id: string;
  created_datetime_utc: string;
  url: string | null;
  is_common_use: boolean;
  profile_id: string | null;
  additional_context: string | null;
  is_public: boolean;
  image_description: string | null;
  celebrity_recognition: string | null;
}

const emptyForm: ImageFormData = {
  url: "",
  is_public: false,
  is_common_use: false,
  additional_context: "",
  image_description: "",
};

export default function ImageTable({ initialImages }: { initialImages: ImageRow[] }) {
  const [images, setImages] = useState(initialImages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageRow | null>(null);
  const [formData, setFormData] = useState<ImageFormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadData, setUploadData] = useState({
    is_public: false,
    is_common_use: false,
    additional_context: "",
    image_description: "",
  });
  const router = useRouter();

  const filtered = images.filter((i) =>
    (i.image_description?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (i.url?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingImage(null);
    setFormData(emptyForm);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openUploadModal = () => {
    setUploadData({ is_public: false, is_common_use: false, additional_context: "", image_description: "" });
    setErrorMessage(null);
    setIsUploadModalOpen(true);
  };

  const openEditModal = (image: ImageRow) => {
    setEditingImage(image);
    setFormData({
      url: image.url || "",
      is_public: image.is_public,
      is_common_use: image.is_common_use,
      additional_context: image.additional_context || "",
      image_description: image.image_description || "",
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingImage(null);
    setFormData(emptyForm);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (editingImage) {
        const result = await updateImage(editingImage.id, formData);
        if (result.error) { setErrorMessage(result.error); return; }
        setImages(images.map((img) => img.id === editingImage.id ? (result.data as ImageRow) : img));
      } else {
        const result = await createImage(formData);
        if (result.error) { setErrorMessage(result.error); return; }
        setImages([result.data as ImageRow, ...images]);
      }
      closeModal();
      router.refresh();
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) { setErrorMessage("Please select a file"); return; }

    setIsSubmitting(true);
    setErrorMessage(null);

    const formDataObj = new FormData();
    formDataObj.append("file", file);
    formDataObj.append("is_public", String(uploadData.is_public));
    formDataObj.append("is_common_use", String(uploadData.is_common_use));
    formDataObj.append("image_description", uploadData.image_description);
    formDataObj.append("additional_context", uploadData.additional_context);

    try {
      const result = await uploadImage(formDataObj);
      if (result.error) { setErrorMessage(result.error); return; }
      setImages([result.data as ImageRow, ...images]);
      setIsUploadModalOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteImage(id);
      if (result.error) { alert(`Failed to delete image: ${result.error}`); return; }
      setImages(images.filter((img) => img.id !== id));
      setDeleteConfirm(null);
      router.refresh();
    } catch (error: unknown) {
      alert(`Failed to delete image: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <>
      <div className="bg-[#1a2332] rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <input
            type="text"
            placeholder="Search images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-500 w-full sm:max-w-sm"
          />
          <div className="flex gap-2 items-center">
            <div className="flex bg-[#0f1623] rounded-lg border border-slate-700 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === "grid" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === "table" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
            <button onClick={openUploadModal} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all">
              Upload Image
            </button>
            <button onClick={openCreateModal} className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all">
              Add by URL
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="p-6">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No images found</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filtered.map((image) => (
                  <div key={image.id} className="group relative bg-[#0f1623] rounded-lg border border-slate-800 overflow-hidden hover:border-slate-700 transition-colors">
                    <div className="aspect-square bg-slate-900 relative">
                      {image.url ? (
                        <img src={image.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(image)}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        {deleteConfirm === image.id ? (
                          <>
                            <button
                              onClick={() => handleDelete(image.id)}
                              className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="p-2 bg-slate-500 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(image.id)}
                            className="p-2 bg-white/20 rounded-lg hover:bg-red-500/80 transition-colors"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-slate-300 truncate">{image.image_description || "No description"}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {image.is_public && <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded">Public</span>}
                        {image.is_common_use && <span className="px-1.5 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-400 rounded">Common</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#151d2e]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Preview</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">URL / Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Flags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No images found</td></tr>
                ) : (
                  filtered.map((image) => (
                    <tr key={image.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-16 h-16 bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                          {image.url && <img src={image.url} alt="" className="w-full h-full object-cover" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-300 max-w-xs truncate">{image.image_description || "No description"}</div>
                        <div className="text-xs text-slate-500 max-w-xs truncate">{image.url}</div>
                        {image.additional_context && <div className="text-xs text-slate-600 mt-1 max-w-xs truncate">Context: {image.additional_context}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {image.is_public && <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded">Public</span>}
                          {image.is_common_use && <span className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded">Common Use</span>}
                          {!image.is_public && !image.is_common_use && <span className="text-xs text-slate-500">None</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{new Date(image.created_datetime_utc).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {deleteConfirm === image.id ? (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleDelete(image.id)} className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Confirm</button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-xs px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => openEditModal(image)} className="text-xs px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">Edit</button>
                            <button onClick={() => setDeleteConfirm(image.id)} className="text-xs px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* URL Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingImage ? "Edit Image" : "Add Image by URL"}>
        <form onSubmit={handleSubmit}>
          {errorMessage && <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/20"><p className="text-sm text-red-400">{errorMessage}</p></div>}
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">URL *</label>
              <input type="url" required value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-500" placeholder="https://example.com/image.jpg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea value={formData.image_description} onChange={(e) => setFormData({ ...formData, image_description: e.target.value })} rows={3} className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-500" placeholder="Describe the image..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Additional Context</label>
              <input type="text" value={formData.additional_context} onChange={(e) => setFormData({ ...formData, additional_context: e.target.value })} className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-500" />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_public} onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50" />
                <span className="text-sm text-slate-300">Public</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_common_use} onChange={(e) => setFormData({ ...formData, is_common_use: e.target.checked })} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50" />
                <span className="text-sm text-slate-300">Common Use</span>
              </label>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 transition-all">
              {isSubmitting ? "Saving..." : editingImage ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Image">
        <form onSubmit={handleUpload}>
          {errorMessage && <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/20"><p className="text-sm text-red-400">{errorMessage}</p></div>}
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Image File *</label>
              <input ref={fileInputRef} type="file" accept="image/*" required className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-slate-700 file:text-slate-300 hover:file:bg-slate-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea value={uploadData.image_description} onChange={(e) => setUploadData({ ...uploadData, image_description: e.target.value })} rows={3} className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-500" placeholder="Describe the image..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Additional Context</label>
              <input type="text" value={uploadData.additional_context} onChange={(e) => setUploadData({ ...uploadData, additional_context: e.target.value })} className="w-full px-3 py-2 bg-[#0f1623] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-500" />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={uploadData.is_public} onChange={(e) => setUploadData({ ...uploadData, is_public: e.target.checked })} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50" />
                <span className="text-sm text-slate-300">Public</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={uploadData.is_common_use} onChange={(e) => setUploadData({ ...uploadData, is_common_use: e.target.checked })} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50" />
                <span className="text-sm text-slate-300">Common Use</span>
              </label>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
            <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 transition-all">
              {isSubmitting ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
