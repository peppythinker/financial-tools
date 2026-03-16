function getNumber(id) {
  const el = document.getElementById(id);
  return Number(el?.value ?? 0);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
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

function getMonthsToPayoff(principal, monthlyRate, basePayment, extraPayment) {
  let remaining = principal;
  const payment = basePayment + extraPayment;
  let months = 0;

  while (remaining > 0 && months < 1200) {
    const interest = remaining * monthlyRate;
    let principalPaid = payment - interest;

    if (monthlyRate === 0) {
      principalPaid = payment;
    }

    if (principalPaid <= 0) {
      return null;
    }

    remaining -= principalPaid;
    months += 1;
  }

  return months;
}

function calculateLoan() {
  const loanAmount = getNumber("loanAmount");
  const annualRate = getNumber("interestRate");
  const termYears = getNumber("loanTermYears");
  const extraPayment = getNumber("extraPayment");

  if (loanAmount <= 0 || annualRate < 0 || termYears <= 0 || extraPayment < 0) {
    setValidationMessage("Please enter valid values. Amount/term must be greater than 0; rates and extra payment cannot be negative.");
    return;
  }

  const monthlyRate = annualRate / 100 / 12;
  const months = termYears * 12;

  let monthlyPayment;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / months;
  } else {
    monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }

  const totalPaid = monthlyPayment * months;
  const totalInterest = totalPaid - loanAmount;
  const payoffMonths = getMonthsToPayoff(loanAmount, monthlyRate, monthlyPayment, extraPayment);

  setText("monthlyResult", formatCurrency(monthlyPayment + extraPayment));
  setText("totalPaidResult", formatCurrency(totalPaid + extraPayment * months));
  setText("totalInterestResult", formatCurrency(totalInterest));
  setText("payoffTimeResult", payoffMonths ? `${payoffMonths} months` : "Payment too low");

  setValidationMessage("");
}

function resetForm() {
  const defaults = {
    loanAmount: 25000,
    interestRate: 7.25,
    loanTermYears: 5,
    extraPayment: 0
  };

  Object.entries(defaults).forEach(([id, value]) => {
    const field = document.getElementById(id);
    if (field) field.value = value;
  });

  setValidationMessage("");
  calculateLoan();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loanForm");
  const resetButton = document.getElementById("resetBtn");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      calculateLoan();
    });

    form.querySelectorAll("input").forEach((field) => {
      field.addEventListener("input", calculateLoan);
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", resetForm);
  }

  calculateLoan();
});
