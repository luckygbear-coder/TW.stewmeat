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
  "images/photo3.jpg",
  "images/packs.jpg",
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
  bindLineSendOrder("lineService"); // LINE 快速服務區：用LINE送出訂單

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
  bindLineAddFriend("lineFloat");   // 右下角泡泡：加好友

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

  // ===== 熱絡留言板（五星＋留言｜分頁 reviews）=====
  (function initReviews(){
    const listEl = document.getElementById("reviewList");
    const summaryEl = document.getElementById("reviewSummary");
    const refreshBtn = document.getElementById("refreshReviews");
    const rNameEl = document.getElementById("reviewName");
    const rStarsEl = document.getElementById("reviewStars");
    const rTextEl = document.getElementById("reviewText");
    const submitBtn = document.getElementById("submitReview");
    const clearBtn = document.getElementById("clearMyReviews");
    if(!listEl || !summaryEl) return;

    const LS_KEY = "jly_reviews_v1";

    // 30 組預設暱稱＋留言（台味×溫暖×一點幽默）
    const SEED = [
      {name:"阿嬤說可以", stars:5, text:"這滷汁一打開，家裡瞬間像過年。\n我阿嬤說：嗯～有中！"},
      {name:"便當界小白", stars:5, text:"我只會煮水…結果拌飯也能上桌。\n謝謝吉祥滷意救了我。"},
      {name:"台味收藏家", stars:5, text:"香到我家白飯自己站起來排隊。"},
      {name:"加班社畜", stars:5, text:"加班到懷疑人生，淋下去立刻相信台灣。"},
      {name:"德東門市王", stars:5, text:"7-11 取貨很方便，回家 5 分鐘就有滷肉飯。\n太犯規。"},
      {name:"小鳥胃也投降", stars:5, text:"本來說吃兩口…結果整碗見底。\n我對不起我的意志力。"},
      {name:"廚房逃兵", stars:5, text:"不用進廚房熱到中暑，還能假裝很會煮。\n完美。"},
      {name:"白飯大師", stars:5, text:"白飯遇到它，直接升級成主角。"},
      {name:"露營派", stars:5, text:"露營帶一包，朋友以為我請了主廚。\n我只負責打開…"},
      {name:"滷蛋教", stars:5, text:"配滷蛋超搭，香氣很乾淨。\n吃完嘴巴會想唱歌。"},
      {name:"吃貨小隊長", stars:5, text:"一包搞定不是口號。\n我連碗都省了（直接拌）。"},
      {name:"台北媽媽", stars:5, text:"小孩說：今天的飯怎麼比較乖？\n我：因為有吉祥滷意。"},
      {name:"夜貓子", stars:5, text:"半夜肚子餓不用叫外送。\n熱一下就能睡回去。"},
      {name:"香氣控", stars:5, text:"打開那瞬間我就知道：完了我會上癮。"},
      {name:"飯桶本人", stars:5, text:"淋下去，白飯直接變得很有禮貌。\n一直讓我再來一口。"},
      {name:"微波派", stars:5, text:"微波也香，救急神物。\n我願稱它為便當守護神。"},
      {name:"拌麵研究員", stars:5, text:"麵一拌開，童年麵攤味道回來了。\n好想再加一顆蛋。"},
      {name:"青菜被安撫", stars:5, text:"青菜終於不用硬吃。\n加一匙就『喔～可以耶』。"},
      {name:"外食減脂人", stars:5, text:"想吃台味又怕踩雷？\n這包很穩。"},
      {name:"露營裝備王", stars:5, text:"只帶這包就夠。\n朋友說我很會煮…我笑而不語。"},
      {name:"隔水派代表", stars:5, text:"隔水加熱最香。\n香到鄰居以為我在辦桌。"},
      {name:"便當回憶殺", stars:5, text:"像以前便當店的滷肉香。\n我直接多煮兩碗飯。"},
      {name:"台味哲學家", stars:5, text:"人生很苦，滷肉很甜。\n先吃飯再說。"},
      {name:"省時王者", stars:5, text:"從肚子餓到開吃，不用十分鐘。\n太懂忙碌的人了。"},
      {name:"拜飯教信徒", stars:5, text:"白飯配它，我願意每天上供。"},
      {name:"小資上班族", stars:5, text:"一包撐起一餐的幸福感。\n錢包跟胃都滿意。"},
      {name:"家庭晚餐救星", stars:5, text:"今天不想煮又想像有煮。\n它就是答案。"},
      {name:"滷汁守門員", stars:5, text:"冰箱必備。\n沒有它我會慌。"},
      {name:"台灣魂", stars:5, text:"這味道很台。\n台到我想配一段台語旁白。"},
      {name:"飯後微笑", stars:5, text:"吃完會不自覺笑一下。\n很奇怪但是真的。"}
    ];

    function escapeHtml(s){
      return String(s)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
    }

    function loadMine(){
      try{
        const raw = localStorage.getItem(LS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      }catch(e){
        return [];
      }
    }
    function saveMine(arr){
      localStorage.setItem(LS_KEY, JSON.stringify(arr));
    }

    function pad2r(x){ return String(x).padStart(2,"0"); }
    function fmtTime(d){
      return `${d.getFullYear()}-${pad2r(d.getMonth()+1)}-${pad2r(d.getDate())} ${pad2r(d.getHours())}:${pad2r(d.getMinutes())}`;
    }

    // 每一篇時間都不同：以「現在」回推 5 分鐘～48 小時，並確保分鐘級不重複
    function makeUniqueTimes(count){
      const now = Date.now();
      const used = new Set();
      const out = [];
      while(out.length < count){
        const backMin = 5 + Math.floor(Math.random() * ((48*60) - 5));
        const t = now - backMin * 60 * 1000;
        const key = Math.floor(t / (60*1000)); // minute key
        if(used.has(key)) continue;
        used.add(key);
        out.push(new Date(t));
      }
      out.sort((a,b)=> b.getTime() - a.getTime()); // 新到舊
      return out;
    }

    function starsText(n){
      const s = Math.max(1, Math.min(5, n|0));
      return "★★★★★".slice(0,s) + "☆☆☆☆☆".slice(0,5-s);
    }

    function pickN(all, n){
      const pool = all.slice();
      for(let i = pool.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, n);
    }

    function render(){
      const mine = loadMine();
      const all = [...mine, ...SEED];

      const featured = pickN(all, 5);
      const times = makeUniqueTimes(featured.length);

      const avg = featured.reduce((sum, r)=> sum + (r.stars || 5), 0) / featured.length;
      summaryEl.textContent = `${avg.toFixed(1)} ｜ 今日精選 5 則`;

      listEl.innerHTML = featured.map((r, idx)=>`
        <div class="review-item">
          <div class="review-meta">
            <div class="review-name">${escapeHtml(r.name || "匿名")}</div>
            <div class="review-time">${fmtTime(times[idx])}</div>
          </div>
          <div class="review-stars">${starsText(r.stars || 5)}</div>
          <div class="review-text">${escapeHtml(r.text || "")}</div>
        </div>
      `).join("");
    }

    refreshBtn?.addEventListener("click", render);

    submitBtn?.addEventListener("click", ()=>{
      const name = (rNameEl?.value || "").trim().slice(0,12) || "匿名";
      const stars = Math.max(1, Math.min(5, parseInt(rStarsEl?.value || "5", 10)));
      const text = (rTextEl?.value || "").trim().slice(0,90);

      if(!text){
        showToast("請先寫一句留言再送出 🙏");
        return;
      }

      const mine = loadMine();
      mine.unshift({ name, stars, text });
      saveMine(mine.slice(0,60)); // 最多保留 60 則

      if(rTextEl) rTextEl.value = "";
      showToast("留言已送出 ✅");
      render();
    });

    clearBtn?.addEventListener("click", ()=>{
      localStorage.removeItem(LS_KEY);
      showToast("已清除本機留言 ✅");
      render();
    });

    // 看起來更熱絡：每 45 秒自動換一批
    setInterval(render, 45000);

    render();
  })();
});