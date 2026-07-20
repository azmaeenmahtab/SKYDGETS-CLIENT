/**
 * Admin layout — requires admin role.
 * Stub for now — to be wired to Better Auth in the auth prompt.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO (auth prompt): check admin role here and redirect if unauthorized
  return <>{children}</>;
}
