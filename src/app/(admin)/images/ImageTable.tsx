"use client";

import { useState } from "react";
import type { Image } from "@/types/database";
import { useRouter } from "next/navigation";
import { createImage, updateImage, deleteImage, type ImageFormData } from "./actions";

const emptyForm: ImageFormData = {
  url: "",
  is_public: false,
  is_common_use: false,
  additional_context: "",
  image_description: "",
};

export default function ImageTable({ initialImages }: { initialImages: Image[] }) {
  const [images, setImages] = useState(initialImages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<Image | null>(null);
  const [formData, setFormData] = useState<ImageFormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const openCreateModal = () => {
    setEditingImage(null);
    setFormData(emptyForm);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (image: Image) => {
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

        if (result.error) {
          setErrorMessage(result.error);
          return;
        }

        setImages(
          images.map((img) =>
            img.id === editingImage.id ? (result.data as Image) : img
          )
        );
      } else {
        const result = await createImage(formData);

        if (result.error) {
          setErrorMessage(result.error);
          return;
        }

        setImages([result.data as Image, ...images]);
      }

      closeModal();
      router.refresh();
    } catch (error: unknown) {
      console.error("Error saving image:", error);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteImage(id);

      if (result.error) {
        alert(`Failed to delete image: ${result.error}`);
        return;
      }

      setImages(images.filter((img) => img.id !== id));
      setDeleteConfirm(null);
      router.refresh();
    } catch (error: unknown) {
      console.error("Error deleting image:", error);
      alert(`Failed to delete image: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <span className="text-sm text-gray-600">Manage images</span>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Image
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL / Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {images.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No images found
                  </td>
                </tr>
              ) : (
                images.map((image) => (
                  <tr key={image.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                        {image.url && (
                          <img
                            src={image.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {image.image_description || "No description"}
                      </div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">
                        {image.url}
                      </div>
                      {image.additional_context && (
                        <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                          Context: {image.additional_context}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {image.is_public && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                            Public
                          </span>
                        )}
                        {image.is_common_use && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                            Common Use
                          </span>
                        )}
                        {!image.is_public && !image.is_common_use && (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(image.created_datetime_utc).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {deleteConfirm === image.id ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleDelete(image.id)}
                            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openEditModal(image)}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(image.id)}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Delete
                          </button>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingImage ? "Edit Image" : "Add Image"}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              {errorMessage && (
                <div className="px-6 py-3 bg-red-50 border-b border-red-200">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.image_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        image_description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Describe the image..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Context
                  </label>
                  <input
                    type="text"
                    value={formData.additional_context}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        additional_context: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Any additional context..."
                  />
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) =>
                        setFormData({ ...formData, is_public: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Public</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_common_use}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_common_use: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Common Use</span>
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingImage
                      ? "Update"
                      : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
