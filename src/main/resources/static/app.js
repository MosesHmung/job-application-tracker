// ----------------------------------------
// GLOBAL STATE
// ----------------------------------------

let applicationToDelete = null;
let editingApplicationId = null;

// Keep one copy of the applications in memory so the table and calendar
// can use the same data instead of making separate API calls.
let cachedApplications = [];
let currentWeekStart = getStartOfWeek(new Date());

let currentSortField = "dateApplied";
let currentSortDirection = "desc";

// ----------------------------------------
// PAGE LOAD
// ----------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    loadApplications();
    loadStats();

});

// ----------------------------------------
// APPLICATION TABLE
// ----------------------------------------

async function loadApplications() {
    const response = await fetch("/api/applications");
    const applications = await response.json();

    // Save the latest backend data so the calendar stays in sync with the table.
    cachedApplications = applications;

    renderWeeklyEvents();
    renderWeeklyEvents();

    const list = document.getElementById("applicationList");

    list.innerHTML = "";

    applications.forEach(application => {
        list.innerHTML += `
            <tr>
                <td>${application.companyName ?? ""}</td>
                <td>${application.jobTitle ?? ""}</td>
                <td>
                    <span class="status-badge ${getStatusClass(application.status)}">
                        ${application.status ?? ""}
                    </span>
                </td>
                <td>${application.dateApplied ?? "No date"}</td>
                <td>
                    <div class="table-actions">
                        <button onclick="editApplication(${application.id})">
                            Edit
                        </button>
                
                        <button onclick="deleteApplication(${application.id}, '${application.jobTitle}')">
                            Delete
                        </button>
                        <button onclick="toggleDetails(${application.id})" id="expandBtn-${application.id}">
                            View
                        </button>
                    </div>
                </td>
            </tr>

            <tr id="details-${application.id}" class="details-row hidden">
                <td colspan="5">
                    <div class="application-details">
                        <p><strong>Salary:</strong> 
                            ${formatSalary(application.salaryMin, application.salaryMax)}
                        </p>

                        <p><strong>Notes:</strong> 
                            ${application.notes || ""}
                        </p>
                    </div>
                </td>
            </tr>
        `;
    });
}

function renderApplications() {
    const list = document.getElementById("applicationList");
    list.innerHTML = "";

    const searchText = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const searchField = document.getElementById("searchField").value;

    let applicationsToShow = [...cachedApplications];

    // Search by company or job title
    applicationsToShow = applicationsToShow.filter(application => {
        if (searchText === "") {
            return true;
        }

        const searchableFields = {
            companyName: application.companyName ?? "",
            jobTitle: application.jobTitle ?? "",
            status: formatStatus(application.status ?? ""),
        };

        if (searchField === "ALL") {
            return Object.values(searchableFields).some(value =>
                value.toLowerCase().includes(searchText)
            );
        }

        return searchableFields[searchField]
            .toLowerCase()
            .includes(searchText);
    });

    // Sort the filtered results.
    applicationsToShow.sort((a, b) => {
        const valueA = a[currentSortField] ?? "";
        const valueB = b[currentSortField] ?? "";

        if (currentSortField === "dateApplied") {
            return currentSortDirection === "asc"
                ? new Date(valueA) - new Date(valueB)
                : new Date(valueB) - new Date(valueA);
        }

        return currentSortDirection === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
    });

    updateSortIndicators();

    applicationsToShow.forEach(application => {
        list.innerHTML += `
            <tr>
                <td>${application.companyName ?? ""}</td>
                <td>${application.jobTitle ?? ""}</td>
                <td>
                    <span class="status-badge ${getStatusClass(application.status)}">
                        ${application.status ?? ""}
                    </span>
                </td>
                <td>${application.dateApplied ?? "No date"}</td>
                <td>
                    <div class="table-actions">
                        <button onclick="editApplication(${application.id})">
                            Edit
                        </button>

                        <button onclick="deleteApplication(${application.id}, '${application.jobTitle}')">
                            Delete
                        </button>

                        <button onclick="toggleDetails(${application.id})" id="expandBtn-${application.id}">
                            View
                        </button>
                    </div>
                </td>
            </tr>

            <tr id="details-${application.id}" class="details-row hidden">
                <td colspan="5">
                    <div class="application-details">
                        <p>
                            <strong>Salary:</strong>
                            ${formatSalary(application.salaryMin, application.salaryMax)}
                        </p>

                        <p>
                            <strong>Notes:</strong>
                            ${application.notes || ""}
                        </p>
                    </div>
                </td>
            </tr>
        `;
    });
}

