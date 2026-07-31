import { notFound } from "next/navigation";
import Link from "next/link";
import { serverFetch } from "@/lib/api/server-fetch";
import { formatPrice, formatCondition } from "@/lib/utils";
import type { Product } from "@/types/product";
import type { Metadata } from "next";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ShoppingCart } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await serverFetch<Product>(`/products/${slug}`);
    return {
      title: `${product.title} — SKYDGETS`,
      description: product.shortDescription,
    };
  } catch {
    return { title: "Product Not Found — SKYDGETS" };
  }
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth.api.getSession({
    headers: await headers() 
  });


  let product: Product;
  try {
    product = await serverFetch<Product>(`/products/${slug}`);
  } catch {
    notFound();
  }

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const gallery = product.images.filter((img) => !img.isPrimary);

  const conditionColorMap: Record<string, string> = {
    new: "bg-green-100 text-green-700",
    like_new: "bg-blue-100 text-blue-700",
    good: "bg-yellow-100 text-yellow-700",
    fair: "bg-orange-100 text-orange-700",
    for_parts: "bg-red-100 text-red-700",
  };
  const conditionClass = conditionColorMap[product.condition] ?? "bg-zinc-100 text-zinc-700";

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-7xl px-4 pt-28 sm:pt-32 pb-12 sm:pb-16 sm:px-6 lg:px-8 w-full">
        {/* Breadcrumb */}
        <nav className="text-sm text-zinc-500 mb-6 flex items-center gap-2">
          <Link href="/products" className="hover:text-zinc-950 transition-colors">
            Explore
          </Link>
          <span>›</span>
          <span className="text-zinc-900 font-medium truncate max-w-xs">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
              <img
                src={primaryImage?.url || "https://placehold.co/800x600?text=No+Image"}
                alt={primaryImage?.alt || product.title}
                className="h-full w-full object-cover"
              />
            </div>
            {gallery.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {gallery.map((img, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 shrink-0"
                  >
                    <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">{product.title}</h1>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 mt-1 ${conditionClass}`}
                >
                  {formatCondition(product.condition)}
                </span>
              </div>
              {product.brand && (
                <p className="text-zinc-500 text-sm mt-1">
                  Brand: <span className="font-medium text-zinc-800">{product.brand}</span>
                </p>
              )}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-4xl font-black text-zinc-950">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="text-lg text-zinc-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-zinc-600 leading-relaxed">{product.shortDescription}</p>

            {/* Stock */}
            <div>
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  {product.stock} in stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  Out of stock
                </span>
              )}
            </div>

            {/* Add to Cart */}
            {
              session ? (
                <AddToCartButton productId={product._id} stock={product.stock} />
              ) : (
                <Link
                  href="/login"
                  className="w-full py-3.5 rounded-2xl bg-zinc-950 text-white font-extrabold text-base flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors shadow-lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </Link>
              )
            }

            {/* Attributes / Specs */}
            {Object.keys(product.attributes).length > 0 && (
              <div className="border-t border-zinc-200 pt-6">
                <h2 className="text-lg font-bold text-zinc-950 mb-3">Specifications</h2>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {Object.entries(product.attributes).map(([key, val]) => (
                    <div key={key} className="flex flex-col">
                      <dt className="text-xs text-zinc-500 uppercase tracking-wide">
                        {key.replace(/_/g, " ")}
                      </dt>
                      <dd className="font-semibold text-sm text-zinc-900">{String(val)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Full Description */}
        <div className="mt-12 border-t border-zinc-200 pt-8">
          <h2 className="text-2xl font-bold text-zinc-950 mb-4">Description</h2>
          <div className="prose prose-zinc max-w-none text-zinc-700 whitespace-pre-line leading-relaxed">
            {product.description}
          </div>
        </div>
      </div>
    </div>
  );
}
