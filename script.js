/**
 * Complete Interactive Script for Aleena's Confession Website
 */

document.addEventListener("DOMContentLoaded", () => {
  // 0. Parse Custom Data from URL (if shared)
  checkURLParamsForConfig();

  // 1. Dynamic Contents Setup
  setupContentFromConfig();

  // 2. Ambient Particles & Confetti
  initAmbientCanvas();
  initConfettiEngine();

  // 3. Audio & Vinyl Player
  initRomanticAudio();

  // 4. Live Love Timer
  initLoveCounter();

  // 5. Envelope & Flow
  setupEnvelopeInteractions();

  // 6. Mini-Quiz Engine
  setupQuizEngine();

  // 7. Proposal Physics (Runaway No & YES)
  setupProposalInteractions();

  // 8. Date Planner & Golden Ticket Generator
  setupDatePlanner();

  // 9. Builder Modal & ZIP Generator
  setupBuilderModal();
});

/* =========================================================================
   1. Dynamic Content Injection from CONFIG
   ========================================================================= */
function setupContentFromConfig() {
  if (typeof CONFIG === "undefined") return;

  // Header & Subtitle
  const mainTitle = document.getElementById("mainTitle");
  if (mainTitle) mainTitle.innerText = `For ${CONFIG.crushName} ❤️`;

  const subTitle = document.getElementById("subTitle");
  if (subTitle) subTitle.innerText = CONFIG.subtitle;

  // Envelope
  const letterPeekTo = document.getElementById("letterPeekTo");
  if (letterPeekTo) letterPeekTo.innerText = CONFIG.envelopeTitle;

  const envHint = document.getElementById("envelopeHint");
  if (envHint) envHint.innerHTML = `<span>💌</span> ${CONFIG.envelopeHint}`;

  // Letter Greeting & Date
  const letterGreeting = document.getElementById("letterGreeting");
  if (letterGreeting) letterGreeting.innerText = CONFIG.letterGreeting;

  const letterDate = document.getElementById("letterDate");
  if (letterDate) {
    const today = new Date();
    letterDate.innerText = today.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  // Counter Title
  const counterTitle = document.getElementById("counterTitle");
  if (counterTitle && CONFIG.counterTitle) counterTitle.innerText = CONFIG.counterTitle;

  // Polaroids
  const polaroidsTitle = document.getElementById("polaroidsTitle");
  if (polaroidsTitle && CONFIG.polaroidsTitle) polaroidsTitle.innerText = CONFIG.polaroidsTitle;

  const polaroidsGrid = document.getElementById("polaroidsGrid");
  if (polaroidsGrid && CONFIG.polaroids) {
    polaroidsGrid.innerHTML = "";
    const rotations = [-3, 2, -2, 3];
    CONFIG.polaroids.forEach((p, idx) => {
      const card = document.createElement("div");
      card.className = "polaroid-card";
      card.style.setProperty("--rot", `${rotations[idx % rotations.length]}deg`);
      card.innerHTML = `
        <div class="polaroid-img-wrapper">
          <img src="${p.image}" alt="Memory" loading="lazy">
        </div>
        <div class="polaroid-caption">${p.caption}</div>
        <div class="polaroid-date">${p.date}</div>
      `;
      polaroidsGrid.appendChild(card);
    });
  }

  // Reasons Grid
  const reasonsTitle = document.getElementById("reasonsTitle");
  if (reasonsTitle && CONFIG.reasonsTitle) reasonsTitle.innerText = CONFIG.reasonsTitle;

  const reasonsGrid = document.getElementById("reasonsGrid");
  if (reasonsGrid && CONFIG.reasons) {
    reasonsGrid.innerHTML = "";
    CONFIG.reasons.forEach(r => {
      const card = document.createElement("div");
      card.className = "reason-card";
      card.innerHTML = `
        <div class="reason-icon">${r.icon}</div>
        <h4>${r.title}</h4>
        <p>${r.desc}</p>
      `;
      reasonsGrid.appendChild(card);
    });
  }

  // Proposal Texts
  const propQuestion = document.getElementById("proposalQuestion");
  if (propQuestion) propQuestion.innerText = CONFIG.proposal.question;

  const btnYes = document.getElementById("btnYes");
  if (btnYes) btnYes.innerText = CONFIG.proposal.yesBtn;

  const btnNo = document.getElementById("btnNo");
  if (btnNo) btnNo.innerText = CONFIG.proposal.noBtn;

  // Celebration Texts
  const celebTitle = document.getElementById("celebrationTitle");
  if (celebTitle) celebTitle.innerText = CONFIG.celebration.title;

  const celebText = document.getElementById("celebrationText");
  if (celebText) celebText.innerText = CONFIG.celebration.message;

  const celebSig = document.getElementById("celebrationSignature");
  if (celebSig) celebSig.innerText = CONFIG.celebration.signature;
}

/* =========================================================================
   2. Romantic Web Audio Music Synthesizer & Vinyl Player
   ========================================================================= */
let audioCtx = null;
let isMusicPlaying = false;
let musicInterval = null;

function initRomanticAudio() {
  const audioToggle = document.getElementById("audioToggle");
  const musicStatus = document.getElementById("musicStatus");
  const vinylWidget = document.getElementById("vinylWidget");

  function startMusic() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    if (!isMusicPlaying) {
      isMusicPlaying = true;
      audioToggle.classList.add("playing");
      if (vinylWidget) vinylWidget.classList.add("spinning");
      musicStatus.innerText = "Music: On 🎵";
      playMelodyLoop();
    }
  }

  function stopMusic() {
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
    }
    isMusicPlaying = false;
    audioToggle.classList.remove("playing");
    if (vinylWidget) vinylWidget.classList.remove("spinning");
    musicStatus.innerText = "Music: Off 🔇";
  }

  function toggleMusic() {
    if (isMusicPlaying) stopMusic();
    else startMusic();
  }

  audioToggle.addEventListener("click", toggleMusic);
  if (vinylWidget) vinylWidget.addEventListener("click", toggleMusic);

  window.startRomanticMusic = startMusic;
}

