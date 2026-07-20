/**
 * (public) group layout — passthrough, no auth guard.
 * The root layout's Navbar/Footer already wrap all pages.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
