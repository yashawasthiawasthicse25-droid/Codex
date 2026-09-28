const apiBase = window.APPROVAL_GUARD_URL;
const vaultApproval = document.getElementById("vaultApproval");
const vaultRequirement = document.getElementById("vaultRequirement");
const vaultForm = document.getElementById("vaultForm");
const vaultList = document.getElementById("vaultList");
const vaultCount = document.getElementById("vaultCount");
const vaultMessage = document.getElementById("vaultMessage");
const verificationResult = document.getElementById("verificationResult");
const manualFields = document.getElementById("manualFields");
let businessProfileId = null;
let databaseApproval = null;
let selectedTemplate = null;

const fieldSets = {
    "CA Certificate": [["companyName", "Company name", "text"], ["capitalInvestmentCrore", "Capital investment (crore)", "number"], ["certificateIssueDate", "Certificate issue date", "date"], ["caMembershipNumber", "CA membership number", "text"], ["signedAndStamped", "Signed and stamped", "checkbox"], ["udinPresent", "UDIN is present", "checkbox"]],
    "Land Ownership / MIDC Allotment Document": [["ownerOrLesseeName", "Owner or lessee name", "text"], ["plotNumber", "Plot number", "text"], ["landArea", "Land area", "number"], ["location", "Location", "text"], ["registrationOrAllotmentNumber", "Registration/allotment number", "text"], ["documentDate", "Document date", "date"]],
    "Site Plan": [["plotBoundaryMarked", "Plot boundary marked", "checkbox"], ["buildingOrProcessAreaMarked", "Building/process area marked", "checkbox"], ["roadAccessShown", "Road access shown", "checkbox"], ["effluentDischargePointMarked", "Effluent discharge point marked", "checkbox"], ["emissionStackLocationMarked", "Emission stack location marked", "checkbox"], ["etpLocationMarked", "ETP location marked", "checkbox"], ["northDirectionMarked", "North direction marked", "checkbox"], ["professionalDrawingReviewDeclared", "Professional drawing review declared", "checkbox"]],
    "Process Flow Diagram": [["rawMaterialsListed", "Raw materials listed", "checkbox"], ["manufacturingStepsListed", "Manufacturing steps listed", "checkbox"], ["finalProductName", "Final product name", "text"], ["solventsOrChemicalsListed", "Solvents or chemicals listed", "checkbox"], ["effluentGenerationPointsListed", "Effluent generation points listed", "checkbox"], ["airEmissionPointsListed", "Air-emission points listed", "checkbox"], ["hazardousWastePointsListed", "Hazardous-waste points listed", "checkbox"], ["pollutionControlLinkageShown", "Pollution-control linkage shown", "checkbox"]],
    "Mass Balance": [["totalInputKg", "Total input (kg)", "number"], ["productOutputKg", "Product output (kg)", "number"], ["byProductOutputKg", "By-product output (kg)", "number"], ["wasteOutputKg", "Waste output (kg)", "number"], ["processLossKg", "Process loss (kg)", "number"], ["solventRecoveryMentioned", "Solvent recovery disclosed", "checkbox"], ["unitsConsistent", "Units are consistent", "checkbox"], ["professionalTechnicalReviewDeclared", "Professional technical review declared", "checkbox"]],
    "ETP Proposal / ETP Design": [["proposedETPCapacityKLD", "Proposed ETP capacity (KLD)", "number"], ["treatmentStagesDescribed", "Treatment stages described", "checkbox"], ["sludgeManagementMentioned", "Sludge management mentioned", "checkbox"], ["disposalOrReusePathMentioned", "Disposal/reuse path mentioned", "checkbox"], ["consultantOrDesignerDetailsProvided", "Consultant/design details provided", "checkbox"], ["engineeringReviewDeclared", "Engineering review declared", "checkbox"]]
};
const genericDocumentQuestions = {
    "certificate of incorporation": ["Is the company registered with the Registrar of Companies (ROC)?", "Is the CIN clearly visible?", "Does the company name match your application?", "Is the copy full-page and readable?", "Is the incorporation date before the application date?", "Is the registered office address correct?", "Is the company status Active on the MCA portal?", "Is the company type (Private/Public/LLP) stated correctly?", "If the name changed, have you attached the fresh certificate?", "Do you have the company PAN?"],
    "moa aoa": ["Is the latest version attached?", "Does the objects clause include your business activity?", "Are all pages included and signed/stamped?", "Are the promoters' names and addresses shown?", "Is the share capital mentioned?", "Does the AOA say who can sign for the company?", "Does the company name match the incorporation certificate?", "If objects were changed, was the amendment filed with ROC?", "Does the registered office match the application?", "Is the copy certified as true by a director or company secretary?"],
    "board resolution": ["Was it passed at a proper board meeting?", "Does it clearly state the business activity or approval being applied for?", "Does it name the authorised signatory?", "Does it mention the premises address?", "Does it authorise fee payment and dealing with government authorities?", "Is it dated and signed by the directors?", "Is it a certified true copy on company letterhead?", "Does it mention the proposed investment or project cost?", "Are the meeting minutes recorded?", "Does the company name match the incorporation certificate?"],
    "partnership deed": ["Is it on proper stamp paper?", "Are all partners' names and addresses listed?", "Does the firm name match your application?", "Does it include your business activity?", "Does it name the partner authorised to sign?", "Is the profit-sharing ratio written?", "Is it signed by all partners with witnesses?", "Is the firm registered where required?", "If partners changed, is the updated deed attached?", "Does the firm have a PAN?"],
    "key plan and site plan": ["Is it drawn to scale?", "Does it show boundaries, roads, and nearby buildings?", "Is the plot/survey number written?", "Is the north direction marked?", "Are blocks (production, warehouse, office, utilities) marked?", "Are entry and exit points shown?", "Is it signed by the applicant and an architect/engineer?", "Does the plot area match the ownership/lease papers?", "Are drains, effluent treatment and waste areas shown?", "Does it match the approved building plan?"],
    "land ownership / lease documents": ["Do you own the land or hold a valid lease?", "Does the name on the document match the applicant?", "Does the lease period cover the project period?", "Is the sale/lease deed registered?", "Does it allow industrial use?", "Do the survey number and area match the site plan?", "Do you have the landlord's NOC if leased?", "Is the land free from disputes or legal claims?", "Is the land in an industrial zone?", "Is stamp duty paid?"],
    "property tax receipt": ["Is it for the latest year?", "Does the name match?", "Does the property address match?", "Are there no pending dues?", "Is it issued by the correct local body?", "Are the receipt number and date visible?", "Is the property use shown as industrial or commercial?", "Does the assessed area match the building plan?", "If leased, do you have the owner's copy?", "Is the copy clear and complete?"],
    "building plan approval copy": ["Is it approved by the local authority?", "Does it allow industrial use?", "Is the approval still valid?", "Does the built area match the approved area?", "Do you have the occupancy or completion certificate?", "Is the plan stamped and signed by the authority?", "Are all floors and blocks included?", "Are the approval number and date visible?", "Are later extensions also approved?", "Does the owner name match the applicant?"],
    "mpcb cte/cto copies": ["Did you get Consent to Establish (CTE) before building?", "Did you get or apply for Consent to Operate (CTO) before starting operations?", "Is the consent still valid?", "Does it cover the products or activities you will undertake?", "Is the industry category (Red/Orange/Green/White) stated correctly?", "Are effluent and air pollution control arrangements mentioned?", "Do you have hazardous waste authorisation if needed?", "Do the name and address match your application?", "Are you following the consent conditions?", "Does the copy include all pages and conditions?"],
    "fire noc copy": ["Is it issued by the fire department or authorised authority?", "Is it valid?", "Does the address match?", "Are extinguishers, hydrants and alarms installed?", "Are fire exits marked and clear?", "Does it cover the whole building?", "Are all NOC conditions complied with?", "Was the premises inspected by a fire officer?", "Are the NOC number and date visible?", "Do you track the renewal date?"],
    "factory license copy": ["Is it issued under the Factories Act?", "Is it valid?", "Does the occupier name match?", "Do the worker count and power load match your plan?", "Does the address match?", "Was the factory plan approved?", "Does it cover your type of manufacturing?", "Are renewal fees paid?", "Are safety rules being followed?", "Is the copy complete?"],
    "site layout and plant master file": ["Does the layout show movement of materials and people?", "Are raw material, production, packing and finished goods areas separate?", "Does the plant file describe the company and its products?", "Does it include an organisation chart?", "Does it list key staff and their qualifications?", "Does it describe the quality control system?", "Does it describe water, power and utilities?", "Does it explain cleaning and safety arrangements?", "Is it signed, dated and version-controlled?", "Does it match the current layout?"],
    "premises blueprint": ["Are the production area, testing area and warehouse shown separately?", "Are dimensions marked?", "Are there separate entries for people and materials?", "Are changing rooms or washrooms shown?", "Are restricted or clean areas marked if needed?", "Does the layout prevent mixing of materials?", "Are drainage and ventilation shown?", "Is it signed by an architect?", "Does it match the actual building?", "Is there a separate area for rejected or damaged goods?"],
    "list of equipment with calibration certificates": ["Does the list include all machines?", "Are make, model, serial number and capacity written?", "Is the equipment suitable for your products?", "Do all measuring instruments have calibration certificates?", "Was calibration done by a traceable or accredited lab?", "Are the certificates still valid?", "Are installation and testing records available?", "Is there a maintenance and recalibration schedule?", "Does each equipment have an ID tag?", "Is the list signed and dated by the responsible person?"],
    "production head": ["Does the person have the required degree or diploma?", "Do they have the required years of manufacturing experience?", "Are they a full-time employee?", "Is the appointment letter signed by both sides?", "Is the degree certificate attached?", "Is the experience certificate from the previous employer attached?", "Is their ID proof (Aadhaar/PAN) attached?", "Are they not working as a head in another firm at the same time?", "Are their duties clearly defined?", "Does the name match your application?"],
    "qa head": ["Does the person have the required degree?", "Do they have the required experience in quality assurance?", "Are they independent of the production head?", "Do they have authority to approve or reject batches?", "Is the appointment letter signed?", "Are degree and experience certificates attached?", "Are they a full-time employee?", "Are they responsible for SOPs and record review?", "Are they not working for another firm at the same time?", "Does the name match your application?"],
    "qc head": ["Does the person have the required degree (science/engineering)?", "Do they have the required testing experience?", "Are they independent of the production head?", "Are they in charge of the QC lab and testing?", "Is the appointment letter signed?", "Are degree and experience certificates attached?", "Are they a full-time employee?", "Are they responsible for sampling and testing of raw materials and finished products?", "Are they not working for another firm at the same time?", "Does the name match your application?"]
};
const selfAssessmentSteps = [
    { title: "Step 1 — Simple / Basic", questions: [
        ["basicQ1", "Have you identified the drugs/products you intend to manufacture?"],
        ["basicQ2", "Have you identified the proposed manufacturing premises?"],
        ["basicQ3", "Is the ownership/constitution of the applicant or manufacturing business documented?"],
        ["basicQ4", "Is the proposed manufacturing site plan/layout available?"],
        ["basicQ5", "Have you provided the basic information required for the manufacturing licence application?"]
    ]},
    { title: "Step 2 — Normal / Technical", questions: [
        ["normalQ1", "Are qualified technical personnel available for the proposed manufacturing activities?"],
        ["normalQ2", "Are the required manufacturing areas and equipment available for the proposed products?"],
        ["normalQ3", "Are suitable laboratory and quality-control arrangements available for testing the manufactured products?"],
        ["normalQ4", "Are appropriate storage facilities and arrangements available for raw materials and finished products?"],
        ["normalQ5", "Are the required manufacturing, testing, quality-control, and supporting records available for regulatory verification?"]
    ]},
    { title: "Step 3 — Critical / Regulatory", questions: [
        ["criticalQ1", "Has the applicant disclosed complete and accurate information about the manufacturing premises and proposed activities?"],
        ["criticalQ2", "Does the proposed manufacturing facility have systems for maintaining the required quality and manufacturing records?"],
        ["criticalQ3", "Is the facility prepared to undergo inspection or verification by the competent regulatory authority, where required?"],
        ["criticalQ4", "Can the applicant address and comply with observations or deficiencies identified during regulatory inspection or review?"],
        ["criticalQ5", "Does the proposed manufacturing facility comply with the applicable regulatory and Good Manufacturing Practice (GMP) requirements for the proposed manufacturing activity?"]
    ]}
];
let displayedQuestionSteps = selfAssessmentSteps;

