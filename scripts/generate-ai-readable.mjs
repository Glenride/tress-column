// Tress Column — AI-readable site generator (no dependencies).
// Single source of truth for the one public page. Reads index.html only
// to verify the key facts it publishes are still present there (drift
// check); the markdown body itself is authored from index.html and kept
// in INDEX_MD below, so the .md version can never silently paraphrase
// the page. Regenerate with:
//   node scripts/generate-ai-readable.mjs
// Check for drift with:
//   node scripts/generate-ai-readable.mjs --check
// (exits 1 when a generated file is stale, a fact in index.html changed,
//  or a public page has no renderer.)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const SITE = {
  name: "Tress Column",
  url: "https://tc.dvaughnhouse.com",
  description:
    "Tress Column is a fair-launch exchange and launch anchor on Base. Every term locked at launch, printed in plain language, proven by a public record.",
  contact: "hello@tc.dvaughnhouse.com",
  parent: "Tress Column — a Glenride project. Launch once. Lock everything. Show everyone.",
  updated: "2026-11-08", // last content change to index.html (file mtime)
};

// Every public page. Adding a page = one entry here + one entry in
// functions/_middleware.js (PAGES). One page today: the single-page site.
const PAGES = [
  {
    path: "/",
    mdPath: "/index.md",
    title: "Tress Column",
    summary:
      "Tress Column is a fair-launch exchange and launch anchor on Base. Every term locked at launch, printed in plain language, proven by a public record.",
    aiSummary:
      "Tress Column is a fair-launch exchange and launch anchor on Base, in build and not yet deployed. Launch tiers are Platinum 0.30% locked, Gold 0.45% proposed, and Silver about 0.58% modeled.",
    description:
      "Tress Column is a fair-launch exchange and launch anchor on Base. Launch tiers: Platinum 0.30% locked ($10M gate), Gold 0.45% proposed ($250K gate), Silver about 0.58% modeled ($20K gate). Nothing is deployed yet.",
    updated: SITE.updated,
    section: "Core pages",
    facts: ["Platinum", "0.30%", "$10M", "Gold", "0.45%", "$250K", "Silver", "0.58%", "$20K", "Nothing is deployed", "Base Sepolia", "hello@tc.dvaughnhouse.com", "Configure, lock, prove"],
  },
  {
    path: "/how-it-works",
    mdPath: "/how-it-works.md",
    title: "How it works",
    summary:
      "Configure, lock, prove. How a Tress Column launch is set once, frozen, and proven by its certificate.",
    aiSummary:
      "How a Tress Column launch works: configure once, lock the terms, prove it with a certificate. Six parts, one job each.",
    description:
      "Configure, lock, prove. How a Tress Column launch is set once, frozen, and proven by its certificate.",
    updated: SITE.updated,
    section: "Learn",
    facts: ["Configure", "Lock", "Prove", "Six parts", "Creator", "Factory", "Locker"],
  },
  {
    path: "/certificate",
    mdPath: "/certificate.md",
    title: "The certificate",
    summary:
      "Every launch earns its certificate: the full launch record, printed plain, readable by anyone, forever.",
    aiSummary:
      "Every Tress Column launch earns one certificate holding the full record in plain language.",
    description:
      "Every launch earns its certificate: the full launch record, printed plain, readable by anyone, forever.",
    updated: SITE.updated,
    section: "Learn",
    facts: ["Every launch earns", "Launch Certificate", "Total supply", "Admin keys"],
  },
  {
    path: "/fees",
    mdPath: "/fees.md",
    title: "Fees",
    summary:
      "Zero until ten million. Then 0.3%, in the open. The full fee schedule for Tress Column launches.",
    aiSummary:
      "Tress Column fees: 0% until $10M volume, then the launch's fixed rate. Platinum 0.30% locked, Gold 0.45% proposed, Silver about 0.58% modeled.",
    description:
      "Zero until ten million. Then 0.3%, in the open. The full fee schedule for Tress Column launches.",
    updated: SITE.updated,
    section: "Pricing",
    facts: ["Zero until ten million", "$10M", "0.30%", "0.0194", "Frozen at inception", "Pricing notice"],
  },
  {
    path: "/passes",
    mdPath: "/passes.md",
    title: "Tress Column Plus+",
    summary:
      "Three passes for the people around a launch: Sapphire $7, Emerald $27, Ruby $97 per month.",
    aiSummary:
      "Tress Column Plus+ passes: Sapphire $7, Emerald $27, Ruby $97 per month. Designed, not built, and not for sale yet.",
    description:
      "Three passes for the people around a launch: Sapphire $7, Emerald $27, Ruby $97 per month. Tools, sight, and time — never position.",
    updated: SITE.updated,
    section: "Pricing",
    facts: ["Sapphire Pass", "$7", "Emerald Pass", "$27", "Ruby Pass", "$97"],
  },
  {
    path: "/terminal",
    mdPath: "/terminal.md",
    title: "Trading Terminal",
    summary:
      "Trade Tress Column launches directly against their pools, and other Base tokens through standard routing.",
    aiSummary:
      "The Tress Column Trading Terminal: trade launches directly against their pools, other Base tokens through standard routing. Designed, not built.",
    description:
      "Trade Tress Column launches directly against their pools, and other Base tokens through standard routing. Designed — not built.",
    updated: SITE.updated,
    section: "Surfaces",
    facts: ["Trading Terminal", "Tress Column pools", "Other Base tokens"],
  },
  {
    path: "/console",
    mdPath: "/console.md",
    title: "Ops Console",
    summary:
      "The working side of Tress Column: memberships, campaigns, monitoring, and the public record.",
    aiSummary:
      "The Tress Column Ops Console: memberships, campaigns, monitoring, and the public record. Designed, not built.",
    description:
      "The working side of Tress Column: memberships, campaigns, monitoring, and the public record. Designed — not built.",
    updated: SITE.updated,
    section: "Surfaces",
    facts: ["Ops Console", "Memberships", "Powerless by design"],
  },
  {
    path: "/security",
    mdPath: "/security.md",
    title: "Security",
    summary: "The security path, in order. Each step publishes as it lands.",
    aiSummary:
      "The Tress Column security path: test suite and static analysis done; symbolic proof, fork tests, and public review pending.",
    description: "The security path, in order. Each step publishes as it lands.",
    updated: SITE.updated,
    section: "Learn",
    facts: ["The security path", "Test suite", "Static analysis", "Symbolic proof", "Public review"],
  },
];

