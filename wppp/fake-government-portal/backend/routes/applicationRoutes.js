const express = require('express');
const router = express.Router();
const {
  buildApplicationFromPayload,
  getAllApplications,
  findApplicationById,
  updateApplicationStatus,
  getStore
} = require('../services/applicationService');

router.post('/', (req, res) => {
  try {
    const application = buildApplicationFromPayload(req.body || {});
    getStore().applications.push(application);

    res.status(201).json({
      success: true,
      simulated: true,
      applicationId: application.applicationId,
      status: application.currentStatus,
      message: 'Demo application received successfully.'
    });
  } catch (error) {
    res.status(400).json({ success: false, simulated: true, message: error.message });
  }
});

router.get('/', (req, res) => {
  res.json({
    success: true,
    simulated: true,
    applications: getAllApplications().map((application) => ({
      applicationId: application.applicationId,
      applicant: application.applicant.businessName,
      status: application.currentStatus,
      lastUpdatedAt: application.lastUpdatedAt
    }))
  });
});

router.get('/:applicationId', (req, res) => {
  const application = findApplicationById(req.params.applicationId);
  if (!application) {
    return res.status(404).json({ success: false, simulated: true, message: 'Application not found.' });
  }

  res.json({
    success: true,
    simulated: true,
    application: {
      applicationId: application.applicationId,
      applicant: application.applicant.businessName,
      industry: application.applicant.industry,
      businessType: application.applicant.businessType,
      location: `${application.applicant.district}, ${application.applicant.state}`,
      investment: application.applicant.investment,
      approval: application.approval.approvalName,
      department: application.approval.department,
      status: application.currentStatus,
      lastUpdatedAt: application.lastUpdatedAt,
      documents: application.documents
    }
  });
});

router.patch('/:applicationId/status', (req, res) => {
  try {
    const { status, remarks = '', changedBy = 'DEMO_OFFICER' } = req.body || {};
    const result = updateApplicationStatus(req.params.applicationId, status, remarks, changedBy);

    res.json({
      success: true,
      simulated: true,
      applicationId: req.params.applicationId,
      previousStatus: result.previousStatus,
      newStatus: result.newStatus,
      remarks: result.remarks,
      application: result.application
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ success: false, simulated: true, message: error.message });
  }
});

router.get('/:applicationId/status-history', (req, res) => {
  const application = findApplicationById(req.params.applicationId);
  if (!application) {
    return res.status(404).json({ success: false, simulated: true, message: 'Application not found.' });
  }

  const history = (application.statusHistory || []).map((entry) => ({
    status: entry.newStatus,
    previousStatus: entry.previousStatus,
    remarks: entry.remarks,
    changedAt: entry.changedAt
  }));

  res.json({ success: true, simulated: true, history });
});

module.exports = router;
