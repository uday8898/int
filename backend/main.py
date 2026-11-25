"""Interise Phase 2 – prototype API (FastAPI). ALL DATA IS SYNTHETIC SAMPLE DATA.
Run: uvicorn main:app --reload --port 8000   (serves ../frontend/dist if built)"""
import math, random, itertools
from datetime import date, timedelta
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="Interise Phase 2 Prototype API", version="0.1")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
TODAY = date.today()

# x,y are schematic map positions (0-100), not real coordinates.
PLAZAS = [
 dict(id="P01", name="Toll Plaza 01", corridor="Corridor A", x=22, y=30),
 dict(id="P02", name="Toll Plaza 02", corridor="Corridor A", x=34, y=44),
 dict(id="P03", name="Toll Plaza 03", corridor="Corridor B", x=52, y=22),
 dict(id="P04", name="Toll Plaza 04", corridor="Corridor B", x=66, y=36),
 dict(id="P05", name="Toll Plaza 05", corridor="Corridor C", x=48, y=62),
 dict(id="P06", name="Toll Plaza 06", corridor="Corridor C", x=70, y=70),
 dict(id="P07", name="Toll Plaza 07", corridor="Corridor D", x=28, y=72),
 dict(id="P08", name="Toll Plaza 08", corridor="Corridor D", x=82, y=50),
]

_ids = itertools.count(1)
def _alert(plaza, kind, sev, status_kind, source, text, action, when):
    return dict(id=f"A{next(_ids):03d}", plaza=plaza, type=kind, severity=sev,
        basis=status_kind, source=source, summary=text, recommendation=action,
        when=when, state="new", history_context="Historical weekday volume on file for this plaza (sample)")
AUDIT=[]
def log(actor,action,detail): AUDIT.insert(0,dict(ts=__import__("datetime").datetime.now().strftime("%H:%M:%S"),actor=actor,action=action,detail=detail))
ALERTS = [
 _alert("P03","Heavy rainfall","High","Confirmed","Weather warning feed (sample)",
   "Heavy rainfall warning detected near Toll Plaza 03 for tomorrow. Potential waterlogging and traffic disruption identified.",
   "Review drainage readiness and staffing requirements.","Tomorrow"),
 _alert("P05","Highway closure","High","Confirmed","Road advisory feed (sample)",
   "Closure advisory received for a stretch on Corridor C. Toll Plazas 05 and 06 may see diverted traffic.",
   "Notify respective operations teams; confirm diversion plan.","Today–Thu"),
 _alert("P01","Political rally","Medium","AI-inferred","News article (sample) – unverified",
   "Reported rally near Corridor A route. Potential congestion at Toll Plaza 01. Event timing not confirmed by an official source.",
   "Request operational verification before any staffing change.","This weekend"),
 _alert("P08","Religious gathering","Medium","AI-inferred","Event notice (sample) – unverified",
   "Large gathering mentioned near Toll Plaza 08. Possible traffic surge.",
   "Verify with local contacts; recommend staffing readiness if confirmed.","Next week"),
 _alert("P02","Dense fog","Low","Confirmed","Weather warning feed (sample)",
   "Dense fog warning for the Corridor A region overnight. Visibility and vehicle-movement risk.",
   "Notify teams on shift; review lane-safety procedures.","Tonight"),
]

class Verify(BaseModel):
    action: str  # verify | dismiss | escalate

@app.get("/api/health")
def health(): return {"ok": True, "data": "synthetic"}

@app.get("/api/plazas")
def plazas(): return PLAZAS

@app.get("/api/alerts")
def alerts(): return ALERTS

@app.post("/api/alerts/{aid}/review")
def review(aid: str, body: Verify):
    a = next((x for x in ALERTS if x["id"] == aid), None)
    if not a: raise HTTPException(404, "alert not found")
    if body.action not in ("verify", "dismiss", "escalate"): raise HTTPException(400, "bad action")
    log("Ops user","alert_"+body.action,f"{a['id']} {a['type']} @ {a['plaza']}")
    a["state"] = {"verify": "verified", "dismiss": "dismissed", "escalate": "escalated"}[body.action]
    if body.action == "verify": a["basis"] = "Confirmed (ops verified)"
    return a

