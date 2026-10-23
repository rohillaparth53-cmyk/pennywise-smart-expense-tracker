/* PennyWise AI - Personal Finance Intelligence Platform
   Full-stack intelligence engine with local deterministic fallback & API synthesis
*/

// --- CATEGORY METADATA & CONSTANTS (Soft Pastel Aesthetic Theme) ---
const CATEGORIES = {
  "Food & Dining": { icon: "☕", color: "#F87171", bg: "#FFF1F2", keywords: ["swiggy", "zomato", "restaurant", "cafe", "coffee", "pizza", "food", "burger", "starbucks", "mcdonalds", "biryani", "lunch", "dinner"] },
  Grocery: { icon: "🛒", color: "#34D399", bg: "#ECFDF5", keywords: ["bigbasket", "blinkit", "zepto", "grocery", "mart", "supermarket", "vegetables", "milk", "fruits"] },
  Entertainment: { icon: "🎬", color: "#A78BFA", bg: "#F5F3FF", keywords: ["netflix", "prime", "hotstar", "pvr", "movie", "spotify", "game", "steam", "cinema", "theatre"] },
  Shopping: { icon: "🛍️", color: "#F472B6", bg: "#FDF2F8", keywords: ["amazon", "flipkart", "myntra", "shopping", "clothes", "zara", "h&m", "shoes", "electronics"] },
  "Travel & Fuel": { icon: "🚗", color: "#38BDF8", bg: "#F0F9FF", keywords: ["uber", "ola", "rapido", "metro", "petrol", "fuel", "flight", "train", "toll", "cab"] },
  Bills: { icon: "⚡", color: "#FBBF24", bg: "#FEFCE8", keywords: ["electricity", "wifi", "broadband", "mobile", "bill", "recharge", "water", "gas"] },
  "EMI & Loan": { icon: "💳", color: "#FB7185", bg: "#FFF1F2", keywords: ["emi", "loan", "installment", "mortgage", "credit card"] },
  Subscriptions: { icon: "🔄", color: "#818CF8", bg: "#EEF2FF", keywords: ["subscription", "youtube", "icloud", "canva", "gym", "membership"] },
  Healthcare: { icon: "💊", color: "#2DD4BF", bg: "#F0FDFA", keywords: ["pharmacy", "doctor", "hospital", "medicine", "health", "clinic", "dental"] },
  Education: { icon: "📚", color: "#A3E635", bg: "#F7FEE7", keywords: ["course", "udemy", "college", "books", "education", "tuition", "school"] },
  Other: { icon: "🏷️", color: "#94A3B8", bg: "#F8FAFC", keywords: [] },
};

const DEFAULT_BUDGETS = {
  "Food & Dining": 4000,
  Grocery: 6000,
  Entertainment: 2000,
  Shopping: 3000,
  "Travel & Fuel": 2500,
  Bills: 3000,
  "EMI & Loan": 0,
  Subscriptions: 1200,
  Healthcare: 2000,
  Education: 1500,
  Other: 1500,
};

const DEFAULT_THRESHOLDS = {
  one: 50,
  two: 75,
  three: 90,
};

const CURRENT_USER = "You";
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

// --- APPLICATION STATE ---
let transactions = [];
let budgets = {};
let thresholds = { ...DEFAULT_THRESHOLDS };
let splitPeople = [];
let splitExpenses = [];
let gamification = {
  xp: 85,
  level: 1,
  streakDays: 4,
  lastStreakCheck: null,
  claimedQuests: {},
  dismissedQuests: {},
  unlockedBadges: ["first-step", "streak-master"],
};
let chatHistory = [];
let spendingChartInstance = null;
let currentSpendingChartType = "doughnut";
let cashflowChartInstance = null;
let velocityChartInstance = null;
let budgetChartInstance = null;
let forecastChartInstance = null;

// --- UTILITY SELECTORS & HELPERS ---
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const dateKey = (date = new Date()) => date.toISOString().slice(0, 10);
const localDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return dateKey(d);
};
const currentMonth = () => dateKey().slice(0, 7);
const previousMonth = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return dateKey(d).slice(0, 7);
};
const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};
const escapeHtml = (value) => {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML;
};
const total = (items = []) => items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

// --- SAMPLE DATA GENERATORS FOR DEMO SCENARIOS ---
function createStandardDemoTransactions() {
  return [
    { id: crypto.randomUUID(), name: "Monthly Salary Credit", amount: 65000, category: "Other", date: localDate(20), type: "income", note: "Primary tech salary" },
    { id: crypto.randomUUID(), name: "Freelance Design Gig", amount: 12000, category: "Other", date: localDate(6), type: "income", note: "Side contract" },
    { id: crypto.randomUUID(), name: "BigBasket Supermarket", amount: 2450, category: "Grocery", date: localDate(1), type: "expense", note: "Monthly essentials" },
    { id: crypto.randomUUID(), name: "Swiggy Gourmet Dinner", amount: 680, category: "Food & Dining", date: localDate(2), type: "expense", note: "Weekend meal" },
    { id: crypto.randomUUID(), name: "Netflix Premium 4K", amount: 649, category: "Entertainment", date: localDate(4), type: "expense", note: "Auto-debit" },
    { id: crypto.randomUUID(), name: "Uber Ride to HSR", amount: 340, category: "Travel & Fuel", date: localDate(5), type: "expense", note: "Commute" },
    { id: crypto.randomUUID(), name: "Electricity & BESCOM", amount: 1420, category: "Bills", date: localDate(8), type: "expense", note: "Home utility" },
    { id: crypto.randomUUID(), name: "Zomato Quick Lunch", amount: 320, category: "Food & Dining", date: localDate(9), type: "expense", note: "Work lunch" },
    { id: crypto.randomUUID(), name: "Amazon Essentials", amount: 1850, category: "Shopping", date: localDate(11), type: "expense", note: "Home items" },
    { id: crypto.randomUUID(), name: "Spotify Individual Plan", amount: 119, category: "Subscriptions", date: localDate(14), type: "expense", note: "Music streaming" },
    { id: crypto.randomUUID(), name: "Blinkit Quick Delivery", amount: 480, category: "Grocery", date: localDate(15), type: "expense", note: "Snacks & fruits" },
    { id: crypto.randomUUID(), name: "Fuel & Petrol Station", amount: 1200, category: "Travel & Fuel", date: localDate(18), type: "expense", note: "Vehicle refuel" },
    { id: crypto.randomUUID(), name: "Pharmacy & Vitamins", amount: 550, category: "Healthcare", date: localDate(21), type: "expense", note: "Supplements" },
    { id: crypto.randomUUID(), name: "Swiggy Cafe Coffee & Snack", amount: 240, category: "Food & Dining", date: localDate(22), type: "expense", note: "Late evening coffee" },
  ];
}

function createHighSpenderDemoTransactions() {
  return [
    { id: crypto.randomUUID(), name: "Consulting Fee", amount: 48000, category: "Other", date: localDate(22), type: "income", note: "Client payment" },
    { id: crypto.randomUUID(), name: "Swiggy Dinner Feast", amount: 1850, category: "Food & Dining", date: localDate(1), type: "expense", note: "Group order" },
    { id: crypto.randomUUID(), name: "Zomato Late Night Burgers", amount: 1240, category: "Food & Dining", date: localDate(2), type: "expense", note: "Midnight cravings" },
    { id: crypto.randomUUID(), name: "Fine Dining Weekend", amount: 3400, category: "Food & Dining", date: localDate(3), type: "expense", note: "Dining out" },
    { id: crypto.randomUUID(), name: "Blinkit Groceries", amount: 3200, category: "Grocery", date: localDate(4), type: "expense", note: "Instant pantry" },
    { id: crypto.randomUUID(), name: "Zara Clothes Haul", amount: 4990, category: "Shopping", date: localDate(6), type: "expense", note: "Wardrobe renewal" },
    { id: crypto.randomUUID(), name: "Flight Tickets to Goa", amount: 8400, category: "Travel & Fuel", date: localDate(8), type: "expense", note: "Vacation booking" },
    { id: crypto.randomUUID(), name: "Uber Premier", amount: 890, category: "Travel & Fuel", date: localDate(9), type: "expense", note: "Airport drop" },
    { id: crypto.randomUUID(), name: "PVR IMAX Tickets", amount: 1600, category: "Entertainment", date: localDate(11), type: "expense", note: "Weekend blockbuster" },
    { id: crypto.randomUUID(), name: "Swiggy Lunch Bowls", amount: 560, category: "Food & Dining", date: localDate(13), type: "expense", note: "Office order" },
  ];
}

