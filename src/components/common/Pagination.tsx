"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@heroui/react";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));

    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button
        size="sm"
        variant="secondary"
        isDisabled={page <= 1 || isPending}
        onPress={() => handlePageChange(page - 1)}
      >
        Previous
      </Button>

      <span className="text-sm text-default-500">
        Page <span className="font-semibold text-default-800">{page}</span> of{" "}
        <span className="font-semibold text-default-800">{totalPages}</span>
      </span>

      <Button
        size="sm"
        variant="secondary"
        isDisabled={page >= totalPages || isPending}
        onPress={() => handlePageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
