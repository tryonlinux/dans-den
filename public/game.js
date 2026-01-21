const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const helpEl = document.getElementById('help');
const overlayEl = document.getElementById('overlay');
const overlayTitleEl = document.getElementById('overlayTitle');
const overlayBodyEl = document.getElementById('overlayBody');
const startButtonEl = document.getElementById('startButton');

const state = {
  running: false,
  isKneeling: false,
  score: 0,
  speed: 300,
  spawnInterval: 1500,
  timeSinceSpawn: 0,
  timeSinceSpeedUp: 0,
  time: 0,
  lions: [],
  lastTime: 0,
  viewWidth: 0,
  viewHeight: 0,
  baseUnit: 0,
  groundY: 0,
  roofY: 0,
  horizonY: 0,
  player: {
    x: 0,
    width: 0,
    standHeight: 0,
    kneelHeight: 0,
  },
};

const prefersTouch = window.matchMedia('(pointer: coarse)').matches;
const helpText = prefersTouch
  ? 'Touch and hold to kneel and pray, so God closes their mouths.'
  : 'Hold space to kneel and pray, so God closes their mouths.';
helpEl.textContent = helpText;

let audioCtx = null;
let audioReady = false;

function svgToImage(svg) {
  const img = new Image();
  img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  return img;
}

function createLionSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160">
      <defs>
        <radialGradient id="mane" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#f6d08b"/>
          <stop offset="70%" stop-color="#c9832f"/>
          <stop offset="100%" stop-color="#a7651f"/>
        </radialGradient>
        <linearGradient id="fur" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#f0c275"/>
          <stop offset="100%" stop-color="#d5923e"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.25)"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <ellipse cx="100" cy="120" rx="70" ry="25" fill="rgba(0,0,0,0.15)"/>
        <ellipse cx="100" cy="78" rx="64" ry="44" fill="url(#fur)"/>
        <ellipse cx="100" cy="68" rx="56" ry="50" fill="url(#mane)"/>
        <ellipse cx="100" cy="62" rx="34" ry="28" fill="#f5d6a0"/>
        <ellipse cx="72" cy="64" rx="8" ry="10" fill="#1f1b16"/>
        <ellipse cx="128" cy="64" rx="8" ry="10" fill="#1f1b16"/>
        <circle cx="76" cy="60" r="3" fill="#ffffff"/>
        <circle cx="132" cy="60" r="3" fill="#ffffff"/>
        <ellipse cx="100" cy="78" rx="7" ry="6" fill="#1f1b16"/>
        <path d="M88 92c8 8 16 8 24 0" fill="none" stroke="#1f1b16" stroke-width="5" stroke-linecap="round"/>
        <path d="M60 60l-18-6" stroke="#1f1b16" stroke-width="4" stroke-linecap="round"/>
        <path d="M60 70l-20 0" stroke="#1f1b16" stroke-width="4" stroke-linecap="round"/>
        <path d="M140 60l18-6" stroke="#1f1b16" stroke-width="4" stroke-linecap="round"/>
        <path d="M140 70l20 0" stroke="#1f1b16" stroke-width="4" stroke-linecap="round"/>
        <rect x="58" y="112" width="12" height="26" rx="6" fill="#c88f43"/>
        <rect x="82" y="110" width="14" height="30" rx="6" fill="#d9a352"/>
        <rect x="104" y="110" width="14" height="30" rx="6" fill="#d9a352"/>
        <rect x="128" y="112" width="12" height="26" rx="6" fill="#c88f43"/>
        <path d="M150 82c24 10 30 26 18 42" fill="none" stroke="#c9832f" stroke-width="12" stroke-linecap="round"/>
        <path d="M150 82c16 10 20 20 10 30" fill="none" stroke="#f0c275" stroke-width="6" stroke-linecap="round"/>
      </g>
    </svg>
  `;
}

function createDanielRunSvgA() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 260">
      <defs>
        <linearGradient id="robe" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#2f4f7a"/>
          <stop offset="100%" stop-color="#1b2f52"/>
        </linearGradient>
        <linearGradient id="skin" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#f6d2b1"/>
          <stop offset="100%" stop-color="#e0b190"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.25)"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <ellipse cx="90" cy="246" rx="54" ry="10" fill="rgba(0,0,0,0.2)"/>
        <path d="M36 236l54-10 54 10-20-116H56z" fill="url(#robe)"/>
        <path d="M64 114h52l-26 38z" fill="#d8b789"/>
        <path d="M56 174h68l-8 28-26 6-26-6z" fill="#b88c55"/>
        <rect x="62" y="190" width="18" height="42" rx="8" fill="#f6d2b1"/>
        <rect x="100" y="182" width="18" height="42" rx="8" fill="#f6d2b1"/>
        <rect x="60" y="228" width="22" height="8" rx="4" fill="#1f1b16"/>
        <rect x="98" y="220" width="22" height="8" rx="4" fill="#1f1b16"/>
        <circle cx="90" cy="70" r="28" fill="url(#skin)"/>
        <path d="M58 66c8-18 42-24 58-6" fill="none" stroke="#3a2a1c" stroke-width="10" stroke-linecap="round"/>
        <ellipse cx="78" cy="72" rx="4.5" ry="5" fill="#1f1b16"/>
        <ellipse cx="102" cy="72" rx="4.5" ry="5" fill="#1f1b16"/>
        <path d="M76 88c8 10 20 10 28 0" fill="none" stroke="#1f1b16" stroke-width="4" stroke-linecap="round"/>
        <path d="M68 96c10 18 34 18 44 0" fill="none" stroke="#7a5b3a" stroke-width="8" stroke-linecap="round"/>
        <path d="M36 132c14-12 30-10 40 8l-12 12c-8-10-16-14-28-4z" fill="#c59a63"/>
        <path d="M144 132c-14-12-30-10-40 8l12 12c8-10 16-14 28-4z" fill="#c59a63"/>
        <circle cx="64" cy="152" r="8" fill="#f6d2b1"/>
        <circle cx="116" cy="152" r="8" fill="#f6d2b1"/>
      </g>
    </svg>
  `;
}

