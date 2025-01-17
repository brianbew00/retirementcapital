
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

  // Calculate total capital needed using beginning-of-period logic (monthly)
  let totalCapital = 0;
  const monthlyData = [];
  for (let year = 1; year <= years; year++) {
    for (let month = 1; month <= 12; month++) {
      const monthsElapsed = (year - 1) * 12 + month - 1;
      const monthlyIncome = income * Math.pow(1 + inflationRate, monthsElapsed / 12) / 12;
      const presentValue = monthlyIncome / Math.pow(1 + monthlyReturnRate, monthsElapsed);
      totalCapital += presentValue;

      monthlyData.push({
        year: year,
        month: month,
        income: monthlyIncome,
        presentValue: presentValue,
      });
    }
  }

  // Arrays to store data for the table and calculations
  let accountBalance = totalCapital;
  const monthlyTableData = [];

  // Add initial row
  monthlyTableData.push({
    year: "Initial",
    month: "",
    income: 0,
    afterTaxReturn: 0,
    accountBalance: accountBalance.toFixed(2),
  });

  // Populate monthly table data
  monthlyData.forEach(({ year, month, income }) => {
    const afterTaxReturn = (accountBalance - income) * monthlyReturnRate;
    monthlyTableData.push({
      year: year,
      month: month,
      income: income.toFixed(2),
      afterTaxReturn: afterTaxReturn.toFixed(2),
      accountBalance: accountBalance.toFixed(2),
    });
    accountBalance = accountBalance - income + afterTaxReturn;
  });

  // Aggregate annual data
  const annualTableData = [];
  for (let year = 1; year <= years; year++) {
    const annualData = monthlyTableData.filter(row => row.year === year && row.month !== "");
    const annualIncome = annualData.reduce((sum, row) => sum + parseFloat(row.income), 0);
    const annualReturns = annualData.reduce((sum, row) => sum + parseFloat(row.afterTaxReturn), 0);
    const endingBalance = parseFloat(annualData[11]?.accountBalance || 0);
    annualTableData.push({
      year: year,
      income: annualIncome.toFixed(2),
      afterTaxReturn: annualReturns.toFixed(2),
      accountBalance: endingBalance.toFixed(2),
    });
  }

  // Display total capital needed
  document.getElementById('result').textContent = 
    `Total Retirement Capital Needed: $${totalCapital.toFixed(2)}`;

  // Populate chart
  const ctx = document.getElementById('chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthlyTableData.map(row => row.month ? `Year ${row.year} Month ${row.month}` : "Initial"),
      datasets: [
        {
          label: 'Account Balance',
          data: monthlyTableData.map(row => parseFloat(row.accountBalance)),
          borderColor: 'blue',
          fill: false,
        },
        {
          label: 'Income',
          data: monthlyTableData.map(row => parseFloat(row.income)),
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

  // Populate monthly table
  const tableContainer = document.getElementById('table-container');
  let monthlyTableHTML = '<table border="1" style="width: 100%; border-collapse: collapse;">';
  monthlyTableHTML += '<tr><th>Year</th><th>Month</th><th>Income ($)</th><th>After-Tax Return ($)</th><th>Account Balance ($)</th></tr>';
  monthlyTableData.forEach(row => {
    monthlyTableHTML += `<tr><td>${row.year}</td><td>${row.month}</td><td>${row.income}</td><td>${row.afterTaxReturn}</td><td>${row.accountBalance}</td></tr>`;
  });
  monthlyTableHTML += '</table>';

  // Populate annual table
  let annualTableHTML = '<table border="1" style="width: 100%; border-collapse: collapse;">';
  annualTableHTML += '<tr><th>Year</th><th>Income ($)</th><th>After-Tax Return ($)</th><th>Account Balance ($)</th></tr>';
  annualTableData.forEach(row => {
    annualTableHTML += `<tr><td>${row.year}</td><td>${row.income}</td><td>${row.afterTaxReturn}</td><td>${row.accountBalance}</td></tr>`;
  });
  annualTableHTML += '</table>';

  tableContainer.innerHTML = `
    <button onclick="toggleTable('monthly')">View Monthly</button>
    <button onclick="toggleTable('annual')">View Annual</button>
    <div id="monthly-table" style="display: block;">${monthlyTableHTML}</div>
    <div id="annual-table" style="display: none;">${annualTableHTML}</div>
  `;
}

function toggleTable(view) {
  document.getElementById('monthly-table').style.display = view === 'monthly' ? 'block' : 'none';
  document.getElementById('annual-table').style.display = view === 'annual' ? 'block' : 'none';
}