// --- INITIALIZATION & PERSISTENCE ---
function initialiseData() {
  const savedTransactions = localStorage.getItem("pennywise-transactions");
  const savedBudgets = localStorage.getItem("pennywise-budgets");
  const savedThresholds = localStorage.getItem("pennywise-thresholds");
  const savedSplitPeople = localStorage.getItem("pennywise-split-people");
  const savedSplitExpenses = localStorage.getItem("pennywise-split-expenses");
  const savedGamification = localStorage.getItem("pennywise-gamification");
  const savedChat = localStorage.getItem("pennywise-chat-history");

  transactions = savedTransactions ? JSON.parse(savedTransactions) : createStandardDemoTransactions();
  budgets = savedBudgets ? JSON.parse(savedBudgets) : { ...DEFAULT_BUDGETS };
  thresholds = savedThresholds ? JSON.parse(savedThresholds) : { ...DEFAULT_THRESHOLDS };
  splitPeople = savedSplitPeople ? JSON.parse(savedSplitPeople) : [CURRENT_USER, "Aarav", "Priya"];
  splitExpenses = savedSplitExpenses ? JSON.parse(savedSplitExpenses) : [
    { id: crypto.randomUUID(), name: "Weekend Airbnb Trip", amount: 6000, paidBy: CURRENT_USER, participants: [CURRENT_USER, "Aarav", "Priya"], createdAt: localDate(3) },
    { id: crypto.randomUUID(), name: "Group Cafe Brunch", amount: 1800, paidBy: "Aarav", participants: [CURRENT_USER, "Aarav", "Priya"], createdAt: localDate(2) },
  ];
  if (!splitPeople.includes(CURRENT_USER)) splitPeople.unshift(CURRENT_USER);

  if (savedGamification) {
    gamification = { ...gamification, ...JSON.parse(savedGamification) };
  }
  if (savedChat) {
    chatHistory = JSON.parse(savedChat);
  } else {
    chatHistory = [
      {
        sender: "assistant",
        text: "Hello! I'm **PennyWise AI**, your personal finance copilot. I analyze your actual transactions, budgets, and cash flow to help you make smarter financial decisions.\n\nTry asking me **'Where did my money go?'**, **'Can I afford ₹3,000?'**, or **'How much can I safely spend this weekend?'**",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  }

  persist();
}

function persist() {
  localStorage.setItem("pennywise-transactions", JSON.stringify(transactions));
  localStorage.setItem("pennywise-budgets", JSON.stringify(budgets));
  localStorage.setItem("pennywise-thresholds", JSON.stringify(thresholds));
  localStorage.setItem("pennywise-split-people", JSON.stringify(splitPeople));
  localStorage.setItem("pennywise-split-expenses", JSON.stringify(splitExpenses));
  localStorage.setItem("pennywise-gamification", JSON.stringify(gamification));
  localStorage.setItem("pennywise-chat-history", JSON.stringify(chatHistory));
}

// --- DATA FILTERING & METRICS ENGINE ---
function monthlyTransactions(monthKey = currentMonth()) {
  return transactions.filter((item) => item.date.startsWith(monthKey));
}

function monthlyExpenses(monthKey = currentMonth()) {
  return monthlyTransactions(monthKey).filter((item) => item.type === "expense");
}

function monthlyIncome(monthKey = currentMonth()) {
  return monthlyTransactions(monthKey).filter((item) => item.type === "income");
}

function allIncome() {
  return transactions.filter((item) => item.type === "income");
}

function allExpenses() {
  return transactions.filter((item) => item.type === "expense");
}

function byCategory(items = monthlyExpenses()) {
  return items.reduce((totals, item) => {
    totals[item.category] = (totals[item.category] || 0) + Number(item.amount);
    return totals;
  }, {});
}

function metadata(category) {
  return CATEGORIES[category] || CATEGORIES.Other;
}

function categoryIcon(category) {
  const meta = metadata(category);
  return `<span class="transaction-category-icon" style="--icon-bg:${meta.bg};--icon-color:${meta.color}">${meta.icon}</span>`;
}

// Calculates financial vital signs
function calculateFinancialVitals() {
  const expenseList = monthlyExpenses();
  const incomeList = monthlyIncome();
  const expenseTotal = total(expenseList);
  const incomeTotal = total(incomeList);
  const balance = total(allIncome()) - total(allExpenses());

  const currentDay = Math.max(new Date().getDate(), 1);
  const daysInCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const remainingDays = Math.max(daysInCurrentMonth - currentDay, 1);

  const dailyBurn = expenseTotal > 0 ? expenseTotal / currentDay : 0;
  const runwayDays = dailyBurn > 0 && balance > 0 ? Math.floor(balance / dailyBurn) : (balance <= 0 ? 0 : 999);

  const categoryTotals = byCategory(expenseList);
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const [topCategory = "None", topAmount = 0] = sortedCategories[0] || [];

  // Previous month comparison
  const prevExpenses = monthlyExpenses(previousMonth());
  const prevTotal = total(prevExpenses);
  const spendingDiff = expenseTotal - prevTotal;

  // Discretionary calculation (Food, Shopping, Entertainment)
  const discretionaryTotal = (categoryTotals["Food & Dining"] || 0) + (categoryTotals["Shopping"] || 0) + (categoryTotals["Entertainment"] || 0);
  const remainingDiscretionary = Math.max(0, balance - (expenseTotal * 0.4)); // reserves for committed expenses
  const weekendSafeSpend = Math.max(0, Math.round((remainingDiscretionary / remainingDays) * 2));

  return {
    balance,
    expenseTotal,
    incomeTotal,
    dailyBurn: Math.round(dailyBurn),
    runwayDays,
    remainingDays,
    daysInCurrentMonth,
    categoryTotals,
    sortedCategories,
    topCategory,
    topAmount,
    prevTotal,
    spendingDiff,
    discretionaryTotal,
    weekendSafeSpend,
  };
}

// --- RENDER DASHBOARD & OVERVIEW ---
function renderOverview() {
  const vitals = calculateFinancialVitals();

  // Balance Card
  $("#balance-value").textContent = money.format(vitals.balance);
  if (vitals.balance > 0) {
    $("#balance-note").textContent = "Positive net cash reserve.";
    $("#balance-note").className = "positive";
  } else if (vitals.balance < 0) {
    $("#balance-note").textContent = "Net deficit: spending exceeds recorded income.";
    $("#balance-note").className = "negative";
  } else {
    $("#balance-note").textContent = "Zero balance recorded.";
    $("#balance-note").className = "";
  }

  // Income Card
  $("#income-value").textContent = money.format(vitals.incomeTotal);
  $("#income-note").textContent = vitals.incomeTotal > 0
    ? `${monthlyIncome().length} income stream${monthlyIncome().length > 1 ? "s" : ""} recorded.`
    : "No income recorded this month yet.";

  // Spent Card
  $("#spent-value").textContent = money.format(vitals.expenseTotal);
  $("#spent-note").textContent = vitals.expenseTotal > 0
    ? `Avg ${money.format(vitals.dailyBurn)}/day across ${monthlyExpenses().length} expense${monthlyExpenses().length > 1 ? "s" : ""}.`
    : "Zero spending recorded this month.";

  // Runway Card
  if (vitals.runwayDays === 999) {
    $("#runway-value").textContent = "∞ Days";
    $("#runway-note").textContent = "No expenses recorded to calculate burn.";
  } else if (vitals.runwayDays === 0) {
    $("#runway-value").textContent = "0 Days";
    $("#runway-note").textContent = "Reserve is depleted; expenses exceed income.";
  } else {
    $("#runway-value").textContent = `${vitals.runwayDays} Days`;
    $("#runway-note").textContent = `At ₹${vitals.dailyBurn}/day before cash reaches zero.`;
  }

  // Hero greeting dynamic update
  if (vitals.runwayDays < 15 && vitals.runwayDays > 0) {
    $("#hero-greeting").textContent = "Tight runway detected.";
    $("#hero-summary").textContent = `At your current pace of ${money.format(vitals.dailyBurn)}/day, your reserves last ${vitals.runwayDays} days. Consider pausing discretionary purchases.`;
  } else if (vitals.balance > 25000) {
    $("#hero-greeting").textContent = "Solid cash buffer.";
    $("#hero-summary").textContent = `Your finances are stable with ${vitals.runwayDays > 100 ? "ample" : vitals.runwayDays + " days of"} runway. Good time to allocate toward your savings targets.`;
  } else {
    $("#hero-greeting").textContent = "Financial command center active.";
    $("#hero-summary").textContent = "PennyWise is reading your recorded activity to surface the next useful move.";
  }

  // Spending Pie / Doughnut Chart
  renderSpendingChart(vitals.categoryTotals, vitals.expenseTotal, currentSpendingChartType);

  // Visual Cash Flow Bar & Velocity Line Charts
  renderCashFlowChart(vitals);
  renderVelocityChart(vitals);

  // AI Money Detective brief
  renderIntelligenceBrief(vitals);

  // Guardian Alerts & Boss Battle Preview
  renderDashboardGuardianAlerts(vitals);
  renderDashboardChallengeWidget();

  // Recent Transactions
  renderRecentTransactions();

  // Assistant Scope Panel
  renderDataScope(vitals);

  // Luminous Sparklines
  renderSparklines(vitals);
}

// --- LUMINOUS SVG SPARKLINES ---
function generateSparklineSVG(points, color, height = 26, width = 140) {
  if (!points || points.length < 2) {
    points = [10, 14, 12, 17, 15, 20, 19];
  }
  const min = Math.min(...points);
  const max = Math.max(...points) || 1;
  const range = max - min || 1;
  const step = width / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = Math.round(i * step);
    const y = Math.round(height - ((p - min) / range) * (height - 6) - 3);
    return `${x},${y}`;
  });

  const pathD = `M ${coords.join(" L ")}`;
  const areaD = `M 0,${height} L ${coords.join(" L ")} L ${width},${height} Z`;

  return `
    <svg class="sparkline-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <path class="spark-area" d="${areaD}" fill="${color}" />
      <path d="${pathD}" stroke="${color}" />
    </svg>`;
}

function renderSparklines(vitals) {
  const bEl = $("#sparkline-balance");
  if (!bEl) return;

  const bPts = [
    Math.round(vitals.balance * 0.94),
    Math.round(vitals.balance * 0.96),
    Math.round(vitals.balance * 0.95),
    Math.round(vitals.balance * 0.98),
    Math.round(vitals.balance * 0.97),
    Math.round(vitals.balance * 0.99),
    vitals.balance,
  ];
  bEl.innerHTML = generateSparklineSVG(bPts, "var(--electric-green)");

  const iPts = [0, 0, Math.round(vitals.incomeTotal * 0.4), Math.round(vitals.incomeTotal * 0.5), Math.round(vitals.incomeTotal * 0.8), vitals.incomeTotal];
  $("#sparkline-income").innerHTML = generateSparklineSVG(iPts, "var(--beige-gold)");

  const ePts = [
    Math.round(vitals.expenseTotal * 0.15),
    Math.round(vitals.expenseTotal * 0.3),
    Math.round(vitals.expenseTotal * 0.45),
    Math.round(vitals.expenseTotal * 0.6),
    Math.round(vitals.expenseTotal * 0.8),
    Math.round(vitals.expenseTotal * 0.92),
    vitals.expenseTotal,
  ];
  $("#sparkline-spent").innerHTML = generateSparklineSVG(ePts, "var(--rose-danger)");

  const rPts = [
    vitals.runwayDays + 6,
    vitals.runwayDays + 5,
    vitals.runwayDays + 4,
    vitals.runwayDays + 2,
    vitals.runwayDays + 1,
    vitals.runwayDays,
  ];
  $("#sparkline-runway").innerHTML = generateSparklineSVG(rPts, "var(--sage-green)");
}

// --- VISUAL PIE & DOUGHNUT SPENDING CHART ---
function renderSpendingChart(categoryTotals, totalSpent, chartType = currentSpendingChartType) {
  const canvas = $("#spending-chart");
  if (!canvas) return;
  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);
  const colors = labels.map((cat) => metadata(cat).color);

  $("#chart-total").textContent = `${money.format(totalSpent)} this month`;
  $("#chart-center-value").textContent = money.format(totalSpent);

  const centerEl = $("#spending-chart-center");
  if (centerEl) {
    centerEl.style.display = chartType === "pie" ? "none" : "block";
  }

  if (typeof Chart === "undefined") {
    $("#chart-legend").innerHTML = `<span class="legend-item">Chart.js library is loading...</span>`;
    return;
  }

  if (spendingChartInstance) {
    spendingChartInstance.destroy();
  }

  spendingChartInstance = new Chart(canvas, {
    type: chartType,
    data: {
      labels: labels.length ? labels : ["No spending"],
      datasets: [
        {
          data: values.length ? values : [1],
          backgroundColor: values.length ? colors : ["#E5E7EB"],
          borderColor: "#FFFFFF",
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      cutout: chartType === "pie" ? 0 : "72%",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#FFFFFF",
          titleColor: "#24292F",
          bodyColor: "#57606A",
          borderColor: "#EAE4DA",
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
          usePointStyle: true,
          callbacks: {
            label: (ctx) => (values.length ? ` ${ctx.label}: ${money.format(ctx.raw)} (${Math.round((ctx.raw / totalSpent) * 100)}%)` : " No expenses"),
          },
        },
      },
    },
  });

  $("#chart-legend").innerHTML = labels.length
    ? labels
        .map(
          (label) => `
          <span class="legend-item">
            <i class="legend-dot" style="background:${metadata(label).color}"></i>
            ${label} <b style="color:var(--text-main); margin-left:3px;">${money.format(categoryTotals[label])}</b>
          </span>`
        )
        .join("")
    : `<span class="legend-item" style="color:var(--text-faint);">Add expenses to visualize category allocation.</span>`;
}

