"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getCategories } from "@/lib/api/categories";
import { createProduct } from "@/lib/api/products";
import type { Category, AttributeDef } from "@/types/category";

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "for_parts", label: "For Parts" },
];

interface ImageEntry {
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export default function AddItemPage() {
  const router = useRouter();
  const qc = useQueryClient();

  // Category list
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const leafCategories = categories.filter((c) => c.parentId !== null);

  // Form state
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [priceRaw, setPriceRaw] = useState(""); // Taka string from user
  const [compareAtPriceRaw, setCompareAtPriceRaw] = useState("");
  const [condition, setCondition] = useState<string>("new");
  const [stock, setStock] = useState("1");
  const [status, setStatus] = useState("draft");
  const [attributes, setAttributes] = useState<Record<string, string | number | boolean>>({});
  const [images, setImages] = useState<ImageEntry[]>([{ url: "", alt: "", isPrimary: true, order: 0 }]);
  const [serverError, setServerError] = useState<string | null>(null);

  // Derived schema from selected category
  const selectedCategory = leafCategories.find((c) => c._id === categoryId);
  const attrSchema: AttributeDef[] = selectedCategory?.attributeSchema ?? [];

  // Reset attributes when category changes
  useEffect(() => {
    setAttributes({});
  }, [categoryId]);

  const { mutate, isPending } = useMutation({
    mutationFn: createProduct,
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      router.push(`/products/${product.slug}`);
    },
    onError: (err: any) => {
      setServerError(err?.message ?? "Something went wrong");
    },
  });

  const handleAttrChange = (key: string, val: string, type: string) => {
    let parsed: string | number | boolean = val;
    if (type === "number") parsed = Number(val);
    if (type === "boolean") parsed = val === "true";
    setAttributes((prev) => ({ ...prev, [key]: parsed }));
  };

  const handleImageChange = (idx: number, field: keyof ImageEntry, value: string | boolean) => {
    setImages((prev) => {
      const next = [...prev];
      if (field === "isPrimary" && value === true) {
        // Unset all others
        next.forEach((img, i) => { next[i] = { ...img, isPrimary: i === idx }; });
      } else {
        next[idx] = { ...next[idx], [field]: value };
      }
      return next;
    });
  };

  const addImageRow = () => {
    setImages((prev) => [...prev, { url: "", alt: "", isPrimary: false, order: prev.length }]);
  };

  const removeImageRow = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      // Ensure at least one is primary
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next.map((img, i) => ({ ...img, order: i }));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validImages = images.filter((img) => img.url.trim() !== "");
    if (validImages.length === 0) {
      setServerError("Please add at least one image URL.");
      return;
    }

    const payload = {
      title,
      shortDescription,
      description,
      categoryId,
      brand: brand || undefined,
      price: Math.round(parseFloat(priceRaw) * 100), // taka → poisha
      compareAtPrice: compareAtPriceRaw ? Math.round(parseFloat(compareAtPriceRaw) * 100) : undefined,
      condition,
      attributes,
      images: validImages,
      stock: parseInt(stock, 10),
      status,
    };

