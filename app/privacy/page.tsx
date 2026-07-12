import type { Metadata } from "next";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Fix or Forget collects no accounts and uses privacy-friendly, cookieless analytics.",
};

export default function PrivacyPage() {
  return (
    <Prose title="Privacy">
      <p>
        We built Fix or Forget to be light on your data. There are no accounts, no
        logins, and no advertising or tracking cookies — so there&apos;s no cookie
        consent banner to click through.
      </p>
      <h2>Analytics</h2>
      <p>
        If analytics are enabled, we use a privacy-friendly, cookieless tool (such as
        Plausible or Umami) that records aggregate page views without personal
        identifiers or cross-site tracking. We can&apos;t identify individual visitors.
      </p>
      <h2>Feedback</h2>
      <p>
        The optional &quot;Did this match your quote?&quot; widget sends only what you
        submit — your thumbs up/down, any comment you type, and the verdict URL — to a
        form-capture service so we can improve our estimates. Don&apos;t include
        personal information in the comment box.
      </p>
      <h2>Affiliate links</h2>
      <p>
        When you click through to a partner (a refurbished marketplace, parts supplier,
        or trade-in service), that third party&apos;s own privacy policy applies. We
        don&apos;t receive any personal data back from those clicks.
      </p>
    </Prose>
  );
}