function populateApprovals() {
    const selectedOption = document.createElement("option");
    selectedOption.value = "DRUG_MFG_CONVENTIONAL_FORMULATION_DEMO";
    selectedOption.textContent = "Conventional formulation manufacturing licence demo";
    vaultApproval.appendChild(selectedOption);

    const legacyOption = document.createElement("option");
    legacyOption.value = "MPCB_CTE_PHARMA";
    legacyOption.textContent = "Legacy MPCB CTE compatibility";
    vaultApproval.appendChild(legacyOption);

    PHARMA_APPROVALS.filter(approval => approval.id !== "CTE_001").forEach(approval => {
        const option = document.createElement("option");
        option.value = approval.id;
        option.textContent = approval.shortName;
        vaultApproval.appendChild(option);
    });
}
function checklistTypeFor(documentName) {
    const name = String(documentName || "").toLowerCase();
    if (name.includes("ca certificate")) return "CA Certificate";
    if (name.includes("land") || name.includes("lease") || name.includes("allotment")) return "Land Ownership / MIDC Allotment Document";
    if (name.includes("site plan")) return "Site Plan";
    if (name.includes("process flow")) return "Process Flow Diagram";
    if (name.includes("mass balance")) return "Mass Balance";
    if (name.includes("etp")) return "ETP Proposal / ETP Design";
    return null;
}

