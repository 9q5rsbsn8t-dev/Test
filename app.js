const playerInput   = document.getElementById('playerInput');
const addPlayerBtn  = document.getElementById('addPlayerBtn');
const playerList    = document.getElementById('playerList');
const startBtn      = document.getElementById('startBtn');
const setupSection  = document.getElementById('setupSection');
const gameSection   = document.getElementById('gameSection');
const resultSection = document.getElementById('resultSection');
const bombEmoji     = document.getElementById('bombEmoji');
const currentHolder = document.getElementById('currentHolder');
const passBtn       = document.getElementById('passBtn');
const resultText    = document.getElementById('resultText');
const replayBtn     = document.getElementById('replayBtn');

let players = [];
let holderIndex = 0;
let bombTimeout = null;
let active = false;

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

// ---- ゲーム開始 ----
function startGame() {
  if (players.length < 2) return;
  holderIndex = Math.floor(Math.random() * players.length);
  active = true;

  setupSection.classList.add('hidden');
  resultSection.classList.add('hidden');
  gameSection.classList.remove('hidden');

  bombEmoji.className = 'bomb-emoji ticking';
  bombEmoji.textContent = '💣';
  updateHolder();

  const timeLimit = Math.floor(Math.random() * 15000) + 7000;
  bombTimeout = setTimeout(explode, timeLimit);
}

function updateHolder() {
  currentHolder.textContent = `${players[holderIndex]} が持っている！`;
}

// ---- パス ----
function pass() {
  if (!active) return;
  const prev = holderIndex;
  do {
    holderIndex = (holderIndex + 1) % players.length;
  } while (holderIndex === prev && players.length > 1);
  updateHolder();

  bombEmoji.style.transform = 'scale(1.4) rotate(15deg)';
  setTimeout(() => { bombEmoji.style.transform = ''; }, 200);
}

passBtn.addEventListener('click', pass);

// ---- 爆発 ----
function explode() {
  active = false;
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
  active = false;
  gameSection.classList.add('hidden');
  resultSection.classList.add('hidden');
  setupSection.classList.remove('hidden');
  bombEmoji.className = 'bomb-emoji';
  bombEmoji.textContent = '💣';
  currentHolder.textContent = '';
}

startBtn.addEventListener('click', startGame);
replayBtn.addEventListener('click', replay);
document.getElementById('resetBtn').addEventListener('click', backToSetup);
document.getElementById('resetBtn2').addEventListener('click', backToSetup);
