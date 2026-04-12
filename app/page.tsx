import Link from "next/link";
import {
  FileText,
  Palette,
  Download,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  Users,
} from "lucide-react";
import { NavInstallButton } from "@/components/nav-install-button";

/* ─── animations injected once ─────────────────────────────── */
const globalStyles = `
  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  /* Very soft: just a gentle fade + 6px lift, nothing dramatic */
  @keyframes softFade {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .anim-fade-up {
    opacity: 0;
    animation: softFade 0.65s cubic-bezier(0.4,0,0.2,1) forwards;
  }
  .anim-fade-in {
    opacity: 0;
    animation: softFade 0.55s cubic-bezier(0.4,0,0.2,1) forwards;
  }
  .anim-scale-in {
    opacity: 0;
    animation: softFade 0.75s cubic-bezier(0.4,0,0.2,1) forwards;
  }

  /* Scroll-triggered — just opacity + 6px, very subtle */
  @supports (animation-timeline: view()) {
    .scroll-reveal {
      animation: softFade linear both;
      animation-timeline: view();
      animation-range: entry 5% entry 28%;
    }
  }
  @supports not (animation-timeline: view()) {
    .scroll-reveal {
      animation: softFade 0.65s cubic-bezier(0.4,0,0.2,1) both;
    }
  }

  .marquee-track {
    animation: marquee 32s linear infinite;
  }
  .marquee-track:hover {
    animation-play-state: paused;
  }
`;

/* ─── tiny reusable bits ─────────────────────────────────── */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
      {children}
    </a>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
      {children}
    </p>
  );
}

