const state = {
  data: {},
  filters: { segment: 'all', perspective: 'all', priority: 'all', search: '' },
  newsMode: 'all'
};

const files = {
  meta: 'data/meta.json',
  signals: 'data/signals.json',
  competitors: 'data/competitors.json',
  customers: 'data/customers.json',
  technologies: 'data/technologies.json',
  opportunities: 'data/opportunities.json',
  risks: 'data/risks.json',
  weekly: 'data/weekly.json',
  research: 'data/research.json',
  keyfigures: 'data/keyfigures.json',
  customerProfiles: 'data/customer_profiles.json',
  competitorProfiles: 'data/competitor_profiles.json',
  benchmarking: 'data/benchmarking.json',
  evidence: 'data/evidence.json',
  assessments: 'data/assessments.json'
};

const defaults = {
  meta: { segments: ['Agriculture', 'Construction', 'Material Handling', 'Turf', 'Offroad'], perspectives: ['Sales', 'R&D', 'Product Management', 'Innovation', 'Procurement', 'Strategy'] },
  signals: [], competitors: [], customers: [], technologies: [], opportunities: [], risks: [], weekly: [], research: [], keyfigures: [], customerProfiles: [], competitorProfiles: [], benchmarking: [], evidence: [], assessments: [], newsRaw: { lastUpdated: '', news: [] }
};

async function fetchOptional(path, fallback) {
  try { const r = await fetch(path, { cache: 'no-store' }); if (!r.ok) return fallback; return await r.json(); }
  catch (e) { return fallback; }
}

async function loadData() {
  const entries = await Promise.all(Object.entries(files).map(async ([k, p]) => [k, await fetchOptional(p, defaults[k])]));
  state.data = Object.fromEntries(entries);
  state.data.newsRaw = await loadNewsFeed();
}

async function loadNewsFeed() {
  for (const p of ['../news-data.json', './news-data.json', 'data/news-data.json']) {
    const d = await fetchOptional(p, null);
    if (d && Array.isArray(d.news)) return d;
  }
  return defaults.newsRaw;
}