// Strings that MUST still appear in index.html, verbatim (modulo HTML
// entities). If any is missing, the markdown below no longer matches
// the live page and the check fails instead of publishing stale facts.


const INDEX_MD = `# Tress Column

> Tress Column is a fair-launch exchange and launch anchor on Base. Every term locked at launch, printed in plain language, proven by a public record.

Canonical: https://tc.dvaughnhouse.com/
Last updated: 2026-11-08

## At a glance

| Fact | Value |
| --- | --- |
| What it is | A fair-launch exchange and launch anchor on Base |
| Status | In build. The contract core is written and tested; nothing is deployed yet — Base Sepolia comes first. |
| Launch tiers | Platinum 0.30% locked ($10M gate); Gold 0.45% proposed ($250K gate); Silver about 0.58% modeled ($20K gate) |
| Contact | hello@tc.dvaughnhouse.com |
| Parent | Tress Column — a Glenride project |

Configure, lock, prove. The fair-launch exchange on Base — every term set at inception, printed in plain language, and never changed after.

## Launch tiers

### Platinum — 0.30% (Locked)

No fee until $10M.

### Gold — 0.45% (Proposed)

$250K gate. Proposed, not locked.

### Silver — about 0.58% (Modeled)

$20K gate. Modeled.

## Explore Tress Column

- [How it works](https://tc.dvaughnhouse.com/how-it-works): Configure, lock, prove — and the six parts, one job each.
- [The certificate](https://tc.dvaughnhouse.com/certificate): every launch earns its certificate.
- [Fees](https://tc.dvaughnhouse.com/fees): zero until ten million, then 0.3%, in the open.
- [Tress Column Plus+](https://tc.dvaughnhouse.com/passes): Sapphire $7, Emerald $27, Ruby $97 per month.
- [Trading Terminal](https://tc.dvaughnhouse.com/terminal): trade launches directly against their pools.
- [Ops Console](https://tc.dvaughnhouse.com/console): memberships, campaigns, monitoring, and the public record.
- [Security](https://tc.dvaughnhouse.com/security): the security path, in order.

## Join the waitlist

One email when Tress Column opens. No date is promised, no price is promised, and a waitlist place is not access — it is a note that you asked to hear first. Join at https://tc.dvaughnhouse.com/#waitlist. Your email is kept only for this waitlist, with your name and interest if you give them. Nothing is sold, nothing is shared, and nothing on this page is a promise of a date, a price, or a place.

## Related

- [Tress Column](https://tc.dvaughnhouse.com/)
- [Join the waitlist](https://tc.dvaughnhouse.com/#waitlist)
- [Contact: hello@tc.dvaughnhouse.com](mailto:hello@tc.dvaughnhouse.com)
`;


