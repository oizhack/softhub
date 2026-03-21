export function renderLoginModal(onLogin, onClose) {
    const existingModal = document.getElementById("login-modal");
    if (existingModal) {
        existingModal.remove();
        document.getElementById("modal-styles")?.remove();
    }

    const style = document.createElement("style");
    style.id = "modal-styles";
    style.textContent = `
        .login-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex; justify-content: center; align-items: center; z-index: 100;
        }
        .login-modal-content {
            background-color: var(--surface); border: 1px solid var(--border);
            padding: 2rem; border-radius: 8px; width: 90%; max-width: 400px;
            box-shadow: 0 0 20px rgba(0,255,240,0.08);
            position: relative;
        }
        .login-modal-content h2 {
            font-family: 'Orbitron', sans-serif; color: var(--neon-cyan);
            margin-bottom: 1.5rem; text-align: center;
            text-shadow: 0 0 5px rgba(0,255,240,0.2);
        }
        .login-modal-content label {
            display: block; margin-bottom: 0.5rem; color: var(--text);
            font-size: 0.9rem;
        }
        .login-modal-content input[type="password"] {
            width: 100%; padding: 0.8rem; margin-bottom: 1rem;
            background-color: var(--bg); border: 1px solid var(--border);
            color: var(--text); border-radius: 4px; font-family: 'Fira Code', monospace;
            font-size: 0.9rem; outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .login-modal-content input[type="password"]:focus {
            border-color: var(--neon-cyan);
            box-shadow: 0 0 8px rgba(0,255,240,0.1);
        }
        .login-modal-content button.submit-btn {
            width: 100%; padding: 0.8rem; background-color: var(--neon-cyan);
            color: var(--bg); border: none; border-radius: 4px;
            font-family: 'Fira Code', monospace; font-size: 1rem; cursor: pointer;
            transition: background-color 0.2s ease, box-shadow 0.2s ease;
            margin-top: 1rem;
        }
        .login-modal-content button.submit-btn:hover {
            background-color: #00e6d6;
            box-shadow: 0 0 10px rgba(0,255,240,0.25);
        }
        .login-modal-content .error-message {
            color: var(--danger); text-align: center; margin-top: 1rem;
            font-size: 0.85rem;
        }
        .login-modal-content .close-btn {
            position: absolute; top: 10px; right: 10px;
            background: transparent; color: var(--text-muted);
            font-size: 1.5rem; border: none; cursor: pointer;
            line-height: 1; padding: 0 5px;
        }
        .login-modal-content .close-btn:hover {
            color: var(--neon-cyan);
        }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.className = "login-modal-overlay";
    overlay.id = "login-modal";

    const content = document.createElement("div");
    content.className = "login-modal-content";

    const closeButton = document.createElement("button");
    closeButton.className = "close-btn";
    closeButton.innerHTML = "&times;";
    closeButton.onclick = onClose;
    content.appendChild(closeButton);

    const title = document.createElement("h2");
    title.textContent = "[ AUTHENTICATE ]";
    content.appendChild(title);

    const form = document.createElement("form");

    const passwordLabel = document.createElement("label");
    passwordLabel.textContent = "ACCESS KEY:";
    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.placeholder = "Enter access key...";
    form.appendChild(passwordLabel);
    form.appendChild(passwordInput);

    const errorMessage = document.createElement("p");
    errorMessage.className = "error-message";
    form.appendChild(errorMessage);

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = "submit-btn";
    submitButton.textContent = "[ ACCESS ]";
    form.appendChild(submitButton);

    form.onsubmit = async (e) => {
        e.preventDefault();
        errorMessage.textContent = "";

        const password = passwordInput.value;
        if (!password) {
            errorMessage.textContent = "// PASSWORD REQUIRED";
            return;
        }

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (response.ok) {
                const data = await response.json();
                onLogin(data.token);
                onClose();
            } else if (response.status === 401) {
                errorMessage.textContent = "// INVALID CREDENTIALS";
            } else {
                errorMessage.textContent = "// LOGIN FAILED";
            }
        } catch (error) {
            errorMessage.textContent = "// CONNECTION FAILED";
        }
    };

    content.appendChild(form);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) onClose();
    });

    const handleEscape = (e) => {
        if (e.key === "Escape") {
            document.removeEventListener("keydown", handleEscape);
            onClose();
        }
    };
    document.addEventListener("keydown", handleEscape);

    passwordInput.focus();
}
