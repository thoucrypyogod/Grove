import{createClient}from'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SB_URL='https://gqknwhtgiajxwterqukd.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxa253aHRnaWFqeHd0ZXJxdWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMjk3NzMsImV4cCI6MjA5MTYwNTc3M30.L6ixCugKfh3a_GkQNqid6Ii_46T66gaA9JUblGWIRdU';
const sb=createClient(SB_URL,SB_KEY);

let U=null,P=null,IC=0,allUsers=[];

const toast=(msg,type='ok')=>{const t=document.getElementById('toast');t.textContent=msg;t.className=`toast ${type} show`;setTimeout(()=>t.classList.remove('show'),3000);};
window.showToast=toast;
const fmt=d=>{if(!d)return'—';return new Date(d).toLocaleString('en',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});};
const slabel=s=>({pending:'Pending',assigned:'Assigned',accepted:'Accepted',in_progress:'In Progress',delivered:'Delivered',cancelled:'Cancelled'}[s]||s);
const sbadge=s=>`<span class="sbadge s-${s}">${slabel(s)}</span>`;
const spct=s=>({pending:0,assigned:25,accepted:50,in_progress:75,delivered:100,cancelled:0}[s]||0);
window.closeMod=id=>document.getElementById(id).classList.remove('open');
document.querySelectorAll('.moverlay').forEach(el=>el.addEventListener('click',e=>{if(e.target===el)el.classList.remove('open');}));

window.atab=t=>{
  document.getElementById('at1').classList.toggle('active',t==='login');
  document.getElementById('at2').classList.toggle('active',t==='register');
  document.getElementById('loginPanel').style.display=t==='login'?'block':'none';
  document.getElementById('regPanel').style.display=t==='register'?'block':'none';
};

window.showForgot=()=>{
  document.getElementById('loginPanel').style.display='none';
  document.getElementById('forgotPanel').style.display='block';
};

window.showLogin=()=>{
  document.getElementById('forgotPanel').style.display='none';
  document.getElementById('loginPanel').style.display='block';
};

window.sendReset=async()=>{
  const email=document.getElementById('femail').value.trim();
  const msg=document.getElementById('fmsg');
  if(!email){msg.className='amsg err';msg.textContent='Enter your email address.';return;}
  msg.className='amsg';msg.textContent='Sending...';
  try{
    const{error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:'https://thoucrypyogod.github.io/Grove/'});
    if(error)throw error;
    msg.className='amsg ok';msg.textContent='Reset link sent! Check your email.';
  }catch(err){
    msg.className='amsg err';msg.textContent=err.message;
  }
};

window.resendEmail=async()=>{
  const email=document.getElementById('remail').value.trim();
  const msg=document.getElementById('rmsg');
  try{
    const{error}=await sb.auth.resend({type:'signup',email:email});
    if(error)throw error;
    msg.textContent='Confirmation email resent! Check your inbox.';
  }catch(err){
    msg.className='amsg err';msg.textContent=err.message;
  }
};

document.getElementById('regBtn').addEventListener('click',async()=>{
  const name=document.getElementById('rname').value.trim(),email=document.getElementById('remail').value.trim(),phone=document.getElementById('rphone').value.trim(),pass=document.getElementById('rpass').value,role=document.getElementById('rrole').value,msg=document.getElementById('rmsg');
  if(!name||!email||!pass){msg.className='amsg err';msg.textContent='Fill in all required fields.';return;}
  if(pass.length<8){msg.className='amsg err';msg.textContent='Password must be at least 8 characters.';return;}
  msg.className='amsg';msg.textContent='Creating account...';
  const{data,error}=await sb.auth.signUp({email,password:pass});
  if(error){msg.className='amsg err';msg.textContent=error.message;return;}
  if(data.user){await sb.from('profiles').insert({id:data.user.id,name,email,phone:phone||null,role});}
  msg.className='amsg ok';msg.textContent='Account created! Verify your email then sign in.';
  document.getElementById('resendBtn').style.display='block';
});

