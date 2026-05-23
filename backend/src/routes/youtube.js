import { Router } from "express";
import { Readable } from "node:stream";
import { Innertube } from "youtubei.js";

const router = Router();

let ytPromise = null;
function getInnertube() {
    if (!ytPromise) ytPromise = Innertube.create({ retrieve_player: true });
    return ytPromise;
}

function extractVideoId(url) {
    const m = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
}

function sanitizeFilename(name) {
    const cleaned = (name || "")
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120);
    return cleaned || "video";
}

router.get("/download", async (req, res) => {
    const url = req.query.url;
    if (typeof url !== "string") {
        return res.status(400).json({ error: "missing url" });
    }
    const videoId = extractVideoId(url);
    if (!videoId) {
        return res.status(400).json({ error: "invalid youtube url" });
    }

    try {
        const yt = await getInnertube();
        const info = await yt.getInfo(videoId);
        const filename = sanitizeFilename(info.basic_info?.title) + ".mp4";

        res.setHeader("Content-Type", "video/mp4");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
        );

        const webStream = await yt.download(videoId, {
            type: "video+audio",
            quality: "best",
            format: "mp4"
        });

        const nodeStream = Readable.fromWeb(webStream);
        nodeStream.on("error", err => {
            console.error("youtube stream error:", err.message);
            if (!res.headersSent) res.status(502).json({ error: "stream failed" });
            else res.destroy();
        });
        nodeStream.pipe(res);
    } catch (err) {
        console.error("youtube download error:", err.message);
        if (!res.headersSent) res.status(502).json({ error: "could not fetch video info: " + err.message });
    }
});

export default router;