@app.post("/api/scan")
def scan():
    """Simulates one scheduled collection run (Azure Functions) producing a new AI-inferred alert."""
    p = random.choice(PLAZAS)
    a = _alert(p["id"], "Public event", "Medium", "AI-inferred", "News article (sample) – unverified",
        f"Public event reported near {p['name']}. Potential traffic surge; details not yet confirmed.",
        "Request operational verification.", "Upcoming")
    ALERTS.insert(0, a); log("System","feed_collection","Scheduled run created "+a["id"]); return a

# ---------- contracts ----------
CONTRACTS = [
 dict(id="C1", title="Concession Agreement – Corridor A", type="Concession", expiry=str(TODAY+timedelta(days=210)), pages=212, access=["Legal","Operations"], scanned=False),
 dict(id="C2", title="Concession Agreement – Corridor B", type="Concession", expiry=str(TODAY+timedelta(days=980)), pages=187, access=["Legal","Operations"], scanned=True),
 dict(id="C3", title="O&M Contract – Corridor C", type="O&M", expiry=str(TODAY+timedelta(days=330)), pages=96, access=["Legal","Operations"], scanned=False),
 dict(id="C4", title="O&M Contract – Corridor D", type="O&M", expiry=str(TODAY+timedelta(days=520)), pages=88, access=["Legal","Operations"], scanned=True),
 dict(id="C5", title="Vendor Agreement – Tolling Systems", type="Vendor", expiry=str(TODAY+timedelta(days=150)), pages=44, access=["Legal","Finance"], scanned=False),
 dict(id="C6", title="Annual Compliance Audit Report", type="Audit", expiry=None, pages=60, access=["Legal","Finance"], scanned=False),
]
@app.get("/api/contracts")
def contracts(role: str = "Legal"): return [c for c in CONTRACTS if role in c["access"]]

class Ask(BaseModel):
    question: str
    role: str = "Legal"

@app.post("/api/contracts/ask")
def ask(body: Ask):
    q = body.question.lower(); allowed = {c["title"] for c in CONTRACTS if body.role in c["access"]}
    def keep(items, cites):
        ci = [c for c in cites if c["doc"] in allowed]
        it = [i for i in items if any(i.startswith(t) for t in allowed)]
        return it, ci, len(cites)-len(ci)
    if "expir" in q or "12 months" in q:
        soon = sorted([c for c in CONTRACTS if c["expiry"] and date.fromisoformat(c["expiry"]) <= TODAY+timedelta(days=365)], key=lambda c: c["expiry"])
        items=[f'{c["title"]} — ends {c["expiry"]}' for c in soon]
        cites=[dict(doc=c["title"], page=3 if c["type"]!="Concession" else 6, note="Term / expiry clause (sample)") for c in soon]
        ans="These documents have an end date within the next 12 months (from extracted metadata):"
    elif "penal" in q or "non-compliance" in q or "noncompliance" in q:
        items=["O&M Contract – Corridor C: penalty linked to missed maintenance response windows","Concession Agreement – Corridor A: remedies for failure to meet service standards","Vendor Agreement – Tolling Systems: service-level credit for system downtime"]
        cites=[dict(doc="O&M Contract – Corridor C", page=41, note="Penalties clause"),dict(doc="Concession Agreement – Corridor A", page=118, note="Remedies for non-compliance"),dict(doc="Vendor Agreement – Tolling Systems", page=22, note="SLA credits")]
        ans="Penalty and non-compliance provisions identified (sample text, not real contract language):"
    elif "maint" in q or "oblig" in q:
        items=["Concession Agreement – Corridor A: routine pavement and drainage inspection at defined intervals","Concession Agreement – Corridor A: periodic structural and toll-system maintenance","O&M Contract – Corridor C: reporting of defects and incidents to the authority"]
        cites=[dict(doc="Concession Agreement – Corridor A", page=96, note="Operations & maintenance"),dict(doc="O&M Contract – Corridor C", page=18, note="Scope of work")]
        ans="Maintenance obligations extracted for the requested asset (sample):"
    else:
        return dict(answer="No match in the sample set. Try: 'agreements expiring in 12 months', 'penalty clauses', or 'maintenance obligations'.", items=[], citations=[], confidence="—", hidden=0)
    it,ci,hid=keep(items,cites)
    log(body.role,"contract_query",body.question[:60])
    return dict(answer=ans, items=it, citations=ci, hidden=hid, confidence="Sample output – verify against source")