document.getElementById('loginBtn').addEventListener('click',async()=>{
  const email=document.getElementById('lemail').value.trim(),pass=document.getElementById('lpass').value,msg=document.getElementById('lmsg');
  if(!email||!pass){msg.className='amsg err';msg.textContent='Enter your email and password.';return;}
  msg.className='amsg';msg.textContent='Signing in...';
  const{data,error}=await sb.auth.signInWithPassword({email,password:pass});
  if(error){msg.className='amsg err';msg.textContent=error.message;return;}
  U=data.user;await loadProfile();
});

async function loadProfile(){
  const{data:p}=await sb.from('profiles').select('*').eq('id',U.id).single();
  if(!p){document.getElementById('lmsg').className='amsg err';document.getElementById('lmsg').textContent='Profile not found.';return;}
  P=p;enterApp();
}

function enterApp(){
  document.getElementById('authScreen').style.display='none';
  document.getElementById('authScreen').classList.remove('active');
  document.getElementById('appScreen').classList.add('active');
  document.getElementById('huser').textContent=P.name;
  const rb=document.getElementById('rbadge');
  rb.textContent=P.role.charAt(0).toUpperCase()+P.role.slice(1);
  rb.className=`rbadge ${P.role}`;
  setupNav();
}

window.doLogout=async()=>{
  await sb.auth.signOut();U=null;P=null;
  document.getElementById('appScreen').classList.remove('active');
  document.getElementById('authScreen').style.display='flex';
  document.getElementById('authScreen').classList.add('active');
  document.getElementById('lmsg').textContent='';
  document.getElementById('lemail').value='';
  document.getElementById('lpass').value='';
};

const NAVS={
  customer:[
    {id:'home',       icon:'🏠',label:'Home',   view:'home',      load:loadCHome},
    {id:'new-order',  icon:'➕',label:'Order',  view:'new-order', load:initOrder},
    {id:'history',    icon:'📋',label:'History',view:'history',   load:loadHist},
    {id:'cprofile',   icon:'👤',label:'Profile',view:'cprofile',  load:loadCProfile},
  ],
  rider:[
    {id:'rassigned',icon:'📦',label:'Orders', view:'rassigned',load:loadRAssigned},
    {id:'ractive',  icon:'🚴',label:'Active', view:'ractive',  load:loadRActive},
    {id:'rhistory', icon:'✅',label:'History',view:'rhistory', load:loadRHist},
    {id:'rprofile', icon:'👤',label:'Profile',view:'rprofile', load:loadRProfile},
  ],
  admin:[
    {id:'adash',   icon:'📊',label:'Dashboard',view:'adash',  load:loadADash},
    {id:'aorders', icon:'📋',label:'Orders',   view:'aorders',load:loadAOrders},
    {id:'ausers',  icon:'👥',label:'Users',    view:'ausers', load:loadAUsers},
    {id:'ariders', icon:'🚴',label:'Riders',   view:'ariders',load:loadARiders},
  ],
};

let navCfg=[],activeView='';

function setupNav(){
  navCfg=NAVS[P.role]||NAVS.customer;
  document.getElementById('bnav').innerHTML=navCfg.map(n=>`<button class="nbtn" id="nb-${n.id}" onclick="switchView('${n.view}')"><span class="ni">${n.icon}</span>${n.label}</button>`).join('');
  switchView(navCfg[0].view);
}

window.switchView=viewId=>{
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById(`view-${viewId}`)?.classList.add('active');
  navCfg.forEach(n=>{const b=document.getElementById(`nb-${n.id}`);if(b)b.classList.toggle('active',n.view===viewId);});
  const ni=navCfg.find(n=>n.view===viewId);
  if(ni?.load)ni.load();
  activeView=viewId;
  document.getElementById('pcontent').scrollTop=0;
};
async function loadCHome(){
  const{data:orders}=await sb.from('orders').select('*,order_items(*)').eq('customer_id',U.id).order('created_at',{ascending:false});
  const name=P.name.split(' ')[0];
  document.getElementById('chello').textContent=`Hi ${name}! 👋`;
  if(orders){
    document.getElementById('stTotal').textContent=orders.length;
    document.getElementById('stDelivered').textContent=orders.filter(o=>o.status==='delivered').length;
    const r=orders.slice(0,3);
    document.getElementById('recentOrders').innerHTML=r.length?r.map(o=>renderOrder(o,'customer')).join(''):'<div class="empty"><div class="empty-ic">📦</div><div class="empty-tx">No orders yet. Place your first order!</div></div>';
  }
}

