const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../backend/server');

test('POST /api/applications creates a simulated application', async () => {
  const app = createApp();
  const response = await fetch('http://127.0.0.1:' + (process.env.PORT || 6000), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      business: {
        businessName: 'ABC Pharmaceuticals Pvt. Ltd.',
        industry: 'Pharmaceutical',
        businessType: 'Manufacturing',
        state: 'Maharashtra',
        district: 'Nashik',
        investment: 50000000,
        landArea: 2,
        employees: 45
      },
      approval: {
        approvalCode: 'DRUG_MANUFACTURING',
        approvalName: 'Drug Manufacturing Application',
        department: 'Maharashtra FDA'
      },
      documents: [
        { documentCode: 'INCORPORATION_CERTIFICATE', documentName: 'Certificate of Incorporation' },
        { documentCode: 'LAND_DOCUMENT', documentName: 'Land Ownership / Lease' }
      ]
    })
  });

  assert.equal(response.status, 201);
  const data = await response.json();
  assert.equal(data.success, true);
  assert.match(data.applicationId, /^MAITRI-DEMO-\d{4}-\d+$/);
  assert.equal(data.status, 'SUBMITTED');
});
