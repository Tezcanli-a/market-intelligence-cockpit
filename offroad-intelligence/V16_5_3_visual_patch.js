/* V16.5.3 Visual Analysis Patch
   Replace your existing renderMatrix() and renderHeatmap() functions in app.js with the functions below.
   This patch assumes your existing helper functions still exist: safeHtml, setHtml, badge, tag, list, val, arr, searchMatch, norm.
*/

function scoreLabel(score) {
  if (score >= 3) return 'High';
  if (score >= 2) return 'Medium';
  return 'Low';
}

function scoreClass(label) {
  return String(label || 'Low').toLowerCase();
}

function getCustomerProfile(customer) {
  return (state.data.customerProfiles || []).find(p =>
    p.customerId === customer.customerId ||
    p.customerId === customer.id ||
    p.name === customer.customer ||
    p.name === customer.name ||
    (p.name || '').includes(customer.customer || customer.name || '')
  ) || {};
}

function getProfileDynamic(profile) {
  return profile.level3DynamicIntelligence || {};
}

function customerOpportunityScore(profile) {
  const d = getProfileDynamic(profile);
  const oppCount = arr(d.opportunities).length + (d.accountOpportunity ? 1 : 0);
  if (oppCount >= 3) return 3;
  if (oppCount >= 1) return 2;
  return 1;
}

function customerTechScore(profile) {
  const d = getProfileDynamic(profile);
  const themeCount = arr(d.technologyThemes).length;
  if (themeCount >= 4) return 3;
  if (themeCount >= 2) return 2;
  return 1;
}

function customerCompetitorThreatScore(customer, profile) {
  const matrixIds = arr(customer.competitorIds);
  const d = getProfileDynamic(profile);
  const exposure = arr(d.competitorExposure);
  const total = Math.max(matrixIds.length, exposure.length);
  if (total >= 4) return 3;
  if (total >= 2) return 2;
  return total >= 1 ? 1 : 0;
}

function priorityCode(opp, threat, tech) {
  if (opp === 'High' && threat === 'High') return 'P1';
  if (opp === 'High' || threat === 'High' || tech === 'High') return 'P2';
  if (opp === 'Medium' || threat === 'Medium') return 'P3';
  return 'Monitor';
}

function renderMatrix() {
  const customers = (state.data.customers || []).filter(searchMatch);
  const competitors = state.data.competitors || [];
  const rows = customers.map(c => {
    const profile = getCustomerProfile(c);
    const dynamic = getProfileDynamic(profile);
    const opp = scoreLabel(customerOpportunityScore(profile));
    const threat = scoreLabel(customerCompetitorThreatScore(c, profile));
    const tech = scoreLabel(customerTechScore(profile));
    const priority = priorityCode(opp, threat, tech);
    const exposedCompetitors = arr(dynamic.competitorExposure).length ? arr(dynamic.competitorExposure) : competitors.filter(comp => arr(c.competitorIds).includes(comp.id)).map(comp => comp.name);
    return { customer: c, profile, dynamic, opp, threat, tech, priority, exposedCompetitors };
  });

  const p1 = rows.filter(r => r.priority === 'P1').length;
  const highOpp = rows.filter(r => r.opp === 'High').length;
  const highThreat = rows.filter(r => r.threat === 'High').length;

  const summary = `
    <div class="matrix-kpis">
      <div class="mini-kpi"><span>P1 accounts</span><strong>${p1}</strong></div>
      <div class="mini-kpi"><span>High opportunity</span><strong>${highOpp}</strong></div>
      <div class="mini-kpi"><span>High competitive pressure</span><strong>${highThreat}</strong></div>
      <div class="mini-kpi"><span>Accounts mapped</span><strong>${rows.length}</strong></div>
    </div>`;

  const cards = rows.map(r => `
    <article class="account-heat-card ${r.priority.toLowerCase()}">
      <div class="account-card-head">
        <div>
          <span class="meta">${safeHtml(r.profile.customerId || r.customer.id || '')}</span>
          <h3>${safeHtml(r.profile.name || r.customer.customer || r.customer.name)}</h3>
          <p class="muted">${safeHtml(r.customer.segment || arr(r.profile.level1PermanentFacts?.coreSegments).join('; '))}</p>
        </div>
        <span class="priority-chip ${r.priority.toLowerCase()}">${safeHtml(r.priority)}</span>
      </div>
      <div class="account-score-row">
        <div class="score-pill opportunity ${scoreClass(r.opp)}"><span>Opportunity</span><strong>${r.opp}</strong></div>
        <div class="score-pill threat ${scoreClass(r.threat)}"><span>Competitor pressure</span><strong>${r.threat}</strong></div>
        <div class="score-pill tech ${scoreClass(r.tech)}"><span>Technology change</span><strong>${r.tech}</strong></div>
      </div>
      <div class="info-box compact-info"><strong>Relevant competitors</strong>${r.exposedCompetitors.length ? r.exposedCompetitors.map(tag).join('') : '<span class="muted">No competitor exposure linked</span>'}</div>
      <div class="info-box compact-info"><strong>Opportunity themes</strong>${arr(r.dynamic.opportunities).length ? list(r.dynamic.opportunities) : '<span class="muted">No opportunity populated yet</span>'}</div>
      <div class="account-action"><b>Next action:</b> ${safeHtml(r.customer.nextAction || arr(r.dynamic.nextActions)[0] || 'Define account-specific next action')}</div>
    </article>`).join('');

  const heatTable = `
    <div class="heading compact-heading"><div><span>Competitive pressure map</span><h2>Customer × competitor exposure</h2></div><small>Color indicates exposure intensity, not confirmed win/loss status.</small></div>
    <div class="table-wrap visual-table"><table>
      <thead><tr><th>Customer</th>${competitors.map(c => `<th>${safeHtml(c.name)}</th>`).join('')}<th>Priority</th></tr></thead>
      <tbody>${rows.map(r => `<tr>
        <td><strong>${safeHtml(r.profile.name || r.customer.customer || r.customer.name)}</strong><br><span class="muted">${safeHtml(r.customer.segment || '')}</span></td>
        ${competitors.map(comp => {
          const linked = arr(r.customer.competitorIds).includes(comp.id) || r.exposedCompetitors.includes(comp.name);
          const cls = linked ? (r.threat === 'High' ? 'cell-high' : r.threat === 'Medium' ? 'cell-medium' : 'cell-low') : 'cell-empty';
          return `<td class="heat-cell-table ${cls}">${linked ? safeHtml(r.threat) : ''}</td>`;
        }).join('')}
        <td><span class="priority-chip ${r.priority.toLowerCase()}">${safeHtml(r.priority)}</span></td>
      </tr>`).join('')}</tbody>
    </table></div>`;

  setHtml('matrixTable', `${summary}<div class="account-heat-grid">${cards}</div>${heatTable}`);
}

