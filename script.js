// gord-scripts — статический клиент (localStorage)
// Измените ADMIN_NICK если нужно
const ADMIN_NICK = 'gord';
const STORAGE_USERS = 'gord_users_v1';
const STORAGE_SCRIPTS = 'gord_scripts_v1';

// ----------------- helpers -----------------
function $(sel){ return document.querySelector(sel) }
function el(tag, cls, txt){ const e = document.createElement(tag); if(cls) e.className = cls; if(txt!==undefined) e.textContent = txt; return e }
function nowISO(){ return new Date().toISOString() }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8) }

// SHA-256 хэш (Web Crypto) -> hex
async function hashStr(s){
  const enc = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// LocalStorage: users { nick: hash }, scripts [{id,title,body,author,created_at}]
function loadUsers(){ try { return JSON.parse(localStorage.getItem(STORAGE_USERS) || '{}') } catch(e){ return {} } }
function saveUsers(u){ localStorage.setItem(STORAGE_USERS, JSON.stringify(u)) }
function loadScripts(){ try { return JSON.parse(localStorage.getItem(STORAGE_SCRIPTS) || '[]') } catch(e){ return [] } }
function saveScripts(s){ localStorage.setItem(STORAGE_SCRIPTS, JSON.stringify(s)) }

// Current session (client-side)
function setSession(nick){ localStorage.setItem('gord_session_nick', nick) }
function clearSession(){ localStorage.removeItem('gord_session_nick') }
function getSession(){ return localStorage.getItem('gord_session_nick') }

// ----------------- UI rendering -----------------
async function render(){
  const nick = getSession();
  renderUserBlock(nick);
  renderPanel(nick);
  renderScriptsList();
}

function renderUserBlock(nick){
  const ub = $('#user-block'); ub.innerHTML = '';
  if(nick){
    const span = el('div', 'muted', `Вошёл как ${nick}`);
    const btnOut = el('button','btn small','Выйти'); btnOut.onclick = ()=>{ clearSession(); render(); }
    ub.appendChild(span); ub.appendChild(btnOut);
  } else {
    const btnLogin = el('button','btn primary','Войти / Регистрация'); btnLogin.onclick = showAuthModal;
    ub.appendChild(btnLogin);
  }
}

function renderPanel(nick){
  const panel = $('#panel-content'); panel.innerHTML = '';
  if(nick === ADMIN_NICK){
    // админ — форма публикации
    const lbl = el('div','muted','Публикация — видна только админу');
    const inputTitle = el('input',''); inputTitle.placeholder='Название (коротко)';
    const textarea = el('textarea',''); textarea.placeholder='Тело скрипта (код)';
    const btnPub = el('button','btn primary','Опубликовать'); 
    btnPub.onclick = ()=>{
      const title = inputTitle.value.trim(); const body = textarea.value.trim();
      if(!title || !body){ alert('Нужно название и тело скрипта'); return; }
      const scripts = loadScripts();
      scripts.unshift({ id: uid(), title, body, author: nick, created_at: nowISO() });
      saveScripts(scripts);
      inputTitle.value=''; textarea.value='';
      renderScriptsList();
      alert('Опубликовано');
    }
    const btnExport = el('button','btn','Экспортировать JSON'); btnExport.style.marginLeft='8px';
    btnExport.onclick = ()=>{
      const data = JSON.stringify(loadScripts(), null, 2);
      downloadText('gord-scripts-export.json', data);
    }
    panel.appendChild(lbl); panel.appendChild(inputTitle); panel.appendChild(textarea);
    const wrap = el('div',''); wrap.style.display='flex'; wrap.style.gap='8px'; wrap.appendChild(btnPub); wrap.appendChild(btnExport);
    panel.appendChild(wrap);
  } else {
    // не админ — показать инструкцию для регистрации
    const info = el('div','','Чтобы публиковать скрипты, войдите под ником администратора.');
    const helper = el('div','muted',`Админ по умолчанию: "${ADMIN_NICK}". При регистрации используйте этот ник, чтобы получить права публикации.`);
    panel.appendChild(info); panel.appendChild(helper);
  }
}

function renderScriptsList(){
  const list = $('#scripts-list'); list.innerHTML = '';
  const scripts = loadScripts();
  if(!scripts || scripts.length === 0){
    $('#no-scripts').style.display = 'block';
    return;
  } else $('#no-scripts').style.display = 'none';

  scripts.forEach(s=>{
    const card = el('div','script-card');
    const meta = el('div','script-meta');
    const title = el('div','script-title', s.title);
    const info = el('div','', `${s.author} • ${new Date(s.created_at).toLocaleString()}`);
    meta.appendChild(title); meta.appendChild(info);
    const actions = el('div','script-actions');
    const btnOpen = el('button','btn small','Открыть'); btnOpen.onclick = ()=>openModal(s);
    const btnCopy = el('button','btn small','Копировать'); btnCopy.onclick = ()=>copyToClipboard(s.body);
    actions.appendChild(btnOpen); actions.appendChild(btnCopy);

    // если вы админ — добавить удаление
    const nick = getSession();
    if(nick === ADMIN_NICK){
      const btnDel = el('button','btn small','Удалить'); btnDel.style.marginLeft='auto';
      btnDel.onclick = ()=>{
        if(!confirm('Удалить скрипт?')) return;
        const arr = loadScripts().filter(x=>x.id !== s.id);
        saveScripts(arr);
        renderScriptsList();
      }
      actions.appendChild(btnDel);
    }

    card.appendChild(meta); 
    const excerpt = el('div','muted', truncate(s.body, 200));
    card.appendChild(excerpt);
    card.appendChild(actions);
    list.appendChild(card);
  });
}

// ----------------- Modals / actions -----------------
function openModal(script){
  $('#modal-title').textContent = script.title;
  $('#modal-body').textContent = script.body;
  $('#modal').classList.remove('hidden');
  $('#modal').setAttribute('aria-hidden','false');
}
function closeModal(){ $('#modal').classList.add('hidden'); $('#modal').setAttribute('aria-hidden','true'); }

function copyToClipboard(text){
  navigator.clipboard.writeText(text).then(()=>{ alert('Скопировано в буфер обмена') }).catch(()=>alert('Ошибка копирования'));
}

function downloadText(filename, text){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], {type:'text/plain'}));
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
}

