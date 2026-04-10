import Link from "next/link";
import {
  FileText,
  Palette,
  Download,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Users,
} from "lucide-react";

/* ─── tiny reusable bits ─────────────────────────────────── */

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
      {children}
    </a>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest">
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
      {children}
    </p>
  );
}

/* ─── mock invoice card for hero ─────────────────────────── */
function MockInvoice() {
  return (
    <div className="w-full max-w-sm bg-white rounded-xl overflow-hidden shadow-2xl text-[11px] font-sans select-none">
      {/* header */}
      <div className="bg-[#2B52FF] px-5 py-4 flex justify-between items-start">
        <div>
          <div className="text-[#2B52FF] font-bold text-sm">Temi Adebayo Studio</div>
          <div className="text-white/40 text-[9px] uppercase tracking-widest mt-0.5">Creative Direction</div>
        </div>
        <div className="text-right">
          <div className="text-white font-bold text-lg leading-none">Invoice</div>
          <div className="text-[#2B52FF] font-bold text-[10px] mt-1">No. INV-2026-014</div>
        </div>
      </div>
      {/* body */}
      <div className="px-5 py-4 bg-gray-50 space-y-3">
        <div className="flex justify-between text-gray-500 text-[9px] uppercase tracking-wider pb-2 border-b border-gray-200">
          <span>Billed To</span>
          <span>Due Date</span>
        </div>
        <div className="flex justify-between">
          <div>
            <div className="font-bold text-gray-900 text-xs">Konga Nigeria Ltd</div>
            <div className="text-gray-400 text-[9px] mt-0.5">payments@konga.com</div>
          </div>
          <div className="text-right font-semibold text-gray-700 text-[10px]">30 Apr 2026</div>
        </div>
      </div>
      <div className="px-5 py-3">
        <div className="flex text-[9px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1.5 mb-2">
          <div className="flex-1">Description</div>
          <div className="w-8 text-center">Qty</div>
          <div className="w-16 text-right">Amount</div>
        </div>
        {[
          { desc: "Brand Identity Design", qty: 1, amt: "₦350,000" },
          { desc: "Social Media Kit", qty: 1, amt: "₦120,000" },
          { desc: "Pitch Deck Design", qty: 2, amt: "₦180,000" },
        ].map((row) => (
          <div key={row.desc} className="flex items-center py-1.5 border-b border-gray-50">
            <div className="flex-1 text-gray-700 font-medium">{row.desc}</div>
            <div className="w-8 text-center text-gray-400">{row.qty}</div>
            <div className="w-16 text-right font-semibold text-gray-900">{row.amt}</div>
          </div>
        ))}
        <div className="flex justify-between items-center pt-3 mt-1">
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-bold uppercase tracking-wide">Unpaid</span>
          <div className="text-right">
            <div className="text-[9px] text-gray-400 uppercase tracking-wider">Total Due</div>
            <div className="text-base font-black text-[#2B52FF]">₦650,000</div>
          </div>
        </div>
      </div>
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div className="text-[9px] text-gray-400">
          <div className="font-semibold text-gray-600">Zenith Bank · 0123456789</div>
          <div>Temi Adebayo</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-gray-800">Thank You!</div>
          <div className="text-[8px] text-gray-400 uppercase tracking-wider">We appreciate your business</div>
        </div>
      </div>
    </div>
  );
}

