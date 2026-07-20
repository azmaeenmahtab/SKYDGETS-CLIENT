"use client";

import { Card, CardContent, Skeleton } from "@heroui/react";

export function ProductSkeleton() {
  return (
    <Card className="h-full flex flex-col justify-between overflow-hidden shadow-sm">
      <div className="relative aspect-video w-full overflow-hidden bg-default-100">
        <Skeleton className="h-full w-full object-cover" />
      </div>
      <CardContent className="flex flex-col gap-2 p-4 flex-grow">
        <div className="flex justify-between items-start gap-2">
          <Skeleton className="h-6 w-2/3 rounded-lg" />
          <Skeleton className="h-6 w-1/4 rounded-lg" />
        </div>
        <div className="space-y-2 mt-2">
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-5/6 rounded-lg" />
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </Card>
  );
}