SAMPLE_TEXT = """CONCESSION AGREEMENT (SAMPLE TEXT - NOT A REAL CONTRACT)
Effective Date: 2019-04-01. Concession Period: 20 years, ending 2039-03-31.
Clause 12.1 The Concessionaire shall perform routine maintenance of the project highway at quarterly intervals.
Clause 12.4 Periodic renewal of the pavement shall be completed by 2027-09-30.
Clause 18.2 Failure to meet the service standards shall attract a penalty of INR 25,00,000 per event.
Clause 21.3 Annual compliance report is due by 2026-12-15.
Clause 24.1 Termination payment shall be computed as per Schedule R."""

class Extract(BaseModel):
    filename: str
    text: str = ""
    scanned: bool = False

import re
@app.get("/api/contracts/sample")
def sample(): return dict(filename="sample_concession_agreement.txt", text=SAMPLE_TEXT)

@app.post("/api/contracts/extract")
def extract(body: Extract):
    t = body.text or SAMPLE_TEXT
    dates = re.findall(r"\d{4}-\d{2}-\d{2}", t)
    amts = re.findall(r"(?:INR|Rs\.?|₹)\s?[\d,\.]+(?:\s?(?:lakh|crore))?", t)
    clauses = [l.strip() for l in t.splitlines() if re.match(r"\s*Clause", l)]
    def cat(l):
        l=l.lower()
        return "Penalty" if "penalt" in l else "Maintenance" if "maint" in l or "renewal" in l else "Compliance" if "complian" in l or "report" in l else "Financial" if "payment" in l else "General"
    fields=[]
    for l in clauses:
        d=re.findall(r"\d{4}-\d{2}-\d{2}", l); m=re.findall(r"(?:INR|Rs\.?|₹)\s?[\d,\.]+", l)
        fields.append(dict(clause=re.match(r"\s*(Clause\s[\d\.]+)", l).group(1), category=cat(l), text=l, date=d[0] if d else None, amount=m[0] if m else None, page=3+len(fields)*7, confidence=0.82 if body.scanned else 0.95))
    quality = dict(scanned=body.scanned, ocr_confidence=0.82 if body.scanned else None, fields_found=len(fields), needs_review=body.scanned or len(fields)==0)
    for f in fields:
        if f["date"] and f["category"] in("Maintenance","Compliance"):
            OBLIGATIONS.append(dict(id=f"O{len(OBLIGATIONS)+1:02d}", contract=body.filename, obligation=f["text"][:110], due=f["date"], category=f["category"], owner="To assign", page=f["page"]))
    log("Legal","document_extracted",f"{body.filename}: {len(fields)} clauses")
    return dict(filename=body.filename, dates=dates, amounts=amts, fields=fields, quality=quality, note="Simulated extraction (regex stand-in for Azure AI Document Intelligence + Azure OpenAI).")

