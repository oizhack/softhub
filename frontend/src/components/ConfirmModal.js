export function showConfirm({ title = 'Confirm', message, confirmText = 'DELETE', onConfirm }) {
  // Inject styles once
  if (!document.getElementById('confirm-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'confirm-modal-styles';
    style.textContent = `
      .cm-overlay {
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center;
        animation: cm-fade-in 0.15s ease;
      }
      @keyframes cm-fade-in { from { opacity: 0; } to { opacity: 1; } }
      .cm-box {
        background: #131313;
        border: 1px solid rgba(255,113,108,0.25);
        border-radius: 0.75rem;
        padding: 2rem;
        width: 100%;
        max-width: 380px;
        box-shadow: 0 0 40px rgba(255,113,108,0.1);
        animation: cm-slide-in 0.18s cubic-bezier(0.4,0,0.2,1);
      }
      @keyframes cm-slide-in { from { transform: translateY(-12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .cm-icon {
        width: 44px; height: 44px;
        background: rgba(255,113,108,0.1);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 1.25rem;
      }
      .cm-icon span {
        font-family: 'Material Symbols Outlined';
        font-size: 22px;
        color: #ff716c;
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      .cm-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.1rem;
        font-weight: 700;
        color: #fff;
        margin: 0 0 0.5rem 0;
      }
      .cm-message {
        font-family: 'Inter', sans-serif;
        font-size: 0.875rem;
        color: #adaaaa;
        margin: 0 0 1.75rem 0;
        line-height: 1.5;
      }
      .cm-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
      }
      .cm-btn-cancel {
        background: transparent;
        border: 1px solid rgba(72,72,71,0.5);
        color: #adaaaa;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 0.6rem 1.25rem;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      .cm-btn-cancel:hover { border-color: #adaaaa; color: #fff; }
      .cm-btn-confirm {
        background: #ff716c;
        border: none;
        color: #fff;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 0.6rem 1.25rem;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 0 16px rgba(255,113,108,0.3);
      }
      .cm-btn-confirm:hover { filter: brightness(1.15); }
    `;
    document.head.appendChild(style);
  }

  const overlay = document.createElement('div');
  overlay.className = 'cm-overlay';

  overlay.innerHTML = `
    <div class="cm-box">
      <div class="cm-icon"><span>delete</span></div>
      <h2 class="cm-title">${title}</h2>
      <p class="cm-message">${message}</p>
      <div class="cm-actions">
        <button class="cm-btn-cancel">Cancel</button>
        <button class="cm-btn-confirm">${confirmText}</button>
      </div>
    </div>
  `;

  const close = () => overlay.remove();

  overlay.querySelector('.cm-btn-cancel').addEventListener('click', close);
  overlay.querySelector('.cm-btn-confirm').addEventListener('click', () => {
    close();
    onConfirm();
  });

  // Close on backdrop click
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  // Close on Escape
  const onKey = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } };
  document.addEventListener('keydown', onKey);

  document.body.appendChild(overlay);
}
