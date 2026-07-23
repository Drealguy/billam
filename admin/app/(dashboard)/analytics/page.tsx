import { ModulePlaceholder } from "@/components/module-placeholder";
import { BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  return (
    <ModulePlaceholder
      icon={BarChart3}
      title="Analytics"
      description="Deeper platform trends over time — signups, revenue, and retention beyond the Dashboard Home summary."
    />
  );
}
