"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getProducts, deleteProduct } from "@/lib/api/products";
import { formatPrice, formatCondition } from "@/lib/utils";
import type { Product } from "@/types/product";
import { useState } from "react";

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  archived: "bg-default-100 text-default-500",
  sold_out: "bg-orange-100 text-orange-700",
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Listings</h1>
          <p className="text-default-500 mt-1">
            {isLoading ? "Loading..." : `${products.length} product${products.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <Link
          href="/items/add"
          className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          + Add New
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-default-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-default-50 rounded-2xl border border-default-200">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
          <p className="text-default-500 mb-6">Get started by adding your first product.</p>
          <Link
            href="/items/add"
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Add Product
          </Link>
        </div>
      )}

      {/* Products table */}
      {!isLoading && products.length > 0 && (
        <div className="rounded-2xl border border-default-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-default-100 text-default-500 text-left">
                  <th className="px-4 py-3 font-semibold w-12"></th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Condition</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default-100">
                {products.map((product) => {
                  const primaryImage =
                    product.images.find((img) => img.isPrimary) || product.images[0];
                  return (
                    <tr key={product._id} className="hover:bg-default-50 transition-colors">
                      {/* Thumbnail */}
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-default-100 shrink-0">
                          {primaryImage ? (
                            <img
                              src={primaryImage.url}
                              alt={primaryImage.alt}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-default-300 text-xs">
                              📷
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3 max-w-xs">
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-medium hover:text-primary transition-colors line-clamp-2"
                        >
                          {product.title}
                        </Link>
                        {product.brand && (
                          <p className="text-xs text-default-400 mt-0.5">{product.brand}</p>
                        )}
                      </td>

                      {/* Condition */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatCondition(product.condition)}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 whitespace-nowrap font-semibold">
                        {formatPrice(product.price)}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3">
                        <span
                          className={
                            product.stock > 0
                              ? "text-green-600 font-medium"
                              : "text-red-500 font-medium"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[product.status] ?? "bg-default-100 text-default-600"}`}
                        >
                          {product.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {confirmId === product._id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-default-500">Archive?</span>
                            <button
                              onClick={() => archiveProduct(product._id)}
                              disabled={deletingId === product._id}
                              className="text-xs text-red-600 hover:underline font-semibold disabled:opacity-50"
                            >
                              {deletingId === product._id ? "..." : "Yes"}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="text-xs text-default-500 hover:underline"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/products/${product.slug}`}
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              View
                            </Link>
                            <Link
                              href={`/items/edit/${product._id}`}
                              className="text-xs text-default-600 hover:underline font-medium"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => setConfirmId(product._id)}
                              className="text-xs text-red-500 hover:underline font-medium"
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
  );
}
