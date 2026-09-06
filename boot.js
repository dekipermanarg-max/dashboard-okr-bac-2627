(function(){
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const pct=v=>v==null?'—':(Number(v)*100).toFixed(1)+'%';
  const fmt=v=>{if(v==null)return'—';if(typeof v!=='number')return esc(v);if(v>=0&&v<=1)return pct(v);return Number.isInteger(v)?v.toLocaleString('id-ID'):v.toFixed(2)};
  const priority={
    'Attendance':'P0','Students Assignment to Students Mentor (Wali)':'P0','Session by Qualified Teacher (SQT)':'P0',
    'Completion TO UTBK':'P0','Completion TO TKA Reguler 1':'P0','Average Drill Soal':'P0','Konsultasi 1':'P0',
    'Partisipasi Tes Diagnostik':'P0','Motivatalks':'P0','Pengisian Growth Journal Onboarding Mitra':'P1',
    'AUVI TV':'P2','Penjadwalan':'P1','Pengerjaan Kuis dan Post Test di kelas':'P2','Drill Soal 6-11':'P2',
    'Classroom Observation':'P0','Content Low Rating (Monitoring)':'Monitor','Skor TKA':'Monitor'
  };
  const monthNames=['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'];
  let APP=null,MASTER=[],TARGET={},state={period:'',region:'ALL',branch:'ALL',priority:'ALL'};
  const el=id=>document.getElementById(id);
  const rows=()=>APP.data.filter(r=>(!state.period||r.period===state.period)&&(state.region==='ALL'||r.region===state.region)&&(state.branch==='ALL'||r.branch===state.branch));
  const rowFor=(b,p=state.period)=>APP.data.find(r=>r.branch===b&&r.period===p);
  const metricPriority=m=>priority[m]||'';
  const allowed=m=>state.priority==='ALL'||metricPriority(m)===state.priority;
  const heatState=q=>{if(q?.status==='Achieved')return['g','✓','Achieved'];if(q?.status==='Not Achieved')return['r','!','Not Achieved'];if(q?.status==='At Risk')return['y','~','At Risk'];const raw=Array.isArray(q?.raw)?q.raw.length>0:q?.raw!=null;if(q?.value!=null||raw)return['i','◐','Data Available / In Progress'];return['x','·','No Data']};
  function renderFilters(){
    el('period').innerHTML=APP.periods.map(p=>`<option value="${esc(p)}" ${p===state.period?'selected':''}>${esc(p)}</option>`).join('');
    const regs=[...new Set(APP.branches.map(b=>b.region).filter(Boolean))];
    el('region').innerHTML='<option value="ALL">Semua Regional</option>'+regs.map(r=>`<option value="${esc(r)}" ${r===state.region?'selected':''}>${esc(r.replace(/^Regional - /,''))}</option>`).join('');
    el('branch').innerHTML='<option value="ALL">Semua Cabang</option>'+APP.branches.filter(b=>state.region==='ALL'||b.region===state.region).map(b=>`<option value="${esc(b.name)}" ${b.name===state.branch?'selected':''}>${esc(b.name)}</option>`).join('');
    el('priority').value=state.priority;
  }
  function renderKpis(){
    const r=rows(), vals=r.map(x=>x.achievement).filter(v=>typeof v==='number'), cur=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
    const pi=APP.periods.indexOf(state.period), prev=pi>0?APP.data.filter(x=>x.period===APP.periods[pi-1]&&(state.region==='ALL'||x.region===state.region)&&(state.branch==='ALL'||x.branch===state.branch)).map(x=>x.achievement).filter(v=>typeof v==='number'):[], pv=prev.length?prev.reduce((a,b)=>a+b,0)/prev.length:null;
    const d=cur!=null&&pv!=null?(cur-pv)*100:null;
    const hi=r.filter(x=>x.status==='High Performance Branch').length, me=r.filter(x=>x.status==='Medium Performance Branch').length, lo=r.filter(x=>x.status==='Low Performance Branch').length;
    el('kpis').innerHTML=[["OKR Achievement",pct(cur),d==null?'':`${d>=0?'↑':'↓'} ${Math.abs(d).toFixed(1)} pp vs prev`,d>=0?'up':'down'],['High Performance',`${hi}/${r.length}`,'cabang','up'],['Medium / At Risk',me,'perlu dipantau','flat'],['Low Performance',lo,'perlu follow-up','down']].map(x=>`<div class="card"><div class="kpi-label">${x[0]}</div><div class="kpi">${x[1]}</div><div class="delta ${x[3]}">${x[2]}</div></div>`).join('');
  }
  function renderTrend(){
    const vals=APP.periods.map(p=>{const a=APP.data.filter(x=>x.period===p&&(state.region==='ALL'||x.region===state.region)&&(state.branch==='ALL'||x.branch===state.branch)).map(x=>x.achievement).filter(v=>typeof v==='number');return a.length?a.reduce((s,v)=>s+v,0)/a.length:0});
    const max=Math.max(1,...vals);
    el('trend').innerHTML=APP.periods.map((p,i)=>`<div class="barcol"><div class="barval">${pct(vals[i])}</div><div class="bar" style="height:${Math.max(4,vals[i]/max*175)}px"></div><div class="barlabel">${esc(p.replace(' 2026',''))}</div></div>`).join('');
  }
  function pill(s){const c=s==='Achieved'?'green':s==='Not Achieved'?'red':s==='At Risk'?'yellow':'gray';return `<span class="pill ${c}">${esc(s||'No Data')}</span>`}
  function renderSnapshot(){const r=rows(),c={};r.forEach(x=>c[x.status||'No Data']=(c[x.status||'No Data']||0)+1);el('snapshotPeriod').textContent=state.period;el('snapshot').innerHTML=Object.entries(c).map(([k,v])=>`<div class="snapshot-row">${pill(k)}<b>${v}</b></div>`).join('')||'<div class="empty">Tidak ada data untuk filter ini.</div>'}
  function renderBranchTable(){
    let rs=APP.branches.filter(b=>state.region==='ALL'||b.region===state.region).map(b=>rowFor(b.name)).filter(Boolean).filter(r=>state.branch==='ALL'||r.branch===state.branch).sort((a,b)=>(b.achievement??-1)-(a.achievement??-1));
    const pi=APP.periods.indexOf(state.period),prevP=pi>0?APP.periods[pi-1]:null;
    el('branchTable').innerHTML=rs.map((r,i)=>{const prev=prevP?rowFor(r.branch,prevP):null,d=r.achievement!=null&&prev?.achievement!=null?(r.achievement-prev.achievement)*100:null;return`<tr class="click" onclick="openBranch('${esc(r.branch).replace(/'/g,"\\'")}')"><td>${i+1}</td><td><b>${esc(r.branch)}</b></td><td>${esc(String(r.region||'').replace('Regional - ',''))}</td><td><b>${pct(r.achievement)}</b></td><td class="${d>0?'up':d<0?'down':'flat'}">${d==null?'—':(d>=0?'+':'')+d.toFixed(1)+' pp'}</td><td>${pill(r.status)}</td></tr>`}).join('')||'<tr><td colspan="6" class="empty">Tidak ada data.</td></tr>';
  }
  function renderHeat(){
    const vis=(APP.metrics||[]).filter(allowed), rs=APP.data.filter(r=>r.period===state.period&&(state.region==='ALL'||r.region===state.region)&&(state.branch==='ALL'||r.branch===state.branch));
    el('heatHead').innerHTML='<tr><th>Cabang</th>'+vis.map(m=>`<th title="${esc(m)}">${esc(m)}</th>`).join('')+'</tr>';
    el('heatBody').innerHTML=rs.map(r=>`<tr><td><b>${esc(r.branch)}</b></td>${vis.map(m=>{const q=r.metrics?.[m]||{},h=heatState(q);return`<td><span class="dot ${h[0]}" title="${esc(m)}: ${h[2]}" onclick="openMetric('${esc(r.branch).replace(/'/g,"\\'")}','${esc(m).replace(/'/g,"\\'")}')">${h[1]}</span></td>`}).join('')}</tr>`).join('')||'<tr><td colspan="99" class="empty">Tidak ada data untuk filter ini.</td></tr>';
  }
  function renderMaster(){
    const idx=Math.max(0,APP.periods.length-1);el('masterCount').textContent=`${MASTER.length} OKR`;
    el('masterGrid').innerHTML=MASTER.map((x,i)=>`<div class="master-card" onclick="openMaster(${i})"><div class="master-top"><div class="num">${i+1}</div><div><div class="eyebrow">${esc(x.type)} • ${esc(x.priority)}</div><div class="master-title">${esc(x.metric)}</div></div><div class="meta">PIC: ${esc(x.pic||'—')}<br>Kelas: ${esc(x.kelas||'—')}</div></div><div class="targets">${(x.months||[]).slice(0,12).map((v,j)=>`<div class="target ${j===idx?'current':''}"><span>${monthNames[j]}</span><b>${esc(v==null?'—':String(v))}</b></div>`).join('')}</div></div>`).join('');
  }
  function renderAll(){renderFilters();renderKpis();renderTrend();renderSnapshot();renderBranchTable();renderHeat();renderMaster()}
  window.showView=function(v){el('overview').style.display=v==='overview'?'block':'none';el('heatmap').style.display=v==='heatmap'?'block':'none';el('master').style.display=v==='master'?'block':'none';document.querySelectorAll('.nav').forEach(n=>n.classList.remove('active'));const n=el(v==='overview'?'navOverview':v==='heatmap'?'navHeat':'navMaster');if(n)n.classList.add('active');renderAll()};
  window.closeModal=function(){el('modal').classList.remove('show')};
  window.openMetric=function(branchName,m){const r=rowFor(branchName),q=r?.metrics?.[m]||{},target=TARGET[m]??null,gap=target!=null&&q.value!=null?q.value-target:null,history=APP.data.filter(x=>x.branch===branchName);el('modalContent').innerHTML=`<div class="eyebrow">${esc(r?.region||'')}</div><h2 style="margin:6px 0">${esc(m)}</h2><div class="sub">${esc(branchName)} • ${esc(state.period)}</div><hr style="border:0;border-top:1px solid var(--line);margin:16px 0"><div class="grid4" style="grid-template-columns:repeat(3,1fr)"><div class="card"><div class="kpi-label">Target</div><div class="kpi" style="font-size:18px">${fmt(target)}</div></div><div class="card"><div class="kpi-label">Actual</div><div class="kpi" style="font-size:18px">${fmt(q.value)}</div></div><div class="card"><div class="kpi-label">Gap</div><div class="kpi" style="font-size:18px">${gap==null?'—':(gap>=0?'+':'')+fmt(gap)}</div></div></div><p><b>Status:</b> ${pill(q.status)}</p><p><b>Priority:</b> ${esc(metricPriority(m)||q.priority||'—')} &nbsp; <b>PIC:</b> ${esc(q.pic||'—')}</p><h3>Riwayat</h3><div class="tablewrap"><table class="table"><thead><tr><th>Periode</th><th>Actual</th><th>Status</th></tr></thead><tbody>${history.map(x=>{const z=x.metrics?.[m]||{};return`<tr><td>${esc(x.period)}</td><td>${fmt(z.value)}</td><td>${pill(z.status)}</td></tr>`}).join('')}</tbody></table></div>`;el('modal').classList.add('show')};
  window.openBranch=function(b){const r=rowFor(b),hist=APP.data.filter(x=>x.branch===b);el('modalContent').innerHTML=`<div class="eyebrow">${esc(r?.region||'')}</div><h2 style="margin:6px 0">${esc(b)}</h2><div class="sub">Performance drill-down • ${esc(state.period)}</div><div class="grid4" style="margin-top:15px"><div class="card"><div class="kpi-label">Current</div><div class="kpi" style="font-size:18px">${pct(r?.achievement)}</div></div><div class="card"><div class="kpi-label">Status</div><div style="margin-top:9px">${pill(r?.status)}</div></div><div class="card"><div class="kpi-label">Metrics</div><div class="kpi" style="font-size:18px">${APP.metrics.length}</div></div><div class="card"><div class="kpi-label">Periods</div><div class="kpi" style="font-size:18px">${hist.length}</div></div></div><h3>Metric detail</h3><div class="tablewrap"><table class="table"><thead><tr><th>Metric</th><th>Priority</th><th>Actual</th><th>Status</th></tr></thead><tbody>${APP.metrics.map(m=>{const q=r?.metrics?.[m]||{};return`<tr class="click" onclick="openMetric('${esc(b).replace(/'/g,"\\'")}','${esc(m).replace(/'/g,"\\'")}')"><td>${esc(m)}</td><td>${esc(metricPriority(m)||q.priority||'—')}</td><td>${fmt(q.value)}</td><td>${pill(q.status)}</td></tr>`}).join('')}</tbody></table></div>`;el('modal').classList.add('show')};
  window.openMaster=function(i){const x=MASTER[i];el('modalContent').innerHTML=`<div class="eyebrow">${esc(x.type)} • ${esc(x.priority)}</div><h2 style="margin:6px 0">${esc(x.metric)}</h2><div class="sub">PIC: ${esc(x.pic||'—')} • Kelas: ${esc(x.kelas||'—')}</div><h3>Target bulanan</h3><div class="tablewrap"><table class="table"><thead><tr>${monthNames.map(m=>`<th>${m}</th>`).join('')}</tr></thead><tbody><tr>${(x.months||[]).slice(0,12).map(v=>`<td style="white-space:pre-wrap;vertical-align:top;min-width:100px">${esc(v==null?'—':String(v))}</td>`).join('')}</tr></tbody></table></div>`;el('modal').classList.add('show')};
  function bind(){
    el('period').addEventListener('change',e=>{state.period=e.target.value;renderAll()});
    el('region').addEventListener('change',e=>{state.region=e.target.value;state.branch='ALL';renderAll()});
    el('branch').addEventListener('change',e=>{state.branch=e.target.value;renderAll()});
    el('priority').addEventListener('change',e=>{state.priority=e.target.value;renderAll()});
    el('modal').addEventListener('click',e=>{if(e.target===el('modal'))closeModal()});
  }
  function boot(data){
    APP=data.app;MASTER=data.master||[];TARGET=data.target||{};
    if(!APP?.data?.length){console.error('OKR bootstrap: APP data kosong');return}
    state.period=APP.periods?.[APP.periods.length-1]||'';
    bind();renderAll();
  }
  const wait=()=>{if(window.__OKR_DATA)boot(window.__OKR_DATA);else setTimeout(wait,50)};
  wait();
})();