function playMelodyLoop() {
  if (!audioCtx) return;

  const chords = [
    [293.66, 369.99, 440.0, 554.37], // Dmaj7: D4, F#4, A4, C#5
    [246.94, 293.66, 369.99, 440.0],  // Bm7: B3, D4, F#4, A4
    [196.0, 246.94, 293.66, 369.99],  // Gmaj7: G3, B3, D4, F#4
    [220.0, 277.18, 329.63, 440.0]   // A7: A3, C#4, E4, A4
  ];

  let chordIndex = 0;
  let noteIndex = 0;

  function scheduleNextNote() {
    if (!isMusicPlaying || !audioCtx) return;

    const currentChord = chords[chordIndex];
    const freq = currentChord[noteIndex];

    playTone(freq, 0.9, 0.08);

    noteIndex++;
    if (noteIndex >= currentChord.length) {
      noteIndex = 0;
      chordIndex = (chordIndex + 1) % chords.length;
    }
  }

  musicInterval = setInterval(scheduleNextNote, 420);
}

function playTone(freq, duration = 1.0, volume = 0.1) {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error(e);
  }
}

function playMagicalChime() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
  notes.forEach((freq, idx) => {
    setTimeout(() => playTone(freq, 1.2, 0.12), idx * 100);
  });
}

/* =========================================================================
   3. Live Love Timer ("Time Since You Stole My Heart")
   ========================================================================= */
