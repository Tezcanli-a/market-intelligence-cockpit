/* V17.6B Relationship Engine
   Paste this block immediately BEFORE: function renderAll(){
   It overrides the older renderRelationships() function without changing the rest of app.js.
*/

function v176bThemeById(id){
  return (state.data.themes || []).find(t => t.themeId === id) || null;
}

function v176bNamedTagsFromIds(items, ids, nameKeys){
  return arr(ids).map(id => {
    const item = (items || []).find(x => x.id === id || x.customerId === id || x.competitorId === id || x.technologyId === id || x.themeId === id);
    if(!item) return tag(id);
    const name = nameKeys.map(k => item[k]).find(Boolean) || id;
    return tag(name);
  }).join('');
}

function v176bThemeTags(signal){
  const ids = arr(signal.themeIds);
  if(!ids.length) return '<span class="muted">No theme linked yet</span>';
  return ids.map(id => {
    const theme = v176bThemeById(id);
    return tag(theme ? theme.name : id);
  }).join('');
}

function v176bEvidenceTags(signal){
  const explicitIds = arr(signal.linkedEvidenceIds);
  if(explicitIds.length) return explicitIds.map(tag).join('');
  const evidence = evidenceForSignal(signal.id || signal.signalId);
  return evidence.length ? evidence.map(e => tag(e.evidenceId || e.id || e.title)).join('') : '<span class="muted">No evidence linked yet</span>';
}

function v176bAssessmentTags(signal){
  const explicitIds = arr(signal.linkedAssessmentIds);
  if(explicitIds.length) return explicitIds.map(tag).join('');
  const assessment = assessmentForSignal(signal.id || signal.signalId);
  return assessment ? tag(assessment.assessmentId || assessment.id || assessment.title) : '<span class="muted">No assessment linked yet</span>';
}

function v176bOpportunityRiskTags(signal){
  const opp = arr(signal.opportunityIds).map(tag).join('');
  const risk = arr(signal.riskIds).map(tag).join('');
  return (opp || risk) ? (opp + risk) : '<span class="muted">No opportunity or risk linked yet</span>';
}

function renderRelationships(){
  const signals = (state.data.signals || []).filter(searchMatch);
  const customers = state.data.customers || [];
  const competitors = state.data.competitors || [];
  const technologies = state.data.technologies || [];

  const html = signals.map(s => {
    const signalId = s.id || s.signalId || '';
    const customerTags = v176bNamedTagsFromIds(customers, s.customerIds, ['customer','name']);
    const competitorTags = v176bNamedTagsFromIds(competitors, s.competitorIds, ['name','competitor']);
    const technologyTags = v176bNamedTagsFromIds(technologies, s.technologyIds, ['theme','name','technology']);

    return `
      <article class="v176b-network-card">
        <div class="v176b-network-top">
          <div>
            <span class="meta">${safeHtml(signalId)} · ${safeHtml(s.perspective || 'Perspective not set')}</span>
            <h3>${safeHtml(s.signal || s.title || 'Untitled signal')}</h3>
          </div>
          <div>${badge(s.priority || 'Medium')}</div>
        </div>

        <div class="v176b-flow">
          <div class="v176b-flow-step">
            <strong>Theme</strong>
            <p>${v176bThemeTags(s)}</p>
          </div>
          <div class="v176b-arrow">→</div>
          <div class="v176b-flow-step">
            <strong>Evidence</strong>
            <p>${v176bEvidenceTags(s)}</p>
          </div>
          <div class="v176b-arrow">→</div>
          <div class="v176b-flow-step v176b-signal-step">
            <strong>Signal</strong>
            <p>${safeHtml(signalId)}</p>
          </div>
          <div class="v176b-arrow">→</div>
          <div class="v176b-flow-step">
            <strong>Assessment</strong>
            <p>${v176bAssessmentTags(s)}</p>
          </div>
          <div class="v176b-arrow">→</div>
          <div class="v176b-flow-step">
            <strong>Opportunity / Risk</strong>
            <p>${v176bOpportunityRiskTags(s)}</p>
          </div>
          <div class="v176b-arrow">→</div>
          <div class="v176b-flow-step v176b-action-step">
            <strong>Action</strong>
            <p>${safeHtml(s.action || s.recommendedAction || 'Define next action')}</p>
          </div>
        </div>

        <div class="v176b-entity-grid">
          <div class="v176b-entity-box">
            <strong>Customers</strong>
            <p>${customerTags || '<span class="muted">No customer linked</span>'}</p>
          </div>
          <div class="v176b-entity-box">
            <strong>Competitors</strong>
            <p>${competitorTags || '<span class="muted">No competitor linked</span>'}</p>
          </div>
          <div class="v176b-entity-box">
            <strong>Technologies</strong>
            <p>${technologyTags || '<span class="muted">No technology linked</span>'}</p>
          </div>
        </div>

        <div class="v176b-why-box">
          <strong>Why this matters</strong>
          <p>${safeHtml(s.why || 'No interpretation populated yet.')}</p>
        </div>
      </article>
    `;
  }).join('');

  setHtml('relationshipGrid', html || '<p class="empty">No relationships found.</p>');
}
