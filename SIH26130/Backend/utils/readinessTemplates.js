const baseQuestion = (id, label, weight, validation, failureMessage, recommendation, options = {}) => ({
    id,
    label,
    type: "checkbox",
    required: true,
    mandatory: true,
    weight,
    validation,
    failureMessage,
    recommendation,
    helpText: options.helpText || "Confirm this item from the uploaded evidence.",
    level: options.level || "basic",
    criticalIfNo: Boolean(options.criticalIfNo),
    sourceStatus: options.sourceStatus || "PROTOTYPE_READINESS_CHECK",
    sourceAuthority: options.sourceAuthority || "Maharashtra FDA / licensing route",
    needsManualReview: Boolean(options.needsManualReview),
    source: options.source || "Prototype checklist; verify against the current official portal before filing."
});

const templates = [
    {
        code: "APPLICATION_FORM",
        name: "Completed application form",
        approvalCode: "DRUG_MFG_CONVENTIONAL_FORMULATION_DEMO",
        industry: "Pharmaceutical finished formulations",
        mandatory: true,
        description: "Applicant and site application for a conventional non-biological manufacturing licence scenario.",
        source: {
            title: "Maharashtra FDA / Drugs and Cosmetics Rules framework",
            url: "https://fda.maharashtra.gov.in/",
            lastVerified: new Date("2026-09-08"),
            confidence: "High",
            note: "Prototype route only; confirm the current service checklist before filing."
        },
        questions: [
            baseQuestion("appFormUploaded", "Application form uploaded", 10, { type: "EQUALS", expectedValue: true }, "The application form is missing.", "Upload the completed form before checking readiness.", { level: "critical", criticalIfNo: true }),
            baseQuestion("appFormReadable", "Application form is readable", 10, { type: "EQUALS", expectedValue: true }, "The application is not readable or complete.", "Ensure the form is legible and all pages are included.", { level: "basic" }),
            baseQuestion("appEntityMatches", "Legal entity matches the Information Vault", 10, { type: "EQUALS", expectedValue: true }, "Applicant name must match the company profile.", "Correct the legal name or business profile before filing.", { level: "critical", criticalIfNo: true }),
            baseQuestion("siteMatchesVault", "Manufacturing site matches the Information Vault", 10, { type: "EQUALS", expectedValue: true }, "Manufacturing address is not consistent with the site record.", "Correct the site information before filing.", { level: "critical", criticalIfNo: true }),
            baseQuestion("signatoryMatches", "Authorised signatory matches records", 10, { type: "EQUALS", expectedValue: true }, "The authorised signatory is inconsistent with the profile.", "Use the authorised signatory recorded in the application record.", { level: "medium" }),
            baseQuestion("routeCorrect", "Selected route is conventional non-biological formulation manufacturing", 10, { type: "EQUALS", expectedValue: true }, "This route is not the selected non-biological, non-Schedule-X scenario.", "Confirm the chosen route is a conventional finished formulation manufacturing route.", { level: "critical", criticalIfNo: true }),
            baseQuestion("mandatoryFieldsComplete", "Mandatory application fields are complete", 10, { type: "EQUALS", expectedValue: true }, "Mandatory application fields are incomplete.", "Complete all mandatory fields required for the route.", { level: "medium" }),
            baseQuestion("productScopeMatches", "Product scope matches the selected product category", 10, { type: "EQUALS", expectedValue: true }, "The product scope does not match the selected scenario.", "Ensure all listed products are in scope for the selected conventional licence route.", { level: "critical", criticalIfNo: true }),
            baseQuestion("officialDeclaration", "Current official checklist reviewed", 10, { type: "EQUALS", expectedValue: true }, "The current official checklist has not been confirmed.", "Review the current Maharashtra FDA service checklist before filing.", { level: "medium", needsManualReview: true }),
            baseQuestion("appReadyToFile", "Ready to file after review", 10, { type: "EQUALS", expectedValue: true }, "Final filing readiness has not been confirmed.", "Only mark ready after the official filing checklist has been checked.", { level: "critical", needsManualReview: true })
        ]
    },
    {
        code: "LEGAL_ENTITY_PROOF",
        name: "Legal entity proof",
        approvalCode: "DRUG_MFG_CONVENTIONAL_FORMULATION_DEMO",
        industry: "Pharmaceutical finished formulations",
        mandatory: true,
        description: "Certificate of incorporation or equivalent proof of the legal entity.",
        source: { title: "Company registration and identity evidence", url: "https://www.mca.gov.in/", lastVerified: new Date("2026-09-08"), confidence: "High" },
        questions: [
            baseQuestion("entityUploaded", "Legal entity proof uploaded", 10, { type: "EQUALS", expectedValue: true }, "Legal-entity evidence is missing.", "Upload incorporation or equivalent proof."),
            baseQuestion("entityReadable", "Legal entity proof is readable", 10, { type: "EQUALS", expectedValue: true }, "The document is not readable.", "Ensure file quality is sufficient for verification."),
            baseQuestion("entityNameVisible", "Legal name is visible on the document", 10, { type: "EQUALS", expectedValue: true }, "Legal entity name is missing.", "Confirm the registered name is visible."),
            baseQuestion("entityNumberVisible", "Registration or incorporation number is visible", 10, { type: "EQUALS", expectedValue: true }, "Registration number is missing.", "Add the incorporation or registration number."),
            baseQuestion("entityNameMatches", "Registered name matches the company record", 10, { type: "EQUALS", expectedValue: true }, "The name has not been matched to the profile.", "Align the entity name with the company profile."),
            baseQuestion("entityTypeMatches", "Entity type matches the company profile", 10, { type: "EQUALS", expectedValue: true }, "The entity type is inconsistent.", "Cross-check the company type."),
            baseQuestion("panMatches", "PAN or identity reference is consistent", 10, { type: "EQUALS", expectedValue: true }, "Identity references are inconsistent.", "Confirm the profile and document match."),
            baseQuestion("gstMatchesOptional", "GST or tax details are consistent where present", 10, { type: "EQUALS", expectedValue: true }, "Tax information is inconsistent.", "Confirm GST details where they are provided.", { required: false, mandatory: false }),
            baseQuestion("entityCurrent", "Document appears current and valid", 10, { type: "EQUALS", expectedValue: true }, "Entity proof appears outdated or incomplete.", "Use current legal-entity proof."),
            baseQuestion("entityReady", "Legal entity stage is complete", 10, { type: "EQUALS", expectedValue: true }, "The legal-entity stage is not ready.", "Complete the identity validation before moving on.", { needsManualReview: true })
        ]
    },
    {
        code: "PREMISES_DOCUMENT",
        name: "Premises ownership or lease evidence",
        approvalCode: "DRUG_MFG_CONVENTIONAL_FORMULATION_DEMO",
        industry: "Pharmaceutical finished formulations",
        mandatory: true,
        description: "Proof of site ownership, lease, or possession for the manufacturing unit.",
        source: { title: "Premises and location evidence", url: "https://fda.maharashtra.gov.in/", lastVerified: new Date("2026-09-08"), confidence: "High" },
        questions: [
            baseQuestion("premisesUploaded", "Premises evidence uploaded", 10, { type: "EQUALS", expectedValue: true }, "Premises evidence is missing.", "Upload the land or lease document."),
            baseQuestion("premisesReadable", "Premises evidence is readable", 10, { type: "EQUALS", expectedValue: true }, "The document is too unclear to validate.", "Ensure the file is clearly legible."),
            baseQuestion("siteIdentified", "Manufacturing site is clearly identified", 10, { type: "EQUALS", expectedValue: true }, "The site is not clearly identified.", "Confirm that the document identifies the intended site."),
            baseQuestion("plotMatches", "Plot or property reference matches the Information Vault", 10, { type: "EQUALS", expectedValue: true }, "The plot or property reference is inconsistent.", "Correct the plot number or site record."),
            baseQuestion("districtMatches", "District and state match the site profile", 10, { type: "EQUALS", expectedValue: true }, "Site district or state is inconsistent.", "Align the site profile with the premises document."),
            baseQuestion("leaseCurrent", "Lease or possession is valid for the application date", 10, { type: "EQUALS", expectedValue: true }, "The premises document appears expired or invalid for the application date.", "Use a current lease or valid possession document."),
            baseQuestion("premisesSigned", "Premises document is executed or signed where required", 10, { type: "EQUALS", expectedValue: true }, "Execution or signature evidence is incomplete.", "Ensure the document is completed as required."),
            baseQuestion("premisesComplete", "Premises evidence includes all relevant pages", 10, { type: "EQUALS", expectedValue: true }, "Relevant pages are missing from the premises evidence.", "Upload a complete copy of the premises evidence."),
            baseQuestion("sitePrepared", "Site readiness is documented", 10, { type: "EQUALS", expectedValue: true }, "The site readiness status is not yet established.", "Confirm the site is suitable for the planned manufacturing operation."),
            baseQuestion("premisesReady", "Premises evidence stage is complete", 10, { type: "EQUALS", expectedValue: true }, "Premises evidence is not yet adequate for the filing package.", "Resolve the premises inconsistencies before continuing.", { needsManualReview: true })
        ]
    },
    {
        code: "PREMISES_LAYOUT",
        name: "Premises layout or blueprint",
        approvalCode: "DRUG_MFG_CONVENTIONAL_FORMULATION_DEMO",
        industry: "Pharmaceutical finished formulations",
        mandatory: true,
        description: "Blueprint, site layout, and area allocation for the proposed facility.",
        source: { title: "Layout and facility-readiness evidence", url: "https://fda.maharashtra.gov.in/", lastVerified: new Date("2026-09-08"), confidence: "High" },
        questions: [
            baseQuestion("layoutUploaded", "Layout or blueprint uploaded", 10, { type: "EQUALS", expectedValue: true }, "The premises layout is missing.", "Upload the site plan or building layout."),
            baseQuestion("layoutReadable", "Layout is readable and complete", 10, { type: "EQUALS", expectedValue: true }, "The layout is not suitable for review.", "Ensure the drawing is legible and complete."),
            baseQuestion("layoutMatchesSite", "Layout matches the site in the Information Vault", 10, { type: "EQUALS", expectedValue: true }, "The layout does not match the declared site.", "Align the layout with the site record."),
            baseQuestion("layoutAreasShown", "Manufacturing, storage and QC areas are shown", 10, { type: "EQUALS", expectedValue: true }, "The core layout areas are not depicted.", "Mark manufacturing, storage, and QC areas clearly."),
            baseQuestion("layoutAccessShown", "Access and movement routes are shown", 10, { type: "EQUALS", expectedValue: true }, "Access and movement routes are missing.", "Show internal movement and access paths clearly."),
            baseQuestion("layoutNoConflicts", "Layout has no obvious conflicts with the process scope", 10, { type: "EQUALS", expectedValue: true }, "The layout conflicts with the process scope.", "Review the layout against the intended process and site."),
            baseQuestion("layoutProfessionalReview", "Professional technical review declaration is complete", 10, { type: "EQUALS", expectedValue: true }, "Professional review has not been completed.", "Obtain the required technical review declaration.", { needsManualReview: true }),
            baseQuestion("layoutCoversProduct", "Layout covers the selected product and dosage-form scope", 10, { type: "EQUALS", expectedValue: true }, "The facility layout does not match the selected product scope.", "Confirm the layout supports the intended formulation scope."),
            baseQuestion("layoutCurrent", "Layout is current and project-specific", 10, { type: "EQUALS", expectedValue: true }, "The layout must be specific to the current project.", "Use a project-specific layout or update the current one."),
            baseQuestion("layoutReady", "Layout stage is complete", 10, { type: "EQUALS", expectedValue: true }, "The layout stage is not yet complete.", "Resolve the layout issues before progressing.", { needsManualReview: true })
        ]
    },
    {
        code: "EQUIPMENT_LIST",
        name: "Equipment and machinery list",
        approvalCode: "DRUG_MFG_CONVENTIONAL_FORMULATION_DEMO",
        industry: "Pharmaceutical finished formulations",
        mandatory: true,
        description: "List of machinery and equipment for the proposed formulation site.",
        source: { title: "Equipment and capability evidence", url: "https://cdsco.gov.in/", lastVerified: new Date("2026-09-08"), confidence: "Medium" },
        questions: [
            baseQuestion("equipmentUploaded", "Equipment list uploaded", 10, { type: "EQUALS", expectedValue: true }, "The equipment list is missing.", "Upload the equipment and machinery list."),
            baseQuestion("equipmentReadable", "Equipment list is readable", 10, { type: "EQUALS", expectedValue: true }, "The equipment list is not readable.", "Upload a clean version of the equipment list."),
            baseQuestion("equipmentDetailsCovered", "Equipment names and quantities are listed", 10, { type: "EQUALS", expectedValue: true }, "The details are not complete.", "Add each major equipment item and quantity."),
            baseQuestion("equipmentMatchesProduct", "Equipment matches the selected product scope", 10, { type: "EQUALS", expectedValue: true }, "The equipment scope does not suit the selected dosage-form route.", "Check that the equipment matches the selected formulation operation."),
            baseQuestion("equipmentMatchesSite", "Equipment is linked to the site", 10, { type: "EQUALS", expectedValue: true }, "The equipment list does not identify the site.", "Map the equipment to the intended site or area."),
            baseQuestion("equipmentProcessCoverage", "Main manufacturing steps are covered", 10, { type: "EQUALS", expectedValue: true }, "Key process steps are missing.", "Ensure the equipment can support the proposed process."),
            baseQuestion("equipmentReview", "Technical review of equipment suitability is complete", 10, { type: "EQUALS", expectedValue: true }, "Equipment suitability has not been reviewed.", "Confirm the equipment is appropriate for the proposed formulation route.", { needsManualReview: true }),
            baseQuestion("equipmentCurrent", "Equipment list is current for the project", 10, { type: "EQUALS", expectedValue: true }, "The equipment list is outdated or incomplete.", "Update the list to reflect the current operation."),
            baseQuestion("equipmentStatus", "Equipment readiness status is clear", 10, { type: "EQUALS", expectedValue: true }, "Equipment readiness is not yet clear.", "Confirm whether the equipment is existing, planned, or installed."),
            baseQuestion("equipmentStageComplete", "Equipment stage is complete", 10, { type: "EQUALS", expectedValue: true }, "The equipment stage is not complete.", "Resolve the equipment inconsistencies before continuing.", { needsManualReview: true })
        ]
    },
    {
        code: "TECHNICAL_STAFF_EVIDENCE",
        name: "Technical staff qualification and appointment evidence",
        approvalCode: "DRUG_MFG_CONVENTIONAL_FORMULATION_DEMO",
        industry: "Pharmaceutical finished formulations",
        mandatory: true,
        description: "Evidence of technical and quality personnel for the manufacturing site.",
        source: { title: "Technical staff evidence", url: "https://fda.maharashtra.gov.in/", lastVerified: new Date("2026-09-08"), confidence: "High" },
        questions: [
            baseQuestion("staffProofUploaded", "Technical staff evidence uploaded", 10, { type: "EQUALS", expectedValue: true }, "Technical staff records are missing.", "Upload qualification and appointment evidence."),
            baseQuestion("staffReadable", "Staff documents are readable", 10, { type: "EQUALS", expectedValue: true }, "Staff documents are not readable.", "Upload legible qualification and appointment records."),
            baseQuestion("staffNamesMatch", "Staff identity matches the application", 10, { type: "EQUALS", expectedValue: true }, "Staff names are inconsistent.", "Match each person to the application and records."),
            baseQuestion("qualificationsShown", "Qualifications and awarding institutions are shown", 10, { type: "EQUALS", expectedValue: true }, "Qualifications are not clearly evidenced.", "Add qualification details and institutions."),
            baseQuestion("appointmentsShown", "Appointment or engagement details are shown", 10, { type: "EQUALS", expectedValue: true }, "The appointment record is not present.", "Upload the appointment or employment evidence."),
            baseQuestion("staffRoleMatches", "Role aligns with the proposed manufacturing scope", 10, { type: "EQUALS", expectedValue: true }, "Staff roles are not aligned with the site scope.", "Confirm that the proposed technical personnel match the scope."),
            baseQuestion("staffReview", "Technical review of staffing appropriateness is complete", 10, { type: "EQUALS", expectedValue: true }, "Staffing adequacy has not yet been reviewed.", "Have the technical staff reviewed against the route requirements.", { needsManualReview: true }),
            baseQuestion("staffCurrent", "Appointment evidence is current", 10, { type: "EQUALS", expectedValue: true }, "The appointment evidence appears outdated.", "Use current appointment or engagement documents."),
            baseQuestion("staffResponsibilityClear", "Responsibilities are clear and assigned", 10, { type: "EQUALS", expectedValue: true }, "Responsibilities are not sufficiently defined.", "Clarify the responsibilities of each person."),
            baseQuestion("staffReady", "Technical staffing stage is complete", 10, { type: "EQUALS", expectedValue: true }, "The technical staffing stage is not complete.", "Resolve staffing concerns before proceeding.", { needsManualReview: true })
        ]
    },
    {
        code: "QC_ARRANGEMENT",
        name: "Quality-control facility or testing arrangement",
        approvalCode: "DRUG_MFG_CONVENTIONAL_FORMULATION_DEMO",
        industry: "Pharmaceutical finished formulations",
        mandatory: true,
        description: "Quality-control arrangement and testing readiness for the operation.",
        source: { title: "QC arrangement evidence", url: "https://cdsco.gov.in/", lastVerified: new Date("2026-09-08"), confidence: "High" },
        questions: [
            baseQuestion("qcUploaded", "QC arrangement document uploaded", 10, { type: "EQUALS", expectedValue: true }, "QC arrangement evidence is missing.", "Upload the QC or testing arrangement document."),
            baseQuestion("qcReadable", "QC arrangement is readable", 10, { type: "EQUALS", expectedValue: true }, "The document is not readable.", "Use a clear, legible copy of the QC arrangement."),
            baseQuestion("qcScopeShown", "QC scope is described clearly", 10, { type: "EQUALS", expectedValue: true }, "The QC scope is not sufficiently described.", "Describe the quality-control scope and arrangement."),
            baseQuestion("qcMatchesSite", "QC arrangement matches the site or approved testing arrangement", 10, { type: "EQUALS", expectedValue: true }, "The QC arrangement does not match the site or selected testing set-up.", "Correct the QC arrangement to the actual site setup."),
            baseQuestion("qcMatchesProduct", "QC arrangement matches the selected product category", 10, { type: "EQUALS", expectedValue: true }, "The QC arrangement is not aligned with the product being handled.", "Check that key tests align with the product type."),
            baseQuestion("qcReview", "Qualified reviewer confirms QC readiness", 10, { type: "EQUALS", expectedValue: true }, "QC readiness has not been reviewed.", "Have the QC arrangement reviewed by a qualified professional.", { needsManualReview: true }),
            baseQuestion("qcCurrent", "QC arrangement is current", 10, { type: "EQUALS", expectedValue: true }, "The QC arrangement appears outdated.", "Use a current QC arrangement or the current version of the arrangement."),
            baseQuestion("qcResponsibilities", "Responsibilities are assigned for QC and QA activities", 10, { type: "EQUALS", expectedValue: true }, "Responsibilities are unclear.", "Describe who undertakes QC and QA responsibilities."),
            baseQuestion("qcActionPlan", "Action plan exists for deficiencies if needed", 10, { type: "EQUALS", expectedValue: true }, "A clear corrective action plan is not in place.", "Document the remediation plan if deficiencies exist."),
            baseQuestion("qcReady", "QC readiness stage is complete", 10, { type: "EQUALS", expectedValue: true }, "QC readiness is incomplete.", "Resolve QC issues before completing the package.", { needsManualReview: true })
        ]
    },
    {
        code: "GMP_READINESS",
        name: "GMP or Schedule M readiness evidence",
        approvalCode: "DRUG_MFG_CONVENTIONAL_FORMULATION_DEMO",
        industry: "Pharmaceutical finished formulations",
        mandatory: true,
        description: "Readiness evidence for GMP and quality-system compliance for the site.",
        source: { title: "GMP and Schedule M readiness", url: "https://fda.maharashtra.gov.in/", lastVerified: new Date("2026-09-08"), confidence: "High" },
        questions: [
            baseQuestion("gmpUploaded", "GMP readiness evidence uploaded", 10, { type: "EQUALS", expectedValue: true }, "GMP readiness evidence is missing.", "Upload the GMP or Schedule M readiness package."),
            baseQuestion("gmpReadable", "GMP evidence is readable and complete", 10, { type: "EQUALS", expectedValue: true }, "The GMP evidence is not readable or complete.", "Ensure the file is readable and complete."),
            baseQuestion("gmpSiteMatches", "GMP evidence matches the site profile", 10, { type: "EQUALS", expectedValue: true }, "The GMP evidence does not match the site profile.", "Correct the GMP evidence to the actual site record."),
            baseQuestion("gmpScopeMatches", "GMP evidence matches the selected formulation scope", 10, { type: "EQUALS", expectedValue: true }, "The GMP package does not match the selected route.", "Ensure the GMP evidence is aligned to the conventional formulation route."),
            baseQuestion("sopsIncluded", "SOPs or quality-system references are included", 10, { type: "EQUALS", expectedValue: true }, "SOPs or system references are missing.", "Include the required quality-system references."),
            baseQuestion("gmpReview", "Qualified quality review is complete", 10, { type: "EQUALS", expectedValue: true }, "The quality-system review is incomplete.", "Have the GMP readiness reviewed by a qualified reviewer.", { needsManualReview: true }),
            baseQuestion("gmpCurrent", "GMP readiness evidence is current", 10, { type: "EQUALS", expectedValue: true }, "The GMP evidence appears outdated.", "Use the current quality-system package."),
            baseQuestion("gmpResponsibility", "Responsibilities for quality processes are defined", 10, { type: "EQUALS", expectedValue: true }, "Responsibility mapping is unclear.", "Define responsibilities for quality processes."),
            baseQuestion("gmpControls", "Quality controls and corrective actions are identified", 10, { type: "EQUALS", expectedValue: true }, "The quality controls are not clearly documented.", "Document the controls and corrective actions required."),
            baseQuestion("gmpReady", "GMP readiness stage is complete", 10, { type: "EQUALS", expectedValue: true }, "The GMP readiness stage is not complete.", "Resolve the remaining readiness issues before completing the package.", { needsManualReview: true })
        ]
    },
    {
        code: "PRODUCT_FORMULATION_LIST",
        name: "Product or formulation list",
        approvalCode: "DRUG_MFG_CONVENTIONAL_FORMULATION_DEMO",
        industry: "Pharmaceutical finished formulations",
        mandatory: true,
        description: "List of the proposed conventional products within the selected route.",
        source: { title: "Product classification and route confirmation", url: "https://cdsco.gov.in/opencms/opencms/en/Drugs/New-Drugs/", lastVerified: new Date("2026-09-08"), confidence: "High" },
        questions: [
            baseQuestion("productListUploaded", "Product or formulation list uploaded", 10, { type: "EQUALS", expectedValue: true }, "The product list is missing.", "Upload the list of proposed products."),
            baseQuestion("productListReadable", "Product list is readable", 10, { type: "EQUALS", expectedValue: true }, "The product list is not readable.", "Upload a readable product list."),
            baseQuestion("productNamesVisible", "Product names or formulations are visible", 10, { type: "EQUALS", expectedValue: true }, "The product names are not visible.", "List each intended formulation clearly."),
            baseQuestion("productCategoryMatches", "Product category matches the conventional formulation scenario", 10, { type: "EQUALS", expectedValue: true }, "The listed products do not match the selected scenario.", "Ensure the products are in the selected conventional non-biological route."),
            baseQuestion("notNewDrug", "No listed product is a separate new-drug route", 10, { type: "EQUALS", expectedValue: true }, "The product may require a separate route or additional approval.", "Review whether any listed product triggers a different regulatory path."),
            baseQuestion("productScopeAligned", "Product scope aligns with manufacturing capability", 10, { type: "EQUALS", expectedValue: true }, "The stated product scope is not aligned to the equipment and site.", "Align the product list with the facility capability."),
            baseQuestion("productProcessAligned", "Product scope aligns with process and equipment design", 10, { type: "EQUALS", expectedValue: true }, "The process and equipment design do not reflect the listed products.", "Confirm the product list matches the process design."),
            baseQuestion("productReview", "Route review for product scope is complete", 10, { type: "EQUALS", expectedValue: true }, "The route review is incomplete.", "Conduct the product-scope route review before filing.", { needsManualReview: true }),
            baseQuestion("productCurrent", "Product list is current for the application", 10, { type: "EQUALS", expectedValue: true }, "The product list is not current.", "Use a current product list for this application."),
            baseQuestion("productReady", "Product route and scope stage is complete", 10, { type: "EQUALS", expectedValue: true }, "The product route and scope stage is incomplete.", "Resolve any route or product-scope issues before submission.", { needsManualReview: true })
        ]
    },
    {
        code: "FEE_RECEIPT",
        name: "Official application fee receipt",
        approvalCode: "DRUG_MFG_CONVENTIONAL_FORMULATION_DEMO",
        industry: "Pharmaceutical finished formulations",
        mandatory: true,
        description: "Payment evidence for the relevant filing stage.",
        source: { title: "Current official payment evidence", url: "https://fda.maharashtra.gov.in/", lastVerified: new Date("2026-09-08"), confidence: "Medium" },
        questions: [
            baseQuestion("feeReceiptUploaded", "Payment evidence uploaded", 10, { type: "EQUALS", expectedValue: true }, "Payment evidence is missing.", "Upload the official fee receipt or payment proof."),
            baseQuestion("feeReceiptReadable", "Payment record is readable", 10, { type: "EQUALS", expectedValue: true }, "The payment evidence is not readable.", "Use a legible copy of the payment receipt."),
            baseQuestion("feeMatchesApplication", "Payment reference matches the application being filed", 10, { type: "EQUALS", expectedValue: true }, "The payment record does not align with the application.", "Confirm the application reference is correct."),
            baseQuestion("feeCompanyMatches", "Applicant name matches the payment record", 10, { type: "EQUALS", expectedValue: true }, "The applicant name does not match the payment record.", "Check the payment record against the applicant profile."),
            baseQuestion("feeOfficialRoute", "Payment was made through the official route", 10, { type: "EQUALS", expectedValue: true }, "The route of payment is not yet confirmed.", "Confirm the payment was made through the official service route."),
            baseQuestion("feeCurrent", "Payment is for the current application", 10, { type: "EQUALS", expectedValue: true }, "The payment is not clearly tied to the current application.", "Use the current application payment record."),
            baseQuestion("feePrepared", "Fee stage is prepared for filing", 10, { type: "EQUALS", expectedValue: true }, "The fee stage is not complete.", "Resolve the fee issues before submission."),
            baseQuestion("feeReview", "Payment review is complete", 10, { type: "EQUALS", expectedValue: true }, "The payment review is incomplete.", "Review the payment details before filing.", { needsManualReview: true }),
            baseQuestion("feeConcluded", "Official payment check concluded", 10, { type: "EQUALS", expectedValue: true }, "Payment verification is incomplete.", "Verify the payment record and reference before filing."),
            baseQuestion("feeSubmissionReady", "Final filing step is ready", 10, { type: "EQUALS", expectedValue: true }, "Final submission readiness is not confirmed.", "Only mark this as ready after payment and filing checks are complete.", { needsManualReview: true })
        ]
    }
];

