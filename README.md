# JalDrishti 🌊
### Geospatial & AI-Driven Decision Support for Watershed Development

**Team TantraVit** | Smart India Hackathon 2026

JalDrishti is a geospatial and AI-driven decision-support platform designed to help monitor watershed development interventions, analyse environmental changes, understand hydrological behaviour, and identify potential locations for future interventions.

The platform integrates **geo-tagged field images, computer vision, GIS-based spatial analysis, satellite-derived indicators, and hydrological modelling** into a unified workflow for watershed monitoring and planning.

---

## 🌱 The Problem

Watershed development projects involve interventions such as check dams, farm ponds, and recharge structures to improve water conservation, reduce soil erosion, and support sustainable land management.

However, monitoring these interventions and evaluating their impact can be challenging because:

- Field photographs and inspection records may be scattered across different locations and systems.
- The geographical context of an intervention is not always analysed alongside its field evidence.
- Environmental changes before and after an intervention can be difficult to assess consistently.
- Hydrological impacts may require specialised modelling and analysis.
- Authorities need reliable, spatially informed insights to prioritise maintenance and plan future interventions.

**JalDrishti aims to connect field-level observations with geospatial and environmental intelligence to support more informed watershed development decisions.**

## 💡 Our Solution

JalDrishti brings together multiple sources of information to create an integrated view of watershed interventions and their surrounding environment.

The platform is designed to help answer:

- Where is a watershed intervention located?
- What type of structure is present, and what is its visible condition?
- What environmental changes are observable before and after implementation?
- How does the intervention relate to surrounding terrain, drainage, and streams?
- What hydrological responses might be expected under different scenarios?
- Which existing interventions require attention, and which potential locations should be investigated for future development?

The platform is intended to support planning and monitoring decisions, with modelled outputs and AI predictions treated as decision-support evidence rather than definitive ground truth.

## 🔄 System Workflow

The JalDrishti workflow follows six stages:

### 1. Observe — Field Intelligence
- Upload field photographs of watershed interventions.
- Extract available GPS coordinates and timestamps from image metadata.
- Apply computer vision to detect relevant structures and, where supported, assess their visible condition.

### 2. Locate & Analyse — Geospatial Intelligence
- Associate field evidence with geographical locations.
- Analyse watershed and sub-watershed boundaries, drainage networks, streams, and spatial relationships.
- Incorporate terrain attributes such as elevation and slope when suitable data is available.
- Evaluate proximity and spatial context for existing and candidate interventions.

### 3. Measure Change — Satellite Intelligence
- Retrieve and analyse multi-temporal satellite imagery.
- Calculate vegetation and water-related indicators such as NDVI and NDWI when imagery and processing pipelines are available.
- Compare pre-intervention and post-intervention observations to identify environmental changes.

### 4. Simulate — Hydrological Intelligence
- Integrate hydrological modelling using SWAT+.
- Use relevant rainfall, terrain, soil, land-use, drainage, and intervention data.
- Support analysis of runoff, water balance, recharge-related indicators, and sediment or erosion responses.
- Compare baseline conditions with proposed intervention scenarios.

### 5. Decide — AI Decision Intelligence
- Combine relevant field, spatial, satellite, and hydrological features.
- Develop AI-assisted intervention prioritisation and suitability analysis using XGBoost.
- Identify potential priority zones and candidate intervention locations for further investigation.

### 6. Visualise — Decision Support Dashboard
- Explore interventions and spatial layers on an interactive map.
- Review field evidence and intervention details.
- Compare environmental indicators and scenario results.
- Identify interventions requiring attention and locations requiring further assessment.

## 🏗️ System Architecture

```text
                 FIELD EVIDENCE
                Geo-tagged Images
                        |
             +----------+----------+
             |                     |
       EXIF Extraction       Computer Vision
       GPS / Timestamp       YOLO Detection
             |                     |
             +----------+----------+
                        |
                GEOSPATIAL ANALYSIS
                  GIS / PostGIS
                        |
             +----------+----------+
             |                     |
      Satellite Analysis     Terrain & Drainage
        NDVI / NDWI           Spatial Context
             |                     |
             +----------+----------+
                        |
              HYDROLOGICAL MODELLING
                     SWAT+
                        |
               AI DECISION ENGINE
                    XGBoost
                        |
             +----------+----------+
             |          |          |
           Impact     Priority   Candidate
          Assessment    Zones      Sites
             |          |          |
             +----------+----------+
                        |
              JALDRISHTI DASHBOARD
```

*The diagram represents the proposed end-to-end architecture. The availability and maturity of individual components depend on the current implementation and data sources.*

## ✨ Key Features

- **Field Evidence Management:** Upload and review photographs associated with watershed interventions.
- **Geotagging:** Extract GPS metadata when available and support manual location entry when necessary.
- **AI-Based Detection:** Apply computer vision to identify objects in uploaded images, with watershed-specific detection dependent on an appropriate trained model.
- **GIS-Based Analysis:** Associate interventions with spatial features and surrounding geographical context.
- **Satellite Change Analysis:** Support before-and-after environmental comparisons using vegetation and water indices.
- **Hydrological Assessment:** Incorporate SWAT+ modelling for watershed response and intervention scenarios.
- **Intervention Prioritisation:** Develop data-driven methods for identifying areas that may warrant further attention.
- **Interactive Dashboard:** Present intervention locations, evidence, analysis, and planning insights in one interface.

