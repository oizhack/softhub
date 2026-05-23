# YouTube Downloader

Public-facing feature that lets any visitor paste a YouTube URL and download the
video as MP4 (best available combined audio+video stream).

## How it works

**Frontend** — `frontend/src/components/YoutubeDownloader.js`
- Renders a single-row card at the top of the page (above the software grid).
- URL input + `[ DOWNLOAD ]` button. Enter key also triggers download.
- Light client-side regex check that the URL looks like YouTube.
- On click: creates a hidden `<a download href="/api/youtube/download?url=...">`,
  clicks it, removes it. Browser's native download manager handles save dialog
  and progress.

**Backend** — `backend/src/routes/youtube.js`
- `GET /api/youtube/download?url=<encoded>`
- Validates URL via `ytdl.validateURL`.
- `ytdl.getInfo` → grabs `videoDetails.title`, sanitizes for filename
  (strips `<>:"/\|?*` and control chars, trims to 120 chars).
- Sets `Content-Type: video/mp4` and `Content-Disposition: attachment;
  filename="..."; filename*=UTF-8''...` for Unicode-safe filenames.
- Pipes `ytdl.downloadFromInfo(info, { quality: "highest",
  filter: "audioandvideo" })` straight into the response.
- Stream errors are logged and either return 502 (if headers not sent) or
  destroy the response.

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

### 2. `ytdl-core` is fragile

YouTube periodically changes its player code (signature ciphers, manifest
formats). Every time they do, every ytdl-core-family library breaks until the
maintainers ship a patch.

- We use **`@distube/ytdl-core`**, a community fork that historically ships
  fixes faster than the original `ytdl-core` (which is no longer actively
  maintained).
- If downloads suddenly stop working with a signature/decipher error: first
  try `npm update @distube/ytdl-core --workspace=backend`.

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

### 5. Not Vercel-safe

The current implementation streams arbitrarily large responses through Express.
That's fine locally, but **Vercel's serverless functions have a 10-second
timeout on Hobby plans** (and payload/duration limits even on Pro). Anything
beyond a short clip will be cut off if you deploy this route to Vercel.

If you ever want to host it: don't. Or move that single route to a long-running
worker (Fly, Railway, a small VM) and keep the rest on Vercel.

### 6. Filename safety

We sanitize titles to strip filesystem-unsafe and control characters, and we
emit both `filename=` (ASCII fallback) and `filename*=UTF-8''...` (RFC 5987,
for non-ASCII titles like Hebrew/Arabic/CJK). Most modern browsers honor the
UTF-8 variant.
