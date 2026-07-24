const CSV_FILE = "Dashboard_data_MHCV_Production.csv";

let rawData = [];
let filteredData = [];

let trendChart = null;
let shareChart = null;
let brandChart = null;

const YEARS = ["2025", "2026", "2027", "2028", "2029", "2030", "2031"];

document.addEventListener("DOMContentLoaded", function () {
    loadCSV();
});

async function loadCSV() {
    try {
        const response = await fetch(CSV_FILE);
        const text = await response.text();

        const lines = text.split(/\r?\n/);

        const headerIndex = lines.findIndex(line =>
            line.trim().startsWith("Region;Country/Territory")
        );

        if (headerIndex === -1) {
            console.error("Header row not found. First lines:", lines.slice(0, 10));
            return;
        }

        const cleanedText = lines.slice(headerIndex).join("\n");

        rawData = parseCSV(cleanedText);

        console.log("Header Index:", headerIndex);
        console.log("Rows Loaded After Header Fix:", rawData.length);
        console.log("First Real Row:", rawData[0]);

        cleanData();
        buildFilters();
        attachEvents();
        updateDashboard();

        console.log("MHCV CSV loaded after cleanData:", rawData.length, "rows");
    } catch (error) {
        console.error("CSV could not be loaded:", error);
        document.querySelector(".main").innerHTML =
            "<p style='color:red;font-weight:bold;'>CSV could not be loaded. Please check the file name and GitHub location.</p>";
    }
}

function parseCSV(text) {
    const rows = [];
    let row = [];
    let value = "";
    let insideQuotes = false;

    text = text.replace(/^\uFEFF/, "");

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"' && insideQuotes && nextChar === '"') {
            value += '"';
            i++;
        } else if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ";" && !insideQuotes) {
            row.push(value);
            value = "";
        } else if ((char === "\n" || char === "\r") && !insideQuotes) {
            if (value !== "" || row.length > 0) {
                row.push(value);
                rows.push(row);
                row = [];
                value = "";
            }

            if (char === "\r" && nextChar === "\n") {
                i++;
            }
        } else {
            value += char;
        }
    }

    if (value !== "" || row.length > 0) {
        row.push(value);
        rows.push(row);
    }

    const headers = rows[0].map(h => h.trim());

    return rows.slice(1).map(r => {
        const obj = {};

        headers.forEach((h, index) => {
            obj[h] = r[index] ? r[index].trim() : "";
        });

        return obj;
    });
}

function cleanData() {
    rawData = rawData.filter(row =>
        row["Region"] &&
        row["Country/Territory"] &&
        row["Bus/Truck"]
    );

    rawData.forEach(row => {
        YEARS.forEach(year => {
            const col = "CY " + year;
            row[col] = toNumber(row[col]);
        });
    });
}

function toNumber(value) {
    if (value === null || value === undefined || value === "") {
        return 0;
    }

    return Number(
        String(value)
            .replace(/,/g, "")
            .replace(/\s/g, "")
    ) || 0;
}

function uniqueValues(field) {
    return [...new Set(
        rawData
            .map(row => row[field])
            .filter(value => value && value.trim() !== "")
    )].sort();
}

function populateSelect(id, values, allLabel) {
    const select = document.getElementById(id);
    select.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "ALL";
    allOption.textContent = allLabel;
    select.appendChild(allOption);

    values.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });
}

function buildFilters() {
    populateSelect("regionFilter", uniqueValues("Region"), "All Regions");
    populateSelect("countryFilter", uniqueValues("Country/Territory"), "All Countries");
    populateSelect("salesParentFilter", uniqueValues("Sales Parent"), "All Sales Parents");
    populateSelect("brandFilter", uniqueValues("Production Brand"), "All Brands");
    populateSelect("busTruckFilter", uniqueValues("Bus/Truck"), "All Vehicle Types");
    populateSelect("globalSegmentFilter", uniqueValues("Global Production Segment"), "All Global Segments");
    populateSelect("regionalSegmentFilter", uniqueValues("Regional Segment"), "All Regional Segments");
}

