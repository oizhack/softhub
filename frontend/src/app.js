import { renderSoftwareGrid } from "./components/SoftwareGrid.js";
import { renderLoginModal } from "./components/LoginModal.js";
import { renderAdminPanel } from "./components/AdminPanel.js";
import { showConfirm } from "./components/ConfirmModal.js";
import { showEditModal } from "./components/EditModal.js";
import { renderYoutubeDownloader } from "./components/YoutubeDownloader.js";

let allSoftware = [];
let categories = [];
let authToken = sessionStorage.getItem("sw_token") || null;
let isLoggedIn = !!authToken;
let adminPanelInstance = null;

async function loadData() {
  try {
    const [swRes, catRes] = await Promise.all([
      fetch("/api/software"),
      fetch("/api/categories")
    ]);
    allSoftware = await swRes.json();
    categories = await catRes.json();
  } catch (error) {
    console.error("Failed to load data:", error);
    allSoftware = [];
    categories = [];
  }
}

function getOpenCategories() {
  return new Set(
    [...document.querySelectorAll('.vault-category.open')]
      .map(el => el.querySelector('.vault-category-title span:last-child')?.textContent?.trim())
      .filter(Boolean)
  );
}

function restoreOpenCategories(openSet) {
  if (!openSet.size) return;
  document.querySelectorAll('.vault-category').forEach(el => {
    const name = el.querySelector('.vault-category-title span:last-child')?.textContent?.trim();
    if (name && openSet.has(name)) el.classList.add('open');
  });
}

function render() {
  const openCategories = getOpenCategories();
  const root = document.getElementById("app");
  root.innerHTML = "";

  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.textContent = isLoggedIn ? "[ LOGOUT ]" : "[ LOGIN ]";
  }

  root.appendChild(renderYoutubeDownloader());

  if (isLoggedIn) {
    adminPanelInstance = renderAdminPanel(onAdd, logout, categories, onAddCategory, onDeleteCategory, allSoftware, onDelete, onReorderCategories);
    root.appendChild(adminPanelInstance.element);
    root.appendChild(renderSoftwareGrid(allSoftware, categories, onDelete, true, onEdit, onReorderCategories));
  } else {
    adminPanelInstance = null;
    root.appendChild(renderSoftwareGrid(allSoftware, categories, onDelete, false));
  }
  restoreOpenCategories(openCategories);
}

function showLoginModal() {
  renderLoginModal(onLogin, dismissLoginModal);
}

function dismissLoginModal() {
  document.getElementById("login-modal")?.remove();
  document.getElementById("modal-styles")?.remove();
}

function onLogin(token) {
  sessionStorage.setItem("sw_token", token);
  authToken = token;
  isLoggedIn = true;
  loadData().then(render);
}

function logout() {
  sessionStorage.removeItem("sw_token");
  authToken = null;
  isLoggedIn = false;
  render();
}

async function onAdd(data) {
  const res = await fetch("/api/software", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + authToken
    },
    body: JSON.stringify(data)
  });

  if (res.status === 201) {
    await loadData();
    render();
  } else if (res.status === 401) {
    alert("// SESSION EXPIRED");
    logout();
  } else {
    const err = await res.json();
    throw new Error("// ERROR: " + (err.error || "unknown"));
  }
}

function onEdit(item) {
  showEditModal({ item, categories, onUpdate });
}

async function onUpdate(id, data) {
  const res = await fetch("/api/software/" + id, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + authToken
    },
    body: JSON.stringify(data)
  });
  if (res.status === 200) {
    await loadData();
    render();
  } else if (res.status === 401) {
    alert("// SESSION EXPIRED");
    logout();
    throw new Error("// SESSION EXPIRED");
  } else {
    const err = await res.json();
    throw new Error("// ERROR: " + (err.error || "unknown"));
  }
}

async function onDelete(id) {
  showConfirm({
    title: 'Delete Software',
    message: 'This entry will be permanently removed from the registry. This action cannot be undone.',
    confirmText: 'DELETE',
    onConfirm: async () => {
      const res = await fetch("/api/software/" + id, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + authToken }
      });
      if (res.status === 200) {
        await loadData();
        render();
      } else if (res.status === 401) {
        alert("// SESSION EXPIRED");
        logout();
      }
    }
  });
}

