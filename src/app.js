/**
 * MAIN APPLICATION - Task Management System
 * Full Implementation: MVC Architecture, Auth, & UI Day 4
 */

// 1. IMPORT SEMUA MODUL
// Browser akan otomatis 'menjemput' file-file ini melalui app.js
import { TaskController } from "./controllers/TaskController.js";
import { TaskView } from "./views/TaskView.js";
import { UserController } from "./controllers/UserController.js";
import { UserRepository } from "./repositories/UserRepository.js";
import { TaskRepository } from "./repositories/TaskRepository.js";
import { EnhancedStorageManager } from "./storage/EnhancedStorageManager.js";

// Global application state (Pusat kendali aplikasi)
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
 * Inisialisasi Utama Aplikasi
 */
function initializeApp() {
  console.log("🚀 Initializing Day 2 & Day 4 Task Management System...");

  try {
    // A. Setup infrastruktur data
    app.storage = new EnhancedStorageManager("taskAppDay2", "2.0");
    app.userRepository = new UserRepository(app.storage);
    app.taskRepository = new TaskRepository(app.storage);

    // B. Setup logika bisnis (Controllers)
    app.userController = new UserController(app.userRepository);
    app.taskController = new TaskController(
      app.taskRepository,
      app.userRepository
    );

    // C. Setup antarmuka (View)
    app.taskView = new TaskView(app.taskController, app.userController);

    // D. Jalankan Event Listeners & Auth
    setupEventListeners();
    createDemoUserIfNeeded();
    showLoginSection();

    console.log("✅ Application initialized successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize application:", error);
  }
}

/**
 * Setup Event Listeners (Auth & UI Improvements)
 */
function setupEventListeners() {
  // LOGIN & REGISTER
  document.getElementById("loginBtn")?.addEventListener("click", handleLogin);
  document.getElementById("logoutBtn")?.addEventListener("click", handleLogout);
  document
    .getElementById("registerForm")
    ?.addEventListener("submit", handleRegister);

  // INPUT ENTER KEY
  document
    .getElementById("usernameInput")
    ?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleLogin();
    });

  // --- UI IMPROVEMENTS (DAY 4) ---
  // Loading state untuk setiap tombol yang diklik
  document.addEventListener("click", (e) => {
    if (e.target.matches(".btn") && !e.target.classList.contains("loading")) {
      e.target.classList.add("loading");
      setTimeout(() => e.target.classList.remove("loading"), 500);
    }
  });

  // Smooth Scroll untuk link internal
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/**
 * HANDLERS (LOGIKA LOGIN / AUTH)
 */
function handleLogin() {
  const usernameInput = document.getElementById("usernameInput");
  const username = usernameInput.value.trim();

  if (!username) {
    app.taskView.showMessage("Username wajib diisi", "error");
    return;
  }

  const response = app.userController.login(username);
  if (response.success) {
    app.currentUser = response.data;
    app.taskController.setCurrentUser(app.currentUser.id);

    showMainContent();
    app.taskView.refresh();
    app.taskView.showMessage(response.message, "success");
  } else {
    app.taskView.showMessage(response.error, "error");
  }
}

function handleLogout() {
  app.userController.logout();
  app.currentUser = null;
  showLoginSection();
  app.taskView.showMessage("Berhasil logout", "info");
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
    document.getElementById("registerModal").style.display = "none";
    document.getElementById("usernameInput").value = userData.username;
    app.taskView.showMessage("Registrasi berhasil!", "success");
  } else {
    app.taskView.showMessage(response.error, "error");
  }
}

/**
 * UI DISPLAY HELPERS
 */
function showLoginSection() {
  document.getElementById("loginSection").style.display = "flex";
  document.getElementById("mainContent").style.display = "none";
  document.getElementById("userInfo").style.display = "none";
}

function showMainContent() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("mainContent").style.display = "block";
  document.getElementById("userInfo").style.display = "flex";

  const welcome = document.getElementById("welcomeMessage");
  if (welcome && app.currentUser) {
    welcome.textContent = `Selamat datang, ${
      app.currentUser.fullName || app.currentUser.username
    }!`;
  }
}

function createDemoUserIfNeeded() {
  if (app.userRepository.findAll().length === 0) {
    app.userRepository.create({
      username: "demo",
      email: "demo@example.com",
      fullName: "Demo User",
    });
  }
}

// JALANKAN SAAT DOM SIAP
document.addEventListener("DOMContentLoaded", initializeApp);