// --- VISUAL CASH FLOW BAR GRAPH (INCOME VS EXPENSE VS NET) ---
function renderCashFlowChart(vitals) {
  const canvas = $("#cashflow-bar-chart");
  if (!canvas || typeof Chart === "undefined") return;

  const netSavings = vitals.incomeTotal - vitals.expenseTotal;
  const netTag = $("#cashflow-net-tag");
  if (netTag) {
    netTag.textContent = `${netSavings >= 0 ? "+" : ""}${money.format(netSavings)} Net`;
    netTag.style.color = netSavings >= 0 ? "var(--electric-green)" : "var(--rose-danger)";
    netTag.style.background = netSavings >= 0 ? "var(--mint-soft)" : "var(--rose-soft)";
    netTag.style.borderColor = netSavings >= 0 ? "var(--mint-border)" : "var(--rose-border)";
  }

  if (cashflowChartInstance) {
    cashflowChartInstance.destroy();
  }

  cashflowChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Income", "Expenses", "Net Saved"],
      datasets: [
        {
          data: [vitals.incomeTotal, vitals.expenseTotal, Math.max(0, netSavings)],
          backgroundColor: [
            "#86EFAC", // Pastel Mint
            "#FDA4AF", // Pastel Coral
            "#C4B5FD", // Pastel Lilac
          ],
          borderColor: [
            "#4ADE80",
            "#FB7185",
            "#A78BFA",
          ],
          borderWidth: 1.5,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#FFFFFF",
          titleColor: "#24292F",
          bodyColor: "#57606A",
          borderColor: "#EAE4DA",
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${money.format(ctx.raw)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#57606A", font: { family: "Manrope", size: 12, weight: "600" } },
        },
        y: {
          grid: { color: "rgba(234, 228, 218, 0.6)" },
          ticks: {
            color: "#8C959F",
            font: { family: "Manrope", size: 11 },
            callback: (val) => "₹" + (val >= 1000 ? Math.round(val / 1000) + "k" : val),
          },
        },
      },
    },
  });
}

// --- VISUAL DAILY VELOCITY & TRAJECTORY LINE GRAPH ---
function renderVelocityChart(vitals) {
  const canvas = $("#velocity-line-chart");
  if (!canvas || typeof Chart === "undefined") return;

  const currentDay = Math.max(new Date().getDate(), 1);
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const rateTag = $("#velocity-rate-tag");
  if (rateTag) rateTag.textContent = `${money.format(vitals.dailyBurn)}/day`;

  const expenses = monthlyExpenses();
  const dailySpend = new Array(daysInMonth).fill(0);
  expenses.forEach((item) => {
    const day = Number(item.date.slice(8, 10));
    if (day >= 1 && day <= daysInMonth) {
      dailySpend[day - 1] += Number(item.amount);
    }
  });

  const labels = [];
  const actualCumulative = [];
  const targetTrajectory = [];
  let cum = 0;
  const budgetMonthly = total(Object.values(budgets)) || vitals.expenseTotal || 30000;
  const plannedDaily = budgetMonthly / daysInMonth;

  for (let d = 1; d <= daysInMonth; d++) {
    labels.push(`${d}d`);
    if (d <= currentDay) {
      cum += dailySpend[d - 1];
      actualCumulative.push(cum);
    } else {
      actualCumulative.push(null);
    }
    targetTrajectory.push(Math.round(plannedDaily * d));
  }

  if (velocityChartInstance) {
    velocityChartInstance.destroy();
  }

  velocityChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Actual Spend",
          data: actualCumulative,
          borderColor: "#38BDF8", // Pastel Sky Blue
          backgroundColor: "rgba(56, 189, 248, 0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 2,
          pointHoverRadius: 5,
          borderWidth: 2.5,
        },
        {
          label: "Planned Pace",
          data: targetTrajectory,
          borderColor: "#FBBF24", // Pastel Amber/Butter
          borderDash: [5, 4],
          pointRadius: 0,
          borderWidth: 1.5,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#FFFFFF",
          titleColor: "#24292F",
          bodyColor: "#57606A",
          borderColor: "#EAE4DA",
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${money.format(ctx.raw || 0)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#8C959F",
            font: { size: 10 },
            maxTicksLimit: 10,
          },
        },
        y: {
          grid: { color: "rgba(234, 228, 218, 0.6)" },
          ticks: {
            color: "#8C959F",
            font: { size: 10 },
            callback: (val) => "₹" + (val >= 1000 ? Math.round(val / 1000) + "k" : val),
          },
        },
      },
    },
  });
}

// --- VISUAL CATEGORY BUDGET VS ACTUAL COMPARISON GRAPH ---
function renderBudgetBarsChart(vitals, currentBudgets) {
  const canvas = $("#budget-bars-chart");
  if (!canvas || typeof Chart === "undefined") return;

  const categories = Object.keys(CATEGORIES).filter((c) => c !== "Other");
  const budgetValues = categories.map((c) => currentBudgets[c] || 0);
  const actualValues = categories.map((c) => vitals.categoryTotals[c] || 0);

  if (budgetChartInstance) {
    budgetChartInstance.destroy();
  }

  budgetChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: categories,
      datasets: [
        {
          label: "Budget Limit",
          data: budgetValues,
          backgroundColor: "rgba(134, 239, 172, 0.55)", // Pastel Mint
          borderColor: "#4ADE80",
          borderWidth: 1.5,
          borderRadius: 6,
        },
        {
          label: "Actual Spent",
          data: actualValues,
          backgroundColor: "rgba(253, 164, 175, 0.7)", // Pastel Coral
          borderColor: "#FB7185",
          borderWidth: 1.5,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#FFFFFF",
          titleColor: "#24292F",
          bodyColor: "#57606A",
          borderColor: "#EAE4DA",
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${money.format(ctx.raw)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#57606A",
            font: { size: 11, weight: "600" },
            maxRotation: 45,
            minRotation: 20,
          },
        },
        y: {
          grid: { color: "rgba(234, 228, 218, 0.6)" },
          ticks: {
            color: "#8C959F",
            font: { size: 10 },
            callback: (val) => "₹" + (val >= 1000 ? Math.round(val / 1000) + "k" : val),
          },
        },
      },
    },
  });
}

// --- AI MONEY DETECTIVE BRIEF ---
function renderIntelligenceBrief(vitals) {
  const cards = [];

  // Insight 1: Top Category
  if (vitals.topAmount > 0) {
    const share = Math.round((vitals.topAmount / vitals.expenseTotal) * 100);
    cards.push({
      icon: "✦",
      title: `${vitals.topCategory} is your biggest drain`,
      text: `Accounts for ${share}% of this month's spending (${money.format(vitals.topAmount)}). Trimming this category yields the highest financial leverage.`,
      type: share > 40 ? "urgent" : "",
    });
  } else {
    cards.push({
      icon: "✦",
      title: "Clean Slate",
      text: "No expenses recorded this month yet. Add transactions to generate dynamic spending intelligence.",
      type: "positive",
    });
  }

  // Insight 2: Budget Pace Risk
  const overBudget = Object.entries(budgets).filter(([cat, cap]) => cap > 0 && (vitals.categoryTotals[cat] || 0) > cap);
  const nearBudget = Object.entries(budgets).filter(
    ([cat, cap]) => cap > 0 && (vitals.categoryTotals[cat] || 0) >= cap * 0.8 && (vitals.categoryTotals[cat] || 0) <= cap
  );

  if (overBudget.length) {
    cards.push({
      icon: "⚠️",
      title: `Exceeded budget in ${overBudget.map(([c]) => c).join(", ")}`,
      text: `You have crossed your planned limits. Consider freezing non-essential spending here until next month.`,
      type: "urgent",
    });
  } else if (nearBudget.length) {
    cards.push({
      icon: "◴",
      title: `Approaching limit in ${nearBudget.map(([c]) => c).join(", ")}`,
      text: `Currently operating above 80% of budget cap with ${vitals.remainingDays} days remaining in the month.`,
      type: "",
    });
  } else {
    cards.push({
      icon: "🛡️",
      title: "Budgets Protected",
      text: "All tracked categories are currently operating safely under their respective threshold limits.",
      type: "positive",
    });
  }

  // Insight 3: Weekend or Safe Spend Opportunity
  if (vitals.weekendSafeSpend > 0) {
    cards.push({
      icon: "⚡",
      title: `Safe Weekend Spend: ${money.format(vitals.weekendSafeSpend)}`,
      text: `Calculated from your unallocated surplus. Spending within this bound protects your 30-day runway.`,
      type: "positive",
    });
  }

  $("#intelligence-brief").innerHTML = cards
    .map(
      (card) => `
      <div class="brief-card ${card.type}">
        <span class="brief-icon">${card.icon}</span>
        <div class="brief-content">
          <h4>${card.title}</h4>
          <p>${card.text}</p>
        </div>
      </div>`
    )
    .join("");
}

// --- GUARDIAN ALERTS ON DASHBOARD ---
function renderDashboardGuardianAlerts(vitals) {
  const alerts = [];
  const container = $("#dashboard-guardian-alerts");

  Object.entries(budgets).forEach(([category, limit]) => {
    if (limit <= 0) return;
    const spent = vitals.categoryTotals[category] || 0;
    const pct = Math.round((spent / limit) * 100);

    if (pct >= 100) {
      alerts.push({
        category,
        status: `Over by ${money.format(spent - limit)}`,
        note: `${pct}% of ${money.format(limit)} limit spent`,
        className: "alert-danger",
      });
    } else if (pct >= thresholds.three) {
      alerts.push({
        category,
        status: `Critical alert (${pct}%)`,
        note: `Only ${money.format(limit - spent)} remaining`,
        className: "alert-danger",
      });
    } else if (pct >= thresholds.two) {
      alerts.push({
        category,
        status: `Caution milestone (${pct}%)`,
        note: `${money.format(limit - spent)} room left`,
        className: "alert-warning",
      });
    }
  });

  if (alerts.length) {
    container.innerHTML = alerts
      .slice(0, 3)
      .map(
        (a) => `
        <div class="alert-item ${a.className}">
          <div class="alert-meta">
            <strong>${escapeHtml(a.category)}</strong>
            <span>${a.note}</span>
          </div>
          <span style="font-family:'DM Mono',monospace; font-weight:700;">${a.status}</span>
        </div>`
      )
      .join("");
  } else {
    container.innerHTML = `
      <div class="alert-item alert-good">
        <div class="alert-meta">
          <strong>All Budgets On Track</strong>
          <span>No critical thresholds triggered this month.</span>
        </div>
        <span style="color:var(--electric-green);">✓ Safe</span>
      </div>`;
  }
}

// --- BOSS BATTLE DASHBOARD PREVIEW & VIEW ---
const QUEST_DEFINITIONS = [
  {
    id: "quest-food-trim",
    title: "Dining Defense",
    desc: "Keep Food & Dining spending under ₹1,500 over the next 7 days.",
    target: 1500,
    category: "Food & Dining",
    xp: 50,
  },
  {
    id: "quest-weekend-vault",
    title: "Weekend Vault",
    desc: "Limit total discretionary weekend spending to under ₹1,000.",
    target: 1000,
    xp: 60,
  },
  {
    id: "quest-grocery-discipline",
    title: "Pantry Master",
    desc: "Keep grocery purchases under ₹2,500 this week.",
    target: 2500,
    category: "Grocery",
    xp: 40,
  },
  {
    id: "quest-zero-leak",
    title: "Zero-Drain Shield",
    desc: "Avoid all impulse subscriptions and unbudgeted shopping.",
    target: 500,
    category: "Shopping",
    xp: 75,
  },
];

