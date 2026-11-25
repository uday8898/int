import React,{useEffect,useState,useCallback} from 'react'
import {LineChart,Line,XAxis,YAxis,Tooltip,Legend,ResponsiveContainer,CartesianGrid,ReferenceLine} from 'recharts'
const call=(m,p,o)=>fetch('/api'+p,{method:m,headers:{'Content-Type':'application/json'},body:o?JSON.stringify(o):undefined}).then(r=>r.json())
const get=p=>call('GET',p), post=(p,o)=>call('POST',p,o||{}), put=(p,o)=>call('PUT',p,o)

const P={
  home:'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  alert:'M12 3l10 18H2L12 3zM12 10v5M12 18v.5',
  doc:'M6 3h9l4 4v14H6V3zM14 3v5h5M9 13h6M9 17h6',
  chart:'M3 20h18M6 16l4-5 4 3 5-8',
  check:'M5 12l5 5L20 6',
  list:'M4 6h16M4 12h16M4 18h10',
  info:'M12 8v.5M12 11v6M12 3a9 9 0 100 18 9 9 0 000-18z',
  lock:'M6 11h12v9H6zM8 11V8a4 4 0 118 0v3',
  user:'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
  shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM9 12l2 2 4-4',
  clock:'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2',
  bolt:'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6z',
  team:'M8 11a3 3 0 100-6 3 3 0 000 6zM16 11a3 3 0 100-6 3 3 0 000 6zM2 20a6 6 0 0112 0M14 14a6 6 0 018 6',
  up:'M12 16V4M7 9l5-5 5 5M4 20h16',
  up2:'M5 15l5-5 4 4 5-7M4 20h16',
  up3:'M7 17L17 7M9 7h8v8',
}
const Ic=({n})=><svg className="ic" viewBox="0 0 24 24"><path d={P[n]}/></svg>
function Logo(){const [img,setImg]=useState(true);return <div className="logo">{img?<img src="/meridian-logo.png" alt="Meridian" onError={()=>setImg(false)}/>:<div className="wm">meridian<span>Data &amp; AI</span></div>}</div>}
const Sub=({items,v,set})=><div className="sub">{items.map(([k,l])=><button key={k} className={v===k?'on':''} onClick={()=>set(k)}>{l}</button>)}</div>
const Pill=({c,children})=><span className={'pill '+c}>{children}</span>
const Kpi=({l,v,i='chart',t=''})=><div className="card kpi"><div className={'ico '+t}><Ic n={i}/></div><div><b>{v}</b><span>{l}</span></div></div>
const Note=({children})=><p className="hint">{children}</p>


const BRIEFS={
 risk:{k:'Initiative 1 · Primary POC',t:'Operational Risk Intelligence',
  problem:'Toll plaza operations are exposed to events that reports only reveal afterwards: heavy rain and fog, rallies and festivals, highway closures and accidents. Awareness today depends largely on reactive communication.',
  sol:'An early-warning service that monitors external information, identifies events near Interise highway assets, and issues location-specific alerts with suggested actions and historical toll context. Every alert is labelled Confirmed or AI-inferred (needs verification).',
  svc:['Azure Functions','Logic Apps','Azure Maps','Azure OpenAI','Fabric Lakehouse','Power Automate','Teams / Outlook'],
  impact:['Proactive operational preparation','Less reliance on reactive communication','Better plaza staffing and planning','Awareness of external events affecting assets'],
  guard:'Alerts and recommendations only. No guaranteed traffic or revenue prediction; rally and event information is verified; first release limited to a few selected plazas.'},
 con:{k:'Initiative 2 · Second POC',t:'Contract & Concession Intelligence',
  problem:'Concession, O&M, vendor, NHAI and compliance documents hold obligations, deadlines, financial terms and penalty provisions. Finding them manually is slow.',
  sol:'A document intelligence platform that extracts, indexes and makes contractual information searchable through natural-language questions, with answers grounded in document and page-level citations and document-level access control.',
  svc:['Document Intelligence','Azure AI Search','Azure OpenAI','Blob / SharePoint','Azure Functions','Entra ID'],
  impact:['Faster contract reviews','Improved document accessibility','Less manual extraction effort','Better obligation tracking'],
  guard:'Answers are decision support with citations, not legal advice. Extraction quality on poor scans and long cross-referenced text is validated in the POC.'},
 ano:{k:'Initiative 3 · Third POC',t:'Revenue Anomaly Detection',
  problem:'Unexpected variations in toll collections and transaction volumes can signal disruption, abnormal traffic or collection issues, and today are found through manual review and reconciliation.',
  sol:'Anomaly detection that evaluates transaction and collection patterns against learned baselines per plaza and weekday, flags unusual deviations, and adds context for investigation. Starts with simple, explainable baselines.',
  svc:['Microsoft Fabric','Fabric Notebooks','Azure Machine Learning','Power Automate','Teams / Outlook','Power BI (optional)'],
  impact:['Early identification of unusual revenue patterns','Improved operational monitoring','Less manual reconciliation effort'],
  guard:'Alert noise is tuned against historical scenarios before go-live. Thresholds shown are illustrative; owners (operations vs finance) to be confirmed.'}
}
function Brief({id}){
  const b=BRIEFS[id],[open,setOpen]=useState(true)
  return <div className="card brief"><div className="bh" onClick={()=>setOpen(!open)}><div><div className="k">{b.k}</div><h3>{b.t} — POC brief</h3></div><div className="sp"/><button>{open?'Hide brief':'Show brief'}</button></div>
   {open&&<div className="bb"><div><h4>Business problem</h4><p>{b.problem}</p></div><div><h4>Proposed solution</h4><p>{b.sol}</p></div>
    <div><h4>Expected impact</h4><ul>{b.impact.map(i=><li key={i}>{i}</li>)}</ul></div>
    <div><h4>Azure services</h4><div className="svc">{b.svc.map(x=><Pill key={x} c="b">{x}</Pill>)}</div><h4 style={{marginTop:14}}>Guardrails</h4><p>{b.guard}</p></div></div>}</div>
}

