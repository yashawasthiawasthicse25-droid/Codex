const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicationId: { type: String, required: true, unique: true },
  applicant: {
    businessName: String,
    businessType: String,
    industry: String,
    state: String,
    district: String,
    investment: Number,
    landArea: Number,
    employees: Number
  },
  approval: {
    approvalCode: String,
    approvalName: String,
    department: String
  },
  contact: {
    name: String,
    phone: String,
    email: String
  },
  documents: [
    {
      documentCode: String,
      documentName: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  currentStatus: {
    type: String,
    enum: ['SUBMITTED', 'UNDER_SCRUTINY', 'DOCUMENT_VERIFICATION', 'QUERY_RAISED', 'APPROVED', 'REJECTED'],
    default: 'SUBMITTED'
  },
  submittedAt: { type: Date, default: Date.now },
  lastUpdatedAt: { type: Date, default: Date.now },
  statusHistory: [{ type: mongoose.Schema.Types.Mixed }],
  queries: [{ type: mongoose.Schema.Types.Mixed }]
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
