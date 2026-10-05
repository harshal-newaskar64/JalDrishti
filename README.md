# Tantravit vertical slice
Docker: `docker compose up --build` (postgres+postgis :5432, backend :4000, ai-service :8000), then `npm install && npm run dev` for the frontend (proxies /api to :4000).
Local without Docker: PostGIS DB `tantravit`, `cd backend && npm i && npm start`; `cd ai-service && pip install -r requirements.txt && curl -L -o yolo11n.onnx https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.onnx && uvicorn main:app --port 8000`.
Custom watershed model: export to ONNX, mount as /models/watershed.onnx with /models/classes.txt. Reseed DB: `cd backend && node seed.js --force`.
