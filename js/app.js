// ── NAVIGATION ───────────────────────────────────────
function navigate(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  document.querySelector(`[data-screen="${screenId}"]`).classList.add('active');
  // scroll top
  document.getElementById(screenId).scrollTop = 0;
}

// ── INTERVENTION TYPE TOGGLE ──────────────────────────
function selectType(btn, cls) {
  btn.closest('.type-row').querySelectorAll('.type-btn').forEach(b => {
    b.className = 'type-btn';
  });
  btn.classList.add(cls);
  // update CTA color
  const cta = document.getElementById('rapport-cta');
  if (cls === 't-urg') {
    cta.className = 'cta-btn amber';
    cta.textContent = 'Terminer et synchroniser (URGENT)';
  } else {
    cta.className = 'cta-btn';
    cta.textContent = 'Terminer et synchroniser';
  }
}

// ── CHECKBOX TOGGLE ───────────────────────────────────
function toggleCheck(item) {
  const box = item.querySelector('.check-box');
  box.classList.toggle('checked');
  const label = item.querySelector('.check-label');
  if (box.classList.contains('checked')) {
    label.style.textDecoration = '';
    label.style.color = '';
  }
}

// ── CRITICALITY SELECT ────────────────────────────────
function selectCrit(btn) {
  btn.closest('.crit-row').querySelectorAll('.crit-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ── ADD PIECE ROW ─────────────────────────────────────
function addPieceRow() {
  const container = document.getElementById('pieces-container');
  const row = document.createElement('div');
  row.className = 'piece-row';
  row.innerHTML = `
    <input type="text" class="piece-input" placeholder="Référence pièce (ex: 1089-2370-01)">
    <input type="number" class="piece-qty" placeholder="Qté" min="1" value="1">
    <div onclick="removePiece(this)" style="display:flex;align-items:center;cursor:pointer;color:var(--text-3);padding:0 4px;" title="Supprimer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </div>
  `;
  container.appendChild(row);
}

function removePiece(btn) {
  btn.closest('.piece-row').remove();
}

// ── SIGNATURE CANVAS ──────────────────────────────────
let isDrawing = false;
let sigCtx = null;
let sigCanvas = null;
let lastX = 0, lastY = 0;
let hasSig = false;

function initSignature() {
  sigCanvas = document.getElementById('sig-canvas');
  if (!sigCanvas) return;
  sigCtx = sigCanvas.getContext('2d');
  sigCtx.strokeStyle = '#0F1929';
  sigCtx.lineWidth = 2;
  sigCtx.lineCap = 'round';
  sigCtx.lineJoin = 'round';

  sigCanvas.addEventListener('mousedown', e => { isDrawing = true; [lastX, lastY] = getPos(e, sigCanvas); hasSig = true; document.getElementById('sig-clear').style.display = 'block'; });
  sigCanvas.addEventListener('mousemove', e => {
    if (!isDrawing) return;
    const [x, y] = getPos(e, sigCanvas);
    sigCtx.beginPath();
    sigCtx.moveTo(lastX, lastY);
    sigCtx.lineTo(x, y);
    sigCtx.stroke();
    [lastX, lastY] = [x, y];
  });
  sigCanvas.addEventListener('mouseup', () => isDrawing = false);
  sigCanvas.addEventListener('mouseleave', () => isDrawing = false);

  // touch
  sigCanvas.addEventListener('touchstart', e => { e.preventDefault(); isDrawing = true; const t = e.touches[0]; [lastX, lastY] = getPos(t, sigCanvas); hasSig = true; document.getElementById('sig-clear').style.display = 'block'; });
  sigCanvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!isDrawing) return;
    const t = e.touches[0];
    const [x, y] = getPos(t, sigCanvas);
    sigCtx.beginPath();
    sigCtx.moveTo(lastX, lastY);
    sigCtx.lineTo(x, y);
    sigCtx.stroke();
    [lastX, lastY] = [x, y];
  });
  sigCanvas.addEventListener('touchend', () => isDrawing = false);
}

function getPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  return [
    (e.clientX - rect.left) * (canvas.width / rect.width),
    (e.clientY - rect.top)  * (canvas.height / rect.height)
  ];
}

function clearSignature() {
  if (!sigCtx || !sigCanvas) return;
  sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
  hasSig = false;
  document.getElementById('sig-clear').style.display = 'none';
}

// ── SYNC SIMULATION ───────────────────────────────────
function submitRapport() {
  const cta = document.getElementById('rapport-cta');
  cta.textContent = 'Synchronisation en cours…';
  cta.style.opacity = '.7';
  cta.disabled = true;
  setTimeout(() => {
    cta.textContent = '✓ Rapport envoyé à SAP';
    cta.style.background = 'var(--green)';
    cta.style.opacity = '1';
    setTimeout(() => {
      cta.textContent = 'Terminer et synchroniser';
      cta.style.background = '';
      cta.style.opacity = '1';
      cta.disabled = false;
    }, 2500);
  }, 1800);
}

// ── MARK NOTIF AS READ ────────────────────────────────
function markRead(card) {
  card.classList.add('read');
  const dot = card.querySelector('.unread-dot');
  if (dot) dot.remove();
  // update badge
  const unread = document.querySelectorAll('.notif-card:not(.read)').length;
  const badge = document.querySelector('[data-screen="s-notifs"] .nav-badge');
  if (badge) badge.textContent = unread;
}

// ── CLOCK ─────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('current-time');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ── STATUS PICKER ─────────────────────────────────────
const STATUS_CONFIG = {
  online:  { label: 'Connecté',        cls: 'badge-online',  dot: 'var(--teal)' },
  offline: { label: 'Déconnecté',      cls: 'badge-offline', dot: 'var(--amber)' },
  dnd:     { label: 'Ne pas déranger', cls: 'badge-dnd',     dot: 'var(--red)' },
  away:    { label: 'Absent',          cls: 'badge-away',    dot: 'var(--border2)' },
};

function toggleStatusMenu() {
  document.getElementById('status-menu').classList.toggle('open');
}

function setStatus(key) {
  const cfg = STATUS_CONFIG[key];
  const badge = document.getElementById('status-badge');
  const dot   = document.getElementById('status-dot');
  const label = document.getElementById('status-label');
  badge.className = `badge ${cfg.cls}`;
  dot.style.fill  = cfg.dot;
  label.textContent = cfg.label;
  document.getElementById('status-menu').classList.remove('open');
}

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSignature();
  updateClock();
  setInterval(updateClock, 30000);

  document.addEventListener('click', e => {
    const picker = document.getElementById('status-picker');
    if (picker && !picker.contains(e.target)) {
      document.getElementById('status-menu').classList.remove('open');
    }
  });
});
