import { redirect } from "next/navigation";
import { auth, googleEnabled } from "@/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return (
    <AuthShell>
      <AuthForm mode="login" googleEnabled={googleEnabled} />
    </AuthShell>
  );
}
