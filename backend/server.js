import express from 'express';import cors from 'cors';import multer from 'multer';import exifr from 'exifr';import fs from 'fs';import path from 'path';
import {q} from './db.js';
const AI=process.env.AI_URL||'http://localhost:8000',UP=path.resolve(process.env.UPLOAD_DIR||'./uploads');fs.mkdirSync(UP,{recursive:true});
const app=express();app.use(cors());app.use('/uploads',express.static(UP));
const up=multer({storage:multer.diskStorage({destination:UP,filename:(r,f,cb)=>cb(null,Date.now()+'-'+f.originalname.replace(/[^\w.-]/g,'_'))})});
const YR=[2023,2024,2025,2026],M=r=>({runoff:r.runoff,yield:r.water_yield,recharge:r.recharge,sediment:r.sediment});
async function build(where='',a=[]){
 const rows=await q(`select *,ST_Y(geom) lat,ST_X(geom) lng,to_char(implemented_date,'YYYY-MM-DD') impl from interventions ${where} order by id`,a);if(!rows.length)return[];const ids=rows.map(r=>r.id);
 const [ob,hy,im]=await Promise.all([q('select * from satellite_observations where intervention_id=any($1)',[ids]),q('select * from hydrology_results where intervention_id=any($1)',[ids]),q('select * from field_images where intervention_id=any($1) order by id',[ids])]);
 return rows.map(r=>{const o=ob.filter(x=>x.intervention_id===r.id),h=Object.fromEntries(hy.filter(x=>x.intervention_id===r.id).map(x=>[x.scenario,x]));
 const top=(d)=>Array.isArray(d)&&d[0]?d[0].confidence:null;
 return{id:r.id,name:r.name,type:r.type,latitude:r.lat,longitude:r.lng,status:r.status,priority:r.priority,implementedDate:r.impl,daysAgo:r.days_ago,lastInspection:r.last_inspection,source:r.source,
 ai:{detectedType:r.ai_detected,confidence:r.ai_confidence,condition:r.condition},spatial:{subBasin:r.sub_basin,nearestStream:r.nearest_stream_m,elevation:r.elevation_m,slope:r.slope_deg},
 satellite:{ndvi:Object.fromEntries(o.map(x=>[x.year,x.ndvi])),ndwi:Object.fromEntries(o.map(x=>[x.year,x.ndwi]))},
 hydrology:{baseline:h.baseline?M(h.baseline):null,intervention:h.intervention?M(h.intervention):null,confidence:h.baseline?.confidence||null},
 photos:im.filter(x=>x.intervention_id===r.id).map(x=>({id:x.id,date:x.captured_at,azimuth:x.azimuth,conf:top(x.detections),detections:x.detections,url:x.file_path?'/uploads/'+path.basename(x.file_path):null,lat:x.lat,lng:x.lng})),
 concern:r.concern,decision:r.decision};});}
const wrap=f=>(req,res)=>f(req,res).catch(e=>{console.error(e);res.status(500).json({error:e.message})});
app.get('/api/health',wrap(async(_,res)=>res.json({ok:true,db:(await q('select postgis_version() v'))[0].v})));
app.get('/api/interventions',wrap(async(_,res)=>res.json(await build())));
const one=async(req,res)=>{const [i]=await build('where id=$1',[req.params.id]);if(!i)res.status(404).json({error:'not found'});return i};
app.get('/api/interventions/:id',wrap(async(req,res)=>{const i=await one(req,res);if(i)res.json(i)}));
app.get('/api/interventions/:id/photos',wrap(async(req,res)=>{const i=await one(req,res);if(i)res.json(i.photos)}));
app.get('/api/interventions/:id/impact',wrap(async(req,res)=>{const i=await one(req,res);if(i)res.json({note:'Precomputed / illustrative satellite values',satellite:i.satellite})}));
app.get('/api/interventions/:id/hydrology',wrap(async(req,res)=>{const i=await one(req,res);if(i)res.json({note:'Precomputed SWAT+-style demo output (modelled, not ground truth)',...i.hydrology})}));
app.get('/api/priority-sites',wrap(async(_,res)=>{const r=await q('select id,ST_Y(geom) lat,ST_X(geom) lng,priority,reasons,factors from priority_sites order by id');res.json(r.map(x=>({id:x.id,latitude:x.lat,longitude:x.lng,priority:x.priority,reasons:x.reasons,factors:x.factors})))}));
async function spatial(lat,lng){const [r]=await q(`with p as(select ST_SetSRID(ST_MakePoint($2,$1),4326) g)
 select (select s.id from sub_watersheds s,p where ST_Contains(s.geom,p.g) limit 1) sub_basin,
 (select round(ST_Distance(st.geom::geography,p.g::geography)::numeric,1)::float from streams st,p order by st.geom<->p.g limit 1) stream_m,
 (select z.level from priority_zones z,p where ST_Contains(z.geom,p.g) order by case z.level when 'High' then 0 when 'Medium' then 1 else 2 end limit 1) priority_zone,
 (select ST_Contains(w.geom,p.g) from watersheds w,p limit 1) inside_watershed,
 (select coalesce(json_agg(json_build_object('id',i.id,'name',i.name,'distance_m',round(ST_Distance(i.geom::geography,p.g::geography)::numeric))order by ST_Distance(i.geom::geography,p.g::geography)),'[]'::json) from interventions i,p where ST_DWithin(i.geom::geography,p.g::geography,500)) nearby`,[lat,lng]);
 return{...r,elevation_m:null,slope_deg:null,elevation_note:'No DEM loaded; elevation/slope not computed'};}
