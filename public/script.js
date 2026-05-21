const uploadform = document.getElementById("uploadform");
const logfileInput = document.getElementById("logfile");
const fileNameDisplay = document.getElementById("fileNameDisplay");
const runBtn = document.getElementById("runBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
const statusBar = document.getElementById("statusBar");
const statusText = document.getElementById("statusText");
const resultsSection = document.getElementById("resultsSection");

let statusChartInstance = null;
let routeChartInstance = null;

// ─── SIDEBAR NAVIGATION ───────────────────────────────────────────────────────
function showPage(pageId, navEl) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    document.getElementById(pageId).classList.add("active");
    navEl.classList.add("active");

    const titles = {
        "page-overview": "Overview Dashboard",
        "page-threats": "Threat Investigation",
        "page-routes": "Route & Method Breakdown",
        "page-history": "History"
    };
    document.getElementById("topbarTitle").textContent = titles[pageId] || "Dashboard";
    window.scrollTo({
    top:0,
    behavior:"smooth"
});
}

// File name display
logfileInput.addEventListener("change", () => {
    if (logfileInput.files.length > 0) {
        fileNameDisplay.textContent = logfileInput.files[0].name.toUpperCase();
    } else {
        fileNameDisplay.textContent = "No file selected";
    }
});

// ─── PDF DOWNLOAD ─────────────────────────────────────────────────────────────
downloadPdfBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("Web Log Investigation Report", 20, 20);

    doc.setFontSize(16);
    doc.text("Executive Summary", 20, 40);

    doc.setFontSize(13);
    doc.text(`Total Requests: ${document.getElementById("totalRequests").textContent}`, 20, 55);
    doc.text(`Error Count: ${document.getElementById("errorCount").textContent}`, 20, 65);
    doc.text(`Top Route: ${document.getElementById("MostRequestedRoute").textContent}`, 20, 75);
    doc.text(`Most Active IP: ${document.getElementById("mostActiveIP").textContent}`, 20, 85);

    doc.setFontSize(16);
    doc.text("Parser Summary", 20, 110);

    const parserRows = [];
    document.querySelectorAll("#parserSummaryTable tbody tr").forEach(row => {
        const cols = row.querySelectorAll("td");
        parserRows.push([cols[0].textContent, cols[1].textContent]);
    });

    doc.autoTable({ startY: 120, head: [["Metric", "Value"]], body: parserRows });

    let currentY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(16);
    doc.text("Threat Findings", 20, currentY);

    const threatRows = [];
    document.querySelectorAll(".threat-card").forEach(card => {
        const type = card.querySelector(".threat-type")?.textContent;
        const severity = card.querySelector(".severity")?.textContent;
        const values = card.querySelectorAll(".threat-item strong");
        threatRows.push([type, severity, values[0]?.textContent, values[1]?.textContent]);
    });

    doc.autoTable({ startY: currentY + 10, head: [["Attack Type", "Severity", "Source IP", "Activity"]], body: threatRows });

    currentY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(16);
    doc.text("Route Breakdown", 20, currentY);

    const routeRows = [];
    document.querySelectorAll("#routeTable tbody tr").forEach(row => {
        const cols = row.querySelectorAll("td");
        routeRows.push([cols[0].textContent, cols[1].textContent]);
    });

    doc.autoTable({ startY: currentY + 10, head: [["Route", "Requests"]], body: routeRows });

    currentY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(16);
    doc.text("Security Recommendations", 20, currentY);

    doc.setFontSize(12);
    const recommendations = [
        "• Block suspicious IP addresses",
        "• Apply request rate limiting",
        "• Monitor repeated failed login attempts",
        "• Restrict access to sensitive routes",
        "• Enable CAPTCHA protection on authentication pages",
        "• Continuously monitor abnormal traffic behavior"
    ];

    let recY = currentY + 12;
    recommendations.forEach(rec => { doc.text(rec, 25, recY); recY += 10; });

    doc.save(Date.now() + "InvestigationReport.pdf");
});