function setSort(field) {
    if (currentSortField === field) {
        currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
    } else {
        currentSortField = field;
        currentSortDirection = "asc";
    }

    renderApplications();
}

function toggleDetails(id) {
    const detailsRow = document.getElementById(`details-${id}`);
    const expandButton = document.getElementById(`expandBtn-${id}`);

    detailsRow.classList.toggle("hidden");

    if (detailsRow.classList.contains("hidden")) {
        expandButton.textContent = "View";
    } else {
        expandButton.textContent = "Hide";
    }
}

// ----------------------------------------
// APPLICATIONS ACTIONS
// ----------------------------------------

async function saveApplication() {

    const companyName = document.getElementById("companyInput").value;
    const jobTitle = document.getElementById("jobTitleInput").value;
    const status = document.getElementById("statusInput").value;
    const dateApplied = document.getElementById("dateInput").value;
    const salaryMin = Number(document.getElementById("salaryMinInput").value);
    const salaryMax = Number(document.getElementById("salaryMaxInput").value);
    const notes = document.getElementById("notesInput").value;

    // The same modal handles both adding and editing.
    // If editingApplicationId is set, update the existing row instead of creating a new one.
    const url = editingApplicationId === null
        ? "/api/applications"
        : `/api/applications/${editingApplicationId}`;

    const method = editingApplicationId === null
        ? "POST"
        : "PUT";

    await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            jobTitle: jobTitle,
            status: status,
            dateApplied: dateApplied,
            salaryMin: salaryMin,
            salaryMax: salaryMax,
            notes: notes,
            company: {
                name: companyName
            }
        })
    });

    closeModal();

    loadApplications();
    loadStats();
}

async function editApplication(id) {

    console.log("Edit clicked:", id);
    const response = await fetch(`/api/applications/${id}`);
    const application = await response.json();

    // This tells saveApplication() to use PUT instead of POST.
    editingApplicationId = id;

    document.getElementById("modalTitle").textContent = "Edit Application";
    document.getElementById("companyInput").value = application.companyName;
    document.getElementById("jobTitleInput").value = application.jobTitle;
    document.getElementById("statusInput").value = application.status;
    document.getElementById("dateInput").value = application.dateApplied ?? "";
    document.getElementById("salaryMinInput").value = application.salaryMin ?? "";
    document.getElementById("salaryMaxInput").value = application.salaryMax ?? "";
    document.getElementById("notesInput").value = application.notes ?? "";

    openModal();
}

function deleteApplication(id, title) {

    // Store the id here so the confirm button knows what to delete.
    applicationToDelete = id;
    document.getElementById("deleteMessage").textContent = `Are you sure you want to delete "${title}"?`;
    document.getElementById("deleteModal").classList.remove("hidden");
}

