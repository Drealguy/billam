import { LegalPageHeader, LegalSection, LegalList } from "@/components/legal-section";

export const metadata = {
  title: "Refund Policy — Bill Am",
  description: "When Bill Am issues refunds for Pro subscriptions.",
};

export default function RefundPolicyPage() {
  return (
    <>
      <LegalPageHeader title="Refund Policy" updated="July 23, 2026" />

      <LegalSection title="Monthly subscriptions">
        <p>
          Pro Monthly subscriptions are generally <strong>non-refundable</strong> once a
          payment has been billed. You can cancel at any time to stop future renewals — your
          Pro access continues until the end of the billing period you&apos;ve already paid for.
        </p>
      </LegalSection>

      <LegalSection title="Yearly subscriptions">
        <p>
          Pro Yearly subscriptions may be eligible for a refund if requested within a limited
          period after purchase (14 days) and the service has not been substantially used —
          for example, if you&apos;ve created few or no invoices since upgrading. Refund
          requests outside this window, or for accounts with significant usage, are handled
          case by case.
        </p>
      </LegalSection>

      <LegalSection title="Duplicate payments and billing errors">
        <p>
          If you were charged twice for the same subscription period, or billed the wrong
          amount due to an error on our end, we will always refund the difference in full.
          Reach out as soon as you notice the issue so we can resolve it quickly.
        </p>
      </LegalSection>

      <LegalSection title="How to request a refund">
        <p>To request a refund, email us with your account email and payment reference:</p>
        <LegalList
          items={[
            <>
              Email <a href="mailto:support@usebillam.com" className="text-primary font-semibold hover:opacity-80">support@usebillam.com</a> with the subject line &ldquo;Refund request.&rdquo;
            </>,
            "Include the email address on your Bill Am account and the approximate date of the charge.",
            "We'll review your request and respond within a few business days.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Questions about a charge?">
        <p>
          If you&apos;re unsure about a charge on your account or think something looks wrong,
          contact{" "}
          <a href="mailto:support@usebillam.com" className="text-primary font-semibold hover:opacity-80">
            support@usebillam.com
          </a>{" "}
          before disputing it with your bank — we&apos;re quick to help and it saves everyone
          time.
        </p>
      </LegalSection>
    </>
  );
}
