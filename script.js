const musicBtn = document.getElementById("musicBtn");
const music = document.getElementById("bgMusic");
const openBtn = document.getElementById("openBtn");
const wishBtn = document.getElementById("wishBtn");
const modal = document.getElementById("wishModal");
const closeModal = document.getElementById("closeModal");
const wishDone = document.getElementById("wishDone");
const wishResult = document.getElementById("wishResult");

let audioCtx=null,musicGain=null,fallbackTimer=null,fallbackPlaying=false;
const volumeSlider=document.getElementById("volumeSlider"),volumeValue=document.getElementById("volumeValue"),musicLabel=document.getElementById("musicLabel"); let musicVolume=.65; music.volume=musicVolume;
function startFallbackMusic(){audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();musicGain=musicGain||audioCtx.createGain();musicGain.gain.value=musicVolume*.045;musicGain.connect(audioCtx.destination);const notes=[261.63,329.63,392,329.63,293.66,349.23,440,349.23];let i=0;const play=()=>{if(!fallbackPlaying)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type="sine";o.frequency.value=notes[i++%notes.length];g.gain.setValueAtTime(0,audioCtx.currentTime);g.gain.linearRampToValueAtTime(1,audioCtx.currentTime+.04);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.42);o.connect(g);g.connect(musicGain);o.start();o.stop(audioCtx.currentTime+.45)};play();fallbackTimer=setInterval(play,500)}
function stopFallbackMusic(){fallbackPlaying=false;if(fallbackTimer)clearInterval(fallbackTimer);fallbackTimer=null}
musicBtn.addEventListener("click",async()=>{try{if(!music.paused){music.pause();stopFallbackMusic();musicLabel.textContent="music";musicBtn.classList.remove("playing");return}await music.play();musicLabel.textContent="playing";musicBtn.classList.add("playing")}catch{fallbackPlaying=!fallbackPlaying;if(fallbackPlaying){startFallbackMusic();musicLabel.textContent="playing";musicBtn.classList.add("playing")}else{stopFallbackMusic();musicLabel.textContent="music";musicBtn.classList.remove("playing")}}});
volumeSlider.addEventListener("input",()=>{const v=Number(volumeSlider.value);musicVolume=v/100;music.volume=musicVolume;if(musicGain)musicGain.gain.value=musicVolume*.045;volumeValue.textContent=v+"%";musicBtn.classList.toggle("muted",v===0)});

openBtn.addEventListener("click", () => {
  document.getElementById("letter").scrollIntoView({ behavior: "smooth" });
  confetti(35);
});

wishBtn.addEventListener("click", () => {
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
});

function hideModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

closeModal.addEventListener("click", hideModal);
modal.addEventListener("click", (e) => { if (e.target === modal) hideModal(); });

wishDone.addEventListener("click", () => {
  wishResult.style.display = "block";
  wishDone.textContent = "Wish sent to the universe ✨";
  confetti(70);
});

function confetti(amount) {
  const symbols = ["♡","✦","✿","୨୧"];
  for (let i = 0; i < amount; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.textContent = symbols[Math.floor(Math.random()*symbols.length)];
    el.style.left = Math.random()*100 + "vw";
    el.style.top = (-10 - Math.random()*20) + "vh";
    el.style.fontSize = (10 + Math.random()*16) + "px";
    el.style.color = ["#d87598","#efabc2","#c85f88","#f3c3d2"][Math.floor(Math.random()*4)];
    el.style.animationDelay = Math.random()*.45 + "s";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, {threshold: .12});

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));


const record=document.getElementById("vinyl"),recordPhotos=[...document.querySelectorAll(".record-photo")],dots=[...document.querySelectorAll(".dot")],caption=document.getElementById("photoCaption"),prevPhoto=document.getElementById("prevPhoto"),nextPhoto=document.getElementById("nextPhoto");let currentPhoto=0;const captions=["a sweet little memory · 01 / 05","a tiny happy moment · 02 / 05","one for the scrapbook · 03 / 05","another page of us · 04 / 05","keep this one forever · 05 / 05"];function showPhoto(index,direction=1){currentPhoto=(index+recordPhotos.length)%recordPhotos.length;recordPhotos.forEach((p,i)=>{p.classList.toggle("active",i===currentPhoto);p.style.setProperty("--slide-dir",direction)});dots.forEach((d,i)=>d.classList.toggle("active",i===currentPhoto));caption.textContent=captions[currentPhoto];record.classList.remove("turn-record");void record.offsetWidth;record.classList.add("turn-record")}prevPhoto.addEventListener("click",()=>showPhoto(currentPhoto-1,-1));nextPhoto.addEventListener("click",()=>showPhoto(currentPhoto+1,1));dots.forEach(d=>d.addEventListener("click",()=>showPhoto(Number(d.dataset.index))));let touchX=0,touchY=0;const photoArea=document.querySelector(".record-photos");photoArea.addEventListener("touchstart",e=>{touchX=e.changedTouches[0].screenX;touchY=e.changedTouches[0].screenY},{passive:true});photoArea.addEventListener("touchend",e=>{const dx=e.changedTouches[0].screenX-touchX,dy=e.changedTouches[0].screenY-touchY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))showPhoto(currentPhoto+(dx<0?1:-1),dx<0?1:-1)},{passive:true});