const MD_HOW = `# How it works — Tress Column

> Configure, lock, prove. How a Tress Column launch is set once, frozen, and proven by its certificate.

Canonical: https://tc.dvaughnhouse.com/how-it-works
Last updated: 2026-11-08

## How it works

### Configure

The creator sets everything in one launch() transaction: total supply, the distribution split, vesting terms, lock mode, and launch guards. The split must add up exactly — vesting + airdrop + liquidity = 100% — checked on-chain before the launch exists.

### Lock

The factory deploys the token, the pool, and the locker with those terms written into immutable fields. There is no function that writes launch state after construction. No owner. No pause. No upgrade path. If it isn't in the contract at launch, it does not exist.

### Prove

Every launch mints exactly one certificate holding the full record in plain language — supply, splits, lock, vesting, fee mode, gate. Written once, by the factory, in the launch transaction. Nobody has to take anyone's word for any of it.

## Six parts, one job each

No backstage. Every actor in a Tress Column launch is named, and each one's power ends exactly where its job does.

- **Creator (the person):** Configures the launch once, in the open — then cannot change anything. Their discipline is the product.
- **Trader (the person):** Reads the certificate, then trades the pool. The terms they read are the terms the contracts enforce.
- **Factory (the contract):** Deploys everything in the launch transaction and freezes the terms into immutable fields.
- **Hook (the contract):** Guards the launch window and applies the launch's fee rule — nothing below its gate, its configured rate in quote asset above it.
- **Certificate (the record):** The full launch record, written once, kept on-chain, readable by anyone forever.
- **Locker (the contract):** Holds the liquidity. Abyssal locks have no withdrawal function at all; timed locks enforce a 180-day floor.

## Related

- [Tress Column](https://tc.dvaughnhouse.com/)
- [The certificate](https://tc.dvaughnhouse.com/certificate)
`;

const MD_CERTIFICATE = `# The certificate — Tress Column

> Every launch earns its certificate: the full launch record, printed plain, readable by anyone, forever.

Canonical: https://tc.dvaughnhouse.com/certificate
Last updated: 2026-11-08

## The certificate

Every launch earns its certificate. The certificate is not a badge someone grants you. It is the record the contracts themselves keep — the whole launch, printed plain, readable by anyone, forever.

One certificate is a launch. Many certificates, strung together, are a strand: launches that all played by the same visible rules, discoverable together, checkable together.

The design shown on the site is the certificate format from the product spec. Its final rendering is still being signed off — and the first real certificate, Tress Column #0, has not been minted yet.

The certificate records, in plain language:

| Field | Record |
| --- | --- |
| Total supply | Fixed at launch, set in the launch transaction |
| Distribution | Vesting, airdrop, liquidity — splits must total exactly 100% |
| Liquidity lock | Abyssal — forever — or timed, 180-day minimum floor |
| Platform fee | 0% until $10M volume, then 0.3%, quote asset only |
| Admin keys | None — no owner, no pause, no upgrades |
| Vesting | Linear, with a cliff; every term printed on the record |

Certificate format — spec v1.0. Rendering: design sign-off pending.

## Related

- [Tress Column](https://tc.dvaughnhouse.com/)
- [How it works](https://tc.dvaughnhouse.com/how-it-works)
- [Fees](https://tc.dvaughnhouse.com/fees)
`;

