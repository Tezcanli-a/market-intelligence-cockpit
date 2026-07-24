const CSV_FILE = "Dashboard_data_MHCV_Production.csv";

let rawData = [];
let filteredData = [];

let trendChart;
let shareChart;
let brandChart;

Papa.parse(CSV_FILE, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
        rawData = results.data;
        initializeDashboard();
    }
});

function initializeDashboard() {
    populateFilters();
    attachEvents();
    updateDashboard();
}

function uniqueValues(field) {
    return [...new Set(
        rawData
            .map(r => r[field])
            .filter(v => v && v.trim() !== "")
    )].sort();
}

function populateSelect(id, values, label) {
    const select = document.getElementById(id);

    values.forEach(v => {
        const option = document.createElement("option");
        option.value = v;
        option.textContent = v;
        select.appendChild(option);
    });
}

function populateFilters() {

    populateSelect(
        "regionFilter",
        uniqueValues("Region"),
        "All Regions"
    );

    populateSelect(
        "countryFilter",
        uniqueValues("Country/Territory"),
        "All Countries"
    );

    populateSelect(
        "salesParentFilter",
        uniqueValues("Sales Parent"),
        "All Sales Parents"
    );

    populateSelect(
        "brandFilter",
        uniqueValues("Production Brand"),
        "All Brands"
    );

    populateSelect(
        "busTruckFilter",
        uniqueValues("Bus/Truck"),
        "All Vehicle Types"
    );

    populateSelect(
        "globalSegmentFilter",
        uniqueValues("Global Production Segment"),
        "All Global Segments"
    );

    populateSelect(
        "regionalSegmentFilter",
        uniqueValues("Regional Segment"),
        "All Regional Segments"
    );
}

function attachEvents() {

    document
        .querySelectorAll("select")
        .forEach(el =>
            el.addEventListener("change", updateDashboard)
        );
}

function updateDashboard() {

    filteredData = rawData.filter(row => {

        const region =
            document.getElementById("regionFilter").value;

        const country =
            document.getElementById("countryFilter").value;

        const salesParent =
            document.getElementById("salesParentFilter").value;

        const brand =
            document.getElementById("brandFilter").value;

        const busTruck =
            document.getElementById("busTruckFilter").value;

        const globalSeg =
            document.getElementById("globalSegmentFilter").value;

        const regionalSeg =
            document.getElementById("regionalSegmentFilter").value;

        return (
            (region === "All Regions" || row["Region"] === region) &&
            (country === "All Countries" || row["Country/Territory"] === country) &&
            (salesParent === "All Sales Parents" || row["Sales Parent"] === salesParent) &&
            (brand === "All Brands" || row["Production Brand"] === brand) &&
            (busTruck === "All Vehicle Types" || row["Bus/Truck"] === busTruck) &&
            (globalSeg === "All Global Segments" || row["Global Production Segment"] === globalSeg) &&
            (regionalSeg === "All Regional Segments" || row["Regional Segment"] === regionalSeg)
        );
    });

    updateKPIs();
    updateTrendChart();
    updateShareChart();
    updateBrandChart();
    updateTable();
}

function getYearValue(row, year) {

    const candidates = [
        `CY ${year}`,
        `CY${year}`,
        year
    ];

    for (const col of candidates) {

        if (row[col] !== undefined) {
            return Number(row[col]) || 0;
        }
    }

    return 0;
}

function updateKPIs() {

    const selectedYear =
        document.getElementById("yearFilter").value;

    let totalVolume = 0;
    let truckVolume = 0;
    let busVolume = 0;

    filteredData.forEach(row => {

        const volume =
            getYearValue(row, selectedYear);

        totalVolume += volume;

        if (
            String(row["Bus/Truck"])
            .toUpperCase()
            .includes("TRUCK")
        ) {
            truckVolume += volume;
        }

        if (
            String(row["Bus/Truck"])
            .toUpperCase()
            .includes("BUS")
        ) {
            busVolume += volume;
        }
    });

    let base2026 = 0;
    let end2031 = 0;

    filteredData.forEach(row => {

        base2026 += getYearValue(row, "2026");
        end2031 += getYearValue(row, "2031");
    });

    let cagr = 0;

    if (base2026 > 0) {
        cagr =
            ((Math.pow(end2031 / base2026, 1 / 5) - 1) * 100);
    }

    document.getElementById("kpiVolume").textContent =
        Math.round(totalVolume).toLocaleString();

    document.getElementById("kpiCAGR").textContent =
        cagr.toFixed(1) + "%";

    document.getElementById("kpiTruck").textContent =
        totalVolume > 0
            ? ((truckVolume / totalVolume) * 100).toFixed(1) + "%"
            : "0%";

    document.getElementById("kpiBus").textContent =
        totalVolume > 0
            ? ((busVolume / totalVolume) * 100).toFixed(1) + "%"
            : "0%";
}