function normalizeImpact(item) {
  const raw = String(item.impact || item.revenueImpact || item.potentialImpactLevel || item.priority || item.riskLevel || '').toLowerCase();
  if (raw.includes('high') || raw === '5' || raw === '4') return 'High';
  if (raw.includes('medium') || raw === '3') return 'Medium';
  return 'Low';
}

function normalizeLikelihood(item) {
  const raw = String(item.likelihood || item.probability || item.chance || item.priority || item.riskLevel || '').toLowerCase();
  if (raw.includes('high') || raw === '5' || raw === '4') return 'High';
  if (raw.includes('medium') || raw === '3') return 'Medium';
  return 'Low';
}

function itemTitle(item, type) {
  return val(item, ['opportunity', 'description', 'riskDescription', 'title', 'name'], type === 'Opportunity' ? 'Untitled opportunity' : 'Untitled risk');
}

function itemBusinessText(item) {
  return val(item, ['nextAction', 'mitigation', 'mitigation / watch action', 'potentialImpact', 'whyAttractive', 'why attractive', 'status'], 'No action text populated yet.');
}

function renderMatrixBubble(item, type) {
  const impact = normalizeImpact(item);
  const likelihood = normalizeLikelihood(item);
  const cls = type === 'Opportunity' ? 'bubble-opportunity' : 'bubble-risk';
  return `<div class="priority-bubble ${cls} impact-${impact.toLowerCase()} likelihood-${likelihood.toLowerCase()}">
    <span class="bubble-type">${safeHtml(type)}</span>
    <strong>${safeHtml(itemTitle(item, type))}</strong>
    <small>Impact: ${impact} · Probability: ${likelihood}</small>
    <p>${safeHtml(itemBusinessText(item))}</p>
  </div>`;
}

function renderHeatmap() {
  const opportunities = (state.data.opportunities || []).filter(searchMatch).map(x => ({...x, _type: 'Opportunity'}));
  const risks = (state.data.risks || []).filter(searchMatch).map(x => ({...x, _type: 'Risk'}));
  const items = [...opportunities, ...risks];

  const bucket = (impact, likelihood) => items.filter(x => normalizeImpact(x) === impact && normalizeLikelihood(x) === likelihood);
  const highHigh = bucket('High', 'High');
  const highLow = items.filter(x => normalizeImpact(x) === 'High' && normalizeLikelihood(x) !== 'High');
  const lowHigh = items.filter(x => normalizeImpact(x) !== 'High' && normalizeLikelihood(x) === 'High');
  const lowLow = items.filter(x => normalizeImpact(x) !== 'High' && normalizeLikelihood(x) !== 'High');

  const summary = `
    <div class="matrix-kpis">
      <div class="mini-kpi red"><span>Act now</span><strong>${highHigh.length}</strong></div>
      <div class="mini-kpi amber"><span>Watch closely</span><strong>${highLow.length}</strong></div>
      <div class="mini-kpi green"><span>Execute selectively</span><strong>${lowHigh.length}</strong></div>
      <div class="mini-kpi gray"><span>Monitor</span><strong>${lowLow.length}</strong></div>
    </div>`;

  const quadrant = (title, subtitle, arr, cls) => `<div class="risk-opp-quadrant ${cls}">
    <div class="quadrant-head"><h3>${title}</h3><span>${subtitle}</span></div>
    ${arr.length ? arr.map(x => renderMatrixBubble(x, x._type)).join('') : '<p class="muted">No items yet</p>'}
  </div>`;

  const matrix = `
    <div class="true-heatmap">
      <div class="axis-y">Impact</div>
      <div class="axis-x">Probability / likelihood</div>
      ${quadrant('Act now', 'High impact / high probability', highHigh, 'q-red')}
      ${quadrant('Watch closely', 'High impact / lower probability', highLow, 'q-amber')}
      ${quadrant('Execute selectively', 'Lower impact / high probability', lowHigh, 'q-green')}
      ${quadrant('Monitor', 'Lower impact / lower probability', lowLow, 'q-gray')}
    </div>`;

  setHtml('heatmapGrid', `${summary}${matrix}`);
}