function initOrder(){
  document.getElementById('oaddr').value='';
  document.getElementById('onote').value='';
  document.getElementById('itemsList').innerHTML='';
  IC=0;addItem();addItem();
}

window.addItem=()=>{
  IC++;
  const d=document.createElement('div');
  d.className='irow';d.id=`ir-${IC}`;
  d.innerHTML=`<input class="iinput" type="text" placeholder="Item name (e.g. Rice 5kg)" id="in-${IC}"><input class="qinput" type="text" placeholder="Qty" id="iq-${IC}" value="1"><button class="rmbtn" onclick="rmItem(${IC})">×</button>`;
  document.getElementById('itemsList').appendChild(d);
  document.getElementById('iHint').style.display='none';
};

window.rmItem=id=>{document.getElementById(`ir-${id}`)?.remove();if(!document.getElementById('itemsList').children.length)document.getElementById('iHint').style.display='block';};

window.submitOrder=async()=>{
  const addr=document.getElementById('oaddr').value.trim(),note=document.getElementById('onote').value.trim();
  if(!addr){toast('Please enter a delivery address.','err');return;}
  const items=[];
  document.querySelectorAll('[id^="in-"]').forEach(el=>{const id=el.id.replace('in-',''),n=el.value.trim(),q=document.getElementById(`iq-${id}`)?.value.trim()||'1';if(n)items.push({item_name:n,quantity:q});});
  if(!items.length){toast('Add at least one item.','err');return;}
  const btn=document.getElementById('submitBtn');
  btn.disabled=true;btn.textContent='Submitting...';
  const{data:order,error}=await sb.from('orders').insert({customer_id:U.id,address:addr,note:note||null,status:'pending'}).select().single();
  if(error){toast('Failed to submit order.','err');btn.disabled=false;btn.textContent='Submit Order';return;}
  await sb.from('order_items').insert(items.map(i=>({...i,order_id:order.id})));
  toast('Order placed successfully! 🎉','ok');
  btn.disabled=false;btn.textContent='Submit Order';
  switchView('history');
};

async function loadHist(){
  const{data:orders}=await sb.from('orders').select('*,order_items(*)').eq('customer_id',U.id).order('created_at',{ascending:false});
  document.getElementById('histList').innerHTML=orders?.length?orders.map(o=>renderOrder(o,'customer')).join(''):'<div class="empty"><div class="empty-ic">📋</div><div class="empty-tx">No orders yet</div></div>';
}

function loadCProfile(){
  document.getElementById('cpName').textContent=P.name;
  document.getElementById('cpEmail').textContent=P.email;
  document.getElementById('cpPhone').textContent=P.phone||'Not provided';
  document.getElementById('cpSince').textContent=fmt(P.created_at).split(',')[0];
}

async function loadRAssigned(){
  const{data:orders}=await sb.from('orders').select('*,order_items(*)').eq('rider_id',U.id).eq('status','assigned').order('created_at',{ascending:false});
  document.getElementById('rassignedList').innerHTML=orders?.length?orders.map(o=>renderOrder(o,'rider')).join(''):'<div class="empty"><div class="empty-ic">📦</div><div class="empty-tx">No orders assigned yet</div></div>';
}

