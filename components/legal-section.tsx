export function LegalPageHeader({ title, updated }: { title: string; updated: string }) {
  return (
    <div className="mb-12">
      <h1 className="text-3xl md:text-4xl font-black">{title}</h1>
      <p className="text-xs text-muted-foreground mt-3 uppercase tracking-widest font-semibold">
        Last updated: {updated}
      </p>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-black mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed [&_strong]:text-foreground [&_strong]:font-semibold">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