app.post('/api/field-images/upload',up.single('image'),wrap(async(req,res)=>{
 if(!req.file)return res.status(400).json({error:'image field required'});
 let ex={};try{ex=(await exifr.parse(req.file.path,true))||{}}catch{}
 let lat=ex.latitude,lng=ex.longitude,manual=false;const gps=Number.isFinite(lat)&&Number.isFinite(lng);
 if(!gps&&req.body.lat&&req.body.lng){lat=+req.body.lat;lng=+req.body.lng;manual=true}
 const metadata={gps_available:gps,latitude:lat??null,longitude:lng??null,manual_location:manual,timestamp:ex.DateTimeOriginal?new Date(ex.DateTimeOriginal).toISOString():null,azimuth:ex.GPSImgDirection??null,message:gps||manual?null:'GPS unavailable — manual location required.'};
 let ai;try{const fd=new FormData();fd.append('image',new Blob([fs.readFileSync(req.file.path)]),req.file.originalname);const r=await fetch(AI+'/predict',{method:'POST',body:fd});if(!r.ok)throw new Error('AI service '+r.status);ai=await r.json()}catch(e){return res.status(502).json({error:'AI service unavailable: '+e.message,metadata})}
 const image={url:'/uploads/'+path.basename(req.file.path),width:ai.image_width,height:ai.image_height};
 const detections=ai.detected_objects,top=[...detections].sort((a,b)=>b.confidence-a.confidence)[0];
 const base={image,metadata,model:{name:ai.model,custom_watershed_model:ai.custom_watershed_model},detections};
 if(lat==null){return res.json({...base,needs_manual_location:true,intervention:null,spatial:null})}
 const sp=await spatial(lat,lng),near=sp.nearby[0];let id,created;
 const relevant=ai.custom_watershed_model&&top;const type=relevant?top.class.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()):'Unclassified structure';
 if(near&&near.distance_m<=20){id=near.id;created=false;
  await q(`update interventions set last_inspection=$2,days_ago=0,ai_detected=coalesce($3,ai_detected),ai_confidence=coalesce($4,ai_confidence) where id=$1`,[id,new Date().toISOString().slice(0,10),relevant?top.class:null,relevant?top.confidence:null]);}
 else{id='FI-'+String((await q("select count(*)::int n from interventions where source='upload'"))[0].n+1).padStart(2,'0');created=true;
  await q(`insert into interventions(id,name,type,status,priority,geom,implemented_date,ai_detected,ai_confidence,condition,sub_basin,nearest_stream_m,last_inspection,days_ago,decision,source)
  values($1,$2,$3,'new','Unassessed',ST_SetSRID(ST_MakePoint($5,$4),4326),null,$6,$7,'Needs Review',$8,$9,$10,0,'Field verification','upload')`,
  [id,`Field observation ${id}`,type,lat,lng,top?.class||'No detection',top?.confidence||null,sp.sub_basin,sp.stream_m,new Date().toISOString().slice(0,10)]);}
 await q('insert into field_images(intervention_id,file_path,captured_at,lat,lng,azimuth,detections,img_w,img_h) values($1,$2,$3,$4,$5,$6,$7,$8,$9)',[id,req.file.path,metadata.timestamp,lat,lng,metadata.azimuth,JSON.stringify(detections),image.width,image.height]);
 const [intervention]=await build('where id=$1',[id]);
 res.json({...base,spatial:sp,created,intervention});}));
app.listen(process.env.PORT||4000,()=>console.log('Tantravit API on',process.env.PORT||4000));
