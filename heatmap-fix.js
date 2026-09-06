(function(){
  function metricList(){
    return (typeof APP!=='undefined' && APP.metrics) ? APP.metrics : [
      'Attendance','Students Assignment to Students Mentor (Wali)','Session by Qualified Teacher (SQT)',
      'Completion TO UTBK','Completion TO TKA Reguler 1','Average Drill Soal','Konsultasi 1',
      'Partisipasi Tes Diagnostik','Motivatalks','Pengisian Growth Journal Onboarding Mitra','AUVI TV',
      'Penjadwalan','Pengerjaan Kuis dan Post Test di kelas','Drill Soal 6-11','Classroom Observation',
      'Content Low Rating (Monitoring)','Skor TKA'
    ];
  }
  const escH=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const priority={
    'Attendance':'P0','Students Assignment to Students Mentor (Wali)':'P0','Session by Qualified Teacher (SQT)':'P0',
    'Completion TO UTBK':'P0','Completion TO TKA Reguler 1':'P0','Average Drill Soal':'P0','Konsultasi 1':'P0',
    'Partisipasi Tes Diagnostik':'P0','Motivatalks':'P0','Pengisian Growth Journal Onboarding Mitra':'P1',
    'AUVI TV':'P2','Penjadwalan':'P1','Pengerjaan Kuis dan Post Test di kelas':'P2','Drill Soal 6-11':'P2',
    'Classroom Observation':'P0','Content Low Rating (Monitoring)':'Monitor','Skor TKA':'Monitor'
  };
  function allowed(m){return state.priority==='ALL'||priority[m]===state.priority;}
  function hs(q){
    if(q?.status==='Achieved')return ['g','✓','Achieved'];
    if(q?.status==='Not Achieved')return ['r','!','Not Achieved'];
    if(q?.status==='At Risk')return ['y','~','At Risk'];
    const raw=Array.isArray(q?.raw)?q.raw.length>0:q?.raw!=null;
    if(q?.value!=null||raw)return ['i','◐','Data Available / In Progress'];
    return ['x','·','No Data'];
  }
  window.renderHeat=function(){
    const head=document.getElementById('heatHead'), body=document.getElementById('heatBody');
    if(!head||!body||typeof APP==='undefined'||!APP?.data)return;
    const metrics=metricList().filter(allowed);
    const period=state.period || APP.periods?.at(-1);
    const rows=APP.data.filter(r=>(!period||r.period===period)&&(state.region==='ALL'||r.region===state.region)&&(state.branch==='ALL'||r.branch===state.branch));
    head.innerHTML='<tr><th>Cabang</th>'+metrics.map(m=>`<th title="${escH(m)}">${escH(m)}</th>`).join('')+'</tr>';
    body.innerHTML=rows.map(r=>{
      const cells=metrics.map(m=>{const q=r.metrics?.[m]||{};const h=hs(q);return `<td><span class="dot ${h[0]}" title="${escH(m)}: ${h[2]}" onclick="openMetric('${escH(r.branch)}','${escH(m)}')">${h[1]}</span></td>`}).join('');
      return `<tr><td><b>${escH(r.branch)}</b></td>${cells}</tr>`;
    }).join('');
    const card=document.getElementById('heatmap');
    if(card){
      let meta=document.getElementById('heatMeta');
      if(!meta){meta=document.createElement('div');meta.id='heatMeta';meta.className='heat-meta';card.querySelector('.section-head')?.appendChild(meta)}
      meta.textContent=`${metrics.length} metric • ${rows.length} cabang • ${period||'—'}`;
    }
  };

  async function ensureData(){
    try{
      if(typeof APP!=='undefined' && APP?.data?.length && APP?.periods?.length) return true;
      if(typeof decodeBundle!=='function') throw new Error('decodeBundle tidak ditemukan');
      const bundle=await decodeBundle();
      // IMPORTANT: index.html declares APP/MASTER/TARGET with let.
      // Assign those lexical globals directly; window.APP is a different binding.
      APP=bundle.app;
      MASTER=bundle.master;
      TARGET=bundle.target;
      if(!state.period && APP.periods?.length) state.period=APP.periods[APP.periods.length-1];
      return true;
    }catch(e){
      console.error('OKR data bootstrap failed:',e);
      return false;
    }
  }

  window.heatmapRepairInit=async function(){
    const ok=await ensureData();
    if(!ok)return;
    try{ if(typeof renderFilters==='function') renderFilters(); }catch(e){console.error('renderFilters:',e)}
    try{ if(typeof renderAll==='function') renderAll(); }catch(e){console.error('renderAll:',e)}
    try{ renderHeat(); }catch(e){ console.error('Heatmap repair:',e); }
    try{ if(typeof populateOkrFilters==='function') populateOkrFilters(); }catch(e){}
    try{ if(typeof renderOkrMaster==='function') renderOkrMaster(); }catch(e){}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(window.heatmapRepairInit,0));
  else setTimeout(window.heatmapRepairInit,0);
})();
