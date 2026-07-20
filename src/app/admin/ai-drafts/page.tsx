"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getDrafts } from "@/lib/api/ai-drafts";
import type { AIListingDraft, AIListingDraftStatus } from "@/types/ai-draft";
import { 
  Sparkles, 
  Plus, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Calendar,
  Image as ImageIcon
} from "lucide-react";

const STATUS_FILTERS: { value: AIListingDraftStatus | "all"; label: string; icon: any; color: string }[] = [
  { value: "all", label: "All Drafts", icon: FileText, color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200" },
  { value: "processing", label: "Processing", icon: Clock, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 animate-pulse" },
  { value: "ready_for_review", label: "Ready for Review", icon: Sparkles, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  { value: "approved", label: "Approved & Published", icon: CheckCircle, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  { value: "rejected", label: "Rejected", icon: XCircle, color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400" },
  { value: "failed", label: "Failed", icon: AlertCircle, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
];

export default function AIDraftsPage() {
  const [activeStatus, setActiveStatus] = useState<AIListingDraftStatus | "all">("all");

  const { data: drafts = [], isLoading, error } = useQuery<AIListingDraft[]>({
    queryKey: ["ai-drafts", activeStatus],
    queryFn: () => getDrafts(activeStatus === "all" ? undefined : activeStatus),
    refetchInterval: activeStatus === "processing" ? 3000 : false, // Poll if processing
  });

  const getStatusBadge = (status: AIListingDraftStatus) => {
    const filter = STATUS_FILTERS.find((f) => f.value === status);
    if (!filter) return null;
    const Icon = filter.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${filter.color}`}>
        <Icon size={12} />
        {filter.label}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="text-purple-500 fill-purple-500/20" size={32} />
            AI Listing Drafts
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Create products in seconds using Gemini Vision and automated pricing pipelines.
          </p>
        </div>
        <Link
          href="/admin/ai-drafts/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 hover:bg-purple-500 hover:shadow-purple-500/30 active:scale-95 transition-all duration-200"
        >
          <Plus size={18} />
          New AI Draft
        </Link>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        {STATUS_FILTERS.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeStatus === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => setActiveStatus(filter.value)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/10"
                  : "bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:border-zinc-800"
              }`}
            >
              <Icon size={16} />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-80 w-full rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 dark:border-red-900/30 dark:bg-red-950/10 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
          <h3 className="text-md font-semibold text-red-800 dark:text-red-400">Failed to load drafts</h3>
          <p className="text-sm text-red-600 dark:text-red-500 mt-1">{(error as any)?.message ?? "Unknown error"}</p>
        </div>
      ) : drafts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-950">
          <ImageIcon className="mx-auto text-zinc-400 dark:text-zinc-600 mb-4" size={48} />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No drafts found</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
            {activeStatus === "all"
              ? "You haven't created any drafts yet. Click the button above to analyze your first product."
              : `No drafts currently match the filter: ${STATUS_FILTERS.find((f) => f.value === activeStatus)?.label}`}
          </p>
          {activeStatus === "all" && (
            <Link
              href="/admin/ai-drafts/new"
              className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              Get started with your first draft &rarr;
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((draft) => {
            const hasInfo = Object.keys(draft.aiExtracted).length > 0;
            const device = draft.aiExtracted?.detectedDevice || "Unknown Device";
            const brand = draft.aiExtracted?.detectedBrand || draft.overrideBrand || "";
            const model = draft.aiExtracted?.detectedModel || "";
            const title = draft.aiExtracted?.suggestedTitle || "Untitled Draft";
            const thumbnail = draft.rawImages[0] || "";

            return (
              <Link
                href={`/admin/ai-drafts/${draft._id}`}
                key={draft._id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image Section */}
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbnail}
                      alt={title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400 dark:text-zinc-600">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  {/* Status Overlay */}
                  <div className="absolute top-3 right-3 z-10">
                    {getStatusBadge(draft.status)}
                  </div>
                  {/* Number of Images badge */}
                  {draft.rawImages.length > 1 && (
                    <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg font-medium">
                      {draft.rawImages.length} images
                    </span>
                  )}
                </div>

                {/* Info Section */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
                      <span>{brand}</span>
                      {brand && model && <span>&bull;</span>}
                      <span>{model}</span>
                    </div>
                    <h3 className="text-md font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {draft.rawNotes ? `Notes: ${draft.rawNotes}` : "No seller notes provided."}
                    </p>

                    {draft.status === "failed" && draft.errorMessage && (
                      <div className="mt-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-100 dark:border-red-900/20 line-clamp-2">
                        {draft.errorMessage}
                      </div>
                    )}
                  </div>

                  {/* Footer Meta */}
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      <span>{new Date(draft.createdAt).toLocaleDateString()}</span>
                    </div>
                    {draft.status === "approved" && draft.finalProductId && (
                      <span className="text-green-600 dark:text-green-400 font-semibold">Published</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
