interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="p-8">
      <header className="mb-4">
        <h1 className="text-3xl font-semibold text-on-surface">{title}</h1>
        <p className="mt-2 max-w-2xl text-on-surface-variant">{description}</p>
      </header>
      <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low px-6 py-10 text-sm text-on-surface-variant">
        Module coming soon in a later sprint.
      </div>
    </div>
  );
}