OBLIGATIONS = [
 dict(id="O01", contract="Concession Agreement – Corridor A", obligation="Annual compliance report to the authority", due=str(TODAY+timedelta(days=21)), category="Compliance", owner="Compliance", page=131),
 dict(id="O02", contract="O&M Contract – Corridor C", obligation="Quarterly maintenance inspection report", due=str(TODAY+timedelta(days=58)), category="Maintenance", owner="Operations", page=19),
 dict(id="O03", contract="Concession Agreement – Corridor A", obligation="Periodic pavement renewal milestone", due=str(TODAY+timedelta(days=170)), category="Maintenance", owner="Operations", page=98),
 dict(id="O04", contract="Vendor Agreement – Tolling Systems", obligation="SLA review and credit settlement", due=str(TODAY+timedelta(days=75)), category="Financial", owner="Finance", page=23),
 dict(id="O05", contract="Concession Agreement – Corridor B", obligation="Insurance renewal evidence", due=str(TODAY+timedelta(days=240)), category="Compliance", owner="Legal", page=77),
]
@app.get("/api/obligations")
def obligations(role: str="Legal"):
    ok=[c["title"] for c in CONTRACTS if role in c["access"]]
    out=[o for o in OBLIGATIONS if o["contract"] in ok or o["contract"] not in [c["title"] for c in CONTRACTS]]
    for o in out: o["days"]=(date.fromisoformat(o["due"])-TODAY).days
    return sorted(out,key=lambda o:o["due"])

@app.get("/api/extraction/quality")
def quality():
    r=[]
    for c in CONTRACTS:
        ocr=0.83 if c["scanned"] else None
        r.append(dict(title=c["title"],pages=c["pages"],scanned=c["scanned"],ocr_confidence=ocr,fields=18 if not c["scanned"] else 14,tables=6 if c["type"]!="Audit" else 11,needs_review=c["scanned"]))
    return r

# ---------- anomalies ----------
DAYS=60
LABELLED=[("P04",-2,.75,"Traffic disruption"),("P04",-1,.78,"Traffic disruption"),("P06",-1,1.32,"Surge / reconciliation"),
          ("P02",-20,.70,"System outage"),("P07",-34,.68,"Highway closure"),("P03",-45,.72,"Flooding"),("P08",-12,1.30,"Festival surge"),("P05",-27,.74,"Collection issue")]
def _series(pid, days=DAYS):
    rnd = random.Random(pid); out = []
    base = 9000 + 700*int(pid[1:]); wk = [1.0,1.02,1.0,1.04,1.18,1.25,1.12]
    for i in range(days):
        d = TODAY - timedelta(days=days-1-i); b = base*wk[d.weekday()]
        n = rnd.uniform(-.04,.04)
        if rnd.random() < .04: n = rnd.choice([-1,1])*rnd.uniform(.08,.11)   # unlabelled noise bumps
        out.append(dict(date=str(d), baseline=round(b), actual=round(b*(1+n)), label=None))
    return out
SERIES = {p["id"]: _series(p["id"]) for p in PLAZAS}
for pid,off,f,lab in LABELLED:
    r=SERIES[pid][off]; r["actual"]=round(r["baseline"]*f); r["label"]=lab

ROUTING=[
 dict(id="R1",condition="Decline ≥ 20% vs baseline",channel="Teams + e-mail",team="Operations control room + Finance"),
 dict(id="R2",condition="Decline 15–20%",channel="Teams",team="Plaza operations team"),
 dict(id="R3",condition="Increase ≥ 25%",channel="Teams + e-mail",team="Finance (reconciliation) + Operations"),
 dict(id="R4",condition="Other deviations above threshold",channel="E-mail digest",team="Operations"),
]
def route(dev):
    if dev<=-20: return ROUTING[0]
    if dev<0: return ROUTING[1]
    if dev>=25: return ROUTING[2]
    return ROUTING[3]
def _name(pid): return next(p["name"] for p in PLAZAS if p["id"]==pid)

@app.get("/api/anomalies")
def anomalies(threshold: float = 15, days: int = 7):
    out = []
    for pid, s in SERIES.items():
        for r in s[-days:]:
            dev = (r["actual"]-r["baseline"])/r["baseline"]*100
            if abs(dev) >= threshold:
                n=_name(pid); rt=route(dev)
                out.append(dict(plaza=pid, name=n, date=r["date"], deviation=round(dev,1), actual=r["actual"], baseline=r["baseline"], route=rt,
                  message=f"{n} recorded a {abs(round(dev))}% {'decline' if dev<0 else 'increase'} in transactions compared with its historical weekday baseline (sample).",
                  suggestion="Review traffic disruption, system availability and collection operations." if dev<0 else "Review reconciliation and possible traffic surge or data issue."))
    return sorted(out, key=lambda x: x["date"], reverse=True)

