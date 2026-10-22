/* Pennywise: beginner-friendly personal expense tracker.
   Data is stored only in the browser using localStorage. */

const CATEGORIES = {
  "Food & Dining": { icon: "☕", color: "#e7846c", bg: "#fff0ec", keywords: ["swiggy", "zomato", "restaurant", "cafe", "coffee", "pizza", "food"] },
  Grocery: { icon: "🛒", color: "#42af7d", bg: "#e8f8ef", keywords: ["bigbasket", "blinkit", "zepto", "grocery", "mart", "supermarket"] },
  Entertainment: { icon: "◉", color: "#8067dc", bg: "#f0edff", keywords: ["netflix", "prime", "hotstar", "pvr", "movie", "spotify", "game"] },
  Shopping: { icon: "⌑", color: "#da79a2", bg: "#ffedf4", keywords: ["amazon", "flipkart", "myntra", "shopping", "clothes"] },
  "Travel & Fuel": { icon: "↗", color: "#4c9fe5", bg: "#eaf5ff", keywords: ["uber", "ola", "rapido", "metro", "petrol", "fuel", "flight", "train"] },
  Bills: { icon: "▤", color: "#de9b37", bg: "#fff5e5", keywords: ["electricity", "wifi", "broadband", "mobile", "bill", "recharge"] },
  "EMI & Loan": { icon: "◫", color: "#e26f75", bg: "#fff0f1", keywords: ["emi", "loan", "installment"] },
  Subscriptions: { icon: "↻", color: "#6687d9", bg: "#eef1ff", keywords: ["subscription", "youtube", "icloud", "canva"] },
  Healthcare: { icon: "✚", color: "#50ab9c", bg: "#e8f8f5", keywords: ["pharmacy", "doctor", "hospital", "medicine", "health"] },
  Education: { icon: "▱", color: "#af79d3", bg: "#f7effd", keywords: ["course", "udemy", "college", "books", "education"] },
  Other: { icon: "•", color: "#8290a4", bg: "#f0f3f7", keywords: [] },
};

const DEFAULT_BUDGETS = {
  "Food & Dining": 3000, Grocery: 5000, Entertainment: 1500, Shopping: 2500,
  "Travel & Fuel": 2000, Bills: 2500, "EMI & Loan": 0, Subscriptions: 1000,
  Healthcare: 1500, Education: 1000, Other: 1000,
};

let transactions = [];
let budgets = {};
let chart = null;
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const dateKey = (date = new Date()) => date.toISOString().slice(0, 10);
const localDate = (daysAgo) => { const date = new Date(); date.setDate(date.getDate() - daysAgo); return dateKey(date); };
const currentMonth = () => dateKey().slice(0, 7);
const formatDate = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const titleCase = (word) => word.charAt(0).toUpperCase() + word.slice(1);

function createDemoTransactions() {
  return [
    { id: crypto.randomUUID(), name: "Monthly salary", amount: 45000, category: "Other", date: localDate(20), type: "income", note: "" },
    { id: crypto.randomUUID(), name: "BigBasket groceries", amount: 1740, category: "Grocery", date: localDate(1), type: "expense", note: "" },
    { id: crypto.randomUUID(), name: "Swiggy dinner", amount: 420, category: "Food & Dining", date: localDate(2), type: "expense", note: "" },
    { id: crypto.randomUUID(), name: "Netflix", amount: 199, category: "Entertainment", date: localDate(5), type: "expense", note: "" },
    { id: crypto.randomUUID(), name: "Uber ride", amount: 268, category: "Travel & Fuel", date: localDate(7), type: "expense", note: "" },
    { id: crypto.randomUUID(), name: "Electricity bill", amount: 1150, category: "Bills", date: localDate(11), type: "expense", note: "" },
    { id: crypto.randomUUID(), name: "Amazon order", amount: 899, category: "Shopping", date: localDate(15), type: "expense", note: "" },
    { id: crypto.randomUUID(), name: "Spotify Premium", amount: 119, category: "Subscriptions", date: localDate(18), type: "expense", note: "" },
  ];
}

function initialiseData() {
  const savedTransactions = localStorage.getItem("pennywise-transactions");
  const savedBudgets = localStorage.getItem("pennywise-budgets");
  transactions = savedTransactions ? JSON.parse(savedTransactions) : createDemoTransactions();
  budgets = savedBudgets ? JSON.parse(savedBudgets) : { ...DEFAULT_BUDGETS };
  persist();
}

function persist() {
  localStorage.setItem("pennywise-transactions", JSON.stringify(transactions));
  localStorage.setItem("pennywise-budgets", JSON.stringify(budgets));
}