/* ---------------- Overview ---------------- */
function Overview({go}){
  const [o,setO]=useState(null);useEffect(()=>{get('/overview').then(setO)},[])
  if(!o)return null
  const road=[['1','Operational Risk Intelligence','Early-warning alerts for weather, closures and public events near selected toll plazas.',['Select 5–10 plazas','Validate external sources','Geographical mapping','Event detection & risk classification','Teams / e-mail alerts','Validate with operations'],'risk','Primary'],
              ['2','Contract & Concession Intelligence','Searchable, cited answers across concession, O&M and compliance documents.',['Representative agreements','Validate extraction quality','Indexing & retrieval','Clause extraction & Q&A'],'con','Second'],
              ['3','Revenue Anomaly Detection','Baseline-driven flags for unusual toll transactions and collections.',['Validate historical data','Baseline patterns','Anomaly detection','Test alerts on historical scenarios'],'ano','Third']]
  return <>
   <div className="hero"><div className="eyebrow">Interise · Phase 2 · Azure AI &amp; Operational Intelligence</div>
    <h2>From reporting what happened to anticipating what matters</h2>
    <p>Phase 1 gave business users a natural-language route into structured data. Phase 2 targets what reports cannot see: events outside the toll plaza, knowledge locked in contracts, and early signs of abnormal collections.</p>
    <div className="pills"><span><Ic n="shield"/>Human in the loop</span><span><Ic n="eye"/>Alerts &amp; recommendations only</span><span><Ic n="check"/>Confirmed vs AI-inferred</span><span><Ic n="bolt"/>Reuses Fabric foundation</span></div></div>
   <div className="grid g4" style={{marginBottom:24}}>
    <Kpi i="alert" t="r" l="Open risk alerts" v={o.open_alerts}/><Kpi i="clock" t="a" l="Obligations due ≤ 90 days" v={o.obligations_90d}/><Kpi i="chart" l="Revenue deviations (7d)" v={o.anomalies_7d}/><Kpi i="check" t="g" l="Open questions confirmed" v={`${o.validated}/${o.validation_total}`}/></div>
   <h3 className="sec">Three initiatives, each a bounded proof of concept</h3>
   <div className="grid g3" style={{marginBottom:24}}>{road.map(([id,t,d,acts,tab,pr])=><div key={id} className="card init"><div className="num">{id}</div><h3>{t}</h3><div className="tagl">{d}</div><div className="row"><Pill c="b">{pr} priority</Pill><Pill c="m">POC</Pill></div>
     <div className="acts">{acts.map(a=><div key={a} className="check"><Ic n="check"/>{a}</div>)}</div><button className="btn pri" onClick={()=>go(tab)}>Open live demo <Ic n="up3"/></button></div>)}</div>
   <h3 className="sec">How Phase 2 builds on Phase 1</h3>
   <div className="card" style={{marginBottom:24}}>
    <div className="arch"><div className="b p1"><b>Phase 1 · Existing</b>Power BI semantic models → Fabric Data Agents → Microsoft Copilot</div><div className="ar">+</div>
     <div className="b"><b>Phase 2 inputs</b>External feeds · contracts · toll time-series</div><div className="ar">→</div>
     <div className="b ai"><b>Azure AI</b>OpenAI · Document Intelligence · AI Search · Azure ML</div><div className="ar">→</div>
     <div className="b"><b>Outputs</b>Alerts (Teams / e-mail) · cited Q&amp;A · anomaly flags</div></div>
    <Note>Phase 2 reuses the Fabric foundation and does not duplicate the Data Agents.</Note></div>
   <h3 className="sec">Expected business impact</h3>
   <div className="impact" style={{marginBottom:10}}>
    <div><Ic n="shield"/>Proactive operational preparation</div><div><Ic n="team"/>Better plaza staffing and resource planning</div><div><Ic n="doc"/>Instant, cited answers from contracts</div><div><Ic n="chart"/>Earlier visibility of abnormal collections</div></div>
   <Note>Each card above links to an interactive demo built on synthetic data with simulated Azure services. Real validation items are tracked under “Validation”.</Note></>
}

/* ---------------- Risk ---------------- */
function Spark({data}){return <div style={{height:140}}><ResponsiveContainer><LineChart data={data.map(r=>({...r,date:r.date.slice(5)}))}><CartesianGrid stroke="rgba(15,27,61,.07)" vertical={false}/><XAxis dataKey="date" fontSize={10}/><YAxis fontSize={10} domain={['auto','auto']}/><Tooltip contentStyle={{borderRadius:10,background:'#fff',border:'1px solid rgba(15,27,61,.12)',boxShadow:'0 10px 30px rgba(15,27,61,.14)',fontSize:12,color:'#0F1B3D'}} labelStyle={{color:'#5B6785'}}/><Line dataKey="baseline" stroke="#8D77FD" strokeDasharray="4 3" dot={false}/><Line dataKey="actual" stroke="#1149DC" dot={false} strokeWidth={2}/></LineChart></ResponsiveContainer></div>}