/* ─── mock dashboard for hero ────────────────────────────── */
function MockDashboard() {
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-border text-[10px] select-none bg-background">

      {/* Browser chrome */}
      <div className="bg-secondary/60 border-b border-border px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 bg-background border border-border rounded-md px-3 py-1 text-[9px] text-muted-foreground text-center">
          billam.co/dashboard
        </div>
      </div>

      {/* Dashboard layout */}
      <div className="flex" style={{ height: "280px" }}>

        {/* Sidebar */}
        <div className="w-40 border-r border-border bg-background flex flex-col px-3 py-3 flex-shrink-0">
          <div className="text-primary font-black uppercase text-[11px] tracking-tight mb-4 px-1">BILL AM</div>

          {/* User card */}
          <div className="bg-secondary/60 rounded-xl p-2 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-[8px] font-black text-primary flex-shrink-0">FB</div>
            <div className="min-w-0">
              <div className="font-bold text-[9px] truncate">Feranmi biz</div>
              <div className="text-muted-foreground text-[8px] truncate">Ojediji Feranmi</div>
            </div>
          </div>

          {/* Nav items */}
          <div className="space-y-0.5 flex-1">
            {[
              { label: "Overview", active: true },
              { label: "Invoices" },
              { label: "Clients" },
              { label: "Settings" },
            ].map(({ label, active }) => (
              <div
                key={label}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-medium ${
                  active
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="text-[8px] text-muted-foreground px-2.5 py-1">Log out</div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 overflow-hidden bg-secondary/10">

          {/* Top bar */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-black text-[13px] leading-tight">
                Welcome back, <span className="text-primary">Ojediji</span> 👋
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Here&apos;s your overview for Apr 2026</div>
            </div>
            <div className="bg-primary text-primary-foreground text-[9px] font-bold px-2.5 py-1.5 rounded-lg flex-shrink-0">
              + New Invoice
            </div>
          </div>

          {/* Setup checklist */}
          <div className="bg-background border border-border rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-bold text-[10px]">Set up your account</div>
                <div className="text-muted-foreground text-[8px]">2 of 5 steps completed</div>
              </div>
              <div className="w-20 h-1 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "40%" }} />
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Complete your business profile", done: true },
                { label: "Upload your logo", done: true },
                { label: "Set your brand colours", done: false },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full border flex-shrink-0 flex items-center justify-center ${done ? "border-primary/40 bg-primary/10" : "border-border"}`}>
                    {done && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                  <span className={`text-[8px] ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "INVOICES SENT", value: "0", sub: "THIS MONTH", color: "" },
              { label: "BILLED", value: "₦0", sub: "THIS MONTH", color: "text-primary" },
              { label: "COLLECTED", value: "₦0", sub: "THIS MONTH", color: "text-emerald-500" },
              { label: "OUTSTANDING", value: "₦0", sub: "ALL INVOICES", color: "text-amber-500" },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="bg-background border border-border rounded-xl p-2.5">
                <div className="text-[7px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
                <div className={`font-black text-[14px] leading-none ${color}`}>{value}</div>
                <div className="text-[7px] text-muted-foreground mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── mock invoice (used in templates section) ────────────── */
function MockInvoice() {
  return (
    <div className="w-full max-w-xs bg-white rounded-xl overflow-hidden shadow-xl text-[10px] font-sans select-none border border-gray-100">
      <div className="bg-[#2B52FF] px-4 py-3 flex justify-between items-start">
        <div>
          <div className="text-white font-bold text-[11px]">Temi Adebayo Studio</div>
          <div className="text-white/50 text-[8px] uppercase tracking-widest mt-0.5">Creative Direction</div>
        </div>
        <div className="text-right">
          <div className="text-white font-bold text-base leading-none">Invoice</div>
          <div className="text-white/60 font-bold text-[9px] mt-1">INV-2026-014</div>
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 space-y-2">
        <div className="flex justify-between text-gray-400 text-[8px] uppercase tracking-wider pb-1.5 border-b border-gray-200">
          <span>Billed To</span><span>Due Date</span>
        </div>
        <div className="flex justify-between">
          <div>
            <div className="font-bold text-gray-900 text-[10px]">Konga Nigeria Ltd</div>
            <div className="text-gray-400 text-[8px] mt-0.5">payments@konga.com</div>
          </div>
          <div className="text-right font-semibold text-gray-700 text-[9px]">30 Apr 2026</div>
        </div>
      </div>
      <div className="px-4 py-2.5">
        {[
          { desc: "Brand Identity Design", amt: "₦350,000" },
          { desc: "Social Media Kit", amt: "₦120,000" },
          { desc: "Pitch Deck Design", amt: "₦180,000" },
        ].map((row) => (
          <div key={row.desc} className="flex items-center py-1.5 border-b border-gray-50">
            <div className="flex-1 text-gray-700 font-medium text-[9px]">{row.desc}</div>
            <div className="text-right font-semibold text-gray-900 text-[9px]">{row.amt}</div>
          </div>
        ))}
        <div className="flex justify-between items-center pt-2.5 mt-1">
          <span className="text-[8px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-bold uppercase">Unpaid</span>
          <div className="text-right">
            <div className="text-[8px] text-gray-400 uppercase tracking-wider">Total Due</div>
            <div className="text-sm font-black text-[#2B52FF]">₦650,000</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── marquee stats strip ─────────────────────────────────── */
const MARQUEE_ITEMS = [
  { stat: "2 min", label: "To create your first invoice" },
  { stat: "3", label: "Beautiful invoice templates" },
  { stat: "4", label: "Currencies supported" },
  { stat: "100%", label: "Free to get started" },
  { stat: "₦650k+", label: "Average invoice value" },
  { stat: "30 sec", label: "To sign up" },
];

/* ─── page ───────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md anim-fade-in">
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
            {/* Mobile: Install App only. Desktop: all three buttons */}
            <NavInstallButton />
            <Link
              href="/login"
              className="hidden md:block px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="hidden md:block px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="flex-1 flex flex-col items-center text-center px-5 pt-16 pb-12 md:pt-24 md:pb-16 max-w-6xl mx-auto w-full">

        <div className="anim-fade-up" style={{ animationDelay: "0.05s" }}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest">
            ✦ Built for Nigerian Creatives
          </span>
        </div>

        <h1
          className="mt-6 text-5xl md:text-7xl font-black leading-[1.02] tracking-tight max-w-3xl anim-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          Invoice like a{" "}
          <span className="text-primary">pro.</span>
          <br />
          Get paid <span className="text-primary">faster.</span>
        </h1>

        <p
          className="mt-6 text-base md:text-xl text-muted-foreground max-w-xl leading-relaxed anim-fade-up"
          style={{ animationDelay: "0.25s" }}
        >
          The invoicing tool built for designers, photographers, videographers
          and every creative professional in Nigeria. Branded, professional, and
          PDF-ready in minutes.
        </p>

        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-4 anim-fade-up"
          style={{ animationDelay: "0.35s" }}
        >
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

        <p className="mt-4 text-xs text-muted-foreground anim-fade-up" style={{ animationDelay: "0.45s" }}>
          Free forever · No credit card required
        </p>

        {/* Dashboard mockup */}
        <div
          className="mt-14 relative w-full anim-scale-in"
          style={{ animationDelay: "0.5s" }}
        >
          {/* glow */}
          <div className="absolute -inset-4 flex items-center justify-center pointer-events-none">
            <div className="w-full h-48 bg-primary/8 rounded-full blur-3xl" />
          </div>
          {/* horizontal scroll on mobile so the mockup isn't crushed */}
          <div className="relative overflow-x-auto rounded-2xl">
            <div style={{ minWidth: "520px" }}>
              <MockDashboard />
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <section className="border-y border-border py-5 overflow-hidden">
        <div className="flex">
          {/* duplicate list so the loop is seamless */}
          <div className="marquee-track flex items-center gap-0 whitespace-nowrap flex-shrink-0">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map(({ stat, label }, i) => (
              <div
                key={i}
                className="flex items-center gap-10 flex-shrink-0"
              >
                <div className="flex items-center gap-3 px-10">
                  <span className="text-xl font-black text-primary">{stat}</span>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <span className="text-primary/30 font-black text-lg">✦</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 md:py-28 px-5 md:px-10 max-w-6xl mx-auto w-full">
        <div className="text-center mb-14 scroll-reveal">
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
              className="scroll-reveal p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
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
          <div className="text-center mb-14 scroll-reveal">
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
              <div key={step} className="scroll-reveal relative p-7 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow duration-300">
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
          <div className="text-center mb-14 scroll-reveal">
            <SectionLabel>Templates</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-black">
              Three looks. <span className="text-primary">All professional.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every template uses your brand colour and accent automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Invoice preview on left */}
            <div className="scroll-reveal md:col-span-1 flex justify-center">
              <MockInvoice />
            </div>

            {/* Template cards */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  className="scroll-reveal rounded-2xl border border-border bg-card overflow-hidden group hover:border-primary/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="h-36 bg-gradient-to-br from-secondary to-muted flex items-center justify-center relative">
                    <div className="w-24 h-32 bg-white/90 rounded shadow-lg flex flex-col overflow-hidden">
                      <div className="h-8 bg-[#2B52FF]" />
                      <div className="flex-1 p-2 space-y-1">
                        <div className="w-full h-1 bg-gray-200 rounded" />
                        <div className="w-3/4 h-1 bg-gray-200 rounded" />
                        <div className="mt-2 w-full h-px bg-gray-300" />
                        <div className="w-full h-1 bg-gray-100 rounded" />
                        <div className="w-full h-1 bg-gray-100 rounded" />
                        <div className="mt-2 flex justify-end">
                          <div className="w-10 h-1.5 bg-[#2B52FF] rounded" />
                        </div>
                      </div>
                    </div>
                    {tag && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full uppercase tracking-wide">
                        {tag}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-base">{name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 md:py-28 px-5 md:px-10 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 scroll-reveal">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-black">
              Simple, <span className="text-primary">honest</span> pricing
            </h2>
            <p className="mt-4 text-muted-foreground">Start free. Upgrade when you&apos;re ready. No surprises.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

            {/* Free */}
            <div className="scroll-reveal p-8 rounded-2xl border border-border bg-card flex flex-col hover:shadow-md transition-shadow duration-300">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Free</p>
                <div className="text-5xl font-black">₦0</div>
                <div className="text-muted-foreground text-sm mt-1">Get started, no card needed</div>
              </div>

              <div className="space-y-3 flex-1">
                {[
                  "5 invoices to get started",
                  "3 invoice templates",
                  "PDF downloads",
                  "Client address book",
                  "VAT calculation",
                  "Multi-currency support",
                  "Custom brand colours & logo",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-3 text-sm">
                    <CheckCircle size={14} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className="mt-8 flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-foreground border border-border rounded-xl hover:bg-secondary transition-colors"
              >
                Get started free <ArrowRight size={15} />
              </Link>
            </div>

            {/* Pro */}
            <div className="scroll-reveal p-8 rounded-2xl border-2 border-primary bg-card flex flex-col relative overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-5 right-5 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full uppercase tracking-wider">
                Most popular
              </div>

              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Pro</p>
                <div className="text-5xl font-black">₦10,000</div>
                <div className="text-muted-foreground text-sm mt-1">per year — less than ₦834/month</div>
              </div>

              <div className="space-y-3 flex-1">
                {[
                  "Unlimited invoices",
                  "Everything in Free",
                  "Edit invoices anytime",
                  "All templates & full branding",
                  "Client portal with payment info",
                  "Priority support",
                  "Contract generation (coming soon)",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-3 text-sm">
                    <CheckCircle size={14} className="text-primary flex-shrink-0" />
                    <span className={f.includes("coming soon") ? "text-muted-foreground" : "text-foreground"}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className="mt-8 flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity"
              >
                Get Pro — ₦10,000/yr <ArrowRight size={15} />
              </Link>
              <p className="text-center text-xs text-muted-foreground mt-3">
                Secure payment via Paystack
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 md:py-28 px-5 md:px-10 border-t border-border">
        <div className="max-w-2xl mx-auto text-center scroll-reveal">
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