function attachEvents() {
    document.querySelectorAll("select").forEach(select => {
        select.addEventListener("change", updateDashboard);
    });
}

function getSelectedValue(id) {
    return document.getElementById(id).value;
}

function applyFilters() {
    const region = getSelectedValue("regionFilter");
    const country = getSelectedValue("countryFilter");
    const salesParent = getSelectedValue("salesParentFilter");
    const brand = getSelectedValue("brandFilter");
    const busTruck = getSelectedValue("busTruckFilter");
    const globalSegment = getSelectedValue("globalSegmentFilter");
    const regionalSegment = getSelectedValue("regionalSegmentFilter");

    filteredData = rawData.filter(row => {
        return (
            (region === "ALL" || row["Region"] === region) &&
            (country === "ALL" || row["Country/Territory"] === country) &&
            (salesParent === "ALL" || row["Sales Parent"] === salesParent) &&
            (brand === "ALL" || row["Production Brand"] === brand) &&
            (busTruck === "ALL" || row["Bus/Truck"] === busTruck) &&
            (globalSegment === "ALL" || row["Global Production Segment"] === globalSegment) &&
            (regionalSegment === "ALL" || row["Regional Segment"] === regionalSegment)
        );
    });
}

function updateDashboard() {
    applyFilters();

    updateKPIs();
    updateTrendChart();
    updateShareChart();
    updateBrandChart();
    updateDetailsTable();
}

function sumYear(data, year) {
    const col = "CY " + year;

    return data.reduce((sum, row) => {
        return sum + toNumber(row[col]);
    }, 0);
}

function updateKPIs() {
    const selectedYear = getSelectedValue("yearFilter");
    const selectedCol = "CY " + selectedYear;

    const totalVolume = sumYear(filteredData, selectedYear);

    const truckVolume = filteredData
        .filter(row => String(row["Bus/Truck"]).toUpperCase().includes("TRUCK"))
        .reduce((sum, row) => sum + toNumber(row[selectedCol]), 0);

    const busVolume = filteredData
        .filter(row => String(row["Bus/Truck"]).toUpperCase().includes("BUS"))
        .reduce((sum, row) => sum + toNumber(row[selectedCol]), 0);

    const base2026 = sumYear(filteredData, "2026");
    const end2031 = sumYear(filteredData, "2031");

    let cagr = 0;

    if (base2026 > 0 && end2031 > 0) {
        cagr = (Math.pow(end2031 / base2026, 1 / 5) - 1) * 100;
    }

    document.getElementById("kpiVolume").textContent =
        formatNumber(totalVolume);

    document.getElementById("kpiCagr").textContent =
        cagr.toFixed(1) + "%";

    document.getElementById("kpiTruck").textContent =
        totalVolume > 0 ? ((truckVolume / totalVolume) * 100).toFixed(1) + "%" : "0%";

    document.getElementById("kpiBus").textContent =
        totalVolume > 0 ? ((busVolume / totalVolume) * 100).toFixed(1) + "%" : "0%";
}

function updateTrendChart() {
    const truckData = [];
    const busData = [];

    YEARS.forEach(year => {
        const col = "CY " + year;

        const truck = filteredData
            .filter(row => String(row["Bus/Truck"]).toUpperCase().includes("TRUCK"))
            .reduce((sum, row) => sum + toNumber(row[col]), 0);

        const bus = filteredData
            .filter(row => String(row["Bus/Truck"]).toUpperCase().includes("BUS"))
            .reduce((sum, row) => sum + toNumber(row[col]), 0);

        truckData.push(truck);
        busData.push(bus);
    });

    if (trendChart) {
        trendChart.destroy();
    }

    trendChart = new Chart(document.getElementById("trendChart"), {
        type: "bar",
        data: {
            labels: YEARS,
        