function AlertCard({a,plazas,act,reload}){
  const [open,setOpen]=useState(false),[ctx,setCtx]=useState(null),[msg,setMsg]=useState(null)
  const toggle=async()=>{if(!open&&!ctx){setCtx(await get(`/alerts/${a.id}/context`));setMsg(await get(`/alerts/${a.id}/message`))}setOpen(!open)}
  const fb=async u=>{await post(`/alerts/${a.id}/feedback`,{useful:u});reload()}
  return <div className={`alert ${a.severity} ${a.state==='dismissed'?'dismissed':''}`}>
    <div className="row"><span className={`tag ${a.basis.startsWith('Confirmed')?'Confirmed':'AI'}`}>{a.basis}</span><span className="tag sev">{a.severity}</span><b>{a.type}</b><span style={{marginLeft:'auto',fontSize:12,color:'var(--dim)'}}>{plazas.find(p=>p.id===a.plaza)?.name} · {a.when}</span></div>
    <div>{a.summary}</div><div className="rec"><b>Recommended:</b> {a.recommendation}</div>
    <div style={{fontSize:12,color:'var(--dim)'}}>Source: {a.source}</div>
    <div className="row" style={{marginTop:8}}>{a.state==='new'?<><button className="btn pri" onClick={()=>act(a.id,'verify')}>Verify</button><button className="btn" onClick={()=>act(a.id,'escalate')}>Send to Teams</button><button className="btn" onClick={()=>act(a.id,'dismiss')}>Dismiss</button></>:<span className="tag sev">{a.state}</span>}
     <button className="btn" onClick={toggle}>{open?'Hide':'Context & message preview'}</button>
     <span style={{marginLeft:'auto',fontSize:12}}>Useful? <button className="btn" onClick={()=>fb(true)}>Useful</button> <button className="btn" onClick={()=>fb(false)}>Not useful</button>{'useful' in a&&<span> · {a.useful?'rated useful':'rated not useful'}</span>}</span></div>
    {open&&ctx&&<div className="grid g2" style={{marginTop:10}}>
      <div><b style={{fontSize:13}}>Historical toll context · {ctx.plaza}</b><Spark data={ctx.series}/>
        {ctx.indicative_change!=null&&<div className="rec">Indicative change on similar past events: <b>{ctx.indicative_change>0?'+':''}{ctx.indicative_change}%</b></div>}<Note>{ctx.note}</Note></div>
      <div><b style={{fontSize:13}}>Teams card preview</b><div className="teams"><div className="hd">{msg.teams.title}</div><div className="bd">{msg.teams.facts.map(([k,v])=><div className="fact" key={k}><b>{k}:</b> {v}</div>)}<p style={{margin:'6px 0'}}>{msg.teams.text}</p><p><b>Action:</b> {msg.teams.action}</p><div className="row">{msg.teams.buttons.map(b=><span key={b} className="pill b">{b}</span>)}</div></div></div>
        <b style={{fontSize:13,display:'block',marginTop:8}}>E-mail preview</b><div className="mail"><b>To:</b> {msg.email.to}{'\n'}<b>Subject:</b> {msg.email.subject}{'\n\n'}{msg.email.body}</div></div></div>}
  </div>
}