async function loadRActive(){
  const{data:orders}=await sb.from('orders').select('*,order_items(*)').eq('rider_id',U.id).in('status',['accepted','in_progress']).order('created_at',{ascending:false});
  const wrap=document.getElementById('ractiveOrder');
  if(!orders?.length){wrap.innerHTML='<div class="empty"><div class="empty-ic">🚴</div><div class="empty-tx">No active delivery right now</div></div>';return;}
  const o=orders[0],pct=spct(o.status);
  wrap.innerHTML=`<div class="ocard s-${o.status}">
    <div class="oheader"><div><div class="fw7">Active Delivery</div><div class="oid">#${o.id.slice(-8).toUpperCase()}</div></div>${sbadge(o.status)}</div>
    <div class="pwrap">
      <div class="psteps">
        <div class="pstep ${pct>=25?'done':'inact'}">Assigned</div>
        <div class="pstep ${o.status==='accepted'?'act':pct>=50?'done':'inact'}">Accepted</div>
        <div class="pstep ${o.status==='in_progress'?'act':pct>=75?'done':'inact'}">In Progress</div>
        <div class="pstep ${o.status==='delivered'?'done':'inact'}">Delivered</div>
      </div>
      <div class="pbar"><div class="pfill" style="width:${pct}%"></div></div>
    </div>
    <div class="oaddr">📍 ${o.address}</div>
    <div class="oitems"><div class="fw6 txsm" style="margin-bottom:5px">Items to buy:</div>${(o.order_items||[]).map(i=>`<div class="oirow"><span class="oidot">•</span>${i.item_name}${i.quantity&&i.quantity!=='1'?` — ${i.quantity}`:''}</div>`).join('')}</div>
    ${o.note?`<div class="onote">📝 ${o.note}</div>`:''}
    <div style="display:flex;gap:8px;margin-top:11px">
      ${o.status==='accepted'?`<button class="btn btn-orange" style="flex:1" onclick="updStatus('${o.id}','in_progress')">🛒 Mark In Progress</button>`:''}
      ${o.status==='in_progress'?`<button class="btn btn-green" style="flex:1" onclick="updStatus('${o.id}','delivered')">✅ Mark Delivered</button>`:''}
    </div>
  </div>`;
}

async function loadRHist(){
  const{data:orders}=await sb.from('orders').select('*,order_items(*)').eq('rider_id',U.id).in('status',['delivered','cancelled']).order('created_at',{ascending:false});
  document.getElementById('rhistList').innerHTML=orders?.length?orders.map(o=>renderOrder(o,'rider')).join(''):'<div class="empty"><div class="empty-ic">✅</div><div class="empty-tx">No completed deliveries yet</div></div>';
}

function loadRProfile(){
  document.getElementById('rpName').textContent=P.name;
  document.getElementById('rpEmail').textContent=P.email;
  document.getElementById('rpPhone').textContent=P.phone||'Not provided';
  document.getElementById('avail').value=P.availability||'available';
}

window.updateAvail=async()=>{
  const v=document.getElementById('avail').value;
  await sb.from('profiles').update({availability:v}).eq('id',U.id);
  P.availability=v;toast('Availability updated!','ok');
};

window.acceptOrder=async id=>{
  await sb.from('orders').update({status:'accepted'}).eq('id',id);
  await sb.from('profiles').update({availability:'busy'}).eq('id',U.id);
  P.availability='busy';toast('Order accepted!','ok');
  loadRAssigned();
};

window.rejectOrder=async id=>{
  await sb.from('orders').update({rider_id:null,status:'pending'}).eq('id',id);
  toast('Order rejected — returned to pending.','ok');loadRAssigned();
};

window.updStatus=async(id,status)=>{
  await sb.from('orders').update({status}).eq('id',id);
  toast(`Marked as ${slabel(status)}`,'ok');
  if(status==='delivered'){await sb.from('profiles').update({availability:'available'}).eq('id',U.id);P.availability='available';}
  if(activeView==='ractive')loadRActive();
  if(activeView==='rassigned')loadRAssigned();
};

async function loadADash(){
  const{data:orders}=await sb.from('orders').select('status');
  const{data:riders}=await sb.from('profiles').select('availability').eq('role','rider');
  if(orders){
    document.getElementById('aTot').textContent=orders.length;
    document.getElementById('aPend').textContent=orders.filter(o=>o.status==='pending').length;
    document.getElementById('aDel').textContent=orders.filter(o=>o.status==='delivered').length;
  }
  if(riders)document.getElementById('aRid').textContent=riders.filter(r=>r.availability==='available').length;
  const{data:recent}=await sb.from('orders').select('*,order_items(*),customer:customer_id(name),rider:rider_id(name)').order('created_at',{ascending:false}).limit(5);
  document.getElementById('aRecentOrders').innerHTML=recent?.length?recent.map(o=>renderOrder(o,'admin')).join(''):'<div class="empty"><div class="empty-ic">📋</div><div class="empty-tx">No orders yet</div></div>';
}

