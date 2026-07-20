"use client";

import Link from "next/link";
import { Card, CardContent, Button, Chip } from "@heroui/react";
import type { Product } from "@/types/product";
import { formatPrice, formatCondition } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const imageUrl = primaryImage?.url || "https://placehold.co/600x400?text=No+Image";

  // Color mapping for condition badge
  const getConditionColor = (cond: string) => {
    switch (cond) {
      case "new":
        return "success";
      case "like_new":
        return "accent";
      case "good":
        return "warning";
      case "fair":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <Card className="h-full flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-video w-full overflow-hidden bg-default-100">
        <img
          src={imageUrl}
          alt={primaryImage?.alt || product.title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2 right-2 z-10">
          <Chip
            size="sm"
            color={getConditionColor(product.condition)}
            variant="soft"
            className="capitalize"
          >
            {formatCondition(product.condition)}
          </Chip>
        </div>
      </div>
      <CardContent className="flex flex-col gap-2 p-4 flex-grow">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg line-clamp-1 flex-grow" title={product.title}>
            {product.title}
          </h3>
          <span className="font-bold text-primary whitespace-nowrap">
            {formatPrice(product.price)}
          </span>
        </div>
        <p className="text-sm text-default-500 line-clamp-2 min-h-[40px]">
          {product.shortDescription}
        </p>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Link href={`/products/${product.slug}`} className="w-full">
          <Button
            className="w-full"
            variant="secondary"
            size="sm"
          >
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
}
