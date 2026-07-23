import { Lock } from "lucide-react";

export function AccessRestricted() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
        <Lock size={24} className="text-destructive" />
      </div>
      <h1 className="text-xl font-black mb-2">Access restricted</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        Your admin role doesn&apos;t include permission for this section. Ask a super admin
        to grant it from Team Management if you need access.
      </p>
    </div>
  );
}