window.loadAOrders=async()=>{
  const sf=document.getElementById('orderFilter')?.value;
  let q=sb.from('orders').select('*,order_items(*),customer:customer_id(name,phone),rider:rider_id(name)').order('created_at',{ascending:false});
  if(sf)q=q.eq('status',sf);
  const{data:orders}=await q;
  document.getElementById('aOrdersList').innerHTML=orders?.length?orders.map(o=>renderOrder(o,'admin')).join(''):'<div class="empty"><div class="empty-ic">📋</div><div class="empty-tx">No orders found</div></div>';
};
    async function loadAUsers(){
  const{data:users}=await sb.from('profiles').select('*').eq('role','customer').order('created_at',{ascending:false});
  allUsers=users||[];renderUsers(allUsers);
}

function renderUsers(users){
  document.getElementById('aUsersList').innerHTML=users.length?users.map(u=>`<div class="ocard s-delivered"><div class="fb"><div><div class="fw7">${u.name}</div><div class="txt3 txsm">${u.email}</div><div class="txt3 txsm">${u.phone||'No phone'}</div></div><div class="txt3 txsm">${fmt(u.created_at).split(',')[0]}</div></div></div>`).join(''):'<div class="empty"><div class="empty-ic">👥</div><div class="empty-tx">No customers yet</div></div>';
}

window.filterUsers=()=>{const q=document.getElementById('usrSearch').value.toLowerCase();renderUsers(allUsers.filter(u=>u.name.toLowerCase().includes(q)||u.email.toLowerCase().includes(q)));};

async function loadARiders(){
  const{data:riders}=await sb.from('profiles').select('*').eq('role','rider').order('created_at',{ascending:false});
  const ac={available:'chip-g',busy:'chip-gy',offline:'chip-r'};
  const ai={available:'🟢',busy:'🟡',offline:'🔴'};
  document.getElementById('aRidersList').innerHTML=riders?.length?riders.map(r=>`<div class="ocard s-assigned"><div class="fb"><div><div class="fw7">${r.name}</div><div class="txt3 txsm">${r.email}</div><div class="txt3 txsm">${r.phone||'No phone'}</div></div><span class="chip ${ac[r.availability]||'chip-gy'}">${ai[r.availability]||''} ${r.availability||'Unknown'}</span></div></div>`).join(''):'<div class="empty"><div class="empty-ic">🚴</div><div class="empty-tx">No riders registered yet</div></div>';
}

window.openAssign=async id=>{
  document.getElementById('assignInfo').textContent=`Order #${id.slice(-8).toUpperCase()}`;
  document.getElementById('assignModal').classList.add('open');
  const{data:riders}=await sb.from('profiles').select('*').eq('role','rider').order('name');
  document.getElementById('riderOpts').innerHTML=riders?.length?riders.map(r=>`<div class="sopt" onclick="assignRider('${id}','${r.id}',this)"><div><div class="fw6">${r.name}</div><div class="txt3 txsm">${r.phone||r.email}</div></div><span class="chip ${r.availability==='available'?'chip-g':'chip-gy'}">${r.availability||'—'}</span></div>`).join(''):'<div class="txt3 txsm" style="text-align:center;padding:18px">No riders registered yet</div>';
};

window.assignRider=async(orderId,riderId,el)=>{
  document.querySelectorAll('.sopt').forEach(o=>o.classList.remove('selected'));el.classList.add('selected');
  await sb.from('orders').update({rider_id:riderId,status:'assigned'}).eq('id',orderId);
  toast('Rider assigned!','ok');closeMod('assignModal');loadAOrders();
};

window.adminUpdStatus=async(id,s)=>{
  await sb.from('orders').update({status:s}).eq('id',id);
  toast(`Status updated to ${slabel(s)}`,'ok');loadAOrders();
};