const approval = {
    code: "DRUG_MFG_CONVENTIONAL_FORMULATION_DEMO",
    name: "Manufacturing licence preparation for conventional non-biological, non-Schedule-X allopathic finished formulations",
    authority: "Maharashtra Food and Drug Administration / state licensing authority context",
    industry: "Pharmaceutical finished formulations",
    stage: "Application preparation",
    description: "Prototype readiness workflow for a new Maharashtra private limited company preparing a manufacturing licence application for conventional non-biological, non-Schedule-X allopathic finished formulations at a single site.",
    requiredDocumentCodes: templates.map(template => template.code),
    source: {
        title: "Maharashtra FDA / CDSCO framework and route selection",
        url: "https://fda.maharashtra.gov.in/",
        lastVerified: new Date("2026-09-08"),
        confidence: "Partially verified; current official service checklist must be confirmed before filing.",
        note: "This data is a deterministic application-preparation configuration and not a legal approval decision."
    },
    disclaimer: "This configuration reflects the selected conventional formulation manufacturing scenario and is not a legal approval decision. Confirm the current Maharashtra FDA service checklist before filing."
};

const legacyApproval = {
    ...approval,
    code: "MPCB_CTE_PHARMA",
    name: "Legacy MPCB CTE compatibility alias",
    description: "Compatibility alias for the earlier demo flow. Kept for older front-end integrations while the selected scenario is used as the default.",
    requiredDocumentCodes: templates.map(template => template.code)
};

module.exports = { approval, legacyApproval, templates };