## 🛠️ Technology Stack

The project architecture uses, or is designed to integrate, the following technologies:

| Component | Technology |
|---|---|
| Frontend | React, Vite |
| Mapping | Leaflet |
| Backend API | Node.js, Express |
| Database | PostgreSQL, PostGIS |
| Computer Vision Service | Python, FastAPI, Ultralytics YOLO, ONNX Runtime |
| Satellite Analysis | Sentinel-2 / Landsat and relevant satellite data services |
| Geospatial Processing | GDAL, Rasterio, GeoPandas |
| Hydrological Modelling | SWAT+ / QSWAT+ |
| Machine Learning | XGBoost |
| Containerisation | Docker, Docker Compose |

*The technologies listed represent the current prototype stack and planned integrations; not every component is necessarily operational in every deployment.*

## 🚀 Getting Started

### Prerequisites

Depending on the deployment method, you may need:

- Git
- Node.js and npm
- Python 3
- Docker and Docker Compose
- PostgreSQL with the PostGIS extension, if running the database outside Docker

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_FOLDER>
```

Replace the placeholders with your actual GitHub repository URL and folder name.

### 2. Start the Backend Services

If the repository includes a configured `docker-compose.yml`, start the database, backend, and AI service with:

```bash
docker compose up --build
```

Check the repository configuration and service logs for startup errors.

### 3. Start the Frontend

Open a second terminal in the frontend project directory, where `package.json` is located:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal, typically:

```text
http://localhost:5173
```

**Note:** The commands above assume the frontend is at the repository root. If the project has a separate `frontend/` directory, first run `cd frontend`. Follow the actual repository structure if it differs.

### 4. Configure Environment Variables

Set the database connection, backend URL, and AI service URL according to the project's configuration.

Keep credentials and API keys in environment variables or a local `.env` file. Do not commit secrets to GitHub. If the repository contains an `.env.example`, use it as a template.

### 5. Initialise Demo Data

If the backend provides a seed script, use the instructions in the backend README or package configuration to populate the database with demonstration records.

Demo data should be clearly distinguished from real field observations and validated environmental measurements.

## 🧪 Current Prototype & Limitations

JalDrishti is being developed incrementally, with a focus on building a working prototype before integrating every advanced analytical component.

Depending on the current configuration:

- Field image uploads and database-backed intervention records may be available.
- GPS metadata extraction and manual location entry may be supported.
- The generic pretrained YOLO model may detect common objects but is **not, by itself, a watershed-specific detection model**.
- Accurate detection of check dams, farm ponds, and recharge structures requires an appropriately trained and evaluated model.
- Satellite indicators, terrain analysis, and hydrological outputs require suitable datasets and processing pipelines.
- SWAT+ results require appropriate watershed inputs, calibration, and validation.
- AI-generated recommendations should be reviewed alongside field evidence and domain expertise.

The platform does not claim to prove that an observed environmental change was caused solely by a particular intervention. Modelled results are estimates and should be interpreted with their data coverage, assumptions, and confidence limitations in mind.

## 🔭 Future Scope

Planned improvements include:

- Training and evaluating a watershed-specific object detection model.
- Integrating elevation data to derive terrain and drainage characteristics.
- Automating satellite-based NDVI and NDWI time-series analysis.
- Integrating validated SWAT+ baseline and intervention scenarios.
- Developing an XGBoost-based intervention prioritisation pipeline.
- Combining multiple evidence sources into transparent impact and suitability indicators.
- Adding confidence scores, validation workflows, and field-verification alerts.
- Expanding the platform to support additional watersheds and administrative regions.

## 🌍 Expected Impact

JalDrishti aims to support more systematic watershed monitoring by connecting field observations with geospatial and environmental analysis.

Potential benefits include:

- Better visibility into the location and status of watershed interventions.
- More consistent review of field evidence.
- Improved understanding of spatial and environmental changes.
- Evidence-informed prioritisation of maintenance and future interventions.
- More transparent reporting for watershed planning and monitoring.

These are intended benefits; their actual effectiveness will depend on data quality, model validation, and real-world evaluation.

## 👥 Team

**Team Name:** TantraVit  
**Project Name:** JalDrishti  
**Hackathon:** Smart India Hackathon 2026  
**Problem Statement:** SIH26015  
**Domain:** Agriculture, Food Technology & Rural Development  
**Sponsor:** Ministry of Rural Development, Department of Land Resources

## 🤝 Contributions

Contributions, suggestions, and feedback are welcome. Please open an issue to report bugs or propose improvements. For substantial changes, create a separate branch and submit a pull request with a clear description of the changes.

## 📜 Disclaimer

JalDrishti is a decision-support prototype for watershed development monitoring and planning. AI predictions, satellite-derived indicators, spatial analysis, and hydrological simulations are subject to data availability, model limitations, and validation requirements. Outputs should not replace field verification, expert assessment, or official engineering decisions.

---

**JalDrishti — From Field Evidence to Watershed Intelligence.**  
*Built by Team TantraVit.*
