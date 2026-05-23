import { Router } from "express";
import ytdl from "@distube/ytdl-core";

const router = Router();

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
    if (typeof url !== "string" || !ytdl.validateURL(url)) {
        return res.status(400).json({ error: "invalid youtube url" });
    }

    try {
        const info = await ytdl.getInfo(url);
        const filename = sanitizeFilename(info.videoDetails.title) + ".mp4";

        res.setHeader("Content-Type", "video/mp4");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
        );

        const stream = ytdl.downloadFromInfo(info, {
            quality: "highest",
            filter: "audioandvideo"
        });

        stream.on("error", err => {
            console.error("youtube stream error:", err.message);
            if (!res.headersSent) res.status(502).json({ error: "stream failed" });
            else res.destroy();
        });

        stream.pipe(res);
    } catch (err) {
        console.error("youtube download error:", err.message);
        if (!res.headersSent) res.status(502).json({ error: "could not fetch video info" });
    }
});

export default router;
