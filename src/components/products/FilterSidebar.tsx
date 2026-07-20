"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// 1. Notice we don't need any special imports besides Checkbox and CheckboxGroup
import { Checkbox, CheckboxGroup, Input, Button } from "@heroui/react";
import type { Category } from "@/types/category";

interface FilterSidebarProps {
  categories: Category[];
}

export function FilterSidebar({ categories }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedPaths = searchParams.getAll("categoryPath");
  const selectedConditions = searchParams.getAll("condition");
  
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") || "");
    maxPrice && setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  const parents = categories.filter((c) => c.parentId === null);
  const getChildren = (parentId: string) => categories.filter((c) => c.parentId === parentId);

  const updateFilters = (key: string, values: string[] | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); 
    
    params.delete(key);
    if (Array.isArray(values)) {
      values.forEach((val) => params.append(key, val));
    } else if (values) {
      params.set(key, values);
    }

    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  // Prevent parent groups from clearing out checkmarks from other groups
  const handleCategoryGroupChange = (incomingValues: string[], currentParentChildPaths: string[]) => {
    const allCurrentPaths = searchParams.getAll("categoryPath");
    const pathsFromOtherGroups = allCurrentPaths.filter(p => !currentParentChildPaths.includes(p));
    updateFilters("categoryPath", [...pathsFromOtherGroups, ...incomingValues]);
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

  return (
    <div className="flex flex-col gap-6 p-4 bg-default-50 rounded-xl border border-default-200">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Filters</h2>
        <Button size="sm" variant="danger-soft" onPress={handleReset}>
          Reset All
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-sm text-default-600">Categories</h3>
        <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
          {parents.map((parent) => {
            const children = getChildren(parent._id);
            const childPaths = children.map(c => c.path);
            
            return (
              <div key={parent._id} className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase text-default-400">
                  {parent.name}
                </span>
                <CheckboxGroup
                  value={selectedPaths.filter(p => childPaths.includes(p))}
                  onChange={(vals: string[]) => handleCategoryGroupChange(vals, childPaths)}
                  className="pl-2"
                >
                  {children.map((child) => (
                    /* HeroUI v3 Compound Component Pattern applied below */
                    <Checkbox key={child._id} value={child.path} className="text-sm">
                      <Checkbox.Content>
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        {child.name}
                      </Checkbox.Content>
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="border-default-200" />

      {/* Price Filter */}
      <form onSubmit={handlePriceApply} className="flex flex-col gap-3">
        <h3 className="font-semibold text-sm text-default-600">Price (BDT)</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className="text-default-400">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm" variant="primary" isPending={isPending}>
          Apply Price
        </Button>
      </form>

      <hr className="border-default-200" />

      {/* Condition Filter */}
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-sm text-default-600">Condition</h3>
        <CheckboxGroup
          value={selectedConditions}
          onChange={(vals: string[]) => updateFilters("condition", vals)}
        >
          {["new", "like_new", "good", "fair", "for_parts"].map((cond) => (
            /* HeroUI v3 Compound Component Pattern applied below */
            <Checkbox key={cond} value={cond}>
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                {cond.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
              </Checkbox.Content>
            </Checkbox>
          ))}
        </CheckboxGroup>
      </div>
    </div>
  );
}