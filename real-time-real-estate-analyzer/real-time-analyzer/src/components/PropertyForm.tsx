import React, { useState } from 'react';
import { FiDownload, FiHome } from 'react-icons/fi';
import PropertySearch from './PropertySearch';

interface PropertyFormProps {
  strategy: 'rental' | 'brrrr' | 'flip' | 'wholesale';
  onClose: () => void;
}

interface PropertyData {
  // Basic Information
  zpid?: string;
  
  // 1. Property Info
  address: string;
  city: string;
  state: string;
  zipCode: string;
  fairMarketValue: number | '';
  vacancyRate: number | '';
  advertisingCostPerVacancy: number | '';
  numberOfUnits: number | '';
  annualAppreciationRate: number | '';
  
  // 2. Purchase Info
  offerPrice: number | '';
  repairs: number | '';
  repairsContingency: number | '';
  lendersFee: number | '';
  brokerFee: number | '';
  environmentals: number | '';
  inspectionsOrEngineerReport: number | '';
  appraisals: number | '';
  misc: number | ''; // Site Visit, Title Ins, Corp, Assign Fee
  transferTax: number | '';
  legal: number | '';
  realPurchasePrice: number | ''; // PPP (calculated)
  
  // 3. Financing (Monthly)
  firstMtgPrincipleBorrowed: number | '';
  firstMtgAmortizationPeriod: number | '';
  firstMtgCMHCFeePercent: number | '';
  firstMtgTotalPrinciple: number | '';
  firstMtgTotalMonthlyPayment: number | '';
  interestOnlyPrincipleAmount: number | '';
  interestOnlyInterestRate: number | '';
  interestOnlyTotalPaymentRate: number | '';
  otherMonthlyFinancingCost: number | '';
  cashRequiredToClose: number | '';
  
  // 4. Income (Annual)
  grossRents: number | '';
  parking: number | '';
  storage: number | '';
  laundryVending: number | '';
  otherIncome: number | '';
  
  // 5. Operating Expenses (Annual)
  propertyTaxes: number | '';
  insurance: number | '';
  repairsExpense: number | '';
  electricity: number | '';
  gas: number | '';
  lawnSnowMaintenance: number | '';
  waterSewer: number | '';
  cable: number | '';
  management: number | '';
  caretaking: number | '';
  advertising: number | '';
  associationFees: number | '';
  pestControl: number | '';
  security: number | '';
  trashRemoval: number | '';
  miscellaneous: number | '';
  commonAreaMaintenance: number | '';
  capitalImprovements: number | '';
  accounting: number | '';
  legalExpense: number | '';
  badDebts: number | '';
  otherExpense: number | '';
  evictions: number | '';
  
  // Legacy fields (for backward compatibility with API)
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  lotSize?: number;
  yearBuilt?: number;
  zestimate?: number;
  rentEstimate?: number;
  annualPropertyTax?: number;
  monthlyHoa?: number;
  arv?: number;
  rehabBudget?: number;
  daysOnMarket?: number;
  pricePerSqft?: number;
  heating?: string;
  cooling?: string;
  parkingFeatures?: string;
}

