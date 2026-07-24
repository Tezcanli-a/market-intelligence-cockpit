const ctx = document.getElementById("trendChart");

new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["2026", "2027", "2028"],
        datasets: [{
            label: "Production",
            data: [100, 150, 200],
            backgroundColor: "#003366"
        }]
    }
});
