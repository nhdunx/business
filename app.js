// app.js — Logic ứng dụng Hanzi Learn
/* ===================== CONFIG ===================== */
const BAI_INFO = [
  {level:1, name:'Bài 1', desc:'会员卡怎么办理? <br> Làm thẻ hội viên như thế nào?', color:'#e74c3c'},
  {level:2, name:'Bài 2', desc:'去火车站怎么坐车？<br> Đi đến ga tàu hỏa bằng cách nào?', color:'#e67e22'},
  {level:3, name:'Bài 3', desc:'有事请留言<br>Có việc xin để lại lời nhắn', color:'#f1c40f'},
  {level:4, name:'Bài 4', desc:'附近有没有自动取款机？<br> Gần đây có máy rút tiền tự động (ATM) không?', color:'#27ae60'},
  {level:5, name:'Bài 5', desc:'周四的日程都安排满了<br>  Lịch trình thứ Năm đã xếp kín rồi', color:'#3498db'},
  {level:6, name:'Bài 6', desc:'为友好合作干杯！<br> Cạn ly cho sự hợp tác hữu nghị!', color:'#9b59b6'},
  {level:7, name:'Bài 7', desc:'你哪儿不舒服？<br> Bạn thấy khó chịu ở đâu?', color:'#1abc9c'},
  {level:8, name:'Bài 8', desc:'我想预订一个商务套房<br> Tôi muốn đặt một phòng suite thương gia', color:'#e74c3c'},
  {level:9, name:'Bài 9', desc:'美元对人民币的汇率是多少？<br> Tỷ giá USD so với NDT là bao nhiêu?', color:'#e67e22'},
  {level:10, name:'Bài 10', desc:'我们可以免费维修<br> Chúng tôi có thể sửa chữa miễn phí', color:'#f1c40f'},
  {level:11, name:'Bài 11', desc:'我们会尽快通知你面试结果<br>  Chúng tôi sẽ thông báo kết quả phỏng vấn cho bạn sớm nhất có thể', color:'#27ae60'},
  {level:12, name:'Bài 12', desc:'买一张16号去南京的车票<br> Mua một vé đi Nam Kinh ngày 16', color:'#3498db'},
  {level:13, name:'Bài 13', desc:'我什么时候可以搬进来？<br>  Khi nào tôi có thể chuyển vào?', color:'#9b59b6'},
  {level:14, name:'Bài 14', desc:'希望我的事业越来越成功<br> Hy vọng sự nghiệp của tôi ngày càng thành công', color:'#1abc9c'},
];

/* ===================== STATE ===================== */
let currentUser = {u:'Khách', access:[1,2,3,4,5,6,7,8,9,10,11,12,13,14], role:'guest'};
let currentLevel = null;
let VOCAB = [];
let mode = 'all', shuffled = false;
let order = [];
let answers = {};
let starred = new Set();
let examCfg = {pool:'all', type:'meaning', count:10};
let quizQuestions = [], quizIdx = 0, quizResults = [];

/* ===================== SCREENS ===================== */
const SCREENS = ['select-screen','app-screen','exam-screen','quiz-screen','result-screen','fc-setup-screen','fc-play-screen','fc-end-screen'];
function showOnly(id){
  SCREENS.forEach(s=>document.getElementById(s).classList.toggle('active', s===id));
  document.getElementById('zalo-float').style.display = 'block';
}

function logout(){
  answers={}; starred=new Set(); currentLevel=null; VOCAB=[];
  currentUser = {u:'Khách', access:[1,2,3,4,5,6], role:'guest'};
  shuffled=false;
  document.getElementById('shuffle-btn').classList.remove('on');
  closeAllDropdowns();
  showOnly('select-screen');
}

function initApp(){
  showOnly('select-screen');
  renderBaiGrid();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/* ===================== AVATAR DROPDOWN ===================== */
function toggleAvatar(){
  const dd=document.getElementById('avatar-dropdown');
  if(dd) dd.classList.toggle('show');
}
function closeAllDropdowns(){
  const dd=document.getElementById('avatar-dropdown');
  if(dd) dd.classList.remove('show');
  document.getElementById('zalo-popup').classList.remove('show');
}
document.addEventListener('click',e=>{
  const dd=document.getElementById('avatar-dropdown');
  if(dd && !e.target.closest('.avatar-wrap')) dd.classList.remove('show');
  if(!e.target.closest('.zalo-float')) document.getElementById('zalo-popup').classList.remove('show');
});

/* ===================== CHANGE PASSWORD ===================== */
function showChangePassword(){
  if(currentUser && currentUser.u === 'demo'){
    document.getElementById('demo-notice').style.display='';
    document.getElementById('demo-notice').classList.add('show');
    return;
  }
  closeAllDropdowns();
  document.getElementById('pw-modal').classList.add('show');
  document.getElementById('pw-old').value='';
  document.getElementById('pw-new').value='';
  document.getElementById('pw-confirm').value='';
  const msg=document.getElementById('pw-msg'); msg.className='modal-msg'; msg.textContent='';
}
function closePwModal(){
  document.getElementById('pw-modal').classList.remove('show');
}
async function doChangePw(){
  const old=document.getElementById('pw-old').value;
  const nw=document.getElementById('pw-new').value;
  const cf=document.getElementById('pw-confirm').value;
  const msg=document.getElementById('pw-msg');
  if(nw.length<4){
    msg.className='modal-msg err'; msg.textContent='Mật khẩu mới phải từ 4 ký tự!'; return;
  }
  if(nw!==cf){
    msg.className='modal-msg err'; msg.textContent='Mật khẩu nhập lại không khớp!'; return;
  }
  // Try server API first
  try {
    if(window._authToken){
      var res = await fetch(window.location.origin+'/api/change-password', {
        method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+window._authToken},
        body: JSON.stringify({oldPassword:old, newPassword:nw})
      });
      var data = await res.json();
      if(res.ok){
        msg.className='modal-msg ok'; msg.textContent='✅ '+data.message;
        setTimeout(()=>closePwModal(),1200);
        return;
      }
      msg.className='modal-msg err'; msg.textContent=data.error; return;
    }
  } catch(e) {}
  // Fallback: local check
  if(old!==currentUser.p){
    msg.className='modal-msg err'; msg.textContent='Mật khẩu hiện tại không đúng!'; return;
  }
  currentUser.p=nw;
  msg.className='modal-msg ok'; msg.textContent='✅ Đổi mật khẩu thành công!';
  setTimeout(()=>closePwModal(),1200);
}