function populateRequirements() {
    const usesDatabaseTemplates = vaultApproval.value === "MPCB_CTE_PHARMA" || vaultApproval.value === "DRUG_MFG_CONVENTIONAL_FORMULATION_DEMO";
    if (usesDatabaseTemplates && !databaseApproval) {
        vaultRequirement.disabled = true;
        vaultRequirement.innerHTML = "<option value=\"\">Loading database requirements...</option>";
        loadDatabaseApproval().then(populateRequirements);
        return;
    }
    const approval = usesDatabaseTemplates ? databaseApproval : PHARMA_APPROVALS.find(item => item.id === vaultApproval.value);
    const availableTypes = [...new Set((approval?.documents || []).map(item => typeof item === "string" ? item : item.name))];
    vaultRequirement.innerHTML = `<option value="">${approval ? "Select document type" : "Select approval first"}</option>`;
    vaultRequirement.disabled = !approval || availableTypes.length === 0;
    availableTypes.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        vaultRequirement.appendChild(option);
    });
    selectedTemplate = null;
    renderManualFields();
}
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[character])); }
function formatBytes(bytes) { return !bytes ? "0 KB" : bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`; }
function scoreClass(score) { return score >= 90 ? "ready" : score >= 70 ? "minor" : score >= 40 ? "major" : "not-ready"; }
function displayValue(value) { return value === undefined || value === null || value === "" ? "Not provided" : typeof value === "object" ? JSON.stringify(value) : String(value); }
async function loadSelectedTemplate() {
    const selectedName = vaultRequirement.value;
    const template = databaseApproval?.documents?.find(item => item.name === selectedName);
        if (!template && vaultApproval.value !== "MPCB_CTE_PHARMA" && vaultApproval.value !== "DRUG_MFG_CONVENTIONAL_FORMULATION_DEMO") {
            try {
                const response = await fetch(`${apiBase}/api/document-templates/by-name?name=${encodeURIComponent(selectedName)}&approvalCode=${encodeURIComponent(vaultApproval.value)}`);
                if (!response.ok) throw new Error("Checklist template not found.");
                const result = await response.json();
                selectedTemplate = result.data;
                renderManualFields();
            } catch (error) {
                selectedTemplate = null;
                renderManualFields();
            }
            return;
        }
        if (!template) { selectedTemplate = null; renderManualFields(); return; }
    try {
        const response = await fetch(`${apiBase}/api/document-templates/${encodeURIComponent(template.code)}`);
        if (!response.ok) throw new Error("Unable to load document checklist.");
        const result = await response.json();
        selectedTemplate = result.data;
    } catch (error) {
        selectedTemplate = template;
    }
    renderManualFields();
}

function questionKey(documentName) {
    return String(documentName || "").toLowerCase().replace(/[()]/g, "").replace(/\s+/g, " ").trim();
}
function getDisplayedQuestionSteps() {
    const key = questionKey(vaultRequirement.value);
    const matchingKey = Object.keys(genericDocumentQuestions).find(candidate => key === candidate || key.includes(candidate) || candidate.includes(key))
        || (key.includes("site plan") ? "key plan and site plan" : null)
        || (key.includes("factory plan approval") || key.includes("building plan approval") ? "building plan approval copy" : null)
        || (key.includes("mpcb cte") ? "mpcb cte/cto copies" : null);
    if (matchingKey) {
        return [{ title: "Document checklist", questions: genericDocumentQuestions[matchingKey].map((label, index) => [`documentQuestion${index + 1}`, label]) }];
    }
    if (selectedTemplate?.questions?.length) {
        return [{ title: "Document checklist", questions: selectedTemplate.questions.map(question => [question.id, question.label]) }];
    }
    return selfAssessmentSteps;
}
function renderManualFields() {
    displayedQuestionSteps = getDisplayedQuestionSteps();
    const steps = checklistStepsForDisplay();
    let questionNumber = 0;
    manualFields.innerHTML = `<div class="checklist-intro">Preliminary self-assessment only. Answer every question as TRUE or FALSE. This does not replace government approval or regulatory verification.</div>${steps.map(step => `<fieldset class="readiness-step"><legend>${escapeHtml(step.title)}</legend>${step.questions.map(([id, label]) => { questionNumber += 1; return `<div class="readiness-question"><span class="readiness-question-label"><strong>Q${questionNumber}</strong>${escapeHtml(label)}</span><span class="readiness-choice"><label><input data-field="${id}" name="${id}" type="radio" value="true" required> TRUE</label><label><input data-field="${id}" name="${id}" type="radio" value="false" required> FALSE</label></span></div>`; }).join("")}</fieldset>`).join("")}`;
}
function splitChecklistQuestions(questions) {
    const firstPartEnd = Math.ceil(questions.length / 3);
    const secondPartEnd = firstPartEnd + Math.ceil((questions.length - firstPartEnd) / 2);
    return [
        { title: "Simple / Basic", level: "basic", questions: questions.slice(0, firstPartEnd) },
        { title: "Normal / Technical", level: "normal", questions: questions.slice(firstPartEnd, secondPartEnd) },
        { title: "Critical / Regulatory", level: "critical", questions: questions.slice(secondPartEnd) }
    ].filter(step => step.questions.length);
}
function checklistStepsForDisplay() {
    return displayedQuestionSteps.length === 1
        ? splitChecklistQuestions(displayedQuestionSteps[0].questions)
        : displayedQuestionSteps;
}
function collectManualFields() {
    const steps = checklistStepsForDisplay();
    const fields = { _questions: steps.flatMap(step => step.questions.map(([id, label]) => ({ id, label, level: step.level || (step.title.toLowerCase().includes("critical") ? "critical" : step.title.toLowerCase().includes("normal") ? "normal" : "basic") }))) };
    manualFields.querySelectorAll("[data-field]:checked").forEach(input => { fields[input.dataset.field] = input.value === "true"; });
    return fields;
}
function renderVerification(result) {
    const checks = result.checks || [];
    const checkText = item => `${escapeHtml(item.label)} <small>Answer: ${item.passed ? "TRUE" : "FALSE"}${item.failureMessage ? ` · ${escapeHtml(item.failureMessage)}` : ""}</small>`;
    const passed = checks.filter(item => item.passed).map(item => `<li class="issue-success"><strong>TRUE</strong><span>${checkText(item)}</span></li>`).join("") || "<li>No checks passed yet.</li>";
    const failed = checks.filter(item => !item.passed && !item.needsManualReview).map(item => `<li class="issue-critical"><strong>FALSE</strong><span>${checkText(item)}</span></li>`).join("") || `<li class="issue-success"><strong>TRUE</strong><span>No missing or failed checks.</span></li>`;
    const manual = checks.filter(item => item.needsManualReview).map(item => `<li class="issue-warning"><strong>${item.passed ? "TRUE" : "FALSE"}</strong><span>${checkText(item)}</span></li>`).join("") || "<li>No manual-review items.</li>";
    const recommendations = (result.recommendations || []).map(item => `<li>${escapeHtml(item)}</li>`).join("") || "<li>No further checklist action.</li>";
    verificationResult.hidden = false;
    const checkedCount = checks.filter(item => item.passed).length;
    const statusNote = result.status === "NOT_READY" ? "A FALSE answer in a critical regulatory question means this preliminary self-assessment is not ready. This does not itself constitute a government rejection." : "Preliminary self-assessment only; this result is not a government approval or rejection.";
    verificationResult.innerHTML = `<div class="verification-heading"><div><span class="eyebrow">RULE-BASED PRE-SUBMISSION CHECKLIST</span><h2>Document readiness</h2><p>Based only on the TRUE/FALSE answers. The uploaded image is not scored.</p></div><div class="verification-score ${scoreClass(result.overallScore)}"><strong>${result.overallScore}</strong><span>/100</span><small>${checkedCount}/${checks.length} answered</small></div></div><div class="verification-progress"><span style="width:${result.overallScore}%"></span></div><div class="verification-status ${scoreClass(result.overallScore)}">${escapeHtml(String(result.status).replaceAll("_", " "))}</div><p class="verification-disclaimer">${escapeHtml(statusNote)}</p><div class="verification-columns"><div><h3>Passed checks</h3><ul class="verification-issues">${passed}</ul><h3>Missing or failed checks</h3><ul class="verification-issues">${failed}</ul></div><div><h3>Manual-review items</h3><ul class="verification-issues">${manual}</ul><h3>What needs your attention</h3><ul class="verification-recommendations">${recommendations}</ul></div></div>`;
    lucide.createIcons();
}
function renderDocuments(items) { vaultCount.textContent = `${items.length} document${items.length === 1 ? "" : "s"} stored`; vaultList.innerHTML = items.length ? items.map(item => { const document = item.document; const result = item.verificationResult; return `<article class="vault-file"><div class="vault-file-icon"><i data-lucide="file-check-2"></i></div><div class="vault-file-info"><strong>${escapeHtml(document.originalName)}</strong><span>${escapeHtml(document.documentType)}</span><small>${formatBytes(document.size)} · ${result ? `${result.overallScore}/100` : "Pending"}</small></div><button class="vault-delete" type="button" data-id="${document._id}" aria-label="Remove ${escapeHtml(document.originalName)}"><i data-lucide="trash-2"></i></button></article>`; }).join("") : `<div class="vault-empty"><i data-lucide="file-up"></i><p>No documents saved yet.</p><span>Upload a requirement for a pre-submission checklist.</span></div>`; vaultList.querySelectorAll(".vault-delete").forEach(button => button.addEventListener("click", async () => { await fetch(`${apiBase}/api/documents/${button.dataset.id}`, { method: "DELETE" }); loadDocuments(); })); lucide.createIcons(); }
async function loadDocuments() { try { const profileResponse = await fetch(`${apiBase}/api/business/latest`); if (!profileResponse.ok) throw new Error("Create a business profile first."); const profile = await profileResponse.json(); businessProfileId = profile.business._id; const response = await fetch(`${apiBase}/api/documents/business/${businessProfileId}`); const result = await response.json(); renderDocuments(result.data || []); } catch (error) { vaultMessage.textContent = error.message; vaultMessage.className = "vault-message error"; } }
async function loadDatabaseApproval() {
    const candidates = ["DRUG_MFG_CONVENTIONAL_FORMULATION_DEMO", "MPCB_CTE_PHARMA"];
    for (const code of candidates) {
        try {
            const response = await fetch(`${apiBase}/api/approvals/${code}`);
            if (!response.ok) continue;
            const result = await response.json();
            databaseApproval = { ...result.data.approval, documents: result.data.documents };
            if (vaultApproval.value === "") vaultApproval.value = code;
            return;
        } catch (error) {
            // keep trying the fallback code
        }
    }
    databaseApproval = null;
}

vaultApproval.addEventListener("change", populateRequirements);
vaultRequirement.addEventListener("change", loadSelectedTemplate);
vaultForm.addEventListener("submit", async event => { event.preventDefault(); const file = document.getElementById("vaultFile").files[0]; if (!file || !vaultRequirement.value || !document.getElementById("declarationAccepted").checked) return; const submitButton = vaultForm.querySelector("button"); submitButton.disabled = true; submitButton.querySelector("span").textContent = "Checking..."; const formData = new FormData(); formData.append("document", file); formData.append("documentType", vaultRequirement.value); formData.append("approvalType", vaultApproval.value); formData.append("manualFields", JSON.stringify(collectManualFields())); formData.append("declarationAccepted", "true"); if (businessProfileId) formData.append("businessProfileId", businessProfileId); try { const response = await fetch(`${apiBase}/api/documents/upload-and-check`, { method: "POST", body: formData }); const result = await response.json(); if (!response.ok) throw new Error(result.error || "Upload failed."); renderVerification(result.data.verificationResult); vaultMessage.textContent = "Document uploaded and checklist completed."; vaultMessage.className = "vault-message success"; vaultForm.reset(); vaultRequirement.disabled = true; manualFields.innerHTML = ""; loadDocuments(); } catch (error) { vaultMessage.textContent = error.message; vaultMessage.className = "vault-message error"; } finally { submitButton.disabled = false; submitButton.querySelector("span").textContent = "Check document readiness"; } });

populateApprovals();
loadDatabaseApproval().then(loadDocuments);