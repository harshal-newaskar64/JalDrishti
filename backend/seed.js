import fs from 'fs';import {pool,q} from './db.js';import * as D from './demoData.js';
const ring=pts=>{const p=[...pts,pts[0]];return 'POLYGON(('+p.map(([la,ln])=>`${ln} ${la}`).join(',')+'))'};
const rect=([[a,b],[c,d]])=>ring([[a,b],[a,d],[c,d],[c,b]]);
await pool.query(fs.readFileSync(new URL(process.env.SCHEMA||'../db/schema.sql',import.meta.url),'utf8'));
const force=process.argv.includes('--force');
if(!force&&(await q('select count(*)::int n from interventions'))[0].n>0){console.log('DB already seeded');await pool.end();process.exit(0)}
await pool.query('truncate watersheds,sub_watersheds,streams,priority_zones,interventions,priority_sites cascade');
const g=w=>`ST_GeomFromText('${w}',4326)`;
await q(`insert into watersheds(name,geom) values($1,${g(ring(D.watershed.boundary))})`,[D.watershed.name]);
for(const s of D.subwatersheds)await q(`insert into sub_watersheds values($1,${g(ring(s.poly))})`,[s.id]);
for(const s of D.streams)await q(`insert into streams(geom) values(${g('LINESTRING('+s.map(([a,b])=>`${b} ${a}`).join(',')+')')})`);
for(const z of D.zones)await q(`insert into priority_zones(level,geom) values($1,${g(rect(z.b))})`,[z.level]);
for(const i of D.interventions){
 await q(`insert into interventions(id,name,type,status,priority,geom,implemented_date,ai_detected,ai_confidence,condition,sub_basin,nearest_stream_m,elevation_m,slope_deg,last_inspection,days_ago,concern,decision) values($1,$2,$3,$4,$5,${g(`POINT(${i.longitude} ${i.latitude})`)},$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
 [i.id,i.name,i.type,i.status,i.priority,i.implementedDate,i.ai.detectedType,i.ai.confidence,i.ai.condition,i.spatial.subBasin,i.spatial.nearestStream,i.spatial.elevation,i.spatial.slope,i.lastInspection,i.daysAgo,i.concern||null,i.decision]);
 for(const y of D.YEARS)await q('insert into satellite_observations values($1,$2,$3,$4)',[i.id,y,i.satellite.ndvi[y],i.satellite.ndwi[y]]);
 const h=i.hydrology;for(const [sc,v] of [['baseline',h.baseline],['intervention',h.intervention]])await q('insert into hydrology_results values($1,$2,$3,$4,$5,$6,$7)',[i.id,sc,v.runoff,v.yield,v.recharge,v.sediment,h.confidence]);
 for(const p of i.photos)await q('insert into field_images(intervention_id,captured_at,azimuth,detections) values($1,$2,$3,$4)',[i.id,p.date,p.azimuth,JSON.stringify([{class:i.ai.detectedType,confidence:p.conf,source:'seeded demo record'}])]);}
for(const c of D.candidates)await q(`insert into priority_sites values($1,${g(`POINT(${c.longitude} ${c.latitude})`)},$2,$3,$4)`,[c.id,c.priority,JSON.stringify(c.reasons),JSON.stringify(c.factors)]);
// Replace demo spatial attributes with real PostGIS results where geometry allows
await q(`update interventions i set sub_basin=coalesce((select s.id from sub_watersheds s where ST_Contains(s.geom,i.geom) limit 1),i.sub_basin),
 nearest_stream_m=(select round(ST_Distance(st.geom::geography,i.geom::geography)::numeric) from streams st order by st.geom<->i.geom limit 1)`);
console.log('Seeded');await pool.end();
