// ✅ PWA SW（保留）
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}

// ===== 固定單價 =====
const UNIT_PRICE = 180;

// ✅ 運費規則（129 / 滿1800免運）
const SHIP_FEE = 129;
const FREE_SHIP_AT = 1800;

// ✅ LINE ID
const LINE_ID = "chris770912";

// ✅ 你的圖片路徑（不裁切輪播）
const IMAGES = [
  "images/photo1.jpg",
  "images/photo2.jpg",
  "images/photo3.jpg",
  "images/packs.jpg",
  "images/set.jpg",
  "images/spread.jpg",
  "images/bowl.jpg"
];

// ===== Tabs =====
const tabs = Array.from(document.querySelectorAll(".tab[data-tab]"));
const panels = Array.from(document.querySelectorAll("[data-panel]"));
function setTab(id){
  tabs.forEach(t => t.setAttribute("aria-selected", t.dataset.tab === id ? "true" : "false"));
  panels.forEach(p => p.classList.toggle("hide", p.dataset.panel !== id));
}
tabs.forEach(t => t.addEventListener("click", () => setTab(t.dataset.tab)));
window.selectTab = function(id){
  document.getElementById("tabs").scrollIntoView({behavior:"smooth", block:"start"});
  setTab(id);
};

// ===== Carousel =====
(function initCarousel(){
  const root = document.querySelector("[data-carousel]");
  const track = root.querySelector("[data-track]");
  const dotsWrap = root.querySelector("[data-dots]");
  const btnPrev = root.querySelector("[data-prev]");
  const btnNext = root.querySelector("[data-next]");

  track.innerHTML = IMAGES.map((src, i) => `
    <div class="carousel-slide">
      <img src="${src}" alt="美味實拍 ${i+1}" loading="lazy"
           onerror="this.style.opacity=.25; this.alt='圖片載入失敗：請確認 images/ 檔名是否正確';">
    </div>
  `).join("");

  const slides = Array.from(track.children);
  let idx = 0;
  let w = 0;
  let timer = null;
  let dragging = false;
  let startX = 0;
  let currentX = 0;

  function measure(){ w = root.getBoundingClientRect().width; go(idx, false); }
  function renderDots(){
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.className = "dot" + (i===idx ? " is-on" : "");
      d.type = "button";
      d.addEventListener("click", ()=> go(i));
      dotsWrap.appendChild(d);
    });
  }
  function go(i, animate=true){
    idx = (i + slides.length) % slides.length;
    track.style.transition = animate ? "transform .42s cubic-bezier(.2,.85,.2,1)" : "none";
    track.style.transform = `translateX(${-idx * w}px)`;
    renderDots();
    if(!animate) requestAnimationFrame(()=> track.style.transition = "transform .42s cubic-bezier(.2,.85,.2,1)");
  }
  function next(){ go(idx+1); }
  function prev(){ go(idx-1); }
  function stopAuto(){ if(timer) clearInterval(timer); timer=null; }
  function startAuto(){ stopAuto(); timer = setInterval(()=>{ if(!dragging) next(); }, 4200); }

  btnPrev.addEventListener("click", ()=>{ stopAuto(); prev(); startAuto(); });
  btnNext.addEventListener("click", ()=>{ stopAuto(); next(); startAuto(); });

  track.addEventListener("touchstart", (e)=>{
    dragging = true; stopAuto();
    startX = e.touches[0].clientX; currentX = startX;
    track.style.transition = "none";
  }, {passive:true});

  track.addEventListener("touchmove", (e)=>{
    if(!dragging) return;
    currentX = e.touches[0].clientX;
    const dx = currentX - startX;
    track.style.transform = `translateX(${(-idx*w)+dx}px)`;
  }, {passive:true});

  track.addEventListener("touchend", ()=>{
    if(!dragging) return;
    dragging = false;
    const dx = currentX - startX;
    const threshold = Math.min(90, w*0.18);
    track.style.transition = "transform .42s cubic-bezier(.2,.85,.2,1)";
    if(dx > threshold) prev();
    else if(dx < -threshold) next();
    else go(idx);
    startAuto();
  });

  window.addEventListener("resize", measure);

  renderDots();
  measure();
  startAuto();
})();

// ===== Toast =====
const toast = document.getElementById("toast");
let toastTimer = null;
function showToast(msg="已複製 ✅"){
  toast.textContent = msg;
  toast.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove("on"), 1600);
}

// ===== Order calc + copy =====
const qtyEl = document.getElementById("qty");
const priceEl = document.getElementById("price");
const freeEl = document.getElementById("freePacks");
const shipEl = document.getElementById("shipFee");
const grandEl = document.getElementById("grand");
const noteEl = document.getElementById("grandNote");

const orderNoEl = document.getElementById("orderNo");
const createdAtEl = document.getElementById("createdAt");

const nameEl = document.getElementById("name");
const phoneEl = document.getElementById("phone");
const storeEl = document.getElementById("store");
const contactEl = document.getElementById("contact");
const contactIdEl = document.getElementById("contactId");
const noteMsgEl = document.getElementById("note");
const previewEl = document.getElementById("preview");

