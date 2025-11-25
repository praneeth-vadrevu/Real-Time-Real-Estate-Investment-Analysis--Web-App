import { PropertyData } from '../components/PropertyForm';
import { CashflowResponse, mapPropertyDataToCashflowRequest, analyzeCashflow } from './cashflowApi';

export async function generatePropertyReport(formData: PropertyData): Promise<string> {
  const request = mapPropertyDataToCashflowRequest(formData);
  const result = await analyzeCashflow(request);
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value?: number): string => {
    if (value === undefined || value === null) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatNumber = (value?: number): string => {
    if (value === undefined || value === null) return 'N/A';
    return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const s = result.summary;
  const address = `${formData.address || 'N/A'}, ${formData.city || 'N/A'}, ${formData.state || 'N/A'} ${formData.zipCode || ''}`;

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Property Investment Analysis Report - ${reportDate}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #f8fafc;
      padding: 2rem;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 3rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border-radius: 0.5rem;
    }
    .header {
      border-bottom: 3px solid #1e40af;
      padding-bottom: 2rem;
      margin-bottom: 2rem;
    }
    .header h1 {
      color: #1e40af;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .header .meta {
      color: #6b7280;
      font-size: 1rem;
    }
    .property-info {
      background: #eff6ff;
      padding: 1.5rem;
      border-radius: 0.5rem;
      margin-bottom: 2rem;
    }
    .property-info h2 {
      color: #1e40af;
      margin-bottom: 1rem;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .metric-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      text-align: center;
    }
    .metric-card.positive {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    .metric-card.negative {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }
    .metric-label {
      font-size: 0.875rem;
      opacity: 0.9;
      margin-bottom: 0.5rem;
    }
    .metric-value {
      font-size: 1.75rem;
      font-weight: 700;
    }
    .section {
      margin-bottom: 2rem;
    }
    .section h3 {
      color: #111827;
      font-size: 1.5rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e5e7eb;
    }
    .detail-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }
    .detail-table th,
    .detail-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-table th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    .detail-table td {
      color: #111827;
    }
    .projection-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    .projection-table th,
    .projection-table td {
      padding: 0.5rem;
      text-align: right;
      border: 1px solid #e5e7eb;
    }
    .projection-table th {
      background-color: #1e40af;
      color: white;
      font-weight: 600;
      text-align: center;
    }
    .projection-table tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
        padding: 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Property Investment Analysis Report</h1>
      <div class="meta">Generated on ${reportDate}</div>
    </div>

    <div class="property-info">
      <h2>${address}</h2>
      <p><strong>Property Type:</strong> ${formData.propertyType || 'N/A'}</p>
      ${formData.bedrooms ? `<p><strong>Bedrooms:</strong> ${formData.bedrooms}</p>` : ''}
      ${formData.bathrooms ? `<p><strong>Bathrooms:</strong> ${formData.bathrooms}</p>` : ''}
      ${formData.livingArea ? `<p><strong>Living Area:</strong> ${formData.livingArea.toLocaleString()} sqft</p>` : ''}
      ${formData.numberOfUnits ? `<p><strong>Number of Units:</strong> ${formData.numberOfUnits}</p>` : ''}
    </div>

    <div class="metrics-grid">
      <div class="metric-card ${(s.monthlyProfitY1 || 0) >= 0 ? 'positive' : 'negative'}">
        <div class="metric-label">Monthly Cash Flow</div>
        <div class="metric-value">${formatCurrency(s.monthlyProfitY1)}</div>
      </div>
      <div class="metric-card positive">
        <div class="metric-label">Cap Rate (Purchase Price)</div>
        <div class="metric-value">${formatPercentage(s.capRatePPY1)}</div>
      </div>
      <div class="metric-card positive">
        <div class="metric-label">Cash-on-Cash Return</div>
        <div class="metric-value">${formatPercentage(s.cashOnCashY1)}</div>
      </div>
      <div class="metric-card positive">
        <div class="metric-label">DSCR</div>
        <div class="metric-value">${formatNumber(s.dscrY1)}</div>
      </div>
      ${s.irr ? `
      <div class="metric-card positive">
        <div class="metric-label">IRR (${request.holdYears || 10} years)</div>
        <div class="metric-value">${formatPercentage(s.irr)}</div>
      </div>
      ` : ''}
      ${s.equityMultiple ? `
      <div class="metric-card positive">
        <div class="metric-label">Equity Multiple</div>
        <div class="metric-value">${formatNumber(s.equityMultiple)}x</div>
      </div>
      ` : ''}
    </div>

    <div class="section">
      <h3>Year 1 Financial Summary</h3>
      <table class="detail-table">
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Total Income</td>
          <td>${formatCurrency(s.totalIncomeY1)}</td>
        </tr>
        <tr>
          <td>Vacancy Loss</td>
          <td>${formatCurrency(s.vacancyLossY1)}</td>
        </tr>
        <tr>
          <td>Effective Gross Income (EGI)</td>
          <td>${formatCurrency(s.egiY1)}</td>
        </tr>
        <tr>
          <td>Total Operating Expenses</td>
          <td>${formatCurrency(s.totalExpensesY1)}</td>
        </tr>
        <tr>
          <td>Net Operating Income (NOI)</td>
          <td>${formatCurrency(s.noiY1)}</td>
        </tr>
        <tr>
          <td>Annual Debt Service</td>
          <td>${formatCurrency(s.annualDebtServiceY1)}</td>
        </tr>
        <tr>
          <td>Monthly Cash Flow</td>
          <td>${formatCurrency(s.monthlyProfitY1)}</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <h3>Investment Metrics</h3>
      <table class="detail-table">
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Offer Price</td>
          <td>${formatCurrency(request.offerPrice)}</td>
        </tr>
        <tr>
          <td>Real Purchase Price (RPP)</td>
          <td>${formatCurrency(s.rpp)}</td>
        </tr>
        <tr>
          <td>Cash to Close</td>
          <td>${formatCurrency(s.cashToClose)}</td>
        </tr>
        <tr>
          <td>Cap Rate (Purchase Price)</td>
          <td>${formatPercentage(s.capRatePPY1)}</td>
        </tr>
        ${s.capRateFMVY1 ? `
        <tr>
          <td>Cap Rate (FMV)</td>
          <td>${formatPercentage(s.capRateFMVY1)}</td>
        </tr>
        ` : ''}
        <tr>
          <td>Gross Rent Multiplier (GRM)</td>
          <td>${formatNumber(s.grmY1)}</td>
        </tr>
        <tr>
          <td>Cash-on-Cash Return</td>
          <td>${formatPercentage(s.cashOnCashY1)}</td>
        </tr>
        ${s.equityROIY1 ? `
        <tr>
          <td>Equity ROI</td>
          <td>${formatPercentage(s.equityROIY1)}</td>
        </tr>
        ` : ''}
        ${s.appreciationROIY1 ? `
        <tr>
          <td>Appreciation ROI</td>
          <td>${formatPercentage(s.appreciationROIY1)}</td>
        </tr>
        ` : ''}
        ${s.totalROIY1 ? `
        <tr>
          <td>Total ROI</td>
          <td>${formatPercentage(s.totalROIY1)}</td>
        </tr>
        ` : ''}
        ${s.forcedAppreciationROIY1 ? `
        <tr>
          <td>Forced Appreciation ROI</td>
          <td>${formatPercentage(s.forcedAppreciationROIY1)}</td>
        </tr>
        ` : ''}
        ${s.ltvFMV ? `
        <tr>
          <td>LTV (vs FMV)</td>
          <td>${formatPercentage(s.ltvFMV)}</td>
        </tr>
        ` : ''}
        ${s.ltppPP ? `
        <tr>
          <td>LTPP (vs Purchase Price)</td>
          <td>${formatPercentage(s.ltppPP)}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    ${result.projection.length > 0 ? `
    <div class="section">
      <h3>${request.holdYears || 10}-Year Projection</h3>
      <table class="projection-table">
        <thead>
          <tr>
            <th>Year</th>
            <th>Total Income</th>
            <th>EGI</th>
            <th>NOI</th>
            <th>Debt Service</th>
            <th>Cash Flow</th>
            <th>Property Value</th>
            <th>Loan Balance</th>
          </tr>
        </thead>
        <tbody>
          ${result.projection.map(row => `
          <tr>
            <td>${row.year}</td>
            <td>${formatCurrency(row.totalIncome)}</td>
            <td>${formatCurrency(row.egi)}</td>
            <td>${formatCurrency(row.noi)}</td>
            <td>${formatCurrency(row.debtService)}</td>
            <td>${formatCurrency(row.cashFlowBeforeTax)}</td>
            <td>${formatCurrency(row.propertyValue)}</td>
            <td>${formatCurrency((row.endingBalanceFirst || 0) + (row.endingBalanceSecond || 0))}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      ${s.saleProceedsNet !== undefined ? `
      <p style="margin-top: 1rem;"><strong>Net Sale Proceeds (Year ${request.holdYears || 10}):</strong> ${formatCurrency(s.saleProceedsNet)}</p>
      ` : ''}
    </div>
    ` : ''}

    <div class="footer">
      <p>Report generated by HouseHustle Real Estate Investment Analysis Platform</p>
      <p>Developed by: V S Praneeth • Xiangtao Fu • Sireesha Baratam</p>
      <p>&copy; ${new Date().getFullYear()} All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

export async function downloadReport(formData: PropertyData) {
  const html = await generatePropertyReport(formData);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `property-report-${formData.address?.replace(/\s+/g, '-') || 'property'}-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function printReport(formData: PropertyData) {
  const html = await generatePropertyReport(formData);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

