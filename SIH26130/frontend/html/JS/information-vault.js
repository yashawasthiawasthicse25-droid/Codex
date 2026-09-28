const storageKey = "approvalguard.information-vault.business.v3";
const verifiedProfileSeedKey = "approvalguard.information-vault.verified-seed.v1";
const verifiedProfileDefaults = {
    business_name: "Sahyadri Pharma Solutions Pvt. Ltd.",
    business_type: "Private Limited Company",
    industry: "Pharmaceutical Manufacturing",
    business_stage: "Expansion",
    business_description: "Manufacturing generic pharmaceutical formulations and healthcare products for domestic markets.",
    registration_number: "U24239MH2024PTC123456",
    gstin: "27AABCS1234F1Z5",
    pan: "AABCS1234F",
    udyam_registration_number: "UDYAM-MH-18-0012345",
    address: "Plot 42, MIDC Industrial Area, Waluj",
    state: "Maharashtra",
    district: "Aurangabad",
    pin_code: "431136",
    plot_number: "42-B",
    land_area: "2.5",
    total_investment: "85000000",
    annual_turnover: "42000000",
    investment_in_machinery: "50000000",
    current_employees: "48",
    expected_employees: "75",
    skilled_employees: "32",
    owner_name: "Ananya Deshmukh",
    authorized_person: "Rahul Patil",
    email: "rahul.patil@sahyadripharma.example",
    phone_number: "9876543210"
};

const fieldGroups = [
    {
        id: "business",
        title: "Business Details",
        icon: "building-2",
        fields: [
            ["business_name", "Business name", "text", true],
            ["business_type", "Business type", "text", false],
            ["industry", "Industry", "text", true],
            ["business_stage", "Business stage", "text", false],
            ["business_description", "Business description", "textarea", false]
        ]
    },
    {
        id: "registration",
        title: "Registration Details",
        icon: "badge-check",
        fields: [
            ["registration_number", "Registration number", "text", false],
            ["application_id", "Fake portal application ID", "text", false, "e.g. APP-DEMO-2026-0001"],
            ["gstin", "GSTIN", "text", true],
            ["pan", "PAN", "text", true],
            ["udyam_registration_number", "Udyam registration number", "text", false]
        ]
    },
    {
        id: "location",
        title: "Location Details",
        icon: "map-pin",
        fields: [
            ["address", "Address", "text", false],
            ["state", "State", "text", false],
            ["district", "District", "text", false],
            ["pin_code", "PIN code", "text", true, "6 digits"],
            ["plot_number", "Plot number", "text", false],
            ["land_area", "Land area", "number", false, "square metres"]
        ]
    },
    {
        id: "financial",
        title: "Financial Details",
        icon: "wallet-cards",
        fields: [
            ["total_investment", "Total investment", "number", false],
            ["annual_turnover", "Annual turnover", "number", false],
            ["investment_in_machinery", "Investment in machinery", "number", false]
        ]
    },
    {
        id: "employment",
        title: "Employment Details",
        icon: "users",
        fields: [
            ["current_employees", "Current employees", "number", false],
            ["expected_employees", "Expected employees", "number", false],
            ["skilled_employees", "Skilled employees", "number", false]
        ]
    },
    {
        id: "contact",
        title: "Contact Details",
        icon: "contact",
        fields: [
            ["owner_name", "Owner name", "text", false],
            ["authorized_person", "Authorized person", "text", false],
            ["email", "Email", "email", false],
            ["phone_number", "Phone number", "tel", true, "10 digits"]
        ]
    }
];

const requiredKeys = fieldGroups.flatMap(group => group.fields.filter(field => field[3]).map(field => field[0]));
const allFields = fieldGroups.flatMap(group => group.fields);
const form = document.getElementById("businessInformationForm");
const fieldSections = document.getElementById("fieldSections");
const demoPortalLink = document.querySelector("[data-demo-portal-link]");
if (demoPortalLink) demoPortalLink.href = window.DEMO_PORTAL_URL;
let isEditing = true;
let records = loadRecords();

function now() {
    return new Date().toISOString();
}

function createInitialRecords() {
    return Object.fromEntries(allFields.map(([key]) => [
        key,
        {
            fieldName: key,
            fieldValue: "",
            verificationStatus: "Unverified",
            lastUpdated: now()
        }
    ]));
}

