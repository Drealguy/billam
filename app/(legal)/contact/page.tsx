import { LegalPageHeader, LegalSection } from "@/components/legal-section";
import { Mail } from "lucide-react";

export const metadata = {
  title: "Contact — Bill Am",
  description: "Get in touch with the Bill Am team.",
};

export default function ContactPage() {
  return (
    <>
      <LegalPageHeader title="Contact us" updated="July 23, 2026" />

      <LegalSection title="We're here to help">
        <p>
          Have a question, ran into an issue, or just want to say hi? Reach out any time —
          we read every message.
        </p>
      </LegalSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <a
          href="mailto:support@usebillam.com"
          className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <Mail size={18} className="text-primary" />
          </div>
          <h3 className="font-bold text-foreground text-sm mb-1">Support</h3>
          <p className="text-xs text-muted-foreground mb-2">Billing issues, bugs, account help.</p>
          <p className="text-sm font-semibold text-primary">support@usebillam.com</p>
        </a>

        <a
          href="mailto:hello@usebillam.com"
          className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <Mail size={18} className="text-primary" />
          </div>
          <h3 className="font-bold text-foreground text-sm mb-1">General</h3>
          <p className="text-xs text-muted-foreground mb-2">Everything else — feedback, partnerships.</p>
          <p className="text-sm font-semibold text-primary">hello@usebillam.com</p>
        </a>
      </div>

      <LegalSection title="Response time">
        <p>
          We typically reply within one to two business days. For billing issues, including
          the email address on your account speeds things up.
        </p>
      </LegalSection>
    </>
  );
}
