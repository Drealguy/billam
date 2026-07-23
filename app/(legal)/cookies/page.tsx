import { LegalPageHeader, LegalSection, LegalList } from "@/components/legal-section";

export const metadata = {
  title: "Cookie Notice — Bill Am",
  description: "How Bill Am uses cookies.",
};

export default function CookieNoticePage() {
  return (
    <>
      <LegalPageHeader title="Cookie Notice" updated="July 23, 2026" />

      <LegalSection title="What cookies we use">
        <p>
          Bill Am uses a small number of <strong>essential cookies</strong> — cookies that
          are necessary for the app to work at all. We currently use cookies for:
        </p>
        <LegalList
          items={[
            <><strong>Authentication</strong> — recognising that you&apos;re logged in as you move between pages.</>,
            <><strong>Security</strong> — protecting your account and session from tampering.</>,
            <><strong>Keeping you signed in</strong> — so you don&apos;t have to log in again every time you open the app.</>,
          ]}
        />
      </LegalSection>

      <LegalSection title="What we don't use cookies for">
        <p>
          Bill Am does not currently use advertising or tracking cookies, and we don&apos;t
          sell any data collected through cookies. If we ever add analytics in the future, we
          will update this notice to explain what&apos;s added and why.
        </p>
      </LegalSection>

      <LegalSection title="Managing cookies">
        <p>
          Because the cookies we use are essential to signing in and using the app, disabling
          them in your browser will prevent Bill Am from working correctly. Most browsers let
          you clear cookies for a specific site if you&apos;d like to log out everywhere at once.
        </p>
      </LegalSection>

      <LegalSection title="Questions">
        <p>
          Reach out at{" "}
          <a href="mailto:support@usebillam.com" className="text-primary font-semibold hover:opacity-80">
            support@usebillam.com
          </a>{" "}
          if you have questions about how we use cookies.
        </p>
      </LegalSection>
    </>
  );
}