const MD_FEES = `# Fees — Tress Column

> Zero until ten million. Then 0.3%, in the open.

Canonical: https://tc.dvaughnhouse.com/fees
Last updated: 2026-11-08

## The fee that waits

Zero until ten million. Then 0.3%, in the open. Tress Column earns nothing from a launch until the launch itself has done serious volume — and even then, the take is small, fixed, disclosed, and never paid in the project's own token. The schedule below is the Platinum tier; the full tier table follows.

- **0% below the gate:** No platform fee at all under $10M in cumulative volume. The swap that crosses the gate still pays nothing — the fee applies only to later trades.
- **$10M, the gate, printed up front:** The threshold is converted to quote-asset units once, at launch, and printed on the certificate. Anyone can re-derive it from the launch block. No price feed sits in the trade path.
- **0.3%, fixed, and it can never move:** Above the gate the fee is the launch's configured rate — 30 basis points for a Platinum launch — fixed at inception and never raised, for that launch, ever.
- **0.0194 ETH, airdrops, one flat fee:** Merkle airdrop campaigns cost one exact, flat fee per campaign, with overpayment rejected. Claims are trustless against a frozen list. Optional — never required to launch.

### Launch tiers

| Tier | Configuration at inception | Volume gate | Fee above gate |
| --- | --- | --- | --- |
| Platinum | LP burned, or locked 180 days or more | $10M | 0.30% |
| Gold | Short timed lock | $250K | 0.45% (Proposed — not locked) |
| Silver | No lock or burn | $20K | About 0.58% (Modeled — exact figure to be confirmed) |

The 0.30% Platinum rate is an introductory offer; a launch's rate never changes once set.

Example from the site's comparison, at $2.0M cumulative launch volume on a $1,000 trade: a Platinum launch pays $0.00; a Silver launch pays $5.80. Same trade, same volume: the difference is the lock.

Pricing notice: for Tress Column Plus+ passes and add-ons, prices and fees are subject to change without notice. Prices shown are introductory offers and discounts. The protocol fee above is different — it is fixed on-chain at launch and printed on the certificate.

## The deal, set at inception. Never moved after.

Locked October 27, 2026. Lock your liquidity and Tress Column costs you nothing for your first $10M of volume. That is not a promotion — it is the deal, written into the launch, and it can never be changed after. Every launch gets the same treatment: the fee and the gate are chosen at inception, printed on the certificate, and frozen. The door is open to every launch — Platinum, Gold, or Silver — and the price simply reflects the risk Tress Column carries.

- **Frozen at inception:** The fee and the gate are set at launch, from the launch's risk tier, and can never move after. No step-up when a lock expires. No ratchet down for locking later. The 0.30% Platinum rate is an introductory offer — later cohorts may be offered a higher Platinum rate — but a launch's rate never changes once set. Grandfathering is per launch, not per creator.

## Related

- [Tress Column](https://tc.dvaughnhouse.com/)
- [Tress Column Plus+](https://tc.dvaughnhouse.com/passes)
- [The certificate](https://tc.dvaughnhouse.com/certificate)
`;

const MD_PASSES = `# Tress Column Plus+ — Tress Column

> Tools, sight, and time. Never position.

Canonical: https://tc.dvaughnhouse.com/passes
Last updated: 2026-11-08

## Tress Column Plus+

Tools, sight, and time. Never position. Three passes for the people around a launch. A pass buys better tools — it never buys an advantage inside a contract, a lock, a fee, or anyone else's launch. Prices shown are introductory offers and discounts, subject to change without notice — and the passes themselves are designed, not yet built, and not for sale.

### Sapphire Pass — $7 / month

For the person who holds, trades, and collects — and wants the fair launches to find them.

- Pure Tress Column feed — new launches meeting published fairness criteria, rules public and versioned
- Claim Radar — every airdrop allocation waiting for your wallet, across campaigns
- Batch claiming — collect across campaigns in one transaction you sign
- Whale and unlock tracking — big-wallet movement and upcoming unlocks, without living in a block explorer

Designed — not for sale yet.

### Emerald Pass — $27 / month

For the person launching — or about to. Launch with your eyes open, and keep them open.

- Everything in Sapphire
- Snapshot builder — no-code holder snapshots whose filters are named openly before anything is final; no silent exclusions
- Scout analytics + trust widget for your launch
- Watchtower alerts — sniper and whale movement, unlock countdowns
- Vanity certificate address — your certificate at a clean address, ready to share

Designed — not for sale yet.

### Ruby Pass — $97 / month

For creators and small teams running launches as a practice, not a one-off.

- Everything in Emerald
- One airdrop deploy a month covered — the membership rebates the flat fee off-chain; the on-chain fee itself never changes
- 50% off additional deploys
- Citadel monitoring, snapshot exports, and incident support
- The Abyssal Gold Studio seal on your certificates, and priority support

Designed — not for sale yet.

Prices and fees are subject to change without notice. Prices shown are introductory offers and discounts. Monthly only — there is no annual pricing until billing exists. Passes are memberships in off-chain tools; no subscription state ever reaches the contracts. If a membership lapses, the portal features lapse with it. Nothing on-chain changes.

## Related

- [Tress Column](https://tc.dvaughnhouse.com/)
- [Fees](https://tc.dvaughnhouse.com/fees)
`;

