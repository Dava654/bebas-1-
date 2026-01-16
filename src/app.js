/**
 * Main Application - Task Management System
 * Full MVC + UI Day 4 Implementation
 */

// 1. IMPORT SEMUA KOMPONEN
import { TaskController } from "./controllers/TaskController.js";
import { TaskView } from "./views/TaskView.js";
import { UserController } from "./controllers/UserController.js";
import { UserRepository } from "./repositories/UserRepository.js";
import { TaskRepository } from "./repositories/TaskRepository.js";
import { EnhancedStorageManager } from "./storage/EnhancedStorageManager.js";

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
    // Initialize storage manager
    app.storage = new EnhancedStorageManager("taskAppDay2", "2.0");

    // Initialize repositories
    app.userRepository = new UserRepository(app.storage);
    app.taskRepository = new TaskRepository(app.storage);

    // Initialize controllers
    app.userController = new UserController(app.userRepository);
    app.taskController = new TaskController(
      app.taskRepository,
      app.userRepository
    );

    // Initialize view
    app.taskView = new TaskView(app.taskController, app.userController);

    // Setup UI & Auth
    setupAuthEventListeners();
    createDemoUserIfNeeded();
    showLoginSection();

    console.log("✅ Day 2 & Day 4 Application initialized successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize application:", error);
    showMessage("Gagal menginisialisasi aplikasi: " + error.message, "error");
  }
}

/**
 * Setup Event Listeners
 */
function setupAuthEventListeners() {
  // Auth Buttons
  document.getElementById("loginBtn")?.addEventListener("click", handleLogin);
  document
    .getElementById("registerBtn")
    ?.addEventListener("click", showRegisterModal);
  document.getElementById("logoutBtn")?.addEventListener("click", handleLogout);

  // Form Events
  document
    .getElementById("usernameInput")
    ?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleLogin();
    });
  document
    .getElementById("registerForm")
    ?.addEventListener("submit", handleRegister);
  document
    .getElementById("closeRegisterModal")
    ?.addEventListener("click", hideRegisterModal);
  document
    .getElementById("cancelRegister")
    ?.addEventListener("click", hideRegisterModal);

  // Quick Actions
  document
    .getElementById("showOverdueBtn")
    ?.addEventListener("click", showOverdueTasks);
  document
    .getElementById("refreshTasks")
    ?.addEventListener("click", () => app.taskView.refresh());

  // --- UI IMPROVEMENTS (Day 4) ---
  // Loading state buttons
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
      document.querySelector(this.getAttribute("href"))?.scrollIntoView({
        behavior: "smooth",
      });
    });
  });
}

/**
 * Auth Handlers
 */
function handleLogin() {
  const usernameInput = document.getElementById("usernameInput");
  const username = usernameInput.value.trim();
  if (!username) return showMessage("Username wajib diisi", "error");

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
  showMessage("Berhasil keluar", "info");
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
  if (welcome && app.currentUser) {
    welcome.textContent = `Selamat datang, ${
      app.currentUser.fullName || app.currentUser.username
    }!`;
  }
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

function showOverdueTasks() {
  const response = app.taskController.getOverdueTasks();
  if (response.success) {
    showMessage(
      response.count > 0
        ? `Ada ${response.count} task overdue!`
        : "Aman, tidak ada overdue",
      "warning"
    );
  }
}

function showMessage(message, type = "info") {
  if (app.taskView) app.taskView.showMessage(message, type);
  else console.log(`${type.toUpperCase()}: ${message}`);
}

// Global Handlers
window.addEventListener("error", (e) =>
  console.error("Global error:", e.error)
);
document.addEventListener("DOMContentLoaded", initializeApp);
