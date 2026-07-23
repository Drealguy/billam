import type { LucideIcon } from "lucide-react";

export function ModulePlaceholder({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
        <Icon size={24} className="text-primary" />
      </div>
      <h1 className="text-xl font-black mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-2">{description}</p>
      <p className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider mt-2">
        Module not yet built
      </p>
    </div>
  );
}
