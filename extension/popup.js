document.getElementById("saveButton").addEventListener("click", saveApplication);

async function autofillJobInfo() {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },

        func: () => {
            const pageText = document.body.innerText;

            // 1. Detect successful application
            const submittedMatch = pageText.match(
                /Your application was submitted to\s+([^\n]+)/i
            );

            if (submittedMatch) {
                return {
                    type: "confirmation",
                    companyName: submittedMatch[1].trim()
                };
            }

            // 2. Detect already-applied page
            if (/already applied/i.test(pageText)) {
                return {
                    type: "alreadyApplied"
                };
            }

            // 3. Try to extract normal job posting
            const jobTitleElement =
                document.querySelector("#ia-JobHeader-title") ||
                document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]');

            const companyElement = document.querySelector(
                '[data-testid="inlineHeader-companyName"]'
            );

            const companyName = companyElement?.innerText.trim() || "";

            return {
                type: "job",
                jobTitle: jobTitleElement?.innerText
                    .replace(/\s*-\s*job post\s*$/i, "")
                    .trim() || "",
                companyText: companyElement?.innerText.trim() || ""
            };
        }
    });

    console.log("Extracted job data:", result.result);

    const jobData = result.result;

    if (!jobData) {
        return;
    }

    // Normal job posting
    if (jobData.type === "job") {
        const companyName =
            jobData.companyText.split(" - ")[0].trim();

        // We successfully extracted a job from this page
        if (companyName && jobData.jobTitle) {
            document.getElementById("companyInput").value =
                companyName;

            document.getElementById("jobTitleInput").value =
                jobData.jobTitle;

            await chrome.storage.local.set({
                lastJob: {
                    companyName: companyName,
                    jobTitle: jobData.jobTitle
                }
            });

            console.log("Saved lastJob:", {
                companyName: companyName,
                jobTitle: jobData.jobTitle
            });
        }

        // Couldn't extract from this page → use the previously stored job
        else {
            const { lastJob } =
                await chrome.storage.local.get("lastJob");

            console.log("Using stored lastJob:", lastJob);

            if (lastJob) {
                document.getElementById("companyInput").value =
                    lastJob.companyName;

                document.getElementById("jobTitleInput").value =
                    lastJob.jobTitle;
            }
        }
    }
    
    if (
        jobData.type === "confirmation" ||
        jobData.type === "alreadyApplied"
    ) {
        const { lastJob } = await chrome.storage.local.get("lastJob");

        console.log("Stored lastJob:", lastJob); // ADD THIS

        if (lastJob) {
            document.getElementById("companyInput").value =
                jobData.companyName || lastJob.companyName;

            document.getElementById("jobTitleInput").value =
                lastJob.jobTitle;

            document.getElementById("statusInput").value =
                "APPLIED";
        }
    }
}


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

console.log("popup.js loaded");

autofillJobInfo();
