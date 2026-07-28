"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getCategories } from "@/lib/api/categories";
import { 
  getDraftById, 
  updateDraft, 
  publishDraft, 
  rejectDraft, 
  retryDraft 
} from "@/lib/api/ai-drafts";
import { HeroSelect } from "@/components/common/HeroSelect";
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
  Image as ImageIcon,
  Package,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { toast } from "react-hot-toast";

const CONDITIONS = [
  { id: "new", label: "New" },
  { id: "like_new", label: "Like New" },
  { id: "good", label: "Good" },
  { id: "fair", label: "Fair" },
  { id: "for_parts", label: "For Parts" },
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
  const [condition, setCondition] = useState<string>("like_new");
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
      setCondition(ai.detectedConditionGrade || "like_new");
      
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

  const handleAttrChange = (key: string, val: string, type: string) => {
    let parsed: string | number | boolean = val;
    if (type === "number") parsed = val === "" ? "" : Number(val);
    if (type === "boolean") parsed = val === "true";
    setAttributes((prev) => ({ ...prev, [key]: parsed }));
  };

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

  // Mutators
  const { mutate: saveDraft, isPending: saving } = useMutation({
    mutationFn: (input: any) => updateDraft(draftId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-drafts"] });
      setErrorMsg(null);
      toast.success("Draft changes saved successfully.");
    },
    onError: (err: any) => setErrorMsg(err.message || "Failed to save draft changes"),
  });

  const { mutate: publish, isPending: publishing } = useMutation({
    mutationFn: () => publishDraft(draftId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["ai-drafts"] });
      toast.success("Listing published successfully!");
      router.push(`/products/${data.product.slug}`);
    },
    onError: (err: any) => setErrorMsg(err.message || "Failed to publish listing"),
  });

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: () => rejectDraft(draftId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-drafts"] });
      toast.success("Draft rejected");
      router.push("/admin/ai-drafts");
    },
    onError: (err: any) => setErrorMsg(err.message || "Failed to reject draft"),
  });

  const { mutate: retry, isPending: retrying } = useMutation({
    mutationFn: () => retryDraft(draftId),
    onSuccess: () => {
      refetch();
      toast.success("Pipeline retried");
    },
    onError: (err: any) => setErrorMsg(err.message || "Failed to retry pipeline"),
  });

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

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

  const categoryOptions = [
    { id: "", label: "Select Category..." },
    ...leafCategories.map((c) => ({
      id: c._id,
      label: `${c.path.replace(/\./g, " › ")} — ${c.name}`,
    })),
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col items-center justify-center px-4 pt-28 sm:pt-32 pb-16">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-zinc-950 dark:text-white mb-2">Draft not found</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Could not locate draft with ID {draftId}.</p>
        <Link
          href="/admin/ai-drafts"
          className="px-8 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-extrabold text-xs uppercase tracking-wider"
        >
          Back to AI Drafts
        </Link>
      </div>
    );
  }

  if (draft.status === "processing") {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col items-center justify-center px-4 pt-28 sm:pt-32 pb-16">
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl text-center max-w-md w-full space-y-4">
          <RefreshCw className="w-10 h-10 animate-spin text-purple-600 dark:text-purple-400 mx-auto" />
          <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white">Processing Gemini AI Vision Draft...</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Extracting hardware specifications, physical condition grade, and market pricing ranges.
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider hover:bg-purple-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      {/* Background Spotlight */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.06),rgba(255,255,255,0))]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-28 sm:pt-36 pb-16 sm:px-6 lg:px-8 w-full space-y-6">
        
        {/* Navigation & Header */}
        <div>
          <Link
            href="/admin/ai-drafts"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AI Listing Drafts
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI DRAFT SPECIFICATION REVIEW</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
                Review & Publish AI Draft
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Draft ID: <span className="font-mono text-zinc-900 dark:text-white font-bold">{draft._id}</span> &bull; Created {new Date(draft.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Top Status Pill */}
            <div className="flex items-center gap-3">
              {draft.status === "failed" ? (
                <span className="px-4 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-extrabold uppercase tracking-wider">
                  Pipeline Failed
                </span>
              ) : draft.status === "approved" ? (
                <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-extrabold uppercase tracking-wider">
                  Published
                </span>
              ) : draft.status === "rejected" ? (
                <span className="px-4 py-1.5 rounded-full bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20 text-xs font-extrabold uppercase tracking-wider">
                  Rejected
                </span>
              ) : (
                <span className="px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-extrabold uppercase tracking-wider">
                  Ready for Review
                </span>
              )}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-semibold">{errorMsg}</div>
          </div>
        )}

        {/* Failed Pipeline Alert */}
        {draft.status === "failed" && (
          <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extrabold text-zinc-950 dark:text-white text-base">AI Vision Pipeline Interrupted</h3>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Error: {draft.errorMessage || "Vision parsing error."}
                </p>
              </div>
            </div>
            <button
              onClick={() => retry()}
              disabled={retrying}
              className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`} />
              <span>{retrying ? "Retrying..." : "Retry Pipeline"}</span>
            </button>
          </div>
        )}

        {/* Main Grid */}
        <form onSubmit={handlePublish} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Photos & Market Pricing */}
          <div className="lg:col-span-4 space-y-6">
            {/* Draft Photos */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" />
                Uploaded Draft Photos
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {draft.rawImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 group"
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 bg-purple-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Market Pricing Tool */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                AI Market Pricing Suggestions
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Calculated by inspecting category market sales and hardware condition grade.
              </p>

              {draft.aiExtracted?.suggestedPriceRange?.sampleSize && 
              draft.aiExtracted.suggestedPriceRange.sampleSize > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Min</span>
                      <p className="text-sm font-black text-zinc-950 dark:text-white mt-0.5">
                        ৳{(draft.aiExtracted.suggestedPriceRange.min! / 100).toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Avg Mid</span>
                      <p className="text-sm font-black text-purple-700 dark:text-purple-300 mt-0.5">
                        ৳{(draft.aiExtracted.suggestedPriceRange.avg! / 100).toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Max</span>
                      <p className="text-sm font-black text-zinc-950 dark:text-white mt-0.5">
                        ৳{(draft.aiExtracted.suggestedPriceRange.max! / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center font-medium">
                    Sample size: <span className="font-bold text-zinc-900 dark:text-white">{draft.aiExtracted.suggestedPriceRange.sampleSize}</span> comparable gadgets analyzed.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold leading-snug">
                  No direct market sample found. Set target selling price manually.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Form Specifications */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Basic Info */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                Basic Product Specification
              </h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Suggested Product Title *
                </label>
                <input
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
                    Brand
                  </label>
                  <input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Apple"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <HeroSelect
                    label="Detected Condition Grade *"
                    value={condition}
                    onChange={setCondition}
                    options={CONDITIONS}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Short Description (Listing Tagline) *
                </label>
                <textarea
                  rows={2}
                  required
                  maxLength={500}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Concise one-liner summary"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Full AI Generated Description *
                </label>
                <textarea
                  rows={5}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product description body"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            </div>

            {/* Categorization & Dynamic Specs */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                Categorization & Dynamic Specs
              </h2>

              <div>
                <HeroSelect
                  label="Selected Category *"
                  value={categoryId}
                  onChange={setCategoryId}
                  options={categoryOptions}
                />
              </div>

              {attrSchema.length > 0 && (
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Extracted Attributes for {selectedCategory?.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {attrSchema.map((attr) => (
                      <div key={attr.key}>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
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
                            placeholder={attr.unit ? `in ${attr.unit}` : ""}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Set Listing Price Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-500" />
                Set Listing Price
              </h2>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Price (BDT Taka) *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={priceRaw}
                  onChange={(e) => setPriceRaw(e.target.value)}
                  placeholder="e.g. 75000"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-base font-extrabold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* ACTION BUTTONS BAR — FIX FOR SQUISHED BUTTON BUG */}
            {draft.status !== "approved" && (
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
                
                {/* Approve & Publish Listing Button */}
                <button
                  type="submit"
                  disabled={publishing || saving || rejecting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 whitespace-nowrap min-w-[210px]"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{publishing ? "Publishing..." : "Approve & Publish Listing"}</span>
                </button>

                {/* Save Changes Button */}
                <button
                  type="button"
                  onClick={handleSaveOnly}
                  disabled={publishing || saving || rejecting}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-wider transition-all border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 whitespace-nowrap"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>

                {/* Reject Draft Button */}
                <button
                  type="button"
                  onClick={() => reject()}
                  disabled={publishing || saving || rejecting}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-wider transition-all border border-red-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 whitespace-nowrap"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{rejecting ? "Rejecting..." : "Reject Draft"}</span>
                </button>

              </div>
            )}

            {draft.status === "approved" && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider rounded-2xl text-center">
                This AI draft was approved and published successfully.
              </div>
            )}

          </div>

        </form>
      </div>
    </div>
  );
}