const norm = v => String(v || '').toLowerCase();
const cleanText = v => String(v || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const extractUrl = v => { const m = String(v || '').match(/https?:\/\/[^\s"<>]+/); return m ? m[0] : ''; };
const esc = v => cleanText(v).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const badge = p => `<span class="badge ${norm(p)}">${esc(p)}</span>`;
const tag = t => `<span class="tag">${esc(t)}</span>`;
const list = a => Array.isArray(a) && a.length ? `<ul>${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<span class="muted">Not populated yet</span>';
const byIds = (arr, ids) => arr.filter(x => ids?.includes(x.id) || ids?.includes(x.customerId) || ids?.includes(x.competitorId) || ids?.includes(x.technologyId));
const searchMatch = o => !state.filters.search || norm(JSON.stringify(o)).includes(norm(state.filters.search));
const segMatch = (v, s) => s === 'all' || norm(v).includes(norm(s)) || norm(v).includes('all offroad');

function isOffroadRelevant(n) {
  const auto = norm(n.auto_cv);
  const cat = norm(cleanText(n.category));
  return (auto.includes('cv') || auto.includes('commercial')) && ['construction', 'agriculture', 'material', 'handling', 'turf', 'offroad', 'off-highway'].some(x => cat.includes(x));
}
function newsType(n) { const sec = norm(n.section); if (sec.includes('competitor')) return 'Competitor'; if (sec.includes('customer')) return 'Customer'; return 'News & Trends'; }
function relevantNews() { let arr = (state.data.newsRaw.news || []).filter(isOffroadRelevant).filter(searchMatch); if (state.newsMode !== 'all') arr = arr.filter(n => newsType(n).toLowerCase().includes(state.newsMode)); return arr; }
function filteredSignals() { return (state.data.signals || []).filter(s => segMatch(s.segment || s.industrySegment || '', state.filters.segment) && (state.filters.perspective === 'all' || s.perspective === state.filters.perspective) && (state.filters.priority === 'all' || s.priority === state.filters.priority) && searchMatch(s)); }
function assessmentsForSignal(id) { return (state.data.assessments || []).filter(a => a.signalId === id); }
function evidenceForSignal(id) { return (state.data.evidence || []).filter(e => (e.linkedSignalIds || []).includes(id)); }
function signalById(id) { return (state.data.signals || []).find(s => s.id === id || s.signalId === id); }
function entityTags(s) { return [...byIds(state.data.competitors || [], s.competitorIds), ...byIds(state.data.customers || [], s.customerIds), ...byIds(state.data.technologies || [], s.technologyIds)].map(x => tag(x.name || x.customer || x.theme)).join(''); }

function setup() {
  document.querySelectorAll('.nav').forEach(b => b.onclick = () => { document.querySelectorAll('.nav').forEach(x => x.classList.remove('active')); document.querySelectorAll('.view').forEach(x => x.classList.remove('active')); b.classList.add('active'); document.getElementById(b.dataset.view).classList.add('active'); });
  const seg = document.getElementById('segmentFilter'), per = document.getElementById('perspectiveFilter');
  (state.data.meta.segments || []).forEach(x => seg.insertAdjacentHTML('beforeend', `<option>${esc(x)}</option>`));
  (state.data.meta.perspectives || []).forEach(x => per.insertAdjacentHTML('beforeend', `<option>${esc(x)}</option>`));
  seg.onchange = e => { state.filters.segment = e.target.value; renderAll(); };
  per.onchange = e => { state.filters.perspective = e.target.value; renderAll(); };
  document.getElementById('priorityFilter').onchange = e => { state.filters.priority = e.target.value; renderAll(); };
  document.getElementById('searchInput').oninput = e => { state.filters.search = e.target.value; renderAll(); };
  document.getElementById('resetFilters').onclick = () => { state.filters = { segment: 'all', perspective: 'all', priority: 'all', search: '' }; seg.value = 'all'; per.value = 'all'; document.getElementById('priorityFilter').value = 'all'; document.getElementById('searchInput').value = ''; renderAll(); };
  [['showAllNews', 'all'], ['showCustomerNews', 'customer'], ['showCompetitorNews', 'competitor'], ['showTrendNews', 'trend']].forEach(([id, mode]) => { const el = document.getElementById(id); if (el) el.onclick = () => { state.newsMode = mode; renderDailyNews(); }; });
}

function renderKpis(signals) {
  const rn = relevantNews(); const assessments = state.data.assessments || []; const evidence = state.data.evidence || [];
  const due = assessments.filter(a => a.reviewDate && new Date(a.reviewDate) <= new Date()).length;
  const kpis = [['Signals', signals.length], ['Assessments', assessments.length], ['Evidence items', evidence.length], ['Daily news signals', rn.length], ['High confidence', assessments.filter(a => a.confidence === 'High').length], ['Review due', due]];
  document.getElementById('kpis').innerHTML = kpis.map(([l, v]) => `<div class="kpi"><span>${l}</span><strong>${v}</strong></div>`).join('');
}

function renderPriority(signals) {
  const assessments = (state.data.assessments || []).filter(searchMatch).slice(0, 3);
  const cards = assessments.length ? assessments.map(a => {
    const s = signalById(a.signalId) || {};
    return `<article class="signal-card"><div class="card-top"><div>${badge(a.confidence || 'Medium')}<span class="meta">${esc(a.assessmentId)}</span></div></div><h3>${esc(a.title)}</h3><p class="meta">Linked signal: ${esc(a.signalId)}</p><p>${esc(a.businessImplication)}</p><div class="info-box"><strong>Forecast</strong>${esc(a.forecast)}</div></article>`;
  }) : signals.slice(0, 3).map(s => `<article class="signal-card"><div>${badge(s.priority || 'Medium')}</div><h3>${esc(s.signal)}</h3><p>${esc(s.why)}</p></article>`);
  document.getElementById('priorityGrid').innerHTML = cards.join('');
}

function renderConfidenceBars() {
  const arr = state.data.assessments || []; const counts = { High: 0, Medium: 0, Low: 0 }; arr.forEach(a => counts[a.confidence] = (counts[a.confidence] || 0) + 1);
  const max = Math.max(1, ...Object.values(counts));
  document.getElementById('confidenceBars').innerHTML = Object.entries(counts).map(([n, c]) => `<div class="bar-label"><span>${n}</span><strong>${c}</strong></div><div class="track"><div class="fill" style="width:${(c / max) * 100}%"></div></div>`).join('') || '<p>No assessments yet.</p>';
}

function renderLatestNews() {
  const rn = relevantNews().slice(0, 10);
  document.getElementById('feedCount').textContent = `${rn.length} shown`;
  document.getElementById('latestNewsList').innerHTML = rn.map(n => `<div class="compact-row"><div>${badge(newsType(n))}<br><span class="muted">${esc(n.date)}</span></div><div><h4>${esc(n.headline)}</h4><p>${esc(n.summary)}</p>${tag(n.company)}${tag(n.category)}</div></div>`).join('') || '<p class="empty">No Daily News signals found. Check path: root news-data.json.</p>';
}

function renderSignalsTable() {
  const signals = filteredSignals();
  document.getElementById('signalsTable').innerHTML = `<table><tr><th>ID</th><th>Priority</th><th>Confidence</th><th>Evidence</th><th>Perspective</th><th>Signal</th><th>Linked entities</th><th>Why it matters</th><th>Recommended action</th></tr>${signals.map(s => { const a = assessmentsForSignal(s.id || s.signalId)[0]; const e = evidenceForSignal(s.id || s.signalId); return `<tr><td>${esc(s.id || s.signalId)}</td><td>${badge(s.priority || 'Medium')}</td><td>${a ? badge(a.confidence || 'Medium') : '<span class="muted">No assessment</span>'}</td><td>${e.length}</td><td>${esc(s.perspective)}</td><td>${esc(s.signal)}</td><td>${entityTags(s)}</td><td>${esc(s.why)}</td><td>${esc(s.action)}</td></tr>`; }).join('')}</table>`;
}

function renderAssessments() {
  const arr = (state.data.assessments || []).filter(searchMatch);
  const counts = { High: arr.filter(a => a.confidence === 'High').length, Medium: arr.filter(a => a.confidence === 'Medium').length, Low: arr.filter(a => a.confidence === 'Low').length };
  document.getElementById('assessmentSummary').innerHTML = [['Assessments', arr.length], ['High confidence', counts.High], ['Medium confidence', counts.Medium], ['Low confidence', counts.Low]].map(([l, v]) => `<div class="kpi"><span>${l}</span><strong>${v}</strong></div>`).join('');
  document.getElementById('assessmentGrid').innerHTML = arr.map(a => { const s = signalById(a.signalId) || {}; const ev = evidenceForSignal(a.signalId); return `<article class="profile-card"><div class="profile-head"><div><span class="meta">${esc(a.assessmentId)} · linked to ${esc(a.signalId)}</span><h3>${esc(a.title)}</h3></div>${badge(a.confidence || 'Medium')}</div><div class="profile-columns"><div class="info-box"><strong>Signal</strong>${esc(s.signal || 'Signal not found in signals.json')}</div><div class="info-box"><strong>Business implication</strong>${esc(a.businessImplication)}</div></div><div class="info-box"><strong>Analyst assessment</strong>${esc(a.assessment)}</div><div class="info-box"><strong>Forecast / time horizon</strong>${esc(a.forecast)}<br><span class="muted">${esc(a.timeHorizon)}</span></div><div class="info-box"><strong>Evidence</strong>${ev.length ? `<ul>${ev.map(e => `<li>${esc(e.evidenceId)} · ${esc(e.title)} · ${esc(e.sourceName)} · Reliability ${esc(e.reliability)}</li>`).join('')}</ul>` : '<span class="muted">No evidence linked yet</span>'}</div><div class="entity-flow">${(a.opportunityIds || []).map(tag).join('')}${(a.riskIds || []).map(tag).join('')}<span class="tag">Review: ${esc(a.reviewDate)}</span><span class="tag">Owner: ${esc(a.owner)}</span></div></article>`; }).join('') || '<p class="empty">No assessments found. Add data/assessments.json.</p>';
}

function renderDailyNews() {
  const rn = relevantNews(); const byType = rn.reduce((a, n) => (a[newsType(n)] = (a[newsType(n)] || 0) + 1, a), {});
  document.getElementById('dailyNewsSummary').innerHTML = [['Relevant items', rn.length], ['Customers', byType.Customer || 0], ['Competitors', byType.Competitor || 0], ['News & Trends', byType['News & Trends'] || 0]].map(([l, v]) => `<div class="kpi"><span>${l}</span><strong>${v}</strong></div>`).join('');
  document.getElementById('dailyNewsTable').innerHTML = `<table><tr><th>Date</th><th>Type</th><th>Auto/CV</th><th>Category</th><th>Company / Entity</th><th>Headline</th><th>Summary</th><th>Source URL</th></tr>${rn.map(n => { const url = extractUrl(n.url) || extractUrl(n.headline); return `<tr><td>${esc(n.date)}</td><td>${badge(newsType(n))}</td><td>${esc(n.auto_cv)}</td><td>${esc(n.category)}</td><td>${esc(n.company)}</td><td>${esc(n.headline)}</td><td>${esc(n.summary)}</td><td>${url ? `<a class="news-link" href="${url}" target="_blank" rel="noopener">Open source</a>` : 'No URL'}</td></tr>`; }).join('')}</table>`;
}

function renderRelationships() { document.getElementById('relationshipGrid').innerHTML = (state.data.signals || []).filter(searchMatch).map(s => `<article class="relationship-card"><span class="meta">${esc(s.id || '')}</span>${badge(s.priority || 'Medium')}<h3>${esc(s.signal)}</h3><div class="entity-flow">${tag('Signal')}<span class="arrow">→</span>${entityTags(s) || tag('No linked entity')}</div></article>`).join(''); }
function renderCustomerProfiles() { document.getElementById('customerProfiles').innerHTML = (state.data.customerProfiles || []).filter(searchMatch).map(c => { const l1 = c.level1PermanentFacts || {}, l2 = c.level2QuarterlyFacts || {}, l3 = c.level3DynamicIntelligence || {}, opp = l3.accountOpportunity || c.accountOpportunity || {}; return `<article class="profile-card"><span class="meta">${esc(c.customerId || '')} · ${esc(c.profileStatus || '')}</span><h3>${esc(c.name)}</h3>${badge('Customer')}<div class="profile-columns"><div class="info-box"><strong>Level 1 · Permanent facts</strong><b>HQ:</b> ${esc(l1.headquarters)}<br><b>Segments:</b> ${esc((l1.coreSegments || []).join('; '))}<br><b>Brands:</b> ${esc((l1.brands || []).join('; '))}</div><div class="info-box"><strong>Level 2 · Quarterly facts</strong><b>Revenue:</b> ${esc(l2.revenue)}<br><b>Employees:</b> ${esc(l2.employees)}<br><b>Last checked:</b> ${esc(l2.lastChecked)}</div></div><div class="info-box"><strong>Level 3 · Dynamic intelligence</strong><b>Themes:</b> ${esc((l3.technologyThemes || []).join('; '))}<br><b>Competitor exposure:</b> ${esc((l3.competitorExposure || []).join('; '))}</div><div class="info-box"><strong>Account opportunity</strong>${opp.title || opp.opportunityName ? `<b>${esc(opp.title || opp.opportunityName)}</b><br>Value: ${esc(opp.estimatedValue)} · Probability: ${esc(opp.probability)} · Timing: ${esc(opp.timing)}<br>Next action: ${esc(opp.nextAction)}` : '<span class="muted">Not populated yet</span>'}</div><div class="profile-columns"><div class="info-box"><strong>Opportunities</strong>${list(l3.opportunities)}</div><div class="info-box"><strong>Risks</strong>${list(l3.risks)}</div></div><div class="info-box"><strong>Next actions</strong>${list(l3.nextActions)}</div></article>`; }).join(''); }
function renderCompetitorProfiles() { document.getElementById('competitorProfiles').innerHTML = (state.data.competitorProfiles || []).filter(searchMatch).map(c => { const l1 = c.level1PermanentFacts || {}, l2 = c.level2QuarterlyFacts || {}, l3 = c.level3DynamicIntelligence || {}, m = c.momentum || l3.momentum || {}; return `<article class="profile-card"><span class="meta">${esc(c.competitorId || '')} · ${esc(c.profileStatus || '')}</span><h3>${esc(c.name)}</h3>${badge('Competitor')}<div class="profile-columns"><div class="info-box"><strong>Level 1 · Permanent facts</strong><b>HQ:</b> ${esc(l1.headquarters)}<br><b>Ownership:</b> ${esc(l1.ownership)}<br><b>Products:</b> ${esc((l1.coreProducts || []).join('; '))}</div><div class="info-box"><strong>Level 2 · Quarterly facts</strong><b>Revenue:</b> ${esc(l2.revenue)}<br><b>Employees:</b> ${esc(l2.employees)}<br><b>Last checked:</b> ${esc(l2.lastChecked)}</div></div><div class="info-box"><strong>Competitor momentum</strong>${m.status || m.momentum ? `<b>${esc(m.status || m.momentum)}</b>${list(m.drivers)}` : '<span class="muted">Not populated yet</span>'}</div><div class="profile-columns"><div class="info-box"><strong>Strengths</strong>${list(l3.strengths)}</div><div class="info-box"><strong>Weaknesses</strong>${list(l3.weaknesses)}</div></div><div class="info-box"><strong>Sales enablement · Questions to ask</strong>${list(l3.questionsToAsk)}<br><b>GRAMMER counter-message:</b> ${esc(l3.grammerCounterMessage)}</div></article>`; }).join(''); }
function renderBenchmarking() { document.getElementById('benchmarkGrid').innerHTML = (state.data.benchmarking || []).filter(searchMatch).map(b => `<article class="profile-card"><span class="meta">${esc(b.benchmarkId || '')} · ${esc(b.type || '')}</span><h3>${esc(b.title)}</h3><div class="info-box"><strong>Dimensions</strong>${Array.isArray(b.dimensions) ? list(b.dimensions.map(d => `${d.dimension}: ${d.comment || d.value || ''}`)) : 'No dimensions yet'}</div></article>`).join(''); }
function renderKeyFigures() { document.getElementById('keyFigureGrid').innerHTML = (state.data.keyfigures || []).filter(searchMatch).map(k => `<article class="profile-card"><span class="meta">${esc(k.entityType)} · ${esc(k.entityId)}</span><h3>${esc(k.name)}</h3><p><b>Revenue:</b> ${esc(k.revenue)}<br><b>Employees:</b> ${esc(k.employees)}<br><b>Headquarters:</b> ${esc(k.headquarters)}<br><b>Main segments:</b> ${esc(k.mainSegments)}<br><b>Source:</b> ${esc(k.source)}<br><b>Cadence:</b> ${esc(k.updateCadence)}</p></article>`).join(''); }
function renderMatrix() { const comps = state.data.competitors || []; document.getElementById('matrixTable').innerHTML = `<table><tr><th>Customer</th>${comps.map(c => `<th>${esc(c.name)}</th>`).join('')}<th>Next action</th></tr>${(state.data.customers || []).map(c => `<tr><td>${esc(c.customer)}<br><span class="muted">${esc(c.segment)}</span></td>${comps.map(comp => `<td>${(c.competitorIds || []).includes(comp.id) ? '●' : ''}</td>`).join('')}<td>${esc(c.nextAction)}</td></tr>`).join('')}</table>`; }
function renderTechnology() { document.getElementById('technologyGrid').innerHTML = (state.data.technologies || []).filter(searchMatch).map(t => `<article class="card"><h3>${esc(t.theme)}</h3>${badge(t.relevance || 'Medium')}<p><b>Maturity:</b> ${esc(t.maturity)}<br><b>Affected segments:</b> ${esc(t.segments)}<br><b>Watch signals:</b> ${esc(t.watchSignals)}</p></article>`).join(''); }
function renderHeatmap() { const cells = [['High opportunity', (state.data.opportunities || []).filter(o => o.priority === 'High')], ['High risk', (state.data.risks || []).filter(r => r.priority === 'High')], ['Medium opportunity', (state.data.opportunities || []).filter(o => o.priority === 'Medium')], ['Other risks', (state.data.risks || []).filter(r => r.priority !== 'High')]]; document.getElementById('heatmapGrid').innerHTML = cells.map(([t, arr]) => `<article class="heat-cell"><h3>${t}</h3>${arr.length ? list(arr.map(x => x.opportunity || x.description || x.title)) : '<span class="muted">No items yet</span>'}</article>`).join(''); }

function renderDashboardViews() { const signals = filteredSignals(); renderKpis(signals); renderPriority(signals); renderLatestNews(); renderConfidenceBars(); renderSignalsTable(); }
function renderAll() { renderDashboardViews(); renderAssessments(); renderDailyNews(); renderRelationships(); renderCustomerProfiles(); renderCompetitorProfiles(); renderBenchmarking(); renderKeyFigures(); renderMatrix(); renderTechnology(); renderHeatmap(); }
async function init() { try { await loadData(); setup(); renderAll(); } catch (e) { document.querySelector('main').innerHTML = `<h3>Data loading problem</h3><p>${esc(e.message)}</p><p>Check JSON files inside offroad-intelligence/data/ and root news-data.json.</p>`; } }
init();