    mutate(payload);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add New Listing</h1>
        <p className="text-default-500 mt-1">Fill in the details below to add a new product to the store.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {serverError}
          </div>
        )}

        {/* Basic Info */}
        <section className="flex flex-col gap-4 p-6 bg-default-50 rounded-2xl border border-default-200">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          <FormField label="Title *">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. iPhone 14 Pro 256GB Space Black"
              className={inputClass}
            />
          </FormField>

          <FormField label="Short Description *">
            <textarea
              required
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="One-liner summary (max 500 chars)"
              maxLength={500}
              className={inputClass}
            />
          </FormField>

          <FormField label="Full Description *">
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed product description..."
              className={inputClass}
            />
          </FormField>

          <FormField label="Brand">
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Apple, Samsung, Logitech"
              className={inputClass}
            />
          </FormField>
        </section>

        {/* Category */}
        <section className="flex flex-col gap-4 p-6 bg-default-50 rounded-2xl border border-default-200">
          <h2 className="text-lg font-semibold">Category</h2>
          <FormField label="Category *">
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a category...</option>
              {leafCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.path.replace(/\./g, " › ")} — {cat.name}
                </option>
              ))}
            </select>
          </FormField>
        </section>

        {/* Dynamic Attribute Fields */}
        {attrSchema.length > 0 && (
          <section className="flex flex-col gap-4 p-6 bg-default-50 rounded-2xl border border-default-200">
            <h2 className="text-lg font-semibold">Specifications</h2>
            <p className="text-sm text-default-500">
              Fields specific to <strong>{selectedCategory?.name}</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {attrSchema.map((attr) => (
                <FormField
                  key={attr.key}
                  label={`${attr.label}${attr.unit ? ` (${attr.unit})` : ""}${attr.required ? " *" : ""}`}
                >
                  {attr.type === "enum" ? (
                    <select
                      required={attr.required}
                      value={(attributes[attr.key] as string) ?? ""}
                      onChange={(e) => handleAttrChange(attr.key, e.target.value, "string")}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      {attr.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : attr.type === "boolean" ? (
                    <select
                      required={attr.required}
                      value={attributes[attr.key] !== undefined ? String(attributes[attr.key]) : ""}
                      onChange={(e) => handleAttrChange(attr.key, e.target.value, "boolean")}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      type={attr.type === "number" ? "number" : "text"}
                      required={attr.required}
                      value={(attributes[attr.key] as string | number) ?? ""}
                      onChange={(e) => handleAttrChange(attr.key, e.target.value, attr.type)}
                      placeholder={attr.unit ? `in ${attr.unit}` : ""}
                      className={inputClass}
                    />
                  )}
                </FormField>
              ))}
            </div>
          </section>
        )}

        {/* Pricing */}
        <section className="flex flex-col gap-4 p-6 bg-default-50 rounded-2xl border border-default-200">
          <h2 className="text-lg font-semibold">Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Price (BDT Taka) *">
              <input
                required
                type="number"
                min="1"
                step="1"
                value={priceRaw}
                onChange={(e) => setPriceRaw(e.target.value)}
                placeholder="e.g. 15000"
                className={inputClass}
              />
            </FormField>
            <FormField label="Compare-at Price (BDT Taka)">
              <input
                type="number"
                min="1"
                step="1"
                value={compareAtPriceRaw}
                onChange={(e) => setCompareAtPriceRaw(e.target.value)}
                placeholder="Optional original price"
                className={inputClass}
              />
            </FormField>
          </div>
        </section>

        {/* Condition & Stock */}
        <section className="flex flex-col gap-4 p-6 bg-default-50 rounded-2xl border border-default-200">
          <h2 className="text-lg font-semibold">Condition & Stock</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Condition *">
              <select
                required
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className={inputClass}
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Stock Quantity *">
              <input
                required
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={inputClass}
              />
            </FormField>
          </div>
        </section>

        {/* Images */}
        <section className="flex flex-col gap-4 p-6 bg-default-50 rounded-2xl border border-default-200">
          <h2 className="text-lg font-semibold">Images</h2>
          <p className="text-sm text-default-500">
            Paste direct image URLs. The image marked as &quot;Primary&quot; will be the main display photo.
          </p>
          {images.map((img, idx) => (
            <div key={idx} className="flex flex-col gap-2 p-4 border border-default-200 rounded-xl bg-white">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-default-600">Image {idx + 1}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="primaryImage"
                      checked={img.isPrimary}
                      onChange={() => handleImageChange(idx, "isPrimary", true)}
                    />
                    Primary
                  </label>
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageRow(idx)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <input
                type="url"
                required={idx === 0}
                value={img.url}
                onChange={(e) => handleImageChange(idx, "url", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className={inputClass}
              />
              <input
                type="text"
                value={img.alt}
                onChange={(e) => handleImageChange(idx, "alt", e.target.value)}
                placeholder="Alt text (optional)"
                className={inputClass}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addImageRow}
            className="text-sm text-primary hover:underline text-left font-medium"
          >
            + Add another image
          </button>
        </section>

        {/* Publish Status */}
        <section className="flex flex-col gap-4 p-6 bg-default-50 rounded-2xl border border-default-200">
          <h2 className="text-lg font-semibold">Publish Status</h2>
          <div className="flex items-center gap-4">
            {["draft", "published"].map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                />
                <span className="capitalize font-medium">{s}</span>
              </label>
            ))}
          </div>
          {status === "draft" && (
            <p className="text-xs text-default-400">
              Draft listings are not visible to shoppers until published.
            </p>
          )}
        </section>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3 text-black rounded-xl bg-primary  font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create Listing"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl border border-default-200 text-default-600 font-medium hover:bg-default-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Helper sub-component ──────────────────────────────────────────────────────
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-default-700">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-default-200 bg-white px-3 py-2 text-sm text-default-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";
