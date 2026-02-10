// =============================
// 基本設定
// =============================
const PRICE = 180
const SHIP_FEE = 129
const FREE_SHIP_THRESHOLD = 1800

const qtyInput = document.getElementById("qty")
const freePacksEl = document.getElementById("freePacks")
const shipFeeEl = document.getElementById("shipFee")
const grandEl = document.getElementById("grand")
const grandNoteEl = document.getElementById("grandNote")
const previewEl = document.getElementById("preview")
const toast = document.getElementById("toast")

// 🔥 新增：優惠提示條
let promoBar = document.createElement("div")
promoBar.className = "promo-bar"
document.querySelector(".calc").prepend(promoBar)

// =============================
// 計算功能
// =============================
function calculate() {
  let qty = parseInt(qtyInput.value) || 1
  if (qty < 1) qty = 1

  const freePacks = Math.floor(qty / 10)
  const subtotal = qty * PRICE
  const shipping = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIP_FEE
  const total = subtotal + shipping

  freePacksEl.innerHTML = `${freePacks} 包 <small>（每滿10送1）</small>`
  shipFeeEl.innerHTML = shipping === 0
    ? `免運 🎉`
    : `NT$${SHIP_FEE} <small>（滿1800免運）</small>`

  grandEl.innerHTML = `NT$${total}`
  grandNoteEl.innerText = `（商品 ${subtotal} + 運費 ${shipping}）`

  updatePromo(qty, subtotal)

  generatePreview(qty, freePacks, subtotal, shipping, total)
}

// =============================
// 🔥 動態優惠提示
// =============================
function updatePromo(qty, subtotal) {

  let message = ""
  let needForFreePack = 10 - (qty % 10)
  let needForFreeShip = Math.ceil((FREE_SHIP_THRESHOLD - subtotal) / PRICE)

  if (subtotal >= FREE_SHIP_THRESHOLD) {
    message = "🎉 已達免運門檻！太會買了吧～"
  } else if (needForFreeShip > 0 && needForFreeShip <= 3) {
    message = `🚚 再買 ${needForFreeShip} 包就免運！`
  } else if (needForFreePack > 0 && needForFreePack < 10) {
    message = `🎁 再買 ${needForFreePack} 包就送 1 包！`
  } else {
    message = "🎁 買十送一｜滿 NT$1800 免運"
  }

  promoBar.innerText = message
}

// =============================
// 訂單預覽
// =============================
function generatePreview(qty, freePacks, subtotal, shipping, total) {

  const orderNo = document.getElementById("orderNo").value
  const name = document.getElementById("name").value || "（未填）"
  const phone = document.getElementById("phone").value || "（未填）"
  const store = document.getElementById("store").value || "（未填）"

  previewEl.innerText =
`【吉祥滷意 下單資料】
訂單編號：${orderNo}

姓名：${name}
電話：${phone}
7-11門市：${store}

訂購：${qty} 包（送 ${freePacks} 包）
商品小計：NT$${subtotal}
運費：NT$${shipping}
合計：NT$${total}`
}

// =============================
// 複製郵局帳號
// =============================
document.getElementById("copyPay").addEventListener("click", () => {
  navigator.clipboard.writeText("00018330440573")
  showToast("已複製郵局帳號 ✅")
})

// =============================
// Toast
// =============================
function showToast(msg) {
  toast.innerText = msg
  toast.classList.add("show")
  setTimeout(() => toast.classList.remove("show"), 2000)
}

// =============================
// 訂單編號產生
// =============================
function generateOrderNo() {
  const now = new Date()
  const time = now.getFullYear().toString() +
    String(now.getMonth()+1).padStart(2,"0") +
    String(now.getDate()).padStart(2,"0") +
    String(now.getHours()).padStart(2,"0") +
    String(now.getMinutes()).padStart(2,"0") +
    String(now.getSeconds()).padStart(2,"0")

  document.getElementById("orderNo").value = `JLY-${time}`
  document.getElementById("createdAt").value = now.toLocaleString()
}

// =============================
qtyInput.addEventListener("input", calculate)
generateOrderNo()
calculate()