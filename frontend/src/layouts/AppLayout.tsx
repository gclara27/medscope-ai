import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { MedScopeAppIcon } from "@/components/brand/MedScopeAppIcon";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { getNavItemsForUser, SUPPORT_NAV_ITEM } from "@/config/navigation";
import { useAuth } from "@/context/useAuth";
import { cn } from "@/lib/utils";

function isNavItemActive(pathname: string, itemTo: string): boolean {
  return pathname === itemTo || pathname.startsWith(`${itemTo}/`);
}

export function AppLayout() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = getNavItemsForUser(user);
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
      <div className="shrink-0 border-b border-surface-container-highest p-6">
        <div className="flex items-center gap-3">
          <MedScopeAppIcon size="md" className="shadow-level-1" />
          <div>
            <p className="text-sm font-bold text-primary">MedScope AI</p>
            <p className="text-xs text-on-surface-variant">Clinical Decision Support</p>
          </div>
        </div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-4" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(location.pathname, item.to);

          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={closeMobileNav}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium",
                isActive
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant pt-4">
          <Link
            to={SUPPORT_NAV_ITEM.to}
            onClick={closeMobileNav}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium",
              isNavItemActive(location.pathname, SUPPORT_NAV_ITEM.to)
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container-low",
            )}
          >
            <SUPPORT_NAV_ITEM.icon className="h-4 w-4 shrink-0" aria-hidden />
            {SUPPORT_NAV_ITEM.label}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-error transition hover:bg-error-container disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            {isLoading ? "Signing out…" : "Log out"}
          </button>
        </div>
      </nav>

      <div className="shrink-0 border-t border-surface-container-highest p-4">
        <div className="flex items-center gap-3">
          <UserAvatar
            displayName={[user?.first_name, user?.last_name].filter(Boolean).join(" ")}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-on-surface">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs capitalize text-on-surface-variant">{user?.role}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-primary focus:shadow-level-2"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar — viewport height; logout/user always visible (T-405, T-413) */}
      <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest md:flex">
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
          <div className="flex items-center gap-2">
            <MedScopeAppIcon size="sm" />
            <p className="text-sm font-bold text-primary">MedScope AI</p>
          </div>
          <div className="w-9" aria-hidden />
        </header>

        <main id="main-content" className="app-main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
