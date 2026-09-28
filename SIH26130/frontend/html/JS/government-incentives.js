const informationVaultKey = "approvalguard.information-vault.business.v3";
const opportunitiesKey = "approvalguard.opportunities";

// The only policies exposed by this engine. Conditions are intentionally
// explicit and weights for each policy total 100.
const incentivePolicies = [
    {
        id: "miisp-2025",
        name: "Maharashtra Industries, Investment and Services Policy 2025",
        scope: "Maharashtra · industrial investment",
        icon: "landmark",
        description: "State framework for eligible pharmaceutical manufacturing investments and industrial growth.",
        benefits: ["State fiscal incentives", "Investment and employment support", "Zone and project conditions apply"],
        officialSource: "https://maitri.maharashtra.gov.in/",
        evidence: [
            ["industrySector", "Pharmaceutical industry sector", 25, true],
            ["businessType", "Eligible business type", 15, true],
            ["businessStage", "New or expanding business stage", 15, true],
            ["district", "Maharashtra district", 10, true],
            ["locationZone", "Eligible location zone", 15, true],
            ["totalProjectInvestment", "Total project investment", 20]
        ],
        docs: ["Application Form", "CA Certificate", "Sales Invoices", "GST Returns", "Employment Records"]
    },
    {
        id: "industrial-promotion-subsidy",
        name: "Industrial Promotion Subsidy",
        scope: "Maharashtra · subsidy",
        icon: "flask-conical",
        description: "Potential reimbursement and subsidy support for qualifying pharmaceutical units.",
        benefits: ["SGST reimbursement", "MSME support up to 7 years", "Large unit support up to 10 years"],
        officialSource: "https://maitri.maharashtra.gov.in/",
        evidence: [
            ["industrySector", "Pharmaceutical industry sector", 25, true],
            ["businessType", "MSME or large business type", 15, true],
            ["locationZone", "Eligible location zone", 20, true],
            ["totalProjectInvestment", "Minimum project investment", 25],
            ["employmentCount", "Minimum employment", 15]
        ],
        docs: ["Application Form", "CA Certificate", "Sales Invoices", "GST Returns", "Employment Records"]
    },
    {
        id: "production-linked-incentive-support",
        name: "Production Linked Incentive Support",
        scope: "India · pharmaceutical production",
        icon: "factory",
        description: "Production-linked support for eligible pharmaceutical products and incremental production.",
        benefits: ["Production-linked incentive", "Product and investment thresholds apply", "Scheme window and approval conditions apply"],
        officialSource: "https://pharmaceuticals.gov.in/",
        evidence: [
            ["industrySector", "Pharmaceutical industry sector", 30, true],
            ["businessType", "Eligible business type", 15, true],
            ["businessStage", "Operating or commissioning stage", 15, true],
            ["totalProjectInvestment", "Total project investment", 20, true],
            ["annualTurnover", "Annual turnover", 10],
            ["productionCapacity", "Production capacity", 10]
        ],
        docs: ["Application Form", "Product and production plan", "CA-certified investment statement", "Sales and GST records"]
    },
    {
        id: "rnd-technology-transfer-support",
        name: "R&D and Technology Transfer Support",
        scope: "Maharashtra · innovation",
        icon: "lightbulb",
        description: "Support category for pharmaceutical research, technology acquisition and intellectual-property creation.",
        benefits: ["R&D expenditure or technology support", "Patent and IPR activity support may apply", "Eligible institution, filing and cost conditions apply"],
        officialSource: "https://industry.maharashtra.gov.in/",
        evidence: [
            ["industrySector", "Pharmaceutical or biotechnology sector", 25, true],
            ["businessType", "Eligible business type", 10, true],
            ["rndActivity", "R&D or technology-transfer activity", 35, true],
            ["plantMachineryInvestment", "Plant and machinery investment", 20],
            ["district", "Maharashtra district", 10]
        ],
        docs: ["R&D plan and technical documents", "Patent filing/registration receipts", "Technology-transfer agreement", "Invoices and audited expenditure statement"]
    },
    {
        id: "employment-epf-support",
        name: "Employment and EPF Support",
        scope: "Maharashtra · employment",
        icon: "users",
        description: "Potential support for eligible employment generation and employer EPF contributions.",
        benefits: ["Employment generation support", "EPF contribution assistance", "Employee and registration conditions apply"],
        officialSource: "https://maitri.maharashtra.gov.in/",
        evidence: [
            ["industrySector", "Pharmaceutical industry sector", 25, true],
            ["businessType", "Eligible business type", 15, true],
            ["employmentCount", "Current or planned employment", 25, true],
            ["epfRegistration", "EPF registration", 20, true],
            ["businessStage", "Operating business stage", 15]
        ],
        docs: ["EPF registration", "Employment records", "Payroll and contribution statements", "Application Form", "CA Certificate"]
    }
];

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"
    }[character]));
}

