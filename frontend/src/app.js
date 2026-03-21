import { renderSoftwareGrid } from "./components/SoftwareGrid.js";
import { renderLoginModal } from "./components/LoginModal.js";
import { renderAdminPanel } from "./components/AdminPanel.js";
import { showConfirm } from "./components/ConfirmModal.js";

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

  if (isLoggedIn) {
    adminPanelInstance = renderAdminPanel(onAdd, logout, categories, onAddCategory, onDeleteCategory, allSoftware, onDelete);
    root.appendChild(adminPanelInstance.element);
    root.appendChild(renderSoftwareGrid(allSoftware, categories, onDelete, true));
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

document.addEventListener("DOMContentLoaded", async () => {
  const loginBtn = document.getElementById("login-btn");
  loginBtn.textContent = isLoggedIn ? "[ LOGOUT ]" : "[ LOGIN ]";
  loginBtn.addEventListener("click", () => {
    if (isLoggedIn) logout();
    else showLoginModal();
  });
  await loadData();
  render();
});