function monthlyTransactions() { return transactions.filter((item) => item.date.startsWith(currentMonth())); }
function total(items) { return items.reduce((sum, item) => sum + Number(item.amount), 0); }
function monthlyExpenses() { return monthlyTransactions().filter((item) => item.type === "expense"); }
function monthlyIncome() { return monthlyTransactions().filter((item) => item.type === "income"); }
function allIncome() { return transactions.filter((item) => item.type === "income"); }
function allExpenses() { return transactions.filter((item) => item.type === "expense"); }
function byCategory(items = monthlyExpenses()) {
  return items.reduce((totals, item) => { totals[item.category] = (totals[item.category] || 0) + Number(item.amount); return totals; }, {});
}

function metadata(category) { return CATEGORIES[category] || CATEGORIES.Other; }
function categoryIcon(category, compact = false) {
  const meta = metadata(category);
  return `<span class="transaction-category-icon" style="--icon-bg:${meta.bg};--icon-color:${meta.color}">${meta.icon}</span>`;
}

function renderOverview() {
  const expenseTotal = total(monthlyExpenses());
  const incomeTotal = total(monthlyIncome());
  const balance = total(allIncome()) - total(allExpenses());
  const categoryTotals = byCategory();
  const [topCategory, topAmount = 0] = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ["—", 0];
  const budgetTotal = total(Object.entries(budgets).filter(([category]) => category !== "EMI & Loan").map(([, value]) => ({ amount: value })));
  const budgetLeft = budgetTotal - expenseTotal;

  $("#balance-value").textContent = money.format(balance);
  $("#balance-note").textContent = balance >= 0 ? "Your all-time income minus spending." : "You have spent more than recorded income.";
  $("#balance-note").className = balance >= 0 ? "positive" : "negative";
  $("#spent-value").textContent = money.format(expenseTotal);
  $("#spent-note").textContent = expenseTotal ? `${monthlyExpenses().length} expense${monthlyExpenses().length === 1 ? "" : "s"} recorded this month.` : "No expenses this month yet.";
  $("#budget-left-value").textContent = money.format(Math.max(budgetLeft, 0));
  $("#budget-left-note").textContent = budgetLeft >= 0 ? `${money.format(budgetTotal)} planned across your categories.` : `${money.format(Math.abs(budgetLeft))} over your combined monthly budgets.`;
  $("#budget-left-note").className = budgetLeft >= 0 ? "positive" : "negative";
  $("#top-category-value").textContent = topCategory === "—" ? "—" : topCategory;
  $("#top-category-note").textContent = topAmount ? `${money.format(topAmount)} spent this month.` : "Your biggest monthly expense.";
  $("#chart-total").textContent = `${money.format(expenseTotal)} spent`;

  renderChart(categoryTotals);
  renderBudgetList(categoryTotals);
  renderRecentTransactions();
  renderInsights(categoryTotals, expenseTotal, incomeTotal);
}

function renderChart(categoryTotals) {
  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);
  const canvas = $("#spending-chart");
  const colors = labels.map((category) => metadata(category).color);
  if (typeof Chart === "undefined") {
    $("#chart-legend").innerHTML = `<span class="legend-item">Chart loading needs an internet connection.</span>`;
    return;
  }
  if (chart) chart.destroy();
  chart = new Chart(canvas, {
    type: "doughnut",
    data: { labels, datasets: [{ data: values.length ? values : [1], backgroundColor: values.length ? colors : ["#e9ecf4"], borderWidth: 0, hoverOffset: 4 }] },
    options: { cutout: "72%", plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => values.length ? ` ${context.label}: ${money.format(context.raw)}` : " No spending yet" } } }, maintainAspectRatio: false },
  });
  $("#chart-legend").innerHTML = labels.length
    ? labels.map((label) => `<span class="legend-item"><i class="legend-dot" style="background:${metadata(label).color}"></i>${label}</span>`).join("")
    : `<span class="legend-item">Add an expense to see your spending mix.</span>`;
}

function progressState(spent, budget) {
  if (!budget) return { percent: 0, state: "" };
  const percent = Math.min((spent / budget) * 100, 100);
  return { percent, state: percent >= 100 ? "danger-fill" : percent >= 80 ? "warning-fill" : "" };
}