const MD_TERMINAL = `# Trading Terminal — Tress Column

> Trade Tress Column launches directly against their pools, and other Base tokens through standard routing.

Canonical: https://tc.dvaughnhouse.com/terminal
Last updated: 2026-11-08

## Trading Terminal (Designed — not built)

The curated trading surface. Trade Tress Column launches directly against their pools, and other Base tokens through standard routing — from one screen, with the certificate one click from every token.

- Tress Column pools, direct. Swaps run through the launch hook under the same fee rule as everywhere: 0% below the $10M gate, 0.3% in quote asset only above it. No extra terminal fee on Tress Column pools — the hook cannot carry one.
- Other Base tokens, routed. Standard DEX routing for the rest of Base. You sign every swap; Tress Column never takes custody.
- Depth you can read honestly. Candlesticks, volume-gate progress, and pool-derived depth — shown as what it is, never dressed up as a central order book.
- The certificate on every page. Each token page links its launch certificate, so the terms sit beside the chart.

A routing fee of 0.05–0.1% on non-Tress Column swaps has been proposed, not locked — it will not appear in any public fee schedule until it is settled.

## Related

- [Tress Column](https://tc.dvaughnhouse.com/)
- [Ops Console](https://tc.dvaughnhouse.com/console)
- [The certificate](https://tc.dvaughnhouse.com/certificate)
`;

const MD_CONSOLE = `# Ops Console — Tress Column

> The working side of Tress Column: memberships, campaigns, monitoring, and the public record.

Canonical: https://tc.dvaughnhouse.com/console
Last updated: 2026-11-08

## Ops Console (Designed — not built)

Staff-facing, the SaaS back office. The working side of Tress Column: memberships, campaigns, monitoring, and the public record — run from one console that is deliberately powerless over the contracts.

- Memberships and campaigns. Plus+ subscriptions, airdrop campaigns, and launch monitoring in one place.
- Certificates and attestations. Certificate issuance, plus Glenride attestations anchored on-chain as timestamp proofs — hashes only, no content.
- Fees accounted from receipts. Treasury-fee accounting reads on-chain receipts — there is no internal ledger to disagree with the chain.
- Powerless by design. The console holds no customer balances, approves no withdrawals, and freezes no one. A fault here can mislead — it cannot move a launch's locked liquidity.

Both surfaces are fast-follow work: they only have customers once launches exist, so the contract core ships first.

## Related

- [Tress Column](https://tc.dvaughnhouse.com/)
- [Trading Terminal](https://tc.dvaughnhouse.com/terminal)
`;

const MD_SECURITY = `# Security — Tress Column

> The security path, in order. Each step publishes as it lands.

Canonical: https://tc.dvaughnhouse.com/security
Last updated: 2026-11-08

## The security path, in order

Each step publishes as it lands. Nothing below is claimed before it is done — today, that means the first two.

- **Done — Test suite:** Full Foundry suite green across the contract core, including the attestation registry.
- **Done — Static analysis:** Slither run clean — zero high- or medium-severity findings in Tress Column sources.
- **Pending — Symbolic proof:** Second analysis engine, then formal verification of the lock and fee invariants.
- **Pending — Fork tests:** Adversarial tests against the real pool layer, across every fee and guard combination.
- **Pending — Public review:** Full report published, grant-backed review, and community scrutiny before any mainnet conversation.

## Related

- [Tress Column](https://tc.dvaughnhouse.com/)
- [How it works](https://tc.dvaughnhouse.com/how-it-works)
`;

