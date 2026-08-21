document.getElementById("saveButton").addEventListener("click", saveApplication);

async function saveApplication() {
    const companyName = document.getElementById("companyInput").value.trim();
    const jobTitle = document.getElementById("jobTitleInput").value.trim();
    const status = document.getElementById("statusInput").value;
    const message = document.getElementById("message");

    if (!companyName || !jobTitle) {
        message.textContent = "Please enter a company and job title.";
        return;
    }

    const application = {
        company: {
            name: companyName
        },
        jobTitle: jobTitle,
        status: status,
        dateApplied: new Date().toISOString().split("T")[0]
    };

    try {
        const response = await fetch("http://localhost:8080/api/applications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(application)
        });

        if (!response.ok) {
            const errorText = await response.text();

            console.error("Status:", response.status);
            console.error("Backend response:", errorText);

            throw new Error(
                `Failed to save application: ${response.status} ${errorText}`
            );
        }

        message.textContent = "Saved!";

        document.getElementById("companyInput").value = "";
        document.getElementById("jobTitleInput").value = "";

    } catch (error) {
        console.error(error);
        message.textContent = "Could not connect to tracker.";
    }
}

