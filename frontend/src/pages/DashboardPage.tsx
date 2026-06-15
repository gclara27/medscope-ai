import { useAuth } from "@/context/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-on-surface">
          Clinical Dashboard
        </h1>
        <p className="mt-2 text-on-surface-variant">
          Welcome back, {user?.first_name}. Review patient risk overview and
          recent clinical activity.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-level-1">
          <p className="text-sm text-on-surface-variant">Signed in as</p>
          <p className="mt-2 text-lg font-semibold">{user?.email}</p>
        </article>
        <article className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-level-1">
          <p className="text-sm text-on-surface-variant">Role</p>
          <p className="mt-2 text-lg font-semibold capitalize">{user?.role}</p>
        </article>
        <article className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-level-1">
          <p className="text-sm text-on-surface-variant">Session</p>
          <p className="mt-2 text-lg font-semibold text-primary">Active</p>
        </article>
      </section>
    </div>
  );
}
