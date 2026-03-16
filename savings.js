function getNumber(id) {
  const field = document.getElementById(id);
  return Number(field?.value ?? 0);
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

function calculateSavings() {
  const initialDeposit = getNumber("initialDeposit");
  const monthlyContribution = getNumber("monthlyContribution");
  const annualRate = getNumber("annualRate");
  const years = getNumber("years");

  if (initialDeposit < 0 || monthlyContribution < 0 || annualRate < 0 || years <= 0) {
    setValidationMessage("Please use valid values. Deposit/contribution/rate cannot be negative, and years must be greater than 0.");
    return;
  }

  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;

  let balance = initialDeposit;
  for (let i = 0; i < months; i += 1) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
  }

  const totalContributions = initialDeposit + monthlyContribution * months;
  const interestEarned = balance - totalContributions;
  const monthlyPace = balance / months;

  setText("futureValueResult", formatCurrency(balance));
  setText("contributionsResult", formatCurrency(totalContributions));
  setText("interestEarnedResult", formatCurrency(interestEarned));
  setText("monthlyPaceResult", formatCurrency(monthlyPace));
  setValidationMessage("");
}

function resetForm() {
  const defaults = {
    initialDeposit: 5000,
    monthlyContribution: 300,
    annualRate: 4.5,
    years: 10
  };

  Object.entries(defaults).forEach(([id, value]) => {
    const field = document.getElementById(id);
    if (field) field.value = value;
  });

  setValidationMessage("");
  calculateSavings();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("savingsForm");
  const resetBtn = document.getElementById("resetBtn");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      calculateSavings();
    });

    form.querySelectorAll("input").forEach((field) => {
      field.addEventListener("input", calculateSavings);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetForm);
  }

  calculateSavings();
});
