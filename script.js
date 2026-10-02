/* ==========================================================================
   Confession & Proposal Website Maker — Main Application Logic
   ========================================================================== */

(function () {
  'use strict';

  // Application State
  let config = {
    partnerName: "",
    senderName: "",
    firstMetDate: "",
    proposalQuestion: "",
    dateHeader: "",
    letterTitle: "",
    letterBody: "",
    photos: ["", "", "", ""],
    photoCaptions: ["", "", "", ""]
  };

  let particles = [];
  let fireworksParticles = [];
  let isFireworksRunning = false;
  let audioPlaying = false;

  // DOM Elements
  const creatorView = document.getElementById('creatorView');
  const crushView = document.getElementById('crushView');
  const bgCanvas = document.getElementById('bgCanvas');
  const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;
  const fwCanvas = document.getElementById('fireworksCanvas');
  const fwCtx = fwCanvas ? fwCanvas.getContext('2d') : null;

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initBgCanvas();

    if (hasUrlParams()) {
      loadCustomizerFromUrl();
      showCrushView();
    } else {
      showCreatorView();
    }

    initWizardForm();
    initPhotoInputs();
    initEnvelope();
    initProposalLogic();
    initAudioController();
  });

  /* ==========================================================================
     1. URL Parameter Decoder & View Switcher
     ========================================================================== */
  function hasUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('d');
  }

  function loadCustomizerFromUrl() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const encoded = urlParams.get('d');
      if (encoded) {
        const decoded = atob(decodeURIComponent(encoded));
        config = Object.assign({}, config, JSON.parse(decoded));
      }
    } catch (e) {
      console.warn("Could not parse URL parameter:", e);
    }
  }

  function showCreatorView() {
    if (creatorView) creatorView.classList.remove('hidden');
    if (crushView) crushView.classList.add('hidden');
  }

  function showCrushView() {
    if (creatorView) creatorView.classList.add('hidden');
    if (crushView) crushView.classList.remove('hidden');
    renderCrushDOM();
    startLiveTimer();
  }

  /* ==========================================================================
     2. Form Wizard Navigation (Steps 1 to 5)
     ========================================================================== */
  function initWizardForm() {
    const nextBtns = document.querySelectorAll('.next-step-btn');
    const prevBtns = document.querySelectorAll('.prev-step-btn');
    const stepItems = document.querySelectorAll('.step-item');

    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-next');
        if (target) goToStep(target);
      });
    });

    prevBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-prev');
        if (target) goToStep(target);
      });
    });

    stepItems.forEach(item => {
      item.addEventListener('click', () => {
        const step = item.getAttribute('data-step');
        if (step) goToStep(step);
      });
    });

    // Action buttons
    const previewBtn = document.getElementById('previewSiteBtn');
    if (previewBtn) previewBtn.addEventListener('click', () => {
      collectFormData();
      showCrushView();
    });

    const shareBtn = document.getElementById('copyShareLinkBtn');
    if (shareBtn) shareBtn.addEventListener('click', generateShareableLink);

    const zipBtn = document.getElementById('downloadZipBtn');
    if (zipBtn) zipBtn.addEventListener('click', exportCustomZip);

    const floatCreateBtn = document.getElementById('floatingCreateBtn');
    if (floatCreateBtn) floatCreateBtn.addEventListener('click', () => {
      // Clear URL query string and show creator
      window.history.pushState({}, document.title, window.location.pathname);
      showCreatorView();
    });
  }

  function goToStep(stepNum) {
    document.querySelectorAll('.form-step-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.step-item').forEach(i => i.classList.remove('active'));

    const page = document.querySelector(`.form-step-page[data-step="${stepNum}"]`);
    const item = document.querySelector(`.step-item[data-step="${stepNum}"]`);

    if (page) page.classList.add('active');
    if (item) item.classList.add('active');
  }

  function collectFormData() {
    config.partnerName = document.getElementById('partnerName').value || "Your Love";
    config.senderName = document.getElementById('senderName').value || "Your Admirer";
    config.firstMetDate = document.getElementById('firstMetDate').value || new Date().toISOString();
    config.proposalQuestion = document.getElementById('proposalQuestion').value || "Will you spend the rest of your life with me?";
    config.dateHeader = document.getElementById('dateHeader').value || "Now... Let's Plan Another Unforgettable Day Together! 🎟️";
    config.letterTitle = document.getElementById('letterTitle').value || "Written in the Stars ✨";
    config.letterBody = document.getElementById('letterBody').value || "From the moment we met, my heart knew you were special...";

    for (let i = 1; i <= 4; i++) {
      const urlVal = document.getElementById(`urlPhoto${i}`).value;
      const capVal = document.getElementById(`capPhoto${i}`).value;
      if (urlVal) config.photos[i - 1] = urlVal;
      if (capVal) config.photoCaptions[i - 1] = capVal;
    }
  }

  function initPhotoInputs() {
    for (let i = 1; i <= 4; i++) {
      const fileInput = document.getElementById(`filePhoto${i}`);
      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              config.photos[i - 1] = event.target.result;
            };
            reader.readAsDataURL(file);
          }
        });
      }
    }
  }

  /* ==========================================================================
     3. Crush View DOM Renderer
     ========================================================================== */
  function renderCrushDOM() {
    document.getElementById('crushPartnerName').textContent = config.partnerName || "Your Love";
    document.getElementById('crushSenderName').textContent = config.senderName || "Your Admirer";

    const dateObj = new Date(config.firstMetDate);
    document.getElementById('crushFirstMetDate').textContent = isNaN(dateObj.getTime()) ? "Special Day" : dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    document.getElementById('crushLetterTitle').textContent = config.letterTitle || "Written in the Stars ✨";
    document.getElementById('crushLetterBody').textContent = config.letterBody || "From the moment our paths crossed, my universe changed forever...";
    document.getElementById('crushProposalQuestion').textContent = config.proposalQuestion || "Will you spend the rest of your life with me?";
    document.getElementById('crushDateHeader').textContent = config.dateHeader || "Now... Let's Plan Another Unforgettable Day Together! 🎟️";

    renderPhotoGallery();
    renderDateIdeas();
  }

  function renderPhotoGallery() {
    const grid = document.getElementById('crushPhotoGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const defaultPhotos = [
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500",
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=500",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500"
    ];

    const rotations = [-3, 2, -2, 3];

    for (let i = 0; i < 4; i++) {
      const src = config.photos[i] || defaultPhotos[i];
      const caption = config.photoCaptions[i] || `Precious Moment #${i + 1} ✨`;

      const card = document.createElement('div');
      card.className = 'polaroid-card';
      card.style.setProperty('--rot', rotations[i % 4]);
      card.innerHTML = `
        <img src="${src}" alt="Photo ${i+1}">
        <p class="polaroid-caption">${caption}</p>
      `;
      grid.appendChild(card);
    }
  }

  function renderDateIdeas() {
    const grid = document.getElementById('crushDateGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const dates = [
      { title: "Stargazing Picnic 🌌", desc: "Cozy blankets, warm drinks, and endless night sky talk." },
      { title: "Candlelight Dinner 🕯️", desc: "Fine food, soft music, and eyes locked on yours." },
      { title: "Sunset Walk 🌅", desc: "Holding hands by the ocean waves as the sky turns pink." },
      { title: "Cozy Movie Night 🍿", desc: "Fairy lights, giant pillows, popcorn, and snuggling close." }
    ];

    dates.forEach(d => {
      const card = document.createElement('div');
      card.className = 'glass-card date-card';
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <h4>${d.title}</h4>
        <p style="font-size:0.85rem; color: var(--text-muted);">${d.desc}</p>
      `;
      card.addEventListener('click', () => card.classList.toggle('selected'));
      grid.appendChild(card);
    });
  }

  /* ==========================================================================
     4. Live Love Timer
     ========================================================================== */
  function startLiveTimer() {
    function update() {
      const startDate = new Date(config.firstMetDate || new Date());
      const now = new Date();
      let diff = Math.max(0, now - startDate);

      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      const years = Math.floor(totalDays / 365.25);
      const days = Math.floor(totalDays % 365.25);

      document.getElementById('crushYears').textContent = years;
      document.getElementById('crushDays').textContent = String(days).padStart(3, '0');
      document.getElementById('crushHours').textContent = String(hours).padStart(2, '0');
      document.getElementById('crushMins').textContent = String(minutes).padStart(2, '0');
      document.getElementById('crushSecs').textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  /* ==========================================================================
     5. Envelope & Proposal Logic
     ========================================================================== */
  function initEnvelope() {
    const envelope = document.getElementById('romanticEnvelope');
    const letterPaper = document.getElementById('romanticLetterPaper');

    if (envelope) {
      envelope.addEventListener('click', () => {
        envelope.style.transform = 'scale(0.8) rotateX(90deg)';
        envelope.style.opacity = '0';
        setTimeout(() => {
          envelope.classList.add('hidden');
          if (letterPaper) letterPaper.classList.remove('hidden');
        }, 300);
      });
    }
  }

  function initProposalLogic() {
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const successPanel = document.getElementById('successPanel');

    if (noBtn) {
      const moveNoBtn = () => {
        const parent = noBtn.parentElement;
        const pRect = parent.getBoundingClientRect();
        const newX = Math.random() * (pRect.width - 100) - (pRect.width / 2 - 50);
        const newY = Math.random() * 80 - 40;
        noBtn.style.transform = `translate(${newX}px, ${newY}px)`;
      };

      noBtn.addEventListener('mouseenter', moveNoBtn);
      noBtn.addEventListener('click', () => {
        moveNoBtn();
        noBtn.querySelector('span').textContent = "Yes! 🥰";
      });
    }

    if (yesBtn) {
      yesBtn.addEventListener('click', () => {
        yesBtn.parentElement.classList.add('hidden');
        if (successPanel) successPanel.classList.remove('hidden');
        startFireworks();
      });
    }

    const confirmBtn = document.getElementById('confirmDateBtn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        showToast("Our date is officially locked in! 💖✨");
      });
    }
  }

  /* Canvas Particle Animation */
  function initBgCanvas() {
    if (!bgCanvas || !bgCtx) return;

    function resize() {
      bgCanvas.width = window.innerWidth;
      bgCanvas.height = window.innerHeight;
      createParticles();
    }

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(animateBgCanvas);
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * bgCanvas.width,
        y: Math.random() * bgCanvas.height,
        r: Math.random() * 2 + 1,
        alpha: Math.random(),
        speed: Math.random() * 0.5 + 0.2
      });
    }
  }

  function animateBgCanvas() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    particles.forEach(p => {
      p.y -= p.speed;
      if (p.y < 0) p.y = bgCanvas.height;

      bgCtx.save();
      bgCtx.globalAlpha = p.alpha;
      bgCtx.fillStyle = '#ff4d6d';
      bgCtx.beginPath();
      bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      bgCtx.fill();
      bgCtx.restore();
    });

    requestAnimationFrame(animateBgCanvas);
  }

  function startFireworks() {
    if (!fwCanvas || !fwCtx || isFireworksRunning) return;
    isFireworksRunning = true;

    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;

    for (let i = 0; i < 120; i++) {
      fireworksParticles.push({
        x: fwCanvas.width / 2,
        y: fwCanvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        alpha: 1,
        color: ['#ffd166', '#ff4d6d', '#9d4edd', '#ffffff'][Math.floor(Math.random() * 4)],
        r: Math.random() * 3 + 1
      });
    }

    requestAnimationFrame(animateFireworks);
  }

  function animateFireworks() {
    if (!fwCtx) return;
    fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);

    fireworksParticles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.alpha -= 0.015;

      if (p.alpha <= 0) {
        fireworksParticles.splice(idx, 1);
        return;
      }

      fwCtx.save();
      fwCtx.globalAlpha = p.alpha;
      fwCtx.fillStyle = p.color;
      fwCtx.beginPath();
      fwCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      fwCtx.fill();
      fwCtx.restore();
    });

    if (fireworksParticles.length > 0) requestAnimationFrame(animateFireworks);
    else isFireworksRunning = false;
  }

  /* ==========================================================================
     6. Exporters (Share Link & ZIP)
     ========================================================================== */
  function generateShareableLink() {
    collectFormData();
    try {
      const dataStr = JSON.stringify(config);
      const encoded = encodeURIComponent(btoa(dataStr));
      const shareUrl = `${window.location.origin}${window.location.pathname}?d=${encoded}`;

      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast("Unique shareable link copied to clipboard! 📋✨");
      });
    } catch (e) {
      showToast("Error generating link.");
    }
  }

  function exportCustomZip() {
    collectFormData();
    if (typeof JSZip === 'undefined') {
      showToast("Zip library loading...");
      return;
    }

    showToast("Assembling your standalone ZIP website... 📦");

    const zip = new JSZip();
    const configJS = `window.CONFESSION_CONFIG = ${JSON.stringify(config, null, 2)};`;
    zip.file("config.js", configJS);

    Promise.all([
      fetch('index.html').then(r => r.text()),
      fetch('style.css').then(r => r.text()),
      fetch('script.js').then(r => r.text())
    ]).then(([html, css, js]) => {
      zip.file("index.html", html);
      zip.file("style.css", css);
      zip.file("script.js", js);

      zip.generateAsync({ type: "blob" }).then(content => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = `Confession-Website-${(config.partnerName || 'Custom').replace(/\s+/g, '-')}.zip`;
        a.click();
        showToast("ZIP Download Started! 🚀");
      });
    });
  }

  function initAudioController() {
    const audioToggleBtn = document.getElementById('audioToggleBtn');
    const bgAudio = document.getElementById('bgAudio');
    const audioIcon = document.getElementById('audioIcon');

    if (audioToggleBtn && bgAudio) {
      audioToggleBtn.addEventListener('click', () => {
        if (audioPlaying) {
          bgAudio.pause();
          if (audioIcon) audioIcon.textContent = "🎵";
          audioPlaying = false;
        } else {
          bgAudio.play().then(() => {
            if (audioIcon) audioIcon.textContent = "🔊";
            audioPlaying = true;
          }).catch(err => console.log("Audio play blocked:", err));
        }
      });
    }
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toastText');
    if (!toast || !text) return;

    text.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3500);
  }

})();
