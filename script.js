const CATEGORY_COLORS = {
  Housing: "#EF4444",
  Food: "#F97316",
  Utilities: "#EAB308",
  Education: "#8B5CF6",
  Transportation: "#06B6D4",
  Others: "#64748B"
};

const storedTransactions = localStorage.getItem("transactions");
let transactions = storedTransactions ? JSON.parse(storedTransactions) : [];

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMoney(amount) {
  const number = Number(amount) || 0;
  const formattedMoney = number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return "₹ " + formattedMoney;
}

const dateRange = document.getElementById("date-range");
const totalIncome = document.getElementById("total-income");
const totalExpense = document.getElementById("total-expense");
const totalBalance = document.getElementById("total-balance");

function updateHeaderDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = today.toLocaleString("en-US", { month: "short" });
  const year = today.getFullYear();

  if (dateRange) {
    dateRange.textContent = `Today: ${day} ${month} ${year}`;
  }
}

function updateTotals() {
  let income = 0;
  let expense = 0;

  transactions.forEach((transaction) => {
    const amount = Number(transaction.amount) || 0;
    if (transaction.type === "income") {
      income += amount;
    } else {
      expense += amount;
    }
  });

  const balance = income - expense;

  const formattedIncome = formatMoney(income);
  const formattedExpense = formatMoney(expense);
  const formattedBalance = formatMoney(balance);

  if (totalIncome) totalIncome.textContent = formattedIncome;
  if (totalExpense) totalExpense.textContent = formattedExpense;
  if (totalBalance) totalBalance.textContent = formattedBalance;
}

const searchInput = document.getElementById("search-input");
const typeFilter = document.getElementById("type-filter");
const categoryFilter = document.getElementById("category-filter");
const clearFiltersButton = document.getElementById("clear-filters-button");

function clearFilters() {
  if (searchInput) searchInput.value = "";
  if (typeFilter) typeFilter.value = "all";
  if (categoryFilter) categoryFilter.value = "all";
  showTransactions();
}

if (searchInput) searchInput.addEventListener("input", showTransactions);
if (typeFilter) typeFilter.addEventListener("change", showTransactions);
if (categoryFilter) categoryFilter.addEventListener("change", showTransactions);
if (clearFiltersButton) clearFiltersButton.addEventListener("click", clearFilters);

const transactionTableBody = document.getElementById("transaction-table-body");

function showTransactions() {
  if (!transactionTableBody) return;

  const searchText = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const selectedType = typeFilter ? typeFilter.value : "all";
  const selectedCategory = categoryFilter ? categoryFilter.value : "all";

  transactionTableBody.innerHTML = "";

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = (transaction.title || "").toLowerCase().includes(searchText);
    const matchesType = selectedType === "all" || transaction.type === selectedType;
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  if (filteredTransactions.length === 0) {
    transactionTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: #1d55a4ff; padding: 24px;">
          No transactions found matching criteria.
        </td>
      </tr>
    `;
    return;
  }

  filteredTransactions.forEach((transaction, index) => {
    const row = document.createElement("tr");

    const isIncome = transaction.type === "income";
    const badgeClass = isIncome ? "badge-income" : "badge-expense";
    const amountClass = isIncome ? "amount-income" : "amount-expense";
    const typeLabel = isIncome ? "Income" : "Expense";
    const typeIcon = isIncome ? "icons/income.svg" : "icons/expense.svg";

    const amount = Number(transaction.amount) || 0;
    const formattedAmount = formatMoney(amount);

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>
        <div style="font-weight: 600; display: flex; align-items: center; gap: 8px;">
          <img src="${typeIcon}" alt="${typeLabel}" width="20" height="20" style="border-radius: 50%; object-fit: cover;">
          <span>${transaction.title || ""}</span>
        </div>
      </td>
      <td>
        <span class="badge cat-${transaction.category}">${transaction.category || ""}</span>
      </td>
      <td>
        <span class="badge ${badgeClass}">${typeLabel}</span>
      </td>
      <td class="${amountClass}">
        ${formattedAmount}
      </td>
      <td style="color: #64748b;">
        ${transaction.date || ""}
      </td>
      <td>
        <div class="action-buttons">
          <button class="icon-button edit-button" data-id="${transaction.id}" title="Edit">
            <img src="icons/edit.svg" alt="Edit" width="14" height="14">
          </button>
          <button class="icon-button delete-button" data-id="${transaction.id}" title="Delete">
            <img src="icons/delete.svg" alt="Delete" width="14" height="14">
          </button>
        </div>
      </td>
    `;

    transactionTableBody.appendChild(row);
  });

  transactionTableBody.querySelectorAll(".edit-button").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.getAttribute("data-id"));
      openEditModal(id);
    });
  });

  transactionTableBody.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.getAttribute("data-id"));
      deleteTransaction(id);
    });
  });
}

const transactionForm = document.getElementById("transaction-form");
const transactionTitle = document.getElementById("transaction-title");
const transactionAmount = document.getElementById("transaction-amount");
const transactionType = document.getElementById("transaction-type");
const transactionCategory = document.getElementById("transaction-category");
const transactionDate = document.getElementById("transaction-date");

