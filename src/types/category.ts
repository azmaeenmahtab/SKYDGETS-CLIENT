export interface AttributeDef {
  key: string;
  label: string;
  type: "string" | "number" | "enum" | "boolean";
  options?: string[];
  unit?: string;
  filterable: boolean;
  required: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  path: string;
  icon?: string;
  attributeSchema: AttributeDef[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