function createDanielRunSvgB() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 260">
      <defs>
        <linearGradient id="robe" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#2f4f7a"/>
          <stop offset="100%" stop-color="#1b2f52"/>
        </linearGradient>
        <linearGradient id="skin" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#f6d2b1"/>
          <stop offset="100%" stop-color="#e0b190"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.25)"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <ellipse cx="90" cy="246" rx="54" ry="10" fill="rgba(0,0,0,0.2)"/>
        <path d="M36 236l54-10 54 10-20-116H56z" fill="url(#robe)"/>
        <path d="M64 114h52l-26 38z" fill="#d8b789"/>
        <path d="M56 174h68l-8 28-26 6-26-6z" fill="#b88c55"/>
        <rect x="62" y="182" width="18" height="42" rx="8" fill="#f6d2b1"/>
        <rect x="100" y="190" width="18" height="42" rx="8" fill="#f6d2b1"/>
        <rect x="60" y="220" width="22" height="8" rx="4" fill="#1f1b16"/>
        <rect x="98" y="228" width="22" height="8" rx="4" fill="#1f1b16"/>
        <circle cx="90" cy="70" r="28" fill="url(#skin)"/>
        <path d="M58 66c8-18 42-24 58-6" fill="none" stroke="#3a2a1c" stroke-width="10" stroke-linecap="round"/>
        <ellipse cx="78" cy="72" rx="4.5" ry="5" fill="#1f1b16"/>
        <ellipse cx="102" cy="72" rx="4.5" ry="5" fill="#1f1b16"/>
        <path d="M76 88c8 10 20 10 28 0" fill="none" stroke="#1f1b16" stroke-width="4" stroke-linecap="round"/>
        <path d="M68 96c10 18 34 18 44 0" fill="none" stroke="#7a5b3a" stroke-width="8" stroke-linecap="round"/>
        <path d="M36 132c14-12 30-10 40 8l-12 12c-8-10-16-14-28-4z" fill="#c59a63"/>
        <path d="M144 132c-14-12-30-10-40 8l12 12c8-10 16-14 28-4z" fill="#c59a63"/>
        <circle cx="64" cy="152" r="8" fill="#f6d2b1"/>
        <circle cx="116" cy="152" r="8" fill="#f6d2b1"/>
      </g>
    </svg>
  `;
}

function createDanielKneelSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 260">
      <defs>
        <linearGradient id="robe" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#2f4f7a"/>
          <stop offset="100%" stop-color="#1b2f52"/>
        </linearGradient>
        <linearGradient id="skin" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#f6d2b1"/>
          <stop offset="100%" stop-color="#e0b190"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.25)"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <ellipse cx="90" cy="246" rx="54" ry="10" fill="rgba(0,0,0,0.2)"/>
        <path d="M44 218l46-12 46 12-18-96H62z" fill="url(#robe)"/>
        <path d="M64 114h52l-26 38z" fill="#d8b789"/>
        <path d="M56 170c8 20 22 30 34 32l-6 18c-18-4-32-16-40-38z" fill="#b88c55"/>
        <path d="M124 170c-8 20-22 30-34 32l6 18c18-4 32-16 40-38z" fill="#b88c55"/>
        <path d="M60 142c6 14 18 30 30 36l-10 10c-12-10-22-24-28-38z" fill="#c59a63"/>
        <path d="M120 142c-6 14-18 30-30 36l10 10c12-10 22-24 28-38z" fill="#c59a63"/>
        <path d="M58 196c10 10 20 16 32 18l-8 12c-16-4-28-14-38-28z" fill="#f6d2b1"/>
        <path d="M122 196c-10 10-20 16-32 18l8 12c16-4 28-14 38-28z" fill="#f6d2b1"/>
        <rect x="52" y="220" width="28" height="10" rx="5" fill="#1f1b16"/>
        <rect x="100" y="220" width="28" height="10" rx="5" fill="#1f1b16"/>
        <circle cx="90" cy="70" r="28" fill="url(#skin)"/>
        <path d="M58 66c8-18 42-24 58-6" fill="none" stroke="#3a2a1c" stroke-width="10" stroke-linecap="round"/>
        <path d="M70 72c6 5 12 5 18 0" fill="none" stroke="#1f1b16" stroke-width="4" stroke-linecap="round"/>
        <path d="M92 72c6 5 12 5 18 0" fill="none" stroke="#1f1b16" stroke-width="4" stroke-linecap="round"/>
        <path d="M76 88c8 10 20 10 28 0" fill="none" stroke="#1f1b16" stroke-width="4" stroke-linecap="round"/>
        <path d="M68 96c10 18 34 18 44 0" fill="none" stroke="#7a5b3a" stroke-width="8" stroke-linecap="round"/>
        <path d="M52 128c10 18 22 30 38 36l-8 12c-18-8-32-22-42-42z" fill="#c59a63"/>
        <path d="M128 128c-10 18-22 30-38 36l8 12c18-8 32-22 42-42z" fill="#c59a63"/>
        <path d="M74 152c6 10 12 14 16 16 4-2 10-6 16-16" fill="none" stroke="#1f1b16" stroke-width="6" stroke-linecap="round"/>
        <circle cx="74" cy="164" r="7" fill="#f6d2b1"/>
        <circle cx="106" cy="164" r="7" fill="#f6d2b1"/>
      </g>
    </svg>
  `;
}

