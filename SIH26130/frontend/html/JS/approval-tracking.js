const approvalTrackingApi = "/api/approval-tracking";
const portalStatuses = ["SUBMITTED", "UNDER_SCRUTINY", "DOCUMENT_VERIFICATION", "QUERY_RAISED", "APPROVED", "REJECTED"];
let trackedApprovals = [];

function trackingEscape(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
}

function vaultValue(key) {
    return String(records[key]?.fieldValue || "").trim();
}

function setTrackingMessage(message, error = false) {
    const element = document.getElementById("approvalEntryMessage");
    element.textContent = message;
    element.className = error ? "error" : "success";
}

function renderVaultPreview() {
    const preview = document.getElementById("approvalVaultPreview");
    const permission = document.getElementById("approvalVaultPermission").checked;
    if (!permission) {
        preview.hidden = true;
        preview.innerHTML = "";
        return;
    }
    const sharedFields = [["Business", "business_name"], ["Industry", "industry"], ["Owner", "owner_name"], ["Email", "email"], ["Phone", "phone_number"], ["Location", "district"]];
    preview.innerHTML = `<strong>Information Vault details ready to share</strong><div>${sharedFields.map(([label, key]) => `<span><b>${label}</b>${trackingEscape(vaultValue(key) || "Not entered")}</span>`).join("")}</div>`;
    preview.hidden = false;
}

document.getElementById("approvalVaultPermission").addEventListener("change", renderVaultPreview);
document.getElementById("fillFromVaultButton").addEventListener("click", () => {
    document.getElementById("approvalVaultPermission").checked = true;
    document.getElementById("newApplicationId").value = vaultValue("application_id");
    renderVaultPreview();
    setTrackingMessage("Information Vault values are ready and will be shared with your permission.");
});

function renderTrackedApprovals() {
    const count = status => trackedApprovals.filter(item => item.currentStatus === status).length;
    document.getElementById("trackingTotal").textContent = trackedApprovals.length;
    document.getElementById("trackingApproved").textContent = count("APPROVED");
    document.getElementById("trackingReview").textContent = count("UNDER_SCRUTINY") + count("DOCUMENT_VERIFICATION");
    document.getElementById("trackingDocuments").textContent = count("QUERY_RAISED");
    document.getElementById("trackingBlocked").textContent = count("REJECTED");
    document.getElementById("trackingProgress").textContent = `${trackedApprovals.length ? Math.round((count("APPROVED") / trackedApprovals.length) * 100) : 0}%`;
    document.getElementById("trackingProgressBar").style.width = document.getElementById("trackingProgress").textContent;
    document.getElementById("approvalCards").innerHTML = trackedApprovals.map(item => `<article class="approval-card">
        <div class="approval-card-header"><div><span class="demo-badge">FAKE PORTAL</span><h3>${trackingEscape(item.approvalName)}</h3><p>${trackingEscape(item.department)}</p></div><span class="approval-status-badge blue">${trackingEscape(item.currentStatus.replaceAll("_", " "))}</span></div>
        <div class="approval-card-grid"><span><b>Application</b>${trackingEscape(item.applicationId)}</span><span><b>Tracking</b>${item.trackingEnabled === false ? "Stopped" : "Active"}</span><span><b>Last checked</b>${item.lastCheckedAt ? new Date(item.lastCheckedAt).toLocaleString("en-IN") : "Not checked"}</span><span><b>Email</b>${trackingEscape(item.contact?.email)}</span><span><b>Phone</b>${trackingEscape(item.contact?.phone)}</span></div>
        ${item.lastPollError ? `<div class="tracking-info-box">${trackingEscape(item.lastPollError)}</div>` : ""}
        <div class="tracking-card-actions"><button type="button" class="secondary-btn delete-tracking-button" data-application-id="${trackingEscape(item.applicationId)}">Delete added application</button></div>
    </article>`).join("") || '<div class="tracking-empty">No portal applications submitted yet.</div>';
    document.querySelectorAll(".delete-tracking-button").forEach(button => button.addEventListener("click", () => deleteTracking(button.dataset.applicationId)));
}

async function deleteTracking(applicationId) {
    if (!window.confirm("Delete this tracking record from ApprovalGuard?")) return;
    try {
        const response = await fetch(`${approvalTrackingApi}/applications/${encodeURIComponent(applicationId)}`, { method: "DELETE" });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || "Unable to delete tracking record.");
        setTrackingMessage("Tracking record deleted.");
        await refreshTrackedApprovals();
    } catch (error) { setTrackingMessage(error.message, true); }
}

async function refreshTrackedApprovals() {
    try {
        const response = await fetch(`${approvalTrackingApi}/applications`);
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || "Could not check portal status.");
        trackedApprovals = result.data || [];
        renderTrackedApprovals();
    } catch (error) { setTrackingMessage(`Status check unavailable: ${error.message}`, true); }
}

document.getElementById("approvalEntryForm").addEventListener("submit", async event => {
    event.preventDefault();
    const approvalName = document.getElementById("newApprovalName").value.trim();
    const department = document.getElementById("newApprovalDepartment").value.trim();
    const applicationId = document.getElementById("newApplicationId").value.trim() || vaultValue("application_id");
    if (!approvalName || !department) {
        setTrackingMessage("Enter the approval name and department before opening the demo portal.", true);
        return;
    }
    if (!document.getElementById("approvalVaultPermission").checked) {
        setTrackingMessage("Allow Information Vault details before opening the demo portal.", true);
        return;
    }
    const portalUrl = new URL(`${window.DEMO_PORTAL_URL}/`);
    portalUrl.searchParams.set("approvalName", approvalName);
    portalUrl.searchParams.set("department", department);
    if (applicationId) portalUrl.searchParams.set("applicationId", applicationId);
    window.open(portalUrl.toString(), "_blank", "noopener,noreferrer");
    setTrackingMessage("Demo portal opened. Review the Information Vault data there before submitting.");
});

refreshTrackedApprovals();
window.setInterval(refreshTrackedApprovals, 10000);