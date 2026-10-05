import * as D from './data/demoData.js';
const j=async u=>{const r=await fetch(u);if(!r.ok)throw new Error(u+' '+r.status);return r.json()};
// Loads from the REST API (PostgreSQL/PostGIS) and fills the shared arrays in place; falls back to demoData.js if the API is down.
export async function loadAll(){try{const [i,c]=await Promise.all([j('/api/interventions'),j('/api/priority-sites')]);D.interventions.splice(0,D.interventions.length,...i);D.candidates.splice(0,D.candidates.length,...c);return 'api'}catch(e){console.warn('API unavailable, using demoData.js',e);return 'demo'}}
export const getIntervention=id=>j('/api/interventions/'+id);
export async function uploadImage(file,lat,lng){const f=new FormData();f.append('image',file);if(lat&&lng){f.append('lat',lat);f.append('lng',lng)}const r=await fetch('/api/field-images/upload',{method:'POST',body:f});return r.json()}
