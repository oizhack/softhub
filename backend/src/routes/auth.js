import { Router } from "express";
import { randomUUID } from "crypto";

const router = Router();
export const activeTokens = new Set();

router.post("/login", (req, res) => {
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const { password } = req.body;
    if (password === adminPassword) {
        const token = randomUUID();
        activeTokens.add(token);
        res.status(200).json({ token });
    } else {
        res.status(401).json({ error: "invalid password" });
    }
});

export default router;
