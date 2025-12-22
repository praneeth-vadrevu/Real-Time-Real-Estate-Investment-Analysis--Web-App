import React from 'react';
import { SavedProperty } from '../context/PropertiesContext';
import './PropertyComparison.css';

/**
 * Props for the PropertyComparison component.
 */
interface PropertyComparisonProps {
  properties: SavedProperty[];
  onClose: () => void;
}

/**
 * Property comparison component.
 * Displays side-by-side comparison of multiple properties in a table format.
 * Shows key metrics, financial data, and property details for easy comparison.
 */
const PropertyComparison: React.FC<PropertyComparisonProps> = ({ properties, onClose }) => {
  /**
   * Formats a number as US currency.
   * Returns 'N/A' for undefined or null values.
   */
  const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  /**
   * Formats a decimal number as percentage.
   * Returns 'N/A' for undefined or null values.
   */
  const formatPercentage = (value?: number): string => {
    if (value === undefined || value === null) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  /**
   * Converts strategy code to display label.
   */
  const getStrategyLabel = (strategy: string) => {
    switch (strategy) {
      case 'rental': return 'Rental';
      case 'brrrr': return 'BRRRR';
      case 'flip': return 'Flip';
      case 'wholesale': return 'Wholesale';
      default: return strategy;
    }
  };

  /**
   * Returns color code for strategy badge display.
   */
  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'rental': return '#3b82f6';
      case 'brrrr': return '#10b981';
      case 'flip': return '#f59e0b';
      case 'wholesale': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  if (properties.length === 0) {
    return (
      <div className="comparison-overlay">
        <div className="comparison-modal">
          <div className="comparison-header">
            <h2>Compare Properties</h2>
            <button onClick={onClose} className="close-button">
              ×
            </button>
          </div>
          <div className="comparison-empty">
            <p>No properties to compare. Please add properties first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="comparison-overlay" onClick={onClose}>
      <div className="comparison-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comparison-header">
          <h2>Compare Properties ({properties.length})</h2>
            <button onClick={onClose} className="close-button">
              ×
            </button>
        </div>

        <div className="comparison-content">
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="comparison-row-header">Property</th>
                  {properties.map((prop, index) => (
                    <th key={prop.id} className="comparison-property-header">
                      <div className="property-header-content">
                        {prop.image && (
                          <img 
                            src={prop.image} 
                            alt={prop.address}
                            className="property-thumbnail"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div className="property-header-info">
                          <div 
                            className="strategy-badge"
                            style={{ backgroundColor: getStrategyColor(prop.strategy) }}
                          >
                            {getStrategyLabel(prop.strategy)}
                          </div>
                          <div className="property-address">{prop.address}</div>
                          <div className="property-location">
                            {prop.city}, {prop.state} {prop.zipCode}
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Basic Information */}
                <tr className="comparison-section-header">
                  <td colSpan={properties.length + 1}>Basic Information</td>
                </tr>
                
                <tr>
                  <td className="comparison-row-header">Property Type</td>
                  {properties.map(prop => (
                    <td key={prop.id}>{prop.propertyType || 'N/A'}</td>
                  ))}
                </tr>

                <tr>
                  <td className="comparison-row-header">Bedrooms</td>
                  {properties.map(prop => (
                    <td key={prop.id}>{prop.bedrooms || 'N/A'}</td>
                  ))}
                </tr>

                <tr>
                  <td className="comparison-row-header">Bathrooms</td>
                  {properties.map(prop => (
                    <td key={prop.id}>{prop.bathrooms || 'N/A'}</td>
                  ))}
                </tr>

                <tr>
                  <td className="comparison-row-header">Living Area (sqft)</td>
                  {properties.map(prop => (
                    <td key={prop.id}>
                      {prop.livingArea ? prop.livingArea.toLocaleString() : 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Financial Information */}
                <tr className="comparison-section-header">
                  <td colSpan={properties.length + 1}>Financial Information</td>
                </tr>

                <tr>
                  <td className="comparison-row-header">List Price</td>
                  {properties.map(prop => (
                    <td key={prop.id} className="comparison-value">
                      {formatCurrency(prop.price)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="comparison-row-header">Purchase Price</td>
                  {properties.map(prop => (
                    <td key={prop.id} className="comparison-value">
                      {formatCurrency(prop.purchasePrice)}
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyComparison;

