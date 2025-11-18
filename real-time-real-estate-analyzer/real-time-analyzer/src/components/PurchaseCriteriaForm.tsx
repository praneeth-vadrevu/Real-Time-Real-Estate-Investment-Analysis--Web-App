import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';

interface PurchaseCriteriaFormProps {
  strategy: 'rental' | 'brrrr' | 'flip' | 'wholesale';
  onClose: () => void;
  onSave: (criteria: PurchaseCriteria) => void;
}

interface PurchaseCriteria {
  // Property Criteria
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minSquareFeet?: number;
  maxSquareFeet?: number;
  propertyTypes: string[];
  minYearBuilt?: number;
  maxYearBuilt?: number;
  
  // Location Criteria
  states: string[];
  cities: string[];
  zipCodes: string[];
  neighborhoods: string[];
  
  // Financial Criteria
  minCashFlow?: number;
  minCapRate?: number;
  minCashOnCash?: number;
  minDSCR?: number;
  maxVacancyRate?: number;
  
  // Analysis Options
  includeNOICalculation: boolean;
  includeCashFlowProjection: boolean;
  includeIRRCalculation: boolean;
  includeEquityMultiple: boolean;
  includeExitAnalysis: boolean;
  includeMarketAnalysis: boolean;
  includeComparableProperties: boolean;
  
  // Filters
  showOnlyDeals: boolean;
  showOnlyCashFlowPositive: boolean;
  showOnlyHighROI: boolean;
  minROIThreshold?: number;
}

