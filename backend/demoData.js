// All values are fictional DEMO values. Not official government data.
export const C=[18.5204,73.75];
export const STATUS={good:{l:'Performing Well',c:'#16a34a'},attn:{l:'Needs Attention',c:'#f59e0b'},urgent:{l:'Urgent Response',c:'#dc2626'},new:{l:'Recently Implemented',c:'#2563eb'}};
export const YEARS=[2023,2024,2025,2026];
const P=(dy,dx)=>[+(C[0]+dy*.009).toFixed(5),+(C[1]+dx*.0095).toFixed(5)];
const b=[[C[0]+.017,C[1]-.012],[C[0]+.018,C[1]+.012],[C[0]+.004,C[1]+.0195],[C[0]-.016,C[1]+.014],[C[0]-.018,C[1]-.004],[C[0]-.006,C[1]-.0195]];
export const watershed={name:'Demo Pilot Watershed',boundary:b};
export const subwatersheds=[{id:'SB-01',poly:[b[0],C,b[4],b[5]],color:'#0ea5e9'},{id:'SB-02',poly:[b[0],b[1],b[2],C],color:'#8b5cf6'},{id:'SB-03',poly:[C,b[2],b[3],b[4]],color:'#14b8a6'}];
export const streams=[[P(1.7,-1.3),P(.9,-.7),P(.1,-.2),P(-.8,.2),P(-1.8,.4)],[P(1.5,1.6),P(.8,.9),P(.1,-.2)],[P(-1.5,-1.6),P(-1,-.9),P(-.8,.2)]];
export const zones=[{level:'High',b:[[C[0]-.012,C[1]+.002],[C[0]+.001,C[1]+.014]]},{level:'High',b:[[C[0]+.006,C[1]-.014],[C[0]+.015,C[1]-.004]]},{level:'Medium',b:[[C[0]-.016,C[1]-.014],[C[0]-.006,C[1]-.002]]},{level:'Low',b:[[C[0]+.003,C[1]+.004],[C[0]+.014,C[1]+.014]]}];
export const baseline={runoff:184,yield:126,recharge:31,sediment:42};
export const scenarios={'Check Dam':{runoff:151,yield:139,recharge:46,sediment:29},'Recharge Structure':{runoff:165,yield:130,recharge:52,sediment:38},'Farm Pond':{runoff:160,yield:133,recharge:40,sediment:36},'Land Management':{runoff:170,yield:131,recharge:38,sediment:34}};
const tf={'Check Dam':'Check Dam','Farm Pond':'Farm Pond','Recharge Structure':'Recharge Structure'};
const rows=[['CD-01','Check Dam','good',-1.2,.9,'SB-01'],['CD-02','Check Dam','good',-.6,.2,'SB-01'],['CD-03','Check Dam','good',.2,-.5,'SB-03'],['CD-04','Check Dam','attn',1.1,-.9,'SB-03'],['CD-05','Check Dam','good',-.3,1.2,'SB-01'],['CD-06','Check Dam','new',.3,1,'SB-02'],['CD-07','Check Dam','urgent',.9,.5,'SB-02'],['FP-01','Farm Pond','good',-1.4,-.3,'SB-01'],['FP-02','Farm Pond','attn',1.5,.2,'SB-02'],['FP-03','Farm Pond','urgent',-.2,-1.2,'SB-03'],['RS-01','Recharge Structure','good',.5,.1,'SB-02'],['RS-02','Recharge Structure','attn',-.9,-.9,'SB-03'],['RS-03','Recharge Structure','good',1,1.2,'SB-02'],['RS-04','Recharge Structure','good',-.9,.5,'SB-01'],['RS-05','Recharge Structure','attn',.6,-.4,'SB-03']];
const fr=[0,.19,.69,1];
export const interventions=rows.map(([id,type,status,dx,dy,sb],i)=>{
 const s=id==='CD-07'?.31:.27+(i%4)*.03,e=id==='CD-07'?.47:s+(status==='urgent'?.06:status==='attn'?.09:status==='new'?.03:.16);
 const ws=id==='CD-07'?.08:.06+(i%3)*.01,we=id==='CD-07'?.21:ws+(status==='urgent'?.05:status==='attn'?.08:.13);
 const hi=scenarios[type]||scenarios['Check Dam'];const [lat,lng]=P(dy,dx);
 const daysAgo={'CD-07':74,'FP-03':61,'RS-05':45}[id]||20+i*3;
 return{id,name:`${type} ${id}`,type,latitude:lat,longitude:lng,status,priority:status==='urgent'?'High':status==='attn'?'Medium':'Low',
 implementedDate:status==='new'?'2026-05-10':`${2023+(i%2)}-0${1+(i%8)}-18`,daysAgo,lastInspection:id==='CD-07'?'18 Aug 2026':'12 Aug 2026',
 ai:{detectedType:type,confidence:id==='CD-07'?.92:+(.84+(i%7)*.012).toFixed(2),condition:status==='urgent'||status==='attn'?'Needs Review':'Satisfactory'},
 spatial:{subBasin:sb,nearestStream:id==='CD-07'?42:18+i*7,elevation:id==='CD-07'?814:760+i*6,slope:id==='CD-07'?6.8:+(2.5+(i%6)*.9).toFixed(1)},
 satellite:{ndvi:Object.fromEntries(YEARS.map((y,k)=>[y,+(s+(e-s)*fr[k]).toFixed(2)])),ndwi:Object.fromEntries(YEARS.map((y,k)=>[y,+(ws+(we-ws)*fr[k]).toFixed(2)]))},
 hydrology:{baseline,intervention:hi,confidence:status==='urgent'?'Medium':'Medium-High'},
 photos:[0,1,2].map(k=>({date:['18 Aug 2026','02 Feb 2026','14 Sep 2025'][k],azimuth:124-k*37,conf:k===0?id==='CD-07'?.92:.88:.86-k*.02})),
 concern:{'CD-07':'Possible structural concern','FP-03':'Declining water response','RS-05':'Moderate environmental response'}[id],
 decision:status==='urgent'?'Field verification':status==='attn'?'Increase monitoring':status==='new'?'Baseline monitoring':'Continue monitoring'};});
export const candidates=[[1,1.2,.8,'High',[9,8,9,2,7]],[2,-.5,-1.1,'High',[8,7,7,3,8]],[3,.3,-.4,'Medium',[6,5,6,5,5]],[4,-1.1,.2,'High',[9,8,9,2,7]],[5,1.4,-.2,'Medium',[5,6,5,4,6]],[6,-.8,1.3,'Low',[3,3,4,7,3]]].map(([n,dy,dx,priority,f])=>({id:`Candidate Site #0${n}`,latitude:P(dy,dx)[0],longitude:P(dy,dx)[1],priority,factors:['Runoff Potential','Erosion Risk','Recharge Opportunity','Existing Intervention Density','Vegetation Stress'].map((k,i)=>({k,v:f[i]})),reasons:priority==='High'?['High runoff potential','High erosion risk','Strong drainage connectivity','Low existing intervention density','Recharge opportunity','Vegetation stress']:['Moderate runoff potential','Moderate erosion risk','Some existing interventions nearby']}));
