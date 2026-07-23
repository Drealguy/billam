export interface FaqEntry {
  question: string;
  answer: string;
}

export const FAQ: FaqEntry[] = [
  {
    question: "What is Bill Am?",
    answer:
      "Bill Am is an invoicing platform that helps freelancers, small businesses, and agencies create professional invoices, manage clients, and get paid faster.",
  },
  {
    question: "Is Bill Am free?",
    answer:
      "Yes. Bill Am offers a free plan that lets you create up to 5 invoices per month, manage up to 5 clients, use one invoice template, and includes Bill Am branding. Upgrade to Pro for unlimited access and premium features.",
  },
  {
    question: "What do I get with Bill Am Pro?",
    answer:
      "Bill Am Pro includes unlimited invoices, unlimited clients, custom branding, PDF export, invoice history, payment status tracking, and access to all invoice templates.",
  },
  {
    question: "How do I send an invoice?",
    answer:
      "Create a client, add your invoice details, include your products or services, and publish the invoice. You'll receive a shareable link that you can send to your client.",
  },
  {
    question: "How do my clients pay me?",
    answer:
      "Your invoices display your business bank details so clients can make a direct bank transfer. Payment integrations may be added in future updates.",
  },
  {
    question: "Is my business data secure?",
    answer:
      "Yes. Your data is stored securely and only you can access your business information. Bill Am uses secure authentication and encrypted connections to protect your account.",
  },
  {
    question: "How can I contact support?",
    answer:
      "You can reach the Bill Am support team through the in-app support chat or by emailing support@usebillam.com.",
  },
];

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "do", "does", "i", "you", "your", "my", "me",
  "to", "of", "in", "on", "for", "with", "and", "or", "how", "what", "can",
  "get", "it", "this", "that",
]);

function significantWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/** Simple keyword-overlap matcher — no LLM wired up, so this scores
 * each FAQ by how many significant words it shares with the query and
 * returns the best match above a minimum bar. Good enough for a fixed,
 * short FAQ list; revisit if the list grows much larger. */
export function matchFaq(query: string): FaqEntry | null {
  const queryWords = new Set(significantWords(query));
  if (queryWords.size === 0) return null;

  let best: FaqEntry | null = null;
  let bestScore = 0;

  for (const entry of FAQ) {
    const entryWords = significantWords(`${entry.question} ${entry.answer}`);
    let score = 0;
    for (const w of entryWords) {
      if (queryWords.has(w)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return bestScore >= 1 ? best : null;
}