function Risk(){
  const [sv,setSv]=useState('alerts')
  return <><Brief id="risk"/><Sub v={sv} set={setSv} items={[['alerts','Alerts & map'],['src','Source validation'],['cls','Event classifier'],['rules','Risk rules'],['perf','Performance & audit']]}/>
   {sv==='alerts'&&<Alerts/>}{sv==='src'&&<Sources/>}{sv==='cls'&&<Classifier/>}{sv==='rules'&&<Rules/>}{sv==='perf'&&<Perf/>}</>
}
function Alerts(){
  const [alerts,setA]=useState([]),[plazas,setP]=useState([]),[sel,setSel]=useState(null),[busy,setBusy]=useState(false),[n,setN]=useState(8)
  const load=useCallback(()=>{get('/alerts').then(setA);get('/plazas').then(setP)},[]);useEffect(load,[load])
  const act=(id,action)=>post(`/alerts/${id}/review`,{action}).then(load)
  const scan=async()=>{setBusy(true);await new Promise(r=>setTimeout(r,800));await post('/scan');setBusy(false);load()}
  const sevOf=pid=>{const a=alerts.filter(x=>x.plaza===pid&&x.state==='new');return ['High','Medium','Low'].find(s=>a.some(x=>x.severity===s))}
  const pilot=plazas.slice(0,n),shown=alerts.filter(a=>(!sel||a.plaza===sel)&&pilot.some(p=>p.id===a.plaza)),open=alerts.filter(a=>a.state==='new')
  return <><div className="grid g4" style={{marginBottom:18}}>
    <Kpi i="eye" l="Plazas in pilot" v={pilot.length}/><Kpi i="alert" t="r" l="Open alerts" v={open.length}/><Kpi i="shield" t="g" l="Confirmed" v={open.filter(a=>a.basis.startsWith('Confirmed')).length}/><Kpi i="bolt" t="a" l="AI-inferred (verify)" v={open.filter(a=>a.basis==='AI-inferred').length}/></div>
   <div className="grid g2"><div className="card"><h3>Plaza map (schematic)</h3>
     <div className="map"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="22,30 34,44 48,62 70,70" fill="none" stroke="rgba(17,73,220,.35)" strokeWidth=".6" strokeDasharray="1.5 1"/><polyline points="52,22 66,36 82,50" fill="none" stroke="rgba(123,99,240,.45)" strokeWidth=".6" strokeDasharray="1.5 1"/><polyline points="28,72 48,62" fill="none" stroke="rgba(17,73,220,.35)" strokeWidth=".6" strokeDasharray="1.5 1"/></svg>
      {pilot.map(p=><div key={p.id} className={`pin ${sevOf(p.id)||''} ${sel===p.id?'sel':''}`} style={{left:p.x+'%',top:p.y+'%'}} onClick={()=>setSel(sel===p.id?null:p.id)}><i/><span>{p.name.replace('Toll Plaza ','TP ')}</span></div>)}</div>
     <div className="row" style={{marginTop:10}}><button className="btn pri" onClick={scan} disabled={busy}>{busy?'Collecting feeds…':'Run feed collection (simulated)'}</button>{sel&&<button className="btn" onClick={()=>setSel(null)}>Clear filter</button>}</div>
     <div style={{marginTop:10}}><label style={{fontSize:13}}><b>Pilot scope:</b> {n} plazas (POC target 5–10)</label><input type="range" min="5" max="8" value={n} onChange={e=>setN(+e.target.value)}/></div>
     <div className="legend"><span><i style={{background:'#D12F3C'}}/>High</span><span><i style={{background:'#B7710A'}}/>Medium</span><span><i style={{background:'#7B63F0'}}/>Low</span><span><i style={{background:'#1149DC'}}/>No open alert</span></div><Note>Production: Azure Functions collection + Azure Maps proximity / route-buffer matching.</Note></div>
    <div><h3 className="sec">Operational risk alerts</h3>{shown.map(a=><AlertCard key={a.id} a={a} plazas={plazas} act={act} reload={load}/>)}</div></div></>
}
function Sources(){
  const [s,setS]=useState([]);const load=()=>get('/sources').then(setS);useEffect(()=>{load()},[])
  const c=x=>x.startsWith('Validated')?'g':x.startsWith('Blocked')?'r':'a'
  return <div className="card"><h3>External source validation tracker</h3><table><thead><tr><th>Source</th><th>Type</th><th>Coverage</th><th>Reliability</th><th>Status</th><th>Notes</th><th/></tr></thead><tbody>
   {s.map(x=><tr key={x.id}><td><b>{x.name}</b></td><td>{x.kind==='official'?<Pill c="b">Official</Pill>:<Pill c="m">Unverified</Pill>}</td><td>{x.coverage}</td><td>{x.reliability}</td><td><Pill c={c(x.status)}>{x.status}</Pill></td><td style={{fontSize:12.5}}>{x.notes}</td><td><button className="btn" onClick={()=>post(`/sources/${x.id}/cycle`).then(load)}>Update status</button></td></tr>)}</tbody></table>
   <Note>No feed is assumed available. This tracker mirrors POC activity “Validate external data sources”. Unofficial sources can only produce AI-inferred alerts that need verification.</Note></div>
}
function Classifier(){
  const ex=[['Heavy rainfall warning issued for the region; waterlogging likely near Toll Plaza 03 tomorrow.','official'],['Political rally planned this weekend along Corridor A, large crowd expected.','unofficial'],['Highway closure advisory: diversion on Corridor C near Toll Plaza 05 from today.','official'],['Dense fog warning tonight across Corridor A, visibility very low.','official'],['Annual religious festival procession next week near Toll Plaza 08.','unofficial']]
  const [t,setT]=useState(ex[0][0]),[k,setK]=useState('official'),[r,setR]=useState(null)
  const run=async c=>setR(await post('/classify',{text:t,source_kind:k,create:c}))
  return <div className="grid g2"><div className="card"><h3>Event detection & risk classification</h3><textarea value={t} onChange={e=>setT(e.target.value)}/>
    <div className="chips">{ex.map(([x,kk],i)=><button key={i} className="chip" onClick={()=>{setT(x);setK(kk);setR(null)}}>Example {i+1}</button>)}</div>
    <div className="row"><select value={k} onChange={e=>setK(e.target.value)} style={{width:240}}><option value="official">Source: official advisory</option><option value="unofficial">Source: news / unverified</option></select><button className="btn pri" onClick={()=>run(false)}>Classify</button><button className="btn" onClick={()=>run(true)}>Classify &amp; create alert</button></div>
    <Note>Stand-in for Azure OpenAI structured extraction; production returns the same fields plus the source link.</Note></div>
   <div className="card"><h3>Structured output</h3>{!r?<Note>Run a classification to see output.</Note>:!r.matched?<p>{r.message}</p>:<div className="kv">
     <b>Event type</b><span>{r.event_type}</span><b>Plazas matched</b><span>{r.plaza_names.join(', ')||'None – no plaza reference found'}</span><b>When</b><span>{r.when}</span><b>Severity</b><span>{r.severity}</span>
     <b>Basis</b><span><Pill c={r.basis==='Confirmed'?'g':'a'}>{r.basis}</Pill></span><b>Confidence</b><span><div className="bar"><i style={{width:r.confidence*100+'%'}}/></div>{Math.round(r.confidence*100)}%</span>
     <b>Proximity buffer</b><span>{r.buffer_km} km</span><b>Verification</b><span>{r.requires_verification?'Required before action':'Not required'}</span><b>Recommendation</b><span>{r.recommendation}</span>{r.alert_id&&<><b>Alert created</b><span>{r.alert_id} → see Alerts tab</span></>}</div>}</div></div>
}
function Rules(){
  const [r,setR]=useState([]);const load=()=>get('/rules').then(setR);useEffect(()=>{load()},[])
  const upd=(t,o)=>put('/rules/'+encodeURIComponent(t),o).then(load)
  return <div className="card"><h3>Risk classification rules (editable)</h3><table><thead><tr><th>Event type</th><th>Buffer (km)</th><th>Severity</th><th>Needs verification</th><th>Recommended action</th></tr></thead><tbody>
   {r.map(x=><tr key={x.type}><td><b>{x.type}</b></td><td><input type="number" style={{width:80}} defaultValue={x.buffer_km} onBlur={e=>upd(x.type,{buffer_km:+e.target.value})}/></td>
    <td><select value={x.severity} style={{width:110}} onChange={e=>upd(x.type,{severity:e.target.value})}>{['High','Medium','Low'].map(s=><option key={s}>{s}</option>)}</select></td>
    <td><input type="checkbox" checked={x.requires_verification} onChange={e=>upd(x.type,{requires_verification:e.target.checked})} style={{width:18}}/></td><td style={{fontSize:12.5}}>{x.action}</td></tr>)}</tbody></table>
   <Note>Rallies and gatherings default to “needs verification” so they are never presented as confirmed events. Changes are written to the audit log.</Note></div>
}
function Perf(){
  const [m,setM]=useState(null),[a,setA]=useState([]);useEffect(()=>{get('/metrics').then(setM);get('/audit').then(setA)},[])
  if(!m)return null
  return <><div className="grid g4" style={{marginBottom:18}}><Kpi i="alert" l="Alerts raised" v={m.total}/><Kpi i="check" t="g" l="Verified by ops" v={m.verified}/><Kpi i="list" t="a" l="Dismissed" v={m.dismissed}/><Kpi i="user" l="Rated useful" v={m.rated?`${m.useful}/${m.rated}`:'—'}/></div>
   <div className="card"><h3>Audit log</h3><table><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Detail</th></tr></thead><tbody>{a.map((x,i)=><tr key={i}><td>{x.ts}</td><td>{x.actor}</td><td>{x.action}</td><td>{x.detail}</td></tr>)}</tbody></table><Note>Interact with alerts, rules or sources and refresh this tab to see entries. Operator feedback is the basis for tuning rules during the POC.</Note></div></>
}

