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
    "cara senyummu membuat hari terasa lebih hangat",
    "cara kamu bercerita sampai hal sederhana jadi berarti",
    "ketulusanmu yang selalu terasa tanpa banyak kata",
    "caramu tetap menjadi dirimu sendiri",
    "tawamu yang selalu punya cara mencairkan suasana",
    "kebaikan kecil yang sering kamu lakukan diam-diam",
    "caramu peduli bahkan pada hal yang dianggap sepele",
    "mimpi-mimpi indah yang masih kamu perjuangkan",
    "keberanianmu untuk terus melangkah",
    "kesabaranmu menghadapi hari-hari yang tidak mudah",
    "rasa ingin tahumu yang membuatmu terus tumbuh",
    "keunikanmu yang tidak perlu dibuat-buat",
    "cara kamu belajar dari setiap perjalanan",
    "caramu bangkit dan mencoba lagi",
    "selera lucumu yang selalu punya kejutan",
    "sisi lembutmu yang membuatmu begitu berharga",
    "energi hangat yang kamu bawa ke sekitar",
    "caramu menghargai orang lain dengan tulus",
    "cerita-cerita random yang justru paling membekas",
    "setiap kenangan kecil yang terasa layak disimpan",
    "masa depanmu yang masih penuh kemungkinan indah",
    "versi kecil dirimu yang sudah sejauh ini",
    "versi dirimu hari ini yang terus bertumbuh",
    "dan alasan paling sederhana: karena kamu adalah kamu ♡"
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

  // ---------- Photobooth camera ----------
  const cameraModal = $("cameraModal");
  const openCamera = $("openCamera");
  const closeCamera = $("closeCamera");
  const startCamera = $("startCamera");
  const takeSelfie = $("takeSelfie");
  const retakeSelfie = $("retakeSelfie");
  const downloadSelfie = $("downloadSelfie");
  const cameraVideo = $("cameraVideo");
  const cameraCanvas = $("cameraCanvas");
  const cameraPlaceholder = $("cameraPlaceholder");
  const templatePicker = $("templatePicker");
  let cameraStream = null;
  let selectedTemplate = "classic";
  let capturedImage = false;

  function stopCamera(){
    if(cameraStream){ cameraStream.getTracks().forEach(track => track.stop()); cameraStream=null; }
  }
  function openCameraModal(){
    if(!cameraModal) return;
    cameraModal.classList.add("show"); cameraModal.setAttribute("aria-hidden","false");
  }
  function closeCameraModal(){
    if(!cameraModal) return;
    cameraModal.classList.remove("show"); cameraModal.setAttribute("aria-hidden","true");
    stopCamera();
  }
  if(openCamera) openCamera.addEventListener("click", openCameraModal);
  if(closeCamera) closeCamera.addEventListener("click", closeCameraModal);
  if(cameraModal) cameraModal.addEventListener("click", e => { if(e.target===cameraModal) closeCameraModal(); });

  if(templatePicker){
    all(".template-choice").forEach(btn => btn.addEventListener("click", () => {
      all(".template-choice").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active"); selectedTemplate=btn.dataset.template || "classic";
      if(capturedImage) drawTemplate();
    }));
  }

  if(startCamera) startCamera.addEventListener("click", async () => {
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      if(cameraPlaceholder) cameraPlaceholder.textContent="Kamera browser tidak tersedia. Coba buka lewat HTTPS atau localhost.";
      return;
    }
    try{
      stopCamera();
      cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:false});
      cameraVideo.srcObject=cameraStream;
      await cameraVideo.play();
      cameraPlaceholder.style.display="none";
      cameraVideo.style.display="block";
      cameraCanvas.style.display="none";
      takeSelfie.disabled=false;
      capturedImage=false;
      retakeSelfie.style.display="none";
      if(downloadSelfie) downloadSelfie.style.display="none";
    }catch(err){
      if(cameraPlaceholder) { cameraPlaceholder.style.display="grid"; cameraPlaceholder.textContent="Izin kamera belum diberikan. Izinkan kamera lalu tekan Start Camera lagi."; }
    }
  });

  const photoReasons = [
    "karena senyummu selalu terasa seperti rumah yang hangat",
    "karena caramu bercerita membuat hal sederhana jadi istimewa",
    "karena kamu punya cara sendiri untuk membuat hari terasa lebih indah",
    "karena tawamu adalah salah satu suara favorit yang ingin selalu didengar",
    "karena kamu tetap menjadi dirimu sendiri, dan itu begitu berharga",
    "karena perhatian kecilmu sering berarti jauh lebih besar dari yang kamu kira",
    "karena kamu punya hati yang lembut tanpa kehilangan keberanian",
    "karena melihatmu bertumbuh adalah cerita yang indah untuk disaksikan",
    "karena kamu selalu punya sisi kecil yang berhasil membuat dunia terasa manis",
    "karena kamu membuat kenangan sederhana terasa layak disimpan selamanya",
    "karena kamu pantas dirayakan, bukan hanya hari ini, tapi setiap hari",
    "karena caramu berjuang diam-diam menunjukkan betapa kuatnya dirimu",
    "karena ada ketulusan dalam caramu memperlakukan orang yang kamu sayangi",
    "karena kamu membuat kata ‘rumah’ terasa seperti sebuah perasaan",
    "karena bahkan hari biasa bisa terasa spesial ketika ada ceritamu di dalamnya",
    "karena kamu adalah kumpulan dari hal-hal kecil yang selalu ingin dikenang",
    "karena mimpi-mimpimu pantas punya ruang untuk menjadi nyata",
    "karena kamu mengajarkan bahwa lembut dan kuat bisa hidup berdampingan",
    "karena caramu hadir membuat banyak momen terasa lebih lengkap",
    "karena kamu selalu punya tempat istimewa di halaman-halaman kenangan",
    "karena versi dirimu hari ini adalah hasil dari perjalanan yang begitu indah",
    "karena masa depan terasa lebih manis ketika membayangkan semua hal baik yang menunggumu",
    "karena dari sekian banyak cerita, kisah tentangmu selalu ingin dibaca lagi",
    "karena alasan paling sederhana dan paling jujur: kamu adalah kamu, dan itu cukup untuk disayang ♡"
  ];

  // Keep the 24 reasons visible as romantic copy, independent of content.js.
  const littleItems = all("#littleGrid .little span");
  if(littleItems.length === 24){ littleItems.forEach((el,i)=>el.textContent=photoReasons[i]); }

  function roundedRect(ctx,x,y,w,h,r){
    ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
  }

  function fitImage(ctx, source, x, y, w, h, mirror=true, zoom=1){
    const vw=source.videoWidth || source.width || 640, vh=source.videoHeight || source.height || 480;
    const scale=Math.max(w/vw,h/vh)*zoom, dw=vw*scale, dh=vh*scale;
    const dx=x+(w-dw)/2, dy=y+(h-dh)/2;
    ctx.save();
    if(mirror){ ctx.translate(x+w,0); ctx.scale(-1,1); ctx.drawImage(source, w-dx-dw,dy,dw,dh); }
    else ctx.drawImage(source,dx,dy,dw,dh);
    ctx.restore();
  }

  function drawTemplate(){
    if(!cameraCanvas || !cameraVideo) return;
    const vw=cameraVideo.videoWidth || 640, vh=cameraVideo.videoHeight || 480;
    const W=900, frameH=390, gap=24, top=110, bottom=170;
    const H=top + frameH*6 + gap*5 + bottom;
    cameraCanvas.width=W; cameraCanvas.height=H;
    const ctx=cameraCanvas.getContext("2d");
    ctx.clearRect(0,0,W,H);

    if(selectedTemplate==="classic"){
      ctx.fillStyle="#fff8fa"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#71304c"; ctx.textAlign="center"; ctx.font="52px Georgia"; ctx.fillText("DESI'S BIRTHDAY",W/2,65);
      ctx.font="26px Georgia"; ctx.fillStyle="#c66a8d"; ctx.fillText("chapter 24 · six little moments · ♡",W/2,95);
    } else if(selectedTemplate==="bow"){
      ctx.fillStyle="#fff1f6"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#71304c"; ctx.textAlign="center"; ctx.font="50px Georgia"; ctx.fillText("୨୧ BIRTHDAY GIRL ୨୧",W/2,65);
      ctx.font="24px Georgia"; ctx.fillStyle="#c66a8d"; ctx.fillText("sweet memories, sweeter days ♡",W/2,95);
    } else {
      ctx.fillStyle="#f9f1e9"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#4d3d3f"; ctx.textAlign="center"; ctx.font="48px Georgia"; ctx.fillText("♡ PHOTOBOOTH ♡",W/2,65);
      ctx.font="23px Georgia"; ctx.fillStyle="#9d7b78"; ctx.fillText("ROLL NO. 24 · KEEP THIS FRAME",W/2,95);
    }

    const labels=["01 · little smile","02 · birthday mood","03 · pretty moment","04 · sweet chapter","05 · keep this one","06 · forever-ish ♡"];
    for(let i=0;i<6;i++){
      const y=top+i*(frameH+gap);
      ctx.save();
      if(selectedTemplate==="classic") ctx.fillStyle="#ffffff";
      else if(selectedTemplate==="bow") ctx.fillStyle="#fff9fb";
      else ctx.fillStyle="#fffdf9";
      roundedRect(ctx,55,y,W-110,frameH,8); ctx.fill();
      ctx.strokeStyle=selectedTemplate==="film"?"#c7aaa5":"#e5b4c7"; ctx.lineWidth=4; ctx.stroke();
      ctx.save(); roundedRect(ctx,68,y+13,W-136,frameH-26,5); ctx.clip(); fitImage(ctx,cameraVideo,68,y+13,W-136,frameH-26,true,1.03); ctx.restore();
      if(selectedTemplate==="bow"){
        ctx.fillStyle="#d36f92"; ctx.font="34px Georgia"; ctx.textAlign="left"; ctx.fillText("♡",80,y+55);
        ctx.textAlign="right"; ctx.fillText("♡",W-80,y+55);
      }
      if(selectedTemplate==="film"){
        ctx.fillStyle="#5e4a4a"; ctx.font="20px Georgia"; ctx.textAlign="left"; ctx.fillText(labels[i],75,y+frameH-22);
        ctx.textAlign="right"; ctx.fillText("24",W-75,y+frameH-22);
      }
      ctx.restore();
    }
    ctx.textAlign="center";
    if(selectedTemplate==="classic"){
      ctx.fillStyle="#c66a8d"; ctx.font="30px Georgia"; ctx.fillText("made with love for your chapter 24 ♡",W/2,H-65);
    } else if(selectedTemplate==="bow"){
      ctx.fillStyle="#c66a8d"; ctx.font="32px Georgia"; ctx.fillText("୨୧ six frames, one lovely memory ୨୧",W/2,H-65);
    } else {
      ctx.fillStyle="#7b6363"; ctx.font="28px Georgia"; ctx.fillText("DATE: 24 · STATUS: CUTE ♡",W/2,H-65);
    }
    cameraCanvas.style.display="block"; cameraVideo.style.display="none";
    if(downloadSelfie) downloadSelfie.style.display="inline-flex";
    if(downloadSelfie) downloadSelfie.href=cameraCanvas.toDataURL("image/png");
  }

  if(takeSelfie) takeSelfie.addEventListener("click", () => {
    capturedImage=true; drawTemplate(); stopCamera();
    takeSelfie.disabled=true; retakeSelfie.style.display="inline-block";
    if(cameraPlaceholder) cameraPlaceholder.style.display="none";
  });
  if(retakeSelfie) retakeSelfie.addEventListener("click", () => {
    cameraCanvas.style.display="none"; cameraVideo.style.display="block";
    capturedImage=false; takeSelfie.disabled=false; retakeSelfie.style.display="none";
    if(downloadSelfie) downloadSelfie.style.display="none";
    if(startCamera) startCamera.click();
  });

  // Expose only navigation for fallback/debugging, without relying on it for UI.
  window.birthdayApp = { go, confetti, renderPhoto };
})();
