// Tress Column — the ONE markdown handler (Cloudflare Pages Functions).
// - GET /index.md (or any registered .md) -> markdown, never HTML 404
// - GET / with Accept: text/markdown (q higher than text/html) -> markdown
// - GET /api/md/<slug> -> markdown; GET /api/md/_catalog -> JSON catalog
// - */* or missing Accept ALWAYS gets HTML. /api/waitlist and assets pass through.
const PAGES = [
  { path: "/", mdPath: "/index.md", canonical: "https://tc.dvaughnhouse.com/" },
  { path: "/how-it-works", mdPath: "/how-it-works.md", canonical: "https://tc.dvaughnhouse.com/how-it-works" },
  { path: "/certificate", mdPath: "/certificate.md", canonical: "https://tc.dvaughnhouse.com/certificate" },
  { path: "/fees", mdPath: "/fees.md", canonical: "https://tc.dvaughnhouse.com/fees" },
  { path: "/passes", mdPath: "/passes.md", canonical: "https://tc.dvaughnhouse.com/passes" },
  { path: "/terminal", mdPath: "/terminal.md", canonical: "https://tc.dvaughnhouse.com/terminal" },
  { path: "/console", mdPath: "/console.md", canonical: "https://tc.dvaughnhouse.com/console" },
  { path: "/security", mdPath: "/security.md", canonical: "https://tc.dvaughnhouse.com/security" },
];
const MD_BY_PATH = new Map(PAGES.map((p) => [p.path, p]));
const MD_BY_MD = new Map(PAGES.map((p) => [p.mdPath, p]));
const CANONICAL = "https://tc.dvaughnhouse.com/";
const LAST_MODIFIED = "Sun, 08 Nov 2026 00:00:00 GMT";

function parseAccept(header) {
  // Returns q for text/markdown and text/html (default 1 when listed bare).
  const out = { markdown: 0, html: 0 };
  if (!header) return out;
  for (const part of header.split(",")) {
    const [type, ...params] = part.trim().split(";");
    let q = 1;
    for (const p of params) {
      const m = p.trim().match(/^q=([0-9.]+)$/);
      if (m) q = parseFloat(m[1]);
    }
    const t = type.trim().toLowerCase();
    if (t === "text/markdown") out.markdown = q;
    else if (t === "text/html") out.html = q;
    else if (t === "*/*" || t === "text/*") {
      out.markdown = Math.max(out.markdown, 0); // */* must NOT trigger markdown
      out.html = Math.max(out.html, q);
    }
  }
  return out;
}

function prefersMarkdown(request) {
  const accept = request.headers.get("Accept");
  if (!accept) return false; // missing Accept ALWAYS gets HTML
  const { markdown, html } = parseAccept(accept);
  return markdown > 0 && markdown > html;
}

function markdownHeaders(body, canonical) {
  return {
    "Content-Type": "text/markdown; charset=utf-8",
    "X-Markdown-Tokens": String(Math.ceil(body.length / 4)),
    "X-Robots-Tag": "noindex, follow",
    "Content-Location": canonical,
    Link: `<${canonical}>; rel="canonical"`,
    "Vary": "Accept",
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    "Last-Modified": LAST_MODIFIED,
    "Access-Control-Allow-Origin": "*",
  };
}

function md404(canonical) {
  const body = `# Not found\n\n> The requested page does not exist.\n\nCanonical: ${canonical}\n`;
  return new Response(body, { status: 404, headers: markdownHeaders(body, canonical) });
}

async function serveMarkdown(context, mdPath, canonical) {
  const res = await context.env.ASSETS.fetch(
    new Request(new URL(mdPath, context.request.url))
  );
  if (!res.ok) return md404(canonical);
  const body = await res.text();
  return new Response(context.request.method === "HEAD" ? null : body, {
    status: 200,
    headers: markdownHeaders(body, canonical),
  });
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS preflight for the markdown endpoints.
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Accept",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Only GET/HEAD participate in markdown negotiation; everything else
  // (notably POST /api/waitlist) passes straight through.
  if (request.method !== "GET" && request.method !== "HEAD") {
    return context.next();
  }

  // Direct backend URL: /api/md/<slug> and the catalog.
  if (path === "/api/md/_catalog" || path === "/api/md/_catalog.json") {
    const res = await context.env.ASSETS.fetch(
      new Request(new URL("/api/md/_catalog.json", url))
    );
    return new Response(request.method === "HEAD" ? null : await res.text(), {
      status: res.status,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" },
    });
  }
  if (path.startsWith("/api/md/")) {
    const slug = path.slice("/api/md/".length);
    const page = MD_BY_MD.get(`/${slug}.md`) || MD_BY_MD.get(`/${slug}`);
    if (!page) return md404(CANONICAL);
    return serveMarkdown(context, page.mdPath, CANONICAL + page.path.slice(1));
  }
  if (path.startsWith("/api/")) return context.next(); // waitlist etc.

  // .md suffix.
  if (path.endsWith(".md")) {
    const page = MD_BY_MD.get(path);
    if (!page) return md404(CANONICAL);
    return serveMarkdown(context, page.mdPath, CANONICAL + page.path.slice(1));
  }

  // Content negotiation: any registered page serves its markdown when the
  // client prefers text/markdown over text/html.
  const page = MD_BY_PATH.get(path) || (path === "/index.html" ? MD_BY_PATH.get("/") : undefined);
  if (page && prefersMarkdown(request)) {
    return serveMarkdown(context, page.mdPath, page.canonical);
  }

  // HTML as normal, advertising the machine-readable files.
  const res = await context.next();
  if (res.headers.get("Content-Type")?.includes("text/html")) {
    const headers = new Headers(res.headers);
    headers.set(
      "Link",
      `<https://tc.dvaughnhouse.com/llms.txt>; rel="describedby", <https://tc.dvaughnhouse.com/llms-full.txt>; rel="describedby", <https://tc.dvaughnhouse.com/ai.txt>; rel="describedby"`
    );
    return new Response(request.method === "HEAD" ? null : await res.text(), {
      status: res.status,
      headers,
    });
  }
  return res;
}
