const express = require('express');
const router = express.Router();
const {
  createQuery,
  resolveQuery,
  getStore,
  findApplicationById
} = require('../services/applicationService');

router.post('/', (req, res) => {
  try {
    const query = createQuery(req.body || {});
    const app = findApplicationById(query.applicationId);
    if (app) {
      const { updateApplicationStatus } = require('../services/applicationService');
      updateApplicationStatus(query.applicationId, 'QUERY_RAISED', query.description, 'DEMO_OFFICER');
    }

    res.status(201).json({ success: true, simulated: true, query });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ success: false, simulated: true, message: error.message });
  }
});

router.get('/:applicationId', (req, res) => {
  const queries = getStore().queries.filter((q) => q.applicationId === req.params.applicationId);
  res.json({ success: true, simulated: true, queries });
});

router.patch('/:queryId/resolve', (req, res) => {
  try {
    const query = resolveQuery(req.params.queryId, req.body?.remarks || 'Query resolved by government officer.');
    res.json({ success: true, simulated: true, query });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ success: false, simulated: true, message: error.message });
  }
});

module.exports = router;
