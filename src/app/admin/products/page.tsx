"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getProducts, updateProduct, deleteProduct, createProduct } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import { 
  Package, 
  Plus, 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  Filter, 
  Edit3, 
  Trash2, 
  Copy, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  LayoutGrid,
  List,
  RefreshCw,
  MoreVertical,
  Tag
} from "lucide-react";
import { HeroSelect } from "@/components/common/HeroSelect";
import { toast } from "react-hot-toast";

export default function AdminProductsPage() {
  const router = useRouter();
  const qc = useQueryClient();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Selection states for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Quick edit modal states
  const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);
  const [quickPrice, setQuickPrice] = useState("");
  const [quickStock, setQuickStock] = useState("");

  // Delete confirmation modal states
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  // Fetch Categories for Filter Dropdown
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Fetch All Products (for admin inventory)
  const { data: productsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-products", { search: searchQuery, categoryPath: selectedCategory, status: selectedStatus, sort: sortOption }],
    queryFn: () => getProducts({
      limit: 100,
      search: searchQuery || undefined,
      categoryPath: selectedCategory !== "all" ? selectedCategory : undefined,
      status: selectedStatus !== "all" ? selectedStatus : undefined,
      sort: sortOption,
    }),
  });

  const rawProducts = productsData?.items ?? [];

  // Client-side Filtered & Processed Products
  const processedProducts = useMemo(() => {
    return rawProducts.filter((p) => {
      // Condition filter
      if (selectedCondition !== "all" && p.condition !== selectedCondition) return false;
      // Stock status filter
      if (selectedStockStatus === "in_stock" && p.stock <= 0) return false;
      if (selectedStockStatus === "low_stock" && (p.stock <= 0 || p.stock > 3)) return false;
      if (selectedStockStatus === "out_of_stock" && p.stock > 0) return false;
      return true;
    });
  }, [rawProducts, selectedCondition, selectedStockStatus]);

  // Inventory KPI Statistics
  const stats = useMemo(() => {
    const totalCount = rawProducts.length;
    const publishedCount = rawProducts.filter((p) => p.status === "published").length;
    const draftCount = rawProducts.filter((p) => p.status === "draft").length;
    const lowStockCount = rawProducts.filter((p) => p.stock > 0 && p.stock <= 3).length;
    const outOfStockCount = rawProducts.filter((p) => p.stock === 0).length;
    const totalValuation = rawProducts.reduce((sum, p) => sum + p.price * p.stock, 0);

    return {
      totalCount,
      publishedCount,
      draftCount,
      lowStockCount,
      outOfStockCount,
      totalValuation,
    };
  }, [rawProducts]);

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateProduct(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product status updated");
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Failed to update product status");
    },
  });

  const quickEditMutation = useMutation({
    mutationFn: ({ id, price, stock }: { id: string; price: number; stock: number }) =>
      updateProduct(id, { price, stock }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setQuickEditProduct(null);
      toast.success("Price & stock updated successfully");
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Failed to update price/stock");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setDeleteConfirmProduct(null);
      toast.success("Product deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Failed to delete product");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (product: Product) => {
      const copyPayload = {
        title: `${product.title} (Copy)`,
        shortDescription: product.shortDescription,
        description: product.description,
        categoryId: product.categoryId,
        brand: product.brand,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        condition: product.condition,
        stock: product.stock,
        status: "draft",
        attributes: product.attributes,
        images: product.images,
      };
      return createProduct(copyPayload);
    },
    onSuccess: (newProduct) => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product duplicated as draft");
      router.push(`/admin/products/${newProduct._id}/edit`);
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Failed to duplicate product");
    },
  });

  // Bulk Actions Mutations
  const bulkStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await Promise.all(selectedIds.map((id) => updateProduct(id, { status })));
    },
    onSuccess: (_, status) => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setSelectedIds([]);
      toast.success(`Bulk updated ${selectedIds.length} items to ${status}`);
    },
    onError: () => toast.error("Failed to perform bulk update"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(selectedIds.map((id) => deleteProduct(id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setSelectedIds([]);
      toast.success("Bulk deleted selected items");
    },
    onError: () => toast.error("Failed to perform bulk delete"),
  });

  // Handlers for selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(processedProducts.map((p) => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const openQuickEdit = (product: Product) => {
    setQuickEditProduct(product);
    setQuickPrice(String(product.price));
    setQuickStock(String(product.stock));
  };

  const handleQuickEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditProduct) return;
    const priceNum = parseFloat(quickPrice);
    const stockNum = parseInt(quickStock, 10);
    if (isNaN(priceNum) || isNaN(stockNum)) {
      toast.error("Please enter valid price and stock numbers");
      return;
    }
    quickEditMutation.mutate({
      id: quickEditProduct._id,
      price: priceNum,
      stock: stockNum,
    });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedCondition("all");
    setSelectedStockStatus("all");
    setSortOption("newest");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    selectedStatus !== "all" ||
    selectedCondition !== "all" ||
    selectedStockStatus !== "all" ||
    sortOption !== "newest";

  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      {/* Background Radial Grid Spotlight */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.06),rgba(255,255,255,0))]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-28 sm:pt-32 pb-16 sm:px-6 lg:px-8 w-full space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-3">
              <Package className="w-3.5 h-3.5" />
              <span>ADMIN INVENTORY CONTROL</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
              Product Inventory Manager
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Monitor live stock, adjust pricing, publish listings, and run bulk inventory actions.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/items/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-wider transition-all border border-zinc-200/80 dark:border-zinc-800 active:scale-95 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-purple-500" />
              <span>Add Product</span>
            </Link>

            <Link
              href="/admin/ai-drafts/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-400 dark:text-purple-600" />
              <span>AI Listing Drafts</span>
            </Link>
          </div>
        </div>

        {/* KPI ANALYTICS METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Total Products */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
              <Package className="w-4 h-4 text-purple-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-zinc-950 dark:text-white">
                {stats.totalCount}
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">In catalog store</p>
            </div>
          </div>

          {/* Published Products */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Published</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.publishedCount}
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Live for purchase</p>
            </div>
          </div>

          {/* Draft Products */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Drafts</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {stats.draftCount}
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Pending review</p>
            </div>
          </div>

          {/* Low / Out of Stock */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Low / Out Stock</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-red-600 dark:text-red-400">
                {stats.lowStockCount + stats.outOfStockCount}
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {stats.outOfStockCount} out of stock
              </p>
            </div>
          </div>

          {/* Inventory Valuation */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Inventory Value</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-3">
              <span className="text-xl font-black text-zinc-950 dark:text-white truncate block">
                {formatPrice(stats.totalValuation)}
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Total stock value</p>
            </div>
          </div>
        </div>

        {/* SEARCH, FILTER & TOOLBAR CONTROL BAR */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search products by title, brand, or specs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Mode Toggle & Refresh */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 p-1 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Table</span>
                </button>

                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
              </div>

              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all cursor-pointer disabled:opacity-50"
                title="Refresh Inventory"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            {/* Category Dropdown */}
            <HeroSelect
              label="Category"
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[
                { id: "all", label: "All Categories" },
                ...categories.map((cat) => ({ id: cat.slug || cat.path, label: cat.name })),
              ]}
            />

            {/* Status Dropdown */}
            <HeroSelect
              label="Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={[
                { id: "all", label: "All Statuses" },
                { id: "published", label: "Published" },
                { id: "draft", label: "Draft" },
                { id: "archived", label: "Archived" },
                { id: "sold_out", label: "Sold Out" },
              ]}
            />

            {/* Condition Dropdown */}
            <HeroSelect
              label="Condition"
              value={selectedCondition}
              onChange={setSelectedCondition}
              options={[
                { id: "all", label: "All Conditions" },
                { id: "new", label: "New" },
                { id: "like_new", label: "Like New" },
                { id: "good", label: "Good" },
                { id: "fair", label: "Fair" },
                { id: "for_parts", label: "For Parts" },
              ]}
            />

            {/* Stock Status Dropdown */}
            <HeroSelect
              label="Stock Level"
              value={selectedStockStatus}
              onChange={setSelectedStockStatus}
              options={[
                { id: "all", label: "All Stock Levels" },
                { id: "in_stock", label: "In Stock (> 0)" },
                { id: "low_stock", label: "Low Stock (1-3)" },
                { id: "out_of_stock", label: "Out of Stock (0)" },
              ]}
            />

            {/* Sort Dropdown */}
            <HeroSelect
              label="Sort Order"
              value={sortOption}
              onChange={setSortOption}
              options={[
                { id: "newest", label: "Newest First" },
                { id: "price_asc", label: "Price: Low to High" },
                { id: "price_desc", label: "Price: High to Low" },
              ]}
            />
          </div>

          {/* Reset Filters button bar */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
              <span className="text-xs text-zinc-500">
                Showing {processedProducts.length} filtered items
              </span>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* BULK ACTIONS TOOLBAR (Appears when 1 or more items selected) */}
        {selectedIds.length > 0 && (
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                {selectedIds.length}
              </span>
              <span className="text-sm font-extrabold text-zinc-950 dark:text-white">
                Items Selected
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => bulkStatusMutation.mutate("published")}
                disabled={bulkStatusMutation.isPending}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                Publish Selected
              </button>

              <button
                onClick={() => bulkStatusMutation.mutate("draft")}
                disabled={bulkStatusMutation.isPending}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                Set as Draft
              </button>

              <button
                onClick={() => bulkStatusMutation.mutate("archived")}
                disabled={bulkStatusMutation.isPending}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                Archive Selected
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedIds.length} selected items permanently?`)) {
                    bulkDeleteMutation.mutate();
                  }
                }}
                disabled={bulkDeleteMutation.isPending}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                Delete Selected
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}

        {/* INVENTORY TABLE / GRID VIEW */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200/60 dark:border-zinc-800"
              />
            ))}
          </div>
        ) : processedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-sm">
            <Package className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mb-4" />
            <h3 className="text-xl font-extrabold text-zinc-950 dark:text-white mb-2">
              No products match your criteria
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
              Try adjusting your search terms or filter selections to view available inventory.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-full shadow-md cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* TABLE VIEW */
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <th className="py-3.5 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          processedProducts.length > 0 &&
                          selectedIds.length === processedProducts.length
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-zinc-300 dark:border-zinc-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4">Product Info</th>
                    <th className="py-3.5 px-4">Category & Grade</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {processedProducts.map((product) => {
                    const isSelected = selectedIds.includes(product._id);
                    const primaryImg =
                      product.images.find((img) => img.isPrimary)?.url ||
                      product.images[0]?.url ||
                      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=200";

                    return (
                      <tr
                        key={product._id}
                        className={`transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-850/50 ${
                          isSelected ? "bg-purple-500/5 dark:bg-purple-500/10" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(product._id, e.target.checked)}
                            className="rounded border-zinc-300 dark:border-zinc-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </td>

                        {/* Product Thumbnail & Title */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3 max-w-md">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 flex-shrink-0">
                              <img
                                src={primaryImg}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/products/${product.slug}`}
                                className="font-bold text-zinc-950 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors line-clamp-1 text-sm"
                                title={product.title}
                              >
                                {product.title}
                              </Link>
                              <span className="text-xs font-semibold text-emerald-600 font-mono">
                                {product.brand || "SkyDgets"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category & Condition Grade */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
                              {product.categoryPath || "Gadgets"}
                            </span>
                            <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 capitalize">
                              {product.condition.replace(/_/g, " ")}
                            </span>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-zinc-950 dark:text-white text-sm">
                              {formatPrice(product.price)}
                            </span>
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <span className="text-xs text-zinc-400 line-through">
                                {formatPrice(product.compareAtPrice)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Stock Status Badge */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                product.stock > 3
                                  ? "bg-emerald-500"
                                  : product.stock > 0
                                  ? "bg-amber-500 animate-pulse"
                                  : "bg-red-500"
                              }`}
                            />
                            <span className="font-bold text-xs text-zinc-900 dark:text-white tabular-nums">
                              {product.stock} unit{product.stock !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </td>

                        {/* Status Select Switch */}
                        <td className="py-4 px-4">
                          <div className="w-32">
                            <HeroSelect
                              value={product.status}
                              onChange={(val) =>
                                updateStatusMutation.mutate({
                                  id: product._id,
                                  status: val,
                                })
                              }
                              options={[
                                { id: "published", label: "Published" },
                                { id: "draft", label: "Draft" },
                                { id: "archived", label: "Archived" },
                                { id: "sold_out", label: "Sold Out" },
                              ]}
                            />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Quick Price/Stock Edit */}
                            <button
                              onClick={() => openQuickEdit(product)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="Quick Edit Price & Stock"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>

                            {/* Edit Link */}
                            <Link
                              href={`/admin/products/${product._id}/edit`}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="Full Editor"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>

                            {/* Duplicate */}
                            <button
                              onClick={() => duplicateMutation.mutate(product)}
                              disabled={duplicateMutation.isPending}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                              title="Duplicate Product"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteConfirmProduct(product)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {processedProducts.map((product) => {
              const primaryImg =
                product.images.find((img) => img.isPrimary)?.url ||
                product.images[0]?.url ||
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400";

              return (
                <div
                  key={product._id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-all duration-300 shadow-sm hover:shadow-xl"
                >
                  <div>
                    {/* Thumbnail canvas */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-3">
                      <img
                        src={primaryImg}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span
                        className={`absolute top-2 right-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                          product.status === "published"
                            ? "bg-emerald-500 text-white border-emerald-600"
                            : "bg-amber-500 text-white border-amber-600"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-emerald-600 font-mono">
                      {product.brand || "SkyDgets"}
                    </span>
                    <h3 className="text-base font-extrabold text-zinc-950 dark:text-white line-clamp-1 mt-0.5">
                      {product.title}
                    </h3>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-sm font-black text-zinc-950 dark:text-white">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => openQuickEdit(product)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-purple-500/10 text-xs font-bold text-zinc-900 dark:text-white hover:text-purple-600 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Edit Stock/Price</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/products/${product._id}/edit`}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirmProduct(product)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* QUICK EDIT PRICE & STOCK MODAL */}
      {quickEditProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-500" />
                Quick Update Price & Stock
              </h3>
              <button
                onClick={() => setQuickEditProduct(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              Updating: <span className="font-bold text-zinc-900 dark:text-white">{quickEditProduct.title}</span>
            </p>

            <form onSubmit={handleQuickEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Price (BDT) *
                </label>
                <input
                  type="number"
                  required
                  value={quickPrice}
                  onChange={(e) => setQuickPrice(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Stock Units Available *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={quickStock}
                  onChange={(e) => setQuickStock(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setQuickEditProduct(null)}
                  className="flex-1 py-3 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickEditMutation.isPending}
                  className="flex-1 py-3 rounded-full bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {quickEditMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-500">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-zinc-950 dark:text-white">
              Delete Product?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Are you sure you want to delete <span className="font-bold text-zinc-900 dark:text-white">"{deleteConfirmProduct.title}"</span>? This action cannot be undone.
            </p>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="flex-1 py-3 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirmProduct._id)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