const BADGE_DEFINITIONS = [
  { id: "first-step", icon: "🎯", name: "First Entry", desc: "Recorded your first transaction." },
  { id: "shield-bearer", icon: "🛡️", name: "Shield Bearer", desc: "Configured 3 or more category budgets." },
  { id: "streak-master", icon: "🔥", name: "Streak Legend", desc: "Maintained a 4-day under-budget streak." },
  { id: "autopsy-explorer", icon: "🔍", name: "Forensic Analyst", desc: "Generated a private spending autopsy." },
  { id: "10k-club", icon: "💰", name: "10K Reserve", desc: "Maintained net cash reserves above ₹10,000." },
  { id: "boss-slayer", icon: "⚔️", name: "Boss Slayer", desc: "Completed 3 or more financial quests." },
];

function calculateLevel(xp) {
  if (xp >= 1500) return { level: 5, rank: "Financial Grandmaster", maxXP: 2500 };
  if (xp >= 900) return { level: 4, rank: "Wealth Guardian", maxXP: 1500 };
  if (xp >= 500) return { level: 3, rank: "Cashflow Tactician", maxXP: 900 };
  if (xp >= 200) return { level: 2, rank: "Budget Sentinel", maxXP: 500 };
  return { level: 1, rank: "Penny Scout", maxXP: 200 };
}

function renderDashboardChallengeWidget() {
  const levelInfo = calculateLevel(gamification.xp);
  $("#challenge-badge").textContent = `LVL 0${levelInfo.level}`;

  // Find active quest
  const activeQuest = QUEST_DEFINITIONS.find((q) => !gamification.claimedQuests[q.id] && !gamification.dismissedQuests[q.id]) || QUEST_DEFINITIONS[0];
  $("#challenge-title").textContent = activeQuest.title;
  $("#challenge-description").textContent = activeQuest.desc;

  // Calculate progress
  const vitals = calculateFinancialVitals();
  const spent = activeQuest.category ? vitals.categoryTotals[activeQuest.category] || 0 : vitals.expenseTotal;
  const progressPct = Math.min(100, Math.round((spent / activeQuest.target) * 100));

  $("#challenge-progress").style.width = `${progressPct}%`;
  $("#challenge-progress-label").textContent = `${money.format(spent)} of ${money.format(activeQuest.target)} ceiling (${activeQuest.xp} XP reward)`;
}

function renderBossBattlesView() {
  const levelInfo = calculateLevel(gamification.xp);
  $("#battle-level-ring").textContent = `0${levelInfo.level}`;
  $("#battle-rank-title").textContent = `Level ${levelInfo.level}: ${levelInfo.rank}`;
  $("#battle-xp-display").textContent = `${gamification.xp} / ${levelInfo.maxXP} XP to next rank`;

  const progressPct = Math.min(100, Math.round((gamification.xp / levelInfo.maxXP) * 100));
  $("#battle-xp-bar").style.width = `${progressPct}%`;
  $("#battle-streak-count").textContent = `${gamification.streakDays} Days`;

  // Render Quests
  const vitals = calculateFinancialVitals();
  const container = $("#quests-container");

  container.innerHTML = QUEST_DEFINITIONS.map((quest) => {
    const isClaimed = gamification.claimedQuests[quest.id];
    const isDismissed = gamification.dismissedQuests[quest.id];
    if (isDismissed) return "";

    const spent = quest.category ? vitals.categoryTotals[quest.category] || 0 : vitals.discretionaryTotal;
    const progress = Math.min(100, Math.round((spent / quest.target) * 100));
    const isSuccess = spent <= quest.target;

    return `
      <div class="quest-card">
        <div class="quest-top">
          <div>
            <h3>${quest.title} ${isClaimed ? '<span style="color:var(--electric-green); font-size:12px;">✓ Completed</span>' : ""}</h3>
            <p>${quest.desc}</p>
          </div>
          <span class="quest-reward">+${quest.xp} XP</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${progress >= 90 ? "danger-fill" : "neon-fill"}" style="width:${progress}%"></div>
        </div>
        <div class="quest-actions">
          <span style="font-family:'DM Mono',monospace; font-size:11px; color:var(--text-muted);">
            Current: ${money.format(spent)} / ${money.format(quest.target)}
          </span>
          <div>
            ${
              isClaimed
                ? `<span style="font-size:11.5px; color:var(--electric-green); font-weight:700;">XP Awarded</span>`
                : `<button class="claim-xp-btn" data-claim-quest="${quest.id}" type="button">Claim +${quest.xp} XP</button>
                   <button class="dismiss-quest-btn" data-dismiss-quest="${quest.id}" type="button" style="margin-left:8px;">Dismiss</button>`
            }
          </div>
        </div>
      </div>`;
  }).join("");

  // Render Badges
  // Unlock dynamic badges based on state
  if (transactions.length > 0 && !gamification.unlockedBadges.includes("first-step")) {
    gamification.unlockedBadges.push("first-step");
  }
  const budgetCount = Object.values(budgets).filter((b) => b > 0).length;
  if (budgetCount >= 3 && !gamification.unlockedBadges.includes("shield-bearer")) {
    gamification.unlockedBadges.push("shield-bearer");
  }
  if (vitals.balance >= 10000 && !gamification.unlockedBadges.includes("10k-club")) {
    gamification.unlockedBadges.push("10k-club");
  }
  persist();

  $("#badges-container").innerHTML = BADGE_DEFINITIONS.map((badge) => {
    const isUnlocked = gamification.unlockedBadges.includes(badge.id);
    return `
      <div class="badge-item ${isUnlocked ? "unlocked" : ""}">
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-meta">
          <strong>${badge.name}</strong>
          <span>${isUnlocked ? "Unlocked ✓" : badge.desc}</span>
        </div>
      </div>`;
  }).join("");
}

// --- RECENT TRANSACTIONS ---
function renderRecentTransactions() {
  const latest = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  $("#recent-transactions").innerHTML = latest.length
    ? latest
        .map(
          (item) => `
        <div class="transaction-row">
          ${categoryIcon(item.category)}
          <div class="transaction-main">
            <p class="transaction-name">${escapeHtml(item.name)}</p>
            <p class="transaction-meta">${item.type === "income" ? "Income" : item.category} · ${formatDate(item.date)}</p>
          </div>
          <strong class="transaction-amount ${item.type === "income" ? "income" : ""}">${item.type === "income" ? "+" : "−"}${money.format(item.amount)}</strong>
        </div>`
        )
        .join("")
    : `<p class="empty-state">No recent transactions recorded yet.</p>`;
}

// --- CONVERSATIONAL PENNYWISE AI ASSISTANT ---
function renderChatMessages() {
  const container = $("#chat-messages");
  container.innerHTML = chatHistory
    .map((msg) => {
      const isUser = msg.sender === "user";
      return `
      <div class="chat-bubble ${isUser ? "user" : "assistant"}">
        <div class="bubble-avatar">${isUser ? "👤" : "✦"}</div>
        <div class="bubble-body">${renderMarkdown(msg.text)}</div>
      </div>`;
    })
    .join("");
  container.scrollTop = container.scrollHeight;
}

