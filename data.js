(function(){
  const boot=()=>{
    const s=document.createElement('script');
    s.src='boot.js?v=4625f887';
    document.head.appendChild(s);
  };
  const s=document.createElement('script');
  s.src='https://raw.githubusercontent.com/dekipermanarg-max/dashboard-okr-bac-2627/ce4432333b2a00eb715c96a7a7e812c2ba96f7c7/data.js?direct=1';
  s.onload=async()=>{
    try{
      if(typeof decodeBundle!=='function') throw new Error('decodeBundle tidak tersedia');
      window.__OKR_DATA=await decodeBundle();
    }catch(e){
      console.error('OKR data decode failed',e);
      window.__OKR_DATA={app:{data:[],periods:[],branches:[],metrics:[]},master:[],target:{}};
    }
    boot();
  };
  s.onerror=()=>{console.error('OKR source script failed');window.__OKR_DATA={app:{data:[],periods:[],branches:[],metrics:[]},master:[],target:{}};boot()};
  document.head.appendChild(s);
})();