/* ===================== ZALO ===================== */
function toggleZaloPopup(){
  document.getElementById('zalo-popup').classList.toggle('show');
}
function showZaloContact(){
  // From login forgot password
  alert('Liên hệ Zalo Admin: 0792 739 257');
}

/* ===================== BAI GRID ===================== */
function renderBaiGrid(){
  const grid=document.getElementById('bai-grid');
  const access = currentUser.baiAccess || currentUser.access || [];
  grid.innerHTML = BAI_INFO.map(h=>{
    const data = BAI_DATA['bai'+h.level];
    const count = data ? data.length : 0;
    // Bài 1 luôn mở cho mọi người (50 từ free)
    const isLocked = h.level === 1 ? false : access.indexOf(h.level) === -1;
    const lockedClass = isLocked ? 'locked' : '';
    const lockIcon = isLocked ? '<div class="bai-card-lock">🔒</div>' : '';
    const clickAction = isLocked ? `showLocked()` : `selectBai(${h.level})`;
    const btnText = isLocked ? '🔒 Mở khóa' : 'Bắt đầu học →';
    const freeNote = '';
    return `<div class="bai-card ${lockedClass}" onclick="${clickAction}" style="border-top:4px solid ${h.color}">
      ${lockIcon}
      <div class="bai-card-level" style="color:${isLocked?'#666':h.color}">${h.level}</div>
      <div class="bai-card-label">${h.name}</div>
      <div class="bai-card-count">${count} từ vựng</div>
      <div class="bai-card-desc">${h.desc}</div>
      <button class="bai-card-btn" style="background:${isLocked?'#888':h.color};margin-top:14px" 
        onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">${btnText}</button>
    </div>`;
  }).join('');
}

function showLocked(){
  document.getElementById('locked-msg').classList.add('show');
}
function closeLocked(){
  document.getElementById('locked-msg').classList.remove('show');
}
function closeDemoNotice(){
  document.getElementById('demo-notice').classList.remove('show');
}

/* ===================== SELECT BAI ===================== */
function selectBai(level){
  currentLevel = level;
  VOCAB = BAI_DATA['bai'+level] || [];
  order = VOCAB.map((_,i)=>i);
  answers = {};
  starred = new Set();
  shuffled = false;
  starFilter = 'all';
  pinyinHidden = false;
  mode = 'all';
  document.getElementById('shuffle-btn').classList.remove('on');
  document.getElementById('pinyin-btn').classList.remove('on-red');
  document.getElementById('hide-starred-btn').classList.remove('on-red','on-red-slash');
  document.querySelectorAll('.mode-btn').forEach((b,i)=>b.classList.toggle('active',i===0));
  document.getElementById('app-level-label').textContent = 'Bài '+level;
  showOnly('app-screen');
  render();
  window.scrollTo({top:0});
  // Load sao đã lưu từ server
  loadStars().then(function(){ render(); });
}
function backToSelect(){
  showOnly('select-screen');
  renderBaiGrid();
}

/* ===================== SPEECH ===================== */
var _audioCtx = null;
function speak(text){
  // Phương án 1: Web Speech API (hoạt động tốt trên iPhone khi có user interaction)
  if(window.speechSynthesis){
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN'; 
    u.rate = 0.85;
    // Tìm giọng tiếng Trung
    var voices = window.speechSynthesis.getVoices();
    for(var i=0; i<voices.length; i++){
      if(voices[i].lang && voices[i].lang.indexOf('zh') === 0){
        u.voice = voices[i];
        break;
      }
    }
    window.speechSynthesis.speak(u);
    return;
  }
  // Phương án 2: Google TTS fallback (cho thiết bị không có Speech API)
  try {
    var audio = new Audio('https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=zh-CN&q=' + encodeURIComponent(text));
    audio.play().catch(function(){});
  } catch(e) {}
}

/* ===================== MAIN TABLE ===================== */
var pinyinHidden = false;
var starFilter = 'all'; // 'all' | 'only' | 'hide'
var searchQuery = '';