async function confirmDelete() {

    if (applicationToDelete === null) return;

    const response = await fetch(
        `/api/applications/${applicationToDelete}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        alert("Failed to delete application.");
        return;
    }

    closeDeleteModal();

    // Refresh both views since deletion affects table, stats, and calendar.
    loadApplications();
    loadStats();
}

// ----------------------------------------
// MODALS
// ----------------------------------------

function openModal() {

    // Only clear form when adding to prevent sticky previous application
    // Edit mode fills the form first then opens the modal.
    if (editingApplicationId === null) {
        clearForm();
    }

    document.getElementById("applicationModal")
        .classList.remove("hidden");
}

function closeModal() {

    document.getElementById("applicationModal")
        .classList.add("hidden");

    clearForm();
}

function closeDeleteModal() {

    applicationToDelete = null;
    document.getElementById("deleteModal").classList.add("hidden");
}


function clearForm() {

    document.getElementById("companyInput").value = "";
    document.getElementById("jobTitleInput").value = "";
    document.getElementById("statusInput").value = "WATCHING";
    document.getElementById("dateInput").value = getTodayDate();
    document.getElementById("salaryMinInput").value = "";
    document.getElementById("salaryMaxInput").value = "";
    document.getElementById("notesInput").value = "";

    // Reset back to add mode after closing/editing
    editingApplicationId = null;

    document.getElementById("modalTitle").textContent =
        "Add Application";
}

// ----------------------------------------
// DASHBOARD STATS
// ----------------------------------------

async function loadStats() {
    const response = await fetch("/api/stats");
    const stats = await response.json();

    document.getElementById("applications").textContent = String(stats.total - stats.watching);
    document.getElementById("interviews").textContent = stats.interviewing;
    document.getElementById("offers").textContent = stats.offers;
    document.getElementById("watching").textContent = stats.watching;

    document.getElementById("applicationsThisWeek").textContent =
        `+${stats.applicationsThisWeek} this week`;

    document.getElementById("interviewingThisWeek").textContent =
        `+${stats.interviewingThisWeek} this week`;

    document.getElementById("offersThisWeek").textContent =
        `+${stats.offersThisWeek} this week`;

    document.getElementById("watchingThisWeek").textContent =
        `+${stats.watchingThisWeek} this week`;

    const activityTotal = stats.total - stats.watching;

    document.getElementById("activityTotal").textContent =
        activityTotal;

    document.getElementById("activityApplied").textContent =
        stats.applied;

    document.getElementById("activityInterviews").textContent =
        stats.interviewing;

    document.getElementById("activityOffers").textContent =
        stats.offers;

    document.getElementById("activityRejected").textContent =
        stats.rejected;

    document.getElementById("activityPhoneScreen").textContent =
        stats.phoneScreen;

    document.getElementById("activityWithdrawn").textContent =
        stats.withdrawn;

    const styles = getComputedStyle(document.documentElement);

    const activityData = [
        { count: stats.applied, color: styles.getPropertyValue("--applied-soft").trim() },
        { count: stats.phoneScreen, color: styles.getPropertyValue("--phone-screen-soft").trim() },
        { count: stats.interviewing, color: styles.getPropertyValue("--interview-soft").trim() },
        { count: stats.offers, color: styles.getPropertyValue("--offer-soft").trim() },
        { count: stats.rejected, color: styles.getPropertyValue("--rejected-soft").trim() },
        { count: stats.withdrawn, color: styles.getPropertyValue("--withdrawn-soft").trim() }
    ];


    const total = stats.total;
    const donut = document.getElementById("activityDonut");

    if (total === 0) {
        donut.style.background = "#e8dfd1";
    } else {
        let currentPercent = 0;
        const segments = [];

        activityData.forEach(item => {
            if (item.count === 0) return;

            const startPercent = currentPercent;
            const percentage = (item.count / total) * 100;

            currentPercent += percentage;

            segments.push(
                `${item.color} ${startPercent}% ${currentPercent}%`
            );
        });

        donut.style.background =
            `conic-gradient(${segments.join(", ")})`;
    }
}

// ----------------------------------------
// CALENDER (SIDEBAR)
// ----------------------------------------

function toggleCalendar() {
    const layout = document.querySelector(".applications-layout");
    const sidebar = document.getElementById("sidebar");

    layout.classList.toggle("calendar-open");
    sidebar.classList.toggle("hidden");
}

function renderWeeklyEvents() {
    const weekGrid = document.getElementById("weekGrid");
    const weekTitle = document.getElementById("weekTitle");

    if (!weekGrid || !weekTitle) {
        return;
    }

    weekGrid.innerHTML = "";

    weekTitle.textContent = `Week of ${formatWeekTitleDate(currentWeekStart)}`;

    for (let i = 0; i < 7; i++) {
        const day = new Date(currentWeekStart);
        day.setDate(currentWeekStart.getDate() + i);

        const dateString = toLocalDateString(day);

        const appliedCount = cachedApplications.filter(application =>
            application.dateApplied === dateString &&
            application.status === "APPLIED"
        ).length;

        const interviewCount = cachedApplications.filter(application =>
            application.dateApplied === dateString &&
            application.status === "INTERVIEWING"
        ).length;

        const offerCount = cachedApplications.filter(application =>
            application.dateApplied === dateString &&
            application.status === "OFFER"
        ).length;

        let eventHtml = "";

        if (appliedCount > 0) {
            eventHtml += `
                <div class="week-event-count application-count" title="${appliedCount} applications logged">
                    ${appliedCount}
                </div>
            `;
        }

        if (interviewCount > 0) {
            eventHtml += `
                <div class="week-event-count interview-count" title="${interviewCount} interviews scheduled">
                    ${interviewCount}
                </div>
            `;
        }

        if (offerCount > 0) {
            eventHtml += `
                <div class="week-event-count offer-count" title="${offerCount} offers given">
                    ${offerCount}
                </div>
            `;
        }

        weekGrid.innerHTML += `
            <div class="week-day">
                <div class="week-date">${day.getDate()}</div>
                ${eventHtml || `<span class="empty-day">—</span>`}
            </div>
        `;
    }
}

function previousWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    renderWeeklyEvents();
}

function nextWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    renderWeeklyEvents();
}

function openFullCalendar() {
    alert("Full calendar coming soon.");
}

// ----------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------

function formatSalary(min, max) {
    if (!min && !max) {
        return "";
    }

    if (min && max) {
        return `$${min} - $${max}`;
    }

    if (min) {
        return `$${min}+`;
    }

    return `Up to $${max}`;
}

function formatStatus(status) {
    return status
        .toLowerCase()
        .replaceAll("_", " ");
}

function formatTag(tag) {
    if (!tag) {
        return "";
    }

    return tag
        .toLowerCase()
        .replaceAll("_", " ");
}

function formatShortDate(dateInput) {
    const date = dateInput instanceof Date
        ? dateInput
        : new Date(dateInput + "T00:00:00");

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });
}

function getStatusClass(status) {
    if (status === "WATCHING") {
        return "status-watching";
    }

    if (status === "APPLIED") {
        return "status-applied";
    }

    if (status === "PHONE_SCREEN") {
        return "status-phone";
    }

    if (status === "INTERVIEWING") {
        return "status-interviewing";
    }

    if (status === "OFFER") {
        return "status-offer";
    }

    if (status === "REJECTED") {
        return "status-rejected";
    }

    if (status === "WITHDRAWN") {
        return "status-withdrawn";
    }

    return "";
}

function getStartOfWeek(date) {
    const copy = new Date(date);
    const day = copy.getDay();

    const diff = day === 0 ? -6 : 1 - day;

    copy.setDate(copy.getDate() + diff);
    copy.setHours(0, 0, 0, 0);

    return copy;
}


function formatWeekTitleDate(dateInput) {
    const date = dateInput instanceof Date
        ? dateInput
        : new Date(dateInput + "T00:00:00");

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function toLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function updateSortIndicators() {
    const fields = ["companyName", "jobTitle", "status", "dateApplied"];

    fields.forEach(field => {
        const indicator = document.getElementById(`${field}Sort`);

        if (!indicator) return;

        indicator.textContent = field === currentSortField
            ? currentSortDirection === "asc" ? "↑" : "↓"
            : "";
    });
}

