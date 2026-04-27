const playerInput   = document.getElementById('playerInput');
const addPlayerBtn  = document.getElementById('addPlayerBtn');
const playerList    = document.getElementById('playerList');
const startBtn      = document.getElementById('startBtn');
const setupSection  = document.getElementById('setupSection');
const gameSection   = document.getElementById('gameSection');
const resultSection = document.getElementById('resultSection');
const bombEmoji     = document.getElementById('bombEmoji');
const currentHolder = document.getElementById('currentHolder');
const curseDisplay  = document.getElementById('curseDisplay');
const passBtn       = document.getElementById('passBtn');
const resultText    = document.getElementById('resultText');
const replayBtn     = document.getElementById('replayBtn');

const MAX_COOLDOWN = 3000; // ms

let players = [];
let holderIndex = 0;
let bombTimeout = null;
let active = false;
let heldSince = 0;
let curseInterval = null;
let cooldownEnd = 0;
let cooldownRaf = null;

// ---- プレイヤー管理 ----
function addPlayer() {
  const name = playerInput.value.trim();
  if (!name || players.includes(name) || players.length >= 10) return;
  players.push(name);
  playerInput.value = '';
  renderPlayers();
  startBtn.disabled = players.length < 2;
}

function removePlayer(i) {
  players.splice(i, 1);
  renderPlayers();
  startBtn.disabled = players.length < 2;
}

function renderPlayers() {
  playerList.innerHTML = '';
  players.forEach((name, i) => {
    const tag = document.createElement('div');
    tag.className = 'player-tag';
    tag.innerHTML = `<span>${name}</span><button class="remove-btn" onclick="removePlayer(${i})">✕</button>`;
    playerList.appendChild(tag);
  });
}

addPlayerBtn.addEventListener('click', addPlayer);
playerInput.addEventListener('keydown', e => { if (e.key === 'Enter') addPlayer(); });

// ---- 呪いメーター（リアルタイム更新）----
function startCurseDisplay() {
  stopCurseDisplay();
  curseInterval = setInterval(() => {
    if (!active) return;
    const held = Date.now() - heldSince;
    const curse = Math.min(held * 0.5, MAX_COOLDOWN);
    const secs = (curse / 1000).toFixed(1);
    curseDisplay.textContent = `今パスすると次の人は ${secs} 秒待ち`;
    curseDisplay.className = 'curse-display' + (curse >= 1500 ? ' hot' : '');

    // 爆弾の揺れ速度を呪いに応じて変化（0.45s → 0.15s）
    const ratio = curse / MAX_COOLDOWN;
    const speed = 0.45 - ratio * 0.3;
    bombEmoji.style.setProperty('--wiggle-speed', speed.toFixed(2) + 's');
  }, 100);
}

function stopCurseDisplay() {
  clearInterval(curseInterval);
  curseDisplay.textContent = '';
  curseDisplay.className = 'curse-display';
  bombEmoji.style.removeProperty('--wiggle-speed');
}

// ---- ゲーム開始 ----
function startGame() {
  if (players.length < 2) return;
  holderIndex = Math.floor(Math.random() * players.length);
  active = true;
  heldSince = Date.now();

  setupSection.classList.add('hidden');
  resultSection.classList.add('hidden');
  gameSection.classList.remove('hidden');

  bombEmoji.className = 'bomb-emoji ticking';
  bombEmoji.textContent = '💣';
  passBtn.disabled = false;
  passBtn.textContent = '💨 パス！';
  passBtn.classList.remove('cooling');
  updateHolder();
  startCurseDisplay();

  const timeLimit = Math.floor(Math.random() * 15000) + 7000;
  bombTimeout = setTimeout(explode, timeLimit);
}

function updateHolder() {
  currentHolder.textContent = `${players[holderIndex]} が持っている！`;
}

// ---- パス ----
function pass() {
  if (!active || passBtn.disabled) return;

  // 呪い計算
  const held = Date.now() - heldSince;
  const cooldown = Math.min(held * 0.5, MAX_COOLDOWN);

  // 次の人へ渡す
  const prev = holderIndex;
  do {
    holderIndex = (holderIndex + 1) % players.length;
  } while (holderIndex === prev && players.length > 1);

  heldSince = Date.now();
  updateHolder();

  // 手渡しアニメ
  bombEmoji.style.transform = 'scale(1.4) rotate(15deg)';
  setTimeout(() => { bombEmoji.style.transform = ''; }, 200);

  // クールダウン適用
  if (cooldown > 300) {
    applyPassCooldown(cooldown);
  }
}

function applyPassCooldown(ms) {
  passBtn.disabled = true;
  passBtn.classList.add('cooling');
  cooldownEnd = Date.now() + ms;

  function tick() {
    const remaining = cooldownEnd - Date.now();
    if (remaining <= 0) {
      passBtn.disabled = false;
      passBtn.classList.remove('cooling');
      passBtn.textContent = '💨 パス！';
      cooldownRaf = null;
      return;
    }
    passBtn.textContent = `⏳ あと ${(remaining / 1000).toFixed(1)} 秒...`;
    cooldownRaf = requestAnimationFrame(tick);
  }
  cooldownRaf = requestAnimationFrame(tick);
}

passBtn.addEventListener('click', pass);

// ---- 爆発 ----
function explode() {
  active = false;
  stopCurseDisplay();
  if (cooldownRaf) { cancelAnimationFrame(cooldownRaf); cooldownRaf = null; }

  bombEmoji.className = 'bomb-emoji exploding';
  bombEmoji.textContent = '💥';
  currentHolder.textContent = '';

  setTimeout(() => {
    const loser = players[holderIndex];
    gameSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
    resultText.innerHTML = `💥 <strong>${loser}</strong> の負け！<br>🍺 飲んでください！`;
  }, 700);
}

// ---- もう一回 / リセット ----
function replay() {
  resultSection.classList.add('hidden');
  startGame();
}

function backToSetup() {
  clearTimeout(bombTimeout);
  if (cooldownRaf) { cancelAnimationFrame(cooldownRaf); cooldownRaf = null; }
  active = false;
  stopCurseDisplay();
  gameSection.classList.add('hidden');
  resultSection.classList.add('hidden');
  setupSection.classList.remove('hidden');
  bombEmoji.className = 'bomb-emoji';
  bombEmoji.textContent = '💣';
  currentHolder.textContent = '';
  passBtn.disabled = false;
  passBtn.classList.remove('cooling');
  passBtn.textContent = '💨 パス！';
}

startBtn.addEventListener('click', startGame);
replayBtn.addEventListener('click', replay);
document.getElementById('resetBtn').addEventListener('click', backToSetup);
document.getElementById('resetBtn2').addEventListener('click', backToSetup);