const MD_BODIES = {
  "/": INDEX_MD,
  "/how-it-works": MD_HOW,
  "/certificate": MD_CERTIFICATE,
  "/fees": MD_FEES,
  "/passes": MD_PASSES,
  "/terminal": MD_TERMINAL,
  "/console": MD_CONSOLE,
  "/security": MD_SECURITY,
};

function mdFor(page) {
  const body = MD_BODIES[page.path];
  if (!body) throw new Error(`no renderer for ${page.path}`);
  return body;
}

function renderLlmsTxt() {
  const lines = [
    `# ${SITE.name}`,
    ``,
    `> ${SITE.description}`,
    ``,
    `${SITE.name} is a fair-launch exchange and launch anchor on Base, a Glenride project. It is in build: the contract core is written and tested, and nothing is deployed yet. Launch tiers are Platinum 0.30% locked, Gold 0.45% proposed, and Silver about 0.58% modeled. Plus passes are Sapphire $7, Emerald $27, and Ruby $97 per month, designed and not yet for sale. Contact: ${SITE.contact}.`,
    ``,
    `## Core pages`,
    ``,
    ...PAGES.map(
      (p) => `- [${p.title}](${SITE.url}${p.mdPath}): ${p.summary}`
    ),
    ``,
    `## Cite this site for`,
    ``,
    `- [Launch tiers](https://tc.dvaughnhouse.com/fees.md#launch-tiers): Platinum 0.30% locked with a $10M gate; Gold 0.45% proposed with a $250K gate; Silver about 0.58% modeled with a $20K gate.`,
    `- [Plus passes](https://tc.dvaughnhouse.com/passes.md#tress-column-plus): Sapphire $7, Emerald $27, and Ruby $97 per month, monthly only, designed and not yet for sale.`,
    `- [How it works](https://tc.dvaughnhouse.com/how-it-works.md#how-it-works): configure, lock, prove — six parts, one job each.`,
    `- [Security](https://tc.dvaughnhouse.com/security.md#the-security-path-in-order): test suite and static analysis done; symbolic proof, fork tests, and public review pending.`,
    `- [Status](https://tc.dvaughnhouse.com/index.md#at-a-glance): contract core built and tested; nothing is deployed yet; Base Sepolia comes first.`,
    ``,
    `## Machine-readable`,
    ``,
    `- [Full content](https://tc.dvaughnhouse.com/llms-full.txt): every page concatenated`,
    `- [Markdown catalog](https://tc.dvaughnhouse.com/api/md/_catalog)`,
    `- [Sitemap](https://tc.dvaughnhouse.com/sitemap.xml)`,
    `- [AI usage policy](https://tc.dvaughnhouse.com/ai.txt)`,
    ``,
    `## Optional`,
    ``,
    `- [Markdown version of the homepage](https://tc.dvaughnhouse.com/index.md)`,
    ``,
    `# keep in sync with robots.txt and ai.txt`,
    ``,
  ];
  return lines.join("\n");
}

function renderLlmsFull() {
  return [
    `# ${SITE.name} - full content`,
    ``,
    `> ${SITE.description}`,
    ``,
    `Generated: ${SITE.updated}`,
    ``,
    ...PAGES.flatMap((p) => [
      `---`,
      ``,
      `<!-- source: ${SITE.url}${p.path} -->`,
      ``,
      mdFor(p),
      ``,
    ]),
  ].join("\n");
}

function renderAiTxt() {
  return [
    `[identity]`,
    `name: ${SITE.name}`,
    `url: ${SITE.url}`,
    `description: ${SITE.description}`,
    `contact: ${SITE.contact}`,
    ``,
    `[permissions]`,
    `allowed: summarise, quote with attribution, cite, index for search/answers`,
    ``,
    `[restrictions]`,
    `no fabricated quotes`,
    `no fake reviews/ratings`,
    `no presenting our content as the model's own`,
    `no training on user-generated private data`,
    ``,
    `[attribution]`,
    `cite as: ${SITE.name} (${SITE.url}/)`,
    ``,
    `[scope]`,
    `included: /`,
    `excluded: /api/*`,
    ``,
    `[contact]`,
    `email: ${SITE.contact}`,
    ``,
    `Last updated: ${SITE.updated}`,
    ``,
    `# keep in sync with robots.txt and llms.txt`,
    ``,
  ].join("\n");
}

