const express = require('express');
const router = express.Router();
const { getStore } = require('../services/applicationService');

router.get('/dashboard', (req, res) => {
  const apps = getStore().applications;
  const dashboard = {
    totalApplications: apps.length,
    underScrutiny: apps.filter((app) => app.currentStatus === 'UNDER_SCRUTINY').length,
    documentVerification: apps.filter((app) => app.currentStatus === 'DOCUMENT_VERIFICATION').length,
    queriesRaised: apps.filter((app) => app.currentStatus === 'QUERY_RAISED').length,
    approved: apps.filter((app) => app.currentStatus === 'APPROVED').length,
    recentApplications: apps.slice(-5).map((app) => ({
      applicationId: app.applicationId,
      businessName: app.applicant.businessName,
      approvalName: app.approval.approvalName,
      status: app.currentStatus
    }))
  };

  res.json({ success: true, simulated: true, dashboard });
});

module.exports = router;
