import Link from "next/link";
import { LegalPageHeader, LegalSection, LegalList } from "@/components/legal-section";

export const metadata = {
  title: "Terms of Service — Bill Am",
  description: "The terms that govern your use of Bill Am.",
};

export default function TermsPage() {
  return (
    <>
      <LegalPageHeader title="Terms of Service" updated="July 23, 2026" />

      <LegalSection title="Agreement to terms">
        <p>
          By creating an account or using Bill Am, you agree to these Terms of Service. If
          you don&apos;t agree with any part of them, please don&apos;t use the service.
        </p>
      </LegalSection>

      <LegalSection title="Your responsibilities">
        <p>As a Bill Am user, you agree to:</p>
        <LegalList
          items={[
            "Provide accurate information when creating your account and business profile.",
            "Keep your login credentials confidential and secure.",
            "Be responsible for all activity that happens under your account.",
            "Only invoice for legitimate goods or services you actually provide.",
            "Comply with applicable tax and business regulations in your jurisdiction.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree not to use Bill Am to:</p>
        <LegalList
          items={[
            "Create fraudulent, deceptive, or fake invoices.",
            "Harass, scam, or mislead any client or third party.",
            "Upload unlawful, harmful, or infringing content (including logos or files you don't have rights to).",
            "Attempt to bypass plan limits, security controls, or access another user's data.",
            "Interfere with or disrupt the operation of the service.",
          ]}
        />
        <p>
          We reserve the right to suspend or terminate accounts that violate these rules.
        </p>
      </LegalSection>

      <LegalSection title="Subscription plans">
        <p>
          Bill Am offers a Free plan with limited monthly invoices, clients, and features,
          and a Pro plan (billed monthly or yearly) with unlimited invoices and clients, all
          invoice templates, custom branding, PDF export, and payment status tracking.
          Current pricing is always shown on our{" "}
          <Link href="/#pricing" className="text-primary font-semibold hover:opacity-80">pricing page</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Billing">
        <p>
          Pro subscriptions are billed in advance, either monthly or yearly depending on the
          plan you choose, via our payment processor, Paystack. Subscriptions renew
          automatically at the end of each billing period unless cancelled beforehand.
        </p>
        <p>
          It&apos;s your responsibility to keep your payment details up to date. If a renewal
          payment fails, we may attempt to retry it before restricting Pro features on your
          account.
        </p>
      </LegalSection>

      <LegalSection title="Cancellation">
        <p>
          You can cancel your Pro subscription at any time from your account&apos;s Billing
          page. When you cancel, you keep Pro access until the end of your current billing
          period, after which your account moves to the Free plan. See our{" "}
          <a href="/refund-policy" className="text-primary font-semibold hover:opacity-80">
            Refund Policy
          </a>{" "}
          for details on refunds.
        </p>
      </LegalSection>

      <LegalSection title="Intellectual property">
        <p>
          Bill Am — including its name, design, templates, and codebase — is owned by us and
          protected by applicable intellectual property laws. Your business content
          (invoices, client data, logos, and other files you upload) remains yours; we don&apos;t
          claim ownership over it, and we only use it to provide the service to you.
        </p>
      </LegalSection>

      <LegalSection title="Service availability">
        <p>
          We work to keep Bill Am available and reliable, but we don&apos;t guarantee
          uninterrupted access. The service may occasionally be unavailable for maintenance,
          updates, or reasons outside our control (including outages at our infrastructure
          providers).
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          Bill Am is provided &ldquo;as is.&rdquo; To the fullest extent permitted by law, we
          are not liable for indirect, incidental, or consequential damages arising from your
          use of the service, including lost revenue, lost data, or missed payments from
          clients. You are responsible for verifying invoice accuracy and following up on
          client payments.
        </p>
      </LegalSection>

      <LegalSection title="Account termination">
        <p>
          You may stop using Bill Am and request account deletion at any time. We may
          suspend or terminate your account if you violate these terms, engage in fraudulent
          activity, or misuse the service. Where reasonably possible, we&apos;ll notify you
          before taking action.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          We may update these terms from time to time. Continued use of Bill Am after an
          update means you accept the revised terms.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these terms? Reach us at{" "}
          <a href="mailto:support@useusebillam.comm" className="text-primary font-semibold hover:opacity-80">
            support@useusebillam.comm
          </a>
          .
        </p>
      </LegalSection>
    </>
  );
}
