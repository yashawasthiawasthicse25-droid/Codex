const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema({
    oldStatus: String,
    newStatus: { type: String, required: true },
    remarks: String,
    changedAt: { type: Date, default: Date.now }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
    applicationId: { type: String, unique: true, required: true },
    approvalCode: String,
    approvalName: { type: String, required: true },
    department: String,
    businessId: String,
    businessName: String,
    industry: String,
    applicantName: String,
    pan: String,
    gstin: String,
    address: String,
    phone: String,
    email: String,
    currentStatus: { type: String, default: "SUBMITTED" },
    submittedAt: { type: Date, default: Date.now },
    statusHistory: { type: [statusHistorySchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("FakeGovernmentApplication", applicationSchema);
