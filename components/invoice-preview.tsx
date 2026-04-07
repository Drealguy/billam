"use client";

import type { Profile } from "@/types";

interface PreviewData {
  profile: Profile;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  projectTitle: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  items: {
    description: string;
    details: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
  currency: string;
  sym: string;
  subtotal: number;
  vatEnabled: boolean;
  vatAmount: number;
  total: number;
  status: string;
  depositPaid: number;
  balanceDue: number;
  notes: string;
}

function fmt(n: number, sym: string) {
  return `${sym}${n.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  unpaid: { bg: "#fee2e2", text: "#dc2626", label: "UNPAID" },
  part_payment: { bg: "#dbeafe", text: "#2563eb", label: "PART PAID" },
  paid: { bg: "#d1fae5", text: "#059669", label: "PAID" },
};

export function InvoicePreview({ data }: { data: PreviewData }) {
  const {
    profile,
    invoiceNumber,
    invoiceDate,
    dueDate,
    projectTitle,
    clientName,
    clientEmail,
    clientPhone,
    clientAddress,
    items,
    sym,
    subtotal,
    vatEnabled,
    vatAmount,
    total,
    status,
    depositPaid,
    balanceDue,
    notes,
  } = data;

  const brand = profile?.brand_colour ?? "#0c1a0c";
  const accent = profile?.accent_colour ?? "#c8e52d";
  const statusStyle = STATUS_STYLE[status] ?? STATUS_STYLE.unpaid;

  return (
    <div
      style={{
        width: "595px",
        minHeight: "842px",
        background: "#ffffff",
        fontFamily: "Georgia, serif",
        fontSize: "12px",
        color: "#1a1a1a",
        boxShadow: "0 4px 40px rgba(0,0,0,0.25)",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: brand,
          padding: "28px 32px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          {profile?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.logo_url}
              alt="logo"
              style={{ height: "40px", marginBottom: "8px", objectFit: "contain" }}
            />
          ) : null}
          <div
            style={{
              color: accent,
              fontWeight: "bold",
              fontSize: "18px",
              fontFamily: "Arial, sans-serif",
              letterSpacing: "-0.3px",
            }}
          >
            {profile?.business_name || "Your Business"}
          </div>
          {profile?.business_tagline && (
            <div
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "9px",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginTop: "3px",
                fontFamily: "Arial, sans-serif",
              }}
            >
              {profile.business_tagline}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: "28px",
              fontWeight: "bold",
              fontFamily: "Arial, sans-serif",
              lineHeight: 1,
            }}
          >
            Invoice
          </div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", marginTop: "6px" }}>
            {formatDate(invoiceDate) || "Date"}
          </div>
          <div style={{ color: accent, fontSize: "11px", fontWeight: "bold", marginTop: "2px" }}>
            No. {invoiceNumber || "INV-001"}
          </div>
        </div>
      </div>

      {/* Billed to + dates */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "24px 32px 20px",
          borderBottom: "1px solid #e5e7eb",
          background: "#fafafa",
        }}
      >
        <div>
          <div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#9ca3af", marginBottom: "6px" }}>
            Billed To
          </div>
          <div style={{ fontWeight: "bold", fontSize: "14px", color: "#111" }}>
            {clientName || "Client Name"}
          </div>
          {clientEmail && <div style={{ color: "#6b7280", fontSize: "10px", marginTop: "2px" }}>{clientEmail}</div>}
          {clientPhone && <div style={{ color: "#6b7280", fontSize: "10px", marginTop: "1px" }}>{clientPhone}</div>}
          {clientAddress && <div style={{ color: "#6b7280", fontSize: "10px", marginTop: "1px" }}>{clientAddress}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#9ca3af", marginBottom: "6px" }}>
            Invoice Date
          </div>
          <div style={{ fontWeight: "bold", color: "#111", fontSize: "11px" }}>
            {formatDate(invoiceDate) || "—"}
          </div>
          <div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#9ca3af", marginTop: "10px", marginBottom: "6px" }}>
            Due Date
          </div>
          <div style={{ fontWeight: "bold", color: "#111", fontSize: "11px" }}>
            {formatDate(dueDate) || "Upon Receipt"}
          </div>
          {projectTitle && (
            <>
              <div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#9ca3af", marginTop: "10px", marginBottom: "4px" }}>
                Project
              </div>
              <div style={{ fontWeight: "bold", color: "#111", fontSize: "11px" }}>{projectTitle}</div>
            </>
          )}
        </div>
      </div>

      {/* Line items */}
      <div style={{ padding: "20px 32px 0" }}>
        {/* Table header */}
        <div
          style={{
            display: "flex",
            borderBottom: `2px solid ${brand}`,
            paddingBottom: "6px",
            marginBottom: "4px",
          }}
        >
          <div style={{ flex: 1, fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#374151" }}>
            Description
          </div>
          <div style={{ width: "50px", textAlign: "center", fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#374151" }}>
            Qty
          </div>
          <div style={{ width: "80px", textAlign: "right", fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#374151" }}>
            Rate
          </div>
          <div style={{ width: "80px", textAlign: "right", fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#374151" }}>
            Amount
          </div>
        </div>

        {items.length === 0 || (items.length === 1 && !items[0].description) ? (
          <div style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ flex: 1, color: "#9ca3af" }}>—</div>
            <div style={{ width: "50px", textAlign: "center" }}>1</div>
            <div style={{ width: "80px", textAlign: "right" }}>{sym}0</div>
            <div style={{ width: "80px", textAlign: "right" }}>{sym}0</div>
          </div>
        ) : (
          items.filter(i => i.description).map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                padding: "10px 0",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "500", color: "#111" }}>{item.description}</div>
                {item.details && (
                  <div style={{ color: "#9ca3af", fontSize: "10px", marginTop: "2px" }}>{item.details}</div>
                )}
              </div>
              <div style={{ width: "50px", textAlign: "center", color: "#374151" }}>{item.quantity}</div>
              <div style={{ width: "80px", textAlign: "right", color: "#374151" }}>{fmt(item.unit_price, sym)}</div>
              <div style={{ width: "80px", textAlign: "right", fontWeight: "600", color: "#111" }}>{fmt(item.total, sym)}</div>
            </div>
          ))
        )}

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
          <div style={{ width: "220px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "#6b7280", fontSize: "11px" }}>
              <span>Project Total</span>
              <span style={{ fontWeight: "500", color: "#374151" }}>{fmt(subtotal, sym)}</span>
            </div>
            {vatEnabled && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "#6b7280", fontSize: "11px" }}>
                <span>VAT (7.5%)</span>
                <span style={{ fontWeight: "500", color: "#374151" }}>{fmt(vatAmount, sym)}</span>
              </div>
            )}
            {status === "part_payment" && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "#6b7280", fontSize: "11px" }}>
                <span>Deposit Paid</span>
                <span style={{ fontWeight: "500", color: "#059669" }}>− {fmt(depositPaid, sym)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status + Amount Due */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: statusStyle.bg,
              color: statusStyle.text,
              fontSize: "10px",
              fontWeight: "bold",
              padding: "5px 12px",
              borderRadius: "20px",
            }}
          >
            ▲ {statusStyle.label}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "1px", color: "#9ca3af" }}>
              Amount Due
            </div>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#dc2626", marginTop: "2px" }}>
              {fmt(balanceDue, sym)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: payment info */}
      <div
        style={{
          background: "#f9fafb",
          borderTop: "1px solid #e5e7eb",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#9ca3af", marginBottom: "5px" }}>
            Payment Information
          </div>
          {profile?.bank_name && (
            <div style={{ fontSize: "10px", color: "#374151", fontWeight: "500" }}>{profile.bank_name}</div>
          )}
          {profile?.account_number && (
            <div style={{ fontSize: "10px", color: "#374151" }}>{profile.account_number}</div>
          )}
          {profile?.account_name && (
            <div style={{ fontSize: "10px", color: "#374151" }}>{profile.account_name}</div>
          )}
          {profile?.phone && (
            <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>{profile.phone}</div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#111", fontFamily: "Georgia, serif" }}>
            Thank You!
          </div>
          <div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#9ca3af", marginTop: "3px" }}>
            We appreciate your business
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div style={{ padding: "12px 32px 20px", borderTop: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#9ca3af", marginBottom: "4px" }}>
            Notes
          </div>
          <div style={{ fontSize: "10px", color: "#6b7280", lineHeight: 1.6 }}>{notes}</div>
        </div>
      )}
    </div>
  );
}