/* ─── page ───────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-6">
          <span className="text-lg font-black uppercase tracking-tight text-primary flex-shrink-0">
            Bill Am
          </span>

          <div className="hidden md:flex items-center gap-7">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How it works</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-5 pt-20 pb-16 md:pt-28 md:pb-24 max-w-6xl mx-auto w-full">
        <Badge>✦ Built for Nigerian Creatives</Badge>

        <h1 className="mt-6 text-5xl md:text-7xl font-black leading-[1.02] tracking-tight max-w-3xl">
          Invoice like a{" "}
          <span className="text-primary">pro.</span>
          <br />
          Get paid <span className="text-primary">faster.</span>
        </h1>

        <p className="mt-6 text-base md:text-xl text-muted-foreground max-w-xl leading-relaxed">
          The invoicing tool built for designers, photographers, videographers
          and every creative professional in Nigeria. Branded, professional, and
          PDF-ready in minutes.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
          >
            Create free account <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="px-7 py-3.5 text-sm font-semibold text-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            Log in
          </Link>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Free forever · No credit card required
        </p>

        {/* Mock invoice */}
        <div className="mt-16 relative w-full flex justify-center">
          {/* glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-64 bg-primary/10 rounded-full blur-3xl" />
          </div>
          <div className="relative rotate-1 hover:rotate-0 transition-transform duration-500">
            <MockInvoice />
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ── */}
      <section className="border-y border-border py-6">
        <div className="max-w-6xl mx-auto px-5 md:px-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 text-center">
          {[
            { stat: "2 min", label: "To create your first invoice" },
            { stat: "3", label: "Beautiful invoice templates" },
            { stat: "4", label: "Currencies supported" },
            { stat: "100%", label: "Free to get started" },
          ].map(({ stat, label }) => (
            <div key={label}>
              <div className="text-2xl font-black text-primary">{stat}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 md:py-28 px-5 md:px-10 max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <SectionLabel>Features</SectionLabel>
          <h2 className="text-3xl md:text-5xl font-black">
            Everything you need to{" "}
            <span className="text-primary">get paid</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            No bloat. Just the tools a creative freelancer actually uses every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Palette,
              title: "Your brand, your invoice",
              desc: "Upload your logo, pick your brand colour and accent. Every invoice looks like it came from your design studio.",
            },
            {
              icon: FileText,
              title: "Live invoice preview",
              desc: "See exactly how your invoice looks as you type. What you see is what your client gets.",
            },
            {
              icon: Download,
              title: "One-click PDF",
              desc: "Download a polished, print-ready PDF instantly. Send it by email, WhatsApp, or anywhere.",
            },
            {
              icon: Clock,
              title: "Payment tracking",
              desc: "Mark invoices as Unpaid, Part Payment, or Paid. Always know who owes you and how much.",
            },
            {
              icon: Users,
              title: "Client address book",
              desc: "Save client details once, reuse them forever. No more retyping the same email address.",
            },
            {
              icon: Zap,
              title: "VAT & multi-currency",
              desc: "Toggle 7.5% VAT on or off. Bill in NGN, USD, GBP or EUR — whatever your client prefers.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <Icon size={18} className="text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-base mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 md:py-28 px-5 md:px-10 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-black">
              From signup to{" "}
              <span className="text-primary">sent invoice</span>
              <br />in under 5 minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Create your account",
                desc: "Sign up in 30 seconds with just your name and email. Set up your brand details at your own pace.",
                cta: "Sign up free",
                href: "/register",
              },
              {
                step: "02",
                title: "Set up your profile",
                desc: "Add your business name, logo, brand colours and bank details. Takes 2 minutes, done once.",
                cta: null,
                href: null,
              },
              {
                step: "03",
                title: "Create & send invoices",
                desc: "Fill in your client details, add line items, pick a template. Download PDF and send.",
                cta: null,
                href: null,
              },
            ].map(({ step, title, desc, cta, href }) => (
              <div key={step} className="relative p-7 rounded-2xl border border-border bg-card">
                <div className="text-5xl font-black text-primary/20 mb-4 leading-none">{step}</div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
                {cta && href && (
                  <Link href={href} className="text-sm font-semibold text-primary hover:opacity-80 flex items-center gap-1">
                    {cta} <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEMPLATES ── */}
      <section className="py-20 md:py-28 px-5 md:px-10 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>Templates</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-black">
              Three looks. <span className="text-primary">All professional.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every template uses your brand colour and accent automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Classic",
                desc: "Traditional layout with bold header. Timeless and authoritative.",
                tag: "Most popular",
              },
              {
                name: "Clean",
                desc: "Minimal design, lots of white space. Ideal for premium clients.",
                tag: null,
              },
              {
                name: "Modern",
                desc: "Two-column layout with dark header panel. Bold and contemporary.",
                tag: null,
              },
            ].map(({ name, desc, tag }) => (
              <div
                key={name}
                className="rounded-2xl border border-border bg-card overflow-hidden group hover:border-primary/30 transition-colors"
              >
                {/* template thumbnail placeholder */}
                <div className="h-48 bg-gradient-to-br from-secondary to-muted flex items-center justify-center relative">
                  <div className="w-32 h-40 bg-white/90 rounded shadow-lg flex flex-col overflow-hidden">
                    <div className="h-10 bg-[#2B52FF] flex items-center px-2">
                      <div className="w-12 h-1.5 bg-[#2B52FF] rounded" />
                    </div>
                    <div className="flex-1 p-2 space-y-1">
                      <div className="w-full h-1 bg-gray-200 rounded" />
                      <div className="w-3/4 h-1 bg-gray-200 rounded" />
                      <div className="mt-2 w-full h-px bg-gray-300" />
                      <div className="w-full h-1 bg-gray-100 rounded" />
                      <div className="w-full h-1 bg-gray-100 rounded" />
                      <div className="w-2/3 h-1 bg-gray-100 rounded" />
                      <div className="mt-2 flex justify-end">
                        <div className="w-12 h-2 bg-[#2B52FF] rounded" />
                      </div>
                    </div>
                  </div>
                  {tag && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full uppercase tracking-wide">
                      {tag}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base">{name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 md:py-28 px-5 md:px-10 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-black">
              Simple, <span className="text-primary">honest</span> pricing
            </h2>
            <p className="mt-4 text-muted-foreground">Start free. No credit card. No surprises.</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="p-8 rounded-2xl border-2 border-primary bg-card relative overflow-hidden">
              <div className="absolute top-5 right-5 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-wider">
                Free for now
              </div>
              <div className="text-4xl font-black mt-2">₦0</div>
              <div className="text-muted-foreground text-sm mt-1 mb-6">Always free while we&apos;re in beta</div>

              <div className="space-y-3">
                {[
                  "Unlimited invoices",
                  "3 invoice templates",
                  "PDF downloads",
                  "Client address book",
                  "VAT calculation",
                  "Multi-currency (NGN, USD, GBP, EUR)",
                  "Custom brand colours & logo",
                  "Payment tracking",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-3 text-sm">
                    <CheckCircle size={15} className="text-primary flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className="mt-8 flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
              >
                Get started free <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 md:py-28 px-5 md:px-10 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black">
            Ready to get <span className="text-primary">paid?</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Join Nigerian creatives who bill with confidence.
            Create your account in 30 seconds.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
          >
            Create free account <ArrowRight size={17} />
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            No credit card · No setup fee · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border py-8 px-5 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="font-black uppercase text-primary text-sm">Bill Am</span>
            <span className="text-xs text-muted-foreground">Built for Nigerian creatives</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <Link href="/login" className="hover:text-foreground transition-colors">Log in</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Bill Am</p>
        </div>
      </footer>

    </div>
  );
}
