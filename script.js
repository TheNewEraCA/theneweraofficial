
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const storageKey='tne_user', adminName='TNECA', intentKey='tne_purchase_intent';
const state={ get user(){ try{return JSON.parse(localStorage.getItem(storageKey)||'null')}catch{return null} }, set user(v){ localStorage.setItem(storageKey, JSON.stringify(v)); } };

function sizeCanvasToParent(canvas, targetHeight=220){
  if(!canvas || !canvas.parentElement) return;
  const w = Math.floor(canvas.parentElement.getBoundingClientRect().width - 2);
  canvas.width = Math.max(300, w);
  canvas.height = targetHeight;
}

document.addEventListener('DOMContentLoaded', ()=>{
  const ham=$('#hamburger'), nav=$('#nav'); if(ham) ham.onclick=()=>nav.classList.toggle('open');
  const navUser=$('#nav-user'), navAdmin=$('#nav-admin');
  if(navUser) navUser.textContent = state.user ? 'Mein Bereich' : 'Kundenbereich';
  if(navAdmin) navAdmin.classList.toggle('hidden', !(state.user && state.user.isAdmin));

  // Packages → enforce login
  $$('.card[data-package] .btn').forEach(btn=>btn.addEventListener('click',e=>{
    const pkg=e.currentTarget.closest('.card').dataset.package;
    if(!state.user){ localStorage.setItem(intentKey, pkg); location.href='kundenbereich.html?next=purchase'; }
    else { localStorage.setItem(intentKey, pkg); location.href='kundenbereich.html'; }
  }));

  // Kundenbereich auth
  const loginForm=$('#login-form'), regForm=$('#register-form'), dash=$('#dashboard'), authArea=$('#auth-area'), testToggle=$('#test-toggle');
  if(loginForm && regForm && dash){
    $('#show-register').onclick=(e)=>{e.preventDefault(); loginForm.classList.add('hidden'); regForm.classList.remove('hidden');};
    $('#show-login').onclick=(e)=>{e.preventDefault(); regForm.classList.add('hidden'); loginForm.classList.remove('hidden');};

    if(state.user) renderDash();
    loginForm.onsubmit=(e)=>{e.preventDefault(); const d=Object.fromEntries(new FormData(loginForm).entries()); const isAdmin=(d.username.trim()===adminName); if(isAdmin && !confirm('Bist du sicher, dass du dich als Admin einloggen willst?')) return; state.user={username:d.username.trim(), email:d.username.trim()+'@example.com', packages:state.user?.packages||[], isAdmin}; renderDash();};
    regForm.onsubmit=(e)=>{e.preventDefault(); const d=Object.fromEntries(new FormData(regForm).entries()); state.user={username:d.username.trim(), email:d.email, packages:[], isAdmin:false}; renderDash();};

    function renderDash(){
      authArea.classList.add('hidden'); dash.classList.remove('hidden');
      $('#user-name').textContent=state.user.username;
      const ul=$('#user-packages'); ul.innerHTML=''; (state.user.packages||[]).forEach(p=>{const li=document.createElement('li'); li.textContent=p.toUpperCase(); ul.appendChild(li);});
      $('#logout').onclick=()=>{localStorage.removeItem(storageKey); location.reload();};
      $('#delete-account').onclick=()=>{ if(confirm('Account wirklich löschen?')){localStorage.removeItem(storageKey); location.reload();} };
      const navAdmin2=$('#nav-admin'); if(navAdmin2) navAdmin2.classList.toggle('hidden', !(state.user && state.user.isAdmin));
      if(testToggle) testToggle.classList.toggle('hidden', !(state.user && state.user.isAdmin));

      const intent=localStorage.getItem(intentKey); if(intent){ showBuySection(intent); localStorage.removeItem(intentKey); }
      const params=new URLSearchParams(location.search); if(params.get('next')==='purchase'){ const pkg=params.get('pkg'); if(pkg) showBuySection(pkg); history.replaceState({},'', 'kundenbereich.html'); }
      const fake=$('#fake-buy'); if(fake) fake.onclick=()=>alert('Digistore24-Button-Platzhalter.');
    }
  }

  // Profil-Seite
  const profileForm = $('#profile-form');
  if(profileForm){
    if(!state.user){ alert('Bitte zuerst einloggen.'); location.href='kundenbereich.html'; return; }
    profileForm.username.value = state.user.username || '';
    profileForm.email.value = state.user.email || '';
    profileForm.firstName.value = state.user.firstName || '';
    profileForm.lastName.value = state.user.lastName || '';
    profileForm.country.value = state.user.country || 'AT';
    profileForm.tz.value = state.user.tz || 'Europe/Vienna';
    ['football','tennis','basketball','icehockey','tabletennis'].forEach(k=>{ const f=profileForm['pref_'+k]; if(f) f.checked = !!(state.user.prefs && state.user.prefs[k]); });
    ['tips','news','security'].forEach(k=>{ const f=profileForm['notify_'+k]; if(f) f.checked = !!(state.user.notify && state.user.notify[k]); });
    profileForm.onsubmit=(e)=>{
      e.preventDefault();
      const d=Object.fromEntries(new FormData(profileForm).entries());
      if((d.newPassword||d.newPassword2) && d.newPassword!==d.newPassword2){ alert('Passwörter stimmen nicht überein.'); return; }
      state.user={
        ...state.user,
        username:d.username.trim(), email:d.email.trim(),
        firstName:d.firstName||'', lastName:d.lastName||'',
        country:d.country||'AT', tz:d.tz||'Europe/Vienna',
        prefs:{ football:!!profileForm.pref_football.checked, tennis:!!profileForm.pref_tennis.checked, basketball:!!profileForm.pref_basketball.checked, icehockey:!!profileForm.pref_icehockey.checked, tabletennis:!!profileForm.pref_tabletennis.checked },
        notify:{ tips:!!profileForm.notify_tips.checked, news:!!profileForm.notify_news.checked, security:!!profileForm.notify_security.checked }
      };
      alert('Profil gespeichert (Demo).');
    };
  }

  // Guthaben-Seite (Demo topups & tx list)
  const bal = $('#balance-amount'), txList = $('#tx-list');
  if(bal && txList){
    const balKey='tne_balance', txKey='tne_tx';
    const fmt = (n)=>'€ '+n.toFixed(2).replace('.',',');
    const readBal=()=>+(localStorage.getItem(balKey)||'0'); const writeBal=(v)=>localStorage.setItem(balKey, String(v));
    const readTx=()=>{try{return JSON.parse(localStorage.getItem(txKey)||'[]')}catch{return []}}; const writeTx=(a)=>localStorage.setItem(txKey, JSON.stringify(a));
    const render=()=>{
      bal.textContent = fmt(readBal());
      txList.innerHTML='';
      readTx().slice().reverse().forEach(t=>{
        const li=document.createElement('li'); li.textContent=`${t.date} – ${t.type} ${fmt(t.amount)} (${t.note||''})`; txList.appendChild(li);
      });
    };
    render();
    $$('button[data-topup]').forEach(b=>b.onclick=()=>{
      const amt=+b.dataset.topup; const nb=readBal()+amt; writeBal(nb);
      const tx=readTx(); tx.push({date:new Date().toLocaleString(), type:'Aufladung', amount:amt, note:'Demo'}); writeTx(tx);
      render();
    });
    $('#reset-balance').onclick=()=>{ writeBal(0); writeTx([]); render(); };
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
        const tr=document.createElement('tr');
        tr.innerHTML=`<td>${u.username}</td><td>${u.email}</td><td>${(u.packages.map(p=>p.toUpperCase()).join(', ')||'-')}</td><td>${u.status}</td>
        <td><button class="btn ghost" data-edit="${i}">Bearbeiten</button>
        <button class="btn warn" data-toggle="${i}">${u.status==='gesperrt'?'Entsperren':'Sperren'}</button>
        <button class="btn danger" data-del="${i}">Löschen</button></td>`;
        tbody.appendChild(tr);
      });
      $$('button[data-edit]').forEach(b=>b.onclick=()=>alert('Bearbeiten (Demo)'));
      $$('button[data-toggle]').forEach(b=>b.onclick=(e)=>{const i=+e.currentTarget.dataset.toggle; demoUsers[i].status=demoUsers[i].status==='gesperrt'?'aktiv':'gesperrt'; renderUsers();});
      $$('button[data-del]').forEach(b=>b.onclick=(e)=>{const i=+e.currentTarget.dataset.del; if(confirm('User wirklich löschen?')){ demoUsers.splice(i,1); renderUsers(); }});
    }
    renderUsers();

    const tList=$('#tickets');
    function renderTickets(){ tList.innerHTML=''; tickets.forEach((t,i)=>{ const li=document.createElement('li'); li.innerHTML=`${t.id} – ${t.user}: ${t.subject} ${t.open?'<button class="btn ghost" data-done="'+i+'">Erledigt</button>':'<span class="subtle">(geschlossen)</span>'}`; tList.appendChild(li); }); $$('button[data-done]').forEach(b=>b.onclick=(e)=>{const i=+e.currentTarget.dataset.done; tickets[i].open=false; renderTickets();}); }
    renderTickets();

    const reg=$('#regChart'), pie=$('#pkgChart');
    function drawAll(){ sizeCanvasToParent(reg, 220); drawRegChart(reg); sizeCanvasToParent(pie, 220); drawPkgChart(pie); }
    drawAll(); let tt; window.addEventListener('resize', ()=>{ clearTimeout(tt); tt=setTimeout(drawAll,150);} );

    $('#admin-logout').onclick=()=>{ localStorage.removeItem(storageKey); location.href='index.html'; };
  }
});

