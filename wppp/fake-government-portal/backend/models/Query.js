const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  queryId: { type: String, required: true, unique: true },
  applicationId: { type: String, required: true },
  description: String,
  requiredAction: String,
  status: { type: String, default: 'OPEN' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model('Query', querySchema);
