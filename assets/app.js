(function () {

  // ===== HERO slider =====
  function initHero() {
    const wrap = document.querySelector("[data-hero]");
    if (!wrap) return;

    const slides = Array.from(wrap.querySelectorAll(".hero-slide"));
    const btnL = wrap.querySelector(".hero-arrow.left");
    const btnR = wrap.querySelector(".hero-arrow.right");
    let idx = 0;

    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("is-on", k === idx));
    }
    btnL?.addEventListener("click", () => show(idx - 1));
    btnR?.addEventListener("click", () => show(idx + 1));

    // auto
    setInterval(() => show(idx + 1), 4500);
  }

  // ===== Tabs =====
  function initTabs() {
    const root = document.querySelector("[data-tabs]");
    if (!root) return;

    const tabs = Array.from(root.querySelectorAll(".tab[data-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-panel]"));

    function select(id) {
      tabs.forEach((t) => {
        const isOn = t.dataset.tab === id;
        t.setAttribute("aria-selected", isOn ? "true" : "false");
      });
      panels.forEach((p) => {
        p.classList.toggle("hide", p.dataset.panel !== id);
      });
    }

    tabs.forEach((t) => t.addEventListener("click", () => select(t.dataset.tab)));

    // default
    select(tabs[0]?.dataset.tab || "product");

    // expose
    window.selectHomeTab = function (id) {
      const target = document.getElementById("tabsBlock");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      select(id);
    };
  }

  // ===== Order form submit (front-only demo) =====
  function initOrder() {
    const formWrap = document.querySelector("[data-order-form]");
    const form = formWrap?.querySelector("form");
    if (!form) return;

    const success = document.querySelector("[data-order-success]");
    const summary = document.querySelector("[data-order-summary]");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const fd = new FormData(form);
      const qty = Math.max(1, Number(fd.get("qty") || 1));
      const name = String(fd.get("name") || "").trim();
      const phone = String(fd.get("phone") || "").trim();
      const note = String(fd.get("note") || "").trim();

      const pricePer = 200; // 可改
      const ship = 150;
      const subtotal = qty * pricePer;

      const free = Math.floor(qty / 10); // 買十送一
      const freeShip = subtotal >= 1800;
      const shipping = freeShip ? 0 : ship;
      const total = subtotal + shipping;

      summary.innerHTML = `
        <div class="panel">
          <h3>✅ 下單成功（請依照下方步驟完成）</h3>
          <p class="muted" style="line-height:1.7;">
            訂購人：${name || "（未填）"}<br/>
            電話：${phone || "（未填）"}<br/>
            數量：${qty} 包（買十送一：送 ${free} 包）<br/>
            小計：NT$ ${subtotal}<br/>
            運費：NT$ ${shipping} ${freeShip ? "（滿 NT$1800 免運）" : ""}<br/>
            <b style="color:#b5122b;">應付總額：NT$ ${total}</b><br/>
            備註：${note || "（無）"}
          </p>
        </div>

        <div class="panel">
          <h3>🏦 匯款資訊</h3>
          <p class="muted" style="line-height:1.7;">
            中國信託 (822)<br/>
            帳號：668540149274
          </p>
        </div>

        <div class="panel">
          <h3>🧊 下一步：填 7-11 取貨門市</h3>
          <p class="muted" style="line-height:1.7;">
            1）先完成匯款<br/>
            2）再到 7-11 交貨便系統填「取貨門市」<br/>
            3）把門市名稱＋店號回傳給小編/LINE：0985-210-319
          </p>
          <div class="cta-row" style="margin-top:10px;">
            <a class="btn primary" href="./guide-711.html">📷 看教學：怎麼填門市</a>
            <a class="btn" href="./index.html">🏠 回首頁</a>
          </div>
        </div>

        <div class="panel">
          <h3>⏳ 出貨時間</h3>
          <p class="muted">因無囤貨：下單匯款後約 1～2 週準備並寄出。</p>
        </div>
      `;

      formWrap.classList.add("hide");
      success.classList.remove("hide");
      success.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHero();
    initTabs();
    initOrder();
  });
})();