// ─── STATUS BAR ───────────────────────────────────────────────────────────────
function showStatus(message, isError = false) {
    statusText.textContent = message;
    statusBar.classList.add("show");

    if (isError) {
        statusBar.style.background = "rgba(239, 68, 68, 0.08)";
        statusBar.style.borderColor = "rgba(239, 68, 68, 0.25)";
        statusBar.style.color = "#fca5a5";
        statusBar.querySelector(".status-dot").style.background = "#ef4444";
        statusBar.querySelector(".status-dot").style.boxShadow = "0 0 8px #ef4444";
    } else {
        statusBar.style.background = "rgba(16, 185, 129, 0.08)";
        statusBar.style.borderColor = "rgba(16, 185, 129, 0.2)";
        statusBar.style.color = "#6ee7b7";
        statusBar.querySelector(".status-dot").style.background = "#10b981";
        statusBar.querySelector(".status-dot").style.boxShadow = "0 0 8px #10b981";
    }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function updateText(id, value) {
    document.getElementById(id).textContent = value ?? "-";
}

function updateTable(tableId, dataObj) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = "";

    const entries = Object.entries(dataObj || {});
    if (entries.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" style="text-align:center; color:var(--muted);">No data available</td></tr>`;
        return;
    }

    entries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([key, value]) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${key}</td><td>${value}</td>`;
            tbody.appendChild(row);
        });
}

function updateList(listId, items) {
    const list = document.getElementById(listId);
    list.innerHTML = "";

    if (!items || items.length === 0) {
        list.innerHTML = `<li style="color:var(--muted);">No data available</li>`;
        return;
    }

    items.slice(0, 5).forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    });
}

function updateParserSummary(summary) {
    const tableBody = document.querySelector("#parserSummaryTable tbody");
    tableBody.innerHTML = "";

    if (!summary) {
        tableBody.innerHTML = `<tr><td colspan="2" style="text-align:center; color:var(--muted);">No parser summary available</td></tr>`;
        return;
    }

    const rows = [
        ["File Name", summary.fileName],
        ["Parser Mode", summary.parserMode],
        ["Total Lines", summary.totalLines],
        ["Valid Entries", summary.validEntries],
        ["Invalid / Skipped", summary.invalidEntries],
        ["Distinct Routes", summary.distinctRoutes],
        ["Distinct IPs", summary.distinctIPs]
    ];

    rows.forEach(([label, value]) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${label}</td><td>${value}</td>`;
        tableBody.appendChild(row);
    });
}

// ─── CHARTS ───────────────────────────────────────────────────────────────────
function renderStatusChart(success, redirect, clientError, serverError) {
    const ctx = document.getElementById("statusChart").getContext("2d");
    if (statusChartInstance) statusChartInstance.destroy();

    statusChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Success", "Redirect", "Client Error", "Server Error"],
            datasets: [{
                data: [success, redirect, clientError, serverError],
                backgroundColor: ["#3b82f6", "#06b6d4", "#f59e0b", "#ef4444"],
                borderColor: "rgba(10, 22, 40, 0.5)",
                borderWidth: 2,
                borderRadius:8,
borderSkipped:false,
            }]
        },
            
        
        options: {

    responsive: true,

    maintainAspectRatio: false,

    cutout: "68%",

    plugins: {

        legend: {

            position: "bottom",

            labels: {

                color: "#cbd5e1",

                padding: 18,

                usePointStyle: true,

                pointStyle: "circle",

                font: {
                    size: 11,
                    weight: "600"
                }

            }

        },

        tooltip: {

            backgroundColor: "#081120",

            borderColor: "rgba(59,130,246,0.18)",

            borderWidth: 1,

            titleColor: "#f8fafc",

            bodyColor: "#cbd5e1",

            padding: 12

        }

    }

}
    });
}

function renderRouteChart(routesObj) {
    const ctx = document.getElementById("routeChart").getContext("2d");
    if (routeChartInstance) routeChartInstance.destroy();

    const sortedRoutes = Object.entries(routesObj || {}).sort((a, b) => b[1] - a[1]);
const topRoutes = sortedRoutes.slice(0,10);

const labels =
  topRoutes.map(item => item[0]);

const values =
  topRoutes.map(item => item[1]);

    routeChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Traffic",
                data: values,
                backgroundColor: "rgba(59, 130, 246, 0.55)",
                borderColor: "rgba(59, 130, 246, 0.9)",
                borderWidth: 1,
    hoverOffset:12,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: { maxRotation:28,minRotation:28, color: "#ffffff", font:{size:10,weight:"500"
} },
                    grid: {
  color:"rgba(255,255,255,0.025)",
  drawBorder:false
}
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#64748b" },
                    grid: { color: "rgba(255,255,255,0.04)" }
                }
            }
        },
      
    });

    
}

