const Document = require("../models/Document");
const Business = require("../models/Business");
const DocumentTemplate = require("../models/DocumentTemplate");
const VerificationResult = require("../models/ReadinessEvaluation");
const { approval, templates } = require("../utils/readinessTemplates");

const selfAssessmentQuestions = [
    ["basicQ1", "Have you identified the drugs/products you intend to manufacture?", "Identify the proposed products before filing."],
    ["basicQ2", "Have you identified the proposed manufacturing premises?", "Confirm the proposed manufacturing premises."],
    ["basicQ3", "Is the ownership/constitution of the applicant or manufacturing business documented?", "Document the applicant ownership or constitution."],
    ["basicQ4", "Is the proposed manufacturing site plan/layout available?", "Provide the proposed site plan or layout."],
    ["basicQ5", "Have you provided the basic information required for the manufacturing licence application?", "Complete the basic manufacturing licence information."],
    ["normalQ1", "Are qualified technical personnel available for the proposed manufacturing activities?", "Confirm qualified technical personnel are available."],
    ["normalQ2", "Are the required manufacturing areas and equipment available for the proposed products?", "Confirm the required areas and equipment are available."],
    ["normalQ3", "Are suitable laboratory and quality-control arrangements available for testing the manufactured products?", "Document suitable laboratory and quality-control arrangements."],
    ["normalQ4", "Are appropriate storage facilities and arrangements available for raw materials and finished products?", "Confirm suitable raw-material and finished-product storage."],
    ["normalQ5", "Are the required manufacturing, testing, quality-control, and supporting records available for regulatory verification?", "Make the required records available for verification."],
    ["criticalQ1", "Has the applicant disclosed complete and accurate information about the manufacturing premises and proposed activities?", "Review the disclosure for completeness and accuracy."],
    ["criticalQ2", "Does the proposed manufacturing facility have systems for maintaining the required quality and manufacturing records?", "Establish systems for required quality and manufacturing records."],
    ["criticalQ3", "Is the facility prepared to undergo inspection or verification by the competent regulatory authority, where required?", "Prepare the facility for regulatory inspection or verification."],
    ["criticalQ4", "Can the applicant address and comply with observations or deficiencies identified during regulatory inspection or review?", "Prepare a process for addressing regulatory observations."],
    ["criticalQ5", "Does the proposed manufacturing facility comply with the applicable regulatory and Good Manufacturing Practice (GMP) requirements for the proposed manufacturing activity?", "Verify applicable regulatory and GMP compliance before filing."]
].map(([id, label, recommendation], index) => ({
    id,
    label,
    type: "radio",
    required: true,
    weight: 100 / 15,
    validation: { type: "EQUALS", expectedValue: true },
    failureMessage: "This preliminary self-assessment item is not confirmed.",
    recommendation,
    level: index < 5 ? "basic" : index < 10 ? "normal" : "critical",
    criticalIfNo: index >= 10,
    needsManualReview: false
}));

async function findTemplate(document) {
    const configuredTemplate = templates.find(template => template.code === document.documentCode)
        || templates.find(template => template.name === document.documentType)
        || templates.find(template => template.name === document.documentName);
    return configuredTemplate || DocumentTemplate.findOne({
        $or: [
            { code: document.documentCode },
            { name: document.documentType },
            { name: document.documentName }
        ]
    }).lean();
}

function evaluateQuestion(question, inputs) {
    const actualValue = inputs?.[question.id];
    const passed = question.validation?.type === "EQUALS"
        ? actualValue === question.validation.expectedValue
        : Boolean(actualValue);

    return {
        id: question.id,
        label: question.label,
        passed,
        required: question.required !== false,
        weight: question.weight,
        failureMessage: passed ? null : question.failureMessage,
        recommendation: passed ? null : question.recommendation,
        level: question.level,
        criticalIfNo: question.criticalIfNo,
        needsManualReview: question.needsManualReview
    };
}

async function checkDocument(documentId, businessId, options = {}) {
    const document = await Document.findById(documentId);
    if (!document) throw new Error("Document not found.");

    const business = businessId ? await Business.findById(businessId) : null;
    const template = await findTemplate(document);
    if (!template) throw new Error("No readiness template is configured for this document.");

    const inputs = options.userInputs || document.userInputs || document.manualFields || {};
    const submittedQuestions = Array.isArray(inputs._questions) ? inputs._questions : null;
    const questions = submittedQuestions?.length
        ? submittedQuestions.map((question, index) => ({
            id: question.id,
            label: question.label,
            validation: { type: "EQUALS", expectedValue: true },
            failureMessage: "This preliminary self-assessment item is not confirmed.",
            recommendation: "Review this item and confirm it before filing.",
            level: question.level || (index < 5 ? "basic" : index < 10 ? "normal" : "critical"),
            criticalIfNo: question.level === "critical" || index >= 10,
            needsManualReview: false,
            weight: 10
        }))
        : selfAssessmentQuestions.every(question => Object.prototype.hasOwnProperty.call(inputs, question.id))
            ? selfAssessmentQuestions
            : template.questions;
    const checks = questions.map(question => evaluateQuestion(question, inputs));
    const passedChecks = checks.filter(check => check.passed).length;
    const issues = checks
        .filter(check => !check.passed)
        .map(check => ({
            id: check.id,
            label: check.label,
            message: check.failureMessage,
            action: check.recommendation,
            level: check.level,
            critical: check.criticalIfNo
        }));
    const hasCriticalIssue = issues.some(issue => issue.critical);
    const completenessScore = hasCriticalIssue ? 0 : checks.length ? Math.round((passedChecks / checks.length) * 100) : 0;
    const hasManualReview = checks.some(check => check.needsManualReview && !check.passed);
    const status = hasCriticalIssue
        ? "NOT_READY"
        : completenessScore === 100
        ? (hasManualReview ? "NEEDS_MANUAL_REVIEW" : "READY")
        : completenessScore >= 80 ? "NEEDS_MINOR_FIXES" : "NOT_READY";
    const recommendations = [...new Set(issues.map(issue => issue.action).filter(Boolean))];

    const result = await VerificationResult.findOneAndUpdate(
        { documentId: document._id },
        {
            documentId: document._id,
            businessId: business?._id || document.businessId,
            approvalCode: document.approvalCode || template.approvalCode || approval.code,
            documentCode: template.code,
            completenessScore,
            overallScore: completenessScore,
            status,
            checks,
            issues,
            recommendations,
            disclaimer: "This is a preliminary self-assessment and not an actual government approval test. Confirm the current requirements with the competent regulatory authority.",
            source: template.source,
            lastVerified: template.source?.lastVerified,
            disclaimers: [approval.disclaimer],
            calculation: { passedChecks, totalChecks: checks.length }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return result.toObject();
}

module.exports = { checkDocument };