function renderBudgetList(categoryTotals) {
  const tracked = Object.entries(budgets).filter(([, amount]) => Number(amount) > 0).sort((a, b) => (categoryTotals[b[0]] || 0) - (categoryTotals[a[0]] || 0)).slice(0, 4);
  $("#dashboard-budget-list").innerHTML = tracked.length ? tracked.map(([category, budget]) => {
    const spent = categoryTotals[category] || 0;
    const { percent, state } = progressState(spent, budget);
    return `<div class="budget-item"><div class="budget-label"><span>${category}</span><span>${money.format(spent)} / ${money.format(budget)}</span></div><div class="progress-track"><div class="progress-fill ${state}" style="width:${percent}%"></div></div></div>`;
  }).join("") : `<p class="budget-blank">Add a budget to start keeping score.</p>`;
}

function renderRecentTransactions() {
  const latest = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  $("#recent-transactions").innerHTML = latest.length ? latest.map((item) => `
    <div class="transaction-row">${categoryIcon(item.category)}<div class="transaction-main"><p class="transaction-name">${escapeHtml(item.name)}</p><p class="transaction-meta">${item.type === "income" ? "Income" : item.category} · ${formatDate(item.date)}</p></div><strong class="transaction-amount ${item.type === "income" ? "income" : ""}">${item.type === "income" ? "+" : "−"}${money.format(item.amount)}</strong></div>`).join("") : `<p class="empty-state">Your newest entries will appear here.</p>`;
}

function renderTransactions() {
  const query = $("#transaction-search").value.trim().toLowerCase();
  const category = $("#category-filter").value;
  const type = $("#type-filter").value;
  const filtered = [...transactions].filter((item) =>
    (!query || item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query)) &&
    (category === "all" || item.category === category) && (type === "all" || item.type === type)
  ).sort((a, b) => b.date.localeCompare(a.date));
  $("#transaction-table-body").innerHTML = filtered.map((item) => {
    const meta = metadata(item.category);
    return `<tr><td><div class="table-transaction">${categoryIcon(item.category)}<div><strong>${escapeHtml(item.name)}</strong><span>${item.type === "income" ? "Income" : (escapeHtml(item.note) || "Expense")}</span></div></div></td><td><span class="category-tag" style="--tag-bg:${meta.bg};--tag-color:${meta.color}">${item.category}</span></td><td>${formatDate(item.date)}</td><td><strong class="transaction-amount ${item.type === "income" ? "income" : ""}">${item.type === "income" ? "+" : "−"}${money.format(item.amount)}</strong></td><td><button class="delete-button" data-delete-id="${item.id}" aria-label="Delete ${escapeHtml(item.name)}" title="Delete transaction">×</button></td></tr>`;
  }).join("");
  $("#no-transactions").classList.toggle("hidden", filtered.length > 0);
}

function renderBudgetEditor() {
  const totals = byCategory();
  $("#budget-editor").innerHTML = Object.entries(CATEGORIES).filter(([category]) => category !== "Other").map(([category, meta]) => {
    const budget = Number(budgets[category]) || 0;
    const spent = totals[category] || 0;
    const { percent, state } = progressState(spent, budget);
    return `<article class="budget-card"><div class="budget-card-header">${categoryIcon(category)}<h3>${category}</h3></div><p>${money.format(spent)} spent this month</p><label class="budget-input">₹<input class="budget-value" data-category="${category}" type="number" min="0" step="100" value="${budget}" aria-label="Budget for ${category}" /></label><div class="progress-track"><div class="progress-fill ${state}" style="width:${percent}%"></div></div></article>`;
  }).join("");
}

function renderInsights(categoryTotals, expenseTotal, incomeTotal) {
  const ranked = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const [topName, topValue] = ranked[0] || ["No category", 0];
  const topShare = expenseTotal ? Math.round((topValue / expenseTotal) * 100) : 0;
  const overBudget = Object.entries(budgets).filter(([category, value]) => value > 0 && (categoryTotals[category] || 0) >= value);
  const nearBudget = Object.entries(budgets).filter(([category, value]) => value > 0 && (categoryTotals[category] || 0) / value >= .8 && (categoryTotals[category] || 0) < value);
  const dailyAverage = expenseTotal ? Math.round(expenseTotal / Math.max(new Date().getDate(), 1)) : 0;
  const savings = incomeTotal - expenseTotal;
  const cards = [
    { symbol: "✦", title: "Your biggest spend", text: topValue ? `${topName} is your largest category at ${money.format(topValue)} — ${topShare}% of this month's spending.` : "Add an expense and Pennywise will find your top category." },
    { symbol: "◴", title: overBudget.length ? "Budget alert" : nearBudget.length ? "Nearly there" : "Budget status", text: overBudget.length ? `You have crossed the ${overBudget.map(([name]) => name).join(", ")} budget. Consider pausing new spends there.` : nearBudget.length ? `${nearBudget.map(([name]) => name).join(", ")} is above 80% of its planned budget.` : "You are currently within every category budget. Keep going!" },
    { symbol: "↗", title: "Daily rhythm", text: dailyAverage ? `You have spent an average of ${money.format(dailyAverage)} per day this month.` : "Record your first expense to discover your daily spending pattern." },
    { symbol: "₹", title: "This month's gap", text: incomeTotal ? (savings >= 0 ? `You have ${money.format(savings)} left from the income recorded this month.` : `Your recorded expenses are ${money.format(Math.abs(savings))} above this month's income.`) : "Add income too, so Pennywise can show your monthly balance." },
  ];
  $("#insight-grid").innerHTML = cards.map((card) => `<article class="insight-card"><span class="insight-symbol">${card.symbol}</span><h3>${card.title}</h3><p>${card.text}</p></article>`).join("");
}