function readVaultRecords() {
    try {
        const records = JSON.parse(localStorage.getItem(informationVaultKey) || "{}");
        return Object.values(records).filter(record => record && record.fieldName);
    } catch (error) {
        console.warn("Information Vault data could not be loaded.", error);
        return [];
    }
}

function loadVaultFacts() {
    const records = readVaultRecords();
    const verified = records.filter(record => record.verificationStatus === "Verified" && String(record.fieldValue || "").trim());
    const aliases = {
        industrySector: ["industry", "industrySector"],
        businessType: ["business_type", "businessType"],
        businessStage: ["business_stage", "businessStage"],
        district: ["district"],
        locationZone: ["location_zone", "locationZone", "zone"],
        totalProjectInvestment: ["total_investment", "totalProjectInvestment"],
        plantMachineryInvestment: ["investment_in_machinery", "plantMachineryInvestment"],
        employmentCount: ["current_employees", "expected_employees", "employmentCount"],
        annualTurnover: ["annual_turnover", "annualTurnover"],
        productionCapacity: ["production_capacity", "productionCapacity"],
        rndActivity: ["business_description", "rnd_activity", "rndActivity"],
        epfRegistration: ["epf_registration", "epfRegistration"]
    };
    const findRecord = (source, keys) => source.find(record => keys.includes(record.fieldName) && String(record.fieldValue || "").trim());
    const values = {}, allValues = {}, verifiedKeys = new Set();
    Object.entries(aliases).forEach(([canonical, keys]) => {
        const all = findRecord(records, keys);
        const verifiedRecord = findRecord(verified, keys);
        if (all) allValues[canonical] = String(all.fieldValue).trim();
        if (verifiedRecord) {
            values[canonical] = String(verifiedRecord.fieldValue).trim();
            verifiedKeys.add(canonical);
        }
    });
    return {
        ...values,
        industrySector: (values.industrySector || "").toLowerCase(),
        rndActivity: (values.rndActivity || "").toLowerCase(),
        allValues,
        records,
        verifiedKeys,
        verifiedCount: verified.length,
        totalCount: records.filter(record => String(record.fieldValue || "").trim()).length,
        unverifiedCount: records.filter(record => String(record.fieldValue || "").trim() && record.verificationStatus !== "Verified").length
    };
}

function hasRelevantValue(key, facts) {
    const value = facts[key];
    if (!value) return false;
    if (key === "industrySector") return /pharma|biotech|life\s?science|api|formulat/.test(value);
    if (key === "rndActivity") return /research|r&d|technology|patent|ipr|innovation|transfer/.test(value);
    if (["totalProjectInvestment", "plantMachineryInvestment"].includes(key)) return Number(value) > 0;
    if (["employmentCount", "annualTurnover", "productionCapacity"].includes(key)) return Number(value) > 0;
    if (key === "epfRegistration") return /yes|true|registered|epf|provident/.test(value.toLowerCase());
    return true;
}

function scorePolicy(policy, facts) {
    const missingFields = [], unverifiedFields = [], matchedConditions = [];
    const criticalMissing = [], criticalUnverified = [];
    let score = 0;
    policy.evidence.forEach(([key, label, weight, critical]) => {
        const rawValue = facts.allValues[key];
        if (!rawValue) {
            missingFields.push(label);
            if (critical) criticalMissing.push(label);
        } else if (!facts.verifiedKeys.has(key)) {
            unverifiedFields.push(label);
            if (critical) criticalUnverified.push(label);
        } else if (hasRelevantValue(key, facts)) {
            score += weight;
            matchedConditions.push(label);
        } else {
            missingFields.push(`${label} (condition not met)`);
            if (critical) criticalMissing.push(label);
        }
    });
    // Critical missing or unverified conditions always block a relevant match.
    const status = criticalMissing.length || criticalUnverified.length
        ? "NEEDS_VERIFICATION"
        : score >= 80 ? "RELEVANT_MATCH"
        : score >= 60 ? "POSSIBLE_MATCH"
        : score >= 30 ? "NEEDS_VERIFICATION"
        : "NOT_MATCHED";
    const nextAction = status === "NOT_MATCHED"
        ? "Verify pharmaceutical activity and Maharashtra location in Information Vault."
        : missingFields.length || unverifiedFields.length
            ? "Verify the missing or unverified fields, then recalculate the score."
            : "Review official scheme terms and prepare the required documents.";
    return {
        policyName: policy.name,
        relevanceScore: score,
        matchStatus: status,
        matchedConditions,
        missingFields,
        unverifiedFields,
        requiredDocuments: policy.docs,
        nextAction,
        officialSource: policy.officialSource,
        disclaimer: "This deterministic relevance result uses only Information Vault records marked Verified. It is not an approval, eligibility decision or legal advice; confirm current terms with the official authority.",
        criticalMissing,
        criticalUnverified
    };
}