window.openDetail=async id=>{
  const{data:o}=await sb.from('orders').select('*,order_items(*),customer:customer_id(name,phone,email),rider:rider_id(name,phone)').eq('id',id).single();
  if(!o)return;
  document.getElementById('detailContent').innerHTML=`
    <div class="fb" style="margin-bottom:9px"><div class="oid fw7" style="font-size:0.83rem">#${o.id.slice(-8).toUpperCase()}</div>${sbadge(o.status)}</div>
    <div class="div"></div>
    <div class="ir"><span class="irl">Customer</span><span class="irv">${o.customer?.name||'—'}</span></div>
    <div class="ir"><span class="irl">Phone</span><span class="irv">${o.customer?.phone||'—'}</span></div>
    <div class="ir"><span class="irl">Address</span><span class="irv" style="text-align:right;max-width:58%">${o.address}</span></div>
    <div class="ir"><span class="irl">Rider</span><span class="irv">${o.rider?.name||'Not assigned'}</span></div>
    <div class="ir"><span class="irl">Placed</span><span class="irv">${fmt(o.created_at)}</span></div>
    <div class="ir"><span class="irl">Updated</span><span class="irv">${fmt(o.updated_at)}</span></div>
    <div class="div"></div>
    <div class="fw7 txsm" style="margin-bottom:7px">Items (${o.order_items?.length||0})</div>
    ${(o.order_items||[]).map(i=>`<div class="oirow"><span class="oidot">•</span>${i.item_name}${i.quantity&&i.quantity!=='1'?` — qty: ${i.quantity}`:''}</div>`).join('')}
    ${o.note?`<div class="onote mt8">📝 ${o.note}</div>`:''}`;
  const acts=document.getElementById('detailActions');
  if(P.role==='admin'){
    const ns={pending:'assigned',assigned:'accepted',accepted:'in_progress',in_progress:'delivered'}[o.status];
    acts.innerHTML=`<button class="btn btn-gray" style="flex:1" onclick="closeMod('detailModal')">Close</button>${o.status==='pending'?`<button class="btn btn-blue" style="flex:2" onclick="closeMod('detailModal');openAssign('${o.id}')">Assign Rider</button>`:''}${ns?`<button class="btn btn-green" style="flex:2" onclick="adminUpdStatus('${o.id}','${ns}');closeMod('detailModal')">→ ${slabel(ns)}</button>`:''}${o.status!=='delivered'&&o.status!=='cancelled'?`<button class="btn btn-red btn-sm" onclick="adminUpdStatus('${o.id}','cancelled');closeMod('detailModal')">Cancel</button>`:''}`;
  }else{acts.innerHTML=`<button class="btn btn-gray" style="flex:1" onclick="closeMod('detailModal')">Close</button>`;}
  document.getElementById('detailModal').classList.add('open');
};

function renderOrder(o,ctx){
  const isAdmin=ctx==='admin',isRider=ctx==='rider';
  const showAcceptReject=isRider&&o.status==='assigned';
  return`<div class="ocard s-${o.status}" onclick="openDetail('${o.id}')">
    <div class="oheader">
      <div><div class="fw7" style="font-size:0.88rem">${isAdmin?(o.customer?.name||'Customer'):P.name}</div><div class="oid">#${o.id.slice(-8).toUpperCase()}${isAdmin?'':' · '+fmt(o.created_at)}</div></div>
      ${sbadge(o.status)}
    </div>
    <div class="oaddr">📍 ${o.address}</div>
    ${(o.order_items||[]).length?`<div class="oitems">${(o.order_items||[]).slice(0,3).map(i=>`<div class="oirow"><span class="oidot">•</span>${i.item_name}${i.quantity&&i.quantity!=='1'?` ×${i.quantity}`:''}</div>`).join('')}${(o.order_items||[]).length>3?`<div class="txt3 txsm">+${(o.order_items||[]).length-3} more</div>`:''}</div>`:''}
    <div class="ometa">
      <span class="otime">${isAdmin?fmt(o.created_at):''}</span>
      ${isAdmin&&o.rider?.name?`<span style="font-size:0.72rem;font-weight:500">🚴 ${o.rider.name}</span>`:''}
      ${isAdmin&&!o.rider?.name&&o.status==='pending'?`<button class="btn btn-blue btn-sm" onclick="event.stopPropagation();openAssign('${o.id}')">Assign Rider</button>`:''}
    </div>
    ${showAcceptReject?`<div style="display:flex;gap:7px;margin-top:10px" onclick="event.stopPropagation()"><button class="btn btn-green" style="flex:1" onclick="acceptOrder('${o.id}')">✅ Accept</button><button class="btn btn-red" style="flex:1" onclick="rejectOrder('${o.id}')">✕ Reject</button></div>`:''}
  </div>`;
}

(async()=>{
  const{data:{session}}=await sb.auth.getSession();
  if(session){
    document.getElementById('authScreen').style.display='none';
    U=session.user;
    await loadProfile();
  }
})();
    
  
