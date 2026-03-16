function getNumber(id) {
  const node = document.getElementById(id);
  return Number(node?.value ?? 0);
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function setValidationMessage(message) {
  const box = document.getElementById("validationMessage");
  if (!box) return;

  if (message) {
    box.hidden = false;
    box.textContent = message;
  } else {
    box.hidden = true;
    box.textContent = "";
  }
}

function calculateTip() {
  const billAmount = getNumber("billAmount");
  const tipPercent = getNumber("tipPercent");
  const peopleCount = getNumber("peopleCount");

  if (billAmount < 0 || tipPercent < 0 || peopleCount <= 0) {
    setValidationMessage("Please enter valid values. Bill/tip cannot be negative and number of people must be at least 1.");
    return;
  }

  const tipAmount = billAmount * (tipPercent / 100);
  const totalBill = billAmount + tipAmount;
  const perPerson = totalBill / peopleCount;
  const billPerPerson = billAmount / peopleCount;

  setText("tipAmountResult", formatCurrency(tipAmount));
  setText("totalBillResult", formatCurrency(totalBill));
  setText("perPersonResult", formatCurrency(perPerson));
  setText("billPerPersonResult", formatCurrency(billPerPerson));

  setValidationMessage("");
}

function resetForm() {
  const defaults = {
    billAmount: 120,
    tipPercent: 18,
    peopleCount: 3
  };

  Object.entries(defaults).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (node) node.value = value;
  });

  setValidationMessage("");
  calculateTip();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("tipForm");
  const resetBtn = document.getElementById("resetBtn");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      calculateTip();
    });

    form.querySelectorAll("input").forEach((field) => {
      field.addEventListener("input", calculateTip);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetForm);
  }

  calculateTip();
});
