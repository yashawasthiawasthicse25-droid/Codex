const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema({
    verifiedBy: { type: String, required: true },
    approved: { type: Boolean, required: true },
    reason: { type: String, required: true },
    verifiedAt: { type: Date, default: Date.now }
}, { _id: false });

const informationRecordSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    source: { type: String, required: true, trim: true },
    status: { type: String, enum: ["DRAFT", "VERIFIED", "REJECTED"], default: "DRAFT" },
    verifiedBy: String,
    verifiedAt: Date,
    verificationHistory: { type: [verificationSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("InformationRecord", informationRecordSchema);
