const express = require("express");
const http = require("http");
const https = require("https");
const { notifyStatusChange, getNotificationLog } = require("../services/approvalNotificationService");
const ApplicationTracking = require("../models/ApplicationTracking");

const router = express.Router();
const portalUrl = process.env.FAKE_GOVERNMENT_PORTAL_URL || "http://127.0.0.1:6060";
const pollIntervalMs = Math.max(Number(process.env.APPROVAL_POLL_INTERVAL_MS || 30000), 5000);

function portalRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const target = new URL(url);
        const client = target.protocol === "https:" ? https : http;
        const request = client.request(target, {
            method: options.method || "GET",
            headers: options.headers || {}
        }, response => {
            let body = "";
            response.setEncoding("utf8");
            response.on("data", chunk => { body += chunk; });
            response.on("end", () => resolve({ ok: response.statusCode >= 200 && response.statusCode < 300, status: response.statusCode, json: JSON.parse(body) }));
        });
        request.on("error", reject);
        if (options.body) request.write(options.body);
        request.end();
    });
}

function toPortalPayload(body) {
    const business = body.business || {};
    const approval = body.approval || {};
    return {
        business: {
            businessName: business.businessName,
            businessType: business.businessType,
            industry: business.industry,
            state: business.state,
            district: business.district,
            investment: Number(business.investment || 0),
            landArea: Number(business.landArea || 0),
            employees: Number(business.employees || 0),
            contactName: business.contactName,
            applicantName: business.contactName,
            pan: business.pan,
            gstin: business.gstin,
            address: business.address,
            phone: business.phone,
            email: business.email
        },
        approval: {
            approvalCode: approval.approvalCode || "CUSTOM",
            approvalName: approval.approvalName,
            department: approval.department
        },
        documents: (body.documents || []).map((documentName, index) => ({
            documentCode: `VAULT_DOC_${index + 1}`,
            documentName
        }))
    };
}

async function getPortalStatus(applicationId) {
    const response = await portalRequest(`${portalUrl}/api/applications/${encodeURIComponent(applicationId)}`);
    if (!response.ok) throw new Error(`Fake government portal returned ${response.status}.`);
    return response.json;
}

async function pollApplication(tracked) {
    const result = await getPortalStatus(tracked.applicationId);
    const portalApplication = result.application;
    if (!portalApplication || portalApplication.currentStatus === tracked.currentStatus) {
        tracked.lastCheckedAt = new Date();
        tracked.lastPollError = null;
        await tracked.save();
        return tracked;
    }

    const previousStatus = tracked.currentStatus;
    tracked.previousStatus = previousStatus;
    tracked.currentStatus = portalApplication.currentStatus;
    tracked.lastCheckedAt = new Date();
    tracked.statusHistory = tracked.statusHistory || [];
    tracked.statusHistory.unshift({ previousStatus, newStatus: tracked.currentStatus, changedAt: tracked.lastCheckedAt });
    await tracked.save();
    await notifyStatusChange({ application: tracked, previousStatus, newStatus: tracked.currentStatus });
    return tracked;
}

router.post("/applications", async (req, res) => {
    try {
        if (req.body.permissionToUseVault !== true) return res.status(400).json({ success: false, error: "Permission to use Information Vault data is required." });
        const payload = toPortalPayload(req.body);
        const existingApplicationId = String(req.body.applicationId || "").trim();
        let existingApplication = null;
        if (existingApplicationId) {
            const existingResult = await getPortalStatus(existingApplicationId);
            existingApplication = existingResult.application;
            payload.approval.approvalName = payload.approval.approvalName || existingApplication?.approvalName;
            payload.approval.department = payload.approval.department || existingApplication?.department;
        }
        if (!payload.business.businessName || !payload.business.email || !payload.business.phone || !payload.approval.approvalName || !payload.approval.department) {
            return res.status(400).json({ success: false, error: "Business name, email, phone, approval name, and department are required." });
        }
        let result;
        if (existingApplicationId) {
            result = { applicationId: existingApplicationId, status: existingApplication.currentStatus, submittedAt: existingApplication.submittedAt };
        } else {
            const response = await portalRequest(`${portalUrl}/api/applications`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...payload.business, ...payload.approval, documents: payload.documents })
            });
            result = response.json;
            if (!response.ok || !result.success) return res.status(502).json({ success: false, error: result.message || "Fake government portal submission failed." });
        }

        const alreadyTracked = await ApplicationTracking.findOne({ applicationId: result.applicationId });
        if (alreadyTracked) {
            return res.status(200).json({ success: true, data: alreadyTracked, message: "Application is already being tracked." });
        }

        const tracked = new ApplicationTracking({
            ...payload.approval,
            applicationId: result.applicationId,
            currentStatus: result.status,
            previousStatus: null,
            business: payload.business,
            contact: { email: payload.business.email, phone: payload.business.phone },
            documents: payload.documents,
            submittedAt: result.submittedAt || new Date(),
            lastCheckedAt: new Date(),
            statusHistory: []
        });
        await tracked.save();
        res.status(201).json({ success: true, data: tracked });
    } catch (error) {
        res.status(502).json({ success: false, error: error.message });
    }
});

router.get("/applications", async (req, res) => {
    const applications = await ApplicationTracking.find().sort({ updatedAt: -1 });
    for (const tracked of applications) {
        try { await pollApplication(tracked); } catch (error) {
            tracked.lastPollError = "Government portal unavailable. Tracking will retry automatically.";
            await tracked.save();
        }
    }
    res.json({ success: true, data: applications, notifications: getNotificationLog() });
});

router.get("/notifications", (req, res) => res.json({ success: true, data: getNotificationLog() }));

router.patch("/applications/:applicationId/stop", async (req, res, next) => {
    try {
        const tracked = await ApplicationTracking.findOneAndUpdate(
            { applicationId: req.params.applicationId },
            { trackingEnabled: false },
            { new: true }
        );
        if (!tracked) return res.status(404).json({ success: false, error: "Tracked application not found." });
        res.json({ success: true, data: tracked, message: "Tracking stopped. The application record was preserved." });
    } catch (error) { next(error); }
});

router.delete("/applications/:applicationId", async (req, res, next) => {
    try {
        const tracked = await ApplicationTracking.findOneAndDelete({ applicationId: req.params.applicationId });
        if (!tracked) return res.status(404).json({ success: false, error: "Tracked application not found." });
        res.json({ success: true, message: "Tracking record deleted." });
    } catch (error) { next(error); }
});

setInterval(async () => {
    const trackedApplications = await ApplicationTracking.find({ trackingEnabled: { $ne: false } });
    for (const tracked of trackedApplications) {
        try { await pollApplication(tracked); } catch (error) {
            tracked.lastPollError = "Government portal unavailable. Tracking will retry automatically.";
            await tracked.save();
        }
    }
}, pollIntervalMs).unref();

module.exports = router;