// Minimal markdown formatter for clean assistant typography
function renderMarkdown(text) {
  let html = escapeHtml(text);
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Bullet lists
  html = html.replace(/^[*-] (.*$)/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/gms, "<ul>$1</ul>");
  // Code / stats
  html = html.replace(/`([^`]+)`/g, '<span class="stat-highlight">$1</span>');
  // Newlines to breaks
  html = html.replace(/\n\n/g, "<p></p>");
  html = html.replace(/\n/g, "<br />");
  return html;
}

function renderDataScope(vitals) {
  $("#ai-data-scope").innerHTML = `
    <div class="scope-item">
      <span>Total Transactions</span>
      <strong>${transactions.length}</strong>
    </div>
    <div class="scope-item">
      <span>Current Month Volume</span>
      <strong>${money.format(vitals.expenseTotal + vitals.incomeTotal)}</strong>
    </div>
    <div class="scope-item">
      <span>Tracked Categories</span>
      <strong>${Object.keys(vitals.categoryTotals).length} active</strong>
    </div>
    <div class="scope-item">
      <span>Active Month</span>
      <strong>${currentMonth()}</strong>
    </div>`;
}

// Deterministic Financial Intelligence Query Solver
function solveFinancialQueryLocally(query) {
  const vitals = calculateFinancialVitals();
  const q = query.toLowerCase().trim();

  // Query 1: Where did most of my money go?
  if (q.includes("where") && (q.includes("money") || q.includes("go") || q.includes("spent"))) {
    if (vitals.expenseTotal === 0) {
      return "You have recorded **₹0 expenses** this month. As soon as you add transactions, I will map your capital allocations!";
    }
    const topItems = monthlyExpenses()
      .filter((e) => e.category === vitals.topCategory)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
    const topItemsText = topItems.map((i) => `* **${escapeHtml(i.name)}**: ${money.format(i.amount)} (${formatDate(i.date)})`).join("\n");
    const share = Math.round((vitals.topAmount / vitals.expenseTotal) * 100);

    return `Here is your spending breakdown for **${currentMonth()}**:\n\n` +
      `* Total Recorded Spending: **${money.format(vitals.expenseTotal)}**\n` +
      `* Top Outflow Category: **${vitals.topCategory}** at **${money.format(vitals.topAmount)}** (${share}% of your total spending).\n\n` +
      `Top purchases in ${vitals.topCategory}:\n${topItemsText}\n\n` +
      `💡 **Recommendation**: Trimming 15% from ${vitals.topCategory} would preserve **${money.format(vitals.topAmount * 0.15)}** this month.`;
  }

  // Query 2: Why am I spending more than last month?
  if (q.includes("why") && (q.includes("spending more") || q.includes("last month") || q.includes("more than"))) {
    const prevExpenses = monthlyExpenses(previousMonth());
    const prevTotal = total(prevExpenses);
    const diff = vitals.expenseTotal - prevTotal;

    if (prevTotal === 0) {
      return `I don't see any recorded transactions for last month (**${previousMonth()}**) in your browser storage. ` +
        `This month's current spend is **${money.format(vitals.expenseTotal)}** across **${monthlyExpenses().length} transactions**. ` +
        `Continue logging expenses and I will automatically monitor period-over-period variance.`;
    }

    if (diff > 0) {
      // Find category with biggest leap
      const prevCategoryTotals = byCategory(prevExpenses);
      let biggestJumpCategory = "None";
      let biggestJumpAmount = 0;

      Object.entries(vitals.categoryTotals).forEach(([cat, amt]) => {
        const prevAmt = prevCategoryTotals[cat] || 0;
        const jump = amt - prevAmt;
        if (jump > biggestJumpAmount) {
          biggestJumpAmount = jump;
          biggestJumpCategory = cat;
        }
      });

      return `You have spent **${money.format(diff)} more** this month than last month (${money.format(vitals.expenseTotal)} vs ${money.format(prevTotal)}).\n\n` +
        `🔍 **Root Cause Identified**: The surge is predominantly driven by **${biggestJumpCategory}**, which increased by **${money.format(biggestJumpAmount)}**.\n\n` +
        `💡 To re-align your burn rate, consider placing a strict temporary cap on ${biggestJumpCategory}.`;
    } else {
      return `Good news! You have actually spent **${money.format(Math.abs(diff))} less** this month compared to last month ` +
        `(${money.format(vitals.expenseTotal)} vs ${money.format(prevTotal)}). Your financial discipline is paying off!`;
    }
  }

  // Query 3: How much can I safely spend this weekend?
  if (q.includes("weekend") || (q.includes("safely") && q.includes("spend"))) {
    const safeAmount = vitals.weekendSafeSpend;
    return `Based on your available balance of **${money.format(vitals.balance)}**, current daily burn rate (**${money.format(vitals.dailyBurn)}/day**), and **${vitals.remainingDays} days** left in the month:\n\n` +
      `🛡️ **Safe Weekend Budget**: **${money.format(safeAmount)}**\n\n` +
      `* This calculation reserves funds for your upcoming bills and protects your 30-day runway.\n` +
      `* Spending beyond ${money.format(safeAmount * 1.3)} will shorten your runway by approximately 3 days.`;
  }

  // Query 4: Can I afford something worth ₹X?
  const affordMatch = q.match(/afford.*?(\d[\d,]*)/) || q.match(/(\d[\d,]*).*?afford/);
  if (affordMatch) {
    const numStr = affordMatch[1].replace(/,/g, "");
    const amount = Number(numStr) || 0;
    const remainingBalance = vitals.balance - amount;
    const currentRunway = vitals.runwayDays;
    const newRunway = vitals.dailyBurn > 0 && remainingBalance > 0 ? Math.floor(remainingBalance / vitals.dailyBurn) : 0;
    const runwayLoss = Math.max(0, currentRunway - newRunway);

    if (amount > vitals.balance) {
      return `❌ **Verdict: Not Recommended**\n\nSpending **${money.format(amount)}** exceeds your current liquid balance (**${money.format(vitals.balance)}**) and will cause a deficit of **${money.format(Math.abs(remainingBalance))}**.`;
    } else if (remainingBalance < vitals.dailyBurn * 7) {
      return `⚠️ **Verdict: Caution Advised**\n\nSpending **${money.format(amount)}** leaves you with **${money.format(remainingBalance)}** (less than a 7-day reserve buffer at your current burn). If essential, proceed; otherwise, delay.`;
    } else {
      return `✅ **Verdict: Yes, you can afford ${money.format(amount)}**\n\n` +
        `* Balance after purchase: **${money.format(remainingBalance)}**\n` +
        `* Runway impact: Decreases by **${runwayLoss} days** (from ${currentRunway} to ${newRunway} days).\n` +
        `* Your remaining cash buffer remains healthy.`;
    }
  } else if (q.includes("can i afford") || q.includes("afford")) {
    return "Please specify the purchase amount you would like to test (e.g. **'Can I afford ₹4,500?'**), and I will calculate the exact impact on your balance and cash runway.";
  }

  // Query 4.5: Merchant search in recorded transactions (Zero-Hallucination)
  const allMonthly = monthlyTransactions();
  const matchedTx = allMonthly.filter((t) => q.includes(t.name.toLowerCase()) || (t.note && q.includes(t.note.toLowerCase())));
  if (matchedTx.length > 0) {
    const totalMatched = total(matchedTx);
    const txLines = matchedTx.map((t) => `* **${escapeHtml(t.name)}**: ${money.format(t.amount)} (${formatDate(t.date)} — ${t.category})`).join("\n");
    return `Found **${matchedTx.length} transaction${matchedTx.length > 1 ? "s" : ""}** in your records (Total: **${money.format(totalMatched)}**):\n\n${txLines}`;
  }

  // Query 5: Which category should I reduce?
  if (q.includes("which category") || q.includes("reduce") || q.includes("cut")) {
    if (vitals.sortedCategories.length === 0) {
      return "You haven't recorded any expenses yet! Add your usual expenses and I will pinpoint your top optimization targets.";
    }
    const [topCat, topVal] = vitals.sortedCategories[0];
    const [secondCat, secondVal] = vitals.sortedCategories[1] || ["None", 0];

    return `Target **${topCat}** first.\n\n` +
      `* It represents **${money.format(topVal)}** (${Math.round((topVal / vitals.expenseTotal) * 100)}% of your monthly outflows).\n` +
      (secondVal > 0 ? `* Your second highest category is **${secondCat}** (${money.format(secondVal)}).\n\n` : "\n") +
      `💡 **Actionable Target**: Reducing ${topCat} by just **20%** unlocks **${money.format(topVal * 0.2)}/month** in direct savings without sacrificing core necessities.`;
  }

  // Query 6: Predict my expenses for the next 30 days
  if (q.includes("predict") || q.includes("forecast") || q.includes("next 30 days") || q.includes("30 days")) {
    const projectedMonthly = Math.round(vitals.dailyBurn * 30);
    const projectedBalance = vitals.balance - projectedMonthly;

    return `🔮 **30-Day Expense Projection** (Estimate):\n\n` +
      `* Projected Outflow: **${money.format(projectedMonthly)}** (based on current burn rate of ${money.format(vitals.dailyBurn)}/day)\n` +
      `* Estimated Balance in 30 Days: **${money.format(projectedBalance)}** (assuming no further income)\n\n` +
      `⚠️ **Assumptions**: Projection assumes consistent daily purchasing patterns. One-off large capital purchases are excluded.`;
  }

  // Query 7: How much could I save if I reduce food spending by 20%?
  if (q.includes("food") && (q.includes("20%") || q.includes("reduce") || q.includes("save"))) {
    const foodSpend = vitals.categoryTotals["Food & Dining"] || 0;
    const monthlySaved = Math.round(foodSpend * 0.2);
    const annualSaved = monthlySaved * 12;

    return `🍽️ **Food & Dining Optimization Model**:\n\n` +
      `* Current Monthly Food Spend: **${money.format(foodSpend)}**\n` +
      `* Monthly Savings at 20% Cut: **${money.format(monthlySaved)}**\n` +
      `* Annual Compounded Savings: **${money.format(annualSaved)}**\n\n` +
      `💡 Shifting 2 restaurant orders or meal deliveries per week to home-cooked meals easily achieves this 20% target!`;
  }

  // Fallback financial summary response
  return `Here is your current financial intelligence summary:\n\n` +
    `* Available Balance: **${money.format(vitals.balance)}**\n` +
    `* This Month's Spending: **${money.format(vitals.expenseTotal)}** (${vitals.topCategory} is highest)\n` +
    `* Recorded Income: **${money.format(vitals.incomeTotal)}**\n` +
    `* Cash Runway: **${vitals.runwayDays} days** at **${money.format(vitals.dailyBurn)}/day**\n\n` +
    `You can ask me specific questions like: *"Can I afford ₹4,500?"*, *"Where did my money go?"*, or *"Safe weekend budget?"*`;
}

// Send chat message with optional backend AI endpoint fallback
async function handleChatSubmit(userQuery) {
  if (!userQuery) return;

  // Add user bubble
  chatHistory.push({
    sender: "user",
    text: userQuery,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  });
  renderChatMessages();

  // Show typing indicator
  const container = $("#chat-messages");
  const typingDiv = document.createElement("div");
  typingDiv.className = "chat-bubble assistant";
  typingDiv.id = "chat-typing";
  typingDiv.innerHTML = `
    <div class="bubble-avatar">✦</div>
    <div class="bubble-body">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>`;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;

  // Attempt backend API call if server is running, otherwise use deterministic engine
  let assistantReply = "";
  try {
    const vitals = calculateFinancialVitals();
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userQuery,
        financialContext: {
          balance: vitals.balance,
          income: vitals.incomeTotal,
          expenses: vitals.expenseTotal,
          netSavings: vitals.incomeTotal - vitals.expenseTotal,
          dailyBurn: vitals.dailyBurn,
          runway: vitals.runwayDays,
          remainingDays: vitals.remainingDays,
          categories: vitals.categoryTotals,
          topCategory: vitals.topCategory,
          topAmount: vitals.topAmount,
          weekendSafeSpend: vitals.weekendSafeSpend,
          budgets: budgets,
          allMonthlyTransactions: monthlyTransactions().map((t) => ({
            name: t.name,
            amount: t.amount,
            category: t.category,
            date: t.date,
            type: t.type,
          })),
          recentTransactions: transactions.slice(0, 30),
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.reply) {
        assistantReply = data.reply;
        $("#ai-status-pill").innerHTML = "<i></i> AI Copilot: Connected";
      }
    }
  } catch (err) {
    // Backend offline / static mode - graceful fallback
    $("#ai-status-pill").innerHTML = "<i></i> AI Copilot: Local Neural";
  }

  // Fallback to rich deterministic calculation if no backend reply
  if (!assistantReply) {
    // Artificial small delay for natural UX feel
    await new Promise((r) => setTimeout(r, 450));
    assistantReply = solveFinancialQueryLocally(userQuery);
  }

  // Remove typing indicator & push assistant message
  const typingEl = document.getElementById("chat-typing");
  if (typingEl) typingEl.remove();

  chatHistory.push({
    sender: "assistant",
    text: assistantReply,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  });
  persist();
  renderChatMessages();
}

// --- FUTURE WALLET SIMULATOR ---
function renderFutureWallet() {
  const vitals = calculateFinancialVitals();

  // Horizon Calculations
  const horizon7 = Math.round(vitals.balance - vitals.dailyBurn * 7);
  const horizon30 = Math.round(vitals.balance - vitals.dailyBurn * 30);
  const horizon90 = Math.round(vitals.balance - vitals.dailyBurn * 90);

  $("#wallet-horizons").innerHTML = `
    <article class="horizon-card">
      <p class="eyebrow">7-DAY ESTIMATE</p>
      <strong style="color:${horizon7 >= 0 ? "var(--electric-green)" : "var(--rose-danger)"}">${money.format(horizon7)}</strong>
      <p>Estimated balance in 1 week assuming ₹${vitals.dailyBurn}/day burn rate.</p>
    </article>
    <article class="horizon-card">
      <p class="eyebrow">30-DAY ESTIMATE</p>
      <strong style="color:${horizon30 >= 0 ? "var(--electric-green)" : "var(--rose-danger)"}">${money.format(horizon30)}</strong>
      <p>Month-end trajectory. ${horizon30 < 0 ? "Deficit warning without new income." : "Healthy reserve buffer."}</p>
    </article>
    <article class="horizon-card">
      <p class="eyebrow">90-DAY ESTIMATE</p>
      <strong style="color:${horizon90 >= 0 ? "var(--electric-green)" : "var(--rose-danger)"}">${money.format(horizon90)}</strong>
      <p>Quarterly outlook assuming baseline expenditure continues uninterrupted.</p>
    </article>`;

  // Update Purchase Check
  updatePurchaseSimulation();

  // Update Pace Shift
  updatePaceShift();
}

function updatePurchaseSimulation() {
  const slider = $("#purchase-range");
  const purchaseAmount = Number(slider.value) || 0;
  $("#purchase-value").textContent = money.format(purchaseAmount);

  const vitals = calculateFinancialVitals();
  const balanceAfter = vitals.balance - purchaseAmount;
  const newRunway = vitals.dailyBurn > 0 && balanceAfter > 0 ? Math.floor(balanceAfter / vitals.dailyBurn) : 0;
  const runwayLoss = Math.max(0, vitals.runwayDays - newRunway);

  // Dynamic slider gradient & color shifting
  const sliderPct = (purchaseAmount / Number(slider.max || 30000)) * 100;
  let activeColor = "var(--electric-green)";
  let verdictClass = "safe";
  let verdictText = "Safe Purchase";

  if (balanceAfter < 0) {
    activeColor = "var(--rose-danger)";
    verdictClass = "danger";
    verdictText = "Causes Deficit";
  } else if (newRunway < 14) {
    activeColor = "var(--amber-warn)";
    verdictClass = "caution";
    verdictText = "Runway Caution";
  }

  slider.style.background = `linear-gradient(90deg, ${activeColor} ${sliderPct}%, rgba(255, 255, 255, 0.12) ${sliderPct}%)`;

  const runwayRemainingPct = vitals.runwayDays > 0 ? Math.max(0, Math.min(100, Math.round((newRunway / vitals.runwayDays) * 100))) : 0;

  $("#purchase-result").innerHTML = `
    <div class="result-verdict">
      <span class="verdict-pill ${verdictClass}">${verdictText}</span>
      <strong style="color:#fff;">Balance after: ${money.format(balanceAfter)}</strong>
    </div>
    <div class="runway-impact-bar">
      <div class="runway-impact-header">
        <span>Runway Impact</span>
        <strong style="color:${balanceAfter < 0 ? 'var(--rose-danger)' : 'var(--electric-green)'};">
          ${newRunway} days left (-${runwayLoss}d)
        </strong>
      </div>
      <div class="runway-impact-track">
        <div class="runway-impact-fill ${verdictClass}" style="width:${runwayRemainingPct}%"></div>
      </div>
    </div>
    <p>
      * Consumes <strong>${vitals.balance > 0 ? Math.round((purchaseAmount / vitals.balance) * 100) : 100}%</strong> of your current liquid reserve.<br />
      * Reduces cash runway from <strong>${vitals.runwayDays} days</strong> down to <strong>${newRunway} days</strong>.
    </p>`;
}

