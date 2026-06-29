import { HowItWorks } from "./HowItWorks";
import { AuditLimitations } from "./AuditLimitations";

export function AuditGuideSidebar() {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <HowItWorks />
      <AuditLimitations compact />
    </aside>
  );
}
