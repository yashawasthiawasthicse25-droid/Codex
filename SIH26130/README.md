# ApprovalGuard

ApprovalGuard is a Maharashtra pharmaceutical approval-readiness prototype. It stores business profiles, accepts approval documents, validates extracted fields, and returns a readiness score with issues and recommendations.

## Project overview

This project combines a Node.js/Express backend with a browser-based frontend for documenting and checking readiness for pharmaceutical approvals. The application supports business-profile creation, document upload, checklist-based verification, and approval readiness reporting.

## Run locally

1. Install dependencies with `npm install` and `cd Backend; npm install`.
2. Copy `Backend/.env.example` to `Backend/.env` and set `MONGO_URI`.
3. Start MongoDB.
4. Run `npm start`.
5. Open `http://localhost:5000/document-vault.html`.

## API highlights

The frontend is served by Express. Supported uploads are PDF, JPG, and PNG files up to 20MB.

Key endpoints include:
- `/api/documents/upload` and legacy aliases `/upload-and-verify` and `/upload-and-check`
- `/api/documents/:documentId/checklist`
- `/api/approvals/MPCB_CTE_PHARMA`
- `/api/document-templates/:documentCode`
- `/api/approvals/:approvalCode/readiness-report?businessId=...`
- `/api/documents/verification/:documentId`
- `/api/documents/re-verify/:documentId`
- `/api/documents/business/:businessProfileId`

Results are deterministic, rule-based completeness checklists and do not replace official authority review.
