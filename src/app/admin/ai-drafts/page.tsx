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
  Image as ImageIcon,
  ArrowRight,
  Eye
} from "lucide-react";

const STATUS_FILTERS: { value: AIListingDraftStatus | "all"; label: string; icon: any; color: string }[] = [
  { value: "all", label: "All Drafts", icon: FileText, color: "bg-zinc-100 text-zinc-800" },
  { value: "processing", label: "Processing", icon: Clock, color: "bg-blue-50 text-blue-700 border border-blue-200 animate-pulse" },
  { value: "ready_for_review", label: "Ready for Review", icon: Sparkles, color: "bg-purple-50 text-purple-700 border border-purple-200" },
  { value: "approved", label: "Approved & Published", icon: CheckCircle, color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  { value: "rejected", label: "Rejected", icon: XCircle, color: "bg-zinc-100 text-zinc-700 border border-zinc-200" },
  { value: "failed", label: "Failed", icon: AlertCircle, color: "bg-red-50 text-red-700 border border-red-200" },
];

export default function AIDraftsPage() {
  const [activeStatus, setActiveStatus] = useState<AIListingDraftStatus | "all">("all");

  const { data: drafts = [], isLoading, error } = useQuery<AIListingDraft[]>({
    queryKey: ["ai-drafts", activeStatus],
    queryFn: () => getDrafts(activeStatus === "all" ? undefined : activeStatus),
    refetchInterval: activeStatus === "processing" ? 3000 : false,
  });

  const getStatusBadge = (status: AIListingDraftStatus) => {
    const filter = STATUS_FILTERS.find((f) => f.value === status);
    if (!filter) return null;
    const Icon = filter.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${filter.color}`}>
        <Icon size={12} />
        {filter.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-zinc-900">
      {/* Background Spotlight */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.06),rgba(255,255,255,0))]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-28 sm:pt-36 pb-16 sm:px-6 lg:px-8 w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI DRAFT GENERATOR</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
              AI Listing Drafts
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Create product listings in seconds using Gemini Vision AI and automated pricing pipelines.
            </p>
          </div>

          <Link
            href="/admin/ai-drafts/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Generate New AI Draft</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {STATUS_FILTERS.map((tab) => {
            const isActive = activeStatus === tab.value;
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drafts List Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-zinc-100 animate-pulse border border-zinc-200/60"
              />
            ))}
          </div>
        ) : drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-zinc-200/80 rounded-3xl shadow-sm">
            <Sparkles className="w-12 h-12 text-zinc-400 mb-4" />
            <h3 className="text-xl font-extrabold text-zinc-950 mb-2">
              No AI drafts found
            </h3>
            <p className="text-sm text-zinc-500 max-w-sm mb-6">
              Upload photos of a gadget to run the Gemini AI Vision listing pipeline.
            </p>
            <Link
              href="/admin/ai-drafts/new"
              className="px-8 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg"
            >
              Generate AI Draft
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((draft) => {
              const primaryImg = draft.rawImages?.[0];
              const titleText =
                draft.aiExtracted?.suggestedTitle ||
                draft.rawNotes?.substring(0, 40) ||
                `Draft #${draft._id.substring(18)}`;

              return (
                <div
                  key={draft._id}
                  className="group relative flex flex-col justify-between rounded-3xl bg-white border border-zinc-200/80 p-5 hover:border-zinc-300 transition-all duration-300 shadow-sm hover:shadow-xl"
                >
                  <div>
                    {/* Thumbnail canvas */}
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-100 mb-4">
                      {primaryImg ? (
                        <img
                          src={primaryImg}
                          alt="Draft photo"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5">
                        {getStatusBadge(draft.status)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(draft.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-zinc-950 line-clamp-2 leading-snug">
                      {titleText}
                    </h3>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-xs font-mono text-purple-600 font-bold">
                      {draft.rawImages?.length ?? 0} Photo(s) Uploaded
                    </span>
                    <Link
                      href={`/admin/ai-drafts/${draft._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold rounded-full transition-all cursor-pointer active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Draft</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
