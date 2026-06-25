import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { newReferralCode, REFERRAL_REWARD_DAYS } from "@/lib/referral";
import { absoluteUrl } from "@/lib/site";
import { InviteCard } from "@/components/InviteCard";

export const metadata = { title: "Invite friends" };

export default async function InvitePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  // Ensure the user has a referral code (older accounts won't have one yet).
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  let code = user?.referralCode ?? null;
  if (!code) {
    code = newReferralCode();
    await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
  }

  const count = await prisma.user.count({ where: { referredById: userId } });
  const link = absoluteUrl(`/signup?ref=${code}`);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-sm text-muted hover:text-ink">
        ← Dashboard
      </Link>
      <header className="mt-3 mb-6">
        <h1 className="font-display text-3xl font-semibold">Invite friends</h1>
        <p className="mt-1 text-muted">
          Learning together is more fun — and you both get rewarded.
        </p>
      </header>
      <InviteCard link={link} count={count} rewardDays={REFERRAL_REWARD_DAYS} />
    </div>
  );
}