function loadRecords() {
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey));
        if (stored && typeof stored === "object") {
            const initial = createInitialRecords();
            const records = Object.fromEntries(allFields.map(([key]) => {
                const record = stored[key] || initial[key];
                return [key, {
                    ...initial[key],
                    ...record,
                    fieldValue: String(record.fieldValue ?? ""),
                    verificationStatus: record.verificationStatus || "Unverified"
                }];
            }));
            if (!localStorage.getItem(verifiedProfileSeedKey)) {
                Object.entries(verifiedProfileDefaults).forEach(([key, fieldValue]) => {
                    if (!records[key]) return;
                    records[key].fieldValue = fieldValue;
                    records[key].verificationStatus = "Verified";
                    records[key].lastUpdated = "2026-09-20T12:00:00.000Z";
                });
                localStorage.setItem(verifiedProfileSeedKey, "true");
                localStorage.setItem(storageKey, JSON.stringify(records));
            }
            return records;
        }
    } catch (error) {
        console.warn("Information Vault draft could not be loaded.", error);
    }
    const initial = createInitialRecords();
    Object.entries(verifiedProfileDefaults).forEach(([key, fieldValue]) => {
        if (!initial[key]) return;
        initial[key].fieldValue = fieldValue;
        initial[key].verificationStatus = "Verified";
        initial[key].lastUpdated = "2026-09-20T12:00:00.000Z";
    });
    localStorage.setItem(verifiedProfileSeedKey, "true");
    localStorage.setItem(storageKey, JSON.stringify(initial));
    return initial;
}

async function syncBusinessProfile() {
    try {
        const response = await fetch(`${window.APPROVAL_GUARD_URL}/api/business/latest`);
        if (!response.ok) return;

        const result = await response.json();
        const business = result.business;
        if (!business) return;

        const profileFields = {
            business_name: business.businessName,
            business_type: business.businessType,
            business_stage: business.businessStage,
            industry: business.industry,
            state: business.state,
            district: business.district,
            total_investment: business.investment,
            land_area: business.landArea,
            current_employees: business.employees,
            owner_name: business.contactPerson,
            email: business.email,
            phone_number: business.phone
        };

        Object.entries(profileFields).forEach(([key, value]) => {
            if (value === undefined || value === null) return;

            const fieldValue = String(value);
            if (!records[key].fieldValue) {
                records[key].fieldValue = fieldValue;
                records[key].verificationStatus = "Unverified";
                records[key].lastUpdated = now();
            }
        });

        persistVaultState();
    } catch (error) {
        console.warn("Business profile could not be synced to the Information Vault.", error);
    }
}

function safeValue(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"
    }[character]));
}

function formatDate(value) {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

function statusClass(status) {
    return status.toLowerCase().replace(/\s+/g, "-");
}

function renderFields() {
    fieldSections.innerHTML = fieldGroups.map(group => {
        const fieldsMarkup = group.fields.map(([key, label, type, required, hint]) => {
            const record = records[key];
            const requiredAttribute = required ? "required" : "";
            const disabledAttribute = isEditing ? "" : "disabled";
            const control = type === "textarea"
                ? `<textarea id="${key}" data-field-key="${key}" rows="3" ${requiredAttribute} ${disabledAttribute}>${safeValue(record.fieldValue)}</textarea>`
                : `<input id="${key}" data-field-key="${key}" type="${type}" value="${safeValue(record.fieldValue)}" ${requiredAttribute} ${type === "number" ? 'min="0"' : ""} ${disabledAttribute}>`;
            return `<div class="information-field ${required ? "required-field" : ""}" data-field-wrapper="${key}">
                <div class="field-label-row"><label for="${key}">${label}${required ? ' <span aria-hidden="true">*</span>' : ""}</label><span class="verification-badge ${statusClass(record.verificationStatus)}">${record.verificationStatus}</span></div>
                ${control}
                <div class="field-meta"><span>${hint || "Field value"}</span><span>Updated ${formatDate(record.lastUpdated)}</span></div>
                <p class="field-error" id="${key}Error"></p>
            </div>`;
        }).join("");
        return `<section class="information-field-section" aria-labelledby="${group.id}-title">
            <div class="field-section-heading"><span class="field-section-icon"><i data-lucide="${group.icon}"></i></span>
                <div><span class="vault-kicker">STRUCTURED FACTS</span><h2 id="${group.id}-title">${group.title}</h2></div>
            </div>
            <div class="information-fields-grid">${fieldsMarkup}</div>
        </section>`;
    }).join("");
    if (window.lucide) lucide.createIcons();
    fieldSections.querySelectorAll("[data-field-key]").forEach(control => {
        control.addEventListener("input", event => {
            const key = event.target.dataset.fieldKey;
            records[key].fieldValue = event.target.value;
            records[key].lastUpdated = now();
            records[key].verificationStatus = "Unverified";
            persistVaultState();
            updateDashboard();
        });
    });
}

function persist() {
    localStorage.setItem(storageKey, JSON.stringify(records));
}

function publishVaultSnapshot() {
    return fetch(`${window.APPROVAL_GUARD_URL}/api/information-vault/snapshot`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records })
    }).catch(error => console.warn("Information Vault snapshot could not be published.", error));
}

