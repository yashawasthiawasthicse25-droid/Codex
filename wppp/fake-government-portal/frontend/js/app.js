const API_BASE = '/api';

function showToast(message) {
  window.alert(message);
}

function getDemoApplicationId() {
  return document.getElementById('demoApplicationId')?.value || 'MAITRI-DEMO-2026-00421';
}

function setupLogin() {
  if (document.getElementById('loginForm')) {
    window.location.href = './dashboard.html';
  }
}

async function loadDashboard() {
  const statsGrid = document.getElementById('statsGrid');
  const recentBody = document.getElementById('recentApplications');
  if (!statsGrid && !recentBody) return;

  try {
    const response = await fetch(`${API_BASE}/status/dashboard`);
    const data = await response.json();
    const dashboard = data.dashboard || {};

    const stats = [
      { label: 'Applications Received', value: dashboard.totalApplications || 0 },
      { label: 'Under Scrutiny', value: dashboard.underScrutiny || 0 },
      { label: 'Document Verification', value: dashboard.documentVerification || 0 },
      { label: 'Queries Raised', value: dashboard.queriesRaised || 0 },
      { label: 'Approved', value: dashboard.approved || 0 }
    ];

    statsGrid.innerHTML = stats.map((item) => `
      <div class="stat-card">
        <div class="label">${item.label}</div>
        <div class="value">${item.value}</div>
      </div>
    `).join('');

    recentBody.innerHTML = (dashboard.recentApplications || []).map((app) => `
      <tr>
        <td>${app.applicationId}</td>
        <td>${app.businessName}</td>
        <td>${app.approvalName}</td>
        <td>${app.status}</td>
      </tr>
    `).join('');
  } catch (error) {
    showToast('Dashboard data could not be loaded.');
  }
}

async function loadApplications() {
  const list = document.getElementById('applicationList');
  const searchInput = document.getElementById('searchApplicationId');
  const filterInput = document.getElementById('statusFilter');
  if (!list) return;

  try {
    const response = await fetch(`${API_BASE}/applications`);
    const data = await response.json();
    let apps = data.applications || [];

    const render = () => {
      const query = (searchInput?.value || '').toLowerCase();
      const filter = filterInput?.value || 'ALL';
      const visible = apps.filter((app) => {
        const matchesQuery = !query || app.applicationId.toLowerCase().includes(query);
        const matchesFilter = filter === 'ALL' || app.status === filter;
        return matchesQuery && matchesFilter;
      });

      list.innerHTML = visible.map((app) => `
        <tr>
          <td><a href="./review.html?applicationId=${encodeURIComponent(app.applicationId)}">${app.applicationId}</a></td>
          <td>${app.applicant}</td>
          <td>${app.status}</td>
        </tr>
      `).join('');
    };

    render();
    searchInput?.addEventListener('input', render);
    filterInput?.addEventListener('change', render);
  } catch (error) {
    showToast('Application list could not be loaded.');
  }
}

async function loadReview() {
  const applicationId = new URLSearchParams(window.location.search).get('applicationId') || 'MAITRI-DEMO-2026-00421';
  const appIdEl = document.getElementById('reviewApplicationId');
  const applicantEl = document.getElementById('reviewApplicant');
  const statusEl = document.getElementById('reviewStatus');
  const departmentEl = document.getElementById('reviewDepartment');
  if (!appIdEl) return;

  appIdEl.textContent = applicationId;

  try {
    const response = await fetch(`${API_BASE}/applications/${applicationId}`);
    const data = await response.json();
    const app = data.application || {};
    applicantEl.textContent = app.applicant || 'ABC Pharmaceuticals Pvt. Ltd.';
    statusEl.textContent = app.status || 'SUBMITTED';
    departmentEl.textContent = app.department || 'Maharashtra FDA';
  } catch (error) {
    showToast('Review details could not be loaded.');
  }

  document.querySelectorAll('[data-status]').forEach((button) => {
    button.addEventListener('click', async () => {
      const requestedStatus = button.dataset.status;
      const remarks = document.getElementById('demoRemarks')?.value || 'Status updated by government officer.';
      try {
        const response = await fetch(`${API_BASE}/applications/${applicationId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: requestedStatus, remarks })
        });
        const data = await response.json();
        if (response.ok) {
          statusEl.textContent = data.newStatus;
          showToast(`Status updated: ${data.newStatus}`);
        } else {
          showToast(data.message || 'Status transition failed.');
        }
      } catch (error) {
        showToast('Unable to update the simulated government status.');
      }
    });
  });
}

async function bindDemoControls() {
  const submitButtons = document.querySelectorAll('[data-status]');
  if (!submitButtons.length) return;

  submitButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const applicationId = getDemoApplicationId();
      const status = button.dataset.status;
      const remarks = document.getElementById('demoRemarks')?.value || 'Status updated by demo officer.';
      try {
        const response = await fetch(`${API_BASE}/applications/${applicationId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, remarks })
        });
        const data = await response.json();
        if (response.ok) {
          const current = document.getElementById('demoCurrentStatus');
          if (current) current.value = data.newStatus;
          showToast(`Status changed to ${data.newStatus}`);
        } else {
          showToast(data.message || 'Invalid status transition.');
        }
      } catch (error) {
        showToast('Demo status update failed.');
      }
    });
  });
}

function setupQueryForm() {
  const form = document.getElementById('queryForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      applicationId: document.getElementById('queryApplicationId').value,
      description: document.getElementById('queryDescription').value,
      requiredAction: document.getElementById('queryRequiredAction').value
    };

    try {
      const response = await fetch(`${API_BASE}/queries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        showToast(`Query raised for ${payload.applicationId}`);
      } else {
        showToast(data.message || 'Unable to raise query.');
      }
    } catch (error) {
      showToast('Query service is unavailable.');
    }
  });
}

async function fillFromInformationVault() {
  const status = document.getElementById('vaultPrefillStatus');
  try {
    status.textContent = 'Connecting to the Information Vault...';
    const response = await fetch(`${API_BASE}/vault/prefill`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Vault data could not be loaded.');
    Object.entries(data.fields || {}).forEach(([fieldId, value]) => {
      const field = document.getElementById(fieldId);
      if (field && value !== undefined && value !== null && value !== '') field.value = value;
    });
    status.textContent = `Filled from ${data.source}. Review the values before creating the approval.`;
  } catch (error) {
    status.textContent = error.message;
  }
}

function setupApprovalForm() {
  const form = document.getElementById('approvalForm');
  if (!form) return;
  const prefillButton = document.getElementById('prefillVaultButton');
  let loaded = false;
  const loadOnce = async () => { if (!loaded) { loaded = true; await fillFromInformationVault(); } };
  prefillButton.addEventListener('click', loadOnce);
  form.querySelectorAll('input').forEach((field) => field.addEventListener('focus', loadOnce, { once: true }));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      business: Object.fromEntries(['businessName', 'businessType', 'industry', 'state', 'district', 'investment', 'landArea', 'employees', 'contactName', 'phone', 'email'].map((id) => [id, document.getElementById(id).value])),
      approval: { approvalCode: document.getElementById('approvalCode').value, approvalName: document.getElementById('approvalName').value, department: 'Maharashtra FDA' },
      documents: []
    };
    const message = document.getElementById('approvalFormMessage');
    try {
      const response = await fetch(`${API_BASE}/applications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Approval could not be created.');
      message.textContent = `Approval created: ${data.applicationId}`;
      form.reset();
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

setupLogin();
loadDashboard();
loadApplications();
loadReview();
bindDemoControls();
setupQueryForm();
setupApprovalForm();
