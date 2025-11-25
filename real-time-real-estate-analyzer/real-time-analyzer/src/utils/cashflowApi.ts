import { PropertyData } from '../components/PropertyForm';

export interface CashflowRequest {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  fmv?: number;
  offerPrice?: number;
  annualAppreciation?: number;
  grossRentsAnnual?: number;
  numberOfUnits?: number;
  parkingAnnual?: number;
  storageAnnual?: number;
  laundryVendingAnnual?: number;
  otherIncomeAnnual?: number;
  vacancyRate?: number;
  managementRate?: number;
  repairsRate?: number;
  propertyTaxes?: number;
  insurance?: number;
  electricity?: number;
  gas?: number;
  waterSewer?: number;
  cable?: number;
  caretaking?: number;
  advertising?: number;
  associationFees?: number;
  pest?: number;
  security?: number;
  trash?: number;
  misc?: number;
  commonAreaMaintenance?: number;
  capitalImprovements?: number;
  accounting?: number;
  legal?: number;
  badDebts?: number;
  evictions?: number;
  otherExpenses?: number;
  firstPrincipal?: number;
  firstRateAnnual?: number;
  firstAmortYears?: number;
  firstInterestOnlyYears?: number;
  secondPrincipal?: number;
  secondRateAnnual?: number;
  secondAmortYears?: number;
  otherMonthlyFinancingCosts?: number;
  repairs?: number;
  repairsContingency?: number;
  lenderFee?: number;
  brokerFee?: number;
  environmentals?: number;
  inspections?: number;
  appraisals?: number;
  transferTax?: number;
  legalClose?: number;
  otherClosingCosts?: number;
  holdYears?: number;
  rentGrowth?: number;
  expenseGrowth?: number;
  exitCostRate?: number;
  managementBase?: string;
}

export interface CashflowResponse {
  summary: {
    rpp?: number;
    cashToClose?: number;
    totalIncomeY1?: number;
    vacancyLossY1?: number;
    egiY1?: number;
    totalExpensesY1?: number;
    noiY1?: number;
    annualDebtServiceY1?: number;
    dscrY1?: number;
    capRatePPY1?: number;
    capRateFMVY1?: number;
    grmY1?: number;
    avgRentPerUnitY1?: number;
    monthlyProfitY1?: number;
    cashflowPerUnitPerMonthY1?: number;
    ltvFMV?: number;
    ltppPP?: number;
    cashOnCashY1?: number;
    equityROIY1?: number;
    appreciationROIY1?: number;
    totalROIY1?: number;
    forcedAppreciationROIY1?: number;
    irr?: number;
    equityMultiple?: number;
    saleProceedsNet?: number;
  };
  projection: Array<{
    year: number;
    totalIncome?: number;
    vacancyLoss?: number;
    egi?: number;
    management?: number;
    repairsRateBased?: number;
    totalExpenses?: number;
    noi?: number;
    debtService?: number;
    cashFlowBeforeTax?: number;
    endingBalanceFirst?: number;
    endingBalanceSecond?: number;
    propertyValue?: number;
  }>;
}

export function mapPropertyDataToCashflowRequest(formData: PropertyData): CashflowRequest {
  const getValue = (value: number | ''): number | undefined => {
    return typeof value === 'number' ? value : undefined;
  };

  const getPercent = (value: number | ''): number | undefined => {
    const num = getValue(value);
    return num !== undefined ? num / 100 : undefined;
  };

  return {
    address: formData.address || undefined,
    city: formData.city || undefined,
    state: formData.state || undefined,
    zip: formData.zipCode || undefined,
    fmv: getValue(formData.fairMarketValue),
    offerPrice: getValue(formData.offerPrice),
    annualAppreciation: getPercent(formData.annualAppreciationRate),
    grossRentsAnnual: getValue(formData.grossRents),
    numberOfUnits: typeof formData.numberOfUnits === 'number' ? formData.numberOfUnits : undefined,
    parkingAnnual: 0,
    storageAnnual: 0,
    laundryVendingAnnual: 0,
    otherIncomeAnnual: 0,
    vacancyRate: getPercent(formData.vacancyRate),
    managementRate: getPercent(formData.managementRate),
    repairsRate: getPercent(formData.repairsExpensePercent),
    propertyTaxes: getValue(formData.propertyTaxes),
    insurance: getValue(formData.insurance),
    electricity: getValue(formData.electricity),
    gas: 0,
    waterSewer: getValue(formData.waterSewer),
    cable: 0,
    caretaking: 0,
    advertising: getValue(formData.advertising),
    associationFees: 0,
    pest: getValue(formData.pestControl),
    security: getValue(formData.security),
    trash: 0,
    misc: getValue(formData.misc),
    commonAreaMaintenance: 0,
    capitalImprovements: 0,
    accounting: 0,
    legal: getValue(formData.legal),
    badDebts: 0,
    evictions: getValue(formData.evictions),
    otherExpenses: 0,
    firstPrincipal: getValue(formData.firstMtgPrincipleBorrowed),
    firstRateAnnual: getPercent(formData.firstMtgInterestRate),
    firstAmortYears: typeof formData.firstMtgAmortizationPeriod === 'number' 
      ? formData.firstMtgAmortizationPeriod : undefined,
    firstInterestOnlyYears: 0,
    secondPrincipal: 0,
    secondRateAnnual: 0,
    secondAmortYears: 0,
    otherMonthlyFinancingCosts: 0,
    repairs: getValue(formData.repairs),
    repairsContingency: 0,
    lenderFee: getValue(formData.lendersFee),
    brokerFee: getValue(formData.brokerFee),
    environmentals: 0,
    inspections: getValue(formData.inspectionsOrEngineerReport),
    appraisals: getValue(formData.appraisals),
    transferTax: getValue(formData.transferTax),
    legalClose: getValue(formData.legal),
    otherClosingCosts: 0,
    holdYears: 10,
    rentGrowth: 0.03,
    expenseGrowth: 0.03,
    exitCostRate: 0.06,
    managementBase: "EGI",
  };
}

export async function analyzeCashflow(request: CashflowRequest): Promise<CashflowResponse> {
  try {
    const response = await fetch('http://localhost:8080/api/analysis/cashflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 0 || response.status === 503 || response.status === 502) {
        throw new Error('BACKEND_NOT_RUNNING');
      }
      const errorText = await response.text();
      throw new Error(`Failed to analyze cashflow: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error calling cashflow API:', error);
    if (error.message === 'BACKEND_NOT_RUNNING' || error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
      throw new Error('Backend server is not running. Please start the backend server on port 8080.');
    }
    throw error;
  }
}

