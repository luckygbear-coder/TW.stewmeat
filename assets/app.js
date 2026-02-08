// ========= Helpers =========
function fmt(n){ return n.toLocaleString("zh-Hant-TW"); }
function calcGift(qty){ return Math.floor(qty / 10); }
function calcShipping(subtotal){ return subtotal >= 1800 ? 0 : 150; }

// ========= Tabs (Home) =========
function initTabs(){
  const tabsWrap = document.querySelector("[data-tabs]");
  if(!tabsWrap) return;

  const tabs = Array.from(tabsWrap.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  function selectTab(id){
    tabs.forEach(t=>{
      const selected = t.dataset.tab === id;
      t.setAttribute("aria-selected", selected ? "true" : "false");
    });
    panels.forEach(p=>{
      p.classList.toggle("hide", p.dataset.panel !== id);
    });
  }

  tabs.forEach(t=>{
    t.addEventListener("click", ()=>{
      selectTab(t.dataset.tab);
      const block = document.querySelector("#tabsBlock");
      if(block) block.scrollIntoView({behavior:"smooth", block:"start"});
    });
  });

  selectTab(tabs[0]?.dataset.tab || "product");

  window.selectHomeTab = (id)=>{
    selectTab(id);
    const block = document.querySelector("#tabsBlock");
    if(block) block.scrollIntoView({behavior:"smooth", block:"start"});
  };
}

// ========= Order =========
function buildOrderText(data){
  const lines = [];
  lines.push("【吉祥滷意（滷汁-肉燥）】下單資訊");
  lines.push(`姓名：${data.name || "（未填）"}`);
  lines.push(`手機：${data.phone || "（未填）"}`);
  lines.push(`取貨門市（7-11 冷凍交貨便）：${data.store || "（未填）"}`);
  lines.push(`備註：${data.note || "（無）"}`);
  lines.push("—");
  lines.push(`訂購數量：${data.qty} 包`);
  lines.push(`買十送一：送 ${data.gift} 包（實拿共 ${data.totalQty} 包）`);
  lines.push(`小計：NT$ ${fmt(data.subtotal)}`);
  lines.push(`運費：NT$ ${fmt(data.shipping)} ${data.shipping === 0 ? "（滿1800免運）" : "（含包材）"}`);
  lines.push(`應付總額：NT$ ${fmt(data.total)}`);
  lines.push("—");
  lines.push("匯款帳號：中國信託(822) 668540149274");
  lines.push("貼心小提醒：因為沒有囤貨，所以下單匯款後約 1～2 週準備並寄出。");
  lines.push("若有任何疑問：私訊粉專小編或 LINE：0985210319");
  return lines.join("\n");
}

function initOrderPage(){
  const qtyEl = document.querySelector("#qty");
  const priceEl = document.querySelector("#price");
  const nameEl = document.querySelector("#name");
  const phoneEl = document.querySelector("#phone");
  const storeEl = document.querySelector("#store");
  const noteEl = document.querySelector("#note");

  const giftEl = document.querySelector("#gift");
  const subtotalEl = document.querySelector("#subtotal");
  const shippingEl = document.querySelector("#shipping");
  const totalEl = document.querySelector("#total");
  const totalQtyEl = document.querySelector("#totalQty");
  const orderTextEl = document.querySelector("#orderText");

  const copyBtn = document.querySelector("#copyOrder");
  const sampleBtn = document.querySelector("#fillSample");
  const successPanel = document.querySelector("#successPanel");

  function recalc(){
    const qty = Math.max(1, parseInt(qtyEl.value || "1", 10));
    const price = Math.max(0, parseInt(priceEl.value || "0", 10));

    const gift = calcGift(qty);
    const totalQty = qty + gift;
    const subtotal = qty * price;
    const shipping = calcShipping(subtotal);
    const total = subtotal + shipping;

    giftEl.textContent = `${gift} 包`;
    totalQtyEl.textContent = `${totalQty} 包`;
    subtotalEl.textContent = `NT$ ${fmt(subtotal)}`;
    shippingEl.textContent = `NT$ ${fmt(shipping)}` + (shipping === 0 ? "（免運）" : "（含包材）");
    totalEl.textContent = `NT$ ${fmt(total)}`;

    const data = {
      name: nameEl.value.trim(),
      phone: phoneEl.value.trim(),
      store: storeEl.value.trim(),
      note: noteEl.value.trim(),
      qty, gift, totalQty, subtotal, shipping, total
    };
    orderTextEl.value = buildOrderText(data);
  }

  [qtyEl, priceEl, nameEl, phoneEl, storeEl, noteEl].forEach(el=>{
    el.addEventListener("input", recalc);
  });

  copyBtn?.addEventListener("click", async ()=>{
    try{
      await navigator.clipboard.writeText(orderTextEl.value);
      copyBtn.textContent = "✅ 已複製";
      if(successPanel){
        successPanel.classList.remove("hide");
        successPanel.scrollIntoView({behavior:"smooth", block:"start"});
      }
      setTimeout(()=> copyBtn.textContent = "一鍵複製下單文字", 1200);
    }catch(e){
      alert("複製失敗，請手動全選複製。");
    }
  });

  sampleBtn?.addEventListener("click", ()=>{
    nameEl.value = "王小明";
    phoneEl.value = "09xx-xxx-xxx";
    storeEl.value = "7-11 XX門市（冷凍交貨便）｜台北市OO區OO路OO號";
    noteEl.value = "想要下週末露營用，謝謝！";
    recalc();
  });

  recalc();
}

// ========= Boot =========
document.addEventListener("DOMContentLoaded", ()=>{
  initTabs();
  if(document.body.dataset.page === "order"){
    initOrderPage();
  }
});