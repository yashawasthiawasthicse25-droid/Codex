const VALID_STATUS_TRANSITIONS = {
  SUBMITTED: ['UNDER_SCRUTINY'],
  UNDER_SCRUTINY: ['DOCUMENT_VERIFICATION', 'QUERY_RAISED'],
  DOCUMENT_VERIFICATION: ['APPROVED', 'QUERY_RAISED'],
  QUERY_RAISED: ['UNDER_SCRUTINY'],
  APPROVED: [],
  REJECTED: []
};

const statefulStore = {
  applications: [],
  statusHistory: [],
  queries: []
};

const sequenceState = { value: 421 };

function generateApplicationId() {
  const year = new Date().getFullYear();
  const sequence = sequenceState.value;
  sequenceState.value += 1;
  return `MAITRI-DEMO-${year}-${String(sequence).padStart(5, '0')}`;
}

function buildApplicationFromPayload(payload = {}) {
  const business = payload.business || {};
  const approval = payload.approval || {};
  const documents = Array.isArray(payload.documents) ? payload.documents : [];

  return {
    applicationId: generateApplicationId(),
    applicant: {
      businessName: business.businessName || 'Unknown Business',
      businessType: business.businessType || 'General',
      industry: business.industry || 'General',
      state: business.state || 'Maharashtra',
      district: business.district || 'Nashik',
      investment: business.investment || 0,
      landArea: business.landArea || 0,
      employees: business.employees || 0
    },
    approval: {
      approvalCode: approval.approvalCode || 'GENERIC',
      approvalName: approval.approvalName || 'General Application',
      department: approval.department || 'Maharashtra Department'
    },
    contact: {
      name: business.contactName || 'Demo Applicant',
      phone: business.phone || 'XXXXXXXXXX',
      email: business.email || 'demo@example.com'
    },
    documents: documents.map((doc, index) => ({
      id: `${Date.now()}-${index}`,
      documentCode: doc.documentCode || `DOC_${index + 1}`,
      documentName: doc.documentName || `Document ${index + 1}`
    })),
    currentStatus: 'SUBMITTED',
    submittedAt: new Date(),
    lastUpdatedAt: new Date(),
    statusHistory: []
  };
}

function getStore() {
  return statefulStore;
}

function getAllApplications() {
  return statefulStore.applications.slice().sort((a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt));
}

function findApplicationById(applicationId) {
  return statefulStore.applications.find((app) => app.applicationId === applicationId);
}

function validateStatusTransition(currentStatus, nextStatus) {
  const validTargets = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  if (!validTargets.includes(nextStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${nextStatus}.`);
  }
  return true;
}

function createStatusHistoryEntry({ applicationId, previousStatus, newStatus, changedBy, remarks }) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 9)}`,
    applicationId,
    previousStatus,
    newStatus,
    changedBy,
    remarks: remarks || 'Status updated.',
    changedAt: new Date()
  };
  statefulStore.statusHistory.push(entry);
  return entry;
}

function updateApplicationStatus(applicationId, requestedStatus, remarks = '', changedBy = 'DEMO_OFFICER') {
  const application = findApplicationById(applicationId);
  if (!application) {
    const error = new Error('Application not found.');
    error.statusCode = 404;
    throw error;
  }

  const previousStatus = application.currentStatus;
  validateStatusTransition(previousStatus, requestedStatus);

  application.currentStatus = requestedStatus;
  application.lastUpdatedAt = new Date();

  const historyEntry = createStatusHistoryEntry({
    applicationId,
    previousStatus,
    newStatus: requestedStatus,
    changedBy,
    remarks
  });

  application.statusHistory = application.statusHistory || [];
  application.statusHistory.unshift({
    applicationId,
    previousStatus,
    newStatus: requestedStatus,
    changedBy,
    remarks,
    changedAt: historyEntry.changedAt
  });

  return {
    application,
    previousStatus,
    newStatus: requestedStatus,
    remarks,
    historyEntry
  };
}

function createQuery(payload = {}) {
  const { applicationId, description, requiredAction } = payload;
  if (!applicationId || !description || !requiredAction) {
    const error = new Error('applicationId, description, and requiredAction are required.');
    error.statusCode = 400;
    throw error;
  }

  const query = {
    queryId: `Q-${Date.now()}`,
    applicationId,
    description,
    requiredAction,
    status: 'OPEN',
    createdAt: new Date()
  };

  statefulStore.queries.push(query);
  return query;
}

function resolveQuery(queryId, remarks = 'Query resolved') {
  const query = statefulStore.queries.find((item) => item.queryId === queryId);
  if (!query) {
    const error = new Error('Query not found.');
    error.statusCode = 404;
    throw error;
  }

  query.status = 'RESOLVED';
  query.resolvedAt = new Date();
  query.remarks = remarks;

  const application = findApplicationById(query.applicationId);
  if (application) {
    updateApplicationStatus(query.applicationId, 'UNDER_SCRUTINY', remarks, 'DEMO_OFFICER');
  }

  return query;
}

module.exports = {
  buildApplicationFromPayload,
  getStore,
  getAllApplications,
  findApplicationById,
  updateApplicationStatus,
  createQuery,
  resolveQuery,
  generateApplicationId,
  VALID_STATUS_TRANSITIONS
};
