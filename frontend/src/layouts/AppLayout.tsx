import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getNavItemsForRole } from "@/config/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = getNavItemsForRole(user?.role ?? "");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true, state: { loggedOut: true } });
  }

  function closeMobileNav() {
    setMobileNavOpen(false);
  }

  const sidebarContent = (
    <>
      <div className="border-b border-surface-container-highest p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-on-primary">
            M
          </div>
          <div>
            <p className="text-sm font-bold text-primary">MedScope AI</p>
            <p className="text-xs text-on-surface-variant">Clinical CDSS</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            onClick={closeMobileNav}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium",
              location.pathname === item.to
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container-low",
            )}
          >
            {item.label}
          </Link>
        ))}

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoading}
          className="mt-auto rounded-lg px-3 py-2 text-left text-sm font-medium text-error transition hover:bg-error-container disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Signing out…" : "Log out"}
        </button>
      </nav>

      <div className="border-t border-surface-container-highest p-4">
        <p className="text-sm font-medium text-on-surface">
          {user?.first_name} {user?.last_name}
        </p>
        <p className="text-xs capitalize text-on-surface-variant">{user?.role}</p>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Desktop sidebar (T-405, T-413) */}
      <aside className="hidden w-64 flex-col border-r border-outline-variant bg-surface-container-lowest md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-on-surface/40 md:hidden"
          aria-label="Close navigation menu"
          onClick={closeMobileNav}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-outline-variant bg-surface-container-lowest shadow-level-2 transition-transform duration-200 md:hidden",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!mobileNavOpen}
      >
        <div className="flex items-center justify-end border-b border-surface-container-highest p-3">
          <button
            type="button"
            onClick={closeMobileNav}
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm font-bold text-primary">MedScope AI</p>
          <div className="w-9" aria-hidden />
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