export default function PropertyForm({ strategy, onClose }: PropertyFormProps) {
  const [inputMethod, setInputMethod] = useState<'select' | 'import' | 'manual' | 'search'>('select');
  const [formData, setFormData] = useState<PropertyData>({
    // Property Info
    address: '',
    city: '',
    state: '',
    zipCode: '',
    fairMarketValue: '',
    vacancyRate: 5,
    advertisingCostPerVacancy: 0,
    numberOfUnits: 1,
    annualAppreciationRate: 3,
    
    // Purchase Info
    offerPrice: '',
    repairs: 0,
    repairsContingency: 0,
    lendersFee: 0,
    brokerFee: 0,
    environmentals: 0,
    inspectionsOrEngineerReport: 0,
    appraisals: 0,
    misc: 0,
    transferTax: 0,
    legal: 0,
    realPurchasePrice: '',
    
    // Financing (Monthly)
    firstMtgPrincipleBorrowed: '',
    firstMtgAmortizationPeriod: '',
    firstMtgCMHCFeePercent: 0,
    firstMtgTotalPrinciple: '',
    firstMtgTotalMonthlyPayment: '',
    interestOnlyPrincipleAmount: 0,
    interestOnlyInterestRate: 0,
    interestOnlyTotalPaymentRate: 0,
    otherMonthlyFinancingCost: 0,
    cashRequiredToClose: '',
    
    // Income (Annual)
    grossRents: '',
    parking: 0,
    storage: 0,
    laundryVending: 0,
    otherIncome: 0,
    
    // Operating Expenses (Annual)
    propertyTaxes: '',
    insurance: 0,
    repairsExpense: 0,
    electricity: 0,
    gas: 0,
    lawnSnowMaintenance: 0,
    waterSewer: 0,
    cable: 0,
    management: 0,
    caretaking: 0,
    advertising: 0,
    associationFees: 0,
    pestControl: 0,
    security: 0,
    trashRemoval: 0,
    miscellaneous: 0,
    commonAreaMaintenance: 0,
    capitalImprovements: 0,
    accounting: 0,
    legalExpense: 0,
    badDebts: 0,
    otherExpense: 0,
    evictions: 0,
  });

  const getStrategyTitle = () => {
    switch (strategy) {
      case 'rental': return 'Rental Property';
      case 'brrrr': return 'BRRRR Property';
      case 'flip': return 'Fix & Flip Property';
      case 'wholesale': return 'Wholesale Deal';
      default: return 'Property';
    }
  };

  const handlePropertySelect = async (zpid: string) => {
    try {
      // Call backend API to fetch property details
      const response = await fetch(`http://localhost:8080/api/properties/${zpid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch property data');
      }

      const property = await response.json();
      
      // Debug: Log the raw address from API
      console.log('Raw address from API:', property.address);
      
      // Parse address into components
      // Address format can be:
      // "Street, City, State ZIP" or "Street, City State ZIP" or just "Full Address"
      let streetAddress = '';
      let city = '';
      let state = '';
      let zipCode = '';

      if (property.address) {
        const addressParts = property.address.split(',').map((part: string) => part.trim());
        console.log('Address parts after split:', addressParts);
        
        if (addressParts.length >= 3) {
          // Format: "Street, City, State ZIP"
          streetAddress = addressParts[0];
          city = addressParts[1];
          
          // Parse "State ZIP" - state is usually 2 letters, ZIP is 5 digits
          const lastPart = addressParts[2];
          console.log('Trying to parse state/ZIP from:', lastPart);
          const stateZipMatch = lastPart.match(/([A-Z]{2})\s+(\d{5})/);
          
          if (stateZipMatch) {
            state = stateZipMatch[1];
            zipCode = stateZipMatch[2];
            console.log('✅ Regex matched! State:', state, 'ZIP:', zipCode);
          } else {
            console.log('❌ Regex did not match, using fallback');
            // Fallback: split by space and take last as ZIP, second to last as state
            const parts = lastPart.split(/\s+/).filter(p => p.length > 0);
            console.log('Fallback parts:', parts);
            if (parts.length >= 2) {
              zipCode = parts[parts.length - 1];
              state = parts[parts.length - 2];
              console.log('Fallback result - State:', state, 'ZIP:', zipCode);
            }
          }
        } else if (addressParts.length === 2) {
          // Format: "Street, City State ZIP"
          streetAddress = addressParts[0];
          const cityStatePart = addressParts[1];
          console.log('Trying 2-part format. City/State/ZIP part:', cityStatePart);
          
          // Try to extract city, state, and ZIP
          const match = cityStatePart.match(/^(.+?)\s+([A-Z]{2})\s+(\d{5})$/);
          if (match) {
            city = match[1];
            state = match[2];
            zipCode = match[3];
            console.log('✅ 2-part regex matched! City:', city, 'State:', state, 'ZIP:', zipCode);
          } else {
            console.log('❌ 2-part regex did not match');
          }
        } else {
          // Single string - use as is
          console.log('Single string address, no parsing');
          streetAddress = property.address;
        }
      }
      
      // Debug: Log parsed address components
      console.log('Parsed address components:', { streetAddress, city, state, zipCode });
      
      // Map API response to form data
      const newFormData: PropertyData = {
        zpid: property.zpid,
        
        // Property Info
        address: streetAddress,
        city: city,
        state: state,
        zipCode: zipCode,
        fairMarketValue: property.zestimate || property.price || '',
        vacancyRate: 5, // Default
        advertisingCostPerVacancy: 0, // Default
        numberOfUnits: 1, // Default
        annualAppreciationRate: 3, // Default
        
        // Purchase Info
        offerPrice: property.price || '',
        repairs: 0,
        repairsContingency: 0,
        lendersFee: 0,
        brokerFee: 0,
        environmentals: 0,
        inspectionsOrEngineerReport: 0,
        appraisals: 0,
        misc: 0,
        transferTax: 0,
        legal: 0,
        realPurchasePrice: property.price || '',
        
        // Financing (Monthly) - Defaults
        firstMtgPrincipleBorrowed: '',
        firstMtgAmortizationPeriod: '',
        firstMtgCMHCFeePercent: 0,
        firstMtgTotalPrinciple: '',
        firstMtgTotalMonthlyPayment: '',
        interestOnlyPrincipleAmount: 0,
        interestOnlyInterestRate: 0,
        interestOnlyTotalPaymentRate: 0,
        otherMonthlyFinancingCost: 0,
        cashRequiredToClose: '',
        
        // Income (Annual) - Can estimate from API
        grossRents: property.rentEstimate ? property.rentEstimate * 12 : '',
        parking: 0,
        storage: 0,
        laundryVending: 0,
        otherIncome: 0,
        
        // Operating Expenses (Annual) - Can estimate from API
        propertyTaxes: property.annualTax || '',
        insurance: 0,
        repairsExpense: 0,
        electricity: 0,
        gas: 0,
        lawnSnowMaintenance: 0,
        waterSewer: 0,
        cable: 0,
        management: 0,
        caretaking: 0,
        advertising: 0,
        associationFees: property.hoaMonthly ? property.hoaMonthly * 12 : 0,
        pestControl: 0,
        security: 0,
        trashRemoval: 0,
        miscellaneous: 0,
        commonAreaMaintenance: 0,
        capitalImprovements: 0,
        accounting: 0,
        legalExpense: 0,
        badDebts: 0,
        otherExpense: 0,
        evictions: 0,
        
        // Legacy fields (for reference)
        propertyType: property.propertyType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        livingArea: property.livingArea,
        lotSize: property.lotAreaValue,
        yearBuilt: property.yearBuilt,
        zestimate: property.zestimate,
        rentEstimate: property.rentEstimate,
        annualPropertyTax: property.annualTax,
        monthlyHoa: property.hoaMonthly,
        pricePerSqft: property.pricePerSqft,
        daysOnMarket: property.daysOnZillow,
        heating: property.heating?.join(', '),
        cooling: property.cooling?.join(', '),
        parkingFeatures: property.parkingFeatures?.join(', '),
        arv: (strategy === 'brrrr' || strategy === 'flip') ? (property.zestimate || property.price) : undefined,
        rehabBudget: (strategy === 'brrrr' || strategy === 'flip') ? 0 : undefined,
      };
      
      console.log('📝 Setting form data:', newFormData);
      console.log('📍 Location fields:', {
        address: newFormData.address,
        city: newFormData.city,
        state: newFormData.state,
        zipCode: newFormData.zipCode
      });
      
      setFormData(newFormData);
      
      // Switch to form view for review/editing
      setInputMethod('manual');
    } catch (error) {
      console.error('Error fetching property:', error);
      alert('Failed to import property data. Please make sure the backend server is running on port 8080.');
    }
  };

  const handleInputChange = (field: keyof PropertyData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send data to analysis service
    console.log('Form submitted:', { strategy, data: formData });
    alert(`${getStrategyTitle()} analysis data submitted!`);
  };

  // Selection Screen
  if (inputMethod === 'select') {
    return (
      <div className="property-form-container">
        <div className="property-form-header">
          <h2>Add New {getStrategyTitle()}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="input-method-selection">
          <div className="selection-card" onClick={() => setInputMethod('search')}>
            <div className="card-icon import-icon">
              <FiDownload style={{ width: '2.5rem', height: '2.5rem' }} />
            </div>
            <h3>Import</h3>
            <p>Search and select properties to automatically import data from Zillow</p>
            <div className="card-badge">Recommended</div>
          </div>

          <div className="selection-card" onClick={() => setInputMethod('manual')}>
            <div className="card-icon manual-icon">
              <svg style={{ width: '2.5rem', height: '2.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3>Enter Manually</h3>
            <p>Input all property details manually for custom analysis</p>
          </div>
        </div>
      </div>
    );
  }

  // Property Search Screen
  if (inputMethod === 'search') {
    return (
      <PropertySearch
        onPropertySelect={handlePropertySelect}
        onCancel={() => setInputMethod('select')}
      />
    );
  }

  // Manual Entry Form
  return (
    <div className="property-form-container">
      <div className="property-form-header">
        <h2>{formData.zpid ? 'Review' : 'Enter'} {getStrategyTitle()} Details</h2>
        <button onClick={onClose} className="close-button">×</button>
      </div>

      <form onSubmit={handleSubmit} className="property-form">
        {/* 1. Property Info Section */}
        <div className="form-section">
          <div className="section-header">
            <FiHome className="section-icon" />
            <h3>1. Property Info</h3>
          </div>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main Street, City, State ZIP"
                required
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                maxLength={2}
                placeholder="MA"
                required
              />
            </div>
            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                maxLength={5}
                required
              />
            </div>
            <div className="form-group">
              <label>Fair Market Value ($)</label>
              <input
                type="number"
                value={formData.fairMarketValue}
                onChange={(e) => handleInputChange('fairMarketValue', parseFloat(e.target.value) || '')}
                placeholder="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Vacancy Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.vacancyRate}
                onChange={(e) => handleInputChange('vacancyRate', parseFloat(e.target.value) || '')}
                placeholder="5"
              />
            </div>
            <div className="form-group">
              <label>Advertising Cost per Vacancy ($)</label>
              <input
                type="number"
                value={formData.advertisingCostPerVacancy}
                onChange={(e) => handleInputChange('advertisingCostPerVacancy', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Number of Units</label>
              <input
                type="number"
                value={formData.numberOfUnits}
                onChange={(e) => handleInputChange('numberOfUnits', parseInt(e.target.value) || '')}
                placeholder="1"
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Annual Appreciation Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.annualAppreciationRate}
                onChange={(e) => handleInputChange('annualAppreciationRate', parseFloat(e.target.value) || '')}
                placeholder="3"
              />
            </div>
          </div>
        </div>

        {/* 2. Purchase Info Section */}
        <div className="form-section">
          <div className="section-header">
            <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>2. Purchase Info</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Offer Price ($)</label>
              <input
                type="number"
                value={formData.offerPrice}
                onChange={(e) => handleInputChange('offerPrice', parseFloat(e.target.value) || '')}
                placeholder="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Repairs ($)</label>
              <input
                type="number"
                value={formData.repairs}
                onChange={(e) => handleInputChange('repairs', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Repairs Contingency ($)</label>
              <input
                type="number"
                value={formData.repairsContingency}
                onChange={(e) => handleInputChange('repairsContingency', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Lenders Fee ($)</label>
              <input
                type="number"
                value={formData.lendersFee}
                onChange={(e) => handleInputChange('lendersFee', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Broker Fee ($)</label>
              <input
                type="number"
                value={formData.brokerFee}
                onChange={(e) => handleInputChange('brokerFee', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Environmentals ($)</label>
              <input
                type="number"
                value={formData.environmentals}
                onChange={(e) => handleInputChange('environmentals', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Inspections or Engineer Report ($)</label>
              <input
                type="number"
                value={formData.inspectionsOrEngineerReport}
                onChange={(e) => handleInputChange('inspectionsOrEngineerReport', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Appraisals ($)</label>
              <input
                type="number"
                value={formData.appraisals}
                onChange={(e) => handleInputChange('appraisals', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Misc (Site Visit, Title Ins, Corp, Assign Fee) ($)</label>
              <input
                type="number"
                value={formData.misc}
                onChange={(e) => handleInputChange('misc', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Transfer Tax ($)</label>
              <input
                type="number"
                value={formData.transferTax}
                onChange={(e) => handleInputChange('transferTax', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Legal ($)</label>
              <input
                type="number"
                value={formData.legal}
                onChange={(e) => handleInputChange('legal', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Real Purchase Price (PPP) ($)</label>
              <input
                type="number"
                value={formData.realPurchasePrice}
                onChange={(e) => handleInputChange('realPurchasePrice', parseFloat(e.target.value) || '')}
                placeholder="0"
                disabled
                title="Calculated automatically"
              />
            </div>
          </div>
        </div>

        {/* 3. Financing (Monthly) Section */}
        <div className="form-section">
          <div className="section-header">
            <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3>3. Financing (Monthly)</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>1st Mtg Principle Borrowed ($)</label>
              <input
                type="number"
                value={formData.firstMtgPrincipleBorrowed}
                onChange={(e) => handleInputChange('firstMtgPrincipleBorrowed', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>1st Mtg Amortization Period (Years)</label>
              <input
                type="number"
                value={formData.firstMtgAmortizationPeriod}
                onChange={(e) => handleInputChange('firstMtgAmortizationPeriod', parseFloat(e.target.value) || '')}
                placeholder="30"
              />
            </div>
            <div className="form-group">
              <label>1st Mtg CMHC Fee (% of Principle)</label>
              <input
                type="number"
                step="0.01"
                value={formData.firstMtgCMHCFeePercent}
                onChange={(e) => handleInputChange('firstMtgCMHCFeePercent', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>1st Mtg Total Principle (Incl. CMHC Fees) ($)</label>
              <input
                type="number"
                value={formData.firstMtgTotalPrinciple}
                onChange={(e) => handleInputChange('firstMtgTotalPrinciple', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>1st Mtg Total Monthly Payment ($)</label>
              <input
                type="number"
                value={formData.firstMtgTotalMonthlyPayment}
                onChange={(e) => handleInputChange('firstMtgTotalMonthlyPayment', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Interest Only Principle Amount ($)</label>
              <input
                type="number"
                value={formData.interestOnlyPrincipleAmount}
                onChange={(e) => handleInputChange('interestOnlyPrincipleAmount', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Interest Only Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.interestOnlyInterestRate}
                onChange={(e) => handleInputChange('interestOnlyInterestRate', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Interest Only Total Payment Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.interestOnlyTotalPaymentRate}
                onChange={(e) => handleInputChange('interestOnlyTotalPaymentRate', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Other Monthly Financing Cost ($)</label>
              <input
                type="number"
                value={formData.otherMonthlyFinancingCost}
                onChange={(e) => handleInputChange('otherMonthlyFinancingCost', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Cash Required to Close ($)</label>
              <input
                type="number"
                value={formData.cashRequiredToClose}
                onChange={(e) => handleInputChange('cashRequiredToClose', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* 4. Income (Annual) Section */}
        <div className="form-section">
          <div className="section-header">
            <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>4. Income (Annual)</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Gross Rents ($)</label>
              <input
                type="number"
                value={formData.grossRents}
                onChange={(e) => handleInputChange('grossRents', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Parking ($)</label>
              <input
                type="number"
                value={formData.parking}
                onChange={(e) => handleInputChange('parking', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Storage ($)</label>
              <input
                type="number"
                value={formData.storage}
                onChange={(e) => handleInputChange('storage', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Laundry/Vending ($)</label>
              <input
                type="number"
                value={formData.laundryVending}
                onChange={(e) => handleInputChange('laundryVending', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Other ($)</label>
              <input
                type="number"
                value={formData.otherIncome}
                onChange={(e) => handleInputChange('otherIncome', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* 5. Operating Expenses (Annual) Section */}
        <div className="form-section">
          <div className="section-header">
            <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3>5. Operating Expenses (Annual)</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Property Taxes ($)</label>
              <input
                type="number"
                value={formData.propertyTaxes}
                onChange={(e) => handleInputChange('propertyTaxes', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Insurance ($)</label>
              <input
                type="number"
                value={formData.insurance}
                onChange={(e) => handleInputChange('insurance', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Repairs ($)</label>
              <input
                type="number"
                value={formData.repairsExpense}
                onChange={(e) => handleInputChange('repairsExpense', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Electricity ($)</label>
              <input
                type="number"
                value={formData.electricity}
                onChange={(e) => handleInputChange('electricity', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Gas ($)</label>
              <input
                type="number"
                value={formData.gas}
                onChange={(e) => handleInputChange('gas', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Lawn / Snow Maintenance ($)</label>
              <input
                type="number"
                value={formData.lawnSnowMaintenance}
                onChange={(e) => handleInputChange('lawnSnowMaintenance', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Water/Sewer ($)</label>
              <input
                type="number"
                value={formData.waterSewer}
                onChange={(e) => handleInputChange('waterSewer', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Cable ($)</label>
              <input
                type="number"
                value={formData.cable}
                onChange={(e) => handleInputChange('cable', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Management ($)</label>
              <input
                type="number"
                value={formData.management}
                onChange={(e) => handleInputChange('management', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Caretaking ($)</label>
              <input
                type="number"
                value={formData.caretaking}
                onChange={(e) => handleInputChange('caretaking', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Advertising ($)</label>
              <input
                type="number"
                value={formData.advertising}
                onChange={(e) => handleInputChange('advertising', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Association Fees ($)</label>
              <input
                type="number"
                value={formData.associationFees}
                onChange={(e) => handleInputChange('associationFees', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Pest Control ($)</label>
              <input
                type="number"
                value={formData.pestControl}
                onChange={(e) => handleInputChange('pestControl', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Security ($)</label>
              <input
                type="number"
                value={formData.security}
                onChange={(e) => handleInputChange('security', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Trash Removal ($)</label>
              <input
                type="number"
                value={formData.trashRemoval}
                onChange={(e) => handleInputChange('trashRemoval', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Miscellaneous ($)</label>
              <input
                type="number"
                value={formData.miscellaneous}
                onChange={(e) => handleInputChange('miscellaneous', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Common Area Maintenance ($)</label>
              <input
                type="number"
                value={formData.commonAreaMaintenance}
                onChange={(e) => handleInputChange('commonAreaMaintenance', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Capital Improvements ($)</label>
              <input
                type="number"
                value={formData.capitalImprovements}
                onChange={(e) => handleInputChange('capitalImprovements', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Accounting ($)</label>
              <input
                type="number"
                value={formData.accounting}
                onChange={(e) => handleInputChange('accounting', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Legal ($)</label>
              <input
                type="number"
                value={formData.legalExpense}
                onChange={(e) => handleInputChange('legalExpense', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Bad Debts ($)</label>
              <input
                type="number"
                value={formData.badDebts}
                onChange={(e) => handleInputChange('badDebts', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Other ($)</label>
              <input
                type="number"
                value={formData.otherExpense}
                onChange={(e) => handleInputChange('otherExpense', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Evictions ($)</label>
              <input
                type="number"
                value={formData.evictions}
                onChange={(e) => handleInputChange('evictions', parseFloat(e.target.value) || '')}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Analyze {getStrategyTitle()}
          </button>
        </div>
      </form>
    </div>
  );
}

