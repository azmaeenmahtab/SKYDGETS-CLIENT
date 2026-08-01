"use client";

import { useState, useEffect, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCategories } from "@/lib/api/categories";
import { updateProduct } from "@/lib/api/products";
import { apiGet } from "@/lib/api/client";
import { HeroSelect } from "@/components/common/HeroSelect";
import { formatPrice } from "@/lib/utils";
import type { Category, AttributeDef } from "@/types/category";
import type { Product } from "@/types/product";
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

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();

  // Fetch product data
  const { data: product, isLoading: isProductLoading } = useQuery<Product>({
    queryKey: ["product-edit", id],
    queryFn: () => apiGet<Product>(`/products/${id}`),
  });

  // Fetch Category list
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
  const [priceRaw, setPriceRaw] = useState("");
  const [compareAtPriceRaw, setCompareAtPriceRaw] = useState("");
  const [condition, setCondition] = useState<string>("new");
  const [stock, setStock] = useState("1");
  const [status, setStatus] = useState("published");
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  // Populate form state when product loads
  useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setShortDescription(product.shortDescription || "");
      setDescription(product.description || "");
      setCategoryId(product.categoryId || "");
      setBrand(product.brand || "");
      setPriceRaw(String(product.price ? product.price / 100 : ""));
      setCompareAtPriceRaw(product.compareAtPrice ? String(product.compareAtPrice / 100) : "");
      setCondition(product.condition || "new");
      setStock(String(product.stock ?? 1));
      setStatus(product.status || "published");
      setAttributes(product.attributes || {});
      setImages(
        product.images?.length
          ? product.images
          : [{ url: "", alt: "", isPrimary: true, order: 0 }]
      );
    }
  }, [product]);

  // Derived schema from selected category
  const selectedCategory = leafCategories.find((c) => c._id === categoryId);
  const attrSchema: AttributeDef[] = selectedCategory?.attributeSchema ?? [];

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (input: any) => updateProduct(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product specification updated successfully!");
      router.push("/admin/products");
    },
    onError: (err: any) => {
      setServerError(err?.message ?? "Failed to update product.");
      toast.error("Failed to update product");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const priceTaka = parseFloat(priceRaw);
    if (isNaN(priceTaka) || priceTaka <= 0) {
      setServerError("Please enter a valid price in Taka.");
      return;
    }

    const priceInPoisha = Math.round(priceTaka * 100);
    const compareAtTaka = parseFloat(compareAtPriceRaw);
    const compareAtInPoisha = !isNaN(compareAtTaka) && compareAtTaka > 0
      ? Math.round(compareAtTaka * 100)
      : undefined;

    const validImages = images
      .filter((img) => img.url.trim().length > 0)
      .map((img, idx) => ({ ...img, order: idx }));

    if (validImages.length === 0) {
      setServerError("At least one product image URL is required.");
      return;
    }

    const payload = {
      title,
      shortDescription,
      description,
      categoryId: categoryId || undefined,
      brand: brand || undefined,
      price: priceInPoisha,
      compareAtPrice: compareAtInPoisha,
      condition,
      stock: parseInt(stock, 10) || 1,
      status,
      attributes,
      images: validImages,
    };

    updateMutation.mutate(payload);
  };

  const handleAddImageRow = () => {
    setImages((prev) => [
      ...prev,
      { url: "", alt: "", isPrimary: prev.length === 0, order: prev.length },
    ]);
  };

  const handleRemoveImageRow = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  const handleSetPrimaryImage = (idx: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === idx }))
    );
  };

  const categoryOptions = [
    { id: "", label: "Select a Category" },
    ...leafCategories.map((c) => ({
      id: c._id,
      label: `${c.path.replace(/\./g, " › ")} — ${c.name}`,
    })),
  ];

  if (isProductLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      {/* Background Spotlight */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.06),rgba(255,255,255,0))]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-28 sm:pt-32 pb-16 sm:px-6 lg:px-8 w-full space-y-6">
        
        {/* Navigation back */}
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inventory Manager
          </Link>
          <div className="mt-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-2">
              <Package className="w-3.5 h-3.5" />
              <span>EDIT SPECIFICATION</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
              Edit Product Specification
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Update pricing, physical condition grade, stock availability, and image gallery.
            </p>
          </div>
        </div>

        {serverError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-semibold">{serverError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: Core Details */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
            <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-500" />
              Basic Information
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Apple iPhone 14 Pro — 256GB Deep Purple"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Brand *
                </label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple, Samsung, Dell"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

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
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Short Tagline Summary
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="High-tier flagship device in pristine like-new condition"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Full Description & Physical Condition Notes
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about battery health, screen condition, micro scratches..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
          </div>

          {/* Card 2: Pricing & Inventory Stock */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
            <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              Pricing & Stock Levels
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Listing Price (BDT ৳) *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={priceRaw}
                  onChange={(e) => setPriceRaw(e.target.value)}
                  placeholder="e.g. 85000"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-extrabold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Original Compare Price (BDT ৳)
                </label>
                <input
                  type="number"
                  step="any"
                  value={compareAtPriceRaw}
                  onChange={(e) => setCompareAtPriceRaw(e.target.value)}
                  placeholder="e.g. 110000"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Stock Units Available *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="1"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
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

          {/* Card 3: Product Images */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" />
                Product Images
              </h2>
              <button
                type="button"
                onClick={handleAddImageRow}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Image Row
              </button>
            </div>

            <div className="space-y-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-800"
                >
                  {/* Thumbnail preview */}
                  <div className="relative w-14 h-14 rounded-xl bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                    {img.url ? (
                      <img src={img.url} alt={img.alt || "Product"} className="w-full h-full object-cover" />
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
                      onChange={(e) => {
                        const val = e.target.value;
                        setImages((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, url: val } : item))
                        );
                      }}
                      className="w-full text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="radio"
                        name="primaryImage"
                        checked={img.isPrimary}
                        onChange={() => handleSetPrimaryImage(idx)}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span>Primary</span>
                    </label>

                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImageRow(idx)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Remove Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit CTAs */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              href="/admin/products"
              className="px-8 py-3.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-8 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <span>Saving Specification...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Specification</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
