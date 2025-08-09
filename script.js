
const $ = (s,p=document)=>p.querySelector(s);
const $$ = (s,p=document)=>[...p.querySelectorAll(s)];
const storageKey='tne_user'; const adminName='TNECA';
const state={ get user(){ try{return JSON.parse(localStorage.getItem(storageKey)||'null')}catch{return null} }, set user(v){ localStorage.setItem(storageKey, JSON.stringify(v)) } };

document.addEventListener('DOMContentLoaded',()=>{
  // Mobile nav
  const ham=$('#hamburger'), nav=$('#nav'); if(ham) ham.onclick=()=>nav.classList.toggle('open');

  // Nav labels/visibility
  const navUser=$('#nav-user'), navAdmin=$('#nav-admin');
  if (navUser) navUser.textContent = state.user ? 'Mein Bereich' : 'Kundenbereich';
  if (navAdmin) navAdmin.classList.toggle('hidden', !(state.user && state.user.isAdmin));

  // Packages
  $$('.card[data-package] .btn').forEach(btn=>btn.addEventListener('click',e=>{
    const pkg=e.currentTarget.closest('.card').dataset.package;
    if(!state.user){ location.href='kundenbereich.html?next=purchase&pkg='+encodeURIComponent(pkg); }
    else{ const u=state.user; u.packages=u.packages||[]; if(!u.packages.includes(pkg)) u.packages.push(pkg); state.user=u; alert('Bestellung gestartet: '+pkg.toUpperCase()); location.href='kundenbereich.html'; }
  }));

  // Auth
  const loginForm=$('#login-form'), regForm=$('#register-form'), dash=$('#dashboard'), authArea=$('#auth-area'), testToggle=$('#test-toggle');
  if(loginForm && regForm && dash){
    $('#show-register').onclick=(e)=>{e.preventDefault(); loginForm.classList.add('hidden'); regForm.classList.remove('hidden');};
    $('#show-login').onclick=(e)=>{e.preventDefault(); regForm.classList.add('hidden'); loginForm.classList.remove('hidden');};
    if(state.user) renderDash();
    loginForm.onsubmit=(e)=>{e.preventDefault(); const d=Object.fromEntries(new FormData(loginForm).entries()); const isAdmin=(d.username.trim()===adminName); if(isAdmin && !confirm('Bist du sicher, dass du dich als Admin einloggen willst?')) return; state.user={username:d.username.trim(), email:d.username.trim()+'@example.com', packages:state.user?.packages||[], isAdmin}; postAuth();};
    regForm.onsubmit=(e)=>{e.preventDefault(); const d=Object.fromEntries(new FormData(regForm).entries()); state.user={username:d.username.trim(), email:d.email, packages:[], isAdmin:false}; postAuth();};
    function postAuth(){ const p=new URLSearchParams(location.search); if(p.get('next')==='purchase'&&p.get('pkg')){ const u=state.user; u.packages=u.packages||[]; u.packages.push(p.get('pkg')); state.user=u; alert('Bestellung gestartet: '+p.get('pkg').toUpperCase()); } renderDash(); history.replaceState({},'', 'kundenbereich.html'); }
    function renderDash(){ authArea.classList.add('hidden'); dash.classList.remove('hidden'); $('#user-name').textContent=state.user.username; const list=$('#user-packages'); list.innerHTML=''; (state.user.packages||[]).forEach(p=>{ const li=document.createElement('li'); li.textContent=p.toUpperCase(); list.appendChild(li);}); $('#logout').onclick=()=>{localStorage.removeItem(storageKey); location.reload();}; $('#delete-account').onclick=()=>{ if(confirm('Account wirklich löschen?')){localStorage.removeItem(storageKey); location.reload();} }; $('#edit-profile').onclick=()=>alert('Profilbearbeitung (Demo)'); $('#balance').onclick=()=>alert('Guthabenbereich (Demo)'); const navAdmin2=$('#nav-admin'); if(navAdmin2) navAdmin2.classList.toggle('hidden', !(state.user && state.user.isAdmin)); if(testToggle) { testToggle.classList.toggle('hidden', !(state.user && state.user.isAdmin)); testToggle.onclick=()=>alert('Testmodus: Hier später Admin-/User-Ansicht toggeln.'); } }
  }

  // Admin page
  if(location.pathname.endsWith('admin.html')){
    if(!(state.user && state.user.isAdmin)){ alert('Zugriff verweigert. Bitte als Admin einloggen (Benutzername: '+adminName+').'); location.href='kundenbereich.html'; return; }
    const demoUsers=[
      {username:'max', email:'max@example.com', packages:['einzel','live'], status:'aktiv'},
      {username:'erika', email:'erika@example.com', packages:['mehrfach'], status:'aktiv'},
      {username:'tim', email:'tim@example.com', packages:['system'], status:'gesperrt'},
      {username:'leo', email:'leo@example.com', packages:[], status:'inaktiv'},
      {username:'mia', email:'mia@example.com', packages:['live','mehrfach','einzel'], status:'aktiv'},
    ];
    const tickets=[
      {id:101, user:'erika', subject:'Paket nicht sichtbar', open:true},
      {id:102, user:'leo', subject:'Passwort vergessen', open:true},
      {id:103, user:'tim', subject:'Zahlung fehlgeschlagen', open:true},
    ];

    const tbody=$('#userTable tbody');
    function renderUsers(){
      tbody.innerHTML='';
      demoUsers.forEach((u,i)=>{
        const tr=document.createElement('tr'); const pkgs=u.packages.map(p=>p.toUpperCase()).join(', ')||'-';
        tr.innerHTML=`<td>${u.username}</td><td>${u.email}</td><td>${pkgs}</td><td>${u.status}</td>
                      <td><button class="btn ghost" data-edit="${i}">Bearbeiten</button>
                          <button class="btn warn" data-toggle="${i}">${u.status==='gesperrt'?'Entsperren':'Sperren'}</button>
                          <button class="btn danger" data-del="${i}">Löschen</button></td>`;
        tbody.appendChild(tr);
      });
      $$('button[data-edit]').forEach(b=>b.onclick=()=>alert('Bearbeiten (Demo)'));
      $$('button[data-toggle]').forEach(b=>b.onclick=(e)=>{const i=+e.currentTarget.dataset.toggle; demoUsers[i].status = demoUsers[i].status==='gesperrt'?'aktiv':'gesperrt'; renderUsers();});
      $$('button[data-del]').forEach(b=>b.onclick=(e)=>{const i=+e.currentTarget.dataset.del; if(confirm('User wirklich löschen?')){ demoUsers.splice(i,1); renderUsers(); }});
    }
    renderUsers();

    const tList=$('#tickets');
    function renderTickets(){
      tList.innerHTML='';
      tickets.forEach((t,i)=>{
        const li=document.createElement('li');
        li.innerHTML=`${t.id} – ${t.user}: ${t.subject} ${t.open?'<button class="btn ghost" data-done="'+i+'">Erledigt</button>':'<span class="subtle">(geschlossen)</span>'}`;
        tList.appendChild(li);
      });
      $$('button[data-done]').forEach(b=>b.onclick=(e)=>{const i=+e.currentTarget.dataset.done; tickets[i].open=false; renderTickets();});
    }
    renderTickets();

    // Charts (simple canvas)
    drawRegChart($('#regChart'));
    drawPkgChart($('#pkgChart'));

    $('#admin-logout').onclick=()=>{localStorage.removeItem(storageKey); location.href='index.html';};
    $('#toggle-view').onclick=()=>alert('Testmodus: In Live-Version hier zwischen Admin/User-View umschalten.');
  }
});