function updatePaceShift() {
  const reductionPct = Number($("#reduction-range").value) || 0;
  $("#reduction-value").textContent = `${reductionPct}% reduction`;

  const vitals = calculateFinancialVitals();
  const currentDaily = vitals.dailyBurn;
  const reducedDaily = currentDaily * (1 - reductionPct / 100);

  const saved30 = Math.round((currentDaily - reducedDaily) * 30);
  const saved90 = Math.round((currentDaily - reducedDaily) * 90);

  $("#scenario-compare").innerHTML = `
    <div class="compare-box">
      <span>30-Day Extra Savings</span>
      <strong style="color:var(--electric-green);">+${money.format(saved30)}</strong>
    </div>
    <div class="compare-box">
      <span>90-Day Trajectory Boost</span>
      <strong style="color:var(--cyber-blue);">+${money.format(saved90)}</strong>
    </div>`;

  // Update Line Chart for forecast
  renderForecastChart(vitals.balance, currentDaily, reducedDaily);
}

function renderForecastChart(startBalance, currentDaily, reducedDaily) {
  const canvas = $("#forecast-chart");
  if (typeof Chart === "undefined") return;

  const labels = ["Today", "15d", "30d", "45d", "60d", "75d", "90d"];
  const days = [0, 15, 30, 45, 60, 75, 90];

  const currentTrajectory = days.map((d) => Math.round(startBalance - currentDaily * d));
  const reducedTrajectory = days.map((d) => Math.round(startBalance - reducedDaily * d));

  if (forecastChartInstance) {
    forecastChartInstance.destroy();
  }

  forecastChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Usual Pace",
          data: currentTrajectory,
          borderColor: "#e25c50",
          backgroundColor: "rgba(226, 92, 80, 0.12)",
          tension: 0.3,
          borderDash: [5, 5],
          pointRadius: 2,
        },
        {
          label: "Shifted Pace (Reduced)",
          data: reducedTrajectory,
          borderColor: "#00e58f",
          backgroundColor: "rgba(0, 229, 143, 0.15)",
          tension: 0.3,
          fill: true,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: "rgba(229, 212, 184, 0.06)" }, ticks: { color: "#a3b4a8", font: { size: 10 } } },
        y: {
          grid: { color: "rgba(229, 212, 184, 0.06)" },
          ticks: {
            color: "#a3b4a8",
            font: { size: 10 },
            callback: (v) => `₹${Math.round(v / 1000)}k`,
          },
        },
      },
      plugins: {
        legend: {
          labels: { color: "#e5d4b8", boxWidth: 12, font: { size: 11 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${money.format(ctx.raw)}`,
          },
        },
      },
    },
  });
}

// Savings Target Date Calculator
function handleSavingsTargetSubmit(event) {
  event.preventDefault();
  const target = Number($("#savings-target-input").value) || 0;
  const vitals = calculateFinancialVitals();

  const monthlyNet = vitals.incomeTotal - vitals.expenseTotal;
  const container = $("#target-result");

  if (target <= 0) {
    container.innerHTML = `<span style="color:var(--rose-danger);">Please enter a valid target savings amount.</span>`;
    return;
  }

  if (monthlyNet <= 0) {
    const requiredSurplus = Math.round(target / 12);
    container.innerHTML = `
      <p style="color:var(--amber-warn); font-weight:700; margin-bottom:6px;">⚠️ Insufficient Net Surplus to Reach Goal</p>
      <p>Your current recorded monthly expenses match or exceed income (Net: ${money.format(monthlyNet)}). ` +
      `To reach <strong>${money.format(target)}</strong> within 12 months, you need a net surplus of <strong>${money.format(requiredSurplus)}/month</strong>. ` +
      `Try reducing discretionary spending or adding additional income streams.</p>`;
  } else {
    const monthsNeeded = Math.ceil(target / monthlyNet);
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + monthsNeeded);
    const monthYear = targetDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

    container.innerHTML = `
      <p style="color:var(--electric-green); font-weight:700; margin-bottom:6px;">🎯 Estimated Target Date: ${monthYear} (~${monthsNeeded} months)</p>
      <p>Based on your current net monthly surplus of <strong>${money.format(monthlyNet)}/month</strong>. ` +
      `Maintaining your current savings discipline will accumulate <strong>${money.format(target)}</strong> right on schedule.</p>`;
  }
}

// --- SPENDING AUTOPSY ---
function renderSpendingAutopsy() {
  const vitals = calculateFinancialVitals();
  const expenses = monthlyExpenses();

  // If your money could talk
  let headline = "";
  if (vitals.expenseTotal === 0) {
    headline = "“Your wallet is resting peacefully. No expenses recorded this month!”";
  } else if (vitals.topCategory === "Food & Dining") {
    headline = `“I see you really love good food! Food & Dining absorbed ${Math.round((vitals.topAmount / vitals.expenseTotal) * 100)}% of my energy this month.”`;
  } else if (vitals.topCategory === "Shopping") {
    headline = `“Your retail therapy was active: Shopping claimed ${money.format(vitals.topAmount)} of your reserves!”`;
  } else if (vitals.balance > 25000) {
    headline = "“I feel secure and well-guarded. Your savings cushion is holding strong!”";
  } else {
    headline = `“I am moving fast! We had ${expenses.length} outflow transactions totaling ${money.format(vitals.expenseTotal)}.”`;
  }

  $("#autopsy-hero").innerHTML = `
    <div class="autopsy-header-quote">${headline}</div>
    <div class="autopsy-hero-stats">
      <div class="autopsy-stat">
        <span>Total Capital Outflow</span>
        <strong>${money.format(vitals.expenseTotal)}</strong>
      </div>
      <div class="autopsy-stat">
        <span>Prime Outflow Area</span>
        <strong style="color:var(--electric-green);">${vitals.topCategory}</strong>
      </div>
      <div class="autopsy-stat">
        <span>Change vs Last Month</span>
        <strong style="color:${vitals.spendingDiff > 0 ? "var(--rose-danger)" : "var(--electric-green)"};">
          ${vitals.spendingDiff > 0 ? "+" : ""}${money.format(vitals.spendingDiff)}
        </strong>
      </div>
    </div>`;

  // 1. Largest Transactions
  const largest = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 4);
  $("#largest-transactions").innerHTML = largest.length
    ? largest
        .map(
          (t) => `
        <div class="autopsy-item">
          <div>
            <strong>${escapeHtml(t.name)}</strong>
            <span>${t.category} · ${formatDate(t.date)}</span>
          </div>
          <strong style="font-family:'DM Mono',monospace;">${money.format(t.amount)}</strong>
        </div>`
        )
        .join("")
    : `<p class="empty-state">No transactions recorded.</p>`;

  // 2. Micro-drain Detector (frequent small purchases under ₹500)
  const microPurchases = expenses.filter((e) => e.amount > 0 && e.amount <= 500);
  const microTotal = total(microPurchases);

  $("#small-purchases").innerHTML = microPurchases.length
    ? `
      <div style="margin-bottom:12px;">
        <span style="font-size:12px; color:var(--text-muted);">Detected <strong>${microPurchases.length} small purchases</strong> totaling</span>
        <strong style="display:block; font-family:'DM Mono',monospace; font-size:18px; color:var(--amber-warn); margin-top:2px;">${money.format(microTotal)}</strong>
      </div>
      ${microPurchases
        .slice(0, 3)
        .map(
          (m) => `
        <div class="autopsy-item">
          <div>
            <strong>${escapeHtml(m.name)}</strong>
            <span>${m.category}</span>
          </div>
          <span>${money.format(m.amount)}</span>
        </div>`
        )
        .join("")}`
    : `<p class="empty-state">No micro-purchases detected.</p>`;

  // 3. Next Month Move
  const trimAmount = Math.round(vitals.topAmount * 0.2);
  $("#autopsy-action").innerHTML = `
    <div style="padding:10px 0;">
      <p style="font-size:13px; color:#fff; line-height:1.5;">
        Cap <strong>${vitals.topCategory}</strong> at <strong>${money.format(Math.max(0, vitals.topAmount - trimAmount))}</strong> next month.
      </p>
      <p style="font-size:11.5px; color:var(--text-muted); margin-top:6px;">
        This single move frees up <strong>${money.format(trimAmount)}</strong> to fund your emergency reserves or investments.
      </p>
    </div>`;

  // Savings Opportunity Banner
  if (trimAmount > 0) {
    $("#savings-opportunity-title").textContent = `Save ${money.format(trimAmount)} Next Month`;
    $("#savings-opportunity-copy").textContent = `By optimizing your ${vitals.topCategory} spending by 20%, you unlock ${money.format(trimAmount * 12)} annually in compounding savings.`;
  } else {
    $("#savings-opportunity-title").textContent = "Maintain Balanced Flow";
    $("#savings-opportunity-copy").textContent = "Continue recording transactions to discover fresh savings opportunities.";
  }
}

function showAutopsyShareModal() {
  const vitals = calculateFinancialVitals();
  const modal = $("#autopsy-modal");
  const backdrop = $("#modal-backdrop");
  const content = $("#autopsy-share-content");

  content.innerHTML = `
    <div class="share-card">
      <div class="share-card-header">
        <span class="share-card-brand">PennyWise AI <i>Autopsy</i></span>
        <span class="share-card-pill">Privacy Masked</span>
      </div>
      <div class="share-card-body">
        <span style="font-family:'DM Mono',monospace; font-size:11px; color:var(--text-muted);">${currentMonth()} Financial Health</span>
        <h3>“${vitals.topCategory} was my primary spending focus this month.”</h3>
        <div class="share-card-grid">
          <div class="share-card-stat">
            <span>Total Monthly Outflow</span>
            <strong>${money.format(vitals.expenseTotal)}</strong>
          </div>
          <div class="share-card-stat">
            <span>Top Category</span>
            <strong>${vitals.topCategory} (${Math.round((vitals.topAmount / (vitals.expenseTotal || 1)) * 100)}%)</strong>
          </div>
          <div class="share-card-stat">
            <span>Daily Burn</span>
            <strong>${money.format(vitals.dailyBurn)}/day</strong>
          </div>
          <div class="share-card-stat">
            <span>Cash Buffer</span>
            <strong>${vitals.runwayDays} Days Runway</strong>
          </div>
        </div>
        <p style="font-size:11px; color:var(--text-faint); margin:0;">
          Confidential financial report card. Merchant identities &amp; account details excluded.
        </p>
      </div>
    </div>`;

  backdrop.classList.remove("hidden");
  modal.classList.remove("hidden");
}

function closeAutopsyShareModal() {
  $("#autopsy-modal").classList.add("hidden");
  $("#modal-backdrop").classList.add("hidden");
}

// --- TRANSACTIONS MANAGEMENT ---
function populateSelects() {
  const options = Object.keys(CATEGORIES)
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join("");
  $("#transaction-category").innerHTML = options;
  $("#category-filter").innerHTML = `<option value="all">All categories</option>${options}`;
}

function renderTransactions() {
  const query = $("#transaction-search").value.trim().toLowerCase();
  const category = $("#category-filter").value;
  const type = $("#type-filter").value;

  const filtered = [...transactions]
    .filter(
      (item) =>
        (!query ||
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.note && item.note.toLowerCase().includes(query))) &&
        (category === "all" || item.category === category) &&
        (type === "all" || item.type === type)
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  $("#transaction-table-body").innerHTML = filtered
    .map((item) => {
      const meta = metadata(item.category);
      return `
      <tr>
        <td>
          <div class="table-transaction">
            ${categoryIcon(item.category)}
            <div>
              <strong>${escapeHtml(item.name)}</strong>
              <span>${item.type === "income" ? "Income" : escapeHtml(item.note) || "Expense"}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="category-tag" style="--tag-bg:${meta.bg};--tag-color:${meta.color}">
            ${item.category}
          </span>
        </td>
        <td style="font-family:'DM Mono',monospace; font-size:12px;">${formatDate(item.date)}</td>
        <td>
          <strong class="transaction-amount ${item.type === "income" ? "income" : ""}">
            ${item.type === "income" ? "+" : "−"}${money.format(item.amount)}
          </strong>
        </td>
        <td>
          <button class="delete-button" data-delete-id="${item.id}" aria-label="Delete transaction" title="Delete record">×</button>
        </td>
      </tr>`;
    })
    .join("");

  $("#no-transactions").classList.toggle("hidden", filtered.length > 0);
}

// Suggested category matcher
function suggestedCategory(name) {
  const lower = (name || "").toLowerCase();
  return Object.entries(CATEGORIES).find(([, meta]) =>
    meta.keywords.some((keyword) => lower.includes(keyword))
  )?.[0];
}

// --- SMART BUDGET GUARDIAN ---
function renderBudgetGuardian() {
  const vitals = calculateFinancialVitals();

  // Render Visual Budget vs Actual Bar Chart
  renderBudgetBarsChart(vitals, budgets);

  // Populate threshold inputs
  $("#threshold-one").value = thresholds.one;
  $("#threshold-two").value = thresholds.two;
  $("#threshold-three").value = thresholds.three;

  // Guardian Alert Board
  const alerts = [];
  Object.entries(budgets).forEach(([category, limit]) => {
    if (limit <= 0) return;
    const spent = vitals.categoryTotals[category] || 0;
    const pct = Math.round((spent / limit) * 100);

    // Calculate pace depletion projection
    const dailyCatBurn = vitals.dailyBurn > 0 ? spent / Math.max(new Date().getDate(), 1) : 0;
    const daysUntilDepletion = dailyCatBurn > 0 && limit > spent ? Math.round((limit - spent) / dailyCatBurn) : 0;

    if (pct >= 100) {
      alerts.push({
        category,
        title: "Budget Exceeded",
        desc: `Over by ${money.format(spent - limit)} (${pct}% consumed). Pause further spending in this category.`,
        type: "alert-danger",
      });
    } else if (pct >= thresholds.three) {
      alerts.push({
        category,
        title: `Critical Alert: ${pct}% Spent`,
        desc: `Only ${money.format(limit - spent)} left. At current pace, this budget depletes in ~${daysUntilDepletion} days.`,
        type: "alert-danger",
      });
    } else if (pct >= thresholds.two) {
      alerts.push({
        category,
        title: `Caution: ${pct}% Consumed`,
        desc: `${money.format(limit - spent)} remaining for the rest of the month.`,
        type: "alert-warning",
      });
    }
  });

  $("#guardian-alerts").innerHTML = alerts.length
    ? alerts
        .map(
          (a) => `
        <div class="alert-item ${a.type}">
          <div class="alert-meta">
            <strong>${escapeHtml(a.category)}: ${a.title}</strong>
            <span>${a.desc}</span>
          </div>
        </div>`
        )
        .join("")
    : `
      <div class="alert-item alert-good" style="grid-column: 1 / -1;">
        <div class="alert-meta">
          <strong>Guardian Standing By</strong>
          <span>All category budgets are operating within safe planned limits.</span>
        </div>
      </div>`;

  // Budget Cards Editor
  $("#budget-editor").innerHTML = Object.entries(CATEGORIES)
    .filter(([cat]) => cat !== "Other")
    .map(([category]) => {
      const budget = Number(budgets[category]) || 0;
      const spent = vitals.categoryTotals[category] || 0;
      const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
      const progressClass = pct >= 100 ? "danger-fill" : pct >= thresholds.two ? "warning-fill" : "neon-fill";

      return `
        <article class="budget-card">
          <div class="budget-card-header">
            ${categoryIcon(category)}
            <h3>${category}</h3>
          </div>
          <p>${money.format(spent)} spent this month</p>
          <label class="budget-input">
            <span>₹</span>
            <input class="budget-value" data-category="${category}" type="number" min="0" step="100" value="${budget}" aria-label="Budget for ${category}" />
          </label>
          <div class="progress-track">
            <div class="progress-fill ${progressClass}" style="width:${pct}%"></div>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:11px; color:var(--text-faint);">
            <span>${Math.round(pct)}% used</span>
            <span>${budget > spent ? money.format(budget - spent) + " left" : "Over limit"}</span>
          </div>
        </article>`;
    })
    .join("");
}

// --- SPLIT EXPENSES ---
function initialFor(name) {
  return escapeHtml((name || "").trim().slice(0, 1).toUpperCase());
}

function renderSplitPeople() {
  $("#split-paid-by").innerHTML = splitPeople
    .map((p) => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`)
    .join("");

  $("#split-participants").innerHTML = splitPeople
    .map(
      (p) => `
      <label class="person-check">
        <input type="checkbox" value="${escapeHtml(p)}" ${p === CURRENT_USER ? "checked" : ""} />
        <span>${escapeHtml(p === CURRENT_USER ? "You" : p)}</span>
      </label>`
    )
    .join("");

  $("#split-people-list").innerHTML = splitPeople
    .map(
      (p, i) => `
      <div class="person-row">
        <span class="person-avatar">${initialFor(p)}</span>
        <strong>${escapeHtml(p)}</strong>
        ${
          p === CURRENT_USER
            ? '<span class="you-pill">YOU</span>'
            : `<button class="remove-person" data-remove-person="${i}" title="Remove ${escapeHtml(p)}" aria-label="Remove person" type="button">×</button>`
        }
      </div>`
    )
    .join("");
}

function calculateSplitBalances() {
  const balances = Object.fromEntries(splitPeople.map((p) => [p, 0]));
  splitExpenses.forEach((exp) => {
    if (!balances.hasOwnProperty(exp.paidBy)) balances[exp.paidBy] = 0;
    balances[exp.paidBy] += Number(exp.amount);
    const share = Number(exp.amount) / exp.participants.length;
    exp.participants.forEach((p) => {
      if (!balances.hasOwnProperty(p)) balances[p] = 0;
      balances[p] -= share;
    });
  });
  return balances;
}

function renderSplitView() {
  renderSplitPeople();
  const balances = calculateSplitBalances();
  const yourBalance = balances[CURRENT_USER] || 0;
  const totalShared = total(splitExpenses);

  const userStatus =
    yourBalance > 0.01
      ? { label: "You are owed", value: money.format(yourBalance), className: "owed" }
      : yourBalance < -0.01
      ? { label: "You owe", value: money.format(Math.abs(yourBalance)), className: "owes" }
      : { label: "Your net split balance", value: "Settled up", className: "" };

  $("#split-summary").innerHTML = `
    <article class="split-summary-card">
      <span>People in Circle</span>
      <strong>${splitPeople.length}</strong>
    </article>
    <article class="split-summary-card">
      <span>Total Shared Volume</span>
      <strong>${money.format(totalShared)}</strong>
    </article>
    <article class="split-summary-card">
      <span>${userStatus.label}</span>
      <strong class="${userStatus.className}">${userStatus.value}</strong>
    </article>`;

  const orderedBalances = Object.entries(balances).sort(([a], [b]) =>
    a === CURRENT_USER ? -1 : b === CURRENT_USER ? 1 : a.localeCompare(b)
  );

  $("#split-balances").innerHTML = orderedBalances
    .map(([person, bal]) => {
      const settled = Math.abs(bal) < 0.01;
      const statusText = settled
        ? "Settled"
        : bal > 0
        ? person === CURRENT_USER
          ? "You get back"
          : "Gets back"
        : person === CURRENT_USER
        ? "You need to pay"
        : "Needs to pay";

      return `
      <div class="split-balance-row">
        <span class="person-avatar">${initialFor(person)}</span>
        <div class="split-balance-main">
          <strong>${escapeHtml(person)}</strong>
          <span>${statusText}</span>
        </div>
        ${
          settled
            ? '<strong class="settled-tag">Settled</strong>'
            : `<strong class="split-balance-amount ${bal < 0 ? "owes" : ""}">${money.format(Math.abs(bal))}</strong>`
        }
      </div>`;
    })
    .join("");

  const history = [...splitExpenses].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  $("#split-history").innerHTML = history.length
    ? history
        .map(
          (exp) => `
        <div class="split-history-row">
          <span class="person-avatar">÷</span>
          <div class="split-history-main">
            <strong>${escapeHtml(exp.name)}</strong>
            <span>${escapeHtml(exp.paidBy)} paid · ${exp.participants.length} people · ${formatDate(exp.createdAt)}</span>
          </div>
          <strong class="split-history-amount">${money.format(exp.amount)}</strong>
          <button class="delete-button" data-delete-split="${exp.id}" aria-label="Delete shared expense" title="Delete record">×</button>
        </div>`
        )
        .join("")
    : `<p class="empty-state">No shared expenses recorded yet.</p>`;
}

// --- MODALS, TOASTS & NAVIGATION ---
function setView(viewName) {
  $$(".view").forEach((v) => v.classList.toggle("active-view", v.id === viewName));
  $$("[data-view-target]").forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.viewTarget === viewName && btn.classList.contains("nav-link"))
  );

  const titles = {
    dashboard: "Your money, decoded.",
    assistant: "Ask PennyWise AI",
    wallet: "Future Wallet Simulator",
    autopsy: "Spending Autopsy",
    battles: "Financial Boss Battles",
    transactions: "Transactions Ledger",
    budgets: "Smart Budget Guardian",
    splits: "Split Expenses",
  };
  $("#page-title").textContent = titles[viewName] || "Financial Intelligence";
  $("#sidebar").classList.remove("open");

  // Trigger lazy renders for view-specific elements
  if (viewName === "wallet") renderFutureWallet();
  if (viewName === "autopsy") renderSpendingAutopsy();
  if (viewName === "battles") renderBossBattlesView();
  if (viewName === "budgets") renderBudgetGuardian();
  if (viewName === "splits") renderSplitView();
  if (viewName === "assistant") renderChatMessages();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showTransactionModal() {
  $("#transaction-form").reset();
  $("#transaction-date").value = dateKey();
  $("#transaction-category").value = "Other";
  $("#category-suggestion").textContent = "";
  $("#modal-backdrop").classList.remove("hidden");
  $("#transaction-modal").classList.remove("hidden");
  setTimeout(() => $("#transaction-name").focus(), 80);
}

function hideTransactionModal() {
  $("#modal-backdrop").classList.add("hidden");
  $("#transaction-modal").classList.add("hidden");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.add("hidden"), 3000);
}

