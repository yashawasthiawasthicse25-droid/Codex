const form = document.getElementById("businessForm");
const informationVaultKey = "approvalguard.information-vault.business.v3";
const verifiedSeedKey = "approvalguard.information-vault.verified-seed.v1";
const verifiedDefaults = {
    business_name: "Sahyadri Pharma Solutions Pvt. Ltd.", business_type: "Private Limited Company", industry: "Pharmaceutical Manufacturing", business_stage: "Expansion",
    business_description: "Manufacturing generic pharmaceutical formulations and healthcare products for domestic markets.", registration_number: "U24239MH2024PTC123456", gstin: "27AABCS1234F1Z5", pan: "AABCS1234F", udyam_registration_number: "UDYAM-MH-18-0012345",
    address: "Plot 42, MIDC Industrial Area, Waluj", state: "Maharashtra", district: "Aurangabad", pin_code: "431136", plot_number: "42-B", land_area: "2.5", total_investment: "85000000", annual_turnover: "42000000", investment_in_machinery: "50000000",
    current_employees: "48", expected_employees: "75", skilled_employees: "32", owner_name: "Ananya Deshmukh", authorized_person: "Rahul Patil", email: "rahul.patil@sahyadripharma.example", phone_number: "9876543210"
};

function autofillFromInformationVault() {
    try {
        const records = JSON.parse(localStorage.getItem(informationVaultKey) || "{}");
        if (!localStorage.getItem(verifiedSeedKey)) {
            Object.entries(verifiedDefaults).forEach(([key, fieldValue]) => {
                records[key] = { fieldName: key, fieldValue, verificationStatus: "Verified", lastUpdated: "2026-09-20T12:00:00.000Z" };
            });
            localStorage.setItem(informationVaultKey, JSON.stringify(records));
            localStorage.setItem(verifiedSeedKey, "true");
        }
        const values = Object.fromEntries(Object.entries(records).map(([key, record]) => [key, String(record.fieldValue || "").trim()]));
        const profileValues = {
            businessName: values.business_name,
            businessType: values.business_type === "Private Limited Company" ? "private_limited_company" : values.business_type,
            businessStage: values.business_stage.toLowerCase(),
            industry: values.industry.toLowerCase().includes("pharmaceutical") ? "pharmaceutical" : values.industry,
            subIndustry: values.industry,
            state: values.state,
            district: values.district,
            investment: values.total_investment,
            landArea: values.land_area,
            employees: values.current_employees,
            turnover: values.annual_turnover,
            contactPerson: values.owner_name,
            phone: values.phone_number,
            email: values.email,
            website: "https://sahyadripharma.example"
        };
        Object.entries(profileValues).forEach(([id, value]) => {
            const field = document.getElementById(id);
            if (field && value) field.value = value;
        });
    } catch (error) {
        console.warn("Information Vault values could not be loaded into the profile form.", error);
    }
}

const requiredFields = [
    "businessName",
    "businessType",
    "businessStage",
    "industry",
    "state",
    "district",
    "investment",
    "landArea",
    "employees",
    "contactPerson",
    "phone",
    "email"
];

function updateProgress() {
    let completed = 0;

    requiredFields.forEach(id => {
        const field = document.getElementById(id);

        if (field && field.value.trim() !== "") {
            completed++;
        }
    });

    const percentage = Math.round(
        (completed / requiredFields.length) * 100
    );

    document.getElementById("progressFill").style.width =
        `${percentage}%`;

    document.getElementById("progressText").textContent =
        `${percentage}% Complete`;
}

requiredFields.forEach(id => {
    const field = document.getElementById(id);

    if (field) {
        field.addEventListener("change", updateProgress);
        field.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                updateProgress();
            }
        });
    }
});

autofillFromInformationVault();
updateProgress();

const deleteProfileButton = document.getElementById("deleteProfileButton");

deleteProfileButton.addEventListener("click", async function () {

    const confirmed = window.confirm(
        "Delete the most recently saved business profile? This will also clear its readiness progress and vault documents from this browser."
    );

    if (!confirmed) return;

    deleteProfileButton.disabled = true;
    deleteProfileButton.textContent = "Deleting...";

    try {

        const response = await fetch(
            `${window.APPROVAL_GUARD_URL}/api/business/latest`,
            { method: "DELETE" }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to delete profile");
        }

        localStorage.removeItem("sih26130_completed");
        localStorage.removeItem("sih26130_document_vault");
        alert("Business profile deleted successfully.");
        window.location.href = "application.html";

    } catch (error) {

        alert("Unable to delete profile.\n\n" + error.message);
        deleteProfileButton.disabled = false;
        deleteProfileButton.innerHTML = '<i data-lucide="trash-2"></i> Delete Existing Profile';
        lucide.createIcons();

    }

});


form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const submitButton = document.getElementById("submitButton");

    // Prevent double clicking
    submitButton.disabled = true;
    submitButton.querySelector("span").textContent = "Saving...";

    const businessData = {

        businessName: document.getElementById("businessName").value.trim(),

        businessType: document.getElementById("businessType").value,

        businessStage: document.getElementById("businessStage").value,

        industry: document.getElementById("industry").value,

        subIndustry: document.getElementById("subIndustry").value.trim(),

        state: document.getElementById("state").value,

        district: document.getElementById("district").value,

        investment: Number(
            document.getElementById("investment").value
        ),

        landArea: Number(
            document.getElementById("landArea").value
        ),

        employees: Number(
            document.getElementById("employees").value
        ),

        turnover: Number(
            document.getElementById("turnover").value || 0
        ),

        contactPerson: document.getElementById("contactPerson").value.trim(),

        phone: document.getElementById("phone").value.trim(),

        email: document.getElementById("email").value.trim(),

        website: document.getElementById("website").value.trim()

    };


    try {

        console.log("Sending business data:", businessData);

        const response = await fetch(
            `${window.APPROVAL_GUARD_URL}/api/business`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(businessData)
            }
        );


        const result = await response.json();

        console.log("Server response:", result);


        if (!response.ok) {

            throw new Error(
                result.message || "Failed to save business profile"
            );

        }


        if (result.success) {

            console.log("Business saved successfully:", result.business);

            // Show success message
            document
                .getElementById("successMessage")
                .classList.add("show");


            // Change button text
            submitButton.querySelector("span").textContent =
                "Saved Successfully";


            /*
             * CONTINUE TO NEXT PAGE
             *
             * Change this filename when you create
             * your next page.
             */
            setTimeout(() => {

                window.location.href = "application.html";

            }, 1500);

        }

    } catch (error) {

        console.error("Save error:", error);

        alert(
            "Unable to save profile.\n\n" +
            error.message
        );

        submitButton.disabled = false;

        submitButton.querySelector("span").textContent =
            "Save & Continue";

    }

});