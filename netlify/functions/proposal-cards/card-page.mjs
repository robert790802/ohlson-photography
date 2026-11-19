// Renders one proposal card (her version or his version) as a full HTML page.
import { CARD_CSS } from "./card-css.mjs";


export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

export function headline(card, who) {
  return who === "him"
    ? { text: `${card.him}, you did it. She said yes.`,
        html: `${esc(card.him)},<br>you did it.<br><em>She said yes.</em>` }
    : { text: `${card.her}, your amazing journey just started.`,
        html: `${esc(card.her)},<br>your amazing journey<br><em>just started.</em>` };
}

export function renderCard(card, who, id, origin = "https://ohlsonphotography.com") {
  const h = headline(card, who);
  const name = who === "him" ? card.him : card.her;
  const note = who === "him" ? card.noteHim : card.noteHer;
  const photo = `/c/${id}/photo`;
  const url = `${origin}/c/${id}/${who}`; // canonical-ish address for previews
  const yes = who === "her" ? `<div class="yes">You said yes <span>&#9825;</span></div>` : "";
  const noteBlock = note && note.trim()
    ? `<div class="ournote"><div class="eyebrow">A note just for you</div><p>${esc(note)}</p></div>`
    : "";
  const gallery = card.gallery
    ? `<a class="btn solid gal" href="${esc(card.gallery)}" target="_blank" rel="noopener">Open your sneak peeks</a>`
    : "";
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(h.text)} | Ohlson Photography</title>
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="A note from Paola Ohlson, just for you.">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Ohlson Photography">
<meta property="og:title" content="A little surprise for ${esc(name)}">
<meta property="og:description" content="From Paola, with love.">
<meta property="og:image" content="${origin}/og-proposal-surprise.jpg">
<meta property="og:url" content="${url}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" sizes="180x180" href="/pocket-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>${CARD_CSS}</style>
</head><body class="locked">
<div class="reveal" id="reveal">
  <div class="env">
    <img class="logo" src="/images/img-1bb6cec512.webp" alt="Ohlson Photography">
    <div class="seal">&#9825;</div>
    <div class="to">${esc(name)},</div>
    <div class="sub">a little surprise, just for you</div>
    <button class="btn solid" id="open" type="button">Open</button>
  </div>
</div>
<div class="card">
  <img class="logo" src="/images/img-1bb6cec512.webp" alt="Ohlson Photography">
  <img class="band" src="${photo}" alt="Your proposal">
  <div class="pad">
    <img class="avatar" src="/images/img-4f9b81d3f8.webp" alt="Paola Ohlson, photographer in Palm Coast, Florida">
    <h1>${h.html}</h1>
    ${yes}
    <p class="note"><b>Thank you for letting me be there for your yes. I have been hiding behind dunes and doorways since 2008, and that second never gets old.</b><b>Tonight is just for the two of you. Hold hands, call the people you love, and soak it in.</b><span class="sign">Paola</span></p>
    ${card.photo2 ? `<div class="detail"><img src="/c/${id}/photo2" alt="Your proposal"></div>` : ""}
    ${noteBlock}
    ${gallery}
    <p class="pull">The beginning has a way of becoming everything.</p>
    <div class="quote"><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>&ldquo;Everything was so relaxed and natural, exactly how I would have wanted.&rdquo;</p><cite>Leonardo N. &middot; Proposal and wedding</cite></div>
    <div class="pair"><figure><img src="/images/img-679032d3fe.webp" alt="Leo and Veronica's proposal at the fountain"><figcaption>The proposal</figcaption></figure><figure><img src="/images/img-14f702d952.webp" alt="Leo and Veronica on their wedding day"><figcaption>The wedding</figcaption></figure></div>
    <p class="momentnote">I was there when Leo asked, at the fountain in St. Augustine. I was there again for their engagement session, and for the day it was all leading to.</p>
    <div class="deeper"><span class="lead">When you start dreaming</span><a href="/weddings.html">See a whole wedding &rarr;</a></div>
    <a class="btn ghost save" href="/paola-ohlson.vcf" download>Save my contact</a>
    <div class="reach"><a href="tel:+13863022186">Call</a><a href="sms:+13863022186">Text</a><a href="mailto:paola@ohlsonphotography.com">Email</a></div>
    <img class="logo" style="width:120px;margin:26px auto 4px" src="/images/img-1bb6cec512.webp" alt="Ohlson Photography">
    <div class="loc">Palm Coast &middot; St. Augustine &middot; Florida's Historic Coast<br>
      <a href="/">ohlsonphotography.com</a> &middot; <a href="https://www.instagram.com/ohlsonphoto" target="_blank" rel="noopener">Instagram</a></div>
  </div>
</div>
<script>document.getElementById('open').onclick=function(){document.getElementById('reveal').classList.add('gone');document.body.classList.remove('locked');window.scrollTo(0,0);};</script>
</body></html>`;
}

export function notFoundPage() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex"><title>Ohlson Photography</title><style>${CARD_CSS}</style></head><body><div class="card"><img class="logo" src="/images/img-1bb6cec512.webp" alt="Ohlson Photography"><div class="pad"><h1>This card could not be found.</h1><p class="note"><b>Please text Paola and she will send it again.</b></p><div class="reach" style="margin-top:20px"><a href="sms:+13863022186">Text Paola</a></div></div></div></body></html>`;
}
