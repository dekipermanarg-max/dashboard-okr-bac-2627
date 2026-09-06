(async function(){
  try{
    const src='https://raw.githubusercontent.com/dekipermanarg-max/dashboard-okr-bac-2627/ce4432333b2a00eb715c96a7a7e812c2ba96f7c7/data.js?raw=1';
    const text=await (await fetch(src,{cache:'no-store'})).text();
    const getBundle=new Function(text+'\nreturn decodeBundle;');
    const decode= getBundle();
    window.__OKR_DATA=await decode();
  }catch(e){
    console.error('OKR data loader failed',e);
    window.__OKR_DATA={app:{data:[],periods:[],branches:[],metrics:[]},master:[],target:{}};
  }
  const s=document.createElement('script');
  s.src='boot.js?v=4625f887';
  document.head.appendChild(s);
})();
