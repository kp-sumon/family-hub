const STORAGE_KEY = "family-hub-data-v1";

const defaultData = {
  family: {
    name: "Rahman Family",
    member: "Alex Rahman",
    goal: 68
  },
  chores: [
    {
      id: crypto.randomUUID(),
      title: "Clean the living room",
      assignee: "Alex",
      due: "Today",
      status: "pending",
      points: 15
    },
    {
      id: crypto.randomUUID(),
      title: "Water the plants",
      assignee: "Maya",
      due: "Tomorrow",
      status: "done",
      points: 10
    },
    {
      id: crypto.randomUUID(),
      title: "Organize study table",
      assignee: "Sam",
      due: "Friday",
      status: "pending",
      points: 20
    }
  ],
  rewards: [
    {
      id: crypto.randomUUID(),
      title: "Movie night",
      cost: 50,
      emoji: "🎬",
      claimed: false
    },
    {
      id: crypto.randomUUID(),
      title: "Choose dinner",
      cost: 80,
      emoji: "🍕",
      claimed: false
    },
    {
      id: crypto.randomUUID(),
      title: "Weekend outing",
      cost: 150,
      emoji: "🌈",
      claimed: false
    }
  ],
  planner: [
    {
      id: crypto.randomUUID(),
      title: "Family grocery shopping",
      date: "2026-08-24",
      time: "18:30",
      category: "Family",
      color: "purple"
    },
    {
      id: crypto.randomUUID(),
      title: "Parent-teacher meeting",
      date: "2026-08-26",
      time: "10:00",
      category: "Important",
      color: "orange"
    }
  ],
  tasks: [
    {
      id: crypto.randomUUID(),
      title: "Renew internet package",
      priority: "high",
      status: "open",
      due: "Today"
    },
    {
      id: crypto.randomUUID(),
      title: "Buy school supplies",
      priority: "medium",
      status: "open",
      due: "Tomorrow"
    }
  ]
};

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }

  try {
    return JSON.parse(saved);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }
}

let state = loadData();

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function get(selector) {
  return document.querySelector(selector);
}

function getAll(selector) {
  return [...document.querySelectorAll(selector)];
}

function makeId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toast(message) {
  const oldToast = get(".toast");
  if (oldToast) oldToast.remove();

  const element = document.createElement("div");
  element.className = "toast";
  element.textContent = message;
  document.body.appendChild(element);

  setTimeout(() => element.remove(), 3000);
}

function formatDate(dateString) {
  if (!dateString) return "No date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${dateString}T00:00:00`));
}

function setupTheme() {
  const savedTheme = localStorage.getItem("family-hub-theme") || "light";
  document.documentElement.dataset.theme = savedTheme;

  getAll("[data-theme-toggle]").forEach(button => {
    button.addEventListener("click", () => {
      const nextTheme =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";

      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem("family-hub-theme", nextTheme);
      toast(`${nextTheme === "dark" ? "Dark" : "Light"} mode enabled`);
    });
  });
}

function setupNavigation() {
  const menuButton = get("[data-menu]");
  const sidebar = get(".sidebar");
  const overlay = get(".overlay");

  if (!menuButton || !sidebar || !overlay) return;

  const closeMenu = () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  };

  menuButton.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
  });

  overlay.addEventListener("click", closeMenu);
  getAll(".nav a").forEach(link => link.addEventListener("click", closeMenu));
}

function setActiveNav() {
  const currentPage = location.pathname.split("/").pop() || "index.html";

  getAll(".nav a").forEach(link => {
    const linkPage = link.getAttribute("href");
    link.classList.toggle("active", linkPage === currentPage);
  });
}

function renderSharedProfile() {
  const userName = get("[data-user-name]");
  const userInitial = get("[data-user-initial]");

  if (userName) userName.textContent = state.family.member;
  if (userInitial) userInitial.textContent = state.family.member.charAt(0);

  const familyName = get("[data-family-name]");
  if (familyName) familyName.textContent = state.family.name;
}

