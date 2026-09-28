const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  applicationId: { type: String, required: true },
  previousStatus: String,
  newStatus: String,
  changedBy: String,
  remarks: String,
  changedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('StatusHistory', statusHistorySchema);
