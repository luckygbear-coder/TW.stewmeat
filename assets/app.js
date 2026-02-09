// ✅ PWA SW（保留）
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}

// ===== 固定單價 =====
const UNIT_PRICE = 180;

// ✅ 運費規則（129 / 滿1800免運）
const SHIP_FEE = 129;
const FREE_SHIP_AT = 1800;

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

// ✅ LINE：預填訊息（送入 LINE 對話框）
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
  const id = "chris770912";
  const urlHttps = `https://line.me/ti/p/~${id}`;
  const urlScheme = `line://ti/p/~${id}`;
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

  // ===== Order calc + copy =====
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

  function buildMessage(){
    const c = calc();
    const storeLine = `7-11門市：${(storeEl?.value || "（請填門市名稱）")}`;

    const contactText = contactEl?.value || "LINE";
    const contactId = contactIdEl?.value || "9.12lin";

    const msg =
`【吉祥滷意 下單資料】
訂單編號：${orderNoEl?.value || ""}
建立時間：${createdAtEl?.value || ""}

姓名：${nameEl?.value || "（未填）"}
電話：${phoneEl?.value || "（未填）"}
取貨方式：7-11 冷凍店到店
${storeLine}

訂購：${c.qty} 包（買十送一：${c.free} 包）
單價：${fmt(c.price)} / 包
商品小計：${fmt(c.product)}
運費：${c.ship===0 ? "免運（滿1800）" : fmt(c.ship)}
合計：${fmt(c.grand)}

聯絡方式：${contactText}｜${contactId}
備註：${noteMsgEl?.value || "—"}

請協助確認訂單，謝謝！`;

    if(previewEl) previewEl.textContent = msg;
    return msg;
  }

  // ✅ 客服詢問訊息（#lineService + #lineFloat 會用）
  function buildInquiryMessage(){
    const name = (nameEl?.value || "").trim();
    const phone = (phoneEl?.value || "").trim();
    const hint = (name || phone) ? `（${name || "未填姓名"} / ${phone || "未填電話"}）` : "";

    return (
`【吉祥滷意｜客服詢問】
你好～我想詢問商品/下單相關問題 ${hint}

想問的內容：
（請在這裡輸入你的問題，例如：到貨時間、門市填寫、付款方式…）

謝謝！`
    );
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

  $("#copyOrder")?.addEventListener("click", async ()=>{
    const msg = buildMessage();
    await copyText(msg);
  });

  $("#copyPay")?.addEventListener("click", async ()=>{
const pay =
`【匯款資訊】
郵局 (700)
帳號：00018330440573

匯款後請回傳：金額＋末五碼＋姓名
LINE：chris770912`;
    await copyText(pay);
  });

  // ✅ badge：設定數字（不改 HTML，靠 data-badge）
  const floatEl = $("#lineFloat");
  function setLineBadge(count){
    if(!floatEl) return;
    const c = Math.max(0, Math.floor(n(count)));
    if(c <= 0){
      floatEl.removeAttribute("data-badge");
      floatEl.classList.remove("is-pulse");
    }else{
      floatEl.setAttribute("data-badge", String(c > 99 ? "99+" : c));
      floatEl.classList.add("is-pulse");
    }
  }

  // ✅ 一開始先給「引誘人點擊」的未讀數字（你可改 1/3/7）
  setLineBadge(3);

  function bindLinePrefill(id){
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener("click", (e)=>{
      e.preventDefault();
      const msg = buildMessage();
      openLineWithMessage(msg);
      // 點了就把 badge 減少（可刪掉這行，若你想一直顯示）
      setLineBadge(0);
    });
  }

  // ✅ 原本兩顆 LINE（上方/送出）保留「預填訂單訊息」
  bindLinePrefill("lineTop");
  bindLinePrefill("lineSend");

  // ✅ LINE 下單 / 詢問（#lineOrderAsk）＝自動帶訂單訊息進 LINE
  $("#lineOrderAsk")?.addEventListener("click", (e)=>{
    e?.preventDefault?.();
    const msg = buildMessage();
    openLineWithMessage(msg);
    setLineBadge(0);
  });

  // ✅ 加 LINE 快速下單（#lineAddFast）＝加好友
  $("#lineAddFast")?.addEventListener("click", (e)=>{
    e.preventDefault();
    openLineAddFriend();
  });

  // ✅ 客服 LINE（#lineService）與右下角泡泡（#lineFloat）＝自動帶「詢問訊息」進 LINE
  function bindInquiryPrefill(id){
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener("click", (e)=>{
      e.preventDefault();
      const msg = buildInquiryMessage();
      openLineWithMessage(msg);
      setLineBadge(0);
    });
  }
  bindInquiryPrefill("lineService");
  bindInquiryPrefill("lineFloat");

  // inputs live preview
  const inputs = [qtyEl, nameEl, phoneEl, storeEl, contactEl, contactIdEl, noteMsgEl].filter(Boolean);
  inputs.forEach(el => el.addEventListener("input", buildMessage));

  // init：訂單號與時間
  (function initOrderMeta(){
    const t = nowLocal();
    if(createdAtEl) createdAtEl.value = t.text;
    if(orderNoEl) orderNoEl.value = genOrderNo();
  })();

  calc();
  buildMessage();
});