const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    success: true,
    simulated: true,
    authenticated: false,
    message: 'Demo mode enabled. Authentication disabled for prototype.'
  });
});

module.exports = router;