// --- CONFETTI PARTICLE BURST ---
function triggerConfetti() {
  const canvas = $("#confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#00e58f", "#e5d4b8", "#689d78", "#d4bfa4", "#e8a838", "#f7f4eb"];
  const particles = Array.from({ length: 65 }, () => ({
    x: canvas.width / 2,
    y: canvas.height * 0.45,
    vx: (Math.random() - 0.5) * 16,
    vy: (Math.random() - 0.75) * 18,
    size: Math.random() * 7 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rSpeed: (Math.random() - 0.5) * 12,
    alpha: 1,
  }));

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38; // gravity
      p.vx *= 0.98; // air resistance
      p.rotation += p.rSpeed;
      p.alpha -= 0.016;

      if (p.alpha > 0) {
        active = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (active) {
      requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(update);
}

// --- EVENT BINDINGS ---
function bindEvents() {
  // Navigation
  $$("[data-view-target]").forEach((btn) =>
    btn.addEventListener("click", () => setView(btn.dataset.viewTarget))
  );

  // Chart Type Toggle (Donut vs. Pie)
  const btnDoughnut = $("#btn-chart-doughnut");
  const btnPie = $("#btn-chart-pie");
  if (btnDoughnut && btnPie) {
    btnDoughnut.addEventListener("click", () => {
      currentSpendingChartType = "doughnut";
      btnDoughnut.classList.add("active");
      btnPie.classList.remove("active");
      const vitals = calculateFinancialVitals();
      renderSpendingChart(vitals.categoryTotals, vitals.expenseTotal, "doughnut");
    });
    btnPie.addEventListener("click", () => {
      currentSpendingChartType = "pie";
      btnPie.classList.add("active");
      btnDoughnut.classList.remove("active");
      const vitals = calculateFinancialVitals();
      renderSpendingChart(vitals.categoryTotals, vitals.expenseTotal, "pie");
    });
  }

  // Mobile Menu
  $("#mobile-menu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));

  // Transaction Modal Open/Close
  [$("#open-transaction-modal"), $("#open-transaction-modal-2")].forEach((btn) => {
    if (btn) btn.addEventListener("click", showTransactionModal);
  });
  $("#close-transaction-modal").addEventListener("click", hideTransactionModal);
  $("#modal-backdrop").addEventListener("click", () => {
    hideTransactionModal();
    closeAutopsyShareModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideTransactionModal();
      closeAutopsyShareModal();
    }
  });

  // Autocomplete Category Suggestion
  $("#transaction-name").addEventListener("input", (e) => {
    const cat = suggestedCategory(e.target.value);
    $("#category-suggestion").textContent = cat ? `💡 Suggested category: ${cat}` : "";
    if (cat) $("#transaction-category").value = cat;
  });

  // Transaction Form Submit
  $("#transaction-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const newTx = {
      id: crypto.randomUUID(),
      name: data.get("name").trim(),
      amount: Number(data.get("amount")),
      category: data.get("category"),
      date: data.get("date"),
      type: data.get("type"),
      note: (data.get("note") || "").trim(),
    };
    transactions.push(newTx);

    // XP reward for logging
    gamification.xp += 10;
    persist();
    renderAll();
    hideTransactionModal();
    showToast(`✓ Transaction saved (+10 XP)`);
  });

  // Transactions Search & Filters
  [$("#transaction-search"), $("#category-filter"), $("#type-filter")].forEach((f) =>
    f.addEventListener("input", renderTransactions)
  );

  // Transaction Table Delete
  $("#transaction-table-body").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-delete-id]");
    if (!btn) return;
    transactions = transactions.filter((t) => t.id !== btn.dataset.deleteId);
    persist();
    renderAll();
    showToast("Transaction deleted.");
  });

  // Chat Form Submit
  $("#chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#chat-input");
    const val = input.value.trim();
    if (!val) return;
    input.value = "";
    handleChatSubmit(val);
  });

  // Prompt Chips Click Handlers (Delegated)
  document.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-prompt]");
    if (!chip) return;
    const promptText = chip.dataset.prompt;
    setView("assistant");
    handleChatSubmit(promptText);
  });

  // Clear Chat
  $("#clear-chat").addEventListener("click", () => {
    chatHistory = [
      {
        sender: "assistant",
        text: "Chat cleared! Ask me anything about your recorded finances, runway, or simulated purchases.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    persist();
    renderChatMessages();
    showToast("Chat history reset.");
  });

  // Future Wallet Range Sliders
  $("#purchase-range").addEventListener("input", updatePurchaseSimulation);
  $("#reduction-range").addEventListener("input", updatePaceShift);
  $("#savings-target-form").addEventListener("submit", handleSavingsTargetSubmit);

  // Spending Autopsy Share Modal
  $("#download-autopsy").addEventListener("click", showAutopsyShareModal);
  $("#close-autopsy-modal").addEventListener("click", closeAutopsyShareModal);
  $("#copy-autopsy-btn").addEventListener("click", () => {
    const vitals = calculateFinancialVitals();
    const text = `PennyWise AI - Spending Autopsy (${currentMonth()})\n` +
      `Total Spent: ${money.format(vitals.expenseTotal)}\n` +
      `Top Category: ${vitals.topCategory} (${money.format(vitals.topAmount)})\n` +
      `Daily Burn: ${money.format(vitals.dailyBurn)}/day\n` +
      `Runway Buffer: ${vitals.runwayDays} Days`;
    navigator.clipboard.writeText(text);
    showToast("✓ Report summary copied to clipboard!");
  });
  $("#print-autopsy-btn").addEventListener("click", () => {
    window.print();
  });

  // Boss Battle Claim & Dismiss
  $("#quests-container").addEventListener("click", (e) => {
    const claimBtn = e.target.closest("[data-claim-quest]");
    if (claimBtn) {
      const qid = claimBtn.dataset.claimQuest;
      const quest = QUEST_DEFINITIONS.find((q) => q.id === qid);
      if (quest && !gamification.claimedQuests[qid]) {
        gamification.claimedQuests[qid] = true;
        gamification.xp += quest.xp;
        persist();
        renderBossBattlesView();
        renderDashboardChallengeWidget();
        triggerConfetti();
        showToast(`🎉 Quest complete! +${quest.xp} XP earned!`);
      }
      return;
    }

    const dismissBtn = e.target.closest("[data-dismiss-quest]");
    if (dismissBtn) {
      const qid = dismissBtn.dataset.dismissQuest;
      gamification.dismissedQuests[qid] = true;
      persist();
      renderBossBattlesView();
      renderDashboardChallengeWidget();
      showToast("Quest dismissed.");
    }
  });

  // Budget Guardian Thresholds & Save
  $("#save-thresholds").addEventListener("click", () => {
    thresholds.one = Math.max(1, Math.min(99, Number($("#threshold-one").value) || 50));
    thresholds.two = Math.max(1, Math.min(99, Number($("#threshold-two").value) || 75));
    thresholds.three = Math.max(1, Math.min(100, Number($("#threshold-three").value) || 90));
    persist();
    renderBudgetGuardian();
    renderDashboardGuardianAlerts(calculateFinancialVitals());
    showToast("Alert thresholds saved.");
  });

  $("#save-budgets").addEventListener("click", () => {
    $$(".budget-value").forEach((input) => {
      budgets[input.dataset.category] = Math.max(0, Number(input.value) || 0);
    });
    persist();
    renderAll();
    showToast("Category budgets saved.");
  });

  // Split Expenses
  $("#add-person-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const field = $("#person-name");
    const name = field.value.trim();
    if (!name) return;
    if (splitPeople.some((p) => p.toLowerCase() === name.toLowerCase())) {
      showToast(`${name} is already in your circle.`);
      return;
    }
    splitPeople.push(name);
    persist();
    renderSplitView();
    field.value = "";
    showToast(`${name} added to group.`);
  });

  $("#split-people-list").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove-person]");
    if (!btn) return;
    const p = splitPeople[Number(btn.dataset.removePerson)];
    if (splitExpenses.some((exp) => exp.paidBy === p || exp.participants.includes(p))) {
      showToast(`Delete ${p}'s shared split records before removing them.`);
      return;
    }
    splitPeople = splitPeople.filter((entry) => entry !== p);
    persist();
    renderSplitView();
    showToast(`${p} removed from circle.`);
  });

  $("#split-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const participants = $$("#split-participants input:checked").map((i) => i.value);
    const paidBy = data.get("split-paid-by");
    if (participants.length < 2) {
      showToast("Select at least 2 people to split an expense.");
      return;
    }
    if (!participants.includes(paidBy)) {
      showToast("The payer must be included in the participants list.");
      return;
    }
    splitExpenses.push({
      id: crypto.randomUUID(),
      name: data.get("split-name").trim(),
      amount: Number(data.get("split-amount")),
      paidBy,
      participants,
      createdAt: dateKey(),
    });
    persist();
    renderSplitView();
    e.currentTarget.reset();
    showToast(`Shared expense created (${participants.length} ways).`);
  });

  $("#split-history").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-delete-split]");
    if (!btn) return;
    splitExpenses = splitExpenses.filter((exp) => exp.id !== btn.dataset.deleteSplit);
    persist();
    renderSplitView();
    showToast("Shared expense deleted.");
  });

  // Demo Presets Switcher
  $$("[data-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.preset;
      if (mode === "heavy-spender") {
        transactions = createHighSpenderDemoTransactions();
        showToast("Switched to 'High Burn Spender' scenario.");
      } else if (mode === "fresh") {
        transactions = [];
        showToast("Switched to 'Fresh Slate' empty state.");
      } else {
        transactions = createStandardDemoTransactions();
        showToast("Switched to 'Standard Balanced' scenario.");
      }
      persist();
      renderAll();
    });
  });

  // Reset Data Button
  $("#reset-data").addEventListener("click", () => {
    if (!confirm("Reset PennyWise to standard sample data? Your local modifications will be replaced.")) return;
    transactions = createStandardDemoTransactions();
    budgets = { ...DEFAULT_BUDGETS };
    thresholds = { ...DEFAULT_THRESHOLDS };
    splitPeople = [CURRENT_USER, "Aarav", "Priya"];
    splitExpenses = [];
    gamification = {
      xp: 85,
      level: 1,
      streakDays: 4,
      lastStreakCheck: null,
      claimedQuests: {},
      dismissedQuests: {},
      unlockedBadges: ["first-step", "streak-master"],
    };
    persist();
    renderAll();
    showToast("PennyWise restored to default state.");
  });
}

// --- RENDER ALL VIEWS & STARTUP ---
function renderAll() {
  renderOverview();
  renderTransactions();
  renderBudgetGuardian();
  renderSplitView();
  renderFutureWallet();
  renderSpendingAutopsy();
  renderBossBattlesView();
}

function start() {
  $("#page-date").textContent = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }).toUpperCase();
  initialiseData();
  populateSelects();
  bindEvents();
  renderAll();
}

start();
