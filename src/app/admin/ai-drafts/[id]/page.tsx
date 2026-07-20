"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/categories";
import { 
  getDraftById, 
  updateDraft, 
  publishDraft, 
  rejectDraft, 
  retryDraft 
} from "@/lib/api/ai-drafts";
import type { Category, AttributeDef } from "@/types/category";
import type { AIListingDraft } from "@/types/ai-draft";
import { 
  Sparkles, 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertCircle,
  FileText,
  DollarSign,
  Tag,
  Briefcase,
  Layers,
  Image as ImageIcon
} from "lucide-react";

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "for_parts", label: "For Parts" },
];

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default function AIReviewPage({ params }: ReviewPageProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const resolvedParams = use(params);
  const draftId = resolvedParams.id;

  // Categories list
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const leafCategories = categories.filter((c) => c.parentId !== null);

  // Fetch single draft
  const { data: draft, isLoading, error, refetch } = useQuery<AIListingDraft>({
    queryKey: ["ai-drafts", draftId],
    queryFn: () => getDraftById(draftId),
  });

  // State overrides
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [priceRaw, setPriceRaw] = useState(""); // Taka string
  const [condition, setCondition] = useState<string>("good");
  const [attributes, setAttributes] = useState<Record<string, string | number | boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Update form fields when draft loads
  useEffect(() => {
    if (draft && draft.status !== "processing") {
      const ai = draft.aiExtracted || {};
      setTitle(ai.suggestedTitle || "");
      setDescription(ai.suggestedDescription || "");
      setShortDescription(
        draft.overrideShortDescription || 
        ai.suggestedDescription?.substring(0, 100) || 
        ""
      );
      setCategoryId((ai.suggestedCategoryId as string) || "");
      setBrand(draft.overrideBrand || ai.detectedBrand || "");
      setCondition(ai.detectedConditionGrade || "good");
      
      // Determine initial price (override > average suggested > empty)
      const initialPrice = draft.overridePrice 
        ? draft.overridePrice / 100 
        : (ai.suggestedPriceRange?.avg ? ai.suggestedPriceRange.avg / 100 : "");
      setPriceRaw(String(initialPrice));

      setAttributes(ai.suggestedAttributes || {});
    }
  }, [draft]);

  // Derived schema from selected category
  const selectedCategory = leafCategories.find((c) => c._id === categoryId);
  const attrSchema: AttributeDef[] = selectedCategory?.attributeSchema ?? [];

  // Reset/adapt attributes when category changes
  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId);
    // Merge or reset attributes
    setAttributes({});
  };

  const handleAttrChange = (key: string, val: string, type: string) => {
    let parsed: string | number | boolean = val;
    if (type === "number") parsed = val === "" ? "" : Number(val);
    if (type === "boolean") parsed = val === "true";
    setAttributes((prev) => ({ ...prev, [key]: parsed }));
  };

  // Form submit edits payload builder
  const getPayload = () => {
    return {
      suggestedTitle: title,
      suggestedDescription: description,
      suggestedCategoryId: categoryId || undefined,
      suggestedAttributes: attributes,
      detectedConditionGrade: condition as any,
      price: priceRaw ? Math.round(parseFloat(priceRaw) * 100) : undefined, // taka -> poisha
      brand: brand || undefined,
      shortDescription: shortDescription || undefined,
    };
  };

  // ── Mutators ─────────────────────────────────────────────────────────────
  const { mutate: saveDraft, isPending: saving } = useMutation({
    mutationFn: (input: any) => updateDraft(draftId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-drafts"] });
      setErrorMsg(null);
      alert("Draft changes saved successfully.");
    },
    onError: (err: any) => setErrorMsg(err.message || "Failed to save draft changes"),
  });

  const { mutate: publish, isPending: publishing } = useMutation({
    mutationFn: () => publishDraft(draftId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["ai-drafts"] });
      // Redirect to public product details
      router.push(`/products/${data.product.slug}`);
    },
    onError: (err: any) => setErrorMsg(err.message || "Failed to publish listing"),
  });

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: () => rejectDraft(draftId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-drafts"] });
      router.push("/admin/ai-drafts");
    },
    onError: (err: any) => setErrorMsg(err.message || "Failed to reject draft"),
  });

  const { mutate: retry, isPending: retrying } = useMutation({
    mutationFn: () => retryDraft(draftId),
    onSuccess: () => {
      refetch();
    },
    onError: (err: any) => setErrorMsg(err.message || "Failed to retry pipeline"),
  });

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Save changes first
    const payload = getPayload();
    try {
      await updateDraft(draftId, payload);
      publish();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save changes before publishing");
    }
  };

  const handleSaveOnly = () => {
    setErrorMsg(null);
    const payload = getPayload();
    saveDraft(payload);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 size={32} className="animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-2" />
        <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Draft not found</h3>
        <button onClick={() => router.back()} className="mt-4 text-purple-600 hover:underline">
          Go back &rarr;
        </button>
      </div>
    );
  }

  // Handle Loading/Processing Status
  if (draft.status === "processing") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <Loader2 size={40} className="animate-spin text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Processing Draft...</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Pipeline is currently running. Please wait a moment.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:underline"
          >
            <RefreshCw size={14} /> Refresh status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => router.push("/admin/ai-drafts")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 mb-6 group transition-colors"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to drafts
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Review Draft Suggestions
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Draft created on {new Date(draft.createdAt).toLocaleDateString()} &bull; Created by Admin
          </p>
        </div>

        {/* Top Status */}
        <div className="flex items-center gap-3">
          {draft.status === "failed" ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs font-semibold">
              Pipeline Failed
            </span>
          ) : draft.status === "approved" ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-semibold">
              Published
            </span>
          ) : draft.status === "rejected" ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 text-xs font-semibold">
              Rejected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-semibold">
              Ready for Review
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3.5 text-sm dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 mb-6">
          {errorMsg}
        </div>
      )}

      {/* If Pipeline Failed: Show Prominent Card */}
      {draft.status === "failed" && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 dark:border-red-950/20 dark:bg-red-950/10 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="font-bold text-red-950 dark:text-red-400">AI pipeline failed to complete</h3>
                <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                  Error: {draft.errorMessage || "Unknown error occurred"}
                </p>
              </div>
            </div>
            <button
              onClick={() => retry()}
              disabled={retrying}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold active:scale-95 transition-all"
            >
              <RefreshCw size={14} className={retrying ? "animate-spin" : ""} />
              {retrying ? "Retrying..." : "Retry Pipeline"}
            </button>
          </div>
        </div>
      )}

      {/* Main Form + Photos Workspace */}
      <form onSubmit={handlePublish} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Photo Gallery & Pricing Analysis */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Photo Gallery */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-1.5">
              <ImageIcon className="text-purple-500" size={20} />
              Draft Photos
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {draft.rawImages.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-xl border border-zinc-200 overflow-hidden dark:border-zinc-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Pricing Tool Analysis */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-1.5">
              <DollarSign className="text-purple-500" size={20} />
              Market Pricing Suggestion
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">
              AI scanned matching categories and similar condition listings.
            </p>

            {draft.aiExtracted?.suggestedPriceRange?.sampleSize && 
            draft.aiExtracted.suggestedPriceRange.sampleSize > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase">Min Price</span>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                      ৳{(draft.aiExtracted.suggestedPriceRange.min! / 100).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200/50 rounded-xl">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">Avg (Mid)</span>
                    <p className="text-sm font-extrabold text-purple-700 dark:text-purple-300 mt-0.5">
                      ৳{(draft.aiExtracted.suggestedPriceRange.avg! / 100).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase">Max Price</span>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                      ৳{(draft.aiExtracted.suggestedPriceRange.max! / 100).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                  Sample size: <strong>{draft.aiExtracted.suggestedPriceRange.sampleSize}</strong> comparable gadget listings found.
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50/50 border border-amber-200/50 p-4 dark:bg-amber-950/10 dark:border-amber-900/20">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
                  No comparable products found yet for this category & condition combination. Please set the selling price manually.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right 2 Cols: Form Fields overrides */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Basic Info */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <FileText className="text-purple-500" size={20} />
              Basic Product Details
            </h2>

            <FormField label="Suggested Title *">
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className={inputClass}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Brand">
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Condition Grade *">
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className={inputClass}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="Short Description (Listing Summary) *">
              <textarea
                rows={2}
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Concise one-liner summary"
                maxLength={500}
                className={inputClass}
              />
            </FormField>

            <FormField label="Full Description *">
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description body"
                className={inputClass}
              />
            </FormField>
          </section>

          {/* Categorization & Dynamic Specs */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Layers className="text-purple-500" size={20} />
              Categorization & Specifications
            </h2>

            <FormField label="Category *">
              <select
                required
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={inputClass}
              >
                <option value="">Select category...</option>
                {leafCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.path.replace(/\./g, " › ")} — {c.name}
                  </option>
                ))}
              </select>
            </FormField>

            {attrSchema.length > 0 && (
              <div className="mt-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-400">
                  Dynamic Specs for {selectedCategory?.name}
                </h3>
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
              </div>
            )}
          </section>

          {/* Target Price */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <DollarSign className="text-purple-500" size={20} />
              Set Listing Price
            </h2>
            <FormField label="Price (BDT Taka) *">
              <input
                required
                type="number"
                min="1"
                step="1"
                value={priceRaw}
                onChange={(e) => setPriceRaw(e.target.value)}
                placeholder="Price"
                className={inputClass}
              />
            </FormField>
          </section>

          {/* Submits / Decisions */}
          {draft.status !== "approved" && (
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
              <button
                type="submit"
                disabled={publishing || saving || rejecting}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-600/10 active:scale-95 transition-all"
              >
                <CheckCircle size={16} />
                Approve & Publish Listing
              </button>

              <button
                type="button"
                onClick={handleSaveOnly}
                disabled={publishing || saving || rejecting}
                className="w-full sm:inline-flex justify-center items-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 px-6 py-3.5 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                <Save size={16} />
                Save Changes
              </button>

              <button
                type="button"
                onClick={() => reject()}
                disabled={publishing || saving || rejecting}
                className="w-full sm:inline-flex justify-center items-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3.5 text-sm font-semibold dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
              >
                <XCircle size={16} />
                Reject Draft
              </button>
            </div>
          )}

          {draft.status === "approved" && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/20 text-green-700 dark:text-green-400 font-medium text-sm rounded-xl text-center">
              This draft was approved and published successfully.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

// Form helper component
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 transition-all";

const Loader2 = ({ size, className }: { size?: number; className?: string }) => (
  <RefreshCw size={size} className={`animate-spin ${className}`} />
);
