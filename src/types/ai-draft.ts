export interface AIExtracted {
  detectedDevice: string;
  detectedBrand: string;
  detectedModel: string;
  detectedConditionGrade: "new" | "like_new" | "good" | "fair" | "for_parts";
  detectedDefects: string[];
  suggestedCategorySlug: string;
  suggestedCategoryId: string;
  suggestedAttributes: Record<string, string | number | boolean>;
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedPriceRange: {
    min: number | null;
    max: number | null;
    avg: number | null;
    comparableProductIds: string[];
    sampleSize: number;
  };
}

export type AIListingDraftStatus =
  | "processing"
  | "ready_for_review"
  | "approved"
  | "rejected"
  | "failed";

export interface AIListingDraft {
  _id: string;
  createdBy: string;
  rawImages: string[];
  rawNotes?: string;
  aiExtracted: Partial<AIExtracted>;
  status: AIListingDraftStatus;
  errorMessage?: string;
  finalProductId?: string;
  overridePrice?: number;
  overrideBrand?: string;
  overrideShortDescription?: string;
  createdAt: string;
  updatedAt: string;
}
