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

function calculateInvestment() {
  const initialInvestment = getNumber("initialInvestment");
  const monthlyContribution = getNumber("monthlyContribution");
  const annualReturn = getNumber("annualReturn");
  const years = getNumber("years");

  if (initialInvestment < 0 || monthlyContribution < 0 || annualReturn < 0 || years <= 0) {
    setValidationMessage("Please enter valid values. Investment, contribution, and return cannot be negative, and years must be greater than 0.");
    return;
  }

  const months = years * 12;
  const monthlyRate = annualReturn / 100 / 12;

  let portfolioValue = initialInvestment;
  for (let i = 0; i < months; i += 1) {
    portfolioValue = portfolioValue * (1 + monthlyRate) + monthlyContribution;
  }

  const totalContributions = initialInvestment + monthlyContribution * months;
  const investmentGain = portfolioValue - totalContributions;
  const annualGrowth = (portfolioValue - initialInvestment) / years;

  setText("futureValueResult", formatCurrency(portfolioValue));
  setText("contributionsResult", formatCurrency(totalContributions));
  setText("gainResult", formatCurrency(investmentGain));
  setText("annualGrowthResult", formatCurrency(annualGrowth));
  setValidationMessage("");
}

function resetForm() {
  const defaults = {
    initialInvestment: 10000,
    monthlyContribution: 500,
    annualReturn: 7,
    years: 20
  };

  Object.entries(defaults).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (node) node.value = value;
  });

  setValidationMessage("");
  calculateInvestment();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("investmentForm");
  const resetBtn = document.getElementById("resetBtn");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      calculateInvestment();
    });

    form.querySelectorAll("input").forEach((field) => {
      field.addEventListener("input", calculateInvestment);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetForm);
  }

  calculateInvestment();
});