function renderDashboard() {
  if (!get("[data-dashboard]")) return;

  const completed = state.chores.filter(item => item.status === "done").length;
  const pending = state.chores.filter(item => item.status !== "done").length;
  const upcoming = state.planner.length;

  const completedElement = get("[data-completed]");
  const pendingElement = get("[data-pending]");
  const upcomingElement = get("[data-upcoming]");
  const progressElement = get("[data-progress]");

  if (completedElement) completedElement.textContent = completed;
  if (pendingElement) pendingElement.textContent = pending;
  if (upcomingElement) upcomingElement.textContent = upcoming;
  if (progressElement) progressElement.style.width = `${state.family.goal}%`;

  const recentList = get("[data-recent-list]");
  if (!recentList) return;

  const latest = [
    ...state.chores.map(item => ({
      icon: item.status === "done" ? "✅" : "🧹",
      title: item.title,
      meta: `${item.assignee} · ${item.points} points`,
      badge: item.status === "done" ? "Done" : "Pending",
      badgeClass: item.status === "done" ? "" : "warning"
    })),
    ...state.planner.slice(0, 2).map(item => ({
      icon: "📅",
      title: item.title,
      meta: `${formatDate(item.date)} · ${item.time}`,
      badge: "Planned",
      badgeClass: ""
    }))
  ].slice(0, 5);

  recentList.innerHTML = latest.length
    ? latest.map(item => `
      <div class="list-item">
        <div class="item-icon">${item.icon}</div>
        <div class="item-copy">
          <strong>${escapeHTML(item.title)}</strong>
          <span>${escapeHTML(item.meta)}</span>
        </div>
        <span class="badge ${item.badgeClass}">${item.badge}</span>
      </div>
    `).join("")
    : `<div class="empty">No family activity yet.</div>`;
}

function renderChores() {
  const list = get("[data-chores-list]");
  if (!list) return;

  const filter = get("[data-chore-filter]")?.value || "all";
  const chores = state.chores.filter(item => {
    return filter === "all" || item.status === filter;
  });

  list.innerHTML = chores.length
    ? chores.map(item => `
      <div class="list-item">
        <div class="item-icon">${item.status === "done" ? "✅" : "🧹"}</div>
        <div class="item-copy">
          <strong>${escapeHTML(item.title)}</strong>
          <span>${escapeHTML(item.assignee)} · Due ${escapeHTML(item.due)} · ${item.points} points</span>
        </div>
        <button class="btn small ${item.status === "done" ? "secondary" : ""}"
          data-complete-chore="${item.id}">
          ${item.status === "done" ? "Completed" : "Complete"}
        </button>
      </div>
    `).join("")
    : `<div class="empty">No chores found.</div>`;

  getAll("[data-complete-chore]").forEach(button => {
    button.addEventListener("click", () => {
      const chore = state.chores.find(item => item.id === button.dataset.completeChore);
      if (!chore) return;

      chore.status = chore.status === "done" ? "pending" : "done";
      saveData();
      renderChores();
      toast(chore.status === "done" ? "Chore completed 🎉" : "Chore marked pending");
    });
  });
}

function setupChoreForm() {
  const form = get("[data-chore-form]");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(form);

    state.chores.unshift({
      id: makeId(),
      title: formData.get("title"),
      assignee: formData.get("assignee"),
      due: formData.get("due") || "No date",
      points: Number(formData.get("points")) || 10,
      status: "pending"
    });

    saveData();
    form.reset();
    renderChores();
    toast("New chore added");
  });
}

function renderRewards() {
  const list = get("[data-rewards-list]");
  if (!list) return;

  list.innerHTML = state.rewards.map(item => `
    <article class="card feature-card">
      <div class="emoji">${item.emoji}</div>
      <h3>${escapeHTML(item.title)}</h3>
      <p>Redeem this reward with ${item.cost} family points.</p>
      <button class="btn small ${item.claimed ? "secondary" : ""}"
        data-claim-reward="${item.id}"
        ${item.claimed ? "disabled" : ""}>
        ${item.claimed ? "Claimed" : `Redeem · ${item.cost} pts`}
      </button>
    </article>
  `).join("");

  getAll("[data-claim-reward]").forEach(button => {
    button.addEventListener("click", () => {
      const reward = state.rewards.find(item => item.id === button.dataset.claimReward);
      if (!reward) return;

      reward.claimed = true;
      saveData();
      renderRewards();
      toast(`${reward.title} redeemed successfully 🎁`);
    });
  });
}

