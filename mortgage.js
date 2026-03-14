function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function monthlyMortgagePayment(loanAmount, annualRate, years) {
  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = years * 12;

  if (totalPayments === 0) {
    return 0;
  }

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
  return parseFloat(document.getElementById(id).value) || 0;
}

function calculateMortgage() {
  const homePrice = getNumberValue("homePrice");
  const downPayment = getNumberValue("downPayment");
  const interestRate = getNumberValue("interestRate");
  const loanTerm = parseInt(document.getElementById("loanTerm").value, 10) || 30;
  const propertyTax = getNumberValue("propertyTax");
  const insurance = getNumberValue("insurance");
  const hoa = getNumberValue("hoa");
  const pmi = getNumberValue("pmi");

  const loanAmount = Math.max(homePrice - downPayment, 0);
  const principalInterest = monthlyMortgagePayment(loanAmount, interestRate, loanTerm);
  const monthlyTax = propertyTax / 12;
  const monthlyInsurance = insurance / 12;
  const totalMonthly = principalInterest + monthlyTax + monthlyInsurance + hoa + pmi;

  const totalPayments = loanTerm * 12;
  const totalPaidOnLoan = principalInterest * totalPayments;
  const totalInterestPaid = Math.max(totalPaidOnLoan - loanAmount, 0);

  document.getElementById("loanAmountResult").textContent = formatCurrency(loanAmount);
  document.getElementById("piResult").textContent = formatCurrency(principalInterest);
  document.getElementById("totalResult").textContent = formatCurrency(totalMonthly);
  document.getElementById("interestPaidResult").textContent = formatCurrency(totalInterestPaid);

  document.getElementById("breakdownPI").textContent = formatCurrency(principalInterest);
  document.getElementById("breakdownTax").textContent = formatCurrency(monthlyTax);
  document.getElementById("breakdownInsurance").textContent = formatCurrency(monthlyInsurance);
  document.getElementById("breakdownHOA").textContent = formatCurrency(hoa);
  document.getElementById("breakdownPMI").textContent = formatCurrency(pmi);
  document.getElementById("breakdownTotal").textContent = formatCurrency(totalMonthly);
}

function resetForm() {
  document.getElementById("homePrice").value = 400000;
  document.getElementById("downPayment").value = 80000;
  document.getElementById("interestRate").value = 6.5;
  document.getElementById("loanTerm").value = 30;
  document.getElementById("propertyTax").value = 4800;
  document.getElementById("insurance").value = 1200;
  document.getElementById("hoa").value = 75;
  document.getElementById("pmi").value = 0;

  calculateMortgage();
}

document.getElementById("calculateBtn").addEventListener("click", calculateMortgage);
document.getElementById("resetBtn").addEventListener("click", resetForm);

calculateMortgage();