function setMode(m, btn){
  mode=m;
  if(m==='all') window.scrollTo({top:0,behavior:'smooth'});
  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); render();
}
function togglePinyin(){
  pinyinHidden = !pinyinHidden;
  document.getElementById('pinyin-btn').classList.toggle('on-red', pinyinHidden);
  render();
}
function toggleHideStarred(){
  var btn = document.getElementById('hide-starred-btn');
  if(starFilter === 'all'){
    starFilter = 'only';
    btn.classList.add('on-red');
    btn.classList.remove('on-red-slash');
  } else if(starFilter === 'only'){
    starFilter = 'hide';
    btn.classList.add('on-red-slash');
  } else {
    starFilter = 'all';
    btn.classList.remove('on-red','on-red-slash');
  }
  render();
}
function showFlashcard(){
  // Update counts
  var t=VOCAB.length, s=starred.size;
  document.getElementById('fc-total').textContent=t;
  document.getElementById('fc-starred').textContent=s;
  document.getElementById('fc-unstarred').textContent=t-s;
  fcCfg={pool:'all',order:'seq',count:10};
  fcHidePy=false;
  document.getElementById('fc-pinyin-toggle').className='toggle-switch';
  // Reset opt buttons
  document.querySelectorAll('#fc-setup-screen .opt-btn').forEach(function(b,i){ b.classList.toggle('active', i===0); });
  document.getElementById('fc-custom-count').value='';
  showOnly('fc-setup-screen');
}
function handleSearch(input){
  searchQuery = input.value.trim().toLowerCase();
  render();
}
function toggleShuffle(){
  shuffled=!shuffled;
  document.getElementById('shuffle-btn').classList.toggle('on',shuffled);
  if(shuffled){
    order=VOCAB.map((_,i)=>i);
    for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  } else { order=VOCAB.map((_,i)=>i); }
  answers={}; render();
}
function resetAll(){ 
  answers={}; 
  searchQuery=''; 
  var si=document.getElementById('search-input'); 
  if(si) si.value='';
  starFilter='all';
  document.getElementById('hide-starred-btn').classList.remove('on-red','on-red-slash');
  pinyinHidden=false;
  document.getElementById('pinyin-btn').classList.remove('on-red');
  shuffled=false;
  document.getElementById('shuffle-btn').classList.remove('on');
  order=VOCAB.map((_,i)=>i);
  render(); 
}

function toggleStar(idx){
  if(isFreeLocked(idx)) return;
  if(starred.has(idx)) starred.delete(idx); else starred.add(idx);
  const btn=document.getElementById('star-'+idx);
  if(btn) btn.classList.toggle('starred', starred.has(idx));
  updateStarCount();
  saveStars();
}
function updateStarCount(){
  const el=document.getElementById('star-count');
  if(el) el.textContent = starred.size;
}

// Lưu sao lên server
function saveStars(){
  if(!currentLevel) return;
  try{
    localStorage.setItem('bai_stars_' + currentLevel, JSON.stringify([...starred]));
  }catch(e){ console.warn('saveStars localStorage failed', e); }
}
// Load stars from localStorage or server fallback
async function loadStars(){
  if(!currentLevel) return;
  try{
    var stored = localStorage.getItem('bai_stars_' + currentLevel);
    if(stored){
      starred = new Set(JSON.parse(stored));
      updateStarCount();
      return;
    }
  }catch(e){ }
  if(!window._authToken) return;
  try{
    var res = await fetch(window.location.origin + '/api/stars?level=' + currentLevel, {
      headers:{'Authorization':'Bearer '+window._authToken}
    });
    if(res.ok){
      var data = await res.json();
      starred = new Set(data.stars || []);
      updateStarCount();
    }
  }catch(e){}
}

function toggleExample(idx){
  const row = document.getElementById('ex-row-'+idx);
  if(row) row.style.display = row.style.display==='none' ? 'table-row' : 'none';
}

/* Giới hạn: mọi TK đều xem free 50 từ đầu Bài 1. Từ 51 trở đi + Bài khác cần mua gói */
const FREE_LIMIT = 99999;
function isFreeOnly(){ return false; }
function isFreeLocked(originalIdx){ return false; }

