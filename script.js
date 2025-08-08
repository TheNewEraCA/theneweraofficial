
// Client-side demo auth using localStorage (not production)
const $ = (s,p=document)=>p.querySelector(s);
const $$=(s,p=document)=>[...p.querySelectorAll(s)];
const state = {
  get user(){ try{return JSON.parse(localStorage.getItem('tne_user')||'null')}catch{return null} },
  set user(v){ localStorage.setItem('tne_user', JSON.stringify(v)) }
};
document.addEventListener('DOMContentLoaded', ()=>{
  const navUser = $('#nav-user'); if (navUser) navUser.textContent = state.user ? 'Mein Bereich' : 'Kundenbereich';

  $$('.card[data-package] .btn').forEach(btn=>btn.addEventListener('click',e=>{
    const pkg = e.currentTarget.closest('.card').dataset.package;
    if (!state.user) location.href = 'kundenbereich.html?next=purchase&pkg='+encodeURIComponent(pkg);
    else {
      const u = state.user; u.packages = u.packages||[]; if (!u.packages.includes(pkg)) u.packages.push(pkg); state.user=u;
      alert('Bestellung gestartet: '+pkg.toUpperCase()); location.href='kundenbereich.html';
    }
  }));

  const loginForm = $('#login-form'); const registerForm = $('#register-form'); const dash = $('#dashboard');
  if (loginForm && registerForm && dash){
    $('#show-register').onclick=(e)=>{e.preventDefault(); loginForm.classList.add('hidden'); registerForm.classList.remove('hidden');};
    $('#show-login').onclick=(e)=>{e.preventDefault(); registerForm.classList.add('hidden'); loginForm.classList.remove('hidden');};
    if (state.user) renderDash();
    loginForm.onsubmit=(e)=>{e.preventDefault(); const d=Object.fromEntries(new FormData(loginForm)); state.user={username:d.username,email:d.username+'@example.com',packages:state.user?.packages||[]}; postAuth();};
    registerForm.onsubmit=(e)=>{e.preventDefault(); const d=Object.fromEntries(new FormData(registerForm)); state.user={username:d.username,email:d.email,packages:[]}; postAuth();};
    function postAuth(){ const p=new URLSearchParams(location.search); if (p.get('next')==='purchase'&&p.get('pkg')){ const u=state.user; u.packages.push(p.get('pkg')); state.user=u; alert('Bestellung gestartet: '+p.get('pkg').toUpperCase()); } renderDash(); history.replaceState({},'', 'kundenbereich.html'); }
    function renderDash(){ $('#auth-area').classList.add('hidden'); dash.classList.remove('hidden'); $('#user-name').textContent=state.user.username; const list=$('#user-packages'); list.innerHTML=''; (state.user.packages||[]).forEach(p=>{ const li=document.createElement('li'); li.textContent=p.toUpperCase(); list.appendChild(li);}); $('#logout').onclick=()=>{localStorage.removeItem('tne_user'); location.reload();}; $('#delete-account').onclick=()=>{ if(confirm('Account wirklich löschen?')){ localStorage.removeItem('tne_user'); location.reload(); } }; $('#edit-profile').onclick=()=>alert('Profilbearbeitung (Demo)'); $('#balance').onclick=()=>alert('Guthabenbereich (Demo)'); }
  }
});
