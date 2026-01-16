/**
 * Main Application - Task Management System (Day 2 + Day 4)
 * Orchestrates: Storage, Repositories, Controllers, Views, and Auth.
 */

// 1. IMPORT SEMUA MODUL (Pastikan file-file ini ada di folder src/...)
import { TaskController } from "./controllers/TaskController.js";
import { TaskView } from "./views/TaskView.js";
import { UserController } from "./controllers/UserController.js";
import { UserRepository } from "./repositories/UserRepository.js";
import { TaskRepository } from "./repositories/TaskRepository.js";
// Pastikan nama file storage manager kamu sesuai (misal EnhancedStorageManager.js)
// import { EnhancedStorageManager } from './storage/EnhancedStorageManager.js';

// Global application state
let app = {
  storage: null,
  userRepository: null,
  taskRepository: null,
  userController: null,
  taskController: null,
  taskView: null,
  currentUser: null,
};

/**
 * Initialize aplikasi
 */
function initializeApp() {
  console.log("🚀 Initializing Task Management System...");

  try {
    // Inisialisasi storage manager (Gunakan class yang kamu punya)
    // app.storage = new EnhancedStorageManager("taskAppDay2", "2.0");

    // Inisialisasi repositories
    app.userRepository = new UserRepository(app.storage);
    app.taskRepository = new TaskRepository(app.storage);

    // Inisialisasi controllers
    app.userController = new UserController(app.userRepository);
    app.taskController = new TaskController(
      app.taskRepository,
      app.userRepository
    );

    // Inisialisasi view
    app.taskView = new TaskView(app.taskController, app.userController);

    // Setup UI & Auth
    setupAuthEventListeners();
    createDemoUserIfNeeded();
    showLoginSection();

    console.log("✅ Application initialized successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize application:", error);
    if (app.taskView)
      app.taskView.showMessage("Gagal inisialisasi: " + error.message, "error");
  }
}

/**
 * Setup Event Listeners (Auth & UI Improvements Day 4)
 */
function setupAuthEventListeners() {
  // Login & Register
  document.getElementById("loginBtn")?.addEventListener("click", handleLogin);
  document
    .getElementById("registerBtn")
    ?.addEventListener("click", showRegisterModal);
  document.getElementById("logoutBtn")?.addEventListener("click", handleLogout);
  document
    .getElementById("usernameInput")
    ?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleLogin();
    });
  document
    .getElementById("registerForm")
    ?.addEventListener("submit", handleRegister);

  // Modal & Quick Actions
  document
    .getElementById("closeRegisterModal")
    ?.addEventListener("click", hideRegisterModal);
  document
    .getElementById("cancelRegister")
    ?.addEventListener("click", hideRegisterModal);
  document
    .getElementById("refreshTasks")
    ?.addEventListener("click", () => app.taskView.refresh());

  // --- DAY 4 UI IMPROVEMENTS ---
  // Loading state untuk semua button
  document.addEventListener("click", (e) => {
    if (e.target.matches(".btn") && !e.target.classList.contains("loading")) {
      e.target.classList.add("loading");
      setTimeout(() => e.target.classList.remove("loading"), 500);
    }
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/**
 * Logic Handlers (Login, Register, Logout)
 */
function handleLogin() {
  const usernameInput = document.getElementById("usernameInput");
  const username = usernameInput.value.trim();

  if (!username) {
    showMessage("Username wajib diisi", "error");
    return;
  }

  const response = app.userController.login(username);
  if (response.success) {
    app.currentUser = response.data;
    app.taskController.setCurrentUser(app.currentUser.id);
    showMainContent();
    app.taskView.refresh();
    showMessage(response.message, "success");
  } else {
    showMessage(response.error, "error");
  }
}

function handleLogout() {
  app.userController.logout();
  app.currentUser = null;
  showLoginSection();
  showMessage("Berhasil logout", "info");
}

function handleRegister(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const userData = {
    username: formData.get("username")?.trim(),
    email: formData.get("email")?.trim(),
    fullName: formData.get("fullName")?.trim(),
  };

  const response = app.userController.register(userData);
  if (response.success) {
    hideRegisterModal();
    showMessage(response.message, "success");
    document.getElementById("usernameInput").value = userData.username;
  } else {
    showMessage(response.error, "error");
  }
}

/**
 * UI Display Helpers
 */
function showLoginSection() {
  document.getElementById("loginSection").style.display = "flex";
  document.getElementById("userInfo").style.display = "none";
  document.getElementById("mainContent").style.display = "none";
}

function showMainContent() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("userInfo").style.display = "flex";
  document.getElementById("mainContent").style.display = "block";
  const welcome = document.getElementById("welcomeMessage");
  if (welcome)
    welcome.textContent = `Selamat datang, ${
      app.currentUser.fullName || app.currentUser.username
    }!`;
}

function showRegisterModal() {
  document.getElementById("registerModal").style.display = "flex";
}
function hideRegisterModal() {
  document.getElementById("registerModal").style.display = "none";
}

function createDemoUserIfNeeded() {
  const users = app.userRepository.findAll();
  if (users.length === 0) {
    app.userRepository.create({
      username: "demo",
      email: "demo@example.com",
      fullName: "Demo User",
    });
  }
}

function showMessage(message, type = "info") {
  if (app.taskView) app.taskView.showMessage(message, type);
  else console.log(`${type.toUpperCase()}: ${message}`);
}

// Global Error Handling
window.addEventListener("error", (e) =>
  showMessage("Terjadi kesalahan aplikasi", "error")
);

// Run
document.addEventListener("DOMContentLoaded", initializeApp);
