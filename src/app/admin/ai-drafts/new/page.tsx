"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { createDraft } from "@/lib/api/ai-drafts";
import { apiPost } from "@/lib/api/client";
import { 
  Sparkles, 
  Image as ImageIcon, 
  ArrowLeft, 
  Upload, 
  Loader2, 
  X,
  CheckCircle,
  FileText,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

interface UploadedImage {
  url: string;
  name: string;
}

const STEPS = [
  { id: "vision", label: "Analyzing gadget photos & physical condition" },
  { id: "classify", label: "Classifying category & extracting attributes" },
  { id: "copy", label: "Drafting title options & physical condition notes" },
  { id: "pricing", label: "Evaluating market prices & comparable listings" },
];

export default function NewAIDraftPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Steps state for the AI pipeline animation
  const [activeStepIdx, setActiveStepIdx] = useState<number>(-1);
  const [stepStatuses, setStepStatuses] = useState<Record<string, "pending" | "running" | "completed">>({
    vision: "pending",
    classify: "pending",
    copy: "pending",
    pricing: "pending",
  });

  const { mutate: runPipeline, isPending, error: pipelineError } = useMutation({
    mutationFn: createDraft,
    onSuccess: (draft) => {
      qc.invalidateQueries({ queryKey: ["ai-drafts"] });
      toast.success("AI Pipeline finished!");
      router.push(`/admin/ai-drafts/${draft._id}`);
    },
    onError: (err: any) => {
      setActiveStepIdx(-1);
      toast.error(err?.message ?? "Pipeline execution failed");
    },
  });

  // Simulate pipeline step changes while backend request is processing
  useEffect(() => {
    if (activeStepIdx === -1) return;

    if (activeStepIdx === 0) {
      setStepStatuses({
        vision: "running",
        classify: "pending",
        copy: "pending",
        pricing: "pending",
      });
    }

    const timer1 = setTimeout(() => {
      setStepStatuses((prev) => ({ ...prev, vision: "completed", classify: "running" }));
      setActiveStepIdx(1);
    }, 2800);

    const timer2 = setTimeout(() => {
      setStepStatuses((prev) => ({ ...prev, classify: "completed", copy: "running" }));
      setActiveStepIdx(2);
    }, 5500);

    const timer3 = setTimeout(() => {
      setStepStatuses((prev) => ({ ...prev, copy: "completed", pricing: "running" }));
      setActiveStepIdx(3);
    }, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [activeStepIdx]);

  // Handle local file selection and direct signed Cloudinary upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      const signatureData = await apiPost<{
        signature: string;
        timestamp: number;
        folder: string;
        apiKey: string;
        cloudName: string;
      }>("/upload/sign", {});

      const { signature, timestamp, folder, apiKey, cloudName } = signatureData;
      const uploadedList: UploadedImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", folder);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Cloudinary upload failed for ${file.name}`);
        }

        const cloudinaryData = await res.json();
        uploadedList.push({
          url: cloudinaryData.secure_url,
          name: file.name,
        });
      }

      setImages((prev) => [...prev, ...uploadedList]);
      toast.success(`Uploaded ${uploadedList.length} image(s)`);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to upload one or more images");
      toast.error("Upload error occurred");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idxToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return;

    setActiveStepIdx(0);
    runPipeline({
      rawImages: images.map((img) => img.url),
      rawNotes: notes || undefined,
    });
  };

  // Pipeline processing animation screen
  if (isPending) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white items-center justify-center px-4 pt-28 sm:pt-32 pb-16">
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 sm:p-10 shadow-2xl max-w-lg w-full text-center space-y-6">
          
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-purple-500/10">
            <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/10" />
            <Sparkles className="h-12 w-12 text-purple-600 dark:text-purple-400 animate-pulse" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
              Gemini AI Agent Processing
            </h2>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Analyzing photo features, detecting physical wear, and querying live market sales data.
            </p>
          </div>

          {/* Steps list */}
          <div className="w-full max-w-sm mx-auto text-left space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            {STEPS.map((step) => {
              const status = stepStatuses[step.id];
              return (
                <div key={step.id} className="flex items-center gap-3.5">
                  {status === "completed" ? (
                    <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                  ) : status === "running" ? (
                    <Loader2 className="text-purple-600 dark:text-purple-400 animate-spin shrink-0" size={20} />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0" />
                  )}
                  <span
                    className={`text-xs font-semibold transition-colors duration-300 ${
                      status === "completed"
                        ? "text-zinc-400 dark:text-zinc-500 line-through"
                        : status === "running"
                        ? "text-purple-600 dark:text-purple-400 font-bold"
                        : "text-zinc-400 dark:text-zinc-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-zinc-400 font-mono">
            <Loader2 size={14} className="animate-spin" />
            <span>Parsing image features with Gemini Vision...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      {/* Background Spotlight */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.06),rgba(255,255,255,0))]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-28 sm:pt-36 pb-16 sm:px-6 lg:px-8 w-full space-y-6">
        
        {/* Navigation & Title */}
        <div>
          <Link
            href="/admin/ai-drafts"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AI Drafts List
          </Link>

          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI PIPELINE GENERATOR</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
              Generate AI Listing Draft
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Upload multi-angle gadget photos and optional notes to generate complete specifications and market price suggestions.
            </p>
          </div>
        </div>

        {pipelineError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-semibold">
              Pipeline failed: {pipelineError.message || "An error occurred during pipeline execution."}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Photo Upload Section */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" />
                Product Gadget Photos *
              </h2>
              <span className="text-xs font-mono text-zinc-400">
                1–5 photos recommended
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Upload clear photos showing the front screen, back chassis, sides, and accessories.
            </p>

            {/* Drag & Drop Upload Zone */}
            <div className="relative border-2 border-dashed border-zinc-200 hover:border-purple-500/50 dark:border-zinc-800 dark:hover:border-purple-500/40 rounded-2xl p-8 text-center transition-colors bg-zinc-50/50 dark:bg-zinc-950/50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                </div>
                <p className="text-sm font-bold text-zinc-950 dark:text-white">
                  {uploading ? "Uploading photos to Cloudinary..." : "Click or drag gadget photos to upload"}
                </p>
                <p className="text-xs text-zinc-400">
                  Signed direct upload (PNG, JPG, WebP)
                </p>
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-red-500 font-semibold">{uploadError}</p>
            )}

            {/* Uploaded Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-square rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-800"
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 bg-purple-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seller Notes Section */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              Optional Hints & Notes
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Provide additional hints such as brand/model, battery health %, warranty, or included accessories.
            </p>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. iPhone 14 Pro, 256GB Deep Purple. Battery health 94%. Includes original cable and box. Micro scratch on top bezel."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
            />
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              href="/admin/ai-drafts"
              className="px-8 py-3.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={images.length === 0 || uploading}
              className="px-8 py-3.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-purple-600/20 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run AI Agent Pipeline</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