function drawRegChart(cv){
  if(!cv) return; const ctx=cv.getContext('2d'); const w=cv.width, h=cv.height;
  ctx.fillStyle='#0f0f0f'; ctx.fillRect(0,0,w,h);
  const data=Array.from({length:30},()=>Math.floor(Math.random()*6)+1);
  const max=Math.max(...data)+2; const dx=(w-60)/29; const scale=(h-50)/max;
  ctx.strokeStyle='#333'; ctx.beginPath(); ctx.moveTo(40,10); ctx.lineTo(40,h-30); ctx.lineTo(w-10,h-30); ctx.stroke();
  ctx.strokeStyle='#d4af37'; ctx.lineWidth=2; ctx.beginPath();
  data.forEach((v,i)=>{const x=40+i*dx, y=(h-30)-v*scale; i?ctx.lineTo(x,y):ctx.moveTo(x,y);}); ctx.stroke();
  ctx.fillStyle='#888'; ctx.font='12px system-ui'; ctx.fillText('Neue Registrierungen',10,20);
}
function drawPkgChart(cv){
  if(!cv) return; const ctx=cv.getContext('2d'); const w=cv.width,h=cv.height;
  ctx.fillStyle='#0f0f0f'; ctx.fillRect(0,0,w,h);
  const entries=[['Einzel',35],['Live',25],['Mehrfach',22],['System',18]];
  const total=entries.reduce((a,[,v])=>a+v,0); let start=-Math.PI/2; const colors=['#d4af37','#b8860b','#ffd700','#8b7500'];
  entries.forEach(([label,val],i)=>{const ang=(val/total)*Math.PI*2; ctx.beginPath(); ctx.moveTo(w/2,h/2); ctx.fillStyle=colors[i%colors.length]; ctx.arc(w/2,h/2,Math.min(w,h)/2-20,start,start+ang); ctx.closePath(); ctx.fill(); start+=ang;});
  ctx.font='12px system-ui'; entries.forEach(([label,val],i)=>{ctx.fillStyle=colors[i%colors.length]; ctx.fillRect(10,10+i*18,12,12); ctx.fillStyle='#ddd'; ctx.fillText(`${label} (${val})`,28,20+i*18);});
}
