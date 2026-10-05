CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE IF NOT EXISTS watersheds(id serial PRIMARY KEY,name text,geom geometry(Polygon,4326));
CREATE TABLE IF NOT EXISTS sub_watersheds(id text PRIMARY KEY,geom geometry(Polygon,4326));
CREATE TABLE IF NOT EXISTS streams(id serial PRIMARY KEY,geom geometry(LineString,4326));
CREATE TABLE IF NOT EXISTS priority_zones(id serial PRIMARY KEY,level text,geom geometry(Polygon,4326));
CREATE TABLE IF NOT EXISTS interventions(id text PRIMARY KEY,name text,type text,status text,priority text,geom geometry(Point,4326),implemented_date date,
 ai_detected text,ai_confidence real,condition text,sub_basin text,nearest_stream_m real,elevation_m real,slope_deg real,last_inspection text,days_ago int,concern text,decision text,source text DEFAULT 'seed',created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS field_images(id serial PRIMARY KEY,intervention_id text REFERENCES interventions(id) ON DELETE CASCADE,file_path text,captured_at text,lat double precision,lng double precision,azimuth real,detections jsonb,img_w int,img_h int,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS satellite_observations(intervention_id text REFERENCES interventions(id) ON DELETE CASCADE,year int,ndvi real,ndwi real,PRIMARY KEY(intervention_id,year));
CREATE TABLE IF NOT EXISTS hydrology_results(intervention_id text REFERENCES interventions(id) ON DELETE CASCADE,scenario text,runoff real,water_yield real,recharge real,sediment real,confidence text,PRIMARY KEY(intervention_id,scenario));
CREATE TABLE IF NOT EXISTS priority_sites(id text PRIMARY KEY,geom geometry(Point,4326),priority text,reasons jsonb,factors jsonb);
CREATE INDEX IF NOT EXISTS i_int ON interventions USING gist(geom);CREATE INDEX IF NOT EXISTS i_str ON streams USING gist(geom);
CREATE INDEX IF NOT EXISTS i_sub ON sub_watersheds USING gist(geom);CREATE INDEX IF NOT EXISTS i_zone ON priority_zones USING gist(geom);
