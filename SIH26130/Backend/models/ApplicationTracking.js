const mongoose = require("mongoose");

const trackingSchema = new mongoose.Schema({
    applicationId: { type: String, unique: true, required: true },
    approvalCode: String,
    approvalName: { type: String, required: true },
    department: String,
    currentStatus: { type: String, required: true },
    previousStatus: String,
    business: { type: mongoose.Schema.Types.Mixed, default: {} },
    contact: { email: String, phone: String },
    documents: { type: [mongoose.Schema.Types.Mixed], default: [] },
    submittedAt: Date,
    lastCheckedAt: Date,
    lastPollError: String,
    trackingEnabled: { type: Boolean, default: true },
    statusHistory: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("ApplicationTracking", trackingSchema);
