"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCategories } from "@/lib/api/categories";
import { createProduct } from "@/lib/api/products";
import { HeroSelect } from "@/components/common/HeroSelect";
import type { Category, AttributeDef } from "@/types/category";
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  Image as ImageIcon,
  DollarSign,
  Tag,
  ShieldCheck,
  Layers
} from "lucide-react";
import { toast } from "react-hot-toast";

const CONDITIONS = [
  { id: "new", label: "New" },
  { id: "like_new", label: "Like New" },
  { id: "good", label: "Good" },
  { id: "fair", label: "Fair" },
  { id: "for_parts", label: "For Parts" },
];

const STATUSES = [
  { id: "published", label: "Published (Live in Store)" },
  { id: "draft", label: "Draft (Hidden)" },
  { id: "archived", label: "Archived" },
  { id: "sold_out", label: "Sold Out" },
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
  const [condition, setCondition] = useState<string>("like_new");
  const [stock, setStock] = useState("1");
  const [status, setStatus] = useState("published");
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
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully!");
      router.push(`/products/${product.slug}`);
    },
    onError: (err: any) => {
      setServerError(err?.message ?? "Something went wrong while creating the product.");
      toast.error("Failed to create product");
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
        next.forEach((img, i) => { next[i] = { ...img, isPrimary: i === idx }; });
      } else {
        next[idx] = { ...next[idx], [field]: value };
      }
      return next;
    });
  };

  const addImageRow = () => {
    setImages((prev) => [...prev, { url: "", alt: "", isPrimary: prev.length === 0, order: prev.length }]);
  };

  const removeImageRow = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next.map((img, i) => ({ ...img, order: i }));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const priceTaka = parseFloat(priceRaw);
    if (isNaN(priceTaka) || priceTaka <= 0) {
      setServerError("Please enter a valid price in Taka.");
      return;
    }

    const validImages = images.filter((img) => img.url.trim() !== "");
    if (validImages.length === 0) {
      setServerError("Please add at least one valid image URL.");
      return;
    }

    const compareAtTaka = parseFloat(compareAtPriceRaw);

    const payload = {
      title,
      shortDescription,
      description,
      categoryId,
      brand: brand || undefined,
      price: Math.round(priceTaka * 100), // taka → poisha
      compareAtPrice: !isNaN(compareAtTaka) && compareAtTaka > 0 ? Math.round(compareAtTaka * 100) : undefined,
      condition,
      attributes,
      images: validImages,
      stock: parseInt(stock, 10) || 1,
      status,
    };

    mutate(payload);
  };

  const categoryOptions = [
    { id: "", label: "Select a Category" },
    ...leafCategories.map((c) => ({
      id: c._id,
      label: `${c.path.replace(/\./g, " › ")} — ${c.name}`,
    })),
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-zinc-900">
      {/* Background Radial Grid Spotlight */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.06),rgba(255,255,255,0))]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-28 sm:pt-32 pb-16 sm:px-6 lg:px-8 w-full space-y-6">
        
        {/* Navigation back */}
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inventory Manager
          </Link>

          <div className="mt-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20 mb-2">
              <Package className="w-3.5 h-3.5" />
              <span>NEW PRODUCT LISTING</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
              Create New Hardware Listing
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Add verified gadget specifications, set condition grades, upload photo URLs, and publish to catalog.
            </p>
          </div>
        </div>

        {serverError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-600">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-semibold">{serverError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: Core Details */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-sm space-y-5">
            <h2 className="text-lg font-extrabold text-zinc-950 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-500" />
              Basic Information
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Apple iPhone 14 Pro 256GB — Deep Purple (Like New)"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Brand *
                </label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple, Samsung, Dell, Asus"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              {/* HeroSelect for Category */}
              <div>
                <HeroSelect
                  label="Category *"
                  value={categoryId}
                  onChange={setCategoryId}
                  options={categoryOptions}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Short Tagline Summary *
              </label>
              <input
                type="text"
                required
                maxLength={500}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="High-tier flagship device in pristine like-new condition with 94% battery health"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Full Description & Physical Condition Notes *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed information regarding screen scratch status, chassis condition, battery health metrics, box inclusions..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-medium"
              />
            </div>
          </div>

          {/* Card 2: Dynamic Category Attributes */}
          {attrSchema.length > 0 && (
            <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-sm space-y-4">
              <h2 className="text-lg font-extrabold text-zinc-950 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                {selectedCategory?.name} Technical Specifications
              </h2>
              <p className="text-xs text-zinc-500">
                Attributes specific to category <strong>{selectedCategory?.name}</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attrSchema.map((attr) => (
                  <div key={attr.key}>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                      {attr.label} {attr.unit ? `(${attr.unit})` : ""}{attr.required ? " *" : ""}
                    </label>

                    {attr.type === "enum" ? (
                      <HeroSelect
                        value={(attributes[attr.key] as string) ?? ""}
                        onChange={(val) => handleAttrChange(attr.key, val, "string")}
                        options={[
                          { id: "", label: "Select Option..." },
                          ...(attr.options?.map((opt) => ({ id: opt, label: opt })) ?? []),
                        ]}
                      />
                    ) : attr.type === "boolean" ? (
                      <HeroSelect
                        value={String(attributes[attr.key] ?? "")}
                        onChange={(val) => handleAttrChange(attr.key, val, "boolean")}
                        options={[
                          { id: "", label: "Select..." },
                          { id: "true", label: "Yes" },
                          { id: "false", label: "No" },
                        ]}
                      />
                    ) : (
                      <input
                        type={attr.type === "number" ? "number" : "text"}
                        required={attr.required}
                        value={(attributes[attr.key] as string | number) ?? ""}
                        onChange={(e) => handleAttrChange(attr.key, e.target.value, attr.type)}
                        placeholder={`Enter ${attr.label.toLowerCase()}`}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card 3: Pricing & Inventory Stock */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-sm space-y-5">
            <h2 className="text-lg font-extrabold text-zinc-950 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              Pricing & Stock Levels
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Listing Price (BDT ৳) *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={priceRaw}
                  onChange={(e) => setPriceRaw(e.target.value)}
                  placeholder="e.g. 85000"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-extrabold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Compare Original Price (BDT ৳)
                </label>
                <input
                  type="number"
                  step="any"
                  value={compareAtPriceRaw}
                  onChange={(e) => setCompareAtPriceRaw(e.target.value)}
                  placeholder="e.g. 110000"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Stock Units Available *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="1"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <HeroSelect
                  label="Condition Grade *"
                  value={condition}
                  onChange={setCondition}
                  options={CONDITIONS}
                />
              </div>

              <div>
                <HeroSelect
                  label="Publication Status *"
                  value={status}
                  onChange={setStatus}
                  options={STATUSES}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Product Image URLs */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-lg font-extrabold text-zinc-950 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" />
                Product Image URLs
              </h2>
              <button
                type="button"
                onClick={addImageRow}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:underline cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Image Row
              </button>
            </div>

            <div className="space-y-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-200/60"
                >
                  {/* Thumbnail preview */}
                  <div className="relative w-14 h-14 rounded-xl bg-zinc-200 overflow-hidden flex-shrink-0">
                    {img.url ? (
                      <img src={img.url} alt={img.alt || "Product thumbnail"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full">
                    <input
                      type="url"
                      placeholder="Image URL (https://...)"
                      value={img.url}
                      onChange={(e) => handleImageChange(idx, "url", e.target.value)}
                      className="w-full text-xs bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 cursor-pointer">
                      <input
                        type="radio"
                        name="primaryImage"
                        checked={img.isPrimary}
                        onChange={() => handleImageChange(idx, "isPrimary", true)}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span>Primary</span>
                    </label>

                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageRow(idx)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action CTAs */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              href="/admin/products"
              className="px-8 py-3.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <span>Publishing Listing...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create Product Listing</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
