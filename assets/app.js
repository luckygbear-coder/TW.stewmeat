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

  // ===== 熱絡留言板（五星＋留言） =====
  (function initReviews(){
    const listEl = document.getElementById("reviewList");
    const summaryEl = document.getElementById("reviewSummary");
    const refreshBtn = document.getElementById("refreshReviews");
    if(!listEl || !summaryEl) return;

    // 30 組暱稱＋留言（台味×溫暖×一點幽默）
    const REVIEWS = [
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
      {name:"吃貨小隊長", stars:5, text:"一包搞定真的不是口號。\n我連碗都省了（直接拌）。"},
      {name:"台北媽媽", stars:5, text:"小孩說：今天的飯怎麼比較乖？\n我：因為有吉祥滷意。"},
      {name:"夜貓子", stars:5, text:"半夜肚子餓不用叫外送。\n這包比較懂我。"},
      {name:"阿公認證", stars:5, text:"阿公吃一口點頭：有古早味。\n我立刻續碗。"},
      {name:"會心一笑", stars:5, text:"香氣不是那種很兇的，是溫柔抱著你的那種。"},
      {name:"滷肉飯研究所", stars:5, text:"鹹甜平衡很剛好，吃完不膩。\n有水準。"},
      {name:"怕油星人", stars:5, text:"我很怕油，但這個不會怕。\n吃起來很順。"},
      {name:"小資族", stars:5, text:"一包 180 我覺得划算。\n比我亂買宵夜還值得。"},
      {name:"祖傳胃", stars:5, text:"這味道像小時候巷口那家。\n一秒回到童年。"},
      {name:"好想再來", stars:5, text:"我本來只想試試…現在在算要湊免運。"},
      {name:"香氣控", stars:5, text:"打開那瞬間我就知道：完了我會上癮。"},
      {name:"懶人代表", stars:5, text:"我只負責加熱，剩下都交給它。\n人生突然很簡單。"},
      {name:"飯桶本人", stars:5, text:"淋下去，白飯直接變得很有禮貌。\n一直讓我再來一口。"},
      {name:"配菜派", stars:5, text:"燙青菜淋一下就變高級。\n我媽以為我進修了。"},
      {name:"台味粉", stars:5, text:"不是那種死甜，是真的台味。\n懂吃的會懂。"},
      {name:"回購王", stars:5, text:"第二次買了，味道一樣穩。\n這點很重要。"},
      {name:"微波派", stars:5, text:"微波也香，救急神物。\n我願稱它為便當守護神。"},
      {name:"親友推薦", stars:5, text:"朋友推薦的，果然沒騙我。\n我也要去騙…不是，推薦別人。"},
      {name:"幸福感", stars:5, text:"吃完心情真的會變好。\n台味就是溫暖。"},
      {name:"過年嘴饞", stars:5, text:"年味感很足，配一碗白飯就滿足。\n吉祥到我想貼春聯。"}
    ];

    function nowText(){
      const d = new Date();
      return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    }

    // 每天固定選 5 則：用日期做 seed
    function daySeed(){
      const d = new Date();
      return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
    }

    function xmur3(str){
      let h = 1779033703 ^ str.length;
      for(let i=0;i<str.length;i++){
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
      }
      return function(){
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
      };
    }
    function mulberry32(a){
      return function(){
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    function shuffleWithSeed(arr, seedStr){
      const seedFn = xmur3(seedStr);
      const rand = mulberry32(seedFn());
      const a = arr.slice();
      for(let i=a.length-1;i>0;i--){
        const j = Math.floor(rand() * (i+1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function starsHtml(nStars){
      let s = `<span class="stars" aria-label="${nStars} 星">`;
      for(let i=1;i<=5;i++){
        s += `<span class="${i<=nStars ? "star-on":"star-off"}">★</span>`;
      }
      s += `</span>`;
      return s;
    }

    let pool = [];
    let shown = [];
    let rotateTimer = null;

    function render(){
      const avg = (shown.reduce((a,b)=>a+b.stars,0) / shown.length) || 5;
      summaryEl.innerHTML = `${starsHtml(Math.round(avg))} <b>${avg.toFixed(1)}</b>｜今日精選 <b>${shown.length}</b> 則`;

      listEl.innerHTML = shown.map(r => `
        <div class="review-item review-pop">
          <div class="review-top">
            <div>
              <div class="review-name">${r.name}</div>
              ${starsHtml(r.stars)}
            </div>
            <div class="review-time">${r.time}</div>
          </div>
          <div class="review-text">${r.text}</div>
        </div>
      `).join("");

      requestAnimationFrame(()=>{
        listEl.querySelectorAll(".review-item").forEach(el=>el.classList.remove("review-pop"));
      });
    }

    function pickToday(){
      pool = shuffleWithSeed(REVIEWS, daySeed());
      shown = pool.slice(0,5).map(x => ({...x, time: nowText()}));
      render();
      startRotate();
    }

    function rotateOne(){
      if(!pool.length || shown.length<5) return;
      const next = pool.shift();
      pool.push(next);

      const idx = Math.floor(Math.random()*shown.length);
      shown[idx] = {...next, time: nowText()};
      render();
    }

    function startRotate(){
      if(rotateTimer) clearInterval(rotateTimer);
      rotateTimer = setInterval(rotateOne, 6500); // 6.5 秒換一則
    }

    refreshBtn?.addEventListener("click", ()=>{
      pool = shuffleWithSeed(REVIEWS, daySeed() + "-tap-" + nowText());
      shown = pool.slice(0,5).map(x => ({...x, time: nowText()}));
      render();
      startRotate();
    });

    pickToday();
  })();
});