function showBuySection(pkg){
  const map={einzel:{name:'Einzelpaket', price:'€ 50 / Monat'},
             live:{name:'Livepaket', price:'€ 70 / Monat'},
             mehrfach:{name:'Mehrfachpaket', price:'€ 100 / Monat'},
             system:{name:'Systempaket', price:'€ 150 / Monat'}};
  const info=map[pkg]||{name:pkg, price:''};
  const box=$("#buy-section"), desc=$("#buy-desc");
  if(box && desc){ desc.textContent = `${info.name} – ${info.price}`; box.classList.remove('hidden'); }
}

// Charts with axes and labels
function drawRegChart(cv){
  if(!cv) return; const ctx=cv.getContext('2d'); const w=cv.width, h=cv.height;
  ctx.fillStyle='#0f0f0f'; ctx.fillRect(0,0,w,h);
  const data=Array.from({length:30},()=>Math.floor(Math.random()*6)+1);
  const max=Math.max(...data, 6);
  const pad={l:40,r:10,t:15,b:28}, plotW=w-pad.l-pad.r, plotH=h-pad.t-pad.b;
  const dx=plotW/(data.length-1), sY=plotH/max;

  ctx.strokeStyle='#333'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(pad.l,pad.t); ctx.lineTo(pad.l,pad.t+plotH); ctx.lineTo(pad.l+plotW,pad.t+plotH); ctx.stroke();

  ctx.fillStyle='#aaa'; ctx.font='11px system-ui';
  for(let i=0;i<=max;i+=2){ const y=pad.t+plotH - i*sY; ctx.strokeStyle='#222'; ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(pad.l+plotW,y); ctx.stroke(); ctx.fillText(String(i),5,y+4); }
  for(let i=0;i<data.length;i+=5){ const x=pad.l+i*dx; ctx.fillText(String(i+1), x-4, pad.t+plotH+18); }
  ctx.fillText('Tag', pad.l+plotW-18, pad.t+plotH+18);

  ctx.strokeStyle='#d4af37'; ctx.lineWidth=2; ctx.beginPath();
  data.forEach((v,i)=>{ const x=pad.l+i*dx, y=pad.t+plotH - v*sY; i?ctx.lineTo(x,y):ctx.moveTo(x,y); }); ctx.stroke();
  ctx.fillStyle='#ffd700'; data.forEach((v,i)=>{ const x=pad.l+i*dx, y=pad.t+plotH - v*sY; ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2); ctx.fill(); });
  ctx.fillStyle='#888'; ctx.font='12px system-ui'; ctx.fillText('Neue Registrierungen',10,12);
}

function drawPkgChart(cv){
  if(!cv) return; const ctx=cv.getContext('2d'); const w=cv.width, h=cv.height;
  ctx.fillStyle='#0f0f0f'; ctx.fillRect(0,0,w,h);
  const entries=[['Einzel',35],['Live',25],['Mehrfach',22],['System',18]];
  const total=entries.reduce((a,[,v])=>a+v,0); let start=-Math.PI/2; const colors=['#d4af37','#b8860b','#ffd700','#8b7500'];
  const r=Math.min(w,h)/2 - 20;
  entries.forEach(([label,val],i)=>{ const ang=(val/total)*Math.PI*2; ctx.beginPath(); ctx.moveTo(w/2,h/2); ctx.fillStyle=colors[i%colors.length]; ctx.arc(w/2,h/2,r,start,start+ang); ctx.closePath(); ctx.fill(); start+=ang; });
  ctx.font='12px system-ui'; entries.forEach(([label,val],i)=>{ ctx.fillStyle=colors[i%colors.length]; ctx.fillRect(10,10+i*18,12,12); ctx.fillStyle='#ddd'; ctx.fillText(`${label} (${val})`,28,20+i*18); });
}