function render(){
  const thead=document.getElementById('thead-row');
  const tbody=document.getElementById('tbody');

  // Filter by search
  var filteredOrder = order;
  if(searchQuery){
    filteredOrder = order.filter(function(idx){
      var w = VOCAB[idx];
      return w.hanzi.indexOf(searchQuery) !== -1 ||
             w.pinyin.toLowerCase().indexOf(searchQuery) !== -1 ||
             w.meaning.toLowerCase().indexOf(searchQuery) !== -1;
    });
  }
  // Filter by star
  if(starFilter === 'only'){
    filteredOrder = filteredOrder.filter(function(idx){
      return starred.has(idx);
    });
  } else if(starFilter === 'hide'){
    filteredOrder = filteredOrder.filter(function(idx){
      return !starred.has(idx);
    });
  }

  if(mode==='hanzi'){
    thead.innerHTML='<tr><th style="width:36px">#</th><th>Phiên âm</th><th>Nghĩa</th><th>Nhập chữ Hán</th><th></th></tr>';
  } else if(mode==='meaning'){
    thead.innerHTML='<tr><th style="width:36px">#</th><th>Chữ Hán</th><th>Phiên âm</th><th>Nhập nghĩa tiếng Việt</th><th></th></tr>';
  } else {
    thead.innerHTML='<tr><th style="width:36px">#</th><th>Chữ Hán</th><th>Phiên âm</th><th>Nghĩa</th><th class="th-example-pc">Ví dụ</th><th style="width:60px;text-align:center">Đã nhớ</th></tr>';
  }
  document.getElementById('tbl').style.display='table';
  document.getElementById('empty-state').style.display= filteredOrder.length===0 ? 'block' : 'none';

  tbody.innerHTML = filteredOrder.map((idx,i)=>{
    const w=VOCAB[idx], a=answers[idx];
    const locked = isFreeLocked(idx);
    const rc=locked?'row-locked':(a?(a.correct?'row-correct':'row-wrong'):'');
    const icon=a&&!locked?(a.correct?'✅':'❌'):'';
    const val=a&&!locked?esc(a.value):'';
    const ic=a&&!locked?(a.correct?'correct':'wrong'):'';
    const dis=(a||locked)?'disabled':'';
    const isStarred=starred.has(idx);
    const speakBtn=locked?'🔊':`<button class="speak-btn" onclick="speak('${esc(w.hanzi)}')" title="Phát âm">🔊</button>`;
    const pinyinText = pinyinHidden ? '<span style="color:#888;font-style:italic">•••</span>' : esc(w.pinyin);

    if(mode==='hanzi'){
      return `<tr class="${rc}" id="row-${idx}">
        <td class="td-stt">${idx+1}</td>
        <td class="td-pinyin"><div class="td-pinyin-inner">${speakBtn}${pinyinText}</div></td>
        <td class="td-meaning">${esc(w.meaning)}</td>
        <td class="td-input">
          ${locked?'<span style="color:#999;font-size:12px">🔒</span>':`<input class="vocab-input ${ic}" type="text" ${dis} value="${val}"
            placeholder="Nhập chữ Hán..."
            onkeydown="if(event.key==='Enter')check(${idx},this,'hanzi')">`}
          ${a&&!a.correct&&!locked?`<div class="hint-answer">→ ${esc(w.hanzi)}</div>`:''}
        </td>
        <td class="td-result"><span class="result-icon" id="ic-${idx}">${icon}</span></td>
      </tr>`;
    } else if(mode==='meaning'){
      return `<tr class="${rc}" id="row-${idx}">
        <td class="td-stt">${idx+1}</td>
        <td class="td-hanzi">${esc(w.hanzi)}</td>
        <td class="td-pinyin"><div class="td-pinyin-inner">${speakBtn}${pinyinText}</div></td>
        <td class="td-input">
          ${locked?'<span style="color:#999;font-size:12px">🔒</span>':`<input class="vocab-input ${ic}" type="text" ${dis} value="${val}"
            placeholder="Nhập nghĩa tiếng Việt..."
            style="font-family:'Be Vietnam Pro',sans-serif;font-size:13px"
            onkeydown="if(event.key==='Enter')check(${idx},this,'meaning')">`}
          ${a&&!a.correct&&!locked?`<div class="hint-answer">→ ${esc(w.meaning)}</div>`:''}
        </td>
        <td class="td-result"><span class="result-icon" id="ic-${idx}">${icon}</span></td>
      </tr>`;
    } else {
      const hasEx = w.ex_hanzi && w.ex_hanzi.trim() && !locked;
      const exPC = hasEx ? `<td class="td-example-pc"><div class="ex-hanzi">${esc(w.ex_hanzi)}</div><div class="ex-pinyin">${esc(w.ex_pinyin||'')}</div><div class="ex-viet">${esc(w.ex_viet||'')}</div></td>` : '<td class="td-example-pc"><span style="color:#555">—</span></td>';
      const tuLoai = w.tu_loai ? `<div class="tu-loai-tag">${esc(w.tu_loai)}</div>` : '';
      return `<tr class="${locked?'row-locked':''}" id="row-${idx}">
        <td class="td-stt">${idx+1}</td>
        <td class="td-hanzi">${esc(w.hanzi)}${tuLoai}</td>
        <td class="td-pinyin"><div class="td-pinyin-inner">${speakBtn}${pinyinText}</div></td>
        <td class="td-meaning">${esc(w.meaning)}</td>
        ${exPC}
        <td class="td-star">${locked?'🔒':`<button class="star-btn ${isStarred?'starred':''}" id="star-${idx}" onclick="toggleStar(${idx})" title="Đánh dấu đã nhớ">⭐</button>`}</td>
      </tr>`;
    }
  }).join('');
}

function check(idx, input, type){
  const w=VOCAB[idx], val=input.value.trim();
  if(!val) return;
  let correct = false;
  if(type==='hanzi'){
    correct = val===w.hanzi;
  } else {
    // Chuẩn hóa: bỏ dấu cách thừa, lowercase
    const normalize = function(s){ return s.toLowerCase().replace(/\s*,\s*/g,',').replace(/\s*\/\s*/g,'/').replace(/\s+/g,' ').trim(); };
    const userVal = normalize(val);
    const answer = normalize(w.meaning);
    // Đúng nếu: khớp hoàn toàn, hoặc khách nhập 1 trong các nghĩa
    if(userVal === answer){
      correct = true;
    } else {
      // Tách nghĩa theo dấu phẩy hoặc /
      const parts = answer.split(/[,\/]/).map(function(p){return p.trim().toLowerCase();}).filter(function(p){return p;});
      correct = parts.indexOf(userVal) !== -1;
    }
  }
  answers[idx]={value:val, correct};
  input.className='vocab-input '+(correct?'correct':'wrong');
  input.disabled=true;
  const row=document.getElementById('row-'+idx);
  row.className=correct?'row-correct':'row-wrong';
  const ic=document.getElementById('ic-'+idx);
  ic.textContent=correct?'✅':'❌';
  ic.classList.remove('pop'); void ic.offsetWidth; ic.classList.add('pop');
  if(!correct){
    let hint=row.querySelector('.hint-answer');
    if(!hint){hint=document.createElement('div');hint.className='hint-answer';input.parentNode.appendChild(hint);}
    hint.textContent='→ '+(type==='hanzi'?w.hanzi:w.meaning);
  }
  // Auto focus next input
  setTimeout(function(){
    var allInputs = document.querySelectorAll('.vocab-input:not([disabled])');
    if(allInputs.length > 0){
      allInputs[0].focus();
      allInputs[0].scrollIntoView({behavior:'smooth', block:'center'});
    }
  }, 200);
}

