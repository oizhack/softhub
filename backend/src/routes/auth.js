import { Router } from "express";
import { createHmac } from "crypto";

const router = Router();

function makeToken(password) {
    const secret = process.env.JWT_SECRET || "sw_hub_secret";
    return createHmac("sha256", secret).update(password).digest("hex");
}

export function verifyToken(token) {
    const adminPassword = (process.env.ADMIN_PASSWORD || "admin123").trim();
    return token === makeToken(adminPassword);
}

router.post("/login", (req, res) => {
    const adminPassword = (process.env.ADMIN_PASSWORD || "admin123").trim();
    const { password } = req.body;
    if (password === adminPassword) {
        res.status(200).json({ token: makeToken(adminPassword) });
    } else {
        res.status(401).json({ error: "invalid password" });
    }
});

export default router;
