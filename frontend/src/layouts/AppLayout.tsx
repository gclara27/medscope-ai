import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { getNavItemsForRole } from "@/config/navigation";
import { useAuth } from "@/context/AuthContext";

export function AppLayout() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = getNavItemsForRole(user?.role ?? "");

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true, state: { loggedOut: true } });
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="flex w-64 flex-col border-r border-outline-variant bg-surface-container-lowest">
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
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                location.pathname === item.to
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
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
          <p className="text-xs capitalize text-on-surface-variant">
            {user?.role}
          </p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
