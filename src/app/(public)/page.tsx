/**
 * Home page — Server Component.
 *
 * Fetches the backend health endpoint on the server side to confirm
 * the frontend → backend round-trip is working.
 *
 * TODO: Replace with real landing page content once scaffolding is verified.
 */

interface HealthResponse {
  status: string;
  db: string;
  timestamp: string;
}

async function getHealthStatus(): Promise<HealthResponse | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    console.warn("NEXT_PUBLIC_API_URL is not set — skipping health check");
    return null;
  }

  try {
    const res = await fetch(`${apiUrl}/health`, {
      cache: "no-store", // always fresh for this dev-verification page
    });

    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Health check failed:", err);
    return null;
  }
}

export default async function HomePage() {
  const health = await getHealthStatus();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Brand */}
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          SKYDGETS
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Scaffolding verification — replace with landing page content.
        </p>

        {/* Backend health check */}
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Backend Health Check
          </p>

          {health ? (
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
                <dd className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  {health.status}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-zinc-500 dark:text-zinc-400">Database</dt>
                <dd className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  {health.db}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-zinc-500 dark:text-zinc-400">Timestamp</dt>
                <dd className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  {new Date(health.timestamp).toLocaleString()}
                </dd>
              </div>
            </dl>
          ) : (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              <span>
                Backend unreachable — ensure{" "}
                <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-700">
                  NEXT_PUBLIC_API_URL
                </code>{" "}
                is set and the backend is running.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
