const STORAGE_KEY = "date_invitation_custom_content_v1";

const DEFAULT_CONTENT = {
  recipient: "Yen Trang,",
  question: "Bạn có đi chơi cùng tôi không?",
  subline: "Chỉ cần nói có... đơn giản vậy thôi",
  signoff: "Mah",
  yesLabel: "Vâng \uD83D\uDC9E",
  noChoices: "Không|Bạn chắc chắn chưa?| Nghĩ lại đi?| Bạn không muốn có một ngày tuyệt vời sao?| Làm ơn đừng nói không...| Tôi sẽ rất buồn đấy...| Tôi đã chuẩn bị sẵn sàng rồi...| Bạn đang làm tôi tổn thương đấy...| Không phải là bạn chứ? | Hãy nghĩ về tất cả những khoảnh khắc đẹp mà chúng ta sẽ có bên nhau đi...",  
  finalTitle: "Bạn là cả năm của tôi, Yen Trang.",
  finalMessage: "Tôi sẽ lên kế hoạch cho một điều gì đó đẹp đẽ. Chuẩn bị tinh thần để bị cuốn hút nhé. \u2728",
};

const state = {
  content: loadContent(),
  noList: [],
  noStep: 0,
};

const refs = {
  cardStage: document.getElementById("cardStage"),
  finalStage: document.getElementById("finalStage"),
  toLine: document.getElementById("toLine"),
  questionText: document.getElementById("questionText"),
  sublineText: document.getElementById("sublineText"),
  signoffText: document.getElementById("signoffText"),
  finalTitle: document.getElementById("finalTitle"),
  finalMessage: document.getElementById("finalMessage"),
  yesBtn: document.getElementById("yesBtn"),
  noBtn: document.getElementById("noBtn"),
  buttonArea: document.getElementById("buttonArea"),
  ambientHearts: document.getElementById("ambientHearts"),
  editorToggle: document.getElementById("editorToggle"),
  editorPanel: document.getElementById("editorPanel"),
  editorForm: document.getElementById("editorForm"),
  resetBtn: document.getElementById("resetBtn"),
};

init();

function init() {
  renderContent();
  mountEditor();
  mountInteractions();
  spawnAmbientHearts();
}

function loadContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONTENT };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONTENT, ...parsed };
  } catch {
    return { ...DEFAULT_CONTENT };
  }
}

function saveContent() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.content));
}

function renderContent() {
  refs.toLine.textContent = state.content.recipient;
  refs.questionText.textContent = state.content.question;
  refs.sublineText.textContent = state.content.subline;
  refs.signoffText.textContent = `\u2014 ${state.content.signoff}`;
  refs.finalTitle.textContent = state.content.finalTitle;
  refs.finalMessage.textContent = state.content.finalMessage;
  refs.yesBtn.textContent = state.content.yesLabel;

  state.noList = parseNoChoices(state.content.noChoices);
  state.noStep = 0;
  refs.noBtn.textContent = state.noList[0];
  refs.noBtn.classList.remove("is-hidden");
  refs.noBtn.style.left = "";
  refs.noBtn.style.top = "";
  refs.yesBtn.style.left = "";
  refs.yesBtn.style.transform = "";
}

function parseNoChoices(raw) {
  const list = raw
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 10);
  return list.length ? list : ["Không"];
}

function mountInteractions() {
  refs.noBtn.addEventListener("click", (event) => {
    event.preventDefault();
    runNoEscape();
  });

  refs.yesBtn.addEventListener("click", () => {
    refs.cardStage.classList.add("is-hiding");
    setTimeout(() => {
      refs.cardStage.hidden = true;
      refs.finalStage.hidden = false;
      requestAnimationFrame(() => refs.finalStage.classList.add("is-visible"));
      burstConfetti();
    }, 620);
  });
}

function runNoEscape() {
  state.noStep += 1;
  const nextLabel = state.noList[Math.min(state.noStep, state.noList.length - 1)];
  refs.noBtn.textContent = nextLabel;

  const yesScale = Math.min(1 + state.noStep * 0.03, 1.18);
  refs.yesBtn.style.transform = `scale(${yesScale})`;

  if (state.noStep > state.noList.length + 1) {
    refs.noBtn.classList.add("is-hidden");
    refs.yesBtn.style.left = "50%";
    refs.yesBtn.style.transform = `translateX(-50%) scale(${yesScale})`;
    return;
  }

  moveNoButton();
}

function moveNoButton() {
  const area = refs.buttonArea.getBoundingClientRect();
  const btn = refs.noBtn.getBoundingClientRect();
  const pad = 2;

  const maxLeft = Math.max(area.width - btn.width - pad, 0);
  const maxTop = Math.max(area.height - btn.height - pad, 0);
  const nextLeft = rand(pad, maxLeft);
  const nextTop = rand(pad, maxTop);

  refs.noBtn.style.left = `${nextLeft}px`;
  refs.noBtn.style.top = `${nextTop}px`;
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnAmbientHearts() {
  const icons = ["\u2665", "\u2764", "\u2765"];
  const count = 28;

  for (let i = 0; i < count; i += 1) {
    const heart = document.createElement("span");
    heart.className = "ambient-heart";
    heart.textContent = icons[Math.floor(Math.random() * icons.length)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${9 + Math.random() * 12}s`;
    heart.style.animationDelay = `${Math.random() * -16}s`;
    heart.style.fontSize = `${10 + Math.random() * 9}px`;
    refs.ambientHearts.appendChild(heart);
  }
}

function burstConfetti() {
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  document.body.appendChild(layer);

  const palette = ["#c81d6d", "#d8b675", "#b39a94", "#f1cfd8", "#c5aba5"];
  const pieces = 90;

  for (let i = 0; i < pieces; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    const angle = (Math.PI * 2 * i) / pieces + rand(-0.25, 0.25);
    const distance = rand(80, 240);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    piece.style.setProperty("--x", `${x}px`);
    piece.style.setProperty("--y", `${y}px`);
    piece.style.setProperty("--r", `${rand(120, 600)}deg`);
    piece.style.background = palette[Math.floor(Math.random() * palette.length)];
    piece.style.animationDelay = `${rand(0, 0.15)}s`;
    layer.appendChild(piece);
  }

  setTimeout(() => layer.remove(), 1900);
}

function mountEditor() {
  populateEditorFields();

  refs.editorToggle.addEventListener("click", () => {
    refs.editorPanel.classList.toggle("is-open");
    const isOpen = refs.editorPanel.classList.contains("is-open");
    refs.editorPanel.setAttribute("aria-hidden", String(!isOpen));
    refs.editorToggle.textContent = isOpen ? "Close editor" : "Edit text";
  });

  refs.editorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(refs.editorForm);
    for (const key of Object.keys(DEFAULT_CONTENT)) {
      const value = String(formData.get(key) ?? "").trim();
      state.content[key] = value || DEFAULT_CONTENT[key];
    }
    saveContent();
    renderContent();
  });

  refs.resetBtn.addEventListener("click", () => {
    state.content = { ...DEFAULT_CONTENT };
    saveContent();
    populateEditorFields();
    renderContent();
  });
}

function populateEditorFields() {
  for (const key of Object.keys(DEFAULT_CONTENT)) {
    const input = refs.editorForm.elements.namedItem(key);
    if (input) input.value = state.content[key];
  }
}
