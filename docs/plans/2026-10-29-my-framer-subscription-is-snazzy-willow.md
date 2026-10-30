# oldnew.club: Framer -> Cloudflare Pages

## Context

Framer is cancelled and the paid period ends **2026-11-04**. The live site is one page: 4 jackets (3D GLB viewers + price + label), a mailto `inquire@oldnew.club` link, Instagram + seka.works links, and 3 breakpoints.

Decisions (Seka, 2026-10-29):
- **Host: Cloudflare Pages free.** This replaced Netlify the same day. Netlify's free plan has a hard 300-credit monthly cap that pauses the site, about 3,500-4,000 visits at 2.9 MB of models per visit. Pages has no bandwidth cap on static files.
- **Scope: 1:1 port first.** Hand-written HTML/CSS/JS, no framework, no build step.
- **Cutover target: Sun 2026-11-02.**

## Findings
- Namecheap is the registrar and runs BasicDNS. Apex A = Framer x2 **plus `162.255.119.127`**, a Namecheap URL redirect that serves HTTP only and times out on HTTPS. That's an existing bug: about 1 in 3 https://oldnew.club visits fail.
- MX eforward1-5 + SPF TXT are Namecheap email forwarding, and they **stop working off Namecheap DNS**.
- A bare domain on Pages requires the zone on Cloudflare, so the nameservers have to move.

## Steps

### 1. Capture Framer - DONE
`docs/references/framer-capture/` holds screenshots at 1440/900/390, computed styles, the viewer settings per jacket, icons and favicon/OG images.

### 2. Build `site/` - DONE (branch `cloudflare-migration`)
- index.html, styles.css (Framer breakpoints and fallback fonts), viewer.js (plain-JS port), fonts (OFL, self-hosted), glb/, images/, `_headers`, robots, sitemap.
- Text layout is within 1px of Framer at all 3 widths, and page heights are identical.
- `scripts/check-viewers.py` passes 12/12 and goes red with the models removed.

### 3. Cloudflare zone + email (Seka in dashboard, me guiding, by Fri 10/31)
1. Create a Cloudflare account (free), then Add a domain: `oldnew.club`, Free plan. Let it import the DNS records.
2. Review the imported records. Keep the Framer A x2 + www CNAME **DNS only (grey cloud)**. **Delete** the 162.255.119.127 A record and the old eforward MX + SPF TXT. Email Routing adds its own.
3. Namecheap: Domain List -> oldnew.club -> Nameservers -> Custom DNS -> the two Cloudflare nameservers.
4. When the zone shows Active: Email -> Email Routing -> enable. Add a rule `inquire@oldnew.club` -> Seka's inbox and verify that address. Optionally add a catch-all.
5. Test: send mail to inquire@ from another account and confirm it arrives. Confirm the site still loads from Framer.

### 4. Pages project (any time after the branch is pushed)
- Workers & Pages -> Create -> Pages -> Connect to Git -> `iamseka/oldnew.club`. Production branch `main`, framework None, no build command, output directory `site`.
- The `cloudflare-migration` branch gets a preview URL. Run `scripts/check-viewers.py <preview-url>` and the render check there. Seka signs off.

### 5. Cutover (Sun 11/2)
- Merge to `main` (production deploy). In the Pages project, add custom domains `www.oldnew.club` and `oldnew.club`. Cloudflare swaps the records from Framer to Pages.
- Rules -> Redirect Rules -> "Redirect from root to WWW" template (301, keep path and query).
- Rollback until 11/4: point the records back at Framer inside Cloudflare.

### 6. After 11/4
- Delete the root GLBs and the root `GLB Model Viewer` (ask Seka first).

## Verification
- Preview and production: `python3 -I scripts/check-viewers.py <url>` passes, plus a render-vs-reference check at 3 widths.
- `dig NS oldnew.club` shows Cloudflare. `curl -I http(s)://oldnew.club/x` gives 301 -> `https://www.oldnew.club/x`. `https://www.oldnew.club/` returns 200 from Cloudflare.
- Mail to inquire@ arrives.
