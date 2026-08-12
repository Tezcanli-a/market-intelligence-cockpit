const state = {
  data: {},
  filters: { segment: "all", perspective: "all", priority: "all", search: "" }
};

const files = {
  meta: "data/meta.json",
  signals: "data/signals.json",
  competitors: "data/competitors.json",
  customers: "data/customers.json",
  technologies: "data/technologies.json",
  opportunities: "data/opportunities.json",
  risks: "data/risks.json",
  weekly: "data/weekly.json",
  roadmap: "data/roadmap.json"
};

async function loadData() {
  const entries = await Promise.all(Object.entries(files).map(async ([key, path]) => {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Could not load ${path}`);
    return [key, await response.json()];
  }));
  state.data = Object.fromEntries(entries);
}

function norm(value) { return String(value || "").toLowerCase(); }
function badge(priority) { return `<span class="badge ${norm(priority)}">${priority}</span>`; }
function includesSegment(value, segment) { return segment === "all" || norm(value).includes(norm(segment)) || norm(value).includes("all offroad"); }
function searchMatch(obj) {
  if (!state.filters.search) return true;
  return norm(JSON.stringify(obj)).includes(norm(state.filters.search));
}
function filteredSignals() {
  return state.data.signals.filter(signal =>
    includesSegment(signal.segment, state.filters.segment) &&
    (state.filters.perspective === "all" || signal.perspective === state.filters.perspective) &&
    (state.filters.priority === "all" || signal.priority === state.filters.priority) &&
    searchMatch(signal)
  );
}

function setupNavigation() {
  document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
      document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(button.dataset.view).classList.add("active");
    });
  });
}

function setupFilters() {
  const segmentFilter = document.getElementById("segmentFilter");
  const perspectiveFilter = document.getElementById("perspectiveFilter");
  state.data.meta.segments.forEach(segment => segmentFilter.insertAdjacentHTML("beforeend", `<option value="${segment}">${segment}</option>`));
  state.data.meta.perspectives.forEach(perspective => perspectiveFilter.insertAdjacentHTML("beforeend", `<option value="${perspective}">${perspective}</option>`));
  segmentFilter.addEventListener("change", e => { state.filters.segment = e.target.value; renderDashboardViews(); });
  perspectiveFilter.addEventListener("change", e => { state.filters.perspective = e.target.value; renderDashboardViews(); });
  document.getElementById("priorityFilter").addEventListener("change", e => { state.filters.priority = e.target.value; renderDashboardViews(); });
  document.getElementById("searchInput").addEventListener("input", e => { state.filters.search = e.target.value; renderAll(); });
  document.getElementById("resetFilters").addEventListener("click", () => {
    state.filters = { segment: "all", perspective: "all", priority: "all", search: "" };
    segmentFilter.value = "all";
    perspectiveFilter.value = "all";
    document.getElementById("priorityFilter").value = "all";
    document.getElementById("searchInput").value = "";
    renderAll();
  });
}

function renderKpis(signals) {
  const high = signals.filter(signal => signal.priority === "High").length;
  const kpis = [
    ["Signals", signals.length],
    ["High priority", high],
    ["Offroad segments", state.data.meta.segments.length],
    ["Competitors", state.data.competitors.length],
    ["Customers mapped", state.data.customers.length],
    ["Tech themes", state.data.technologies.length]
  ];
  document.getElementById("kpiCards").innerHTML = kpis.map(([label, value]) => `<article class="kpi"><span>${label}</span><strong>${value}</strong></article>`).join("");
}

function renderPriorityCards(signals) {
  const sorted = [...signals].sort((a, b) => (a.priority === "High" ? -1 : 1) - (b.priority === "High" ? -1 : 1)).slice(0, 3);
  document.getElementById("priorityGrid").innerHTML = sorted.map((signal, index) => `
    <article class="signal-card">
      <div class="card-top">${badge(signal.priority)}<span class="meta">${String(index + 1).padStart(2, "0")}</span></div>
      <div class="meta">${signal.entity} · ${signal.perspective}</div>
      <h3>${signal.signal}</h3>
      <div><div class="label">Why it matters</div><p>${signal.why}</p></div>
      <div><div class="label">Recommended action</div><p>${signal.action}</p></div>
    </article>
  `).join("");
}

function renderLatest(signals) {
  document.getElementById("feedCount").textContent = `${signals.length} items`;
  document.getElementById("latestList").innerHTML = signals.map(signal => `
    <div class="compact-row">
      <div>${badge(signal.priority)}<p class="meta">${signal.perspective}</p></div>
      <div><h4>${signal.signal}</h4><p>${signal.why}</p></div>
      <div class="meta">${signal.time}<br>${signal.segment}</div>
    </div>
  `).join("");
}

function renderBars(signals) {
  const counts = signals.reduce((acc, signal) => {
    acc[signal.category] = (acc[signal.category] || 0) + 1;
    return acc;
  }, {});
  const max = Math.max(1, ...Object.values(counts));
  document.getElementById("signalBars").innerHTML = Object.entries(counts).map(([name, count]) => `
    <div>
      <div class="bar-label"><strong>${name}</strong><em>${count}</em></div>
      <div class="track"><div class="fill" style="width:${(count / max) * 100}%"></div></div>
    </div>
  `).join("");
}

function renderSignalsTable() {
  const signals = filteredSignals();
  document.getElementById("signalsTable").innerHTML = `
    <table>
      <thead><tr><th>ID</th><th>Priority</th><th>Perspective</th><th>Segment</th><th>Signal</th><th>Why it matters</th><th>Recommended action</th><th>Owner</th></tr></thead>
      <tbody>${signals.map(s => `<tr><td>${s.id}</td><td>${badge(s.priority)}</td><td>${s.perspective}</td><td>${s.segment}</td><td><strong>${s.signal}</strong></td><td>${s.why}</td><td>${s.action}</td><td>${s.owner}</td></tr>`).join("")}</tbody>
    </table>`;
}

function renderCompetitors() {
  const competitors = state.data.competitors.filter(searchMatch);
  document.getElementById("competitorGrid").innerHTML = competitors.map(c => `
    <article class="profile-card">
      <div class="profile-cover">
        <div><div class="meta">${c.id} · ${c.positioning}</div><h3>${c.name}</h3></div>
        ${badge(c.relevance)}
      </div>
      <div class="profile-body">
        <p><strong>Segments:</strong> ${c.segments}</p>
        <p><strong>Customer overlaps:</strong> ${c.customerOverlaps}</p>
        <div class="profile-columns">
          <div class="info-box"><strong>Why GRAMMER wins</strong><ul>${c.whyWeWin.map(x => `<li>${x}</li>`).join("")}</ul></div>
          <div class="info-box"><strong>Why GRAMMER loses</strong><ul>${c.whyWeLose.map(x => `<li>${x}</li>`).join("")}</ul></div>
          <div class="info-box"><strong>Strengths</strong><ul>${c.strengths.map(x => `<li>${x}</li>`).join("")}</ul></div>
          <div class="info-box"><strong>Weaknesses</strong><ul>${c.weaknesses.map(x => `<li>${x}</li>`).join("")}</ul></div>
        </div>
        <div class="info-box"><strong>Questions to ask</strong><ul>${c.questions.map(x => `<li>${x}</li>`).join("")}</ul></div>
        <p><strong>Counter-message:</strong> ${c.counterMessage}</p>
      </div>
    </article>`).join("");
}

function renderCustomerMap() {
  document.getElementById("customerMap").innerHTML = `
    <table>
      <thead><tr><th>Customer / OEM</th><th>Segment</th><th>Competitors</th><th>GRAMMER position</th><th>Risk</th><th>Opportunity</th><th>Next action</th></tr></thead>
      <tbody>${state.data.customers.filter(searchMatch).map(c => `<tr><td><strong>${c.customer}</strong></td><td>${c.segment}</td><td>${c.competitors.join("; ")}</td><td>${c.grammerPosition}</td><td>${badge(c.riskLevel)}</td><td>${badge(c.opportunityLevel)}</td><td>${c.nextAction}</td></tr>`).join("")}</tbody>
    </table>`;
}

function renderTechnology() {
  document.getElementById("technologyGrid").innerHTML = state.data.technologies.filter(searchMatch).map(t => `
    <article class="radar-card">
      <div class="card-top"><h3>${t.theme}</h3>${badge(t.relevance)}</div>
      <p><strong>Maturity:</strong> ${t.maturity}</p>
      <p><strong>Affected segments:</strong> ${t.segments}</p>
      <p><strong>Watch signals:</strong> ${t.watchSignals}</p>
      <p><strong>Owner:</strong> ${t.owner}</p>
    </article>`).join("");
}

function renderRegisters() {
  document.getElementById("opportunityGrid").innerHTML = state.data.opportunities.filter(searchMatch).map(o => `
    <article class="register-card"><div class="card-top"><span class="meta">${o.id}</span>${badge(o.priority)}</div><h3>${o.opportunity}</h3><p><strong>Segment:</strong> ${o.segment}</p><p><strong>Why attractive:</strong> ${o.why}</p><p><strong>Next action:</strong> ${o.nextAction}</p></article>`).join("");
  document.getElementById("riskGrid").innerHTML = state.data.risks.filter(searchMatch).map(r => `
    <article class="register-card"><div class="card-top"><span class="meta">${r.id} · ${r.type}</span>${badge(r.priority)}</div><h3>${r.description}</h3><p><strong>Potential impact:</strong> ${r.potentialImpact}</p><p><strong>Mitigation:</strong> ${r.mitigation}</p><p><strong>Status:</strong> ${r.status}</p></article>`).join("");
}

function renderWeeklyAndRoadmap() {
  document.getElementById("weeklyDigest").innerHTML = state.data.weekly.map(d => `<article class="digest-card"><span class="meta">${d.audience}</span><h3>${d.section}</h3><p>${d.content}</p></article>`).join("");
  document.getElementById("roadmapFlow").innerHTML = state.data.roadmap.map((r, i) => `<article class="roadmap-step"><span>Phase ${i + 1}</span><h3>${r.phase}</h3><p>${r.deliverables}</p></article>`).join("");
}

function renderDashboardViews() {
  const signals = filteredSignals();
  renderKpis(signals);
  renderPriorityCards(signals);
  renderLatest(signals);
  renderBars(signals);
  renderSignalsTable();
}

function renderAll() {
  renderDashboardViews();
  renderCompetitors();
  renderCustomerMap();
  renderTechnology();
  renderRegisters();
  renderWeeklyAndRoadmap();
}

async function init() {
  try {
    await loadData();
    setupNavigation();
    setupFilters();
    renderAll();
  } catch (error) {
    document.querySelector("main").innerHTML = `<section class="panel" style="padding:24px"><h2>Data loading problem</h2><p>${error.message}</p><p>Check that all JSON files are uploaded inside <strong>offroad-intelligence/data/</strong>.</p></section>`;
  }
}

init();
