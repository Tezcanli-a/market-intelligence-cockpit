const data = window.OFFROAD_DATA;
let filters = { segment: "all", perspective: "all", priority: "all" };

function norm(text) { return String(text || "").toLowerCase(); }
function matchesSegment(item, selected) {
  if (selected === "all") return true;
  return norm(item.segment).includes(norm(selected)) || norm(item.segment).includes("all offroad");
}
function filteredSignals() {
  return data.signals.filter(item =>
    matchesSegment(item, filters.segment) &&
    (filters.perspective === "all" || item.perspective === filters.perspective) &&
    (filters.priority === "all" || item.priority === filters.priority)
  );
}
function priorityClass(priority) { return priority.toLowerCase(); }

function populateFilters() {
  const segmentFilter = document.getElementById("segmentFilter");
  data.segments.forEach(segment => segmentFilter.insertAdjacentHTML("beforeend", `<option value="${segment}">${segment}</option>`));
  const perspectiveFilter = document.getElementById("perspectiveFilter");
  data.perspectives.forEach(p => perspectiveFilter.insertAdjacentHTML("beforeend", `<option value="${p}">${p}</option>`));
  segmentFilter.addEventListener("change", e => { filters.segment = e.target.value; renderDashboard(); });
  perspectiveFilter.addEventListener("change", e => { filters.perspective = e.target.value; renderDashboard(); });
  document.getElementById("priorityFilter").addEventListener("change", e => { filters.priority = e.target.value; renderDashboard(); });
  document.getElementById("resetFilters").addEventListener("click", () => {
    filters = { segment: "all", perspective: "all", priority: "all" };
    segmentFilter.value = "all";
    perspectiveFilter.value = "all";
    document.getElementById("priorityFilter").value = "all";
    renderDashboard();
  });
}

function renderKpis(signals) {
  const high = signals.filter(s => s.priority === "High").length;
  const competitorCount = data.competitors.length;
  const kpis = [
    ["Signals", signals.length],
    ["High priority", high],
    ["Offroad segments", data.segments.length],
    ["Competitors", competitorCount],
    ["Battlecards", competitorCount],
    ["Tech themes", data.technologies.length]
  ];
  document.getElementById("kpiCards").innerHTML = kpis.map(k => `<article class="kpi"><span>${k[0]}</span><strong>${k[1]}</strong></article>`).join("");
}

function renderPriorityCards(signals) {
  const sorted = [...signals].sort((a, b) => (a.priority === "High" ? -1 : 1) - (b.priority === "High" ? -1 : 1)).slice(0, 3);
  document.getElementById("priorityGrid").innerHTML = sorted.map((s, idx) => `
    <article class="card">
      <div class="card-top"><span class="badge ${priorityClass(s.priority)}">${s.priority} priority</span><span class="meta">${String(idx + 1).padStart(2,"0")}</span></div>
      <div class="meta">${s.entity} · ${s.perspective}</div>
      <h3>${s.signal}</h3>
      <div class="divider"></div>
      <h4>Why it matters</h4>
      <p>${s.why}</p>
      <div class="divider"></div>
      <h4>Recommended action</h4>
      <p>${s.action}</p>
    </article>
  `).join("");
}

function renderLatest(signals) {
  document.getElementById("feedCount").textContent = `${signals.length} items`;
  document.getElementById("latestList").innerHTML = signals.map(s => `
    <div class="list-item">
      <div><span class="badge ${priorityClass(s.priority)}">${s.priority}</span><p>${s.perspective}</p></div>
      <div><h4>${s.signal}</h4><p>${s.why}</p></div>
      <div class="meta">${s.time}<br>${s.segment}</div>
    </div>
  `).join("");
}

function renderBars(signals) {
  const counts = signals.reduce((acc, s) => { acc[s.category] = (acc[s.category] || 0) + 1; return acc; }, {});
  const max = Math.max(1, ...Object.values(counts));
  document.getElementById("signalBars").innerHTML = Object.entries(counts).map(([category, count]) => `
    <div class="bar-row">
      <span><strong>${category}</strong><em>${count}</em></span>
      <div class="bar-track"><div class="bar-fill" style="width:${(count / max) * 100}%"></div></div>
    </div>
  `).join("");
}

function renderDashboard() {
  const signals = filteredSignals();
  renderKpis(signals);
  renderPriorityCards(signals);
  renderLatest(signals);
  renderBars(signals);
}

function renderFeed() {
  document.getElementById("feedList").innerHTML = data.signals.map(s => `
    <article class="timeline-item">
      <div class="timeline-meta">${s.time} · ${s.id} · ${s.segment} · Owner: ${s.owner}</div>
      <h3>${s.signal}</h3>
      <p><strong>Why it matters:</strong> ${s.why}</p>
      <p><strong>Recommended action:</strong> ${s.action}</p>
    </article>
  `).join("");
}

function renderCompetitors() {
  document.getElementById("competitorGrid").innerHTML = data.competitors.map(c => `
    <article class="competitor-card">
      <div class="card-top"><h3>${c.name}</h3><span class="badge ${c.relevance.toLowerCase()}">${c.relevance}</span></div>
      <p><strong>Positioning:</strong> ${c.positioning}</p>
      <p><strong>Segments:</strong> ${c.segments}</p>
      <p><strong>Customer overlaps:</strong> ${c.overlaps}</p>
      <div class="profile-layout">
        <div class="profile-box"><strong>Why GRAMMER wins</strong><ul>${c.wins.map(x => `<li>${x}</li>`).join("")}</ul></div>
        <div class="profile-box"><strong>Why GRAMMER loses</strong><ul>${c.loses.map(x => `<li>${x}</li>`).join("")}</ul></div>
      </div>
      <div class="divider"></div>
      <p><strong>Counter-message:</strong> ${c.counter}</p>
      <div class="divider"></div>
      <strong class="meta">Questions to ask</strong>
      <ul>${c.questions.map(q => `<li>${q}</li>`).join("")}</ul>
    </article>
  `).join("");
}

function renderTechnology() {
  document.getElementById("technologyGrid").innerHTML = data.technologies.map(t => `
    <article class="technology-card">
      <div class="card-top"><h3>${t.theme}</h3><span class="badge ${t.relevance.toLowerCase()}">${t.relevance}</span></div>
      <p><strong>Maturity:</strong> ${t.maturity}</p>
      <p><strong>Affected segments:</strong> ${t.segments}</p>
      <p><strong>Watch signals:</strong> ${t.watch}</p>
      <p><strong>Owner:</strong> ${t.owner}</p>
    </article>
  `).join("");
}

function renderRoadmap() {
  document.getElementById("roadmapFlow").innerHTML = data.roadmap.map((r, idx) => `
    <article class="roadmap-step"><span class="eyebrow">Phase ${idx + 1}</span><h3>${r.theme}</h3><p>${r.deliverables}</p></article>
  `).join("");
}

function renderWeekly() {
  document.getElementById("weeklyDigest").innerHTML = data.weeklyDigest.map(d => `
    <article class="digest-card"><span class="eyebrow dark">${d.audience}</span><h3>${d.section}</h3><p>${d.content}</p></article>
  `).join("");
}

function setupTabs() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.view).classList.add("active");
    });
  });
}

populateFilters();
setupTabs();
renderDashboard();
renderFeed();
renderCompetitors();
renderTechnology();
renderRoadmap();
renderWeekly();
