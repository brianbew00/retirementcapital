document.addEventListener("DOMContentLoaded", () => {
  calculateCapital(); // Trigger calculation on page load with default values
});

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function calculateCapital() {
  // Input values
  const income = parseFloat(document.getElementById('income').value);
  const returnRate = parseFloat(document.getElementById('returnRate').value) / 100;
  const inflationRate = parseFloat(document.getElementById('inflationRate').value) / 100;
  const years = parseInt(document.getElementById('years').value);

  // Calculate monthly return rate
  const monthlyReturnRate = Math.pow(1 + returnRate, 1 / 12) - 1;

  // Calculate total capital needed using beginning-of-period logic with annual inflation adjustment
  let totalCapital = 0;
  const monthlyData = [];
  for (let year = 1; year <= years; year++) {
    const annualIncome = income * Math.pow(1 + inflationRate, year - 1);
    const monthlyIncome = annualIncome / 12;

    for (let month = 1; month <= 12; month++) {
      const monthsElapsed = (year - 1) * 12 + month - 1;
      const presentValue = monthlyIncome / Math.pow(1 + monthlyReturnRate, monthsElapsed);
      totalCapital += presentValue;

      monthlyData.push({
        year: year,
        month: month,
        income: month === 1 ? annualIncome / 12 : monthlyIncome,
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
    income: null, // No income for the initial row
    afterTaxReturn: null, // No returns for the initial row
    accountBalance: accountBalance,
  });

  // Populate monthly table data with corrected offsets
  monthlyData.forEach(({ year, month, income }, index) => {
    const previousBalance = index === 0 ? totalCapital : Math.max(0, parseFloat(monthlyTableData[index].accountBalance));
    const afterTaxReturn = Math.max(0, (previousBalance - income) * monthlyReturnRate);
    const currentBalance = Math.max(0, previousBalance - income + afterTaxReturn);

    monthlyTableData.push({
      year: year,
      month: month,
      income: income,
      afterTaxReturn: afterTaxReturn,
      accountBalance: currentBalance,
    });
  });

  // Aggregate annual data, including the initial row
  const annualTableData = [
    {
      year: "Initial",
      income: null, // No income for the initial row
      afterTaxReturn: null, // No returns for the initial row
      accountBalance: totalCapital,
    },
  ];

  for (let year = 1; year <= years; year++) {
    const annualData = monthlyTableData.filter(row => row.year === year && row.month !== "");
    const annualIncome = annualData.reduce((sum, row) => sum + parseFloat(row.income), 0);
    const annualReturns = annualData.reduce((sum, row) => sum + parseFloat(row.afterTaxReturn), 0);
    const endingBalance = Math.max(0, parseFloat(annualData[11]?.accountBalance || 0));
    annualTableData.push({
      year: year,
      income: annualIncome,
      afterTaxReturn: annualReturns,
      accountBalance: endingBalance,
    });
  }

  // Display total capital needed
  document.getElementById('result').textContent = 
    `Total Retirement Capital Needed: ${formatCurrency(totalCapital)}`;

  // Populate chart based on annual data
  const ctx = document.getElementById('chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: annualTableData.map(row => row.year !== "Initial" ? `Year ${row.year}` : "Initial"),
      datasets: [
        {
          label: 'Account Balance',
          data: annualTableData.map(row => row.accountBalance),
          borderColor: 'blue',
          fill: false,
          yAxisID: 'y',
        },
        {
          label: 'Income',
          data: annualTableData.map(row => row.income || 0),
          borderColor: 'green',
          fill: false,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Account Balance ($)',
          },
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Income ($)',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    },
  });

  // Populate monthly table
  const tableContainer = document.getElementById('table-container');
  let monthlyTableHTML = '<table border="1" style="width: 100%; border-collapse: collapse;">';
  monthlyTableHTML += '<tr><th>Year</th><th>Month</th><th>Income ($)</th><th>After-Tax Return ($)</th><th>Account Balance ($)</th></tr>';
  monthlyTableData.forEach(row => {
    monthlyTableHTML += `<tr><td>${row.year}</td><td>${row.month}</td><td>${row.income ? formatCurrency(row.income) : ""}</td><td>${row.afterTaxReturn ? formatCurrency(row.afterTaxReturn) : ""}</td><td>${formatCurrency(row.accountBalance)}</td></tr>`;
  });
  monthlyTableHTML += '</table>';

  // Populate annual table
  let annualTableHTML = '<table border="1" style="width: 100%; border-collapse: collapse;">';
  annualTableHTML += '<tr><th>Year</th><th>Income ($)</th><th>After-Tax Return ($)</th><th>Account Balance ($)</th></tr>';
  annualTableData.forEach(row => {
    annualTableHTML += `<tr><td>${row.year}</td><td>${row.income ? formatCurrency(row.income) : ""}</td><td>${row.afterTaxReturn ? formatCurrency(row.afterTaxReturn) : ""}</td><td>${formatCurrency(row.accountBalance)}</td></tr>`;
  });
  annualTableHTML += '</table>';

  tableContainer.innerHTML = `
    <button onclick="toggleTable('annual')">View Annual</button>
    <button onclick="toggleTable('monthly')">View Monthly</button>
    <div id="annual-table" style="display: block;">${annualTableHTML}</div>
    <div id="monthly-table" style="display: none;">${monthlyTableHTML}</div>
  `;
}

function toggleTable(view) {
  document.getElementById('monthly-table').style.display = view === 'monthly' ? 'block' : 'none';
  document.getElementById('annual-table').style.display = view === 'annual' ? 'block' : 'none';
}