/* ---------------- Contracts ---------------- */
function Contracts({role}){
  const [sv,setSv]=useState('ask')
  return <><Brief id="con"/><Sub v={sv} set={setSv} items={[['ask','Ask contracts'],['up','Upload & extract'],['obl','Obligation register'],['qual','Extraction quality'],['acc','Access control']]}/>
   {sv==='ask'&&<Ask role={role}/>}{sv==='up'&&<Upload/>}{sv==='obl'&&<Obligations role={role}/>}{sv==='qual'&&<Quality/>}{sv==='acc'&&<Access role={role}/>}</>
}
function Ask({role}){
  const [docs,setD]=useState([]),[q,setQ]=useState(''),[res,setR]=useState(null),[busy,setB]=useState(false)
  useEffect(()=>{get('/contracts?role='+role).then(setD);setR(null)},[role])
  const ask=async t=>{const v=t??q;if(!v)return;setQ(v);setB(true);setR(await post('/contracts/ask',{question:v,role}));setB(false)}
  const eg=['Which agreements are expiring within the next 12 months?','Identify clauses related to penalties and non-compliance','What are the maintenance obligations for Corridor A?']
  return <div className="grid g2"><div className="card"><h3>Ask your contracts <Pill c="m">Viewing as {role}</Pill></h3>
    <div className="row"><input value={q} placeholder="Ask a question about agreements…" onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ask()}/><button className="btn pri" onClick={()=>ask()}>Ask</button></div>
    <div className="chips">{eg.map(e=><button key={e} className="chip" onClick={()=>ask(e)}>{e}</button>)}</div>{busy&&<p>Searching index…</p>}
    {res&&!busy&&<div><p style={{margin:'10px 0'}}><b>{res.answer}</b></p><ul style={{paddingLeft:18,marginBottom:10}}>{res.items.map(i=><li key={i}>{i}</li>)}</ul>{res.citations.map((c,i)=><div key={i} className="cite"><Ic n="doc"/> {c.doc} · p.{c.page} · {c.note}</div>)}
     {res.hidden>0&&<div className="rec"><Ic n="lock"/> {res.hidden} result(s) hidden — not accessible to the {role} role.</div>}<Pill c="m">{res.confidence}</Pill></div>}
    <Note>Production: Azure AI Document Intelligence → Azure AI Search → Azure OpenAI. Answers are decision support with citations, not legal advice.</Note></div>
   <div className="card"><h3>Documents visible to {role}</h3><table><thead><tr><th>Document</th><th>Type</th><th>End date</th></tr></thead><tbody>{docs.map(d=><tr key={d.id}><td>{d.title}</td><td>{d.type}</td><td>{d.expiry||'—'}</td></tr>)}</tbody></table></div></div>
}
function Upload(){
  const [name,setName]=useState(''),[text,setText]=useState(''),[scan,setScan]=useState(false),[r,setR]=useState(null),[busy,setB]=useState(false)
  const file=async e=>{const f=e.target.files[0];if(!f)return;setName(f.name);if(f.type.startsWith('text')||f.name.endsWith('.txt'))setText(await f.text());else setText('')}
  const sample=async()=>{const s=await get('/contracts/sample');setName(s.filename);setText(s.text);setScan(false)}
  const run=async()=>{setB(true);await new Promise(r=>setTimeout(r,700));setR(await post('/contracts/extract',{filename:name||'uploaded_document',text,scanned:scan}));setB(false)}
  return <div className="grid g2"><div className="card"><h3>Upload &amp; extract</h3>
    <input type="file" onChange={file}/><div className="row" style={{marginTop:10}}><button className="btn" onClick={sample}>Load sample agreement text</button></div>
    <textarea style={{marginTop:10,minHeight:160}} value={text} onChange={e=>setText(e.target.value)} placeholder="Document text (text files are read directly; PDFs use simulated extraction)"/>
    <label className="check"><input type="checkbox" style={{width:16}} checked={scan} onChange={e=>setScan(e.target.checked)}/> Treat as scanned document (lower OCR confidence)</label>
    <button className="btn pri" onClick={run} disabled={busy}>{busy?'Analysing…':'Extract clauses & attributes'}</button>
    <Note>Simulated: regex stand-in for Document Intelligence + Azure OpenAI. Sample text is not a real contract.</Note></div>
   <div className="card"><h3>Extraction result</h3>{!r?<Note>Upload or load a sample to see extracted clauses, dates and amounts.</Note>:<>
     <div className="row"><Pill c={r.quality.needs_review?'a':'g'}>{r.quality.needs_review?'Needs human review':'High confidence'}</Pill>{r.quality.ocr_confidence&&<Pill c="m">OCR {Math.round(r.quality.ocr_confidence*100)}%</Pill>}<Pill c="b">{r.quality.fields_found} clauses</Pill></div>
     <table><thead><tr><th>Clause</th><th>Category</th><th>Date</th><th>Amount</th><th>Pg</th></tr></thead><tbody>{r.fields.map(f=><tr key={f.clause} title={f.text}><td>{f.clause}</td><td><Pill c={f.category==='Penalty'?'r':f.category==='Maintenance'?'b':'m'}>{f.category}</Pill></td><td>{f.date||'—'}</td><td>{f.amount||'—'}</td><td>{f.page}</td></tr>)}</tbody></table>
     <Note>Dated maintenance / compliance clauses were added to the obligation register.</Note></>}</div></div>
}
function Obligations({role}){
  const [o,setO]=useState([]);useEffect(()=>{get('/obligations?role='+role).then(setO)},[role])
  return <div className="card"><h3>Obligation &amp; deadline register <Pill c="m">{role}</Pill></h3><table><thead><tr><th>Due</th><th>In</th><th>Obligation</th><th>Contract</th><th>Category</th><th>Owner</th><th>Pg</th></tr></thead><tbody>
   {o.map(x=><tr key={x.id}><td>{x.due}</td><td><Pill c={x.days<=30?'r':x.days<=90?'a':'g'}>{x.days}d</Pill></td><td>{x.obligation}</td><td>{x.contract}</td><td>{x.category}</td><td>{x.owner}</td><td>{x.page}</td></tr>)}</tbody></table><Note>Sample entries plus anything extracted via Upload. Production: obligations stored as a Fabric table / search index with owners and reminders.</Note></div>
}
function Quality(){
  const [q,setQ]=useState([]);useEffect(()=>{get('/extraction/quality').then(setQ)},[])
  return <div className="card"><h3>Document extraction quality (sample)</h3><table><thead><tr><th>Document</th><th>Pages</th><th>Format</th><th>OCR confidence</th><th>Fields</th><th>Tables</th><th>Review</th></tr></thead><tbody>
   {q.map(d=><tr key={d.title}><td>{d.title}</td><td>{d.pages}</td><td>{d.scanned?'Scanned':'Digital PDF'}</td><td>{d.ocr_confidence?Math.round(d.ocr_confidence*100)+'%':'n/a'}</td><td>{d.fields}</td><td>{d.tables}</td><td><Pill c={d.needs_review?'a':'g'}>{d.needs_review?'Sample check':'OK'}</Pill></td></tr>)}</tbody></table>
   <Note>This mirrors POC activity “Validate document extraction quality”. Real scores come from Document Intelligence confidence values on the client's sample set.</Note></div>
}
function Access({role}){
  const roles=['Legal','Operations','Finance'];const [m,setM]=useState({})
  useEffect(()=>{(async()=>{const o={};for(const r of roles)o[r]=(await get('/contracts?role='+r)).map(c=>c.title);setM(o)})()},[])
  const all=[...new Set(Object.values(m).flat())]
  return <div className="card"><h3>Document-level access matrix (sample)</h3><table><thead><tr><th>Document</th>{roles.map(r=><th key={r}>{r}{r===role&&' ◀'}</th>)}</tr></thead><tbody>{all.map(t=><tr key={t}><td>{t}</td>{roles.map(r=><td key={r}>{m[r]?.includes(t)?<Pill c="g">Access</Pill>:<Pill c="m">Restricted</Pill>}</td>)}</tr>)}</tbody></table>
   <Note>Use the role selector in the header; answers, documents and obligations all follow it. Production: Microsoft Entra ID groups mapped to Azure AI Search security filters.</Note></div>
}