/* ===================== EXAM SETUP ===================== */
var skipStarred = true;
var hidePinyinExam = false;

function showExamSetup(){
  updateStarCount();
  var maxWords = isFreeOnly() ? Math.min(VOCAB.length, FREE_LIMIT) : VOCAB.length;
  document.getElementById('exam-total').textContent = maxWords;
  examCfg = {pool:'all', type:'meaning', count:10};
  document.querySelectorAll('#exam-screen .opt-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('#exam-screen .setup-section').forEach((s,si)=>{
    const btns=s.querySelectorAll('.opt-btn');
    if(btns.length) btns[0].classList.add('active');
  });
  document.getElementById('custom-count').value='';
  document.getElementById('exam-warn').style.display='none';
  document.getElementById('exam-all-btn').textContent='Tất cả ('+maxWords+')';
  // Update progress
  updateExamProgress();
  // Update toggle state
  document.getElementById('skip-starred-toggle').className = 'toggle-switch' + (skipStarred ? ' on' : '');
  document.getElementById('hide-pinyin-toggle').className = 'toggle-switch' + (hidePinyinExam ? ' on' : '');
  showOnly('exam-screen');
}

function updateExamProgress(){
  var maxWords = isFreeOnly() ? Math.min(VOCAB.length, FREE_LIMIT) : VOCAB.length;
  var starredCount = starred.size;
  var remaining = maxWords - starredCount;
  if(remaining < 0) remaining = 0;
  var pct = maxWords > 0 ? Math.round((starredCount / maxWords) * 100) : 0;
  document.getElementById('prog-starred').textContent = starredCount;
  document.getElementById('prog-total').textContent = maxWords;
  document.getElementById('prog-fill').style.width = pct + '%';
  document.getElementById('prog-note').innerHTML = 'Còn <b>' + remaining + '</b> từ chưa đánh dấu';
}

function toggleSkipStarred(){
  skipStarred = !skipStarred;
  document.getElementById('skip-starred-toggle').className = 'toggle-switch' + (skipStarred ? ' on' : '');
}

function toggleHidePinyinExam(){
  hidePinyinExam = !hidePinyinExam;
  document.getElementById('hide-pinyin-toggle').className = 'toggle-switch' + (hidePinyinExam ? ' on' : '');
}