function persistVaultState() {
    persist();
    publishVaultSnapshot();
    if (typeof saveApplications === "function" && typeof getAllApplications === "function") {
        saveApplications(getAllApplications());
    }
}

function validate() {
    const errors = {};
    const value = key => String(records[key].fieldValue || "").trim();
    if (!value("business_name")) errors.business_name = "Business name is required.";
    if (!value("industry")) errors.industry = "Industry is required.";
    if (!value("gstin")) errors.gstin = "GSTIN cannot be empty.";
    if (!value("pan")) errors.pan = "PAN cannot be empty.";
    if (value("pin_code") && !/^\d{6}$/.test(value("pin_code"))) errors.pin_code = "PIN code must contain 6 digits.";
    if (value("phone_number") && !/^\d{10}$/.test(value("phone_number"))) errors.phone_number = "Phone number must contain 10 digits.";
    ["total_investment", "annual_turnover", "investment_in_machinery", "land_area", "current_employees", "expected_employees", "skilled_employees"].forEach(key => {
        if (value(key) && (!Number.isFinite(Number(value(key))) || Number(value(key)) < 0)) {
            errors[key] = `${allFields.find(field => field[0] === key)[1]} must be a valid non-negative number.`;
        }
    });
    return errors;
}

function updateDashboard() {
    const errors = validate();
    const filledFields = allFields.filter(([key]) => String(records[key].fieldValue ?? "").trim());
    const total = allFields.length;
    const missingRequired = requiredKeys.some(key => !String(records[key].fieldValue || "").trim());
    const validFilledFields = filledFields.filter(([key]) => !errors[key]).length;
    const verified = filledFields.filter(([key]) => records[key].verificationStatus === "Verified").length;
    const progress = total ? Math.round((validFilledFields / total) * 100) : 0;
    let status = "NEEDS REVIEW";
    let reason = "Information is entered but not verified.";
    if (Object.keys(errors).length || missingRequired) {
        status = "INCOMPLETE";
        reason = Object.keys(errors).length ? "Resolve the highlighted validation errors." : "Complete all required fields.";
    } else if (filledFields.length > 0 && verified === filledFields.length) {
        status = "READY FOR ENGINE USE";
        reason = "All fields are verified and ready to reuse.";
    } else if (validFilledFields === total) {
        status = "READY FOR VERIFICATION";
        reason = "All fields are complete and ready for verification.";
    }
    document.getElementById("overallStatus").textContent = status;
    document.getElementById("overallStatus").className = `dashboard-status ${statusClass(status)}`;
    document.getElementById("statusReason").textContent = reason;
    document.getElementById("progressValue").textContent = `${progress}%`;
    document.getElementById("progressBar").style.width = `${progress}%`;
    document.getElementById("totalFields").textContent = total;
    document.getElementById("verifiedFields").textContent = verified || validFilledFields;
    document.getElementById("pendingFields").textContent = total - validFilledFields;
    document.getElementById("criticalErrors").textContent = Object.keys(errors).length;
    Object.entries(errors).forEach(([key, message]) => {
        const error = document.getElementById(`${key}Error`);
        if (error) error.textContent = message;
    });
    allFields.forEach(([key]) => {
        const error = document.getElementById(`${key}Error`);
        if (error && !errors[key]) error.textContent = "";
    });
}

function setMessage(message, type = "success") {
    const element = document.getElementById("vaultMessage");
    element.textContent = message;
    element.className = `vault-action-message ${type}`;
}

