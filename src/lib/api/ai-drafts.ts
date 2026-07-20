import { apiGet, apiPost, apiPatch } from "./client";
import type { AIListingDraft, AIListingDraftStatus } from "@/types/ai-draft";
import type { Product } from "@/types/product";

export interface CreateDraftInput {
  rawImages: string[];
  rawNotes?: string;
}

export interface UpdateDraftInput {
  suggestedTitle?: string;
  suggestedDescription?: string;
  suggestedCategoryId?: string;
  suggestedAttributes?: Record<string, string | number | boolean>;
  detectedConditionGrade?: "new" | "like_new" | "good" | "fair" | "for_parts";
  price?: number;
  brand?: string;
  shortDescription?: string;
}

export async function createDraft(input: CreateDraftInput): Promise<AIListingDraft> {
  return apiPost<AIListingDraft>("/ai-listing/drafts", input);
}

export async function getDrafts(status?: AIListingDraftStatus): Promise<AIListingDraft[]> {
  const query = status ? `?status=${status}` : "";
  return apiGet<AIListingDraft[]>(`/ai-listing/drafts${query}`);
}

export async function getDraftById(id: string): Promise<AIListingDraft> {
  return apiGet<AIListingDraft>(`/ai-listing/drafts/${id}`);
}

export async function updateDraft(id: string, input: UpdateDraftInput): Promise<AIListingDraft> {
  return apiPatch<AIListingDraft>(`/ai-listing/drafts/${id}`, input);
}

export async function publishDraft(id: string): Promise<{ draft: AIListingDraft; product: Product }> {
  return apiPost<{ draft: AIListingDraft; product: Product }>(`/ai-listing/drafts/${id}/publish`, {});
}

export async function rejectDraft(id: string): Promise<AIListingDraft> {
  return apiPost<AIListingDraft>(`/ai-listing/drafts/${id}/reject`, {});
}

export async function retryDraft(id: string): Promise<AIListingDraft> {
  return apiPost<AIListingDraft>(`/ai-listing/drafts/${id}/retry`, {});
}