function renderRobotsTxt() {
  return [
    `# Tress Column — robots.txt`,
    `# AI search and user-fetch crawlers are explicitly allowed on public paths.`,
    `# Training crawlers are not listed here and get no explicit allow.`,
    `# keep in sync with llms.txt and ai.txt`,
    ``,
    `User-agent: OAI-SearchBot`,
    `Allow: /`,
    ``,
    `User-agent: ChatGPT-User`,
    `Allow: /`,
    ``,
    `User-agent: Claude-SearchBot`,
    `Allow: /`,
    ``,
    `User-agent: Claude-User`,
    `Allow: /`,
    ``,
    `User-agent: PerplexityBot`,
    `Allow: /`,
    ``,
    `User-agent: Perplexity-User`,
    `Allow: /`,
    ``,
    `User-agent: *`,
    `Allow: /`,
    `Disallow: /api/`,
    ``,
    `Sitemap: ${SITE.url}/sitemap.xml`,
    ``,
  ].join("\n");
}

function renderSitemapXml() {
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...PAGES.map(
      (p) =>
        `  <url>\n    <loc>${SITE.url}${p.path}</loc>\n    <lastmod>${p.updated}</lastmod>\n    <priority>1.0</priority>\n  </url>`
    ),
    `</urlset>`,
    ``,
  ].join("\n");
}

function renderCatalog() {
  return {
    site: SITE.name,
    url: SITE.url,
    generated: SITE.updated,
    routes: PAGES.map((p) => ({
      path: p.path,
      md: `${SITE.url}${p.mdPath}`,
      title: p.title,
      summary: p.summary,
      updated: p.updated,
    })),
  };
}

function renderMdRegistryJs() {
  return `// Generated by scripts/generate-ai-readable.mjs — do not edit by hand.\nexport const SITE = ${JSON.stringify(SITE, null, 2)};\nexport const PAGES = ${JSON.stringify(PAGES, null, 2)};\n`;
}

const outputs = new Map([
  ...PAGES.map((p) => [p.mdPath.slice(1), mdFor(p)]),
  ["llms.txt", renderLlmsTxt()],
  ["llms-full.txt", renderLlmsFull()],
  ["ai.txt", renderAiTxt()],
  ["robots.txt", renderRobotsTxt()],
  ["sitemap.xml", renderSitemapXml()],
  ["api/md/_catalog.json", JSON.stringify(renderCatalog(), null, 2) + "\n"],
  ["functions/md-registry.js", renderMdRegistryJs()],
]);

function checkFacts() {
  const norm = (t) =>
    t.replace(/&asymp;/g, "≈").replace(/&mdash;/g, "—").replace(/&amp;/g, "&");
  for (const p of PAGES) {
    const file = p.path === "/" ? "index.html" : `${p.path.slice(1)}.html`;
    const html = norm(readFileSync(join(root, file), "utf8"));
    const missing = (p.facts || []).filter((f) => !html.includes(f));
    if (missing.length) {
      throw new Error(
        `generate-ai-readable: fact check failed — ${file} missing: ${missing.join(", ")}`
      );
    }
  }
}

function main() {
  const check = process.argv.includes("--check");
  checkFacts();
  // Every public HTML page needs a renderer and a file on disk.
  for (const p of PAGES) {
    const f = p.path === "/" ? "index.html" : `${p.path.slice(1)}.html`;
    if (!MD_BODIES[p.path]) {
      throw new Error(`generate-ai-readable: no renderer for ${f}`);
    }
    try {
      readFileSync(join(root, f), "utf8");
    } catch {
      throw new Error(`generate-ai-readable: missing HTML file ${f}`);
    }
  }
  let stale = [];
  for (const [rel, content] of outputs) {
    const dest = join(root, rel);
    if (check) {
      let existing = "";
      try {
        existing = readFileSync(dest, "utf8");
      } catch {
        existing = "";
      }
      if (existing !== content) stale.push(rel);
    } else {
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, content);
      console.log(`wrote ${rel} (${content.length} chars)`);
    }
  }
  if (check) {
    if (stale.length) {
      console.error(`STALE: ${stale.join(", ")} — run node scripts/generate-ai-readable.mjs`);
      process.exit(1);
    }
    console.log(`OK: ${PAGES.length} pages, llms/sitemap/robots/ai.txt/catalog/registry in sync.`);
  }
}

main();
