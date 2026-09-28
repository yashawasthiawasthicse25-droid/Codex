const readinessService = require("./documentReadinessService");

async function verifyDocument(documentId, businessId, options = {}) {
    return readinessService.checkDocument(documentId, businessId, options);
}

module.exports = { verifyDocument };
