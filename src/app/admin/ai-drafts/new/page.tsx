"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  HelpCircle
} from "lucide-react";

interface UploadedImage {
  url: string;
  name: string;
}

const STEPS = [
  { id: "vision", label: "Analyzing images & detecting defects" },
  { id: "classify", label: "Classifying gadget category & attributes" },
  { id: "copy", label: "Writing description & title options" },
  { id: "pricing", label: "Querying market for price ranges" },
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
      // Redirect to review page
      router.push(`/admin/ai-drafts/${draft._id}`);
    },
    onError: (err: any) => {
      setActiveStepIdx(-1);
    },
  });

  // Simulate pipeline step changes while backend request is processing
  useEffect(() => {
    if (activeStepIdx === -1) return;

    // Reset step statuses when starting
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
      // 1. Get Cloudinary signed signature parameters from the backend
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
        
        // 2. Perform direct Cloudinary upload via FormData API
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
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to upload one or more images");
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

  // Render processing overlay/card when pipeline is running
  if (isPending) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50 backdrop-blur-md">
          <div className="flex flex-col items-center text-center">
            {/* Pulsing AI Circle */}
            <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/40">
              <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/10 dark:bg-purple-500/5" />
              <Sparkles className="h-12 w-12 text-purple-600 dark:text-purple-400 animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              AI Listing Agent at Work
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              Please wait while Gemini processes your images and notes to create your optimized listing.
            </p>

            {/* Vertical Steps */}
            <div className="mt-8 w-full max-w-sm text-left flex flex-col gap-5">
              {STEPS.map((step) => {
                const status = stepStatuses[step.id];
                return (
                  <div key={step.id} className="flex items-center gap-3.5">
                    {status === "completed" ? (
                      <CheckCircle className="text-green-500 shrink-0" size={20} />
                    ) : status === "running" ? (
                      <Loader2 className="text-purple-600 dark:text-purple-400 animate-spin shrink-0" size={20} />
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0" />
                    )}
                    <span
                      className={`text-sm font-semibold transition-colors duration-300 ${
                        status === "completed"
                          ? "text-zinc-500 dark:text-zinc-500 line-through decoration-zinc-300 dark:decoration-zinc-800"
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

            {/* Slow connection hint */}
            <div className="mt-8 flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
              <Loader2 size={12} className="animate-spin" />
              <span>Analyzing full-resolution image features...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back to Drafts */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 mb-6 group transition-colors"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to review queue
      </button>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          Create AI Listing Draft
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Upload product images, add optional notes, and let the AI generate everything for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {pipelineError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3.5 text-sm dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
            <strong>Pipeline failed:</strong> {pipelineError.message || "An error occurred during pipeline execution."}
          </div>
        )}

        {/* Cloudinary Image Upload Section */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-1.5">
            <ImageIcon size={20} className="text-purple-500" />
            Product Images
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">
            Upload clear photos of the gadget from multiple angles. We recommend at least 1-3 photos.
          </p>

          {/* Drag & Drop Box */}
          <div className="relative border-2 border-dashed border-zinc-200 hover:border-purple-500/50 dark:border-zinc-800 dark:hover:border-purple-500/30 rounded-xl p-8 text-center transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-full">
                {uploading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <Upload size={24} />
                )}
              </div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {uploading ? "Uploading files..." : "Click or drag images here to upload"}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Direct signed upload to Cloudinary (PNG, JPG, WebP)
              </p>
            </div>
          </div>

          {uploadError && (
            <p className="mt-2.5 text-xs text-red-500 font-semibold">{uploadError}</p>
          )}

          {/* Uploaded Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-6">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square rounded-xl border border-zinc-200 overflow-hidden dark:border-zinc-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Optional Seller Notes */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-1.5">
            <FileText size={20} className="text-purple-500" />
            Seller Notes (Optional)
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">
            Provide hints such as the original brand/model, internal storage, defects, or extra accessories.
          </p>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. iPhone 12 Pro, 128GB, space gray. Face ID works. Minor surface scratch on the back glass. Battery health 84%."
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 transition-all resize-none"
          />
        </section>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={images.length === 0 || uploading}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/10 hover:bg-purple-500 disabled:opacity-50 transition-all duration-200"
          >
            <Sparkles size={16} />
            Run AI Agent Pipeline
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
