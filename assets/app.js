// 吉祥滷意（滷汁-肉燥）前端下單計算：
// - 買十送一（以「包」為單位）
// - 7-11 冷凍交貨便 運費150（含包裝耗材）
// - 訂購滿 1800 免運
// - 這是「下單資訊產生器」，不會真的自動收款/出貨

function fmt(n){
  return n.toLocaleString("zh-Hant-TW");
}

function calcGift(qty){
  // 買十送一：每 10 包送 1 包
  return Math.floor(qty / 10);
}

function calcShipping(subtotal){
  return subtotal >= 1800 ? 0 : 150;
}

function buildOrderText(data){
  const lines = [];
  lines.push("【吉祥滷意（滷汁-肉燥）】下單資訊");
  lines.push(`姓名：${data.name || "（未填）"}`);
  lines.push(`手機：${data.phone || "（未填）"}`);
  lines.push(`取貨門市（7-11 冷凍交貨便）：${data.store || "（未填）"}`);
  lines.push(`收件資訊/備註：${data.note || "（無）"}`);
  lines.push("—");
  lines.push(`訂購數量：${data.qty} 包`);
  lines.push(`買十送一：送 ${data.gift} 包（實拿共 ${data.totalQty} 包）`);
  lines.push(`小計：NT$ ${fmt(data.subtotal)}`);
  lines.push(`運費：NT$ ${fmt(data.shipping)} ${data.shipping === 0 ? "（滿1800免運）" : "（7-11冷凍交貨便）"}`);
  lines.push(`應付總額：NT$ ${fmt(data.total)}`);
  lines.push("—");
  lines.push("匯款帳號：中國信託(822) 668540149274");
  lines.push("備註：因無囤貨，下單匯款後約 1～2 週準備並寄出。");
  lines.push("如有疑問：私訊粉專小編 / LINE：0985210319");
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
      setTimeout(()=> copyBtn.textContent = "一鍵複製下單文字", 1200);
    }catch(e){
      alert("複製失敗，請手動全選複製。");
    }
  });

  sampleBtn?.addEventListener("click", ()=>{
    nameEl.value = "王小明";
    phoneEl.value = "09xx-xxx-xxx";
    storeEl.value = "7-11 XX門市（冷凍交貨便）";
    noteEl.value = "想要下週末露營用，謝謝！";
    recalc();
  });

  recalc();
}

// run
document.addEventListener("DOMContentLoaded", ()=>{
  if(document.body.dataset.page === "order"){
    initOrderPage();
  }
});