function n(v){ const x = Number(v); return Number.isFinite(x) ? x : 0; }
function fmt(v){ return "NT$" + Math.round(v).toLocaleString("zh-Hant-TW"); }

function pad2(x){ return String(x).padStart(2,"0"); }
function nowLocal(){
  const d = new Date();
  const y = d.getFullYear();
  const m = pad2(d.getMonth()+1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return { d, text: `${y}-${m}-${dd} ${hh}:${mm}:${ss}`, key: `${y}${m}${dd}${hh}${mm}${ss}` };
}

// ✅ 訂單編號
function genOrderNo(){
  const t = nowLocal();
  const rnd = Math.floor(Math.random()*1000);
  const r3 = String(rnd).padStart(3,"0");
  return `JLY-${t.key}-${r3}`;
}

function calc(){
  const qty = Math.max(1, Math.floor(n(qtyEl.value)));
  const price = UNIT_PRICE;
  priceEl.value = String(price);

  const free = Math.floor(qty / 10);
  const product = qty * price;

  let ship = SHIP_FEE;
  if(product >= FREE_SHIP_AT) ship = 0;

  const grand = product + ship;

  freeEl.textContent = `${free} 包`;
  shipEl.textContent = ship === 0 ? "免運" : fmt(ship);
  grandEl.textContent = fmt(grand);
  noteEl.textContent = `（商品 ${fmt(product)} + 運費 ${ship===0 ? "NT$0" : fmt(ship)}）`;

  return { qty, price, free, product, ship, grand };
}

function buildMessage(){
  const c = calc();
  const storeLine = `7-11門市：${(storeEl.value || "（請填門市名稱）")}`;
  const contactText = contactEl.value;
  const contactId = contactIdEl.value || "9.12lin";

  const msg =
`【吉祥滷意 下單資料】
訂單編號：${orderNoEl.value}
建立時間：${createdAtEl.value}

姓名：${nameEl.value || "（未填）"}
電話：${phoneEl.value || "（未填）"}
取貨方式：7-11 冷凍店到店
${storeLine}

訂購：${c.qty} 包（買十送一：${c.free} 包）
單價：${fmt(c.price)} / 包
商品小計：${fmt(c.product)}
運費：${c.ship===0 ? "免運（滿1800）" : fmt(c.ship)}
合計：${fmt(c.grand)}

聯絡方式：${contactText}｜${contactId}
備註：${noteMsgEl.value || "—"}

請協助確認訂單，謝謝！`;

  previewEl.textContent = msg;
  return msg;
}

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    showToast("已複製 ✅");
  }catch(e){
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("已複製 ✅");
  }
}

// ✅ LINE：預填訊息
function openLineWithMessage(text){
  const encoded = encodeURIComponent(text);
  const urlHttps = `https://line.me/R/msg/text/?${encoded}`;
  const urlScheme = `line://msg/text/${encoded}`;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if(isMobile){
    window.location.href = urlScheme;
    setTimeout(()=>{ window.location.href = urlHttps; }, 450);
  }else{
    window.open(urlHttps, "_blank", "noopener");
  }
}

// ✅ LINE：加好友（ID: chris770912）
function openLineAddFriend(){
  const https = `https://line.me/ti/p/~${LINE_ID}`;
  const scheme = `line://ti/p/~${LINE_ID}`;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if(isMobile){
    window.location.href = scheme;
    setTimeout(()=>{ window.location.href = https; }, 450);
  }else{
    window.open(https, "_blank", "noopener");
  }
}

// ===== Buttons =====
document.getElementById("copyOrder")?.addEventListener("click", async ()=>{
  const msg = buildMessage();
  await copyText(msg);
});

document.getElementById("copyPay")?.addEventListener("click", async ()=>{
  const pay =
`【匯款資訊】
中國信託 (822)
帳號：668540149274

匯款後請回傳：金額＋末五碼＋姓名
LINE：${LINE_ID}`;
  await copyText(pay);
});

// ✅ LINE 下單 / 詢問（預填）
function bindLineAsk(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.addEventListener("click", (e)=>{
    e.preventDefault();
    const msg = buildMessage();
    openLineWithMessage(msg);
  });
}
bindLineAsk("lineAskTop");
document.getElementById("lineAskBtn")?.addEventListener("click", ()=>{
  const msg = buildMessage();
  openLineWithMessage(msg);
});

// ✅ Top 加好友
document.getElementById("lineAddTop")?.addEventListener("click", (e)=>{
  // 保留原本可開新分頁的行為；但在手機可更快切 LINE
  e.preventDefault();
  openLineAddFriend();
});

// ✅ 右下角浮動客服泡泡
document.getElementById("lineFab")?.addEventListener("click", ()=>{
  openLineAddFriend();
  showToast("已開啟 LINE 客服 ✅");
});

// Input update preview
const inputs = [qtyEl, nameEl, phoneEl, storeEl, contactEl, contactIdEl, noteMsgEl].filter(Boolean);
inputs.forEach(el => el.addEventListener("input", buildMessage));

// init：訂單號與時間
(function initOrderMeta(){
  const t = nowLocal();
  if(createdAtEl) createdAtEl.value = t.text;
  if(orderNoEl) orderNoEl.value = genOrderNo();
})();

calc(); buildMessage();