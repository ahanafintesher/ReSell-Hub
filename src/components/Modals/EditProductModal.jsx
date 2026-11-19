"use client";

import { useState } from "react";
import { Modal, Button } from "@heroui/react";
import { Pencil, AlertCircle, Save, Loader2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { editProducts } from "@/lib/actions/product";

const CATEGORIES = [
  "Electronics",
  "Audio",
  "Wearables",
  "Accessories",
  "Fashion",
  "Furniture",
  "Vehicles",
  "Mobile Phones",
  "Others",
];

const CONDITIONS = [
  "New",
  "Like New",
  "Used - Excellent",
  "Used - Good",
  "Used - Fair",
];

const STATUS_OPTIONS = [
  { id: "available", label: "Available" },
  { id: "hidden", label: "Hidden" },
  { id: "sold", label: "Sold" },
];

export function EditProductModal({ product, onSuccess }) {
  const [formData, setFormData] = useState({
    title: product.title || product.name || "",
    description: product.description || "",
    price: product.price ?? "",
    category: product.category || "",
    condition: product.condition || "",
    stock: product.stock ?? 1,
    status: product.status || "available",
    image: product.image || "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const newErrors = {};

    if (!formData.title || !formData.title.trim()) {
      newErrors.title = "Product title is required";
    }

    if (formData.price === "" || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = "Price must be a valid non-negative number";
    }

    if (!formData.category || !formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!formData.condition || !formData.condition.trim()) {
      newErrors.condition = "Condition is required";
    }

    if (formData.stock === "" || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = "Stock must be a non-negative number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e, close) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) {
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Saving product changes...");

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category.trim(),
        condition: formData.condition.trim(),
        stock: Number(formData.stock),
        status: formData.status,
        image: formData.image ? formData.image.trim() : "",
      };

      const res = await editProducts(product._id, payload);

      toast.success("Product updated successfully!", { id: toastId });
      onSuccess?.({ ...product, ...payload });
      close?.();
    } catch (err) {
      console.error("Failed to update product:", err);
      const msg = err.message || "Failed to update product";
      setApiError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal>
      <Button
        variant="outline"
        size="sm"
        className="text-xs px-3 py-1.5 h-auto font-medium text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      >
        <span className="flex items-center gap-1.5">
          <Pencil className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Edit
        </span>
      </Button>

      <Modal.Backdrop>
        <Modal.Container placement="center" size="lg">
          <Modal.Dialog className="sm:max-w-[550px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
            {({ close }) => (
              <form onSubmit={(e) => handleSubmit(e, close)}>
                <Modal.CloseTrigger />
                <Modal.Header className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Modal.Heading className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Edit Product Listing
                  </Modal.Heading>
                </Modal.Header>

                <Modal.Body className="py-4 space-y-4 max-h-[75vh] overflow-y-auto">
                  {apiError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{apiError}</span>
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. MacBook Pro 14 M2"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                    {errors.title && (
                      <p className="mt-1 text-xs text-rose-500">{errors.title}</p>
                    )}
                  </div>

                  {/* Price & Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Price (৳) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        min="0"
                        step="any"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      />
                      {errors.price && (
                        <p className="mt-1 text-xs text-rose-500">{errors.price}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        min="0"
                        value={formData.stock}
                        onChange={handleChange}
                        placeholder="1"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      />
                      {errors.stock && (
                        <p className="mt-1 text-xs text-rose-500">{errors.stock}</p>
                      )}
                    </div>
                  </div>

                  {/* Category & Condition */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 capitalize transition cursor-pointer"
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-xs text-rose-500">{errors.category}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Condition *
                      </label>
                      <select
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                      >
                        <option value="">Select Condition</option>
                        {CONDITIONS.map((cond) => (
                          <option key={cond} value={cond}>
                            {cond}
                          </option>
                        ))}
                      </select>
                      {errors.condition && (
                        <p className="mt-1 text-xs text-rose-500">{errors.condition}</p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Listing Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Product Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Product details, specs, included accessories..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition resize-y"
                    />
                  </div>
                </Modal.Body>

                <Modal.Footer className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-end gap-2">
                  <Button
                    slot="close"
                    variant="tertiary"
                    disabled={isSubmitting}
                    className="text-xs px-4 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-xs transition"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Save className="w-3.5 h-3.5" />
                        Save Changes
                      </span>
                    )}
                  </Button>
                </Modal.Footer>
              </form>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
