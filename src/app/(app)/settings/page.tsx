import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata = { title: "Account settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, passwordHash: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>
      <header className="mt-3 mb-6">
        <h1 className="font-display text-3xl font-semibold">Account settings</h1>
        <p className="mt-1 text-muted">Manage your profile and security.</p>
      </header>
      <SettingsForm
        name={user.name ?? ""}
        email={user.email}
        hasPassword={Boolean(user.passwordHash)}
      />
    </div>
  );
}
