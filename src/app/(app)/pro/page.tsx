import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isPro } from "@/lib/stripe";
import { ProView } from "@/components/ProView";

export const metadata = { title: "FluentPath Pro" };

export default async function ProPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { status } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { proUntil: true },
  });
  const pro = isPro(user);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>
      <header className="mt-3 mb-6 text-center">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Go further with Pro
        </h1>
        <p className="mt-2 text-muted">
          Keep everything free — unlock the live AI tutor when you&apos;re ready.
        </p>
      </header>
      <ProView
        isPro={pro}
        proUntil={user?.proUntil ? user.proUntil.toLocaleDateString() : null}
        status={status}
      />
    </div>
  );
}
