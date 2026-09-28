const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const Application = require("./models/Application");

const app = express();
const port = Number(process.env.PORT || 6060);
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/fake_government";
const statuses = ["SUBMITTED", "UNDER_SCRUTINY", "DOCUMENT_VERIFICATION", "QUERY_RAISED", "QUERY_RESOLVED", "APPROVED", "REJECTED"];

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

function nextApplicationId() {
    return `APP-DEMO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
}

app.get("/api/health", (req, res) => res.json({ success: true, simulated: true }));

app.post("/api/applications", async (req, res, next) => {
    try {
        const body = req.body || {};
        if (!body.approvalName || !body.businessName) {
            return res.status(400).json({ success: false, message: "approvalName and businessName are required." });
        }
        const application = await Application.create({
            ...body,
            applicationId: body.applicationId || nextApplicationId(),
            currentStatus: "SUBMITTED",
            statusHistory: [{ newStatus: "SUBMITTED", remarks: "Application received by simulated government portal." }]
        });
        res.status(201).json({ success: true, applicationId: application.applicationId, status: application.currentStatus, submittedAt: application.submittedAt, message: "Application submitted to simulated government portal." });
    } catch (error) { next(error); }
});

app.get("/api/applications", async (req, res, next) => {
    try { res.json({ success: true, data: await Application.find().sort({ updatedAt: -1 }) }); } catch (error) { next(error); }
});

app.get("/api/applications/:applicationId", async (req, res, next) => {
    try {
        const application = await Application.findOne({ applicationId: req.params.applicationId });
        if (!application) return res.status(404).json({ success: false, message: "Application not found in simulated government portal." });
        res.json({ success: true, application });
    } catch (error) { next(error); }
});

app.delete("/api/applications/:applicationId", async (req, res, next) => {
    try {
        const application = await Application.findOneAndDelete({ applicationId: req.params.applicationId });
        if (!application) return res.status(404).json({ success: false, message: "Application not found in simulated government portal." });
        res.json({ success: true, message: "Application deleted from simulated government portal." });
    } catch (error) { next(error); }
});

app.patch("/api/applications/:applicationId/status", async (req, res, next) => {
    try {
        const { status, remarks } = req.body || {};
        if (!statuses.includes(status)) return res.status(400).json({ success: false, message: "Unsupported simulated status." });
        const application = await Application.findOne({ applicationId: req.params.applicationId });
        if (!application) return res.status(404).json({ success: false, message: "Application not found in simulated government portal." });
        if (application.currentStatus !== status) {
            application.statusHistory.push({ oldStatus: application.currentStatus, newStatus: status, remarks: remarks || "Manual demo status change." });
            application.currentStatus = status;
            await application.save();
        }
        res.json({ success: true, application });
    } catch (error) { next(error); }
});

app.get("/api/applications/:applicationId/status-history", async (req, res, next) => {
    try {
        const application = await Application.findOne({ applicationId: req.params.applicationId });
        if (!application) return res.status(404).json({ success: false, message: "Application not found in simulated government portal." });
        res.json({ success: true, data: application.statusHistory });
    } catch (error) { next(error); }
});

app.use((error, req, res, next) => {
    console.error("Fake portal error:", error);
    res.status(500).json({ success: false, message: error.message });
});

app.listen(port, () => console.log(`DEMO GOVERNMENT PORTAL - SIMULATED ENVIRONMENT: http://localhost:${port}`));

mongoose.connect(mongoUri)
    .then(() => console.log("Fake government portal MongoDB connected"))
    .catch(error => console.error("Fake portal MongoDB connection error:", error));
