import Link from "next/link";

/**
 * Minimal Footer — structure only, polished design comes later.
 */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} SKYDGETS. All rights reserved.
          </p>
          <nav className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <Link
              href="/about"
              className="transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