function resetStarProgress(){
  if(!confirm('Xóa hết ⭐ đã nhớ của Bài ' + currentLevel + '? Bạn sẽ kiểm tra lại từ đầu.')) return;
  starred = new Set();
  saveStars();
  updateStarCount();
  updateExamProgress();
  alert('Đã xóa hết ⭐ của Bài ' + currentLevel + '!');
}
function setExamOpt(key, val, btn){
  examCfg[key]=val;
  if(key==='count' && val===0) examCfg.count = isFreeOnly() ? Math.min(VOCAB.length, FREE_LIMIT) : VOCAB.length;
  if(btn){
    const group=btn.parentElement;
    group.querySelectorAll('.opt-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    if(key==='count') document.getElementById('custom-count').value='';
  }
  validateExam();
}
function validateExam(){
  const warn=document.getElementById('exam-warn');
  var maxWords = isFreeOnly() ? Math.min(VOCAB.length, FREE_LIMIT) : VOCAB.length;
  const pool = examCfg.pool==='starred' ? starred.size : maxWords;
  const cnt = examCfg.count;
  if(examCfg.pool==='starred' && starred.size===0){
    warn.textContent='⚠️ Bạn chưa đánh dấu từ nào là đã nhớ!';
    warn.style.display='block'; return false;
  }
  if(cnt > pool){
    warn.textContent=`⚠️ Số từ nhập (${cnt}) lớn hơn số từ có sẵn (${pool}). Sẽ dùng tối đa ${pool} từ.`;
    warn.style.display='block';
  } else { warn.style.display='none'; }
  return true;
}
function backToApp(){ showOnly('app-screen'); render(); }

/* ===================== START EXAM ===================== */
function startExam(){
  if(!validateExam() && examCfg.pool==='starred' && starred.size===0) return;
  let pool;
  if(examCfg.pool==='starred'){
    pool=[...starred].filter(function(idx){ return !isFreeLocked(idx); });
  } else {
    var maxIdx = isFreeOnly() ? Math.min(VOCAB.length, FREE_LIMIT) : VOCAB.length;
    pool=[];
    for(var i=0;i<maxIdx;i++){
      // Bỏ qua từ đã nhớ nếu toggle bật
      if(skipStarred && starred.has(i)) continue;
      pool.push(i);
    }
  }
  if(pool.length === 0){
    alert('Chúc mừng! Bạn đã nhớ hết tất cả từ vựng! Bấm "Đặt lại tiến độ" để làm lại từ đầu.');
    return;
  }
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const cnt=Math.min(examCfg.count||10, pool.length);
  pool=pool.slice(0,cnt);
  quizQuestions=pool.map(idx=>{
    let qtype=examCfg.type;
    if(qtype==='both') qtype=Math.random()<0.5?'meaning':'hanzi';
    return {idx, qtype};
  });
  quizIdx=0; quizResults=[];
  showOnly('quiz-screen');
  renderQuiz();
}

/* ===================== QUIZ ===================== */
function renderQuiz(){
  if(quizIdx>=quizQuestions.length){ showResult(); return; }
  const q=quizQuestions[quizIdx];
  const w=VOCAB[q.idx];
  const total=quizQuestions.length;
  document.getElementById('quiz-prog-text').textContent=`Câu ${quizIdx+1} / ${total}`;
  document.getElementById('quiz-bar').style.width=((quizIdx/total)*100)+'%';

  const correctIdx=q.idx;
  let wrongPool=VOCAB.map((_,i)=>i).filter(i=>i!==correctIdx);
  for(let i=wrongPool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[wrongPool[i],wrongPool[j]]=[wrongPool[j],wrongPool[i]];}
  const wrongs=wrongPool.slice(0,3);
  let choices=[correctIdx,...wrongs];
  for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}

  const card=document.getElementById('quiz-card');
  if(q.qtype==='meaning'){
    var pinyinDisplay = hidePinyinExam ? '<span style="color:#888">•••</span>' : esc(w.pinyin);
    card.innerHTML=`
      <div class="quiz-q-label">Chọn nghĩa tiếng Việt đúng</div>
      <div class="quiz-q-hanzi">${esc(w.hanzi)}</div>
      <button class="quiz-speak" onclick="speak('${esc(w.hanzi)}')" title="Phát âm">🔊</button>
      <div class="quiz-q-pinyin">${pinyinDisplay}</div>
      <div class="choices">
        ${choices.map(ci=>`<button class="choice-btn" onclick="pickChoice(this,${ci},${correctIdx},'meaning')">${esc(VOCAB[ci].meaning)}</button>`).join('')}
      </div>`;
  } else {
    card.innerHTML=`
      <div class="quiz-q-label">Chọn chữ Hán đúng</div>
      <div class="quiz-q-meaning">${esc(w.meaning)}</div>
      <div class="choices">
        ${choices.map(ci=>`<button class="choice-btn" onclick="pickChoice(this,${ci},${correctIdx},'hanzi')">
          <span class="choice-hanzi">${esc(VOCAB[ci].hanzi)}</span>
        </button>`).join('')}
      </div>`;
  }
}

