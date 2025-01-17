
function calculateCapital() {
  // Input values
  const income = parseFloat(document.getElementById('income').value);
  const returnRate = parseFloat(document.getElementById('returnRate').value) / 100;
  const inflationRate = parseFloat(document.getElementById('inflationRate').value) / 100;
  const years = parseInt(document.getElementById('years').value);

  // Calculate monthly return rate
  const monthlyReturnRate = Math.pow(1 + returnRate, 1 / 12) - 1;

  // Arrays to store data for chart and table
  let balances = [];
  let incomes = [];
  let yearLabels = [];
  let totalCapital = 0;
  let accountBalance = 0;

  // Loop to calculate income and account balance for each year
  for (let year = 1; year <= years; year++) {
    const annualIncome = income * Math.pow(1 + inflationRate, year - 1);
    const monthlyIncome = annualIncome / 12;
    let yearTotal = 0;

    for (let month = 1; month <= 12; month++) {
      const monthsElapsed = (year - 1) * 12 + month;
      const presentValue = monthlyIncome / Math.pow(1 + monthlyReturnRate, monthsElapsed);
      totalCapital += presentValue;
      yearTotal += presentValue;
    }

    accountBalance += (accountBalance * returnRate) - annualIncome;
    balances.push(accountBalance > 0 ? accountBalance : 0);
    incomes.push(annualIncome);
    yearLabels.push(`Year ${year}`);
  }

  // Display total capital needed
  document.getElementById('result').textContent = 
    `Total Retirement Capital Needed: $${totalCapital.toFixed(2)}`;

  // Populate chart
  const ctx = document.getElementById('chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: yearLabels,
      datasets: [
        {
          label: 'Account Balance',
          data: balances,
          borderColor: 'blue',
          fill: false,
        },
        {
          label: 'Income',
          data: incomes,
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
  tableHTML += '<tr><th>Year</th><th>Income ($)</th><th>Account Balance ($)</th></tr>';
  for (let i = 0; i < years; i++) {
    tableHTML += `<tr><td>${yearLabels[i]}</td><td>${incomes[i].toFixed(2)}</td><td>${balances[i].toFixed(2)}</td></tr>`;
  }
  tableHTML += '</table>';
  tableContainer.innerHTML = tableHTML;
}