function setupRewardForm() {
  const form = get("[data-reward-form]");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(form);

    state.rewards.push({
      id: makeId(),
      title: formData.get("title"),
      cost: Number(formData.get("cost")) || 10,
      emoji: formData.get("emoji") || "🎁",
      claimed: false
    });

    saveData();
    form.reset();
    renderRewards();
    toast("New reward created");
  });
}

function renderPlanner() {
  const list = get("[data-planner-list]");
  if (!list) return;

  const sorted = [...state.planner].sort((a, b) =>
    `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
  );

  list.innerHTML = sorted.length
    ? sorted.map(item => `
      <div class="list-item">
        <div class="item-icon">📅</div>
        <div class="item-copy">
          <strong>${escapeHTML(item.title)}</strong>
          <span>${formatDate(item.date)} · ${escapeHTML(item.time)} · ${escapeHTML(item.category)}</span>
        </div>
        <button class="icon-btn" data-delete-plan="${item.id}" aria-label="Delete event">×</button>
      </div>
    `).join("")
    : `<div class="empty">No events planned.</div>`;

  getAll("[data-delete-plan]").forEach(button => {
    button.addEventListener("click", () => {
      state.planner = state.planner.filter(item => item.id !== button.dataset.deletePlan);
      saveData();
      renderPlanner();
      toast("Event removed");
    });
  });
}

function setupPlannerForm() {
  const form = get("[data-planner-form]");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(form);

    state.planner.push({
      id: makeId(),
      title: formData.get("title"),
      date: formData.get("date"),
      time: formData.get("time"),
      category: formData.get("category") || "Family",
      color: "purple"
    });

    saveData();
    form.reset();
    renderPlanner();
    toast("Event added to planner");
  });
}

function renderTasks() {
  const list = get("[data-tasks-list]");
  if (!list) return;

  const filter = get("[data-task-filter]")?.value || "all";

  const tasks = state.tasks.filter(item => {
    return filter === "all" || item.status === filter || item.priority === filter;
  });

  list.innerHTML = tasks.length
    ? tasks.map(item => `
      <div class="list-item">
        <div class="item-icon">${item.status === "done" ? "✅" : "📌"}</div>
        <div class="item-copy">
          <strong>${escapeHTML(item.title)}</strong>
          <span>${escapeHTML(item.due)} · ${escapeHTML(item.priority)} priority</span>
        </div>
        <span class="badge ${item.priority === "high" ? "danger" : item.priority === "medium" ? "warning" : ""}">
          ${item.status === "done" ? "Done" : item.priority}
        </span>
        <button class="btn small secondary" data-complete-task="${item.id}">
          ${item.status === "done" ? "Undo" : "Done"}
        </button>
      </div>
    `).join("")
    : `<div class="empty">No tasks found.</div>`;

  getAll("[data-complete-task]").forEach(button => {
    button.addEventListener("click", () => {
      const task = state.tasks.find(item => item.id === button.dataset.completeTask);
      if (!task) return;

      task.status = task.status === "done" ? "open" : "done";
      saveData();
      renderTasks();
      toast(task.status === "done" ? "Task completed 🎉" : "Task reopened");
    });
  });
}

function setupTaskForm() {
  const form = get("[data-task-form]");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(form);

    state.tasks.unshift({
      id: makeId(),
      title: formData.get("title"),
      priority: formData.get("priority"),
      status: "open",
      due: formData.get("due") || "No date"
    });

    saveData();
    form.reset();
    renderTasks();
    toast("Task added");
  });
}

function setupFilters() {
  getAll("[data-chore-filter]").forEach(select =>
    select.addEventListener("change", renderChores)
  );

  getAll("[data-task-filter]").forEach(select =>
    select.addEventListener("change", renderTasks)
  );
}

function setupReset() {
  getAll("[data-reset-data]").forEach(button => {
    button.addEventListener("click", () => {
      if (!confirm("Reset all Family Hub data?")) return;

      localStorage.removeItem(STORAGE_KEY);
      state = loadData();
      location.reload();
    });
  });
}

function init() {
  setupTheme();
  setupNavigation();
  setActiveNav();
  renderSharedProfile();
  renderDashboard();
  renderChores();
  renderRewards();
  renderPlanner();
  renderTasks();
  setupChoreForm();
  setupRewardForm();
  setupPlannerForm();
  setupTaskForm();
  setupFilters();
  setupReset();
}

document.addEventListener("DOMContentLoaded", init);
