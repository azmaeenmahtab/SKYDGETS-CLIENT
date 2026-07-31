"use client";

export function ProductSkeleton() {
  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-[32px] border border-zinc-200/80 bg-white p-4 animate-pulse shadow-sm">
      <div>
        {/* Soft Off-White Inner Canvas Frame matching ProductCard */}
        <div className="relative aspect-[4/3.2] w-full overflow-hidden rounded-[24px] bg-zinc-200/80" />

        {/* Content Below Canvas */}
        <div className="flex flex-col gap-2 mt-4 px-1">
          <div className="h-3 w-1/3 bg-zinc-200 rounded-full" />
          <div className="h-5 w-3/4 bg-zinc-200 rounded-lg" />
          <div className="h-5 w-1/2 bg-zinc-200 rounded-lg mt-1" />
        </div>
      </div>

      {/* Action Button Skeleton Pill */}
      <div className="mt-5 px-1">
        <div className="h-11 w-full bg-zinc-200 rounded-full" />
      </div>
    </div>
  );
}
