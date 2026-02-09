// ✅ PWA SW（保留）
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}

// ===== 固定單價 =====
const UNIT_PRICE = 180;

// ✅ 運費規則（129 / 滿1800免運）
const SHIP_FEE = 129;
const FREE_SHIP_AT = 1800;

// ✅ 郵局帳號（只複製這串）
const POST_ACCOUNT = "00018330440573";

// ✅ 圖片路徑（不裁切輪播）
const IMAGES = [
  "images/photo1.jpg",
  "images/photo2.jpg",
  "images/photo3.jpg",
  "images/packs.jpg",
  "images/set.jpg",
  "images/spread.jpg",
  "images/bowl.jpg"
];

// ✅ LINE ID
const LINE_ID = "chris770912";

function $(sel){ return document.querySelector(sel); }
function $all(sel){ return Array.from(document.querySelectorAll(sel)); }

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

// ✅ LINE：預填訊息（訂單/詢問）
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

// ✅ LINE：加好友（導向加好友畫面）
function openLineAddFriend(){
  const urlHttps = `https://line.me/ti/p/~${LINE_ID}`;
  const urlScheme = `line://ti/p/~${LINE_ID}`;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if(isMobile){
    window.location.href = urlScheme;
    setTimeout(()=>{ window.location.href = urlHttps; }, 450);
  }else{
    window.open(urlHttps, "_blank", "noopener");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // ===== Tabs =====
  const tabs = $all(".tab[data-tab]");
  const panels = $all("[data-panel]");

  function setTab(id){
    tabs.forEach(t => t.setAttribute("aria-selected", t.dataset.tab === id ? "true" : "false"));
    panels.forEach(p => p.classList.toggle("hide", p.dataset.panel !== id));
  }

  tabs.forEach(t => t.addEventListener("click", () => setTab(t.dataset.tab)));
  window.selectTab = function(id){
    const tabsEl = $("#tabs");
    if(tabsEl) tabsEl.scrollIntoView({behavior:"smooth", block:"start"});
    setTab(id);
  };

  // ===== Carousel =====
  (function initCarousel(){
    const root = document.querySelector("[data-carousel]");
    if(!root) return;

    const track = root.querySelector("[data-track]");
    const dotsWrap = root.querySelector("[data-dots]");
    const btnPrev = root.querySelector("[data-prev]");
    const btnNext = root.querySelector("[data-next]");

    if(!track || !dotsWrap) return;

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

    btnPrev?.addEventListener("click", ()=>{ stopAuto(); prev(); startAuto(); });
    btnNext?.addEventListener("click", ()=>{ stopAuto(); next(); startAuto(); });

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
  const toast = $("#toast");
  let toastTimer = null;
  function showToast(msg="已複製 ✅"){
    if(!toast) return;
    toast.textContent = msg;
    toast.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toast.classList.remove("on"), 1600);
  }

  // ===== Order calc + preview =====
  const qtyEl = $("#qty");
  const priceEl = $("#price");
  const freeEl = $("#freePacks");
  const shipEl = $("#shipFee");
  const grandEl = $("#grand");
  const noteEl = $("#grandNote");

  const orderNoEl = $("#orderNo");
  const createdAtEl = $("#createdAt");

  const nameEl = $("#name");
  const phoneEl = $("#phone");
  const storeEl = $("#store");
  const contactEl = $("#contact");
  const contactIdEl = $("#contactId");
  const noteMsgEl = $("#note");
  const previewEl = $("#preview");

  function calc(){
    const qty = Math.max(1, Math.floor(n(qtyEl?.value)));
    const price = UNIT_PRICE;
    if(priceEl) priceEl.value = String(price);

    const free = Math.floor(qty / 10);
    const product = qty * price;

    let ship = SHIP_FEE;
    if(product >= FREE_SHIP_AT) ship = 0;

    const grand = product + ship;

    if(freeEl) freeEl.textContent = `${free} 包`;
    if(shipEl) shipEl.textContent = ship === 0 ? "免運" : fmt(ship);
    if(grandEl) grandEl.textContent = fmt(grand);
    if(noteEl) noteEl.textContent = `（商品 ${fmt(product)} + 運費 ${ship===0 ? "NT$0" : fmt(ship)}）`;

    return { qty, price, free, product, ship, grand };
  }

  function buildOrderMessage(){
    const c = calc();
    const storeLine = `7-11門市：${(storeEl?.value || "（請填門市名稱）")}`;

    const contactText = contactEl?.value || "LINE";
    const contactId = contactIdEl?.value || "9.12lin";

    const msg =
`【吉祥滷意 下單資料】
訂單編號：${orderNoEl?.value || ""}
建立時間：${createdAtEl?.value || ""}

取件人姓名：${nameEl?.value || "（未填）"}
聯絡電話：${phoneEl?.value || "（未填）"}
寄送方式：7-11 冷凍店到店
${storeLine}

訂購：${c.qty} 包（買十送一：${c.free} 包）
單價：${fmt(c.price)} / 包
商品小計：${fmt(c.product)}
運費：${c.ship===0 ? "免運（滿1800）" : fmt(c.ship)}
合計：${fmt(c.grand)}

方便聯絡：${contactText}｜${contactId}
備註：${noteMsgEl?.value || "—"}

我已付款，請協助確認訂單，謝謝！`;

    if(previewEl) previewEl.textContent = msg;
    return msg;
  }

  async function copyText(text, toastMsg="已複製 ✅"){
    try{
      await navigator.clipboard.writeText(text);
      showToast(toastMsg);
    }catch(e){
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast(toastMsg);
    }
  }

  // ✅ 一鍵複製下單訊息（保留）
  $("#copyOrder")?.addEventListener("click", async ()=>{
    const msg = buildOrderMessage();
    await copyText(msg, "已複製下單訊息 ✅");
  });

  // ✅ 一鍵複製郵局帳號（只複製數字）
  $("#copyPay")?.addEventListener("click", async ()=>{
    await copyText(POST_ACCOUNT, "已複製郵局帳號 ✅");
  });

  // ✅ 用 LINE 送出訂單：帶入「訂單訊息」
  function bindLineSendOrder(id){
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener("click", (e)=>{
      e.preventDefault();
      const msg = buildOrderMessage();
      openLineWithMessage(msg);
    });
  }
  bindLineSendOrder("lineSend");
  bindLineSendOrder("lineService"); // 你現在的「用LINE送出訂單」在 LINE 快速服務區

  // ✅ 加好友入口：導向加好友（客服對話）
  function bindLineAddFriend(id){
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener("click", (e)=>{
      e.preventDefault();
      openLineAddFriend();
    });
  }
  bindLineAddFriend("lineTop");     // topbar LINE
  bindLineAddFriend("lineAddFast"); // 客服LINE
  bindLineAddFriend("lineFloat");   // 右下角泡泡（你指定：按了就到加好友）

  // inputs live preview
  const inputs = [qtyEl, nameEl, phoneEl, storeEl, contactEl, contactIdEl, noteMsgEl].filter(Boolean);
  inputs.forEach(el => el.addEventListener("input", buildOrderMessage));

  // init：訂單號與時間
  (function initOrderMeta(){
    const t = nowLocal();
    if(createdAtEl) createdAtEl.value = t.text;
    if(orderNoEl) orderNoEl.value = genOrderNo();
  })();

  calc();
  buildOrderMessage();
});