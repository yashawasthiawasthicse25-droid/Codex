const express = require('express');

const router = express.Router();
const SIH_API_BASE = process.env.SIH_API_BASE || 'http://localhost:5000';

router.get('/prefill', async (req, res) => {
  try {
    const response = await fetch(`${SIH_API_BASE}/api/integrations/vault`);
    const payload = await response.json();
    res.status(response.status).json({ ...payload, simulated: true });
  } catch (error) {
    res.status(502).json({
      success: false,
      simulated: true,
      message: `Information Vault is unavailable at ${SIH_API_BASE}. Start the SIH26130 backend first.`
    });
  }
});

module.exports = router;