function initLoveCounter() {
  const countDays = document.getElementById("countDays");
  const countHours = document.getElementById("countHours");
  const countMins = document.getElementById("countMins");
  const countSecs = document.getElementById("countSecs");

  if (!countDays) return;

  const startDate = new Date(CONFIG.startDate || "2024-01-01T00:00:00").getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const diff = Math.max(now - startDate, 0);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    countDays.innerText = days;
    countHours.innerText = hours.toString().padStart(2, "0");
    countMins.innerText = mins.toString().padStart(2, "0");
    countSecs.innerText = secs.toString().padStart(2, "0");
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* =========================================================================
   4. Ambient Canvas: Floating Hearts & Stars
   ========================================================================= */
function initAmbientCanvas() {
  const canvas = document.getElementById("ambientCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = 35;

  class FloatingParticle {
    constructor() {
      this.reset();
      this.y = Math.random() * height;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + 20;
      this.size = Math.random() * 12 + 8;
      this.speedY = Math.random() * 0.8 + 0.3;
      this.speedX = Math.sin(Math.random() * Math.PI) * 0.4;
      this.opacity = Math.random() * 0.45 + 0.2;
      this.isHeart = Math.random() > 0.4;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX + Math.sin(this.y * 0.01) * 0.3;
      this.rotation += this.rotationSpeed;

      if (this.y < -30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      if (this.isHeart) {
        ctx.fillStyle = "#ff6b8b";
        ctx.beginPath();
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        ctx.bezierCurveTo(-this.size / 2, -topCurveHeight, -this.size, topCurveHeight, 0, this.size);
        ctx.bezierCurveTo(this.size, topCurveHeight, this.size / 2, -topCurveHeight, 0, topCurveHeight);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = "#ffe4eb";
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.2, 0, Math.PI * 2);
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ffb6c1";
        ctx.fill();
      }

      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new FloatingParticle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
}

/* =========================================================================
   5. Envelope Opening & Typewriter Flow
   ========================================================================= */
function setupEnvelopeInteractions() {
  const waxSeal = document.getElementById("waxSeal");
  const envelope = document.getElementById("envelope");
  const envelopeSection = document.getElementById("envelopeSection");
  const letterSection = document.getElementById("letterSection");
  const experienceFlow = document.getElementById("experienceFlow");
  const continueToExperience = document.getElementById("continueToExperience");

  let isOpened = false;

  function openEnvelope() {
    if (isOpened) return;
    isOpened = true;

    if (window.startRomanticMusic) {
      window.startRomanticMusic();
    }

    playMagicalChime();
    burstConfetti(window.innerWidth / 2, window.innerHeight / 2, 40);
    envelope.classList.add("open");

    setTimeout(() => {
      envelopeSection.style.opacity = "0";
      envelopeSection.style.transform = "scale(0.85)";

      setTimeout(() => {
        envelopeSection.style.display = "none";
        letterSection.style.display = "block";
        startTypewriter();
      }, 500);
    }, 1100);
  }

  if (waxSeal) waxSeal.addEventListener("click", openEnvelope);
  if (envelope) envelope.addEventListener("click", openEnvelope);

  if (continueToExperience) {
    continueToExperience.addEventListener("click", () => {
      experienceFlow.style.display = "block";
      continueToExperience.style.display = "none";
      experienceFlow.scrollIntoView({ behavior: "smooth" });
    });
  }
}

let typewriterTimeout = null;
function startTypewriter() {
  const contentEl = document.getElementById("typewriterContent");
  const skipBtn = document.getElementById("skipTypewriter");
  const continueBtn = document.getElementById("continueToExperience");

  if (!contentEl || !CONFIG.letterParagraphs) return;

  const fullText = CONFIG.letterParagraphs.join("\n\n");
  let currentIndex = 0;

  contentEl.innerHTML = '<span id="typedText"></span><span class="cursor"></span>';
  const typedSpan = document.getElementById("typedText");

  function typeChar() {
    if (currentIndex < fullText.length) {
      typedSpan.innerText += fullText.charAt(currentIndex);
      currentIndex++;
      const delay = fullText.charAt(currentIndex - 1) === "." ? 280 : 32;
      typewriterTimeout = setTimeout(typeChar, delay);
    } else {
      finishTypewriter();
    }
  }

  function finishTypewriter() {
    if (typewriterTimeout) clearTimeout(typewriterTimeout);
    typedSpan.innerText = fullText;
    if (skipBtn) skipBtn.style.display = "none";
    if (continueBtn) continueBtn.style.display = "inline-flex";
  }

  if (skipBtn) {
    skipBtn.addEventListener("click", finishTypewriter);
  }

  typeChar();
}

/* =========================================================================
   6. The Aleena Mini-Quiz Engine
   ========================================================================= */
function setupQuizEngine() {
  const quizTitle = document.getElementById("quizTitle");
  const quizSubtitle = document.getElementById("quizSubtitle");
  const quizProgress = document.getElementById("quizProgress");
  const quizQuestionText = document.getElementById("quizQuestionText");
  const quizOptionsList = document.getElementById("quizOptionsList");
  const quizFeedback = document.getElementById("quizFeedback");

  if (!quizQuestionText || !CONFIG.quizQuestions) return;

  if (quizTitle && CONFIG.quizTitle) quizTitle.innerText = CONFIG.quizTitle;
  if (quizSubtitle && CONFIG.quizSubtitle) quizSubtitle.innerText = CONFIG.quizSubtitle;

  let currentQIndex = 0;
  const questions = CONFIG.quizQuestions;

  function renderQuestion() {
    if (currentQIndex >= questions.length) {
      // Quiz complete!
      quizProgress.innerText = "Completed! 🎉";
      quizQuestionText.innerText = "✨ You passed with a perfect 100%! My heart is completely yours! ✨";
      quizOptionsList.innerHTML = `
        <div style="font-size: 1.1rem; color: #ff85a1; text-align: center; padding: 12px; font-weight: 600;">
          Scroll down for the final question... 💌 ↓
        </div>
      `;
      quizFeedback.innerText = "";
      burstConfetti(window.innerWidth / 2, window.innerHeight * 0.7, 30);
      return;
    }

    const q = questions[currentQIndex];
    quizProgress.innerText = `Question ${currentQIndex + 1} of ${questions.length}`;
    quizQuestionText.innerText = q.question;
    quizOptionsList.innerHTML = "";
    quizFeedback.innerText = "";

    q.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option-btn";
      btn.innerText = opt.text;
      btn.addEventListener("click", () => {
        playMagicalChime();
        quizFeedback.innerText = opt.feedback;
        burstConfetti(window.innerWidth / 2, window.innerHeight * 0.6, 20);

        // Disable options
        const allBtns = quizOptionsList.querySelectorAll(".quiz-option-btn");
        allBtns.forEach(b => b.disabled = true);

        // Advance after brief pause
        setTimeout(() => {
          currentQIndex++;
          renderQuestion();
        }, 1300);
      });
      quizOptionsList.appendChild(btn);
    });
  }

  renderQuestion();
}

/* =========================================================================
   7. Proposal Buttons: Playful Runaway "No" & Glowing "YES"
   ========================================================================= */
function setupProposalInteractions() {
  const btnYes = document.getElementById("btnYes");
  const btnNo = document.getElementById("btnNo");
  const teaseMessage = document.getElementById("teaseMessage");
  const celebrationOverlay = document.getElementById("celebrationOverlay");

  let noClickCount = 0;

  function dodgeNoButton() {
    noClickCount++;

    if (CONFIG.proposal.noMessages && CONFIG.proposal.noMessages.length > 0) {
      const msgIndex = (noClickCount - 1) % CONFIG.proposal.noMessages.length;
      teaseMessage.innerText = CONFIG.proposal.noMessages[msgIndex];
      teaseMessage.style.opacity = "1";
    }

    const newScale = Math.min(1 + noClickCount * 0.15, 2.2);
    btnYes.style.transform = `scale(${newScale})`;

    const arena = document.querySelector(".buttons-arena");
    if (!arena) return;

    const arenaRect = arena.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();

    const maxDeltaX = (arenaRect.width - btnRect.width) / 2;
    const maxDeltaY = 60;

    const randomX = (Math.random() - 0.5) * maxDeltaX * 1.6;
    const randomY = (Math.random() - 0.5) * maxDeltaY * 2;

    btnNo.style.transform = `translate(${randomX}px, ${randomY}px)`;
  }

  if (btnNo) {
    btnNo.addEventListener("mouseenter", dodgeNoButton);
    btnNo.addEventListener("touchstart", (e) => {
      e.preventDefault();
      dodgeNoButton();
    });
    btnNo.addEventListener("click", (e) => {
      e.preventDefault();
      dodgeNoButton();
    });
  }

  if (btnYes) {
    btnYes.addEventListener("click", () => {
      celebrationOverlay.style.display = "flex";
      playMagicalChime();
      startContinuousCelebration();
    });
  }
}

/* =========================================================================
   8. Plan Our First Date & Golden Ticket PNG Generator
   ========================================================================= */
function setupDatePlanner() {
  const grid = document.getElementById("dateActivitiesGrid");
  const chosenDateInput = document.getElementById("chosenDateInput");
  const btnGenerateTicket = document.getElementById("btnGenerateTicket");
  const ticketWrapper = document.getElementById("ticketWrapper");
  const ticketPassengers = document.getElementById("ticketPassengers");
  const ticketActivity = document.getElementById("ticketActivity");
  const ticketDateText = document.getElementById("ticketDateText");
  const btnDownloadTicket = document.getElementById("btnDownloadTicket");

  if (!grid || !CONFIG.datePlanner) return;

  // Set default date to this coming weekend
  if (chosenDateInput) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 3);
    chosenDateInput.value = nextDate.toISOString().split("T")[0];
  }

  let selectedActivity = CONFIG.datePlanner.activities[0];

  CONFIG.datePlanner.activities.forEach((act, idx) => {
    const div = document.createElement("div");
    div.className = `activity-option ${idx === 0 ? "selected" : ""}`;
    div.innerHTML = `
      <div class="activity-icon">${act.icon}</div>
      <div class="activity-title">${act.title}</div>
    `;
    div.addEventListener("click", () => {
      grid.querySelectorAll(".activity-option").forEach(el => el.classList.remove("selected"));
      div.classList.add("selected");
      selectedActivity = act;
    });
    grid.appendChild(div);
  });

  if (btnGenerateTicket) {
    btnGenerateTicket.addEventListener("click", () => {
      playMagicalChime();
      burstConfetti(window.innerWidth / 2, window.innerHeight * 0.5, 45);

      ticketPassengers.innerText = `${CONFIG.crushName} & ${CONFIG.yourName}`;
      ticketActivity.innerText = `${selectedActivity.icon} ${selectedActivity.title}`;

      if (chosenDateInput && chosenDateInput.value) {
        const d = new Date(chosenDateInput.value);
        ticketDateText.innerText = d.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric"
        });
      } else {
        ticketDateText.innerText = "Anytime You Wish ✨";
      }

      ticketWrapper.style.display = "block";
      ticketWrapper.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (btnDownloadTicket) {
    btnDownloadTicket.addEventListener("click", () => {
      generateTicketPNG(
        `${CONFIG.crushName} & ${CONFIG.yourName}`,
        `${selectedActivity.icon} ${selectedActivity.title}`,
        ticketDateText.innerText
      );
    });
  }
}

// Canvas-based Golden Ticket rendering for crystal-clear PNG export
function generateTicketPNG(passengers, activity, dateStr) {
  const canvas = document.getElementById("ticketExportCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const w = canvas.width;
  const h = canvas.height;

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, "#190d24");
  bgGrad.addColorStop(1, "#36112d");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Outer Golden Border
  ctx.strokeStyle = "#fcd34d";
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, w - 32, h - 32);

  // Inner dashed border
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = "rgba(252, 211, 77, 0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, w - 52, h - 52);
  ctx.setLineDash([]);

  // Header
  ctx.fillStyle = "#fcd34d";
  ctx.font = "bold 24px 'Playfair Display', serif";
  ctx.fillText("✦ GOLDEN FIRST DATE PASS ✦", 50, 75);

  ctx.fillStyle = "#ffdbe4";
  ctx.font = "14px 'Outfit', sans-serif";
  ctx.fillText("OFFICIAL VIP RESERVATION", 50, 100);

  // Divider
  ctx.strokeStyle = "rgba(252, 211, 77, 0.35)";
  ctx.beginPath();
  ctx.moveTo(50, 120);
  ctx.lineTo(w - 50, 120);
  ctx.stroke();

  // Field: Passengers
  ctx.fillStyle = "#f7a8b8";
  ctx.font = "12px 'Outfit', sans-serif";
  ctx.fillText("PASSENGERS OF HONOR", 50, 155);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px 'Playfair Display', serif";
  ctx.fillText(passengers, 50, 190);

  // Field: Activity
  ctx.fillStyle = "#f7a8b8";
  ctx.font = "12px 'Outfit', sans-serif";
  ctx.fillText("DATE DESTINATION & ADVENTURE", 50, 235);

  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 22px 'Outfit', sans-serif";
  ctx.fillText(activity, 50, 268);

  // Field: Date
  ctx.fillStyle = "#f7a8b8";
  ctx.font = "12px 'Outfit', sans-serif";
  ctx.fillText("VALID RESERVATION DATE", 50, 310);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px 'Outfit', sans-serif";
  ctx.fillText(dateStr, 50, 340);

  // Right Side: Barcode & Hearts
  const barcodeX = w - 240;
  ctx.strokeStyle = "rgba(252, 211, 77, 0.25)";
  ctx.beginPath();
  ctx.moveTo(barcodeX - 25, 135);
  ctx.lineTo(barcodeX - 25, 360);
  ctx.stroke();

  ctx.fillStyle = "#fcd34d";
  ctx.font = "34px monospace";
  ctx.fillText("||| | |||| | ||", barcodeX, 230);

  ctx.font = "13px 'Outfit', sans-serif";
  ctx.fillStyle = "#ffdbe4";
  ctx.fillText("SEAT: In My Heart ❤️", barcodeX, 270);
  ctx.fillText("ADMISSION: 100% Free Hugs", barcodeX, 295);

  // Watermark Heart
  ctx.fillStyle = "rgba(255, 75, 114, 0.12)";
  ctx.font = "120px sans-serif";
  ctx.fillText("💖", w - 190, 160);

  // Trigger Download
  const link = document.createElement("a");
  link.download = `golden-date-ticket-for-${CONFIG.crushName.toLowerCase()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/* =========================================================================
   9. Confetti & Firework Particle Engine
   ========================================================================= */
let confettiParticles = [];
let isContinuousConfetti = false;

function initConfettiEngine() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotSpeed;
      p.opacity -= p.fade;

      if (p.opacity <= 0 || p.y > canvas.height + 20) {
        confettiParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(p.opacity, 0);
      ctx.fillStyle = p.color;

      if (p.isHeart) {
        ctx.beginPath();
        const s = p.size;
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s / 2, -s * 0.3, -s, s * 0.3, 0, s);
        ctx.bezierCurveTo(s, s * 0.3, s / 2, -s * 0.3, 0, s * 0.3);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      }

      ctx.restore();
    }

    if (isContinuousConfetti && Math.random() < 0.3) {
      burstConfetti(Math.random() * canvas.width, Math.random() * (canvas.height * 0.5), 18);
    }

    requestAnimationFrame(render);
  }

  render();
}

function burstConfetti(x, y, count = 35) {
  const colors = ["#ff416c", "#ff4b2b", "#ff758c", "#ffd700", "#ff9a9e", "#ffffff", "#c77dff"];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 2;
    confettiParticles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      gravity: 0.22,
      size: Math.random() * 10 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      opacity: 1,
      fade: Math.random() * 0.012 + 0.006,
      isHeart: Math.random() > 0.4
    });
  }
}

function startContinuousCelebration() {
  isContinuousConfetti = true;
  const w = window.innerWidth;
  const h = window.innerHeight;
  burstConfetti(w * 0.2, h * 0.4, 60);
  burstConfetti(w * 0.8, h * 0.4, 60);
  burstConfetti(w * 0.5, h * 0.3, 80);
}

/* =========================================================================
   10. Builder Modal, URL Share Parameter & ZIP Exporter
   ========================================================================= */
function checkURLParamsForConfig() {
  const params = new URLSearchParams(window.location.search);
  const encodedData = params.get("d") || params.get("data");

  if (encodedData) {
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(encodedData)));
      if (decoded.c) CONFIG.crushName = decoded.c;
      if (decoded.y) CONFIG.yourName = decoded.y;
      if (decoded.d) CONFIG.startDate = decoded.d;
      if (decoded.p) CONFIG.proposal.question = decoded.p;
      if (decoded.l && Array.isArray(decoded.l)) CONFIG.letterParagraphs = decoded.l;

      // Update titles
      CONFIG.envelopeTitle = `To: ${CONFIG.crushName} 💌`;
      CONFIG.letterGreeting = `Dear ${CONFIG.crushName},`;
    } catch (e) {
      console.error("Failed to decode custom URL data:", e);
    }
  }
}

function setupBuilderModal() {
  const openBtn = document.getElementById("openBuilderBtn");
  const closeBtn = document.getElementById("closeBuilderBtn");
  const modal = document.getElementById("builderModal");

  const inputCrushName = document.getElementById("inputCrushName");
  const inputYourName = document.getElementById("inputYourName");
  const inputStartDate = document.getElementById("inputStartDate");
  const inputProposal = document.getElementById("inputProposal");
  const inputLetterText = document.getElementById("inputLetterText");

  const btnCopyShareLink = document.getElementById("btnCopyShareLink");
  const btnDownloadZip = document.getElementById("btnDownloadZip");

  if (!openBtn || !modal) return;

  // Populate initial values
  if (inputCrushName) inputCrushName.value = CONFIG.crushName || "";
  if (inputYourName) inputYourName.value = CONFIG.yourName || "";
  if (inputStartDate && CONFIG.startDate) {
    inputStartDate.value = CONFIG.startDate.split("T")[0];
  }
  if (inputProposal) inputProposal.value = CONFIG.proposal.question || "";
  if (inputLetterText && CONFIG.letterParagraphs) {
    inputLetterText.value = CONFIG.letterParagraphs.join("\n");
  }

  // Open & Close
  openBtn.addEventListener("click", () => modal.style.display = "flex");
  closeBtn.addEventListener("click", () => modal.style.display = "none");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Reactive updates on input
  function applyInputsToConfig() {
    if (inputCrushName.value.trim()) {
      CONFIG.crushName = inputCrushName.value.trim();
      CONFIG.envelopeTitle = `To: ${CONFIG.crushName} 💌`;
      CONFIG.letterGreeting = `Dear ${CONFIG.crushName},`;
    }
    if (inputYourName.value.trim()) CONFIG.yourName = inputYourName.value.trim();
    if (inputStartDate.value) CONFIG.startDate = `${inputStartDate.value}T00:00:00`;
    if (inputProposal.value.trim()) CONFIG.proposal.question = inputProposal.value.trim();
    if (inputLetterText.value.trim()) {
      CONFIG.letterParagraphs = inputLetterText.value.split("\n").filter(p => p.trim() !== "");
    }

    // Refresh display
    setupContentFromConfig();
    initLoveCounter();
  }

  [inputCrushName, inputYourName, inputStartDate, inputProposal, inputLetterText].forEach(el => {
    if (el) el.addEventListener("input", applyInputsToConfig);
  });

  // Copy Shareable Link Action
  if (btnCopyShareLink) {
    btnCopyShareLink.addEventListener("click", () => {
      applyInputsToConfig();

      const payload = {
        c: CONFIG.crushName,
        y: CONFIG.yourName,
        d: CONFIG.startDate,
        p: CONFIG.proposal.question,
        l: CONFIG.letterParagraphs
      };

      const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
      const baseUrl = window.location.origin + window.location.pathname;
      const shareUrl = `${baseUrl}?d=${encoded}`;

      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast("Shareable link copied to clipboard! 📋✨");
      }).catch(err => {
        showToast("Link created! Copy from browser address bar.");
      });
    });
  }

  // Open Builder Modal by default if no URL query parameter ?d= is present
  const hasUrlParam = window.location.search.includes("d=");
  if (!hasUrlParam && modal) {
    setTimeout(() => {
      modal.style.display = "flex";
    }, 500);
  }

  const btnPreviewSite = document.getElementById("btnPreviewSite");
  if (btnPreviewSite) {
    btnPreviewSite.addEventListener("click", () => {
      applyInputsToConfig();
      if (modal) modal.style.display = "none";
      showToast("Live Preview Activated! ✨");
    });
  }
}

function showToast(message) {
  const toast = document.getElementById("toastNotification");
  if (!toast) return;
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

function exportCustomSiteZip() {
  if (typeof JSZip === "undefined") {
    alert("ZIP library loading. Please try again in 2 seconds!");
    return;
  }

  const zip = new JSZip();

  // 1. Generate customized config.js string
  const customConfigStr = `/**
 * Configuration file generated for ${CONFIG.crushName}'s Confession Website
 */
const CONFIG = ${JSON.stringify(CONFIG, null, 2)};
`;

  // Add files to zip
  zip.file("config.js", customConfigStr);

  // Fetch local style.css, script.js and index.html
  Promise.all([
    fetch("index.html").then(res => res.text()),
    fetch("style.css").then(res => res.text()),
    fetch("script.js").then(res => res.text())
  ]).then(([html, css, js]) => {
    zip.file("index.html", html);
    zip.file("style.css", css);
    zip.file("script.js", js);

    zip.generateAsync({ type: "blob" }).then(content => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = `confession-site-for-${(CONFIG.crushName || 'love').toLowerCase()}.zip`;
      a.click();
      showToast("Custom website package downloaded! 📥✨");
    });
  }).catch(err => {
    zip.generateAsync({ type: "blob" }).then(content => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = `confession-site-for-${(CONFIG.crushName || 'love').toLowerCase()}.zip`;
      a.click();
      showToast("Custom website package downloaded! 📥✨");
    });
  });
}