function addTransaction(event) {
  event.preventDefault();

  if (!transactionTitle || !transactionAmount || !transactionType || !transactionCategory || !transactionDate) {
    return;
  }

  const title = transactionTitle.value.trim();
  const amount = Number(transactionAmount.value);
  const type = transactionType.value;
  const category = transactionCategory.value;
  const date = transactionDate.value;

  if (!title) {
    alert("Please enter a title.");
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  if (!category) {
    alert("Please select a category.");
    return;
  }

  if (!date) {
    alert("Please select a date.");
    return;
  }

  const newTransaction = {
    id: Date.now(),
    title: title,
    amount: amount,
    type: type,
    category: category,
    date: date
  };

  transactions.unshift(newTransaction);
  saveTransactions();
  updateScreen();

  transactionForm.reset();
  transactionType.value = "expense";
  transactionDate.value = getTodayString();
}

if (transactionForm) transactionForm.addEventListener("submit", addTransaction);

const clearAllButton = document.getElementById("clear-all-button");

function deleteTransaction(id) {
  const confirmed = confirm("Are you sure you want to delete this transaction?");
  if (!confirmed) return;

  transactions = transactions.filter((transaction) => transaction.id !== id);
  saveTransactions();
  updateScreen();
}

function clearAllTransactions() {
  const confirmed = confirm("CRITICAL WARNING: This will permanently delete ALL transactions! Proceed?");
  if (!confirmed) return;

  transactions = [];
  saveTransactions();
  updateScreen();
}

if (clearAllButton) clearAllButton.addEventListener("click", clearAllTransactions);

const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const editId = document.getElementById("edit-id");
const editTitle = document.getElementById("edit-title");
const editAmount = document.getElementById("edit-amount");
const editType = document.getElementById("edit-type");
const editCategory = document.getElementById("edit-category");
const editDate = document.getElementById("edit-date");
const closeModalButton = document.getElementById("close-modal-button");
const cancelEditButton = document.getElementById("cancel-edit-button");

function openEditModal(id) {
  const transaction = transactions.find((item) => item.id === id);
  if (!transaction) return;

  editId.value = transaction.id;
  editTitle.value = transaction.title || "";
  editAmount.value = transaction.amount || "";
  editType.value = transaction.type || "expense";
  editCategory.value = transaction.category || "";
  editDate.value = transaction.date || "";

  editModal.classList.add("active");
}

function closeEditModal() {
  if (editModal) {
    editModal.classList.remove("active");
  }
}

function saveEditedTransaction(event) {
  event.preventDefault();

  const id = Number(editId.value);
  const transactionIndex = transactions.findIndex((transaction) => transaction.id === id);

  if (transactionIndex === -1) return;

  transactions[transactionIndex] = {
    ...transactions[transactionIndex],
    title: editTitle.value.trim(),
    amount: Number(editAmount.value),
    type: editType.value,
    category: editCategory.value,
    date: editDate.value
  };

  saveTransactions();
  updateScreen();
  closeEditModal();
}

if (editForm) editForm.addEventListener("submit", saveEditedTransaction);
if (closeModalButton) closeModalButton.addEventListener("click", closeEditModal);
if (cancelEditButton) cancelEditButton.addEventListener("click", closeEditModal);

const expenseChart = document.getElementById("expense-chart");
const chartLegend = document.getElementById("chart-legend");

function renderExpenseChart() {
  if (!expenseChart || !chartLegend) return;

  const context = expenseChart.getContext("2d");
  if (!context) return;

  context.clearRect(0, 0, expenseChart.width, expenseChart.height);

  const centerX = expenseChart.width / 2;
  const centerY = expenseChart.height / 2;
  const outerRadius = expenseChart.width * 0.44;
  const innerRadius = expenseChart.width * 0.26;

  const categoryTotals = {};
  let totalExpenseAmount = 0;

  transactions.forEach((transaction) => {
    if (transaction.type !== "expense") return;
    const amount = Number(transaction.amount) || 0;
    categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + amount;
    totalExpenseAmount += amount;
  });

  if (totalExpenseAmount === 0) {
    context.fillStyle = "#94A3B8";
    context.font = "500 12px sans-serif";
    context.textAlign = "center";
    context.fillText("No Expenses", centerX, centerY + 4);
    chartLegend.innerHTML = "";
    return;
  }

  let startAngle = -Math.PI / 2;
  let legendHTML = "";
  const categories = Object.keys(categoryTotals);

  categories.forEach((category) => {
    const amount = categoryTotals[category];
    const sliceAngle = (amount / totalExpenseAmount) * 2 * Math.PI;
    const categoryColor = CATEGORY_COLORS[category] || "#2563EB";

    context.beginPath();
    context.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
    context.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
    context.closePath();
    context.fillStyle = categoryColor;
    context.fill();

    startAngle += sliceAngle;

    const percentage = Math.round((amount / totalExpenseAmount) * 100);
    legendHTML += `
      <div class="legend-item">
        <span class="dot" style="background:${categoryColor}"></span>
        <span class="cat-name">${category}</span>
        <span class="cat-pct">${percentage}%</span>
      </div>
    `;
  });

  chartLegend.innerHTML = legendHTML;
}

function updateScreen() {
  updateHeaderDate();
  updateTotals();
  showTransactions();
  renderExpenseChart();
}

if (transactionDate) transactionDate.value = getTodayString();

updateScreen();