const lionSprite = svgToImage(createLionSvg());
const danielRunSpriteA = svgToImage(createDanielRunSvgA());
const danielRunSpriteB = svgToImage(createDanielRunSvgB());
const danielKneelSprite = svgToImage(createDanielKneelSvg());

function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  audioReady = audioCtx.state === 'running';
}

function playRoar() {
  if (!audioReady || !audioCtx) {
    return;
  }
  const now = audioCtx.currentTime;
  const duration = 0.4;

  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(220, now);
  oscillator.frequency.exponentialRampToValueAtTime(80, now + duration);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(500, now);
  filter.frequency.exponentialRampToValueAtTime(180, now + duration);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  state.viewWidth = window.innerWidth;
  state.viewHeight = window.innerHeight;
  canvas.width = Math.floor(state.viewWidth * dpr);
  canvas.height = Math.floor(state.viewHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  updateLayout();
}

function updateLayout() {
  state.baseUnit = Math.min(state.viewWidth, state.viewHeight);
  state.groundY = state.viewHeight * 0.84;
  state.roofY = state.viewHeight * 0.14;
  state.horizonY = state.viewHeight * 0.34;
  state.player.x = state.viewWidth * 0.18;
  state.player.width = state.baseUnit * 0.12;
  state.player.standHeight = state.baseUnit * 0.2;
  state.player.kneelHeight = state.baseUnit * 0.12;
  state.lions = [];
}

function resetGame() {
  state.score = 0;
  state.speed = 300;
  state.spawnInterval = 1500;
  state.timeSinceSpawn = 0;
  state.timeSinceSpeedUp = 0;
  state.time = 0;
  state.lions = [];
  state.lastTime = 0;
  overlayTitleEl.textContent = 'Dan & The Lions';
  overlayBodyEl.textContent =
    "Meet Dan, who found himself in a similar situation to the Major Prophet Daniel. Kneel and pray, so God closes the lions' mouths!";
  startButtonEl.textContent = 'Start the Trial';
}

function startGame() {
  resetGame();
  state.running = true;
  overlayEl.hidden = true;
  ensureAudio();
}

function endGame() {
  state.running = false;
  overlayTitleEl.textContent = 'Gobble! Gobble!';
  overlayBodyEl.textContent = '1 Thessalonians 5:17';
  startButtonEl.textContent = 'Try Again';
  overlayEl.hidden = false;
}

function winGame() {
  state.running = false;
  overlayTitleEl.textContent = 'God has rescued Dan through prayer!';
  overlayBodyEl.innerHTML =
    'Note, if you got eaten before, keep kneeling and let God handle it! <strong>1 Thessalonians 5:17</strong> pray without ceasing';
  startButtonEl.textContent = 'Pray Again';
  overlayEl.hidden = false;
}

function setKneel(active) {
  state.isKneeling = active;
}

function handleKeyDown(event) {
  if (event.code !== 'Space') {
    return;
  }
  event.preventDefault();
  ensureAudio();
  if (!state.running) {
    if (!overlayEl.hidden) {
      return;
    }
    startGame();
  }
  setKneel(true);
}

function handleKeyUp(event) {
  if (event.code !== 'Space') {
    return;
  }
  event.preventDefault();
  setKneel(false);
}

function handlePointerDown() {
  ensureAudio();
  if (!state.running) {
    if (!overlayEl.hidden) {
      return;
    }
    startGame();
  }
  setKneel(true);
}

function handlePointerUp() {
  setKneel(false);
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
canvas.addEventListener('pointerdown', handlePointerDown);
window.addEventListener('pointerup', handlePointerUp);
window.addEventListener('pointercancel', handlePointerUp);
startButtonEl.addEventListener('click', startGame);
window.addEventListener('resize', resizeCanvas);

function spawnLion() {
  const size = state.baseUnit * (0.14 + Math.random() * 0.03);
  const offset = (Math.random() * 2 - 1) * state.baseUnit * 0.06;
  state.lions.push({
    x: state.viewWidth + size * 1.2,
    y: state.groundY - size * 0.9,
    size,
    speed: state.speed + Math.random() * 60,
    mouthClosed: false,
    mouthOpen: false,
    wobble: Math.random() * Math.PI * 2,
  });
  playRoar();
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

function update(dt) {
  state.score += dt * 0.02;
  state.timeSinceSpawn += dt;
  state.timeSinceSpeedUp += dt;
  state.time += dt;

  if (state.score >= 777) {
    winGame();
    return;
  }

  if (state.timeSinceSpawn >= state.spawnInterval) {
    spawnLion();
    state.timeSinceSpawn = 0;
  }

  if (state.timeSinceSpeedUp >= 2500) {
    state.speed += 14;
    state.spawnInterval = Math.max(520, state.spawnInterval - 45);
    state.timeSinceSpeedUp = 0;
  }

  const playerHeight = state.isKneeling
    ? state.player.kneelHeight
    : state.player.standHeight;

  const playerRect = {
    x: state.player.x - state.player.width * 0.35,
    y: state.groundY - playerHeight,
    w: state.player.width * 0.7,
    h: playerHeight,
  };

  state.lions = state.lions.filter((lion) => {
    lion.x -= (lion.speed + state.speed * 0.2) * (dt / 1000);
    lion.wobble += dt * 0.006;

    if (
      state.isKneeling &&
      lion.x < state.player.x + state.player.width * 0.4
    ) {
      lion.mouthClosed = true;
    }
    lion.mouthOpen =
      !state.isKneeling && lion.x < state.player.x + state.player.width * 1.1;

    const lionRect = {
      x: lion.x - lion.size * 0.5,
      y: lion.y - lion.size * 0.9,
      w: lion.size,
      h: lion.size * 0.9,
    };

    if (!state.isKneeling && rectsOverlap(playerRect, lionRect)) {
      endGame();
      return false;
    }

    return lion.x > -lion.size * 1.2;
  });
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, state.groundY);
  sky.addColorStop(0, '#f8edd7');
  sky.addColorStop(0.55, '#f0d3a6');
  sky.addColorStop(1, '#e0b584');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, state.viewWidth, state.viewHeight);

  ctx.fillStyle = '#55341f';
  ctx.fillRect(0, 0, state.viewWidth, state.roofY);

  ctx.fillStyle = '#6b452a';
  for (let i = 0; i < 7; i += 1) {
    const beamX = (state.viewWidth / 7) * i + state.viewWidth * 0.02;
    ctx.fillRect(
      beamX,
      state.roofY * 0.3,
      state.viewWidth * 0.06,
      state.roofY * 0.55,
    );
  }

  const floorInset = state.viewWidth * 0.06;
  ctx.fillStyle = '#d7c3a7';
  ctx.beginPath();
  ctx.moveTo(floorInset, state.groundY);
  ctx.lineTo(state.viewWidth - floorInset, state.groundY);
  ctx.lineTo(state.viewWidth, state.viewHeight);
  ctx.lineTo(0, state.viewHeight);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(78, 55, 35, 0.25)';
  ctx.lineWidth = 2;
  for (let i = 1; i <= 5; i += 1) {
    const t = i / 6;
    ctx.beginPath();
    ctx.moveTo(state.viewWidth * 0.5, state.groundY);
    ctx.lineTo(state.viewWidth * t, state.viewHeight);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255, 236, 200, 0.6)';
  ctx.fillRect(0, state.roofY * 0.65, state.viewWidth, state.roofY * 0.2);

  ctx.fillStyle = 'rgba(82, 58, 38, 0.35)';
  ctx.fillRect(
    0,
    state.groundY - state.viewHeight * 0.02,
    state.viewWidth,
    state.viewHeight * 0.02,
  );
}

function drawLion(lion) {
  const { x, y, size, mouthClosed, mouthOpen } = lion;
  const bob = Math.sin(lion.wobble) * size * 0.06;
  const drawSize = size * 1.1;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.drawImage(
    lionSprite,
    -drawSize * 0.6,
    -drawSize * 0.7,
    drawSize * 1.2,
    drawSize * 0.95,
  );
  if (mouthClosed) {
    ctx.strokeStyle = '#1f1b16';
    ctx.lineWidth = drawSize * 0.04;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-drawSize * 0.08, -drawSize * 0.06);
    ctx.lineTo(drawSize * 0.08, -drawSize * 0.06);
    ctx.stroke();
  } else if (mouthOpen) {
    ctx.fillStyle = '#8b1d2a';
    ctx.beginPath();
    ctx.arc(0, -drawSize * 0.16, drawSize * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f06c8b';
    ctx.beginPath();
    ctx.arc(0, -drawSize * 0.16, drawSize * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7a1b5';
    ctx.beginPath();
    ctx.arc(0, -drawSize * 0.12, drawSize * 0.04, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#1f1b16';
    ctx.lineWidth = drawSize * 0.04;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(
      0,
      -drawSize * 0.18,
      drawSize * 0.1,
      0.15 * Math.PI,
      0.85 * Math.PI,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function drawDaniel() {
  const width = state.player.width;
  const height = state.isKneeling
    ? state.player.kneelHeight
    : state.player.standHeight;
  const x = state.player.x;
  const y = state.groundY;
  const stride = state.running ? Math.sin(state.time / 110) : 0;
  const bounce = state.running
    ? Math.abs(Math.cos(state.time / 110)) * width * 0.03
    : 0;

  if (state.isKneeling) {
    const glow = ctx.createRadialGradient(
      x,
      y - height * 0.6,
      width * 0.1,
      x,
      y - height * 0.6,
      width * 0.8,
    );
    glow.addColorStop(0, 'rgba(255, 244, 212, 0.9)');
    glow.addColorStop(1, 'rgba(255, 244, 212, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y - height * 0.6, width * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  const drawWidth = width * 1.2;
  const drawHeight = height * 1.55;
  ctx.save();
  ctx.translate(x, y - bounce);
  const sprite = state.isKneeling
    ? danielKneelSprite
    : stride >= 0
      ? danielRunSpriteA
      : danielRunSpriteB;
  ctx.drawImage(sprite, -drawWidth * 0.5, -drawHeight, drawWidth, drawHeight);
  ctx.restore();
}

function render() {
  drawBackground();
  state.lions.forEach((lion) => drawLion(lion));
  drawDaniel();
  scoreEl.textContent = Math.floor(state.score).toString();
}

function loop(timestamp) {
  if (!state.lastTime) {
    state.lastTime = timestamp;
  }
  const dt = timestamp - state.lastTime;
  state.lastTime = timestamp;

  if (state.running) {
    update(dt);
  }

  render();
  requestAnimationFrame(loop);
}

resizeCanvas();
resetGame();
requestAnimationFrame(loop);
