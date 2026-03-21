import { Router } from "express";
import { getAllSoftware, addSoftware, deleteSoftware, getAllCategories } from "../softwareStore.js";

const router = Router();

router.get("/", async (_req, res) => {
    res.status(200).json(await getAllSoftware());
});

router.get("/categories", async (_req, res) => {
    res.status(200).json(await getAllCategories());
});

router.post("/", async (req, res) => {
    if (!req.isAuthenticated) return res.status(401).json({ error: "unauthorized" });
    try {
        const softwareItem = await addSoftware(req.body);
        res.status(201).json(softwareItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    if (!req.isAuthenticated) return res.status(401).json({ error: "unauthorized" });
    const softwareItem = await deleteSoftware(Number(req.params.id));
    if (softwareItem) {
        res.status(200).json(softwareItem);
    } else {
        res.status(404).json({ error: "software not found" });
    }
});

export default router;
