"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getProducts, deleteProduct } from "@/lib/api/products";
import { formatPrice, formatCondition } from "@/lib/utils";
import type { Product } from "@/types/product";
import { useState } from "react";

const STATUS_COLORS: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-800",
  draft: "bg-amber-100 text-amber-800",
  archived: "bg-zinc-100 text-zinc-600",
  sold_out: "bg-orange-100 text-orange-800",
};

export default function ManageItemsPage() {
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Fetch ALL products visible to admin (published + draft)
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () =>
      getProducts({
        status: ["published", "draft", "archived"].join(","),
        limit: 100,
      }),
  });

  const products: Product[] = data?.items ?? [];

  const { mutate: archiveProduct } = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onMutate: (id) => setDeletingId(id),
    onSettled: () => {
      setDeletingId(null);
      setConfirmId(null);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-7xl px-4 pt-28 sm:pt-32 pb-12 sm:pb-16 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">Manage Listings</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {isLoading ? "Loading..." : `${products.length} product${products.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <Link
            href="/items/add"
            className="px-5 py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-sm hover:bg-zinc-800 transition-colors shadow-md"
          >
            + Add New
          </Link>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-zinc-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-50 rounded-2xl border border-zinc-200">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-zinc-950 mb-2">No listings yet</h3>
            <p className="text-zinc-500 mb-6 text-sm">Get started by adding your first product.</p>
            <Link
              href="/items/add"
              className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-sm hover:bg-zinc-800 transition-colors shadow-md"
            >
              Add Product
            </Link>
          </div>
        )}

        {/* Products table */}
        {!isLoading && products.length > 0 && (
          <div className="rounded-2xl border border-zinc-200/80 overflow-hidden shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-100/80 text-zinc-600 text-left border-b border-zinc-200">
                    <th className="px-4 py-3.5 font-bold w-12"></th>
                    <th className="px-4 py-3.5 font-bold">Product</th>
                    <th className="px-4 py-3.5 font-bold">Condition</th>
                    <th className="px-4 py-3.5 font-bold">Price</th>
                    <th className="px-4 py-3.5 font-bold">Stock</th>
                    <th className="px-4 py-3.5 font-bold">Status</th>
                    <th className="px-4 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {products.map((product) => {
                    const primaryImage =
                      product.images.find((img) => img.isPrimary) || product.images[0];
                    return (
                      <tr key={product._id} className="hover:bg-zinc-50/80 transition-colors">
                        {/* Thumbnail */}
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                            {primaryImage ? (
                              <img
                                src={primaryImage.url}
                                alt={primaryImage.alt}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-zinc-400 text-xs">
                                📷
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Title */}
                        <td className="px-4 py-3 max-w-xs">
                          <Link
                            href={`/products/${product.slug}`}
                            className="font-bold text-zinc-950 hover:text-zinc-700 transition-colors line-clamp-2"
                          >
                            {product.title}
                          </Link>
                          {product.brand && (
                            <p className="text-xs text-zinc-500 mt-0.5 font-medium">{product.brand}</p>
                          )}
                        </td>

                        {/* Condition */}
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-700 font-medium capitalize">
                          {formatCondition(product.condition)}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 whitespace-nowrap font-bold text-zinc-950">
                          {formatPrice(product.price)}
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-3">
                          <span
                            className={
                              product.stock > 0
                                ? "text-emerald-700 font-bold"
                                : "text-red-600 font-bold"
                            }
                          >
                            {product.stock}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[product.status] ?? "bg-zinc-100 text-zinc-700"}`}
                          >
                            {product.status.replace("_", " ")}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {confirmId === product._id ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-zinc-500">Archive?</span>
                              <button
                                onClick={() => archiveProduct(product._id)}
                                disabled={deletingId === product._id}
                                className="text-xs text-red-600 hover:underline font-bold disabled:opacity-50 cursor-pointer"
                              >
                                {deletingId === product._id ? "..." : "Yes"}
                              </button>
                              <button
                                onClick={() => setConfirmId(null)}
                                className="text-xs text-zinc-500 hover:underline cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-3">
                              <Link
                                href={`/products/${product.slug}`}
                                className="text-xs text-zinc-950 hover:underline font-bold"
                              >
                                View
                              </Link>
                              <Link
                                href={`/items/edit/${product._id}`}
                                className="text-xs text-zinc-600 hover:underline font-bold"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => setConfirmId(product._id)}
                                className="text-xs text-red-600 hover:underline font-bold cursor-pointer"
                              >
                                Archive
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
