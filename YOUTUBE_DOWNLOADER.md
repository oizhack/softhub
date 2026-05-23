# YouTube Downloader

**Localhost-only feature.** Paste a YouTube URL, get the MP4 as a browser
download. The UI is only rendered when the page is served from `localhost`
or `127.0.0.1` — it does not appear on the Vercel-hosted site (see the
"Not Vercel-safe" section below for why).

## How it works

**Frontend** — `frontend/src/components/YoutubeDownloader.js`
- Renders a single-row card at the top of the page (above the software grid),
  but **only when `window.location.hostname` is `localhost` or `127.0.0.1`**.
  Gated in `frontend/src/app.js`.
- URL input + `[ DOWNLOAD ]` button. Enter key also triggers download.
- Light client-side regex check that the URL looks like YouTube.
- On click: creates a hidden `<a download href="/api/youtube/download?url=...">`,
  clicks it, removes it. Browser's native download manager handles save dialog
  and progress.

**Backend** — `backend/src/routes/youtube.js`
- `GET /api/youtube/download?url=<encoded>`
- Validates URL, extracts the 11-char video ID.
- Uses `youtubei.js` (`Innertube.create()`, `getInfo`, `download`) which talks
  to YouTube's InnerTube API rather than scraping the web player.
- Pipes the resulting Web ReadableStream (converted via `Readable.fromWeb`)
  into the Express response, after setting `Content-Type: video/mp4` and a
  UTF-8-safe `Content-Disposition`.
- Stream errors are logged and either return 502 (if headers not sent) or
  destroy the response.

The route is left mounted in production but is harmless because the UI that
calls it is hidden. Any direct curl from a datacenter IP just gets a 502.

No authentication — the route is public, matching the rest of the read-only
software listing.

## Setup

```bash
npm install                       # installs @distube/ytdl-core in backend workspace
npm run dev:backend               # http://localhost:3002
npm run dev:frontend              # http://localhost:5174 (proxies /api to backend)
```

## Remarks / things to know

### 1. YouTube Terms of Service

Downloading YouTube videos generally violates YouTube's Terms of Service. This
feature is fine for **local, personal use**. Do not deploy it publicly —
besides the TOS issue, you'd be paying the bandwidth bill and potentially
hosting copyrighted content.

### 2. Library choice: `youtubei.js`

We use **`youtubei.js`** (LuanRT/YouTube.js). It talks to YouTube's
InnerTube API (the same API the mobile/TV apps use) instead of scraping
the web player and deciphering signatures. That makes it materially more
resilient to YouTube's frequent player updates.

History note: this project originally used `@distube/ytdl-core`. It broke
within hours of going live with a signature decipher error — exactly the
fragility risk that's well-known about the ytdl-core family.

### 3. Robust fallback: `yt-dlp`

If `@distube/ytdl-core` is broken and there's no patch yet, the most reliable
option is to shell out to **`yt-dlp`** (a Python binary that handles YouTube's
quirks more robustly because it's used by millions of people and patched
within hours of any breakage).

Sketch of the swap:

```js
import { spawn } from "node:child_process";
// in the route:
res.setHeader("Content-Type", "video/mp4");
res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
const yt = spawn("yt-dlp", ["-f", "best[ext=mp4]", "-o", "-", url]);
yt.stdout.pipe(res);
yt.stderr.on("data", d => console.error("yt-dlp:", d.toString()));
```

Requires `yt-dlp` installed on the host (`pip install yt-dlp` or via package
manager). Adds a system dependency but removes the library-fragility problem.

### 4. Error UX is minimal by design

Because the download is triggered by `<a download>` rather than `fetch`, the
frontend cannot easily detect server-side errors. If the backend returns a 400
or 502, the browser will save (or show) a tiny JSON error file instead of a
video. Acceptable for v1.

For nicer in-app errors, switch the trigger to:
```js
const res = await fetch("/api/youtube/download?url=" + encodeURIComponent(url));
if (!res.ok) { /* show error in status line */ return; }
const blob = await res.blob();
const blobUrl = URL.createObjectURL(blob);
// then anchor-click blobUrl with the right filename
```
Trade-off: the entire video is held in browser memory before saving. Fine for
typical videos, ugly for multi-GB downloads, and the browser shows no progress
bar during the fetch.

### 5. Not Vercel-safe — observed in production

This was tested live on Vercel. Two compounding problems:

1. **YouTube blocks datacenter IPs.** Vercel runs on AWS, and YouTube refuses
   to return video info to AWS / GCP / Azure ranges. With `ytdl-core` this
   surfaced as a signature decipher error; with `youtubei.js` it surfaces as
   a `VideoUnavailableError`. The video is not actually unavailable — it's an
   IP-block disguised as one. This is the *primary* reason this feature
   doesn't work in production, regardless of library choice.
2. **Vercel Hobby timeout (10s) + payload cap (4.5MB).** Even if YouTube
   allowed the request, anything longer than a short clip would be cut off.

This is why the UI is gated to `localhost` in `app.js`. From your home IP
the request looks like a normal browser fetch and YouTube serves it; from
Vercel it does not.

If you ever want to host it for real, options are: (a) route requests
through a residential proxy, (b) feed YouTube cookies via env var (fragile,
they expire), or (c) move the route to a small VM with a residential-ish
IP and keep the rest on Vercel.

### 6. Filename safety

We sanitize titles to strip filesystem-unsafe and control characters, and we
emit both `filename=` (ASCII fallback) and `filename*=UTF-8''...` (RFC 5987,
for non-ASCII titles like Hebrew/Arabic/CJK). Most modern browsers honor the
UTF-8 variant.
