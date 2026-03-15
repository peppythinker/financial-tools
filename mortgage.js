function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function monthlyMortgagePayment(loanAmount, annualRate, years) {
  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = years * 12;

  if (totalPayments === 0) return 0;

  if (monthlyRate === 0) {
    return loanAmount / totalPayments;
  }

  return (
    loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1)
  );
}

function getNumberValue(id) {
  const el = document.getElementById(id);
  return el ? parseFloat(el.value) || 0 : 0;
}

function setValidationMessage(message) {
  const validationMessage = document.getElementById("validationMessage");
  if (!validationMessage) return;

  if (!message) {
    validationMessage.hidden = true;
    validationMessage.textContent = "";
    return;
  }

  validationMessage.hidden = false;
  validationMessage.textContent = message;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function calculateMortgage() {
  const homePrice = getNumberValue("homePrice");
  const downPayment = getNumberValue("downPayment");
  const interestRate = getNumberValue("interestRate");
  const loanTerm = parseInt(document.getElementById("loanTerm")?.value, 10) || 30;
  const propertyTax = getNumberValue("propertyTax");
  const insurance = getNumberValue("insurance");
  const hoa = getNumberValue("hoa");
  const pmi = getNumberValue("pmi");

  if (downPayment > homePrice && homePrice > 0) {
    setValidationMessage("Down payment is larger than the home price. Please adjust your values.");
  } else {
    setValidationMessage("");
  }

  const safeHomePrice = Math.max(homePrice, 0);
  const safeDownPayment = Math.max(downPayment, 0);
  const loanAmount = Math.max(safeHomePrice - safeDownPayment, 0);

  const principalInterest = monthlyMortgagePayment(
    loanAmount,
    Math.max(interestRate, 0),
    Math.max(loanTerm, 0)
  );

  const monthlyTax = Math.max(propertyTax, 0) / 12;
  const monthlyInsurance = Math.max(insurance, 0) / 12;
  const monthlyHoa = Math.max(hoa, 0);
  const monthlyPmi = Math.max(pmi, 0);

  const totalMonthly =
    principalInterest + monthlyTax + monthlyInsurance + monthlyHoa + monthlyPmi;

  const totalPayments = loanTerm * 12;
  const totalPaidOnLoan = principalInterest * totalPayments;
  const totalInterestPaid = Math.max(totalPaidOnLoan - loanAmount, 0);

  const downPaymentPercent =
    safeHomePrice > 0 ? (safeDownPayment / safeHomePrice) * 100 : 0;
  const ltvPercent =
    safeHomePrice > 0 ? (loanAmount / safeHomePrice) * 100 : 0;

  setText("loanAmountResult", formatCurrency(loanAmount));
  setText("piResult", formatCurrency(principalInterest));
  setText("totalResult", formatCurrency(totalMonthly));
  setText("interestPaidResult", formatCurrency(totalInterestPaid));

  setText("breakdownPI", formatCurrency(principalInterest));
  setText("breakdownTax", formatCurrency(monthlyTax));
  setText("breakdownInsurance", formatCurrency(monthlyInsurance));
  setText("breakdownHOA", formatCurrency(monthlyHoa));
  setText("breakdownPMI", formatCurrency(monthlyPmi));
  setText("breakdownTotal", formatCurrency(totalMonthly));

  setText("downPaymentPercent", formatPercent(downPaymentPercent));
  setText("ltvPercent", formatPercent(ltvPercent));
}

function resetForm() {
  const defaults = {
    homePrice: 400000,
    downPayment: 80000,
    interestRate: 6.5,
    loanTerm: 30,
    propertyTax: 4800,
    insurance: 1200,
    hoa: 75,
    pmi: 0
  };

  Object.entries(defaults).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });

  setValidationMessage("");
  calculateMortgage();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("mortgageForm");
  const resetBtn = document.getElementById("resetBtn");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      calculateMortgage();
    });

    form.querySelectorAll("input, select").forEach((field) => {
      field.addEventListener("input", calculateMortgage);
      field.addEventListener("change", calculateMortgage);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetForm);
  }

  calculateMortgage();
});
