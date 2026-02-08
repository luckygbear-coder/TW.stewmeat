(function () {
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
        const isOn = p.dataset.panel === id;
        p.classList.toggle("hide", !isOn);
      });
    }

    tabs.forEach((t) => {
      t.addEventListener("click", () => select(t.dataset.tab));
    });

    // default
    const defaultTab = tabs.find(t => t.getAttribute("aria-selected") === "true")?.dataset.tab || "product";
    select(defaultTab);

    // expose
    window.selectHomeTab = function (id) {
      const target = document.getElementById("tabsBlock");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      select(id);
    };
  }

  // ===== Order form submit (demo) =====
  function initOrder() {
    const form = document.querySelector("[data-order-form]");
    if (!form) return;

    const success = document.querySelector("[data-order-success]");
    const summary = document.querySelector("[data-order-summary]");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const fd = new FormData(form);
      const qty = Number(fd.get("qty") || 1);
      const name = String(fd.get("name") || "").trim();
      const phone = String(fd.get("phone") || "").trim();
      const note = String(fd.get("note") || "").trim();

      // pricing
      const pricePer = 200; // 你若要改價格就改這裡
      const ship = 150;
      const subtotal = qty * pricePer;

      // 買十送一：每滿10包送1包（展示用）
      const free = Math.floor(qty / 10);
      const freeShip = subtotal >= 1800;
      const shipping = freeShip ? 0 : ship;
      const total = subtotal + shipping;

      const safe = (s) => s.replace(/[<>&"]/g, (c) => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;", "\"":"&quot;" }[c]));

      summary.innerHTML = `
        <div class="panel">
          <b>✅ 下單成功（請依照下方步驟完成匯款與 7-11 門市填寫）</b>
          <p class="muted" style="margin-top:8px; line-height:1.7;">
            訂購人：${safe(name || "（未填）")}<br/>
            電話：${safe(phone || "（未填）")}<br/>
            數量：${qty} 包（買十送一：送 ${free} 包）<br/>
            小計：NT$ ${subtotal}<br/>
            運費：NT$ ${shipping} ${freeShip ? "（滿 NT$1800 免運）" : ""}<br/>
            <b style="color:#d46b2a;">應付總額：NT$ ${total}</b><br/>
            備註：${safe(note || "（無）")}
          </p>
        </div>

        <div class="panel">
          <b>🏦 匯款資訊</b>
          <p class="muted" style="margin-top:8px; line-height:1.7;">
            中國信託 (822)<br/>
            帳號：668540149274
          </p>
        </div>

        <div class="panel">
          <b>🧊 下一步：7-11 冷凍交貨便填門市</b>
          <p class="muted" style="margin-top:8px; line-height:1.7;">
            1）先完成匯款<br/>
            2）再到 7-11 交貨便系統填「取貨門市」<br/>
            3）把填好的門市資訊回傳給小編/LINE：0985210319
          </p>
          <div class="cta-row" style="margin-top:10px;">
            <a class="btn primary" href="./guide-711.html">📷 看教學：怎麼填門市</a>
            <a class="btn" href="./index.html">🏠 回首頁</a>
          </div>
        </div>

        <div class="panel">
          <b>⏳ 出貨時間</b>
          <p class="muted" style="margin-top:8px; line-height:1.7;">
            因無囤貨：下單匯款後約 1～2 週準備並寄出。
          </p>
        </div>
      `;

      form.classList.add("hide");
      success.classList.remove("hide");
      success.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initOrder();
  });
})();