function populateSelects() {
  const options = Object.keys(CATEGORIES).map((category) => `<option value="${category}">${category}</option>`).join("");
  $("#transaction-category").innerHTML = options;
  $("#category-filter").innerHTML = `<option value="all">All categories</option>${options}`;
}

function renderAll() { renderOverview(); renderTransactions(); renderBudgetEditor(); }
function escapeHtml(value) { const div = document.createElement("div"); div.textContent = value; return div.innerHTML; }

function setView(viewName) {
  $$(".view").forEach((view) => view.classList.toggle("active-view", view.id === viewName));
  $$("[data-view-target]").forEach((button) => button.classList.toggle("active", button.dataset.viewTarget === viewName && button.classList.contains("nav-link")));
  const titles = { dashboard: "Good to see you!", transactions: "Your transactions", budgets: "Budget planner", insights: "Your insights" };
  $("#page-title").textContent = titles[viewName];
  $("#sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showModal() {
  $("#transaction-form").reset();
  $("#transaction-date").value = dateKey();
  $("#transaction-category").value = "Other";
  $("#category-suggestion").textContent = "";
  $("#modal-backdrop").classList.remove("hidden");
  $("#transaction-modal").classList.remove("hidden");
  setTimeout(() => $("#transaction-name").focus(), 100);
}
function hideModal() { $("#modal-backdrop").classList.add("hidden"); $("#transaction-modal").classList.add("hidden"); }
function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.remove("hidden"); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => toast.classList.add("hidden"), 2600); }

function suggestedCategory(name) {
  const lower = name.toLowerCase();
  return Object.entries(CATEGORIES).find(([, meta]) => meta.keywords.some((keyword) => lower.includes(keyword)))?.[0];
}

function bindEvents() {
  $$("[data-view-target]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.viewTarget)));
  $("#mobile-menu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  [$("#open-transaction-modal"), $("#open-transaction-modal-2")].forEach((button) => button.addEventListener("click", showModal));
  $("#close-transaction-modal").addEventListener("click", hideModal);
  $("#modal-backdrop").addEventListener("click", hideModal);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") hideModal(); });

  $("#transaction-name").addEventListener("input", (event) => {
    const category = suggestedCategory(event.target.value);
    $("#category-suggestion").textContent = category ? `Suggested category: ${category}` : "";
    if (category) $("#transaction-category").value = category;
  });
  $("#transaction-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    transactions.push({ id: crypto.randomUUID(), name: data.get("name").trim(), amount: Number(data.get("amount")), category: data.get("category"), date: data.get("date"), type: data.get("type"), note: data.get("note").trim() });
    persist(); renderAll(); hideModal(); showToast("Transaction saved to Pennywise.");
  });

  [$("#transaction-search"), $("#category-filter"), $("#type-filter")].forEach((field) => field.addEventListener("input", renderTransactions));
  $("#transaction-table-body").addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-id]");
    if (!button) return;
    transactions = transactions.filter((item) => item.id !== button.dataset.deleteId);
    persist(); renderAll(); showToast("Transaction deleted.");
  });
  $("#save-budgets").addEventListener("click", () => {
    $$(".budget-value").forEach((input) => { budgets[input.dataset.category] = Math.max(0, Number(input.value) || 0); });
    persist(); renderAll(); showToast("Your budgets have been saved.");
  });
  $("#reset-data").addEventListener("click", () => {
    if (!confirm("Reset Pennywise to its sample data? Your current browser data will be replaced.")) return;
    transactions = createDemoTransactions(); budgets = { ...DEFAULT_BUDGETS }; persist(); renderAll(); showToast("Demo data restored.");
  });
}

function start() {
  $("#page-date").textContent = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }).toUpperCase();
  initialiseData(); populateSelects(); bindEvents(); renderAll();
}
start();