function setStatuses(status) {
    const errors = validate();
    allFields.forEach(([key]) => {
        if (String(records[key].fieldValue || "").trim() && !errors[key]) {
            records[key].verificationStatus = status;
            records[key].lastUpdated = now();
        } else if (errors[key]) {
            records[key].verificationStatus = "Unverified";
        }
    });
    persistVaultState();
    renderFields();
    updateDashboard();

    let trackingApplications = getAllApplications();
    const statusColors = {
        APPROVED: "green", SUBMITTED: "blue", UNDER_REVIEW: "purple", DOCUMENT_REQUIRED: "yellow",
        DOCUMENT_PENDING: "yellow", QUERY_RAISED: "orange", REJECTED: "red", BLOCKED: "dark-red",
        NOT_STARTED: "gray", DRAFT: "gray", PAYMENT_PENDING: "blue", SITE_INSPECTION: "purple",
        RENEWAL_REQUIRED: "orange", EXPIRED: "red"
    };

    function displayStatus(status) { return status.replaceAll("_", " "); }
    function renderTrackingFilters() {
        const fill = (id, values) => {
            const select = document.getElementById(id);
            const selected = select.value;
            while (select.options.length > 1) select.remove(1);
            [...new Set(values)].sort().forEach(value => select.insertAdjacentHTML("beforeend", `<option value="${safeValue(value)}">${safeValue(displayStatus(value))}</option>`));
            if ([...select.options].some(option => option.value === selected)) select.value = selected;
        };
        fill("approvalStatusFilter", APPROVAL_STATUSES);
        fill("approvalDepartmentFilter", trackingApplications.map(item => item.department));
        fill("approvalLevelFilter", trackingApplications.map(item => item.level));
        fill("approvalActionFilter", trackingApplications.map(item => item.nextAction));
    }

    function filteredApplications() {
        const search = document.getElementById("approvalSearch").value.toLowerCase();
        const status = document.getElementById("approvalStatusFilter").value;
        const department = document.getElementById("approvalDepartmentFilter").value;
        const level = document.getElementById("approvalLevelFilter").value;
        const action = document.getElementById("approvalActionFilter").value;
        const sort = document.getElementById("approvalSort").value;
        return trackingApplications.filter(item => (!search || `${item.approvalName} ${item.applicationNumber}`.toLowerCase().includes(search)) &&
            (!status || item.currentStatus === status) && (!department || item.department === department) && (!level || item.level === level) && (!action || item.nextAction === action))
            .sort((a, b) => new Date(b[sort] || "9999-12-31") - new Date(a[sort] || "9999-12-31"));
    }

    function renderTracking() {
        trackingApplications = applyDependencyBlocking(getAllApplications());
        saveApplications(trackingApplications);
        const total = trackingApplications.length;
        const count = status => trackingApplications.filter(item => item.currentStatus === status).length;
        document.getElementById("trackingTotal").textContent = total;
        document.getElementById("trackingApproved").textContent = count("APPROVED");
        document.getElementById("trackingReview").textContent = count("UNDER_REVIEW");
        document.getElementById("trackingDocuments").textContent = count("DOCUMENT_REQUIRED") + count("DOCUMENT_PENDING");
        document.getElementById("trackingBlocked").textContent = count("BLOCKED");
        document.getElementById("trackingRenewals").textContent = count("RENEWAL_REQUIRED");
        const progress = total ? Math.round((count("APPROVED") / total) * 100) : 0;
        document.getElementById("trackingProgress").textContent = `${progress}%`;
        document.getElementById("trackingProgressBar").style.width = `${progress}%`;
        document.getElementById("approvalCards").innerHTML = filteredApplications().map(application => {
            const dependency = getDependencyState(application, trackingApplications);
            const dependencyText = dependency.incomplete.length ? `Blocked by: ${dependency.incomplete.map(item => item.approvalName).join(", ")}` : "All prerequisites approved";
            return `<article class="approval-card">
                <div class="approval-card-header"><div><span class="demo-badge">DEMO MODE</span><h3>${safeValue(application.approvalName)}</h3><p>${safeValue(application.department)}</p></div><span class="approval-status-badge ${statusColors[application.currentStatus] || "gray"}">${displayStatus(application.currentStatus)}</span></div>
                <div class="approval-card-grid"><span><b>Application</b>${safeValue(application.applicationNumber)}</span><span><b>Submitted</b>${safeValue(application.submittedDate)}</span><span><b>Last checked</b>${new Date(application.lastCheckedAt).toLocaleString("en-IN")}</span><span><b>Next action</b>${safeValue(application.nextAction)}</span></div>
                <div class="approval-dependency ${dependency.blocked ? "blocked" : ""}"><i data-lucide="${dependency.blocked ? "lock-keyhole" : "check-circle-2"}"></i>${safeValue(dependencyText)}</div>
                <div class="approval-card-actions"><button class="secondary-btn tracking-action" data-action="details" data-id="${application.approvalId}">View Timeline</button><button class="secondary-btn tracking-action" data-action="simulate" data-id="${application.approvalId}">Simulate Status Update</button><button class="secondary-btn tracking-action" data-action="remark" data-id="${application.approvalId}">Add Remark</button></div>
            </article>`;
        }).join("") || `<div class="tracking-empty"><i data-lucide="search-x"></i><strong>No approvals match these filters.</strong><span>Try clearing a filter or search term.</span></div>`;
        document.querySelectorAll(".tracking-action").forEach(button => button.addEventListener("click", () => trackingAction(button.dataset.action, button.dataset.id)));
        if (window.lucide) lucide.createIcons();
        renderNotifications();
    }

    function showTrackingToast(message, error = false) {
        const toast = document.getElementById("trackingToast"); toast.textContent = message; toast.className = `tracking-toast visible ${error ? "error" : ""}`;
        window.setTimeout(() => toast.classList.remove("visible"), 3500);
    }

    function ensureTrackingModal() {
        if (document.getElementById("approvalDetailsModal")) return;
        document.body.insertAdjacentHTML("beforeend", `<div id="approvalDetailsModal" class="approval-modal" hidden><div class="approval-modal-card"><button class="modal-close" id="closeApprovalModal">×</button><div id="approvalDetails"></div></div></div>`);
        document.getElementById("closeApprovalModal").addEventListener("click", () => { document.getElementById("approvalDetailsModal").hidden = true; });
    }

    function showDetails(id) {
        const application = getApplicationById(id); ensureTrackingModal();
        const timeline = getApplicationTimeline(id);
        document.getElementById("approvalDetails").innerHTML = `<span class="demo-badge">DEMO MODE · SIMULATED STATUS SOURCE</span><h2>${safeValue(application.approvalName)}</h2><p class="modal-subtitle">${safeValue(application.department)} · ${safeValue(application.applicationNumber)}</p>
            <div class="modal-detail-grid"><span><b>Business</b>${safeValue(application.businessName)}</span><span><b>Portal</b><a href="${safeValue(application.portalUrl)}" target="_blank" rel="noreferrer">${safeValue(application.portalName)}</a></span><span><b>Current status</b>${displayStatus(application.currentStatus)}</span><span><b>Previous status</b>${displayStatus(application.previousStatus)}</span><span><b>Submitted</b>${safeValue(application.submittedDate)}</span><span><b>Due date</b>${safeValue(application.dueDate)}</span><span><b>Next action</b>${safeValue(application.nextAction)}</span><span><b>Remarks</b>${safeValue(application.remarks || "No remarks")}</span></div>
            <div class="modal-actions"><button class="primary-btn tracking-modal-action" data-action="check" data-id="${id}">Check Status</button><button class="secondary-btn tracking-modal-action" data-action="simulate" data-id="${id}">Simulate Status Update</button><button class="secondary-btn tracking-modal-action" data-action="upload" data-id="${id}">Upload Demo Document</button><button class="secondary-btn tracking-modal-action" data-action="remark" data-id="${id}">Add Remark</button><button class="secondary-btn tracking-modal-action" data-action="renew" data-id="${id}">Mark as Renewal Required</button></div>
            <h3 class="timeline-title">Status timeline</h3><div class="status-timeline">${timeline.map(event => `<div class="timeline-event"><span></span><div><b>${displayStatus(event.oldStatus)} → ${displayStatus(event.newStatus)}</b><p>${safeValue(event.message)}</p><small>${new Date(event.eventDate).toLocaleString("en-IN")} · ${safeValue(event.changedBy)} · ${safeValue(event.source)}</small></div></div>`).join("")}</div>`;
        document.querySelectorAll(".tracking-modal-action").forEach(button => button.addEventListener("click", () => trackingAction(button.dataset.action, button.dataset.id)));
        document.getElementById("approvalDetailsModal").hidden = false; if (window.lucide) lucide.createIcons();
    }

    function trackingAction(action, id) {
        try {
            const application = getApplicationById(id);
            if (action === "details") return showDetails(id);
            if (action === "simulate") simulateStatusUpdate(id);
            if (action === "upload") {
                if (!Array.isArray(application.documentsSubmitted)) application.documentsSubmitted = [];
                if (!application.documentsSubmitted.includes("Fire-safety demo document")) application.documentsSubmitted.push("Fire-safety demo document");
                updateApplicationStatus(id, "UNDER_REVIEW", "Additional document uploaded for review.");
            }
            if (action === "check") { updateApplication(id, {}); addApplicationNotification(application, `${application.approvalName} status checked.`); }
            if (action === "remark") {
                const remark = window.prompt("Add a remark", application.remarks || "");
                if (remark !== null) updateApplication(id, { remarks: remark });
            }
            if (action === "renew") updateApplicationStatus(id, "RENEWAL_REQUIRED", "Renewal window marked for attention.");
            renderTracking(); showTrackingToast(`${application.approvalName} updated.`);
            if (document.getElementById("approvalDetailsModal")) showDetails(id);
        } catch (error) { showTrackingToast(error.message, true); }
    }

    function renderNotifications() {
        const notifications = getApplicationNotifications(); const unread = notifications.filter(item => !item.read).length;
        document.getElementById("notificationCount").textContent = unread;
        document.getElementById("notificationList").innerHTML = notifications.length ? notifications.map(item => `<div class="notification-item ${item.read ? "read" : ""}"><div><b>${safeValue(item.approvalName)}</b><p>${safeValue(item.message)}</p><small>${new Date(item.date).toLocaleString("en-IN")}</small></div>${item.read ? "" : `<button class="mark-read" data-notification-id="${item.id}">Mark as read</button>`}</div>`).join("") : `<p class="tracking-empty">No notifications yet.</p>`;
        document.querySelectorAll(".mark-read").forEach(button => button.addEventListener("click", () => { markNotificationAsRead(button.dataset.notificationId); renderNotifications(); }));
    }

    renderTrackingFilters();
    renderTracking();
    ["approvalSearch", "approvalStatusFilter", "approvalDepartmentFilter", "approvalLevelFilter", "approvalActionFilter", "approvalSort"].forEach(id => document.getElementById(id).addEventListener("input", renderTracking));
    document.getElementById("notificationButton").addEventListener("click", () => { document.getElementById("notificationPanel").hidden = !document.getElementById("notificationPanel").hidden; renderNotifications(); });
    document.getElementById("closeNotifications").addEventListener("click", () => { document.getElementById("notificationPanel").hidden = true; });
}

