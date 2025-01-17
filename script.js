
document.addEventListener("DOMContentLoaded", () => {
  calculateCapital(); // Trigger calculation on page load with default values
});

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

  // Arrays to store data for the table
  let tableData = [];
  let accountBalance = totalCapital;

  // Populate table data
  for (let year = 1; year <= years; year++) {
    const annualIncome = income * Math.pow(1 + inflationRate, year - 1);
    const afterTaxReturn = (accountBalance - annualIncome) * returnRate;
    tableData.push({
      year: year,
      income: year === 1 ? 0 : annualIncome.toFixed(2),
      afterTaxReturn: year === 1 ? 0 : afterTaxReturn.toFixed(2),
      accountBalance: accountBalance.toFixed(2),
    });
    accountBalance = accountBalance - annualIncome + afterTaxReturn;
  }

  // Display total capital needed
  document.getElementById('result').textContent = 
    `Total Retirement Capital Needed: $${totalCapital.toFixed(2)}`;

  // Populate chart
  const ctx = document.getElementById('chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: tableData.map(row => `Year ${row.year}`),
      datasets: [
        {
          label: 'Account Balance',
          data: tableData.map(row => row.accountBalance),
          borderColor: 'blue',
          fill: false,
        },
        {
          label: 'Income',
          data: tableData.map(row => row.income),
          borderColor: 'green',
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Populate table
  const tableContainer = document.getElementById('table-container');
  let tableHTML = '<table border="1" style="width: 100%; border-collapse: collapse;">';
  tableHTML += '<tr><th>Year</th><th>Income ($)</th><th>After-Tax Return ($)</th><th>Account Balance ($)</th></tr>';
  tableData.forEach(row => {
    tableHTML += `<tr><td>${row.year}</td><td>${row.income}</td><td>${row.afterTaxReturn}</td><td>${row.accountBalance}</td></tr>`;
  });
  tableHTML += '</table>';
  tableContainer.innerHTML = tableHTML;
}
