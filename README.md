# Interise Phase 2 – Prototype (Meridian Solutions)
React (Vite) frontend + FastAPI backend. **All data is synthetic sample data**; no Azure services or external feeds are connected.

## Run
    cd frontend && npm install && npm run build      # builds UI into frontend/dist
    cd ../backend && pip install fastapi uvicorn && uvicorn main:app --port 8000
    open http://localhost:8000
Dev mode: `uvicorn main:app --reload --port 8000` and `cd frontend && npm run dev` (proxies /api).

## What's in the prototype
- Overview: Phase 1 vs Phase 2, POC activity coverage
- 2A Risk: alerts + schematic map, pilot scope slider, Confirmed vs AI-inferred, context & Teams/e-mail previews, useful/not-useful feedback, source validation tracker, event classifier (rule-based stand-in for Azure OpenAI), editable risk rules, metrics & audit log
- 2B Contracts: Q&A with citations, upload & extract (simulated), obligation register, extraction quality, role-based access (role selector in header)
- 2C Anomalies: baseline chart with tunable threshold, network heatmap, backtest vs labelled incidents (precision/recall), alert routing rules
- Validation: open-questions tracker (nothing assumed available until Confirmed)

## Meridian logo
Drop the official transparent logo at `frontend/public/meridian-logo.png`; until then a text wordmark is shown.
Theme: primary #1149DC, accent #8D77FD, Bookman Old Style headings, Calibri body.

## Replace mocks with real services (later)
- /api/alerts, /api/scan -> Azure Functions + Azure Maps + Azure OpenAI over Fabric Lakehouse
- /api/contracts/ask -> Azure AI Search + Azure OpenAI (citations)
- /api/anomalies -> Fabric Notebooks / Azure ML scoring
