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

  // ---------- Music (responsive + robust) ----------
  const music = $("bgMusic");
  const musicButton = $("musicBtn");
  const musicLabel = $("musicLabel");
  const volume = $("volumeSlider");
  const volumeValue = $("volumeValue");
  const volumeIcon = $("volumeIcon");
  const musicProgress = $("musicProgress");
  const musicTimeCurrent = $("musicTimeCurrent");
  const musicTimeTotal = $("musicTimeTotal");

  const formatTime = seconds => {
    if (!Number.isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const setMusicUI = playing => {
    if (!musicButton) return;
    musicButton.classList.toggle("playing", playing);
    musicButton.innerHTML = playing
      ? '❚❚ <span id="musicLabel">pause music</span>'
      : '▶ <span id="musicLabel">play music</span>';
  };

  if (music) {
    music.volume = 0.65;
    music.preload = "metadata";

    music.addEventListener("loadedmetadata", () => {
      if (musicProgress) {
        musicProgress.max = Number.isFinite(music.duration) ? music.duration : 0;
        musicProgress.value = 0;
      }
      if (musicTimeTotal) musicTimeTotal.textContent = formatTime(music.duration);
    });

    music.addEventListener("durationchange", () => {
      if (musicProgress && Number.isFinite(music.duration)) musicProgress.max = music.duration;
      if (musicTimeTotal) musicTimeTotal.textContent = formatTime(music.duration);
    });

    music.addEventListener("timeupdate", () => {
      if (musicProgress && !musicProgress.matches(":active")) musicProgress.value = music.currentTime || 0;
      if (musicTimeCurrent) musicTimeCurrent.textContent = formatTime(music.currentTime);
    });

    music.addEventListener("play", () => setMusicUI(true));
    music.addEventListener("pause", () => setMusicUI(false));
    music.addEventListener("ended", () => { setMusicUI(false); if (musicProgress) musicProgress.value = 0; });
    music.addEventListener("error", () => {
      setMusicUI(false);
      if (musicLabel) musicLabel.textContent = "audio not found";
      console.warn("Music could not be loaded:", music.error);
    });
  }

  if (musicButton && music) {
    musicButton.addEventListener("click", async e => {
      e.preventDefault();
      try {
        if (music.paused) {
          await music.play();
        } else {
          music.pause();
        }
      } catch (err) {
        if (musicLabel) musicLabel.textContent = "tap to play";
        console.warn("Playback blocked or failed:", err);
      }
    });
  }

  if (volume && music) {
    const applyVolume = () => {
      const value = Math.max(0, Math.min(100, Number(volume.value) || 0));
      music.volume = value / 100;
      if (volumeValue) volumeValue.textContent = `${value}%`;
      if (volumeIcon) volumeIcon.textContent = value === 0 ? "🔇" : value < 45 ? "🔉" : "🔊";
    };
    volume.addEventListener("input", applyVolume);
    applyVolume();
  }

  if (musicProgress && music) {
    musicProgress.addEventListener("input", () => {
      if (Number.isFinite(music.duration) && music.duration > 0) {
        music.currentTime = Math.max(0, Math.min(music.duration, Number(musicProgress.value)));
      }
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
  const captureCountdown = $("captureCountdown");
  const cameraFlash = $("cameraFlash");
  const shotDots = $("shotDots") ? all("#shotDots .shot-dot") : [];
  let cameraStream = null;
  let selectedTemplate = "classic";
  let capturedImage = false;
  let capturedFrames = []; // holds 6 real captured <canvas> snapshots
  let isCapturing = false;

  const wait = (ms) => new Promise(res => setTimeout(res, ms));

  function updateShotDots(){
    shotDots.forEach((dot, i) => dot.classList.toggle("filled", i < capturedFrames.length));
  }

  async function runCountdown(seconds){
    if(!captureCountdown) return;
    captureCountdown.classList.add("show");
    for(let n = seconds; n >= 1; n--){
      captureCountdown.innerHTML = `<span>${n}</span>`;
      await wait(700);
    }
    captureCountdown.classList.remove("show");
    captureCountdown.innerHTML = "";
  }

  function flashOnce(){
    if(!cameraFlash) return;
    cameraFlash.classList.remove("flash");
    void cameraFlash.offsetWidth;
    cameraFlash.classList.add("flash");
  }

  function snapshotFrame(){
    const vw = cameraVideo.videoWidth || 640, vh = cameraVideo.videoHeight || 480;
    const c = document.createElement("canvas");
    c.width = vw; c.height = vh;
    const cx = c.getContext("2d");
    // mirror so it matches the live preview (selfie-style)
    cx.translate(vw, 0); cx.scale(-1, 1);
    cx.drawImage(cameraVideo, 0, 0, vw, vh);
    return c;
  }

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
      takeSelfie.textContent="Start Photobooth (6x) ✦";
      capturedImage=false;
      capturedFrames=[];
      isCapturing=false;
      updateShotDots();
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

  // wrap text across multiple centered lines inside a max width, for the glass bubble
  function wrapCenteredText(ctx, text, cx, startY, maxWidth, lineHeight){
    const words = text.split(" ");
    let line = "", lines = [];
    words.forEach(word => {
      const test = line ? line + " " + word : word;
      if(ctx.measureText(test).width > maxWidth && line){
        lines.push(line); line = word;
      } else line = test;
    });
    if(line) lines.push(line);
    lines.forEach((l, i) => ctx.fillText(l, cx, startY + i*lineHeight));
    return lines.length * lineHeight;
  }

  // a soft "glass pane" speech-bubble (used for captions/quotes on the strip)
  function drawGlassBubble(ctx, x, y, w, h, tailX){
    ctx.save();
    roundedRect(ctx, x, y, w, h, 18);
    const grad = ctx.createLinearGradient(x, y, x, y+h);
    grad.addColorStop(0, "rgba(255,255,255,.62)");
    grad.addColorStop(1, "rgba(255,255,255,.34)");
    ctx.fillStyle = grad; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.stroke();
    if(tailX !== undefined){
      ctx.beginPath();
      ctx.moveTo(tailX-14, y+h-1);
      ctx.lineTo(tailX, y+h+16);
      ctx.lineTo(tailX+14, y+h-1);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,.4)"; ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.stroke();
    }
    ctx.restore();
  }

  const deco = ["♡","✦","✿","🎀","🌸","✨"];
  function scatterIcons(ctx, y, W, count){
    ctx.save(); ctx.textAlign="center"; ctx.font="22px Georgia";
    for(let i=0;i<count;i++){
      const x = (W/(count+1))*(i+1) + (i%2===0? -6:6);
      ctx.fillStyle = "rgba(214,110,145,.55)";
      ctx.fillText(deco[i % deco.length], x, y);
    }
    ctx.restore();
  }

  const bubbleMessages = {
    classic: "Beda tapi saling melengkapi, seperti sendok & garpu ♡",
    bow: "୨୧ dua hal berbeda, satu cerita hangat ୨୧",
    film: "roll no.24 · saling melengkapi, bukan menyamai ♡"
  };

  function drawTemplate(){
    if(!cameraCanvas) return;
    const frames = capturedFrames.length ? capturedFrames : [null,null,null,null,null,null];
    const W=820, frameW=700, frameH=250, gap=18, top=205, bottom=190;
    const H=top + frameH*6 + gap*5 + bottom;
    cameraCanvas.width=W; cameraCanvas.height=H;
    const ctx=cameraCanvas.getContext("2d");
    ctx.clearRect(0,0,W,H);

    function fillBg(color){ctx.fillStyle=color;ctx.fillRect(0,0,W,H);}
    function scallopBorder(color){
      ctx.save(); ctx.fillStyle=color;
      for(let y=20;y<H;y+=34){ctx.beginPath();ctx.arc(18,y,12,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(W-18,y,12,0,Math.PI*2);ctx.fill();}
      ctx.restore();
    }
    function barcode(x,y,w,h){
      ctx.save();ctx.fillStyle="#fff";ctx.fillRect(x,y,w,h);ctx.fillStyle="#3b252b";
      for(let i=0;i<34;i++){let bw=(i%3===0?4:i%2?2:3);ctx.fillRect(x+12+i*8,y+7,bw,h-14);}
      ctx.restore();
    }
    function drawPhotoCard(i,x,y,w,h,variant){
      ctx.save();
      const photoX=x+12, photoY=y+12, photoW=w-24, photoH=h-24;
      ctx.fillStyle=variant==='ticket'?'#fff7ea':variant==='pixel'?'#fff':'#f5e3c9';
      roundedRect(ctx,x,y,w,h,variant==='pixel'?3:8);ctx.fill();
      ctx.save();roundedRect(ctx,photoX,photoY,photoW,photoH,4);ctx.clip();
      if(frames[i]) fitImage(ctx,frames[i],photoX,photoY,photoW,photoH,false,1.02);
      else {ctx.fillStyle=variant==='pixel'?'#f6dbe3':'#ead8c2';ctx.fillRect(photoX,photoY,photoW,photoH);}
      ctx.restore();
      ctx.restore();
    }

    if(selectedTemplate==='classic'){
      // CARAMEL CLICK — warm wood + cream ticket
      fillBg('#6a3928');
      ctx.fillStyle='#7d4a35';
      for(let x=0;x<W;x+=42){ctx.fillRect(x,0,20,H);}
      ctx.fillStyle='#ead0aa'; roundedRect(ctx,24,24,W-48,H-48,16);ctx.fill();
      ctx.fillStyle='#f3e0bc'; roundedRect(ctx,50,45,W-100,135,10);ctx.fill();
      ctx.fillStyle='#24181a';ctx.textAlign='left';ctx.font='bold 37px Georgia';ctx.fillText('CARAMEL CLICK',82,88);
      ctx.font='17px Georgia';ctx.fillText('FILM: HAPPY BIRTHDAY ECIII',82,120);
      ctx.setLineDash([9,7]);ctx.beginPath();ctx.moveTo(82,143);ctx.lineTo(520,143);ctx.strokeStyle='#5e4235';ctx.stroke();ctx.setLineDash([]);
      ctx.font='13px Georgia';ctx.fillText('Location: Our little story',82,165);ctx.fillText('Seat: E1, E2',430,165);
      barcode(W-195,62,125,68);
      ctx.fillStyle='#703b2e';ctx.textAlign='center';ctx.font='italic 24px Georgia';ctx.fillText('Happy Birthday Eciii ♡',W/2,H-83);
      ctx.font='12px Georgia';ctx.fillText('six little moments · keep them forever',W/2,H-55);
      ctx.textAlign='left';
      for(let i=0;i<6;i++){
        const y=205+i*(frameH+gap); drawPhotoCard(i,60,y,frameW,frameH,'classic');
        ctx.fillStyle='#8d563d';ctx.font='11px Georgia';ctx.fillText(String(i+1).padStart(2,'0'),W-82,y+30);
      }
      ctx.fillStyle='#f0d8b3';ctx.font='13px Georgia';ctx.fillText('THE CUTEST!',68,H-48);
    } else if(selectedTemplate==='ticket'){
      // CINEMA TICKET — burgundy ticket with cream film strip
      fillBg('#8d1f2a');
      ctx.fillStyle='#f6edda'; roundedRect(ctx,26,25,W-52,H-50,18);ctx.fill();
      ctx.fillStyle='#8d1f2a';ctx.textAlign='center';ctx.font='bold 30px Georgia';ctx.fillText('SELFIE TIME',W/2,72);
      ctx.font='14px Georgia';ctx.fillText('HAPPY BIRTHDAY ECIII ♡',W/2,98);
      ctx.setLineDash([5,7]);ctx.strokeStyle='#a14a53';ctx.beginPath();ctx.moveTo(72,122);ctx.lineTo(W-72,122);ctx.stroke();ctx.setLineDash([]);
      ctx.font='10px Poppins';ctx.fillText('THEATER: OUR LOVE   ·   SEAT: ALWAYS   ·   DATE: TODAY',W/2,145);
      for(let i=0;i<6;i++){
        const y=205+i*(frameH+gap); drawPhotoCard(i,60,y,frameW,frameH,'ticket');
        ctx.fillStyle='#9a2634';ctx.textAlign='left';ctx.font='10px Poppins';ctx.fillText('TICKET '+String(i+1).padStart(2,'0'),78,y+31);
      }
      ctx.fillStyle='#8d1f2a';ctx.textAlign='left';ctx.font='bold 23px Georgia';ctx.fillText('HAPPY BIRTHDAY ECIII',68,H-72);
      ctx.font='11px Georgia';ctx.fillText('THEATER: 24 · SEAT: MY FAVORITE',68,H-50);
      barcode(W-205,H-85,135,58);
    } else {
      // PIXELBOOTH — clean white strip, barcode and burgundy accents
      fillBg('#5f0e18');
      ctx.fillStyle='#fffdf8'; roundedRect(ctx,24,24,355,H-48,16);ctx.fill();
      ctx.fillStyle='#fffdf8'; roundedRect(ctx,441,24,355,H-48,16);ctx.fill();
      ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 18px Poppins';ctx.fillText('PIXELBOOTH',200,52);ctx.fillText('PIXELBOOTH',620,52);
      barcode(55,70,290,58); barcode(472,70,290,58);
      // six frames distributed vertically in the left strip; right strip becomes a birthday message card
      for(let i=0;i<6;i++){
        const y=145+i*178;
        drawPhotoCard(i,55,y,293,160,'pixel');
        ctx.fillStyle='#6a1621';ctx.textAlign='center';ctx.font='10px Poppins';ctx.fillText('ECIII · 24 · '+String(i+1).padStart(2,'0'),201,y+151);
      }
      ctx.fillStyle='#6a1621';ctx.textAlign='center';ctx.font='italic 45px Georgia';ctx.fillText('Happy',620,205);ctx.fillText('Birthday',620,250);ctx.font='italic 50px Georgia';ctx.fillText('Eciii ♡',620,305);
      ctx.setLineDash([8,8]);ctx.strokeStyle='#7e2a35';ctx.beginPath();ctx.moveTo(500,340);ctx.lineTo(740,340);ctx.stroke();ctx.setLineDash([]);
      ctx.font='15px Georgia';ctx.fillText('SPECIAL DAY',620,375);ctx.font='11px Poppins';ctx.fillText('more selfies · more memories',620,400);
      ctx.font='34px Georgia';ctx.fillText('♡',620,445);ctx.fillText('✦',550,445);ctx.fillText('✦',690,445);
      ctx.fillStyle='#6a1621';ctx.font='bold 17px Poppins';ctx.fillText('HAPPY BIRTHDAY ECIII',620,505);
      ctx.font='12px Poppins';ctx.fillText('DATE: TODAY · ROLL: 24',620,530);
      barcode(500,570,240,58);
      ctx.font='italic 28px Georgia';ctx.fillText('Keep this one ♡',620,670);
      ctx.font='11px Poppins';ctx.fillText('PIXELBOOTH · OUR SPECIAL DAY',620,700);
    }

    cameraCanvas.style.display='block';
    if(cameraVideo) cameraVideo.style.display='none';
    if(downloadSelfie){downloadSelfie.style.display='inline-flex';downloadSelfie.href=cameraCanvas.toDataURL('image/png');}
  }

  async function startPhotoboothSequence(){
    if(isCapturing || !cameraStream) return;
    isCapturing = true;
    capturedFrames = [];
    updateShotDots();
    takeSelfie.disabled = true;
    takeSelfie.textContent = "Capturing…";
    for(let shot=1; shot<=6; shot++){
      await runCountdown(3);
      flashOnce();
      capturedFrames.push(snapshotFrame());
      updateShotDots();
      takeSelfie.textContent = `Ambil foto ${shot}/6 ✦`;
      await wait(500);
    }
    capturedImage = true;
    drawTemplate();
    stopCamera();
    isCapturing = false;
    takeSelfie.disabled = true;
    takeSelfie.textContent = "Start Photobooth (6x) ✦";
    retakeSelfie.style.display = "inline-block";
    if(cameraPlaceholder) cameraPlaceholder.style.display = "none";
  }

  if(takeSelfie) takeSelfie.addEventListener("click", () => { startPhotoboothSequence(); });
  if(retakeSelfie) retakeSelfie.addEventListener("click", () => {
    cameraCanvas.style.display="none"; cameraVideo.style.display="block";
    capturedImage=false; capturedFrames=[]; updateShotDots();
    takeSelfie.disabled=false; takeSelfie.textContent="Start Photobooth (6x) ✦"; retakeSelfie.style.display="none";
    if(downloadSelfie) downloadSelfie.style.display="none";
    if(startCamera) startCamera.click();
  });

  // Expose only navigation for fallback/debugging, without relying on it for UI.
  window.birthdayApp = { go, confetti, renderPhoto };
})();
