 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/mortgage.js b/mortgage.js
index ab27af37043a08f69c40954f98aa3ebad9fb057a..f5e58030e1c3c570786a85186f5a854a2275045a 100644
--- a/mortgage.js
+++ b/mortgage.js
@@ -1,80 +1,128 @@
 function formatCurrency(value) {
   return new Intl.NumberFormat("en-US", {
     style: "currency",
     currency: "USD"
   }).format(value);
 }
 
+function formatPercent(value) {
+  return `${value.toFixed(1)}%`;
+}
+
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
 
+function setValidationMessage(message) {
+  const validationMessage = document.getElementById("validationMessage");
+
+  if (!message) {
+    validationMessage.hidden = true;
+    validationMessage.textContent = "";
+    return;
+  }
+
+  validationMessage.hidden = false;
+  validationMessage.textContent = message;
+}
+
 function calculateMortgage() {
   const homePrice = getNumberValue("homePrice");
   const downPayment = getNumberValue("downPayment");
   const interestRate = getNumberValue("interestRate");
   const loanTerm = parseInt(document.getElementById("loanTerm").value, 10) || 30;
   const propertyTax = getNumberValue("propertyTax");
   const insurance = getNumberValue("insurance");
   const hoa = getNumberValue("hoa");
   const pmi = getNumberValue("pmi");
 
-  const loanAmount = Math.max(homePrice - downPayment, 0);
-  const principalInterest = monthlyMortgagePayment(loanAmount, interestRate, loanTerm);
-  const monthlyTax = propertyTax / 12;
-  const monthlyInsurance = insurance / 12;
-  const totalMonthly = principalInterest + monthlyTax + monthlyInsurance + hoa + pmi;
+  if (downPayment > homePrice && homePrice > 0) {
+    setValidationMessage("Down payment is larger than the home price. Please adjust your values.");
+  } else {
+    setValidationMessage("");
+  }
+
+  const safeHomePrice = Math.max(homePrice, 0);
+  const safeDownPayment = Math.max(downPayment, 0);
+  const loanAmount = Math.max(safeHomePrice - safeDownPayment, 0);
+
+  const principalInterest = monthlyMortgagePayment(
+    loanAmount,
+    Math.max(interestRate, 0),
+    Math.max(loanTerm, 0)
+  );
+  const monthlyTax = Math.max(propertyTax, 0) / 12;
+  const monthlyInsurance = Math.max(insurance, 0) / 12;
+  const totalMonthly = principalInterest + monthlyTax + monthlyInsurance + Math.max(hoa, 0) + Math.max(pmi, 0);
 
   const totalPayments = loanTerm * 12;
   const totalPaidOnLoan = principalInterest * totalPayments;
   const totalInterestPaid = Math.max(totalPaidOnLoan - loanAmount, 0);
 
+  const downPaymentPercent = safeHomePrice > 0 ? (safeDownPayment / safeHomePrice) * 100 : 0;
+  const ltvPercent = safeHomePrice > 0 ? (loanAmount / safeHomePrice) * 100 : 0;
+
   document.getElementById("loanAmountResult").textContent = formatCurrency(loanAmount);
   document.getElementById("piResult").textContent = formatCurrency(principalInterest);
   document.getElementById("totalResult").textContent = formatCurrency(totalMonthly);
   document.getElementById("interestPaidResult").textContent = formatCurrency(totalInterestPaid);
 
   document.getElementById("breakdownPI").textContent = formatCurrency(principalInterest);
   document.getElementById("breakdownTax").textContent = formatCurrency(monthlyTax);
   document.getElementById("breakdownInsurance").textContent = formatCurrency(monthlyInsurance);
-  document.getElementById("breakdownHOA").textContent = formatCurrency(hoa);
-  document.getElementById("breakdownPMI").textContent = formatCurrency(pmi);
+  document.getElementById("breakdownHOA").textContent = formatCurrency(Math.max(hoa, 0));
+  document.getElementById("breakdownPMI").textContent = formatCurrency(Math.max(pmi, 0));
   document.getElementById("breakdownTotal").textContent = formatCurrency(totalMonthly);
+
+  document.getElementById("downPaymentPercent").textContent = formatPercent(downPaymentPercent);
+  document.getElementById("ltvPercent").textContent = formatPercent(ltvPercent);
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
 
+  setValidationMessage("");
   calculateMortgage();
 }
 
-document.getElementById("calculateBtn").addEventListener("click", calculateMortgage);
+document.getElementById("mortgageForm").addEventListener("submit", (event) => {
+  event.preventDefault();
+  calculateMortgage();
+});
+
 document.getElementById("resetBtn").addEventListener("click", resetForm);
 
+document
+  .querySelectorAll("#mortgageForm input, #mortgageForm select")
+  .forEach((field) => {
+    field.addEventListener("input", calculateMortgage);
+    field.addEventListener("change", calculateMortgage);
+  });
+
 calculateMortgage();
 
EOF
)