function pickChoice(btn, chosen, correct, type){
  const card=document.getElementById('quiz-card');
  card.querySelectorAll('.choice-btn').forEach(b=>b.disabled=true);
  const isCorrect=chosen===correct;
  btn.classList.add(isCorrect?'correct-choice':'wrong-choice');
  if(!isCorrect){
    card.querySelectorAll('.choice-btn').forEach(b=>{
      const ci=parseInt(b.getAttribute('onclick').match(/pickChoice\(this,(\d+)/)[1]);
      if(ci===correct) b.classList.add('correct-choice');
    });
  }
  quizResults.push({idx:correct, correct:isCorrect, qtype:type});
  setTimeout(function(){ speak(VOCAB[correct].hanzi); }, 100);
  setTimeout(()=>{ quizIdx++; renderQuiz(); }, isCorrect?900:1500);
}

/* ===================== QUIT QUIZ ===================== */
function quitQuiz(){
  var done = quizResults.length;
  var total = quizQuestions.length;
  var correctN = quizResults.filter(function(r){ return r.correct; }).length;
  
  if(done === 0){
    // Chưa làm câu nào → thoát luôn
    backToApp();
    return;
  }
  
  // Hiện popup
  var summary = 'Bạn đã làm ' + done + '/' + total + ' câu, đúng ' + correctN + ' từ.';
  document.getElementById('quit-summary').textContent = summary;
  var saveBtn = document.getElementById('quit-save-btn');
  saveBtn.textContent = '⭐ Lưu ' + correctN + ' từ đúng & thoát';
  saveBtn.disabled = false;
  saveBtn.style.background = '';
  if(correctN === 0){
    saveBtn.textContent = 'Chưa có từ đúng để lưu';
    saveBtn.disabled = true;
    saveBtn.style.background = '#ccc';
  }
  document.getElementById('quit-modal').classList.add('show');
}

function closeQuitModal(){
  document.getElementById('quit-modal').classList.remove('show');
}

function quitAndSave(){
  // Lưu từ đúng vào ⭐
  var count = 0;
  quizResults.forEach(function(r){
    if(r.correct && !starred.has(r.idx)){
      starred.add(r.idx);
      count++;
    }
  });
  saveStars();
  updateStarCount();
  document.getElementById('quit-modal').classList.remove('show');
  backToApp();
}

function quitNoSave(){
  document.getElementById('quit-modal').classList.remove('show');
  backToApp();
}

/* ===================== RESULT ===================== */
var quizStarChecked = new Set();

function showResult(){
  showOnly('result-screen');
  const total=quizResults.length;
  const correctN=quizResults.filter(r=>r.correct).length;
  const pct=Math.round((correctN/total)*100);
  document.getElementById('res-score').textContent=`${correctN}/${total}`;
  document.getElementById('res-sub').textContent=
    pct>=90?'🎉 Xuất sắc! Bạn thật giỏi!':
    pct>=70?'👍 Khá tốt! Tiếp tục cố gắng!':
    pct>=50?'💪 Ổn! Ôn luyện thêm nhé!':
    '📚 Cần ôn tập thêm nhiều hơn!';
  document.getElementById('res-correct').textContent=correctN;
  document.getElementById('res-wrong').textContent=total-correctN;

  // Từ đúng tick sẵn
  quizStarChecked = new Set();
  quizResults.forEach(function(r){ if(r.correct) quizStarChecked.add(r.idx); });

  const list=document.getElementById('res-list');
  list.innerHTML=quizResults.map(r=>{
    const w=VOCAB[r.idx];
    const checked = quizStarChecked.has(r.idx);
    return `<div class="result-item ${r.correct?'c':'w'}" onclick="toggleQuizStar(${r.idx}, this)">
      <div class="ri-check ${checked?'checked':''}" id="qstar-${r.idx}">${checked?'✓':''}</div>
      <div class="ri-hanzi">${esc(w.hanzi)}</div>
      <div class="ri-info">
        <div style="font-size:12px;color:var(--gray);font-style:italic">${esc(w.pinyin)}</div>
        <div style="font-size:13px">${esc(w.meaning)}</div>
      </div>
      <div class="ri-icon">${r.correct?'✅':'❌'}</div>
    </div>`;
  }).join('');

  updateSaveStarBtn();
}

function toggleQuizStar(idx, el){
  if(quizStarChecked.has(idx)){
    quizStarChecked.delete(idx);
  } else {
    quizStarChecked.add(idx);
  }
  var check = document.getElementById('qstar-'+idx);
  if(check){
    check.className = 'ri-check' + (quizStarChecked.has(idx) ? ' checked' : '');
    check.textContent = quizStarChecked.has(idx) ? '✓' : '';
  }
  updateSaveStarBtn();
}

function updateSaveStarBtn(){
  var btn = document.getElementById('btn-save-star');
  if(btn) btn.textContent = '⭐ Lưu từ đã nhớ (' + quizStarChecked.size + ' từ)';
}

function saveQuizStars(){
  console.log('saveQuizStars called, checked:', quizStarChecked.size, 'currentLevel:', currentLevel, 'token:', !!window._authToken);
  var count = 0;
  quizStarChecked.forEach(function(idx){
    if(!starred.has(idx)){
      starred.add(idx);
      count++;
    }
  });
  console.log('Added', count, 'new stars, total starred:', starred.size);
  
  // Đảm bảo currentLevel có giá trị
  if(!currentLevel){
    console.error('currentLevel is empty! Cannot save.');
    alert('Lỗi: không xác định được cấp Bài. Vui lòng quay lại và thử lại.');
    return;
  }
  
  saveStars();
  updateStarCount();
  var btn = document.getElementById('btn-save-star');
  if(btn){
    btn.textContent = '✅ Đã lưu ' + quizStarChecked.size + ' từ';
  }
}

/* ===================== FLASHCARD ===================== */
var fcCfg={pool:'all',order:'seq',count:10};
var fcHidePy=false, fcCards=[], fcIdx=0, fcFlipped=false, fcAnimDir='', fcStarred=new Set();

function setFcOpt(k,v,btn){
  fcCfg[k]=v;
  if(k==='count'&&v===0) fcCfg.count=VOCAB.length;
  if(btn){
    btn.parentElement.querySelectorAll('.opt-btn').forEach(function(b){b.classList.remove('active')});
    btn.classList.add('active');
    if(k==='count') document.getElementById('fc-custom-count').value='';
  }
}
function toggleFcPinyin(){
  fcHidePy=!fcHidePy;
  document.getElementById('fc-pinyin-toggle').className='toggle-switch'+(fcHidePy?' on':'');
}

function startFc(){
  var pool=[];
  for(var i=0;i<VOCAB.length;i++){
    if(fcCfg.pool==='starred'&&!starred.has(i)) continue;
    if(fcCfg.pool==='unstarred'&&starred.has(i)) continue;
    pool.push(i);
  }
  if(!pool.length){alert('Không có từ nào phù hợp!');return;}
  if(fcCfg.order==='rand'){
    for(var i=pool.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=pool[i];pool[i]=pool[j];pool[j]=t;}
  }
  fcCards=pool.slice(0,Math.min(fcCfg.count||pool.length,pool.length));
  fcIdx=0;fcFlipped=false;fcAnimDir='';
  fcStarred=new Set();
  // Copy existing stars for cards in this session
  fcCards.forEach(function(ci){if(starred.has(ci)) fcStarred.add(ci);});
  showOnly('fc-play-screen');
  fcRender();
}

function fcRender(){
  if(fcIdx<0)fcIdx=0;
  if(fcIdx>=fcCards.length)fcIdx=fcCards.length-1;
  var ci=fcCards[fcIdx],w=VOCAB[ci],tot=fcCards.length;
  fcFlipped=false;
  var card=document.getElementById('fc-card');
  card.classList.remove('flipped');
  card.classList.remove('anim-left','anim-right');
  if(fcAnimDir){void card.offsetWidth;card.classList.add(fcAnimDir==='left'?'anim-left':'anim-right');fcAnimDir='';}
  // Progress
  document.getElementById('fc-prog-text').textContent=(fcIdx+1)+'/'+tot;
  document.getElementById('fc-prog-bar').style.width=((fcIdx+1)/tot*100)+'%';
  document.getElementById('fc-cur').textContent=fcIdx+1;
  document.getElementById('fc-tot').textContent=tot;
  // Star
  var isStar=fcStarred.has(ci);
  document.getElementById('fc-sf').classList.toggle('on',isStar);
  document.getElementById('fc-sb').classList.toggle('on',isStar);
  // Front
  document.getElementById('fc-hanzi').textContent=w.hanzi;
  document.getElementById('fc-pinyin').innerHTML=fcHidePy?'<span style="color:#ccc">•••</span>':esc(w.pinyin);
  // Back
  document.getElementById('fc-tuloai').textContent=w.tu_loai||'';
  document.getElementById('fc-meaning').textContent=w.meaning;
  if(w.ex_hanzi&&w.ex_hanzi.trim()){
    document.getElementById('fc-example').style.display='block';
    document.getElementById('fc-ex-hanzi').textContent=w.ex_hanzi;
    document.getElementById('fc-ex-pinyin').textContent=w.ex_pinyin||'';
    document.getElementById('fc-ex-viet').textContent=w.ex_viet||'';
  } else {
    document.getElementById('fc-example').style.display='none';
  }
  // Nav
  document.getElementById('fc-prev').disabled=(fcIdx===0);
  var nb=document.getElementById('fc-next');
  if(fcIdx===tot-1){nb.innerHTML='✓';nb.classList.add('fc-done');nb.disabled=false;}
  else{nb.innerHTML='▶';nb.classList.remove('fc-done');nb.disabled=false;}
}

function fcFlip(e){
  if(e&&e.target&&(e.target.closest('.fc-speak-btn')||e.target.closest('.fc-star'))) return;
  fcFlipped=!fcFlipped;
  document.getElementById('fc-card').classList.toggle('flipped',fcFlipped);
}
function fcNext(){if(fcIdx>=fcCards.length-1){fcShowEnd();return;}fcAnimDir='left';fcIdx++;fcRender();}
function fcPrev(){if(fcIdx>0){fcAnimDir='right';fcIdx--;fcRender();}}

// Keyboard
document.addEventListener('keydown',function(e){
  if(!document.getElementById('fc-play-screen').classList.contains('active')) return;
  if(document.getElementById('fc-quit-modal').classList.contains('show')) return;
  if(e.key==='ArrowRight') fcNext();
  else if(e.key==='ArrowLeft') fcPrev();
  else if(e.key===' '||e.key==='Enter'){e.preventDefault();fcFlip({});}
});

function fcToggleStar(){
  var ci=fcCards[fcIdx];
  if(fcStarred.has(ci)) fcStarred.delete(ci); else fcStarred.add(ci);
  var s=fcStarred.has(ci);
  document.getElementById('fc-sf').classList.toggle('on',s);
  document.getElementById('fc-sb').classList.toggle('on',s);
}
function fcSpeak(){
  var ci=fcCards[fcIdx],text=VOCAB[ci].hanzi;
  setTimeout(function(){ speak(text); }, 100);
}
function fcCountStarred(){
  var c=0;fcCards.forEach(function(ci){if(fcStarred.has(ci))c++;});return c;
}

// Quit modal
function showFcQuit(){
  var d=fcIdx+1,t=fcCards.length,s=fcCountStarred();
  document.getElementById('fc-quit-summary').textContent='Bạn đã lướt '+d+'/'+t+' từ, đánh dấu nhớ '+s+' từ.';
  var b=document.getElementById('fc-quit-save');
  if(s===0){b.textContent='Chưa có từ nào đánh dấu nhớ';b.disabled=true;b.style.opacity='.5';}
  else{b.textContent='⭐ Lưu '+s+' từ đã nhớ & thoát';b.disabled=false;b.style.opacity='1';}
  document.getElementById('fc-quit-modal').classList.add('show');
}
function closeFcQuit(){document.getElementById('fc-quit-modal').classList.remove('show');}
function fcQuitSave(){
  fcSaveStarsToMain();
  closeFcQuit();
  backToApp();
}
function fcQuitNoSave(){closeFcQuit();backToApp();}

// End screen
function fcShowEnd(){
  var t=fcCards.length,s=fcCountStarred();
  document.getElementById('fc-end-total').textContent=t;
  document.getElementById('fc-end-starred').textContent=s;
  var b=document.getElementById('fc-end-save');
  if(s===0){b.textContent='Chưa có từ nào đánh dấu nhớ';b.disabled=true;b.style.opacity='.5';}
  else{b.textContent='⭐ Lưu từ đã nhớ ('+s+' từ)';b.disabled=false;b.style.opacity='1';b.style.background='';}
  showOnly('fc-end-screen');
}
function fcEndSave(){
  fcSaveStarsToMain();
  var b=document.getElementById('fc-end-save');
  b.textContent='✅ Đã lưu '+fcCountStarred()+' từ!';
  b.disabled=true;
  b.style.background='#27ae60';
}

// Save flashcard stars to main starred set
function fcSaveStarsToMain(){
  fcCards.forEach(function(ci){
    if(fcStarred.has(ci)){
      starred.add(ci);
    }
  });
  saveStars();
  updateStarCount();
}

function esc(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