function readOpportunities() {
    try { return JSON.parse(localStorage.getItem(opportunitiesKey) || "[]"); } catch (_) { return []; }
}

function addOpportunity(policy, result) {
    const opportunities = readOpportunities();
    if (!opportunities.some(item => item.id === policy.id)) {
        opportunities.push({ id: policy.id, name: result.policyName, score: result.relevanceScore, status: result.matchStatus, addedAt: new Date().toISOString(), source: result.officialSource });
        localStorage.setItem(opportunitiesKey, JSON.stringify(opportunities));
    }
    const button = document.querySelector(`[data-add-opportunity="${policy.id}"]`);
    if (button) { button.textContent = "Added to Opportunities"; button.disabled = true; }
}

function render() {
    const facts = loadVaultFacts();
    document.getElementById("vaultVerificationStatus").textContent = facts.verifiedCount && !facts.unverifiedCount ? "READY" : "NEEDS VERIFICATION";
    document.getElementById("vaultVerificationSummary").textContent = `${facts.verifiedCount} verified of ${facts.totalCount} entered field${facts.totalCount === 1 ? "" : "s"}; ${facts.unverifiedCount} unverified value${facts.unverifiedCount === 1 ? "" : "s"} excluded.`;
    const scored = incentivePolicies.map(policy => ({ policy, result: scorePolicy(policy, facts) }));
    const matched = scored.filter(item => item.result.matchStatus === "RELEVANT_MATCH" || item.result.matchStatus === "POSSIBLE_MATCH").length;
    document.getElementById("matchedCount").textContent = matched;
    document.getElementById("reviewCount").textContent = scored.length - matched;
    document.getElementById("incentiveList").innerHTML = scored.map(({ policy, result }) => {
        const alreadyAdded = readOpportunities().some(item => item.id === policy.id);
        return `<article class="incentive-card ${result.matchStatus === "NOT_MATCHED" ? "needs-review" : "matched"}">
            <div class="incentive-card-header"><div class="scheme-icon"><i data-lucide="${policy.icon}"></i></div><span class="incentive-tag">${escapeHtml(result.matchStatus)}</span></div>
            <span class="incentive-chapter">${escapeHtml(policy.scope)}</span><h2>${escapeHtml(result.policyName)}</h2><p>${escapeHtml(policy.description)}</p>
            <div class="incentive-score"><strong>${result.relevanceScore}/100</strong><span>Deterministic relevance score</span></div>
            <h3>Potential support</h3><ul>${policy.benefits.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            <h3>Reasons</h3><p><strong>Matched conditions:</strong> ${result.matchedConditions.length ? escapeHtml(result.matchedConditions.join(", ")) : "None"}</p>
            <p><strong>Missing fields:</strong> ${result.missingFields.length ? escapeHtml(result.missingFields.join(", ")) : "None"}</p>
            <p><strong>Unverified fields:</strong> ${result.unverifiedFields.length ? escapeHtml(result.unverifiedFields.join(", ")) : "None"}</p>
            <p><strong>Required documents:</strong> ${escapeHtml(result.requiredDocuments.join(", "))}</p>
            <p><strong>Next action:</strong> ${escapeHtml(result.nextAction)}</p>
            <div class="incentive-card-actions"><button type="button" class="secondary-btn" data-verify-information>Verify Information</button><button type="button" class="primary-btn" data-add-opportunity="${policy.id}" ${alreadyAdded ? "disabled" : ""}>${alreadyAdded ? "Added to Opportunities" : "Add to Opportunities"}</button></div>
            <a class="incentive-link" href="${escapeHtml(result.officialSource)}" target="_blank" rel="noreferrer">Official source ↗</a>
            <p class="incentive-disclaimer">${escapeHtml(result.disclaimer)}</p>
        </article>`;
    }).join("");
    document.querySelectorAll("[data-verify-information]").forEach(button => button.addEventListener("click", () => { window.location.href = "./information-vault.html"; }));
    document.querySelectorAll("[data-add-opportunity]").forEach(button => button.addEventListener("click", () => {
        const item = scored.find(entry => entry.policy.id === button.dataset.addOpportunity);
        if (item) addOpportunity(item.policy, item.result);
    }));
    if (window.lucide) lucide.createIcons();
}

document.getElementById("recalculateScore")?.addEventListener("click", render);
document.getElementById("verifyInformation")?.addEventListener("click", () => {
    window.location.href = "./information-vault.html";
});
render();
