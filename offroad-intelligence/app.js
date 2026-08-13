const state = { data: {}, filters: { segment: 'all', perspective: 'all', priority: 'all', search: '' }, newsMode: 'all' };
const files = {
  meta: 'data/meta.json', signals: 'data/signals.json', competitors: 'data/competitors.json', customers: 'data/customers.json',
  technologies: 'data/technologies.json', opportunities: 'data/opportunities.json', risks: 'data/risks.json', weekly: 'data/weekly.json',
  research: 'data/research.json', benchmarking: 'data/benchmarking.json', evidence: 'data/evidence.json', assessments: 'data/assessments.json',
  customerProfiles: 'data/customer_profiles.json', competitorProfiles: 'data/competitor_profiles.json', performance: 'data/performance_trends.json'
};
const defaults = { meta:{segments:['Agriculture','Construction','Material Handling','Turf','Offroad'], perspectives:['Sales','R&D','Product Management','Innovation','Procurement','Strategy']}, signals:[], competitors:[], customers:[], technologies:[], opportunities:[], risks:[], weekly:[], research:[], benchmarking:[], evidence:[], assessments:[], customerProfiles:[], competitorProfiles:[], performance:[], newsRaw:{lastUpdated:'',news:[]} };
async function fetchOptional(path,fallback){try{const r=await fetch(path,{cache:'no-store'}); return r.ok ? await r.json() : fallback;}catch(e){return fallback;}}
async function loadNewsFeed(){for(const p of ['../news-data.json','./news-data.json','data/news-data.json']){const d=await fetchOptional(p,null); if(d && Array.isArray(d.news)) return d;} return defaults.newsRaw;}
async function loadData(){const entries=await Promise.all(Object.entries(files).map(async([k,p])=>[k,await fetchOptional(p,defaults[k])])); state.data=Object.fromEntries(entries); state.data.newsRaw=await loadNewsFeed(); if(!state.data.assessments.length) seedFallbackAssessments();}
const norm=v=>String(v||'').toLowerCase();
const arr=x=>Array.isArray(x)?x:(x?[x]:[]);
const cleanText=v=>String(Array.isArray(v)?v.join('; '):v||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const safeHtml=v=>cleanText(v).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const extractUrl=v=>{const m=String(v||'').match(/https?:\/\/[^\s"<>]+/); return m?m[0]:'';};
const val=(o,keys,fb='')=>{for(const k of keys){if(o && o[k]!==undefined && o[k]!==null && o[k]!== '') return o[k];} return fb;};
const setHtml=(id,html)=>{const el=document.getElementById(id); if(el) el.innerHTML=html;};
const badge=p=>`<span class="badge ${norm(p)}">${safeHtml(p)}</span>`;
const tag=t=>`<span class="tag">${safeHtml(t)}</span>`;
const list=a=>arr(a).length?`<ul>${arr(a).map(x=>`<li>${safeHtml(typeof x==='object'?JSON.stringify(x):x)}</li>`).join('')}</ul>`:'<span class="muted">Not populated yet</span>';
const searchMatch=o=>!state.filters.search || norm(JSON.stringify(o)).includes(norm(state.filters.search));
const segMatch=(v,s)=>s==='all'||norm(v).includes(norm(s))||norm(v).includes('all offroad');
function byIds(items,ids){return (items||[]).filter(x=>ids?.includes(x.id)||ids?.includes(x.customerId)||ids?.includes(x.competitorId)||ids?.includes(x.technologyId));}
function isOffroadRelevant(n){const auto=norm(n.auto_cv);const cat=norm(cleanText(n.category));return (auto.includes('cv')||auto.includes('commercial'))&&['construction','agriculture','material','handling','turf','offroad','off-highway'].some(x=>cat.includes(x));}
function newsType(n){const sec=norm(n.section);if(sec.includes('competitor'))return 'Competitor'; if(sec.includes('customer'))return 'Customer'; return 'News & Trends';}
function relevantNews(){let out=(state.data.newsRaw.news||[]).filter(isOffroadRelevant).filter(searchMatch); if(state.newsMode==='customer')out=out.filter(n=>newsType(n)==='Customer'); if(state.newsMode==='competitor')out=out.filter(n=>newsType(n)==='Competitor'); if(state.newsMode==='trend')out=out.filter(n=>newsType(n)==='News & Trends'); return out;}
function filteredSignals(){return (state.data.signals||[]).filter(s=>segMatch(val(s,['segment','industrySegment'],''),state.filters.segment)&&(state.filters.perspective==='all'||s.perspective===state.filters.perspective)&&(state.filters.priority==='all'||s.priority===state.filters.priority)&&searchMatch(s));}
function assessmentForSignal(id){return (state.data.assessments||[]).find(a=>a.signalId===id);}
function evidenceForSignal(id){return (state.data.evidence||[]).filter(e=>(e.linkedSignalIds||[]).includes(id)||e.linkedSignalId===id);}
function signalById(id){return (state.data.signals||[]).find(s=>s.id===id||s.signalId===id);}
function confidenceFromPriority(p){return p==='High'?'Medium':p==='Low'?'Low':'Medium';}
function seedFallbackAssessments(){state.data.assessments=(state.data.signals||[]).slice(0,3).map((s,i)=>({assessmentId:`ASM-AUTO-${String(i+1).padStart(3,'0')}`,signalId:s.id,title:s.signal,assessment:s.why||'Analyst assessment not populated yet.',businessImplication:s.why||'Business implication should be added by Market Intelligence.',confidence:confidenceFromPriority(s.priority),forecast:'Forecast statement not populated yet.',timeHorizon:'To be defined',owner:s.owner||'Market Intelligence',reviewDate:s.date||'',opportunityIds:[],riskIds:[]}));}
function setup(){
 document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));b.classList.add('active');const v=document.getElementById(b.dataset.view);if(v)v.classList.add('active');});
 const seg=document.getElementById('segmentFilter'),per=document.getElementById('perspectiveFilter'),pf=document.getElementById('priorityFilter'),si=document.getElementById('searchInput'),rf=document.getElementById('resetFilters');
 if(seg)(state.data.meta.segments||[]).forEach(x=>seg.insertAdjacentHTML('beforeend',`<option>${safeHtml(x)}</option>`)); if(per)(state.data.meta.perspectives||[]).forEach(x=>per.insertAdjacentHTML('beforeend',`<option>${safeHtml(x)}</option>`));
 if(seg)seg.onchange=e=>{state.filters.segment=e.target.value;renderAll();}; if(per)per.onchange=e=>{state.filters.perspective=e.target.value;renderAll();}; if(pf)pf.onchange=e=>{state.filters.priority=e.target.value;renderAll();}; if(si)si.oninput=e=>{state.filters.search=e.target.value;renderAll();};
 if(rf)rf.onclick=()=>{state.filters={segment:'all',perspective:'all',priority:'all',search:''}; if(seg)seg.value='all'; if(per)per.value='all'; if(pf)pf.value='all'; if(si)si.value=''; renderAll();};
 [['showAllNews','all'],['showCustomerNews','customer'],['showCompetitorNews','competitor'],['showTrendNews','trend']].forEach(([id,mode])=>{const el=document.getElementById(id); if(el)el.onclick=()=>{state.newsMode=mode;renderDailyNews();};});
}
function section(title,html){return `<div class="info-box"><strong>${title}</strong>${html}</div>`;}
function kv(label,value){return value?`<b>${label}:</b> ${safeHtml(value)}<br>`:'';}
function entityTags(s){return [...byIds(state.data.competitors,s.competitorIds),...byIds(state.data.customers,s.customerIds),...byIds(state.data.technologies,s.technologyIds)].map(x=>tag(x.name||x.customer||x.theme)).join('');}
function businessImplication(s){const a=assessmentForSignal(s.id);return a?.businessImplication||s.why||'Business implication not populated yet.';}
function renderKpis(signals){const kpis=[['Signals',signals.length],['Assessments',state.data.assessments.length],['Evidence items',state.data.evidence.length],['Opportunities',state.data.opportunities.length],['High risks',state.data.risks.filter(r=>r.priority==='High'||r.riskLevel==='High').length],['News updated',state.data.newsRaw.lastUpdated?new Date(state.data.newsRaw.lastUpdated).toLocaleDateString():'n/a']]; setHtml('kpis',kpis.map(([l,v])=>`<div class="kpi"><span>${safeHtml(l)}</span><strong>${safeHtml(v)}</strong></div>`).join(''));}
function overviewList(items){if(!items.length)return'<p class="empty">No items yet.</p>';return items.map(x=>`<div class="compact-row"><div>${badge(val(x,['priority','riskLevel'],'Medium'))}</div><div><h4>${safeHtml(val(x,['opportunity','description','riskDescription','title','name'],'Untitled'))}</h4><p>${safeHtml(val(x,['nextAction','mitigation','mitigation / watch action','potentialImpact','whyAttractive','why attractive','status'],''))}</p></div></div>`).join('');}
function renderOverview(signals){const top=(signals.length?signals:state.data.signals).slice(0,3);setHtml('overviewSignalsGrid',top.map(s=>{const a=assessmentForSignal(s.id);const ev=evidenceForSignal(s.id);return `<article class="signal-card"><div>${badge(s.priority||'Medium')} ${a?badge(a.confidence||'Medium'):''}<span class="meta"> ${safeHtml(s.id||'')}</span></div><h3>${safeHtml(s.signal||s.title)}</h3><p><b>Business implication:</b> ${safeHtml(businessImplication(s))}</p><p><b>Evidence:</b> ${ev.length?`${ev.length} source${ev.length>1?'s':''}`:'0 sources'} · <b>Assessment:</b> ${a?safeHtml(a.assessmentId):'not linked'}</p><p><b>Action:</b> ${safeHtml(s.action||s.recommendedAction)}</p></article>`}).join('')||'<p class="empty">No signals available.</p>');
 const ass=state.data.assessments.filter(searchMatch).slice(0,2);setHtml('overviewAssessmentsGrid',ass.map(a=>`<article class="profile-card"><div class="profile-head"><div><span class="meta">${safeHtml(a.assessmentId)} · ${safeHtml(a.signalId)}</span><h3>${safeHtml(a.title)}</h3></div>${badge(a.confidence||'Medium')}</div>${section('Business implication',safeHtml(a.businessImplication))}${section('Forecast',safeHtml(a.forecast))}</article>`).join('')||'<p class="empty">No assessments available.</p>'); setHtml('overviewOpportunities',overviewList(state.data.opportunities.slice(0,4))); setHtml('overviewRisks',overviewList(state.data.risks.slice(0,4)));}