function updateTrendChart() {

    const years =
        ["2026","2027","2028","2029","2030","2031"];

    let truckData = [];
    let busData = [];

    years.forEach(year => {

        let truck = 0;
        let bus = 0;

        filteredData.forEach(row => {

            const value =
                getYearValue(row, year);

            if (
                String(row["Bus/Truck"])
                .toUpperCase()
                .includes("TRUCK")
            ) {
                truck += value;
            }

            if (
                String(row["Bus/Truck"])
                .toUpperCase()
                .includes("BUS")
            ) {
                bus += value;
            }
        });

        truckData.push(truck);
        busData.push(bus);
    });

    if (trendChart) trendChart.destroy();

    trendChart = new Chart(
        document.getElementById("trendChart"),
        {
            type: "bar",
            data: {
                labels: years,
                datasets: [
                    {
                        label: "Truck",
                        data: truckData,
                        backgroundColor: "#003366"
                    },
                    {
                        label: "Bus",
                        data: busData,
                        backgroundColor: "#89CFF0"
                    }
                ]
            },
            options: {
                responsive: true
            }
        }
    );
}

function updateShareChart() {

    const selectedYear =
        document.getElementById("yearFilter").value;

    const modelMap = {};

    filteredData.forEach(row => {

        const segment =
            row["Regional Segment"] || "Other";

        const volume =
            getYearValue(row, selectedYear);

        modelMap[segment] =
            (modelMap[segment] || 0) + volume;
    });

    if (shareChart) shareChart.destroy();

    shareChart = new Chart(
        document.getElementById("shareChart"),
        {
            type: "doughnut",
            data: {
                labels: Object.keys(modelMap),
                datasets: [{
                    data: Object.values(modelMap)
                }]
            },
            options: {
                responsive: true
            }
        }
    );
}

function updateBrandChart() {

    const selectedYear =
        document.getElementById("yearFilter").value;

    const brandMap = {};

    filteredData.forEach(row => {

        const brand =
            row["Production Brand"] || "Unknown";

        const volume =
            getYearValue(row, selectedYear);

        brandMap[brand] =
            (brandMap[brand] || 0) + volume;
    });

    const sorted =
        Object.entries(brandMap)
        .sort((a,b) => b[1]-a[1])
        .slice(0,10);

    if (brandChart) brandChart.destroy();

    brandChart = new Chart(
        document.getElementById("brandChart"),
        {
            type: "bar",
            data: {
                labels:
                    sorted.map(x => x[0]),
                datasets: [{
                    label: "Production",
                    data:
                    sorted.map(x => x[1]),
                    backgroundColor: "#003366"
                }]
            },
            options: {
                responsive: true
            }
        }
    );
}

function updateTable() {

    const tbody =
        document.querySelector("#detailTable tbody");

    tbody.innerHTML = "";

    const year =
        document.getElementById("yearFilter").value;

    filteredData
        .slice(0,100)
        .forEach(row => {

            const tr =
                document.createElement("tr");

            tr.innerHTML = `
                <td>${row["Region"] || ""}</td>
                <td>${row["Country/Territory"] || ""}</td>
                <td>${row["Production Brand"] || ""}</td>
                <td>${row["Sales Parent"] || ""}</td>
                <td>${row["Bus/Truck"] || ""}</td>
                <td>${Math.round(getYearValue(row, year)).toLocaleString()}</td>
            `;

            tbody.appendChild(tr);
        });
}
