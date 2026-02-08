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
    select(tabs[0]?.dataset.tab || "product");

    window.selectHomeTab = function (id) {
      const target = document.getElementById("tabsBlock");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      select(id);
    };
  }

  // ===== 美味實拍 Carousel（像西堤：滑動＋轉場）=====
  function initCarousel() {
    const root = document.querySelector("[data-carousel]");
    if (!root) return;

    const track = root.querySelector("[data-track]");
    const slides = Array.from(root.querySelectorAll(".carousel-slide"));
    const btnPrev = root.querySelector("[data-prev]");
    const btnNext = root.querySelector("[data-next]");
    const dotsWrap = root.querySelector("[data-dots]");

    let idx = 0;
    let width = 0;
    let timer = null;
    let dragging = false;
    let startX = 0;
    let currentX = 0;

    function measure() {
      width = root.getBoundingClientRect().width;
      go(idx, false);
    }

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const d = document.createElement("button");
        d.className = "dot" + (i === idx ? " is-on" : "");
        d.type = "button";
        d.addEventListener("click", () => go(i));
        dotsWrap.appendChild(d);
      });
    }

    function go(i, animate = true) {
      idx = (i + slides.length) % slides.length;
      if (!animate) track.style.transition = "none";
      else track.style.transition = "transform .42s cubic-bezier(.2,.85,.2,1)";
      track.style.transform = `translateX(${-idx * width}px)`;
      renderDots();
      if (!animate) requestAnimationFrame(() => (track.style.transition = "transform .42s cubic-bezier(.2,.85,.2,1)"));
    }

    function next() { go(idx + 1); }
    function prev() { go(idx - 1); }

    function stopAuto() { if (timer) clearInterval(timer); timer = null; }
    function startAuto() {
      stopAuto();
      timer = setInterval(() => { if (!dragging) next(); }, 4200);
    }

    // Buttons
    btnPrev?.addEventListener("click", () => { stopAuto(); prev(); startAuto(); });
    btnNext?.addEventListener("click", () => { stopAuto(); next(); startAuto(); });

    // Touch / swipe
    track.addEventListener("touchstart", (e) => {
      dragging = true;
      stopAuto();
      startX = e.touches[0].clientX;
      currentX = startX;
      track.style.transition = "none";
    }, { passive: true });

    track.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      currentX = e.touches[0].clientX;
      const dx = currentX - startX;
      track.style.transform = `translateX(${(-idx * width) + dx}px)`;
    }, { passive: true });

    track.addEventListener("touchend", () => {
      if (!dragging) return;
      dragging = false;
      const dx = currentX - startX;
      const threshold = Math.min(90, width * 0.18);
      track.style.transition = "transform .42s cubic-bezier(.2,.85,.2,1)";

      if (dx > threshold) prev();
      else if (dx < -threshold) next();
      else go(idx);

      startAuto();
    });

    // Mouse drag (optional on desktop)
    track.addEventListener("mousedown", (e) => {
      dragging = true;
      stopAuto();
      startX = e.clientX;
      currentX = startX;
      track.style.transition = "none";
    });
    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      currentX = e.clientX;
      const dx = currentX - startX;
      track.style.transform = `translateX(${(-idx * width) + dx}px)`;
    });
    window.addEventListener("mouseup", () => {
      if (!dragging) return;
      dragging = false;
      const dx = currentX - startX;
      const threshold = Math.min(90, width * 0.18);
      track.style.transition = "transform .42s cubic-bezier(.2,.85,.2,1)";
      if (dx > threshold) prev();
      else if (dx < -threshold) next();
      else go(idx);
      startAuto();
    });

    window.addEventListener("resize", measure);

    // init
    renderDots();
    measure();
    startAuto();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHero();
    initTabs();
    initCarousel();
  });
})();