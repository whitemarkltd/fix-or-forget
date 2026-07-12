// Simple readable container for static content pages.
export function Prose({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-prose px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <div className="prose-body mt-6 space-y-4 text-ink/80 [&_a]:text-accent [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc">
        {children}
      </div>
    </div>
  );
}
