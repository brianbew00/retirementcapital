
function calculateCapital() {
  // Input values
  const income = parseFloat(document.getElementById('income').value);
  const returnRate = parseFloat(document.getElementById('returnRate').value) / 100;
  const inflationRate = parseFloat(document.getElementById('inflationRate').value) / 100;
  const years = parseInt(document.getElementById('years').value);

  // Calculate monthly return rate
  const monthlyReturnRate = Math.pow(1 + returnRate, 1 / 12) - 1;

  // Calculate total capital needed
  let totalCapital = 0;

  for (let year = 1; year <= years; year++) {
    const annualIncome = income * Math.pow(1 + inflationRate, year - 1);
    const monthlyIncome = annualIncome / 12;

    for (let month = 1; month <= 12; month++) {
      const monthsElapsed = (year - 1) * 12 + month;
      const presentValue = monthlyIncome / Math.pow(1 + monthlyReturnRate, monthsElapsed);
      totalCapital += presentValue;
    }
  }

  // Display result
  document.getElementById('result').textContent = 
    `Total Retirement Capital Needed: $${totalCapital.toFixed(2)}`;
}