@app.get("/api/anomalies/series/{pid}")
def series(pid: str, days: int = 28):
    if pid not in SERIES: raise HTTPException(404)
    return SERIES[pid][-days:]

@app.get("/api/anomalies/heatmap")
def heatmap(days: int = 14):
    rows=[]
    for p in PLAZAS:
        rows.append(dict(plaza=p["id"],name=p["name"],cells=[dict(date=r["date"],dev=round((r["actual"]-r["baseline"])/r["baseline"]*100,1)) for r in SERIES[p["id"]][-days:]]))
    return rows

@app.get("/api/anomalies/backtest")
def backtest(threshold: float = 15):
    tp=fn=fp=0; rows=[]; 
    for pid,s in SERIES.items():
        for r in s:
            dev=(r["actual"]-r["baseline"])/r["baseline"]*100; flagged=abs(dev)>=threshold
            if r["label"]:
                tp+=flagged; fn+=(not flagged)
                rows.append(dict(plaza=_name(pid),date=r["date"],incident=r["label"],deviation=round(dev,1),detected=bool(flagged)))
            elif flagged: fp+=1
    prec=tp/(tp+fp) if tp+fp else 1.0; rec=tp/(tp+fn) if tp+fn else 1.0
    return dict(threshold=threshold,incidents=len(rows),detected=tp,missed=fn,false_alarms=fp,precision=round(prec,2),recall=round(rec,2),rows=sorted(rows,key=lambda x:x["date"]),
                note="Labelled incidents are synthetic. Real backtesting needs client-confirmed historical incident dates.")

@app.get("/api/routing")
def routing(): return ROUTING

# ---------- risk: sources, rules, classifier, context, messages ----------
SOURCES=[
 dict(id="S1",name="IMD weather warnings",kind="official",coverage="District / region",status="Not validated",reliability="High (expected)",last_pull="—",notes="Access method, format and terms of use to be confirmed"),
 dict(id="S2",name="Weather API (commercial)",kind="official",coverage="Point forecast",status="Not validated",reliability="High (expected)",last_pull="—",notes="Licence and consumption cost TBC"),
 dict(id="S3",name="Road closure / traffic advisories",kind="official",coverage="Highway segments",status="Blocked – feed unavailable",reliability="Unknown",last_pull="—",notes="No confirmed machine-readable feed"),
 dict(id="S4",name="Public event announcements",kind="unofficial",coverage="Local",status="Not validated",reliability="Variable",last_pull="—",notes="Needs verification through reliable sources"),
 dict(id="S5",name="News sources (RSS / API)",kind="unofficial",coverage="Regional",status="Not validated",reliability="Variable",last_pull="—",notes="Treat as unverified; AI-inferred only"),
]
STATUS=["Not validated","Validated (sample)","Blocked – feed unavailable"]
@app.get("/api/sources")
def sources(): return SOURCES
@app.post("/api/sources/{sid}/cycle")
def cycle(sid:str):
    x=next((s for s in SOURCES if s["id"]==sid),None)
    if not x: raise HTTPException(404)
    x["status"]=STATUS[(STATUS.index(x["status"])+1)%3]; x["last_pull"]="just now" if x["status"].startswith("Validated") else "—"
    log("AI team","source_status",f'{x["name"]} → {x["status"]}'); return x

