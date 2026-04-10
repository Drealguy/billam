import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function sendWelcomeEmail(email: string, name: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return; // skip if not configured

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#2B52FF;padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;text-transform:uppercase;">
                Bill Am
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.75);text-transform:uppercase;letter-spacing:2px;">
                Pro Member
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:24px;font-weight:900;color:#111;">Welcome to Pro, ${name || "there"}! 🎉</p>
              <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
                Your payment was successful and your account has been upgraded. You now have <strong style="color:#111;">unlimited access</strong> to everything Bill Am has to offer.
              </p>

              <!-- Feature list -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:28px;">
                <tr><td style="padding:6px 0;font-size:14px;color:#374151;">✅ &nbsp; Unlimited invoices</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#374151;">✅ &nbsp; Edit invoices anytime</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#374151;">✅ &nbsp; All templates &amp; branding</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#374151;">✅ &nbsp; Client portal &amp; payment info</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#374151;">✅ &nbsp; PDF downloads</td></tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://billam.vercel.app/dashboard" style="display:inline-block;background:#2B52FF;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;">
                      Go to My Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
                Your Pro plan is active for 1 year from today.<br />
                Questions? Reply to this email or WhatsApp us at <strong>09167802170</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} Bill Am · Made for Nigerian creatives
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Bill Am <hello@billam.co>",
      to: [email],
      subject: "🎉 Welcome to Bill Am Pro — You're in!",
      html,
    }),
  });
}

export async function POST(req: NextRequest) {
  const { reference } = await req.json();
  if (!reference) return NextResponse.json({ error: "No reference" }, { status: 400 });

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify with Paystack
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });

  const data = await res.json();

  if (!data.status || data.data.status !== "success") {
    return NextResponse.json({ error: "Payment not verified" }, { status: 400 });
  }

  if (data.data.amount < 300000) {
    return NextResponse.json({ error: "Incorrect amount" }, { status: 400 });
  }

  const amountPaid = data.data.amount / 100;

  // Prevent double-upgrade
  const { data: existing } = await supabase
    .from("pro_users")
    .select("id")
    .eq("paystack_reference", reference)
    .single();

  if (existing) {
    await supabase.from("profiles").update({ plan: "pro" }).eq("id", user.id);
    return NextResponse.json({ success: true });
  }

  // Record in pro_users
  const { error: proError } = await supabase.from("pro_users").insert({
    user_id: user.id,
    email: user.email,
    paystack_reference: reference,
    amount_paid: amountPaid,
  });

  if (proError) return NextResponse.json({ error: proError.message }, { status: 500 });

  // Upgrade plan
  const { error: planError } = await supabase
    .from("profiles")
    .update({ plan: "pro" })
    .eq("id", user.id);

  if (planError) return NextResponse.json({ error: planError.message }, { status: 500 });

  // Fetch name for personalised email
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, business_name")
    .eq("id", user.id)
    .single();

  const name = profile?.business_name || profile?.full_name || "";

  // Send welcome email (fire-and-forget — don't block response)
  sendWelcomeEmail(user.email!, name);

  return NextResponse.json({ success: true });
}
