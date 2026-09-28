const assert = require('assert');
const readinessService = require('./services/documentReadinessService');
const { approval, templates } = require('./utils/readinessTemplates');

assert.ok(approval, 'approval configuration is missing');
assert.strictEqual(approval.code, 'DRUG_MFG_CONVENTIONAL_FORMULATION_DEMO', 'Expected the selected conventional formulation manufacturing route');
assert.ok(Array.isArray(approval.requiredDocumentCodes), 'requiredDocumentCodes must exist');
assert.ok(approval.requiredDocumentCodes.includes('APPLICATION_FORM'), 'Application form should be included in the selected route');
assert.ok(approval.requiredDocumentCodes.includes('LEGAL_ENTITY_PROOF'), 'Legal-entity proof should be included in the selected route');
assert.ok(approval.requiredDocumentCodes.includes('PREMISES_DOCUMENT'), 'Premises document should be included in the selected route');
assert.ok(templates.some(t => t.code === 'APPLICATION_FORM'), 'Application form template is missing');
assert.ok(templates.some(t => t.code === 'PREMISES_LAYOUT'), 'Premises layout template is missing');

const blockerChecks = [
  { id: 'APP-01', label: 'Application form uploaded', mandatory: true, weight: 30, passed: false, applicable: true, level: 'critical', criticalIfNo: true, needsManualReview: false },
  { id: 'APP-02', label: 'Company name matches profile', mandatory: true, weight: 20, passed: true, applicable: true, level: 'medium', criticalIfNo: false, needsManualReview: false },
  { id: 'APP-03', label: 'Document is readable', mandatory: true, weight: 10, passed: true, applicable: true, level: 'basic', criticalIfNo: false, needsManualReview: false }
];

const blockerScore = readinessService.calculateScore(blockerChecks);
assert.strictEqual(blockerScore, 0, 'Critical blocker must force readiness score to 0 even when other checks pass');
assert.strictEqual(readinessService.determineStatus(blockerScore, blockerChecks), 'BLOCKED', 'Critical blocker should mark result as blocked');

console.log('Selected approval scenario verified:', approval.name);
console.log('Critical blocker scoring rule verified.');