export default function PurchaseCriteriaForm({ strategy, onClose, onSave }: PurchaseCriteriaFormProps) {
  const [criteria, setCriteria] = useState<PurchaseCriteria>({
    propertyTypes: [],
    states: [],
    cities: [],
    zipCodes: [],
    neighborhoods: [],
    includeNOICalculation: true,
    includeCashFlowProjection: true,
    includeIRRCalculation: false,
    includeEquityMultiple: false,
    includeExitAnalysis: false,
    includeMarketAnalysis: true,
    includeComparableProperties: true,
    showOnlyDeals: false,
    showOnlyCashFlowPositive: false,
    showOnlyHighROI: false,
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

  const propertyTypes = [
    'Single Family',
    'Multi-Family',
    'Condo',
    'Townhouse',
    'Apartment',
    'Commercial',
    'Land',
    'Other'
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const handleInputChange = (field: keyof PurchaseCriteria, value: any) => {
    setCriteria(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: keyof PurchaseCriteria, value: string) => {
    setCriteria(prev => {
      const currentArray = (prev[field] as string[]) || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleCheckboxChange = (field: keyof PurchaseCriteria) => {
    setCriteria(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(criteria);
    onClose();
  };

  return (
    <div className="property-form-container">
      <div className="property-form-header">
        <h2>Purchase Criteria - {getStrategyTitle()}</h2>
        <button onClick={onClose} className="close-button">×</button>
      </div>

      <form onSubmit={handleSubmit} className="property-form">
        {/* Property Criteria Section */}
        <div className="form-section">
          <div className="section-header">
            <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3>1. Property Criteria</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Min Price ($)</label>
              <input
                type="number"
                value={criteria.minPrice || ''}
                onChange={(e) => handleInputChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Max Price ($)</label>
              <input
                type="number"
                value={criteria.maxPrice || ''}
                onChange={(e) => handleInputChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Min Bedrooms</label>
              <input
                type="number"
                value={criteria.minBedrooms || ''}
                onChange={(e) => handleInputChange('minBedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Max Bedrooms</label>
              <input
                type="number"
                value={criteria.maxBedrooms || ''}
                onChange={(e) => handleInputChange('maxBedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Any"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Min Bathrooms</label>
              <input
                type="number"
                step="0.5"
                value={criteria.minBathrooms || ''}
                onChange={(e) => handleInputChange('minBathrooms', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Max Bathrooms</label>
              <input
                type="number"
                step="0.5"
                value={criteria.maxBathrooms || ''}
                onChange={(e) => handleInputChange('maxBathrooms', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Any"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Min Square Feet</label>
              <input
                type="number"
                value={criteria.minSquareFeet || ''}
                onChange={(e) => handleInputChange('minSquareFeet', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Max Square Feet</label>
              <input
                type="number"
                value={criteria.maxSquareFeet || ''}
                onChange={(e) => handleInputChange('maxSquareFeet', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Any"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Min Year Built</label>
              <input
                type="number"
                value={criteria.minYearBuilt || ''}
                onChange={(e) => handleInputChange('minYearBuilt', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="1900"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="form-group">
              <label>Max Year Built</label>
              <input
                type="number"
                value={criteria.maxYearBuilt || ''}
                onChange={(e) => handleInputChange('maxYearBuilt', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder={new Date().getFullYear().toString()}
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
          
          <div className="form-group full-width">
            <label>Property Types</label>
            <div className="checkbox-grid">
              {propertyTypes.map(type => (
                <label key={type} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={criteria.propertyTypes.includes(type)}
                    onChange={() => handleArrayToggle('propertyTypes', type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Location Criteria Section */}
        <div className="form-section">
          <div className="section-header">
            <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3>2. Location Criteria</h3>
          </div>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group full-width">
              <label>States</label>
              <div className="checkbox-grid">
                {states.map(state => (
                  <label key={state} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={criteria.states.includes(state)}
                      onChange={() => handleArrayToggle('states', state)}
                    />
                    <span>{state}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Cities (comma-separated)</label>
                <input
                  type="text"
                  value={criteria.cities.join(', ')}
                  onChange={(e) => handleInputChange('cities', e.target.value.split(',').map(c => c.trim()).filter(c => c))}
                  placeholder="Boston, Cambridge, Somerville"
                />
              </div>
              <div className="form-group">
                <label>ZIP Codes (comma-separated)</label>
                <input
                  type="text"
                  value={criteria.zipCodes.join(', ')}
                  onChange={(e) => handleInputChange('zipCodes', e.target.value.split(',').map(z => z.trim()).filter(z => z))}
                  placeholder="02130, 02131, 02134"
                />
              </div>
              <div className="form-group">
                <label>Neighborhoods (comma-separated)</label>
                <input
                  type="text"
                  value={criteria.neighborhoods.join(', ')}
                  onChange={(e) => handleInputChange('neighborhoods', e.target.value.split(',').map(n => n.trim()).filter(n => n))}
                  placeholder="Jamaica Plain, Back Bay, Beacon Hill"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Criteria Section */}
        <div className="form-section">
          <div className="section-header">
            <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>3. Financial Criteria</h3>
          </div>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Min Monthly Cash Flow ($)</label>
              <input
                type="number"
                value={criteria.minCashFlow || ''}
                onChange={(e) => handleInputChange('minCashFlow', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Min Cap Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={criteria.minCapRate || ''}
                onChange={(e) => handleInputChange('minCapRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Min Cash-on-Cash Return (%)</label>
              <input
                type="number"
                step="0.1"
                value={criteria.minCashOnCash || ''}
                onChange={(e) => handleInputChange('minCashOnCash', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Min DSCR</label>
              <input
                type="number"
                step="0.01"
                value={criteria.minDSCR || ''}
                onChange={(e) => handleInputChange('minDSCR', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="1.0"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Max Vacancy Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={criteria.maxVacancyRate || ''}
                onChange={(e) => handleInputChange('maxVacancyRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="10"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Analysis Options Section */}
        <div className="form-section">
          <div className="section-header">
            <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3>4. Analysis Options</h3>
          </div>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Select which analysis options to include in your customized analysis:</label>
              <div className="checkbox-list">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={criteria.includeNOICalculation}
                    onChange={() => handleCheckboxChange('includeNOICalculation')}
                  />
                  <span>NOI (Net Operating Income) Calculation</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={criteria.includeCashFlowProjection}
                    onChange={() => handleCheckboxChange('includeCashFlowProjection')}
                  />
                  <span>Cash Flow Projection</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={criteria.includeIRRCalculation}
                    onChange={() => handleCheckboxChange('includeIRRCalculation')}
                  />
                  <span>IRR (Internal Rate of Return) Calculation</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={criteria.includeEquityMultiple}
                    onChange={() => handleCheckboxChange('includeEquityMultiple')}
                  />
                  <span>Equity Multiple Calculation</span>
                </label>
              </div>
            </div>
            <div className="form-group">
              <label style={{ visibility: 'hidden' }}>Spacer</label>
              <div className="checkbox-list">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={criteria.includeExitAnalysis}
                    onChange={() => handleCheckboxChange('includeExitAnalysis')}
                  />
                  <span>Exit Analysis</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={criteria.includeMarketAnalysis}
                    onChange={() => handleCheckboxChange('includeMarketAnalysis')}
                  />
                  <span>Market Analysis</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={criteria.includeComparableProperties}
                    onChange={() => handleCheckboxChange('includeComparableProperties')}
                  />
                  <span>Comparable Properties Analysis</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="form-section">
          <div className="section-header">
            <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h3>5. Filters</h3>
          </div>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <div className="checkbox-list">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={criteria.showOnlyDeals}
                    onChange={() => handleCheckboxChange('showOnlyDeals')}
                  />
                  <span>Show only deals that meet all criteria</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={criteria.showOnlyCashFlowPositive}
                    onChange={() => handleCheckboxChange('showOnlyCashFlowPositive')}
                  />
                  <span>Show only cash flow positive properties</span>
                </label>
              </div>
            </div>
            <div className="form-group">
              <div className="checkbox-list">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={criteria.showOnlyHighROI}
                    onChange={() => handleCheckboxChange('showOnlyHighROI')}
                  />
                  <span>Show only high ROI properties</span>
                </label>
                {criteria.showOnlyHighROI && (
                  <div className="form-group" style={{ marginTop: '0.5rem', marginLeft: '2rem' }}>
                    <label>Min ROI Threshold (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={criteria.minROIThreshold || ''}
                      onChange={(e) => handleInputChange('minROIThreshold', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="10"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save Criteria
          </button>
        </div>
      </form>
    </div>
  );
}