function truncate(s, n){ return s.length>n ? s.slice(0,n-1)+'…' : s }

// ----------------- Auth flow (без сервера) -----------------
async function registerUser(nick, password){
  if(!nick || !password) throw new Error('empty');
  if(nick.length < 3) throw new Error('short_nick');
  if(password.length < 6) throw new Error('short_pass');
  const users = loadUsers();
  if(users[nick]) throw new Error('exists');
  const h = await hashStr(password);
  users[nick] = h;
  saveUsers(users);
  setSession(nick);
}

async function loginUser(nick, password){
  const users = loadUsers();
  const exist = users[nick];
  if(!exist) throw new Error('no_user');
  const h = await hashStr(password);
  if(h !== exist) throw new Error('bad_pass');
  setSession(nick);
}

// Auth modal using prompt-like simple UI
function showAuthModal(){
  // we will use simple modal prompts to minimize markup
  const mode = prompt('Введите "r" для регистрации или "l" для входа (r/l)');
  if(!mode) return;
  if(mode !== 'r' && mode !== 'l'){ alert('Неверный ввод'); return; }
  const nick = prompt('Ник (3+ символа):');
  if(!nick) return;
  const pass = prompt('Пароль (6+ символов):');
  if(!pass) return;

  (async ()=>{
    try{
      if(mode === 'r') await registerUser(nick.trim(), pass);
      else await loginUser(nick.trim(), pass);
      alert('Успешно');
      render();
    } catch(e){
      if(e.message === 'exists') alert('Ник уже занят. Попробуйте войти.');
      else if(e.message === 'no_user') alert('Пользователь не найден. Зарегистрируйтесь.');
      else if(e.message === 'bad_pass') alert('Неверный пароль');
      else if(e.message === 'short_nick') alert('Ник слишком короткий');
      else if(e.message === 'short_pass') alert('Пароль слишком короткий');
      else alert('Ошибка: ' + e.message);
    }
  })();
}

// ----------------- Modal events -----------------
document.addEventListener('click', (ev)=>{
  if(ev.target.matches('#modal-close')) closeModal();
  if(ev.target.matches('#modal-copy')) copyToClipboard($('#modal-body').textContent);
  if(ev.target.matches('#modal-download')) downloadText(($('#modal-title').textContent || 'script') + '.txt', $('#modal-body').textContent);
  // закрыть при клике вне карточки
  if(ev.target.matches('.modal')) closeModal();
});

// ----------------- Init demo data (если нет) -----------------
function seedIfEmpty(){
  const s = loadScripts();
  if(!s || s.length === 0){
    const demo = [
      { id: uid(), title: 'Пример: Lua snippet', body: "-- Lua example\nprint('hello from gord-scripts')", author: 'demo', created_at: nowISO() }
    ];
    saveScripts(demo);
  }
  // ensure admin user exists? не создаём пароль автоматически — админ должен зарегистрироваться под ником ADMIN_NICK
}

// ----------------- Startup -----------------
seedIfEmpty();
render();
