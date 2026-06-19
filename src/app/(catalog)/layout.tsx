import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";

// Public catalog (worlds, scenarios, skills): viewable without an account
// so search engines can index them and visitors can preview before signing
// up. If a user IS signed in, we show their account in the shell.
export default async function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return <AppShell user={session?.user}>{children}</AppShell>;
}
