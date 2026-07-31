"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types/category";
import { SlidersHorizontal, X, Tag, CircleDollarSign, Activity } from "lucide-react";

interface FilterSidebarProps {
  categories: Category[];
}

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "for_parts", label: "For Parts" },
];

export function FilterSidebar({ categories }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Category: single-select — only one path at a time
  const selectedPath = searchParams.get("categoryPath") || "";
  // Condition: multi-select
  const selectedConditions = searchParams.getAll("condition");

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  const parents = categories.filter((c) => c.parentId === null);
  const getChildren = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId);

  // Single-select category: clicking same = deselect, different = replace
  const handleCategoryChange = (path: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("categoryPath");
    if (path && path !== selectedPath) {
      params.set("categoryPath", path);
    }
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const handleConditionChange = (value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    const current = params.getAll("condition").filter((c) => c !== value);
    params.delete("condition");
    const next = checked ? [...current, value] : current;
    next.forEach((v) => params.append("condition", v));
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    startTransition(() => {
      router.push("/products");
    });
  };

  const hasActiveFilters =
    selectedPath || selectedConditions.length > 0 || minPrice || maxPrice;

  return (
    <div className="flex flex-col gap-0 bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-zinc-950" />
          <h2 className="text-sm font-extrabold text-zinc-950 tracking-wide uppercase">
            Filters
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="px-4 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-1.5 mb-3">
          <Tag className="w-3.5 h-3.5 text-zinc-400" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
            Category
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {parents.map((parent) => {
            const children = getChildren(parent._id);
            if (children.length === 0) return null;
            return (
              <div key={parent._id}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 pl-1">
                  {parent.name}
                </p>
                <div className="flex flex-col gap-1">
                  {children.map((child) => {
                    const isSelected = selectedPath === child.path;
                    return (
                      <button
                        key={child._id}
                        onClick={() => handleCategoryChange(child.path)}
                        disabled={isPending}
                        className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                          isSelected
                            ? "bg-zinc-950 text-white font-bold shadow-md"
                            : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors ${
                            isSelected
                              ? "border-white bg-white"
                              : "border-zinc-300 bg-transparent"
                          }`}
                        />
                        {child.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="px-4 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-1.5 mb-3">
          <CircleDollarSign className="w-3.5 h-3.5 text-zinc-400" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
            Price (BDT)
          </h3>
        </div>
        <form onSubmit={handlePriceApply} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
            />
            <span className="text-zinc-300 text-lg font-light flex-shrink-0">—</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full text-sm font-extrabold bg-zinc-950 hover:bg-zinc-800 text-white py-2 rounded-xl transition-all disabled:opacity-50 shadow-sm cursor-pointer"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* Condition */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Activity className="w-3.5 h-3.5 text-zinc-400" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
            Condition
          </h3>
        </div>
        <div className="flex flex-col gap-1">
          {CONDITIONS.map((cond) => {
            const checked = selectedConditions.includes(cond.value);
            return (
              <label
                key={cond.value}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all text-sm ${
                  checked
                    ? "bg-zinc-100 text-zinc-950 font-bold"
                    : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={(e) =>
                    handleConditionChange(cond.value, e.target.checked)
                  }
                  disabled={isPending}
                />
                <span
                  className={`w-4 h-4 rounded-md flex items-center justify-center border-2 flex-shrink-0 transition-colors ${
                    checked
                      ? "bg-zinc-950 border-zinc-950"
                      : "border-zinc-300"
                  }`}
                >
                  {checked && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
                {cond.label}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}