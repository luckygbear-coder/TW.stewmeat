/* =========================================================
   吉祥滷意｜前端互動邏輯
   - 首頁 Tabs 切換
   - 首頁入口跳轉指定 Tab
   - 下單頁：表單送出 → 成功導引
   ========================================================= */

(function () {

  /* ---------- Tabs ---------- */
  function initTabs() {
    const tabWrap = document.querySelector('[data-tabs]');
    if (!tabWrap) return;

    const tabs = Array.from(tabWrap.querySelectorAll('.tab'));
    const panels = Array.from(document.querySelectorAll('[data-panel]'));

    function activate(tabId) {
      tabs.forEach(t => {
        t.setAttribute('aria-selected', t.dataset.tab === tabId ? 'true' : 'false');
      });
      panels.forEach(p => {
        p.classList.toggle('hide', p.dataset.panel !== tabId);
      });
    }

    tabs.forEach(t => {
      t.addEventListener('click', () => activate(t.dataset.tab));
    });

    // 預設顯示第一個
    activate(tabs[0].dataset.tab);

    // 對外方法（首頁四格入口會用到）
    window.selectHomeTab = function (tabId) {
      const block = document.getElementById('tabsBlock');
      if (block) block.scrollIntoView({ behavior: 'smooth' });
      activate(tabId);
    };
  }

  /* ---------- Order Page ---------- */
  function initOrderForm() {
    const form = document.querySelector('[data-order-form]');
    if (!form) return;

    const success = document.querySelector('[data-order-success]');
    const summary = document.querySelector('[data-order-summary]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const fd = new FormData(form);
      const name = fd.get('name') || '';
      const phone = fd.get('phone') || '';
      const qty = parseInt(fd.get('qty') || '1', 10);
      const note = fd.get('note') || '';

      const PRICE = 200;          // 單包價格（可自行調整）
      const SHIPPING = 150;       // 運費
      const subtotal = qty * PRICE;
      const freeQty = Math.floor(qty / 10);   // 買十送一
      const shippingFee = subtotal >= 1800 ? 0 : SHIPPING;
      const total = subtotal + shippingFee;

      summary.innerHTML = `
        <div class="panel">
          <h3>✅ 下單成功</h3>
          <p class="muted">
            訂購人：${name}<br>
            電話：${phone}<br>
            訂購數量：${qty} 包（贈送 ${freeQty} 包）<br>
            小計：NT$ ${subtotal}<br>
            運費：NT$ ${shippingFee}<br>
            <b>應付金額：NT$ ${total}</b><br>
            備註：${note || '—'}
          </p>
        </div>

        <div class="panel">
          <h3>🏦 匯款資訊</h3>
          <p class="muted">
            中國信託 (822)<br>
            帳號：668540149274
          </p>
        </div>

        <div class="panel">
          <h3>🧊 下一步</h3>
          <p class="muted">
            1️⃣ 完成匯款<br>
            2️⃣ 填寫 7-11 冷凍交貨便取貨門市<br>
            3️⃣ 將「門市名稱＋店號」回傳給我們
          </p>
          <div class="cta-row">
            <a class="btn primary" href="./guide-711.html">📷 看 7-11 教學</a>
            <a class="btn" href="./index.html">🏠 回首頁</a>
          </div>
        </div>
      `;

      form.classList.add('hide');
      success.classList.remove('hide');
      success.scrollIntoView({ behavior: 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initOrderForm();
  });

})();