async function onAddCategory(name) {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + authToken
    },
    body: JSON.stringify({ name })
  });

  if (res.status === 201) {
    await loadData();
    render();
  } else if (res.status === 409) {
    alert("// CATEGORY ALREADY EXISTS");
  } else if (res.status === 401) {
    alert("// SESSION EXPIRED");
    logout();
  }
}

async function onReorderCategories(newOrder) {
  const res = await fetch("/api/categories/order", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + authToken
    },
    body: JSON.stringify({ order: newOrder })
  });
  if (res.ok) {
    await loadData();
    render();
  } else if (res.status === 401) {
    alert("// SESSION EXPIRED");
    logout();
  }
}

async function onDeleteCategory(name) {
  showConfirm({
    title: 'Delete Category',
    message: `Category "<strong style="color:#fff">${name}</strong>" will be permanently deleted. All software in this category will lose their category assignment.`,
    confirmText: 'DELETE',
    onConfirm: async () => {
      const res = await fetch(`/api/categories/${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + authToken }
      });
      if (res.status === 200) {
        await loadData();
        render();
      } else if (res.status === 401) {
        alert("// SESSION EXPIRED");
        logout();
      }
    }
  });
}

function initBubbleHeadline() {
  const h1 = document.getElementById('hero-headline');
  if (!h1) return;
  const text = h1.textContent.trim();
  h1.textContent = '';
  let hoveredIndex = null;

  const spans = text.split('').map((char, idx) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.transition = 'color 0.3s ease-in-out, text-shadow 0.3s ease-in-out';
    span.style.color = 'rgba(153,247,255,0.6)';
    span.addEventListener('mouseenter', () => {
      hoveredIndex = idx;
      updateStyles();
    });
    h1.appendChild(span);
    return span;
  });

  let isHovering = false;

  h1.addEventListener('mouseenter', () => { isHovering = true; });
  h1.addEventListener('mouseleave', () => {
    isHovering = false;
    hoveredIndex = null;
    updateStyles();
  });

  function startSweep() {
    if (isHovering) return;
    let idx = 0;
    function step() {
      if (isHovering) { hoveredIndex = null; updateStyles(); return; }
      hoveredIndex = idx;
      updateStyles();
      idx++;
      if (idx < spans.length + 4) {
        setTimeout(step, 80);
      } else {
        setTimeout(() => { hoveredIndex = null; updateStyles(); }, 300);
      }
    }
    step();
  }

  setTimeout(startSweep, 1200);
  setInterval(startSweep, 7000);

  function updateStyles() {
    spans.forEach((span, idx) => {
      const distance = hoveredIndex !== null ? Math.abs(hoveredIndex - idx) : null;
      if (distance === 0) {
        span.style.color = '#ffffff';
        span.style.textShadow = '0 0 8px #fff, 0 0 24px #99f7ff, 0 0 48px rgba(153,247,255,0.6)';
      } else if (distance === 1) {
        span.style.color = '#99f7ff';
        span.style.textShadow = '0 0 12px rgba(153,247,255,0.8), 0 0 28px rgba(153,247,255,0.4)';
      } else if (distance === 2) {
        span.style.color = '#99f7ff';
        span.style.textShadow = '0 0 10px rgba(153,247,255,0.3)';
      } else if (distance === 3) {
        span.style.color = 'rgba(153,247,255,0.75)';
        span.style.textShadow = 'none';
      } else {
        span.style.color = 'rgba(153,247,255,0.6)';
        span.style.textShadow = 'none';
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  initBubbleHeadline();
  const loginBtn = document.getElementById("login-btn");
  loginBtn.textContent = isLoggedIn ? "[ LOGOUT ]" : "[ LOGIN ]";
  loginBtn.addEventListener("click", () => {
    if (isLoggedIn) logout();
    else showLoginModal();
  });
  await loadData();
  render();
});
