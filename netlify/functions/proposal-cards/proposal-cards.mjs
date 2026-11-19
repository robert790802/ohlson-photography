// Proposal cards: Paola fills in a form on her phone, this saves the couple's
// card and photos, and serves a private "her" and "his" card page.
//
//   POST /api/proposal-cards   create a card (needs Paola's passcode)
//   GET  /c/:id/her            her card
//   GET  /c/:id/him            his card
//   GET  /c/:id/photo          top photo (also the text-message preview image)
//   GET  /c/:id/photo2         second photo, if she added one
//
// The passcode lives in the site's environment variable CARD_PASSCODE.
import { getStore } from "@netlify/blobs";
import { renderCard, notFoundPage } from "./card-page.mjs";

export const config = { path: ["/api/proposal-cards", "/c/:id/:part"] };

const MAX_PHOTO = 4 * 1024 * 1024; // bytes, after the phone shrinks it

const cards = () => getStore({ name: "proposal-cards", consistency: "strong" });

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "x-robots-tag": "noindex" },
  });

const page = (html, status = 200) =>
  new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex, nofollow",
      "cache-control": "public, max-age=300",
    },
  });

function clean(v, max) {
  return String(v ?? "").replace(/\s+$/g, "").slice(0, max);
}

function decodePhoto(dataUrl) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || "");
  if (!m) return null;
  const bytes = Buffer.from(m[2], "base64");
  if (!bytes.length || bytes.length > MAX_PHOTO) return null;
  return { type: m[1], bytes };
}

function newId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

async function create(req, context) {
  // Deploy previews already sit behind the Netlify team login, so the passcode
  // is only enforced on the real site.
  const isPreview = context?.deploy?.context === "deploy-preview";
  const passcode = (globalThis.Netlify?.env?.get("CARD_PASSCODE") ?? process.env.CARD_PASSCODE ?? "").trim();
  if (!passcode && !isPreview) return json({ error: "The card maker is not set up yet (no passcode)." }, 503);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Something went wrong reading the form." }, 400); }

  if (!isPreview && String(body.passcode ?? "").trim() !== passcode) return json({ error: "That passcode is not right." }, 401);

  const her = clean(body.her, 40).trim();
  const him = clean(body.him, 40).trim();
  if (!her || !him) return json({ error: "Please add both names." }, 400);

  const gallery = clean(body.gallery, 500).trim();
  if (gallery && !/^https:\/\/[^\s"'<>]+$/i.test(gallery)) {
    return json({ error: "The gallery link should start with https://" }, 400);
  }

  const photo = decodePhoto(body.photo);
  if (!photo) return json({ error: "Please choose a photo from tonight." }, 400);
  const photo2 = body.photo2 ? decodePhoto(body.photo2) : null;

  const id = newId();
  const store = cards();
  await store.set(`photo-${id}`, photo.bytes, { metadata: { type: photo.type } });
  if (photo2) await store.set(`photo2-${id}`, photo2.bytes, { metadata: { type: photo2.type } });
  await store.setJSON(`card-${id}`, {
    her, him, gallery,
    noteHer: clean(body.noteHer, 600),
    noteHim: clean(body.noteHim, 600),
    photo2: Boolean(photo2),
    created: new Date().toISOString(),
  });
  return json({ id, her: `/c/${id}/her`, him: `/c/${id}/him` }, 201);
}

async function serve(id, part, origin) {
  if (!/^[a-f0-9]{16}$/.test(id)) return page(notFoundPage(), 404);
  const store = cards();

  if (part === "photo" || part === "photo2") {
    const got = await store.getWithMetadata(`${part}-${id}`, { type: "arrayBuffer" });
    if (!got) return new Response("Not found", { status: 404 });
    return new Response(got.data, {
      headers: {
        "content-type": got.metadata?.type || "image/jpeg",
        "cache-control": "public, max-age=31536000, immutable",
        "x-robots-tag": "noindex",
      },
    });
  }

  if (part !== "her" && part !== "him") return page(notFoundPage(), 404);
  const card = await store.get(`card-${id}`, { type: "json" });
  if (!card) return page(notFoundPage(), 404);
  return page(renderCard(card, part, id, origin));
}

export default async (req, context) => {
  const url = new URL(req.url);
  try {
    if (url.pathname === "/api/proposal-cards") {
      if (req.method !== "POST") return json({ error: "Use the card maker form." }, 405);
      return await create(req, context);
    }
    const { id, part } = context.params || {};
    if (req.method !== "GET" && req.method !== "HEAD") return new Response("Not allowed", { status: 405 });
    return await serve(String(id || ""), String(part || ""), url.origin);
  } catch (err) {
    console.log("proposal-cards error:", err && err.stack ? err.stack : err);
    return url.pathname.startsWith("/api/")
      ? json({ error: "Something went wrong saving the card. Please try again." }, 500)
      : page(notFoundPage(), 500);
  }
};
