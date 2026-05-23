import { config } from "dotenv";
config();
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import authRouter, { verifyToken } from "./routes/auth.js";
import softwareRouter from "./routes/software.js";
import youtubeRouter from "./routes/youtube.js";
import { initDb, getAllCategories, addCategory, deleteCategory, updateCategoryOrder } from "./softwareStore.js";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
    const auth = req.headers.authorization;
    req.isAuthenticated = !!(auth && auth.startsWith("Bearer ") && verifyToken(auth.slice(7)));
    next();
});

app.use("/api/auth", authRouter);
app.use("/api/software", softwareRouter);
app.use("/api/youtube", youtubeRouter);
app.get("/api/categories", async (_req, res) => {
    res.json(await getAllCategories());
});

app.post("/api/categories", async (req, res) => {
    if (!req.isAuthenticated) return res.status(401).json({ error: "unauthorized" });
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "name is required" });
    const result = await addCategory(name.trim());
    if (!result) return res.status(409).json({ error: "category already exists" });
    res.status(201).json({ name: result });
});

app.delete("/api/categories/:name", async (req, res) => {
    if (!req.isAuthenticated) return res.status(401).json({ error: "unauthorized" });
    const deleted = await deleteCategory(decodeURIComponent(req.params.name));
    if (!deleted) return res.status(404).json({ error: "category not found" });
    res.status(200).json({ name: deleted });
});

app.put("/api/categories/order", async (req, res) => {
    if (!req.isAuthenticated) return res.status(401).json({ error: "unauthorized" });
    const { order } = req.body;
    if (!Array.isArray(order) || order.some(n => typeof n !== 'string')) {
        return res.status(400).json({ error: "order must be an array of strings" });
    }
    try {
        await updateCategoryOrder(order);
        res.status(200).json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "failed to update order" });
    }
});

// Only start listening when run directly, not when imported by tests
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
    await initDb();
    app.listen(PORT, () => {
        console.log(`Softhub backend running on http://localhost:${PORT}`);
    });
}

export default app;