document.getElementById("editButton").addEventListener("click", () => {
    isEditing = !isEditing;
    document.getElementById("editButton").innerHTML = isEditing ? '<i data-lucide="lock-open"></i> Editing' : '<i data-lucide="pencil"></i> Edit';
    renderFields();
    setMessage(isEditing ? "Fields are editable. Changes are saved locally as you work." : "Editing locked. Review the current structured facts.");
});

document.getElementById("saveDraftButton").addEventListener("click", () => {
    persistVaultState();
    setMessage(`Information Vault saved at ${new Date().toLocaleTimeString("en-IN")}. Your facts and approval records are stored in this browser.`);
});

document.getElementById("submitVerificationButton").addEventListener("click", () => {
    const errors = validate();
    if (Object.keys(errors).length) {
        updateDashboard();
        setMessage("Fix the highlighted validation errors before submitting for verification.", "error");
        return;
    }
    setStatuses("Verified");
    setMessage("Information verified for this prototype. Verified fields are now available to matching and approval engines.");
});

document.getElementById("approvalEngineButton").addEventListener("click", () => {
    const status = document.getElementById("overallStatus").textContent;
    if (status !== "READY FOR ENGINE USE") {
        setMessage("Approval Engine use is blocked until all required information is verified and no critical mismatch exists.", "error");
        return;
    }
    setMessage("Verified business information sent to Approval Applicability Engine.");
});

document.getElementById("applicationFormButton").addEventListener("click", () => {
    const mapped = [
        ["registered_business_name", "Applicant Name", "business_name"],
        ["gstin", "GST Registration Number", "gstin"],
        ["pan", "Permanent Account Number", "pan"],
        ["plot_number", "Plot Number", "plot_number"],
        ["owner_name", "Authorized Person Name", "owner_name"]
    ];
    document.getElementById("mappedFields").innerHTML = mapped.map(([key, label, source]) => `
        <div class="mapped-field"><span>${key}</span><label>${label}</label><strong>${safeValue(records[source].fieldValue) || "Not entered"}</strong></div>
    `).join("");
    document.getElementById("mappedApplication").hidden = false;
    document.getElementById("mappedApplication").scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.lucide) lucide.createIcons();
});

form.addEventListener("submit", event => event.preventDefault());
window.addEventListener("beforeunload", persistVaultState);

async function initializeVault() {
    await syncBusinessProfile();
    publishVaultSnapshot();
    renderFields();
    updateDashboard();
}

initializeVault();
