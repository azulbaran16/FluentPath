import { redirect } from "next/navigation";
import { auth, googleEnabled } from "@/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Sign up — FluentPath" };

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return (
    <AuthShell>
      <AuthForm mode="signup" googleEnabled={googleEnabled} />
    </AuthShell>
  );
}
