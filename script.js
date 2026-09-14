(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const all = (selector) => [...document.querySelectorAll(selector)];

  // ---------- Screen navigation ----------
  const routes = {
    openGift: "candles",
    afterCandles: "scrapbook",
    scrapNext: "moments",
    momentsNext: "letters",
    lettersNext: "little",
    littleNext: "garden",
    gardenNext: "videoPage",
    finalNext: "final"
  };

  function go(id) {
    const target = $(id);
    if (!target) return;
    all(".screen").forEach(s => s.classList.remove("active"));
    target.classList.add("active");
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  Object.entries(routes).forEach(([buttonId, targetId]) => {
    const button = $(buttonId);
    if (button) {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        go(targetId);
      });
    }
  });

  // ---------- 24 candles ----------
  const candleGrid = $("candlesGrid");
  const progress = $("candleProgress");

  if (candleGrid) {
    for (let i = 1; i <= 24; i++) {
      const candle = document.createElement("div");
      candle.className = "candle";
      candle.setAttribute("role", "button");
      candle.setAttribute("tabindex", "0");
      candle.setAttribute("aria-label", `Lilin ${i}`);
      candle.innerHTML = '<div class="flame">🔥</div><div class="stick"></div>';

      const toggle = () => {
        candle.classList.toggle("off");
        updateCandles();
      };
      candle.addEventListener("click", toggle);
      candle.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
      candleGrid.appendChild(candle);
    }
  }

  function updateCandles() {
    if (!progress) return;
    const remaining = all(".candle:not(.off)").length;
    progress.textContent = remaining
      ? `${remaining} candles glowing ♡`
      : "All candles are out! Make your wish ✨";
  }

  const blowAll = $("blowAll");
  if (blowAll) {
    blowAll.addEventListener("click", e => {
      e.preventDefault();
      all(".candle").forEach(c => c.classList.add("off"));
      updateCandles();
      confetti(65);
    });
  }

  // ---------- Music ----------
  const music = $("bgMusic");
  const musicButton = $("musicBtn");
  const musicLabel = $("musicLabel");
  const volume = $("volumeSlider");
  const volumeValue = $("volumeValue");

  if (music) music.volume = 0.65;

  if (musicButton && music) {
    musicButton.addEventListener("click", async e => {
      e.preventDefault();
      try {
        if (music.paused) {
          await music.play();
          if (musicLabel) musicLabel.textContent = "playing";
          musicButton.classList.add("playing");
        } else {
          music.pause();
          if (musicLabel) musicLabel.textContent = "music";
          musicButton.classList.remove("playing");
        }
      } catch (err) {
        if (musicLabel) musicLabel.textContent = "tap again";
      }
    });
  }

  if (volume && music) {
    volume.addEventListener("input", () => {
      const value = Number(volume.value);
      music.volume = value / 100;
      if (volumeValue) volumeValue.textContent = `${value}%`;
    });
  }

  // ---------- Record / photo carousel ----------
  const photoStack = $("photoStack");
  const record = $("vinyl");
  const photos = all(".record-photo");
  const dotsWrap = $("photoDots");
  const caption = $("photoCaption");
  const prev = $("prevPhoto");
  const next = $("nextPhoto");
  let photoIndex = 0;

  const captions = [
    "a sweet little memory",
    "a tiny happy moment",
    "one for the scrapbook",
    "another page of us",
    "keep this one forever",
    "a favorite little chapter"
  ];

  function renderPhoto(index) {
    if (!photos.length) return;
    photoIndex = (index + photos.length) % photos.length;

    photos.forEach((photo, i) => {
      photo.classList.toggle("active", i === photoIndex);
    });

    if (dotsWrap) {
      [...dotsWrap.children].forEach((dot, i) =>
        dot.classList.toggle("active", i === photoIndex)
      );
    }

    if (caption) {
      caption.textContent =
        `${captions[photoIndex] || "a little memory"} · ${String(photoIndex + 1).padStart(2, "0")} / ${photos.length}`;
    }

    if (record) {
      record.classList.remove("turn-record");
      void record.offsetWidth;
      record.classList.add("turn-record");
    }
  }

  if (dotsWrap && photos.length) {
    photos.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `dot${i === 0 ? " active" : ""}`;
      dot.setAttribute("aria-label", `Foto ${i + 1}`);
      dot.addEventListener("click", () => renderPhoto(i));
      dotsWrap.appendChild(dot);
    });
  }

  if (prev) prev.addEventListener("click", () => renderPhoto(photoIndex - 1));
  if (next) next.addEventListener("click", () => renderPhoto(photoIndex + 1));

  if (photoStack) {
    let startX = 0;
    photoStack.addEventListener("touchstart", e => {
      startX = e.changedTouches[0].screenX;
    }, { passive: true });

    photoStack.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].screenX - startX;
      if (Math.abs(dx) > 45) renderPhoto(photoIndex + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  // ---------- Letters ----------
  const letterTexts = {
    1: "Semoga hatimu selalu punya tempat untuk tenang, tertawa, dan menerima dirimu sendiri.",
    2: "Semoga mimpi-mimpi yang kamu simpan diam-diam satu per satu menemukan jalan pulang.",
    3: "Semoga hari biasa pun terasa spesial karena kamu selalu menemukan hal kecil untuk disyukuri.",
    4: "Chapter 24: lebih berani, lebih lembut pada diri sendiri, dan lebih banyak cerita indah."
  };

  all(".letter-card").forEach(card => {
    card.addEventListener("click", () => {
      const key = card.dataset.letter;
      const p = card.querySelector("p");
      if (p && letterTexts[key]) p.textContent = letterTexts[key];
    });
  });

  // ---------- 24 Little Things ----------
  const things = [
    "senyummu","caramu bercerita","ketulusanmu","semangatmu","tawamu",
    "kebaikan kecilmu","caramu peduli","mimpi-mimpimu","keberanianmu",
    "kesabaranmu","rasa ingin tahumu","keunikanmu","cara kamu belajar",
    "cara kamu bertahan","selera lucumu","sisi lembutmu","energi positifmu",
    "caramu menghargai orang","hal-hal random tentangmu","cerita yang kamu punya",
    "masa depanmu","versi kecil dirimu","versi sekarang dirimu",
    "dan karena kamu adalah kamu ♡"
  ];

  const littleGrid = $("littleGrid");
  if (littleGrid) {
    things.forEach((thing, i) => {
      const item = document.createElement("div");
      item.className = "little";
      item.innerHTML = `<b>${String(i + 1).padStart(2, "0")}</b><span>${thing}</span>`;
      littleGrid.appendChild(item);
    });
  }

  // ---------- Wish modal ----------
  const modal = $("wishModal");
  const wishButton = $("wishBtn");
  const closeButton = $("closeModal");
  const wishDone = $("wishDone");
  const wishResult = $("wishResult");

  if (wishButton && modal) {
    wishButton.addEventListener("click", e => {
      e.preventDefault();
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
    });
  }

  if (closeButton && modal) {
    closeButton.addEventListener("click", () => {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
    });
  }

  if (modal) {
    modal.addEventListener("click", e => {
      if (e.target === modal) {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
      }
    });
  }

  if (wishDone) {
    wishDone.addEventListener("click", () => {
      if (wishResult) wishResult.style.display = "block";
      wishDone.textContent = "Wish sent to the universe ✨";
      confetti(80);
    });
  }

  // ---------- Confetti ----------
  function confetti(amount = 30) {
    const symbols = ["♡", "✦", "✿", "୨୧"];
    for (let i = 0; i < amount; i++) {
      const el = document.createElement("div");
      el.className = "confetti";
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      el.style.left = `${Math.random() * 100}vw`;
      el.style.top = `${-10 - Math.random() * 20}vh`;
      el.style.fontSize = `${10 + Math.random() * 16}px`;
      el.style.animationDelay = `${Math.random() * 0.45}s`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2200);
    }
  }

  // Expose only navigation for fallback/debugging, without relying on it for UI.
  window.birthdayApp = { go, confetti, renderPhoto };
})();