RULES={
 "Heavy rainfall":dict(keywords=["rain","flood","waterlog","storm","cyclone"],buffer_km=25,severity="High",requires_verification=False,action="Review drainage readiness and staffing requirements."),
 "Dense fog":dict(keywords=["fog","visibility"],buffer_km=40,severity="Low",requires_verification=False,action="Notify teams about visibility and vehicle-movement risks."),
 "Highway closure":dict(keywords=["closure","closed","diversion","accident","blocked"],buffer_km=15,severity="High",requires_verification=False,action="Identify affected plazas and notify the respective operations team."),
 "Political rally":dict(keywords=["rally","protest","political","march","demonstration"],buffer_km=10,severity="Medium",requires_verification=True,action="Flag potential congestion and request operational verification."),
 "Religious gathering":dict(keywords=["festival","religious","yatra","mela","procession","gathering"],buffer_km=10,severity="Medium",requires_verification=True,action="Flag potential traffic surge and recommend staffing readiness."),
 "Seasonal surge":dict(keywords=["holiday","long weekend","diwali","vacation","season"],buffer_km=0,severity="Low",requires_verification=False,action="Review staffing plan for expected volume increase."),
}
class RuleUpd(BaseModel):
    buffer_km: int | None = None
    severity: str | None = None
    requires_verification: bool | None = None
@app.get("/api/rules")
def rules(): return [dict(type=k,**v) for k,v in RULES.items()]
@app.put("/api/rules/{t}")
def rule_upd(t:str, b:RuleUpd):
    if t not in RULES: raise HTTPException(404)
    for k,v in b.model_dump(exclude_none=True).items(): RULES[t][k]=v
    log("AI team","rule_changed",f"{t}: {b.model_dump(exclude_none=True)}"); return dict(type=t,**RULES[t])

class Classify(BaseModel):
    text: str
    source_kind: str = "unofficial"
    create: bool = False
@app.post("/api/classify")
def classify(b:Classify):
    t=b.text.lower(); typ=None
    for k,v in RULES.items():
        if any(w in t for w in v["keywords"]): typ=k; break
    if not typ: return dict(matched=False,message="No operational event detected (sample rule-based stand-in for Azure OpenAI extraction).")
    r=RULES[typ]; plz=[]
    for p in PLAZAS:
        num=p["id"][1:]
        if re.search(rf"(plaza|tp)\s*0?{int(num)}\b",t) or p["corridor"].lower() in t: plz.append(p["id"])
    when="Tomorrow" if "tomorrow" in t else "Today" if "today" in t else "This weekend" if "weekend" in t else "Next week" if "next week" in t else "Date not stated"
    official=b.source_kind=="official"
    basis="Confirmed" if official and not r["requires_verification"] else "AI-inferred"
    conf=0.9 if official else 0.55
    res=dict(matched=True,event_type=typ,plazas=plz,plaza_names=[_name(x) for x in plz],when=when,severity=r["severity"],basis=basis,confidence=conf,
             buffer_km=r["buffer_km"],requires_verification=r["requires_verification"] or not official,recommendation=r["action"],source_kind=b.source_kind,
             note="Rule-based stand-in for Azure OpenAI structured extraction. Source link would be retained in production.")
    if b.create and plz:
        a=_alert(plz[0],typ,r["severity"],basis,"Classifier (sample) – "+("official" if official else "unverified"),b.text[:180],r["action"],when); ALERTS.insert(0,a); res["alert_id"]=a["id"]
        log("System","alert_created",f'{a["id"]} from classifier')
    return res

IMPACT={"Heavy rainfall":-12,"Dense fog":-6,"Highway closure":15,"Political rally":8,"Religious gathering":20,"Public event":10,"Seasonal surge":14}
@app.get("/api/alerts/{aid}/context")
def context(aid:str):
    a=next((x for x in ALERTS if x["id"]==aid),None)
    if not a: raise HTTPException(404)
    ser=SERIES[a["plaza"]][-14:]
    return dict(plaza=_name(a["plaza"]),series=ser,
        indicative_change=IMPACT.get(a["type"]),
        note="Indicative historical pattern on similar past events (synthetic sample). Not a traffic or revenue prediction.")
