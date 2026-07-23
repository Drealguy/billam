import { LegalPageHeader, LegalSection, LegalList } from "@/components/legal-section";

export const metadata = {
  title: "Privacy Policy — Bill Am",
  description: "How Bill Am collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <LegalPageHeader title="Privacy Policy" updated="July 23, 2026" />

      <LegalSection title="The short version">
        <p>
          Bill Am is an invoicing tool built for Nigerian freelancers and small businesses.
          We collect the minimum information needed to let you create invoices, manage
          clients, and get paid. We never sell your data, and we only share it with the
          service providers required to actually run the app.
        </p>
      </LegalSection>

      <LegalSection title="What information we collect">
        <p>To provide the service, we collect:</p>
        <LegalList
          items={[
            <><strong>Your name</strong> — used to personalise your account and dashboard.</>,
            <><strong>Your email address</strong> — used for login, account verification, and important account notices.</>,
            <><strong>Business information</strong> — your business name, tagline, phone number, bank details, and brand colours, which appear on the invoices you create.</>,
            <><strong>Client information</strong> — names, emails, phone numbers, and addresses you add to your client address book.</>,
            <><strong>Invoice data</strong> — line items, amounts, currencies, due dates, and payment status for every invoice you create.</>,
            <><strong>Uploaded files</strong> — logos or other images you upload to appear on your invoices.</>,
          ]}
        />
      </LegalSection>

      <LegalSection title="Why we collect it">
        <p>
          Every piece of information above exists to make one thing possible: letting you
          create a professional invoice and get paid faster. Your business details and logo
          appear on the invoices you send. Your client details let you reuse the same client
          across multiple invoices instead of retyping them. Your email lets you log back
          into your account and recover it if you forget your password.
        </p>
        <p>
          We do not use your data for anything beyond running Bill Am — no advertising
          profiles, no third-party marketing lists.
        </p>
      </LegalSection>

      <LegalSection title="How we protect your data">
        <p>
          All connections to Bill Am are encrypted in transit using HTTPS, so data moving
          between your browser and our servers can&apos;t be read by anyone in between.
        </p>
        <p>
          Your data is stored in a database that only your account can access — invoices,
          clients, and business details are isolated per user, and access is enforced at the
          database level, not just in the app&apos;s interface.
        </p>
        <p>
          Passwords are never stored in plain text; authentication is handled by our
          infrastructure provider using industry-standard hashing.
        </p>
      </LegalSection>

      <LegalSection title="We do not sell your data">
        <p>
          Bill Am does not sell, rent, or trade your personal information or your business
          data to anyone, under any circumstances.
        </p>
      </LegalSection>

      <LegalSection title="Who we share data with">
        <p>
          We work with a small number of trusted service providers who help us actually run
          Bill Am. We only share the data each provider needs to do its job:
        </p>
        <LegalList
          items={[
            <><strong>Supabase</strong> — our database and authentication provider. It stores your account, invoices, clients, and files.</>,
            <><strong>Vercel</strong> — our application hosting provider. It runs the Bill Am website and app.</>,
            <><strong>Paystack</strong> — our payment processor. It handles subscription payments; Bill Am never sees or stores your card details.</>,
          ]}
        />
        <p>
          These providers are contractually bound to protect your data and only use it to
          deliver the service we&apos;ve asked them to provide — not for their own purposes.
        </p>
      </LegalSection>

      <LegalSection title="Public invoice links">
        <p>
          When you send a client an invoice link, that specific invoice becomes viewable to
          anyone with the link, by design — that&apos;s how your client sees and pays it.
          Your other invoices, clients, and account details are never exposed through that link.
        </p>
      </LegalSection>

      <LegalSection title="Account deletion">
        <p>
          You can request deletion of your account at any time by contacting{" "}
          <a href="mailto:support@usebillam.com" className="text-primary font-semibold hover:opacity-80">
            support@usebillam.com
          </a>
          . Once confirmed, your account and all associated data — invoices, clients, uploaded
          files, and business information — will be permanently removed from our systems.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          If we make meaningful changes to how we handle your data, we&apos;ll update this page
          and, where appropriate, notify you directly.
        </p>
      </LegalSection>

      <LegalSection title="Questions">
        <p>
          If anything here is unclear, reach out at{" "}
          <a href="mailto:support@usebillam.com" className="text-primary font-semibold hover:opacity-80">
            support@usebillam.com
          </a>{" "}
          — we&apos;re happy to explain.
        </p>
      </LegalSection>
    </>
  );
}