/* ---------------- Anomalies ---------------- */
function Anomaly(){
  const [sv,setSv]=useState('mon')
  return <><Brief id="ano"/><Sub v={sv} set={setSv} items={[['mon','Monitor'],['heat','Network heatmap'],['bt','Backtest'],['rt','Alert routing']]}/>{sv==='mon'&&<Monitor/>}{sv==='heat'&&<Heat/>}{sv==='bt'&&<Backtest/>}{sv==='rt'&&<Routing/>}</>
}
function Monitor(){
  const [th,setTh]=useState(15),[list,setL]=useState([]),[plazas,setP]=useState([]),[pid,setPid]=useState('P04'),[s,setS]=useState([]),[days,setDays]=useState(28),[sel,setSel]=useState(null)
  useEffect(()=>{get('/plazas').then(setP)},[]);useEffect(()=>{get(`/anomalies?threshold=${th}`).then(setL)},[th])
  useEffect(()=>{get(`/anomalies/series/${pid}?days=${days}`).then(setS)},[pid,days])
  const data=s.map(r=>({...r,d:r.date.slice(5),dev:(r.actual-r.baseline)/r.baseline*100}))
  const Dot=p=>{const{cx,cy,payload}=p;return Math.abs(payload.dev)>=th?<circle cx={cx} cy={cy} r={5} fill="#D12F3C" stroke="#fff"/>:<g/>}
  return <div className="grid g2"><div className="card"><h3>Transactions vs weekday baseline</h3>
    <div className="row"><select value={pid} onChange={e=>setPid(e.target.value)} style={{width:180}}>{plazas.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
     <select value={days} onChange={e=>setDays(+e.target.value)} style={{width:140}}><option value={14}>14 days</option><option value={28}>28 days</option><option value={60}>60 days</option></select></div>
    <label style={{fontSize:13}}><b>Deviation threshold:</b> ±{th}%</label><input type="range" min="5" max="30" value={th} onChange={e=>setTh(+e.target.value)}/>
    <div style={{height:280}}><ResponsiveContainer><LineChart data={data}><CartesianGrid stroke="rgba(15,27,61,.07)" vertical={false}/><XAxis dataKey="d" fontSize={10}/><YAxis fontSize={10}/><Tooltip contentStyle={{borderRadius:10,background:'#fff',border:'1px solid rgba(15,27,61,.12)',boxShadow:'0 10px 30px rgba(15,27,61,.14)',fontSize:12,color:'#0F1B3D'}} labelStyle={{color:'#5B6785'}}/><Legend/><Line dataKey="baseline" stroke="#8D77FD" strokeDasharray="5 4" dot={false} name="Baseline"/><Line dataKey="actual" stroke="#1149DC" strokeWidth={2} dot={<Dot/>} name="Actual (red = flagged)"/></LineChart></ResponsiveContainer></div>
    <Note>Sample data. Production: Fabric Notebooks + Azure Machine Learning baselines by plaza, weekday and season. Threshold is tunable during the POC.</Note></div>
   <div><h3 className="sec">Detected deviations (last 7 days, ≥{th}%)</h3>{!list.length&&<div className="card">No deviations at this threshold.</div>}
    {list.map((a,i)=><div key={i} className={`alert ${a.deviation<0?'High':'Medium'}`}><div className="row"><span className="tag sev">{a.date}</span><b>{a.name}</b><span style={{marginLeft:'auto'}} className="tag">{a.deviation>0?'+':''}{a.deviation}%</span></div>
     <div>{a.message}</div><div className="rec"><b>Review:</b> {a.suggestion}</div><div style={{fontSize:12.5}}>Route: <b>{a.route.team}</b> via {a.route.channel}</div>
     <div className="row" style={{marginTop:6}}><button className="btn" onClick={()=>setPid(a.plaza)}>View chart</button><button className="btn" onClick={()=>setSel(sel===i?null:i)}>Alert preview</button></div>
     {sel===i&&<div className="teams" style={{marginTop:8}}><div className="hd">Revenue anomaly · {a.name}</div><div className="bd"><p>{a.message}</p><p><b>Actual</b> {a.actual} vs <b>baseline</b> {a.baseline}</p><p><b>Action:</b> {a.suggestion}</p></div></div>}</div>)}</div></div>
}
function Heat(){
  const [h,setH]=useState([]);useEffect(()=>{get('/anomalies/heatmap?days=14').then(setH)},[])
  const col=d=>Math.abs(d)<5?'rgba(17,73,220,.12)':d<0?`rgba(209,47,60,${Math.min(1,.35+Math.abs(d)/35)})`:`rgba(183,113,10,${Math.min(1,.35+Math.abs(d)/35)})`
  if(!h.length)return null
  return <div className="card"><h3>Deviation vs baseline · last 14 days</h3><div className="heat" style={{gridTemplateColumns:'110px repeat(14,1fr)'}}>
    <div className="lb"/>{h[0].cells.map(c=><div key={c.date} className="lb" style={{justifyContent:'center',fontSize:9.5}}>{c.date.slice(8)}</div>)}
    {h.map(r=><React.Fragment key={r.plaza}><div className="lb">{r.name.replace('Toll Plaza','TP')}</div>{r.cells.map(c=><div key={c.date} style={{background:col(c.dev)}} title={`${r.name} ${c.date}: ${c.dev}%`}>{Math.abs(c.dev)>=10?Math.round(c.dev):''}</div>)}</React.Fragment>)}</div>
   <Note>Red = below baseline, amber = above. Muted blue = within ±5%. Hover cells for values.</Note></div>
}
function Backtest(){
  const [th,setTh]=useState(15),[b,setB]=useState(null);useEffect(()=>{get('/anomalies/backtest?threshold='+th).then(setB)},[th])
  if(!b)return null
  return <><div className="grid g4" style={{marginBottom:18}}><Kpi i="list" l="Labelled incidents" v={b.incidents}/><Kpi i="check" t="g" l="Detected / missed" v={`${b.detected} / ${b.missed}`}/><Kpi i="alert" t="r" l="False alarms (60d)" v={b.false_alarms}/><Kpi i="chart" l="Precision · recall" v={`${b.precision} · ${b.recall}`}/></div>
   <div className="card"><h3>Test alerts against historical scenarios</h3><label style={{fontSize:13}}><b>Threshold:</b> ±{th}% — lower catches more incidents but raises false alarms</label><input type="range" min="5" max="30" value={th} onChange={e=>setTh(+e.target.value)}/>
    <table><thead><tr><th>Date</th><th>Plaza</th><th>Labelled incident</th><th>Deviation</th><th>Result</th></tr></thead><tbody>{b.rows.map((r,i)=><tr key={i}><td>{r.date}</td><td>{r.plaza}</td><td>{r.incident}</td><td>{r.deviation}%</td><td><Pill c={r.detected?'g':'r'}>{r.detected?'Detected':'Missed'}</Pill></td></tr>)}</tbody></table><Note>{b.note}</Note></div></>
}
function Routing(){
  const [r,setR]=useState([]);useEffect(()=>{get('/routing').then(setR)},[])
  return <div className="card"><h3>Alert routing rules (Power Automate)</h3><table><thead><tr><th>#</th><th>Condition</th><th>Channel</th><th>Recipients</th></tr></thead><tbody>{r.map(x=><tr key={x.id}><td>{x.id}</td><td>{x.condition}</td><td>{x.channel}</td><td>{x.team}</td></tr>)}</tbody></table><Note>Sample routing for discussion — owners and thresholds to be confirmed with operations and finance.</Note></div>
}

/* ---------------- Validation ---------------- */
function Validation(){
  const [v,setV]=useState([]);const load=()=>get('/validation').then(setV);useEffect(()=>{load()},[])
  const c=s=>s==='Confirmed'?'g':s==='In progress'?'a':'r'
  const done=v.filter(x=>x.status==='Confirmed').length
  return <div className="card"><h3>Technical feasibility &amp; open questions</h3><div className="bar" style={{marginBottom:6}}><i style={{width:(v.length?done/v.length*100:0)+'%'}}/></div><Note>{done} of {v.length} confirmed. Nothing is assumed available until marked Confirmed.</Note>
   <table><thead><tr><th>Area</th><th>Question to validate</th><th>Owner</th><th>Status</th><th/></tr></thead><tbody>{v.map(x=><tr key={x.id}><td><b>{x.area}</b></td><td>{x.q}</td><td>{x.owner}</td><td><Pill c={c(x.status)}>{x.status}</Pill></td><td><button className="btn" onClick={()=>post(`/validation/${x.id}/cycle`).then(load)}>Update</button></td></tr>)}</tbody></table></div>
}

export default function App(){
  const tabs=[['ov','Overview','Executive summary','home'],['risk','Operational Risk','Initiative 1 · Alerts & map','alert'],['con','Contract Intelligence','Initiative 2 · Cited Q&A','doc'],['ano','Revenue Anomalies','Initiative 3 · Monitoring','chart'],['val','Validation','Open questions tracker','check']]
  const [t,setT]=useState('ov'),[role,setRole]=useState('Legal')
  const cur=tabs.find(x=>x[0]===t)
  return <div className="shell">
   <aside className="side"><div className="brand"><Logo/></div><div className="prod">Interise · Phase 2 Prototype</div>
    <div className="grp">Navigate</div>
    {tabs.map(([k,l,d,i])=><button key={k} className={'nav '+(t===k?'on':'')} onClick={()=>setT(k)}><Ic n={i}/><span>{l}<small>{d}</small></span></button>)}
    <div className="foot">Meridian Solutions · Data &amp; AI<br/>Proposed capabilities, subject to validation</div></aside>
   <div className="mainc">
    <div className="top"><div><h1 className="serif">{cur[1]}</h1><p>{cur[2]}</p></div><div className="sp"/>
     {t==='con'&&<label className="rolebox">Viewing as<select className="role" value={role} onChange={e=>setRole(e.target.value)} title="Simulated user role (affects contract access)"><option>Legal</option><option>Operations</option><option>Finance</option></select></label>}
     <div className="badge"><i/>Prototype · synthetic data</div></div>
    <main key={t}><div className="note"><Ic n="info"/><span>Working prototype for discussion. All plazas, alerts, contracts and figures are synthetic; AI/Azure services are simulated and no external feeds are connected. Alerts support human review — no operational decision is automated.</span></div>
     {t==='ov'&&<Overview go={setT}/>}{t==='risk'&&<Risk/>}{t==='con'&&<Contracts role={role}/>}{t==='ano'&&<Anomaly/>}{t==='val'&&<Validation/>}</main>
    <footer>Meridian Solutions · Data &amp; AI · Architecture &amp; Solution Proposal · Draft v0.1</footer></div></div>
}