@app.get("/api/alerts/{aid}/message")
def message(aid:str):
    a=next((x for x in ALERTS if x["id"]==aid),None)
    if not a: raise HTTPException(404)
    n=_name(a["plaza"])
    return dict(teams=dict(title=f'{a["severity"]} · {a["type"]} · {n}',facts=[("Basis",a["basis"]),("When",a["when"]),("Source",a["source"])],text=a["summary"],action=a["recommendation"],buttons=["Verify","Dismiss","Open in portal"]),
        email=dict(to="ops-"+a["plaza"].lower()+"@example.invalid",subject=f'[{a["severity"]}] {a["type"]} near {n} ({a["basis"]})',body=f'{a["summary"]}\n\nRecommended: {a["recommendation"]}\nSource: {a["source"]}\n\nThis alert supports human review; no operational action is automated.'))
class Fb(BaseModel):
    useful: bool
@app.post("/api/alerts/{aid}/feedback")
def fb(aid:str,b:Fb):
    a=next((x for x in ALERTS if x["id"]==aid),None)
    if not a: raise HTTPException(404)
    a["useful"]=b.useful; log("Ops user","alert_feedback",f'{aid} useful={b.useful}'); return a
@app.get("/api/metrics")
def metrics():
    rated=[a for a in ALERTS if "useful" in a]; 
    return dict(total=len(ALERTS),verified=sum(a["state"]=="verified" for a in ALERTS),dismissed=sum(a["state"]=="dismissed" for a in ALERTS),escalated=sum(a["state"]=="escalated" for a in ALERTS),
        rated=len(rated),useful=sum(a["useful"] for a in rated),confirmed=sum(a["basis"].startswith("Confirmed") for a in ALERTS),inferred=sum(a["basis"]=="AI-inferred" for a in ALERTS))
@app.get("/api/audit")
def audit(): return AUDIT[:40]

# ---------- validation tracker ----------
VALID=[
 dict(id="V1",area="Plaza & asset master",q="Toll plaza coordinates and asset master data available?",owner="Client",status="Open"),
 dict(id="V2",area="Historical data",q="Depth and quality of toll transaction & collection history?",owner="Client + AI team",status="Open"),
 dict(id="V3",area="Weather & IMD",q="IMD / weather source availability, reliability and terms of use?",owner="AI team",status="In progress"),
 dict(id="V4",area="Events & traffic feeds",q="Usable public-event and traffic-advisory feeds; verification method?",owner="AI team + Client",status="Open"),
 dict(id="V5",area="Azure Maps",q="Access to Azure Maps and required APIs?",owner="AI team",status="Open"),
 dict(id="V6",area="Documents",q="Document volume, formats, scan quality, languages?",owner="Client",status="Open"),
 dict(id="V7",area="Security & governance",q="Access controls, data classification, residency, logging?",owner="Client + AI team",status="Open"),
 dict(id="V8",area="Azure services & cost",q="Availability, licensing and consumption cost: OpenAI, AI Search, Document Intelligence, Azure ML?",owner="AI team + Meridian commercial",status="Open"),
 dict(id="V9",area="Accuracy & verification",q="Accuracy expectations and human verification process per initiative?",owner="Client",status="Open"),
]
VS=["Open","In progress","Confirmed"]
@app.get("/api/validation")
def validation(): return VALID
@app.post("/api/validation/{vid}/cycle")
def vcycle(vid:str):
    v=next((x for x in VALID if x["id"]==vid),None)
    if not v: raise HTTPException(404)
    v["status"]=VS[(VS.index(v["status"])+1)%3]; log("AI team","validation",f'{v["area"]} → {v["status"]}'); return v

@app.get("/api/overview")
def overview():
    return dict(plazas=len(PLAZAS),open_alerts=sum(a["state"]=="new" for a in ALERTS),docs=len(CONTRACTS),obligations_90d=sum((date.fromisoformat(o["due"])-TODAY).days<=90 for o in OBLIGATIONS),
        anomalies_7d=len(anomalies(15,7)),validated=sum(v["status"]=="Confirmed" for v in VALID),validation_total=len(VALID),sources_ok=sum(s["status"].startswith("Validated") for s in SOURCES),sources_total=len(SOURCES))

dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if dist.exists(): app.mount("/", StaticFiles(directory=dist, html=True), name="ui")
