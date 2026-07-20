interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
        Edit Product
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Editing product with ID:{" "}
        <span className="font-mono text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
          {id}
        </span>
      </p>
    </div>
  );
}