// ─── THREATS ──────────────────────────────────────────────────────────────────
function renderThreats(threats) {
    threats = threats
        .sort((a, b) => {
            const aValue = a.requestCount || a.routesVisited || a.repeatedRequests || a.attempts || 0;
            const bValue = b.requestCount || b.routesVisited || b.repeatedRequests || b.attempts || 0;
            return bValue - aValue;
        })
        .slice(0, 10);

    const threatContainer = document.getElementById("threatContainer");
    threatContainer.innerHTML = "";

    if (!threats || threats.length === 0) {
        threatContainer.innerHTML = `<div class="empty-threat">No threats detected.</div>`;
        return;
    }

    threats.forEach(threat => {
        const severityClass = threat.severity.toLowerCase();
        const card = document.createElement("div");
        card.classList.add("threat-card");
        card.innerHTML = `
            <div class="threat-top">
                <div class="threat-type">${threat.type}</div>
                <div class="severity ${severityClass}">${threat.severity}</div>
            </div>
            <div class="threat-body">
                <div class="threat-item">
                    <span>Source IP</span>
                    <strong>${threat.ip || threat.source}</strong>
                </div>
                <div class="threat-item">
                    <span>Request Activity</span>
                    <strong>${threat.attempts || threat.requestCount || threat.routesVisited || threat.repeatedRequests}</strong>
                </div>
                <div class="threat-item">
                    <span>Recommended Action</span>
                    <strong>${threat.recommendation}</strong>
                </div>
            </div>
        `;
        threatContainer.appendChild(card);
    });
}

// ─── FORM SUBMIT ──────────────────────────────────────────────────────────────
uploadform.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!logfileInput.files.length) {
        showStatus("Please select a log file before running analysis.", true);
     
        return;
    }

    const formData = new FormData(uploadform);
    runBtn.disabled = true;
    runBtn.textContent = "Analyzing...";
    uploadform.classList.add("loading");
    showStatus("Running parser engine and generating dashboard insights...");

    try {
        const response = await fetch("/upload", { method: "POST", body: formData });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error);
        }

        const data = await response.json();

        updateText("totalRequests", data.totalRequests || 0);
        updateText("errorCount", data.errorCount || 0);
        updateText("MostRequestedRoute", data.MostRequestedRoute || "-");
        updateText("mostActiveIP", data.mostActiveIP || "-");

        updateTable("routeTable", data.Routes || {});
        updateTable("methodTable", data.Method || {});

        updateList("insightsList", data.insights || []);
        updateList("suspiciousList", data.suspiciousActivity || []);
        updateParserSummary(data.parserSummary || {});

        renderStatusChart(data.success || 0, data.redirect || 0, data.clientError || 0, data.serverError || 0);
        renderRouteChart(data.Routes || {});
        renderThreats(data.threats);

        showStatus("Analysis completed successfully. Review the generated dashboard below.");
           setTimeout(() => {

    document.getElementById("resultsSection")
      .scrollIntoView({
          behavior:"smooth",
          block:"start"
      });

}, 300);

        loadHistory();

    } catch (error) {
        console.error(error);
        showStatus("Something went wrong while analyzing the uploaded file.", true);
    } finally {
        runBtn.disabled = false;
        runBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Run Analysis`;
        uploadform.classList.remove("loading");
    }
});

// ─── HISTORY ──────────────────────────────────────────────────────────────────
async function loadHistory() {
    try {
        const response = await fetch("/history");
        const data = await response.json();
        const tbody = document.querySelector("#historyTable tbody");
        tbody.innerHTML = "";

        if (!response.ok) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#ef4444; padding:20px;">Login required to view history</td></tr>`;
            return;
        }

        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--muted); padding:20px;">No history available</td></tr>`;
            return;
        }

        data.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td>${item.originalFileName}</td>
                    <td>${item.logType}</td>
                    <td>${item.totalRequests}</td>
                    <td>${item.errorCount}</td>
                    <td>${item.topRoute}</td>
                    <td>${new Date(item.uploadDate).toLocaleString()}</td>
                    <td>
                        <button class="delete-history-btn" onclick="deleteHistory('${item._id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.log(error);
    }
}

async function deleteHistory(id) {
    try {
        await fetch(`/delete_history/${id}`);
        loadHistory();
    } catch (error) {
        console.log(error);
    }
}

async function clearHistory() {
    try {
        await fetch("/delete_history/all");
        loadHistory();
    } catch (error) {
        console.log(error);
    }
}

loadHistory();
