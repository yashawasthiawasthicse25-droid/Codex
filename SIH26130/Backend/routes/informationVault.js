const express = require("express");
const InformationRecord = require("../models/InformationRecord");

const router = express.Router();
let latestVaultSnapshot = { records: {}, updatedAt: null };

router.get("/snapshot", (req, res) => {
    res.json({ success: true, data: latestVaultSnapshot });
});

router.put("/snapshot", (req, res) => {
    if (!req.body || typeof req.body.records !== "object") {
        return res.status(400).json({ success: false, error: "Vault records are required." });
    }
    latestVaultSnapshot = {
        records: req.body.records,
        updatedAt: new Date().toISOString()
    };
    res.json({ success: true, data: latestVaultSnapshot });
});

router.get("/records", async (req, res, next) => {
    try {
        const filter = req.query.status ? { status: String(req.query.status).toUpperCase() } : {};
        const records = await InformationRecord.find(filter).sort({ updatedAt: -1 });
        res.json({ success: true, data: records });
    } catch (error) {
        next(error);
    }
});

router.post("/records", async (req, res, next) => {
    try {
        const { key, category, value, source } = req.body;
        if (!key || !category || value === undefined || value === null || !source) {
            return res.status(400).json({
                success: false,
                error: "key, category, value, and source are required."
            });
        }
        const record = await InformationRecord.create({ key, category, value, source });
        res.status(201).json({ success: true, data: record });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, error: "A canonical record with this key already exists." });
        }
        next(error);
    }
});

router.post("/records/:recordId/verify", async (req, res, next) => {
    try {
        const { verifiedBy, approved, reason } = req.body;
        if (!verifiedBy || typeof approved !== "boolean" || !reason) {
            return res.status(400).json({
                success: false,
                error: "verifiedBy, approved, and reason are required."
            });
        }
        const record = await InformationRecord.findById(req.params.recordId);
        if (!record) return res.status(404).json({ success: false, error: "Information record not found." });

        record.status = approved ? "VERIFIED" : "REJECTED";
        record.verifiedBy = approved ? verifiedBy : undefined;
        record.verifiedAt = approved ? new Date() : undefined;
        record.verificationHistory.push({ verifiedBy, approved, reason });
        await record.save();
        res.json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
});

router.post("/workflow/order", (req, res) => {
    const steps = Array.isArray(req.body.steps) ? req.body.steps : [];
    const byId = new Map(steps.map(step => [String(step.id), { ...step }]));
    const incoming = new Map(steps.map(step => [String(step.id), new Set((step.dependsOn || []).map(String))]));
    const outgoing = new Map(steps.map(step => [String(step.id), new Set()]));

    for (const step of steps) {
        for (const dependency of step.dependsOn || []) {
            if (!byId.has(String(dependency))) {
                return res.status(400).json({ success: false, error: `Dependency step ${dependency} does not exist.` });
            }
            outgoing.get(String(dependency)).add(String(step.id));
        }
    }

    const ready = [...incoming.entries()].filter(([, dependencies]) => dependencies.size === 0).map(([id]) => id).sort();
    const ordered = [];
    while (ready.length) {
        const current = ready.shift();
        ordered.push(byId.get(current));
        for (const child of [...outgoing.get(current)].sort()) {
            incoming.get(child).delete(current);
            if (incoming.get(child).size === 0) ready.push(child);
        }
        ready.sort();
    }

    if (ordered.length !== steps.length) {
        return res.status(409).json({ success: false, error: "Workflow dependencies contain a cycle." });
    }
    res.json({ success: true, data: { order: ordered } });
});

module.exports = router;
