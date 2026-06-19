import { Sidebar, type SidebarUser } from "./Sidebar";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: SidebarUser;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col lg:flex-row gap-0 lg:gap-8 px-4 lg:px-8">
      <Sidebar user={user} />
      <main className="min-w-0 flex-1 py-6 lg:py-10">{children}</main>
    </div>
  );
}
