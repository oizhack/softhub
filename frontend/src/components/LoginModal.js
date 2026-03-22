export function renderLoginModal(onLogin, onClose) {
  const existingModal = document.getElementById("login-modal");
  if (existingModal) existingModal.remove();
  document.getElementById("modal-styles")?.remove();

  const style = document.createElement("style");
  style.id = "modal-styles";
  style.textContent = `
    @keyframes modalPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.95); }
    }
    .kinetic-pulse { animation: modalPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    .login-input:focus { box-shadow: 0 0 12px rgba(153,247,255,0.2); outline: none; }
    .submit-btn-inner { transition: background 0.3s ease; }
    .submit-btn-outer:hover .submit-btn-inner { background: transparent !important; }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.id = "login-modal";
  overlay.className = "fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4";

  overlay.innerHTML = `
    <div class="max-w-md w-full bg-[#131313] p-[1px] rounded-xl relative overflow-hidden" style="box-shadow: 0 0 20px rgba(153,247,255,0.1);">
      <div class="absolute inset-0 rounded-xl pointer-events-none" style="background: linear-gradient(135deg, rgba(153,247,255,0.2), transparent, rgba(153,247,255,0.05));"></div>

      <div class="bg-[#1a1a1a] rounded-[calc(0.75rem-1px)] p-10 relative">
        <button id="close-modal-btn" class="absolute top-3 right-3 bg-transparent border-none text-[#adaaaa] hover:text-[#99f7ff] cursor-pointer text-2xl transition-colors leading-none" style="line-height:1;">
          <span class="material-symbols-outlined" style="font-size:1.5rem;">close</span>
        </button>

        <h2 style="font-family:'Space Grotesk',sans-serif;font-size:2.25rem;font-weight:900;letter-spacing:-0.04em;color:#fff;margin-bottom:0.5rem;">ADMIN LOGIN</h2>
        <p style="font-family:'Inter',sans-serif;font-size:0.875rem;color:#adaaaa;margin-bottom:2rem;">Authorize credentials to access the management layer.</p>

        <form id="login-form">
          <div style="margin-bottom:1.5rem;">
            <label style="font-size:10px;letter-spacing:0.2em;color:#adaaaa;display:block;margin-bottom:0.5rem;margin-left:0.25rem;font-weight:700;text-transform:uppercase;">ACCESS KEY</label>
            <div style="position:relative;">
              <span class="material-symbols-outlined" style="position:absolute;left:1rem;top:50%;transform:translateY(-50%);color:#adaaaa;font-size:18px;pointer-events:none;">lock</span>
              <input
                type="password"
                id="password-input"
                required
                class="login-input"
                style="background:#000;border:none;font-family:'Inter',sans-serif;width:100%;padding:1rem 1rem 1rem 3rem;border-radius:0.25rem;color:#fff;transition:all 0.3s;"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button type="submit" class="submit-btn-outer" style="width:100%;background:linear-gradient(to right,#99f7ff,#00f1fe);padding:1px;border-radius:0.375rem;border:none;cursor:pointer;display:block;">
            <div class="submit-btn-inner" style="background:#1a1a1a;padding:1rem 1.5rem;border-radius:calc(0.375rem - 1px);display:flex;align-items:center;justify-content:center;gap:0.5rem;">
              <span style="font-family:'Space Grotesk',sans-serif;font-weight:700;letter-spacing:0.1em;color:#fff;font-size:0.875rem;">ESTABLISH CONNECTION</span>
              <span class="material-symbols-outlined" style="color:#99f7ff;">arrow_forward</span>
            </div>
          </button>

          <div id="login-error" style="display:none;color:#ff716c;font-size:0.85rem;text-align:center;margin-top:0.75rem;"></div>
        </form>

        <div style="display:flex;align-items:center;justify-content:center;gap:1rem;padding:0.75rem;background:#131313;border-radius:0.375rem;border-left:2px solid #99f7ff;margin-top:2rem;">
          <div class="kinetic-pulse" style="width:8px;height:8px;background:#99f7ff;border-radius:50%;flex-shrink:0;"></div>
          <span style="font-size:9px;letter-spacing:0.3em;color:#adaaaa;font-weight:700;text-transform:uppercase;">System Status: Awaiting Input</span>
        </div>
      </div>
    </div>
  `;

  const form = overlay.querySelector("#login-form");
  const input = overlay.querySelector("#password-input");
  const errorEl = overlay.querySelector("#login-error");

  const handleClose = () => {
    document.removeEventListener("keydown", handleEscape);
    overlay.remove();
    document.getElementById("modal-styles")?.remove();
    onClose();
  };

  const handleEscape = (e) => {
    if (e.key === "Escape") handleClose();
  };

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) handleClose();
  });

  overlay.querySelector("#close-modal-btn").addEventListener("click", handleClose);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.style.display = "none";
    const password = input.value;

    if (!password) {
      errorEl.textContent = "// PASSWORD REQUIRED";
      errorEl.style.display = "block";
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        const data = await res.json();
        onLogin(data.token);
        handleClose();
      } else {
        errorEl.textContent = res.status === 401 ? "// INVALID CREDENTIALS" : "// LOGIN FAILED";
        errorEl.style.display = "block";
      }
    } catch {
      errorEl.textContent = "// CONNECTION FAILED";
      errorEl.style.display = "block";
    }
  });

  document.body.appendChild(overlay);
  document.addEventListener("keydown", handleEscape);
  input.focus();
}
