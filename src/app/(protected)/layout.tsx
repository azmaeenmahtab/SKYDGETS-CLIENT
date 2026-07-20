/**
 * Protected layout — redirects to /login if no authenticated session.
 * Stub for now — to be wired to Better Auth in the auth prompt.
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO (auth prompt): check auth here and redirect if unauthenticated
  return <>{children}</>;
}
