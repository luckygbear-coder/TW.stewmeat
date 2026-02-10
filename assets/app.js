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
function fmtTime(d){
  const y = d.getFullYear();
  const m = pad2(d.getMonth()+1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  return `${y}-${m}-${dd} ${hh}:${mm}`;
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

// ===== 小工具：安全取亂數 =====
function randInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sample(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
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
    const contactId = (contactIdEl?.value || "9.12lin").trim() || "9.12lin";

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
  bindLineSendOrder("lineService"); // LINE 快速服務區的「用LINE送出訂單」

  // ✅ 加好友入口：導向加好友（客服對話）
  function bindLineAddFriend(id){
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener("click", (e)=>{
      e.preventDefault();
      openLineAddFriend();
    });
  }
  bindLineAddFriend("lineTop");
  bindLineAddFriend("lineAddFast");
  bindLineAddFriend("lineFloat"); // 右下角泡泡 → 加好友畫面

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

  // ==========================
  // ⭐ 熱絡留言板（新分頁：匿名＋骰子暱稱＋真實客人留言(本機)）
  // index.html 需要有：
  // #reviewSummary #refreshReviews #reviewList
  // #anonNick #rollNick
  // #starBtns(內含 data-star="1..5") #reviewStars(隱藏 input)
  // #reviewText #submitReview #clearMyReviews
  // ==========================
  (function initReviews(){
    const listEl = $("#reviewList");
    const summaryEl = $("#reviewSummary");
    const refreshBtn = $("#refreshReviews");
    if(!listEl || !summaryEl) return;

    // ---- 匿名暱稱（骰子生成） ----
    const nickEl = $("#anonNick");
    const rollBtn = $("#rollNick");

    const NICK_A = ["飯桶","滷蛋","香氣","白飯","便當","夜貓","加班","露營","阿嬤","小資","嘴饞","吃貨","台味","快手","電鍋","微波","隔水","排隊","老派","幸福"];
    const NICK_B = ["本人","教主","控","隊長","王","少女","阿姨","叔叔","同學","大師","社畜","勇者","研究員","學徒","守護神","派","先生","小姐","天使","高手"];
    const NICK_C = ["不講武德","只想吃飯","今天有乖","嘴巴想唱歌","白飯站起來","香到暈船","滷汁萬歲","一匙入魂","不用開火","想再來一口","連青菜都愛","拌一拌就好","便當救星","台灣魂開啟","吃到點頭","香氣抱抱","飯都變乖","很有禮貌","心情上線","被香氣收編"];

    function genFunnyNick(){
      const left = sample(NICK_A) + sample(NICK_B);
      const right = sample(NICK_C);
      return `${left}｜${right}`;
    }
    function ensureNick(){
      if(!nickEl) return genFunnyNick();
      const v = (nickEl.value || "").trim();
      if(v) return v;
      const g = genFunnyNick();
      nickEl.value = g;
      return g;
    }
    rollBtn?.addEventListener("click", ()=>{
      if(!nickEl) return;
      nickEl.value = genFunnyNick();
      showToast("已生成暱稱 🎲");
    });

    if(nickEl && !(nickEl.value || "").trim()){
      nickEl.value = genFunnyNick();
    }

    // ---- 星星選擇（金色⭐️）----
    const starsInput = $("#reviewStars");
    const starBtns = $all("#starBtns [data-star]");
    function setStars(v){
      const s = Math.max(1, Math.min(5, Math.floor(n(v))));
      if(starsInput) starsInput.value = String(s);
      starBtns.forEach(btn=>{
        const b = Math.floor(n(btn.dataset.star));
        btn.textContent = b <= s ? "⭐️" : "☆";
        btn.setAttribute("aria-pressed", b <= s ? "true" : "false");
      });
    }
    starBtns.forEach(btn=>{
      btn.addEventListener("click", ()=> setStars(btn.dataset.star));
    });
    setStars(starsInput?.value || 5);

    // ---- 30 組系統預設留言 ----
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
      {name:"吃貨小隊長", stars:5, text:"一包搞定真的不是口號。\n我連碗都省了（直接拌）。"},
      {name:"台北媽媽", stars:5, text:"小孩說：今天的飯怎麼比較乖？\n我：因為有吉祥滷意。"},
      {name:"夜貓子", stars:5, text:"半夜肚子餓不用叫外送。\n滷汁熱一下，心也被照顧到。"},
      {name:"飯桶本人", stars:5, text:"淋下去，白飯直接變得很有禮貌。\n一直讓我再來一口。"},
      {name:"香氣控", stars:5, text:"打開那瞬間我就知道：完了我會上癮。"},
      {name:"微波派", stars:5, text:"微波也香，救急神物。\n我願稱它為便當守護神。"},
      {name:"電鍋派", stars:5, text:"電鍋一按，等它跳起來，幸福也跟著跳起來。"},
      {name:"老派好味", stars:5, text:"是那種『一吃就想起家』的味道。\n很溫柔。"},
      {name:"拌麵研究員", stars:5, text:"拌一拌就很厲害。\n我宣布今晚不外食。"},
      {name:"青菜救援隊", stars:5, text:"青菜本來很無聊，加一匙就變主角。\n謝謝讓我有在吃菜。"},
      {name:"暖胃派", stars:5, text:"天冷的時候來一碗，整個人都被安慰。"},
      {name:"忙碌上班族", stars:5, text:"回家不想煮又想吃好，這包真的太懂我。"},
      {name:"台味信徒", stars:5, text:"醬香很順，不死鹹。\n白飯直接升天。"},
      {name:"媽媽偷懶系", stars:5, text:"我只加熱就被誇：今天煮得很用心。\n我：嗯（點頭）。"},
      {name:"便當回憶", stars:5, text:"一入口就是小時候便當店的味道。\n很可以。"},
      {name:"香氣抱抱", stars:5, text:"香氣真的像抱抱。\n吃完心情也比較乖。"},
      {name:"飯後幸福", stars:5, text:"吃完會有一種『今天過得不錯』的感覺。"},
      {name:"取貨很順", stars:5, text:"7-11 取貨好方便，冰箱放著很安心。\n想吃就來一包。"},
      {name:"家常派", stars:5, text:"不用太多花樣，就是很家常、很耐吃。"},
      {name:"回購預備軍", stars:5, text:"先說好，我不是衝動購物。\n但我會回購。"}
    ];

    // ---- 本機留言存檔 ----
    const LS_KEY = "jly_reviews_v1";
    function loadMy(){
      try{
        const raw = localStorage.getItem(LS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      }catch(e){
        return [];
      }
    }
    function saveMy(arr){
      try{
        localStorage.setItem(LS_KEY, JSON.stringify(arr.slice(0, 80)));
      }catch(e){}
    }

    // ---- 近 72 小時內：產生不重複的分鐘時間 ----
    function makeUniqueTimes(count, hoursBack=72){
      const used = new Set();
      const out = [];
      const now = Date.now();
      const min = now - hoursBack * 3600 * 1000;
      while(out.length < count){
        const t = randInt(min, now);
        const d = new Date(t);
        d.setSeconds(0,0);
        const key = d.getTime();
        if(used.has(key)) continue;
        used.add(key);
        out.push(d);
      }
      out.sort((a,b)=> b.getTime() - a.getTime());
      return out;
    }

    function starsLine(stars){
      const s = Math.max(1, Math.min(5, Math.floor(n(stars))));
      return "⭐️".repeat(s) + "☆".repeat(5 - s);
    }

    function render(items){
      listEl.innerHTML = items.map(r => `
        <div class="li" style="border-radius:18px">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
            <div style="font-weight:1000">${escapeHtml(r.name || "匿名客")}</div>
            <div class="muted" style="font-weight:900;white-space:nowrap">${escapeHtml(r.time || "")}</div>
          </div>
          <div style="margin-top:6px;font-weight:1000;font-size:16px;letter-spacing:.5px">${starsLine(r.stars || 5)}</div>
          <div style="margin-top:8px;white-space:pre-wrap;line-height:1.55;font-weight:900">
            ${escapeHtml(r.text || "")}
          </div>
        </div>
      `).join("");
    }

    function computeAvg(items){
      if(!items.length) return 5.0;
      const sum = items.reduce((a,b)=> a + Math.max(1, Math.min(5, Math.floor(n(b.stars || 5)))), 0);
      return Math.round((sum / items.length) * 10) / 10;
    }

    function buildSeedBatch(){
      const times = makeUniqueTimes(12, 72);
      return shuffle(SEED).slice(0, 12).map((x, i) => ({
        name: x.name,
        stars: x.stars,
        text: x.text,
        time: fmtTime(times[i] || new Date())
      }));
    }

    function pickFive(){
      const myAll = loadMy().slice().reverse();              // 新的在前
      const myPick = shuffle(myAll).slice(0, Math.min(3, myAll.length));
      const need = 5 - myPick.length;

      const seedBatch = buildSeedBatch();
      const seedPick = seedBatch.slice(0, need);

      const merged = (myPick.concat(seedPick)).slice(0,5);

      // 保險：如果 time 重複（同分鐘），微調
      const seen = new Set();
      merged.forEach((it, idx)=>{
        const t = (it.time || "").trim();
        if(!t) return;

        if(seen.has(t)){
          // 往前推 (idx+1)*7~(idx+1)*19 分鐘
          const d = new Date();
          d.setMinutes(d.getMinutes() - randInt((idx+1)*7, (idx+1)*19));
          it.time = fmtTime(d);
        }
        seen.add(it.time);
      });

      // 最後依時間新到舊排序（看起來更真）
      merged.sort((a,b)=> {
        const ta = Date.parse((a.time||"").replace(" ", "T"));
        const tb = Date.parse((b.time||"").replace(" ", "T"));
        return (isFinite(tb)?tb:0) - (isFinite(ta)?ta:0);
      });

      return merged;
    }

    function refresh(){
      const items = pickFive();
      const avg = computeAvg(items);
      summaryEl.textContent = `⭐️⭐️⭐️⭐️⭐️ ${avg.toFixed(1)}｜今日精選 5 則`;
      render(items);
    }

    refreshBtn?.addEventListener("click", ()=>{
      refresh();
      showToast("已換一批留言 ✅");
    });

    // ---- 真實客人留言（匿名）----
    const textEl = $("#reviewText");
    const submitBtn = $("#submitReview");
    const clearBtn = $("#clearMyReviews");

    submitBtn?.addEventListener("click", ()=>{
      const name = ensureNick();
      const stars = Math.max(1, Math.min(5, Math.floor(n(starsInput?.value || 5))));
      const text = (textEl?.value || "").trim();

      if(!text){
        showToast("請先輸入留言內容 ✍️");
        return;
      }
      if(text.length > 140){
        showToast("留言太長了（建議 140 字內）");
        return;
      }

      const item = {
        name,
        stars,
        text,
        time: fmtTime(new Date())
      };

      const arr = loadMy();
      arr.push(item);
      saveMy(arr);

      if(textEl) textEl.value = "";
      if(nickEl) nickEl.value = genFunnyNick(); // 留完自動換一個暱稱
      setStars(5);

      refresh();
      showToast("留言成功 ✅ 謝謝你！");
    });

    clearBtn?.addEventListener("click", ()=>{
      try{ localStorage.removeItem(LS_KEY); }catch(e){}
      refresh();
      showToast("已清除本機留言 🧹");
    });

    // 初始顯示
    refresh();
  })();
});