function renderSignalsTable(){const signals=filteredSignals();setHtml('signalsTable',`<table><tr><th>ID</th><th>Priority</th><th>Confidence</th><th>Evidence</th><th>Perspective</th><th>Signal</th><th>Linked entities</th><th>Business implication</th><th>Recommended action</th><th>Assessment</th></tr>${signals.map(s=>{const a=assessmentForSignal(s.id);const e=evidenceForSignal(s.id);return `<tr><td>${safeHtml(s.id||'')}</td><td>${badge(s.priority||'Medium')}</td><td>${a?badge(a.confidence||'Medium'):'<span class="muted">No assessment</span>'}</td><td>${e.length?`${e.length} source${e.length>1?'s':''}`:'0 sources'}</td><td>${safeHtml(s.perspective)}</td><td>${safeHtml(s.signal)}</td><td>${entityTags(s)}</td><td>${safeHtml(businessImplication(s))}</td><td>${safeHtml(s.action)}</td><td>${a?tag(a.assessmentId):'<span class="muted">No assessment</span>'}</td></tr>`}).join('')}</table>`);}
function renderAssessments(){const items=state.data.assessments.filter(searchMatch);setHtml('assessmentSummary',[['Assessments',items.length],['High confidence',items.filter(a=>a.confidence==='High').length],['Medium confidence',items.filter(a=>a.confidence==='Medium').length],['Low confidence',items.filter(a=>a.confidence==='Low').length]].map(([l,v])=>`<div class="kpi"><span>${l}</span><strong>${v}</strong></div>`).join('')); setHtml('assessmentGrid',items.map(a=>{const s=signalById(a.signalId)||{};const ev=evidenceForSignal(a.signalId);return `<article class="profile-card"><div class="profile-head"><div><span class="meta">${safeHtml(a.assessmentId)} · linked to ${safeHtml(a.signalId)}</span><h3>${safeHtml(a.title)}</h3></div>${badge(a.confidence||'Medium')}</div>${section('Layer 1 · Evidence',ev.length?`<ul>${ev.map(e=>`<li>${safeHtml(e.evidenceId)} · ${safeHtml(e.title)} · ${safeHtml(e.sourceName)} · Reliability ${safeHtml(e.reliability)}</li>`).join('')}</ul>`:'<span class="muted">No evidence linked yet.</span>')}${section('Layer 2 · Interpretation',`<b>Signal:</b> ${safeHtml(s.signal||a.title)}<br><b>Analyst assessment:</b> ${safeHtml(a.assessment)}<br><b>Business implication:</b> ${safeHtml(a.businessImplication)}`)}${section('Layer 3 · Decision support',`<b>Forecast:</b> ${safeHtml(a.forecast)}<br><b>Time horizon:</b> ${safeHtml(a.timeHorizon)}<br><b>Owner:</b> ${safeHtml(a.owner)}<br><b>Review:</b> ${safeHtml(a.reviewDate)}`)}<div class="entity-flow">${arr(a.opportunityIds).map(tag).join('')}${arr(a.riskIds).map(tag).join('')}</div></article>`}).join('')||'<p class="empty">No assessments found.</p>');}
function renderDailyNews(){const rn=relevantNews();const byType=rn.reduce((a,n)=>(a[newsType(n)]=(a[newsType(n)]||0)+1,a),{});setHtml('dailyNewsSummary',[['Relevant items',rn.length],['Customers',byType.Customer||0],['Competitors',byType.Competitor||0],['News & Trends',byType['News & Trends']||0]].map(([l,v])=>`<div class="kpi"><span>${l}</span><strong>${v}</strong></div>`).join(''));setHtml('dailyNewsTable',`<table><tr><th>Date</th><th>Type</th><th>Auto/CV</th><th>Category</th><th>Company / Entity</th><th>Headline</th><th>Source summary</th><th>Source URL</th></tr>${rn.map(n=>{const url=extractUrl(n.url)||extractUrl(n.headline);return `<tr><td>${safeHtml(n.date)}</td><td>${badge(newsType(n))}</td><td>${safeHtml(n.auto_cv)}</td><td>${safeHtml(n.category)}</td><td>${safeHtml(n.company)}</td><td>${safeHtml(n.headline)}</td><td>${safeHtml(n.summary)}</td><td>${url?`<a class="news-link" href="${url}" target="_blank" rel="noopener">Open source</a>`:'No URL'}</td></tr>`}).join('')}</table>`);}
function renderRelationships(){setHtml('relationshipGrid',state.data.signals.filter(searchMatch).map(s=>`<article class="relationship-card"><span class="meta">${safeHtml(s.id||'')}</span>${badge(s.priority||'Medium')}<h3>${safeHtml(s.signal)}</h3><div class="entity-flow">${tag('Signal')}<span class="arrow">→</span>${entityTags(s)||tag('No linked entity')}</div></article>`).join(''));}
function renderCustomerProfiles(){const items=state.data.customerProfiles.filter(searchMatch);setHtml('customerProfiles',items.map(c=>{const l1=c.level1PermanentFacts||{},l2=c.level2QuarterlyFacts||{},l3=c.level3DynamicIntelligence||{};return `<article class="profile-card"><span class="meta">${safeHtml(c.customerId||c.id||'')}</span><h3>${safeHtml(c.name||c.customer)}</h3>${badge(c.profileStatus||'Customer')}${section('Level 1 · Permanent facts',kv('HQ',l1.headquarters)+kv('Segments',arr(l1.coreSegments).join('; '))+kv('Brands',arr(l1.brands).join('; '))+kv('Strategic relevance',arr(l1.strategicRelevanceForGrammer).join('; ')))}${section('Level 2 · Quarterly facts',kv('Revenue',l2.revenue)+kv('Net income',l2.netIncome)+kv('Employees',l2.employees)+kv('Last checked',l2.lastChecked)+kv('Source',l2.source))}${section('Level 3 · Dynamic intelligence',kv('Technology themes',arr(l3.technologyThemes).join('; '))+kv('Competitor exposure',arr(l3.competitorExposure).join('; '))+`<b>Opportunities</b>${list(l3.opportunities)}<b>Risks</b>${list(l3.risks)}<b>Next actions</b>${list(l3.nextActions)}`)}${l3.accountOpportunity?section('Account opportunity',kv('Title',l3.accountOpportunity.title)+kv('Estimated value',l3.accountOpportunity.estimatedValue)+kv('Probability',l3.accountOpportunity.probability)+kv('Timing',l3.accountOpportunity.timing)+kv('Next action',l3.accountOpportunity.nextAction)):''}</article>`}).join('')||'<p class="empty">No customer profiles available.</p>');}
function renderCompetitorProfiles(){const items=state.data.competitorProfiles.filter(searchMatch);setHtml('competitorProfiles',items.map(c=>{const l1=c.level1PermanentFacts||{},l2=c.level2QuarterlyFacts||{},l3=c.level3DynamicIntelligence||{};return `<article class="profile-card"><span class="meta">${safeHtml(c.competitorId||c.id||'')}</span><h3>${safeHtml(c.name||c.competitor)}</h3>${badge(c.profileStatus||'Competitor')}${section('Level 1 · Permanent facts',kv('HQ',l1.headquarters)+kv('Ownership',l1.ownership)+kv('Footprint',l1.footprint)+kv('Products',arr(l1.coreProducts).join('; '))+kv('Applications',arr(l1.coreApplications).join('; ')))}${section('Level 2 · Quarterly facts',kv('Revenue',l2.revenue)+kv('Employees',l2.employees)+kv('Last checked',l2.lastChecked)+kv('Source',l2.source))}${section('Strengths / weaknesses',`<b>Strengths</b>${list(l3.strengths)}<b>Weaknesses</b>${list(l3.weaknesses)}`)}${section('Sales enablement',`<b>Questions to ask</b>${list(l3.questionsToAsk)}${kv('GRAMMER counter-message',l3.grammerCounterMessage)}`)}${l3.momentum?section('Momentum',kv('Status',l3.momentum.status)+`<b>Drivers</b>${list(l3.momentum.drivers)}`):''}</article>`}).join('')||'<p class="empty">No competitor profiles available.</p>');}
function renderBenchmarking(){const items=state.data.benchmarking.filter(searchMatch);setHtml('benchmarkGrid',items.map(b=>{const dims=Array.isArray(b.dimensions)?`<ul>${b.dimensions.map(d=>`<li><b>${safeHtml(d.dimension)}</b>: ${safeHtml(d.grammerPosition?`GRAMMER ${d.grammerPosition}; competitor ${d.competitorPosition||''}. ${d.comment||d.value||''}`:d.comment||d.value||'')}</li>`).join('')}</ul>`:'<span class="muted">No dimensions yet</span>';return `<article class="profile-card"><span class="meta">${safeHtml(b.benchmarkId||b.id||'')} · ${safeHtml(b.type||'')}</span><h3>${safeHtml(b.title)}</h3>${section('Dimensions',dims)}</article>`}).join('')||'<p class="empty">No benchmarking available.</p>');}
function renderTechnology(){setHtml('technologyGrid',state.data.technologies.filter(searchMatch).map(t=>`<article class="card"><h3>${safeHtml(t.theme)}</h3>${badge(t.relevance||'Medium')}<p><b>Maturity:</b> ${safeHtml(t.maturity)}<br><b>Affected segments:</b> ${safeHtml(t.segments)}<br><b>Watch signals:</b> ${safeHtml(t.watchSignals)}</p>${section('V16.5 investment lens',kv('Market adoption',t.marketAdoption)+kv('Customer adoption',arr(t.customerAdoption).join('; '))+kv('Competitor adoption',arr(t.competitorAdoption).join('; '))+kv('GRAMMER readiness',t.grammerReadiness)+kv('Revenue potential',t.revenuePotential)||'Market adoption, customer adoption, competitor adoption, GRAMMER readiness and revenue potential can be added in the next enrichment step.')}</article>`).join('')||'<p class="empty">No technology data available.</p>');}
function latestMetricValue(metric){const values=arr(metric.values).filter(v=>v&&v.value!==undefined);if(!values.length)return null;return values.sort((a,b)=>(a.year||0)-(b.year||0))[values.length-1];}
function yoy(metric){const values=arr(metric.values).filter(v=>v&&v.value!==undefined).sort((a,b)=>(a.year||0)-(b.year||0));if(values.length<2)return null;const last=values[values.length-1],prev=values[values.length-2];if(!prev.value)return null;return ((last.value-prev.value)/prev.value)*100;}
function metricBars(metric){const values=arr(metric.values).filter(v=>v&&v.value!==undefined).sort((a,b)=>(a.year||0)-(b.year||0));if(!values.length)return '<span class="muted">No values yet</span>';const max=Math.max(...values.map(v=>Number(v.value)||0),1);return `<div class="bars mini-bars">${values.map(v=>`<div class="bar-label"><span>${safeHtml(v.year)}</span><strong>${safeHtml(v.value)} ${safeHtml(metric.unit||'')}</strong></div><div class="track"><div class="fill" style="width:${Math.max(4,((Number(v.value)||0)/max)*100)}%"></div></div>`).join('')}</div>`;}
function renderPerformance(){const items=state.data.performance.filter(searchMatch);const metricCount=items.reduce((a,x)=>a+arr(x.metrics).length,0);const metricsWithHistory=items.reduce((a,x)=>a+arr(x.metrics).filter(m=>arr(m.values).length>1).length,0);setHtml('performanceSummary',[['Entities',items.length],['Metrics',metricCount],['YoY-ready metrics',metricsWithHistory],['Current-year only',metricCount-metricsWithHistory]].map(([l,v])=>`<div class="kpi"><span>${safeHtml(l)}</span><strong>${safeHtml(v)}</strong></div>`).join(''));setHtml('performanceGrid',items.map(ent=>`<article class="profile-card"><span class="meta">${safeHtml(ent.entityType)} · ${safeHtml(ent.entityId)}</span><h3>${safeHtml(ent.name)}</h3>${arr(ent.metrics).map(m=>{const y=yoy(m);return `${section(safeHtml(m.metric),`${metricBars(m)}<p><b>YoY:</b> ${y===null?'Add previous year to calculate':(y>=0?'+':'')+y.toFixed(1)+'%'}</p>`)}`}).join('')}<p class="muted">${safeHtml(ent.note||'')}</p></article>`).join('')||'<p class="empty">No performance trend data available. Add data/performance_trends.json.</p>');}
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
function v17Arr(x){ return Array.isArray(x) ? x : (x ? [x] : []); }
function v17Clean(x){ return String(Array.isArray(x) ? x.join(' ') : (x || '')).replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim(); }
function v17Norm(x){ return v17Clean(x).toLowerCase(); }
function v17Set(id, html){ const el = document.getElementById(id); if(el) el.innerHTML = html; }
function v17Esc(x){ return v17Clean(x).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
function v17BarRows(items){
  const max = Math.max(1, ...items.map(x => x.count));
  return items.map(x => `<div class="momentum-bar-row"><strong>${v17Esc(x.name)}</strong><div class="momentum-track"><div class="momentum-fill" style="width:${Math.max(5,(x.count/max)*100)}%"></div></div><span>${x.count}</span></div>`).join('');
}
function v17Cloud(items){
  const max = Math.max(1, ...items.map(x => x.count));
  return items.map(x => {
    const size = 14 + Math.round((x.count / max) * 18);
    const cls = x.count >= max * 0.75 ? 'hot' : x.count >= max * 0.45 ? 'up' : 'flat';
    return `<span class="${cls}" style="font-size:${size}px">${v17Esc(x.name)} ${x.count}</span>`;
  }).join('');
}
function v17TextCorpus(){
  const d = state.data || {};
  const blocks = [];
  v17Arr(d.newsRaw && d.newsRaw.news).forEach(n => blocks.push(`${n.company||''} ${n.headline||''} ${n.summary||''} ${n.category||''} ${n.section||''}`));
  v17Arr(d.signals).forEach(s => blocks.push(JSON.stringify(s)));
  v17Arr(d.assessments).forEach(a => blocks.push(JSON.stringify(a)));
  v17Arr(d.customerProfiles).forEach(c => blocks.push(JSON.stringify(c)));
  v17Arr(d.competitorProfiles).forEach(c => blocks.push(JSON.stringify(c)));
  v17Arr(d.technologies).forEach(t => blocks.push(JSON.stringify(t)));
  v17Arr(d.opportunities).forEach(o => blocks.push(JSON.stringify(o)));
  v17Arr(d.risks).forEach(r => blocks.push(JSON.stringify(r)));
  return v17Norm(blocks.join(' '));
}
function v17CountMentions(names, corpus){
  return names.map(name => {
    const n = v17Norm(name);
    if(!n) return {name, count:0};
    const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'g');
    const count = (corpus.match(re) || []).length;
    return {name, count};
  }).filter(x => x.count > 0).sort((a,b) => b.count - a.count);
}
function v17TechnologyNames(){
  const base = ['Automation','Operator Environment','Integrated Cabin','HMI','Sensors','Electrification','Precision Agriculture','Autonomy','Sustainability','Materials','Smart Cockpit'];
  const fromData = v17Arr(state.data.technologies).map(t => t.theme || t.name).filter(Boolean);
  return [...new Set([...base, ...fromData])];
}
function v17CompetitorNames(){ return [...new Set(v17Arr(state.data.competitorProfiles).map(c => c.name || c.competitor).filter(Boolean))]; }
function v17CustomerNames(){ return [...new Set(v17Arr(state.data.customerProfiles).map(c => c.name || c.customer).filter(Boolean))]; }
function renderMomentumIntelligence(){
  const corpus = v17TextCorpus();
  const tech = v17CountMentions(v17TechnologyNames(), corpus).slice(0,12);
  const comp = v17CountMentions(v17CompetitorNames(), corpus).slice(0,10);
  const cust = v17CountMentions(v17CustomerNames(), corpus).slice(0,10);
  const totalMentions = tech.reduce((a,x)=>a+x.count,0) + comp.reduce((a,x)=>a+x.count,0) + cust.reduce((a,x)=>a+x.count,0);
  v17Set('momentumSummary', [
    ['Technology mentions', tech.reduce((a,x)=>a+x.count,0)],
    ['Competitor mentions', comp.reduce((a,x)=>a+x.count,0)],
    ['Customer mentions', cust.reduce((a,x)=>a+x.count,0)],
    ['Total mapped mentions', totalMentions]
  ].map(([l,v]) => `<div class="kpi"><span>${v17Esc(l)}</span><strong>${v}</strong></div>`).join(''));
  v17Set('momentumTechCloud', tech.length ? v17Cloud(tech) : '<p class="empty">No technology mentions found yet.</p>');
  v17Set('momentumCompetitorBars', comp.length ? v17BarRows(comp) : '<p class="empty">No competitor mentions found yet.</p>');
  v17Set('momentumCustomerBars', cust.length ? v17BarRows(cust) : '<p class="empty">No customer mentions found yet.</p>');
  const topTech = tech[0] ? `${tech[0].name} (${tech[0].count})` : 'No topic yet';
  const topComp = comp[0] ? `${comp[0].name} (${comp[0].count})` : 'No competitor yet';
  const topCust = cust[0] ? `${cust[0].name} (${cust[0].count})` : 'No customer yet';
  v17Set('momentumInsights', `<div class="info-box"><strong>Top technology topic</strong>${v17Esc(topTech)}</div><div class="info-box"><strong>Most visible competitor</strong>${v17Esc(topComp)}</div><div class="info-box"><strong>Most visible customer</strong>${v17Esc(topCust)}</div><p class="muted">Counts are generated automatically from Daily News, Signals, Assessments, Profiles, Opportunities, Risks and Technology objects.</p>`);
}
function v17a(x){return Array.isArray(x)?x:(x?[x]:[])}
function v17s(x){return String(Array.isArray(x)?x.join(' '):(x||'')).replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim()}
function v17n(x){return v17s(x).toLowerCase()}
function v17e(x){return v17s(x).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
function v17set(id,html){const el=document.getElementById(id);if(el)el.innerHTML=html}
function v17tag(x){return `<span class="v17-pill">${v17e(x)}</span>`}
function v17list(a){return v17a(a).length?`<ul>${v17a(a).map(x=>`<li>${v17e(typeof x==='object'?JSON.stringify(x):x)}</li>`).join('')}</ul>`:'<span class="v17-muted">Not populated yet</span>'}
function v17val(o,keys,fb=''){for(const k of keys){if(o&&o[k]!==undefined&&o[k]!==null&&o[k]!=='')return o[k]}return fb}
function v17profileByCustomer(c){return (state.data.customerProfiles||[]).find(p=>p.customerId===c.customerId||p.customerId===c.id||p.name===c.customer||p.name===c.name||(p.name||'').includes(c.customer||c.name||''))||{}}
function v17dyn(p){return p.level3DynamicIntelligence||{}}
function v17scoreLabel(n){return n>=3?'High':n>=2?'Medium':'Low'}
function v17scoreClass(x){return String(x||'Low').toLowerCase()==='high'?'v17-high':String(x||'Low').toLowerCase()==='medium'?'v17-medium':'v17-low'}
function v17opportunityScore(p){const d=v17dyn(p);const count=v17a(d.opportunities).length+(d.accountOpportunity?1:0);return count>=3?3:count>=1?2:1}
function v17techScore(p){const d=v17dyn(p);const count=v17a(d.technologyThemes).length;return count>=4?3:count>=2?2:1}
function v17threatScore(c,p){const ids=v17a(c.competitorIds);const exp=v17a(v17dyn(p).competitorExposure);const count=Math.max(ids.length,exp.length);return count>=4?3:count>=2?2:count>=1?1:0}
function v17priority(opp,thr,tech){if(opp==='High'&&thr==='High')return'Strategic Account';if(opp==='High'||thr==='High'||tech==='High')return'Growth Account';if(opp==='Medium'||thr==='Medium')return'Watchlist';return'Monitor'}
function v17corpus(){const d=state.data||{};const blocks=[];v17a(d.newsRaw&&d.newsRaw.news).forEach(n=>blocks.push(`${n.company||''} ${n.headline||''} ${n.summary||''} ${n.category||''} ${n.section||''}`));['signals','assessments','customerProfiles','competitorProfiles','technologies','opportunities','risks'].forEach(k=>v17a(d[k]).forEach(x=>blocks.push(JSON.stringify(x))));return v17n(blocks.join(' '))}
function v17count(names,corpus){return names.map(name=>{const n=v17n(name);if(!n)return{name,count:0};const escaped=n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const count=(corpus.match(new RegExp(escaped,'g'))||[]).length;return{name,count}}).filter(x=>x.count>0).sort((a,b)=>b.count-a.count)}
function v17bars(items){const max=Math.max(1,...items.map(x=>x.count));return items.map(x=>`<div class="v17-bar-row"><strong>${v17e(x.name)}</strong><div class="v17-track"><div class="v17-fill" style="width:${Math.max(5,(x.count/max)*100)}%"></div></div><span>${x.count}</span></div>`).join('')}
function v17cloud(items){const max=Math.max(1,...items.map(x=>x.count));return items.map(x=>{const size=14+Math.round((x.count/max)*18);const cls=x.count>=max*.75?'hot':x.count>=max*.45?'up':'flat';return`<span class="${cls}" style="font-size:${size}px">${v17e(x.name)} ${x.count}</span>`}).join('')}
function renderOverviewMomentumBlock(){
 const overview=document.getElementById('overview');if(!overview)return;
 if(!document.getElementById('v17OverviewMomentum')){
  overview.insertAdjacentHTML('beforeend',`<div id="v17OverviewMomentum"><div class="heading"><div><span>Momentum intelligence</span><h2>What is gaining attention?</h2></div><small>Generated from news, signals, assessments and profiles.</small></div><div class="v17-grid-2"><article class="v17-card"><h3>Trending technologies</h3><div id="overviewMomentumTech" class="v17-momentum-cloud"></div></article><article class="v17-card"><h3>Most visible competitors</h3><div id="overviewMomentumCompetitors"></div></article><article class="v17-card"><h3>Most discussed customers</h3><div id="overviewMomentumCustomers"></div></article><article class="v17-card"><h3>Automated insight</h3><div id="overviewMomentumInsight"></div></article></div></div>`)
 }
 const corpus=v17corpus();const techNames=[...new Set(['Automation','Operator Environment','Integrated Cabin','HMI','Sensors','Electrification','Precision Agriculture','Autonomy','Sustainability','Materials','Smart Cockpit',...(state.data.technologies||[]).map(t=>t.theme||t.name).filter(Boolean)])];
 const compNames=[...new Set((state.data.competitorProfiles||[]).map(c=>c.name||c.competitor).filter(Boolean))];const custNames=[...new Set((state.data.customerProfiles||[]).map(c=>c.name||c.customer).filter(Boolean))];
 const tech=v17count(techNames,corpus).slice(0,12),comp=v17count(compNames,corpus).slice(0,8),cust=v17count(custNames,corpus).slice(0,8);
 v17set('overviewMomentumTech',tech.length?v17cloud(tech):'<p class="empty">No technology mentions found.</p>');v17set('overviewMomentumCompetitors',comp.length?v17bars(comp):'<p class="empty">No competitor mentions found.</p>');v17set('overviewMomentumCustomers',cust.length?v17bars(cust):'<p class="empty">No customer mentions found.</p>');
 v17set('overviewMomentumInsight',`<div class="info-box"><strong>Top technology topic</strong>${v17e(tech[0]?tech[0].name+' ('+tech[0].count+')':'No topic yet')}</div><div class="info-box"><strong>Most visible competitor</strong>${v17e(comp[0]?comp[0].name+' ('+comp[0].count+')':'No competitor yet')}</div><div class="info-box"><strong>Most visible customer</strong>${v17e(cust[0]?cust[0].name+' ('+cust[0].count+')':'No customer yet')}</div>`)
}
function renderRelationships(){
 const signals=(state.data.signals||[]).filter(searchMatch);const customers=state.data.customers||[],competitors=state.data.competitors||[],techs=state.data.technologies||[];
 v17set('relationshipGrid',signals.map(s=>{const sc=s.priority||'Medium';const cust=customers.filter(c=>v17a(s.customerIds).includes(c.id));const comp=competitors.filter(c=>v17a(s.competitorIds).includes(c.id));const tech=techs.filter(t=>v17a(s.technologyIds).includes(t.id));const ass=(state.data.assessments||[]).find(a=>a.signalId===s.id);return`<article class="v17-network-card"><div class="v17-network-top"><div><span class="meta">${v17e(s.id)}</span><h3>${v17e(s.signal)}</h3></div><span class="badge ${v17n(sc)}">${v17e(sc)}</span></div><div class="v17-network-cols"><div class="v17-network-col"><strong>Customers</strong>${cust.length?cust.map(c=>v17tag(c.customer||c.name)).join(''):'<span class="v17-muted">None linked</span>'}</div><div class="v17-network-col"><strong>Competitors</strong>${comp.length?comp.map(c=>v17tag(c.name)).join(''):'<span class="v17-muted">None linked</span>'}</div><div class="v17-network-col"><strong>Technologies</strong>${tech.length?tech.map(t=>v17tag(t.theme||t.name)).join(''):'<span class="v17-muted">None linked</span>'}</div><div class="v17-network-col"><strong>Opportunity</strong>${ass&&v17a(ass.opportunityIds).length?v17a(ass.opportunityIds).map(v17tag).join(''):'<span class="v17-muted">Not linked</span>'}</div><div class="v17-network-col"><strong>Risk</strong>${ass&&v17a(ass.riskIds).length?v17a(ass.riskIds).map(v17tag).join(''):'<span class="v17-muted">Not linked</span>'}</div></div><div class="v17-action"><b>Recommended action:</b> ${v17e(s.action||ass?.businessImplication||'Define next action')}</div></article>`}).join('')||'<p class="empty">No relationships found.</p>')
}
function renderTechnology(){
 const items=(state.data.technologies||[]).filter(searchMatch);v17set('technologyGrid',items.map(t=>{const rel=t.relevance||'Medium',mat=t.maturity||'Emerging';return`<article class="v17-tech-card"><h3>${v17e(t.theme||t.name)}</h3><div class="v17-score-row"><div class="v17-score ${v17scoreClass(rel)}"><span>Relevance</span><strong>${v17e(rel)}</strong></div><div class="v17-score"><span>Maturity</span><strong>${v17e(mat)}</strong></div><div class="v17-score ${v17scoreClass(t.revenuePotential||'Medium')}"><span>Revenue potential</span><strong>${v17e(t.revenuePotential||'TBD')}</strong></div></div><div class="v17-tech-section"><strong>Market / customer adoption</strong>${v17tag(t.marketAdoption||'TBD')}${v17a(t.customerAdoption).map(v17tag).join('')}</div><div class="v17-tech-section"><strong>Competitor adoption</strong>${v17a(t.competitorAdoption).length?v17a(t.competitorAdoption).map(v17tag).join(''):'<span class="v17-muted">Not populated yet</span>'}</div><div class="v17-tech-section"><strong>Watch signals</strong>${v17e(t.watchSignals||'No watch signals yet')}</div></article>`}).join('')||'<p class="empty">No technology data available.</p>')
}
function renderBenchmarking(){
 const items=(state.data.benchmarking||[]).filter(searchMatch);v17set('benchmarkGrid',items.map(b=>{const dims=v17a(b.dimensions);return`<article class="v17-benchmark-card"><span class="meta">${v17e(b.benchmarkId||b.id||'')} · ${v17e(b.type||'')}</span><h3>${v17e(b.title)}</h3>${dims.length?dims.map(d=>`<div class="v17-dimension"><div class="v17-dimension-name">${v17e(d.dimension||'Dimension')}</div><div class="v17-position"><b>GRAMMER</b><br>${v17e(d.grammerPosition||d.value||'Not populated')}</div><div class="v17-position"><b>Benchmark</b><br>${v17e(d.competitorPosition||d.comment||'Not populated')}</div></div>`).join(''):'<p class="v17-muted">No dimensions yet.</p>'}</article>`}).join('')||'<p class="empty">No benchmarking available.</p>')
}
function v17Impact(x){const raw=v17n(v17val(x,['impact','revenueImpact','potentialImpactLevel','priority','riskLevel'],''));if(raw.includes('high')||raw==='5'||raw==='4')return'High';if(raw.includes('medium')||raw==='3')return'Medium';return'Low'}
function v17Likelihood(x){const raw=v17n(v17val(x,['likelihood','probability','chance','priority','riskLevel'],''));if(raw.includes('high')||raw==='5'||raw==='4')return'High';if(raw.includes('medium')||raw==='3')return'Medium';return'Low'}
function v17ItemTitle(x,type){return v17val(x,['opportunity','description','riskDescription','title','name'],type==='Opportunity'?'Untitled opportunity':'Untitled risk')}
function v17ItemText(x){return v17val(x,['nextAction','mitigation','mitigation / watch action','potentialImpact','whyAttractive','why attractive','status'],'No action text populated yet.')}
function v17Bubble(x){const type=x._type;return`<div class="v17-bubble ${type==='Risk'?'v17-bubble-risk':'v17-bubble-opp'}"><small>${v17e(type)} · Impact ${v17Impact(x)} · Probability ${v17Likelihood(x)}</small><strong>${v17e(v17ItemTitle(x,type))}</strong><p>${v17e(v17ItemText(x))}</p></div>`}
function renderHeatmap(){
 const opp=(state.data.opportunities||[]).filter(searchMatch).map(x=>({...x,_type:'Opportunity'}));const risk=(state.data.risks||[]).filter(searchMatch).map(x=>({...x,_type:'Risk'}));const all=[...opp,...risk];const hh=all.filter(x=>v17Impact(x)==='High'&&v17Likelihood(x)==='High');const hm=all.filter(x=>v17Impact(x)==='High'&&v17Likelihood(x)!=='High');const mh=all.filter(x=>v17Impact(x)!=='High'&&v17Likelihood(x)==='High');const rest=all.filter(x=>!hh.includes(x)&&!hm.includes(x)&&!mh.includes(x));
 const kpis=`<div class="v17-priority-kpis"><div class="kpi v17-kpi-red"><span>Act now</span><strong>${hh.length}</strong></div><div class="kpi v17-kpi-amber"><span>Watch closely</span><strong>${hm.length}</strong></div><div class="kpi v17-kpi-green"><span>Execute selectively</span><strong>${mh.length}</strong></div><div class="kpi v17-kpi-gray"><span>Monitor</span><strong>${rest.length}</strong></div></div>`;
 const q=(title,sub,arr,cls)=>`<div class="v17-quadrant ${cls}"><h3>${title}</h3><p class="v17-muted">${sub}</p>${arr.length?arr.map(v17Bubble).join(''):'<p class="v17-muted">No items yet</p>'}</div>`;
 v17set('heatmapGrid',kpis+`<div class="v17-priority-matrix">${q('Watch closely','High impact / lower probability',hm,'v17-q-amber')}${q('Act now','High impact / high probability',hh,'v17-q-red')}${q('Monitor','Lower impact / lower probability',rest,'v17-q-gray')}${q('Execute selectively','Lower impact / high probability',mh,'v17-q-green')}</div>`)
}
function renderAll(){const signals=filteredSignals();renderKpis(signals);renderOverview(signals);renderSignalsTable();renderAssessments();renderDailyNews();renderRelationships();renderCustomerProfiles();renderCompetitorProfiles();renderBenchmarking();renderTechnology();renderPerformance();renderMatrix();renderHeatmap();renderMomentumIntelligence();}
async function init(){try{await loadData();setup();renderAll();}catch(e){const m=document.querySelector('main');if(m)m.innerHTML=`<h3>Data loading problem</h3><p>${safeHtml(e.message)}</p><p>Check JSON files inside offroad-intelligence/data/ and root news-data.json.</p>`;}}
init();
