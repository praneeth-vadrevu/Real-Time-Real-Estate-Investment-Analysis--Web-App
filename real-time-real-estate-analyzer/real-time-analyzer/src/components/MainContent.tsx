import React, { useState } from 'react';
import { FiSearch, FiChevronDown, FiDownload, FiPlus, FiChevronRight, FiCheck } from 'react-icons/fi';
import PropertyForm from './PropertyForm';

interface MainContentProps {
  activeSection: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeSection }) => {
  const [showPropertyForm, setShowPropertyForm] = useState(false);

  const getStrategyType = (): 'rental' | 'brrrr' | 'flip' | 'wholesale' => {
    switch (activeSection) {
      case "rentals": return 'rental';
      case "brrrr": return 'brrrr';
      case "flips": return 'flip';
      case "wholesale": return 'wholesale';
      default: return 'rental';
    }
  };
  const getSectionTitle = () => {
    switch (activeSection) {
      case "rentals":
        return "Rental Properties";
      case "brrrr":
        return "BRRRR Properties";
      case "flips":
        return "Flip Properties";
      case "wholesale":
        return "Wholesale Properties";
      default:
        return "Properties";
    }
  };

  const getSectionDescription = () => {
    switch (activeSection) {
      case "rentals":
        return "Properties you plan to buy and rent for long-term cash flow.";
      case "brrrr":
        return "Properties you plan to buy, rehab, rent, refinance and repeat (BRRRR method).";
      case "flips":
        return "Properties you plan to buy, rehab, and sell for profit.";
      case "wholesale":
        return "Properties you plan to wholesale to other investors.";
      default:
        return "Manage your property portfolio.";
    }
  };

  const sampleProperty = {
    address: "2657-59 Buena Vista Ave, Lemon Grove, CA 91945",
    type: "Multi-Family",
    units: "2 Units",
    size: "2,000 Sq.Ft.",
    cashFlow: "$387/mo",
    capRate: "7.3%",
    coc: "16.3%",
    purchasePrice: "$450,000",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=200&fit=crop"
  };

  // Show PropertyForm if button is clicked
  if (showPropertyForm) {
    return <PropertyForm strategy={getStrategyType()} onClose={() => setShowPropertyForm(false)} />;
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div className="content-header">
        <div className="header-top">
          <div>
            <h1 className="header-title">{getSectionTitle()}</h1>
            <p className="header-description">{getSectionDescription()}</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary">
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>Compare</span>
            </button>
            <button className="btn-primary" onClick={() => setShowPropertyForm(true)}>
              <FiPlus style={{ width: '1rem', height: '1rem' }} />
              <span>Add Property</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-item">
            <span className="filter-label">Tags</span>
            <FiChevronDown style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
          </div>
          
          <div className="filter-item" style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search properties..."
              className="filter-input"
            />
            <FiSearch style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '1rem', height: '1rem' }} />
          </div>

          <button className="filter-button">
            <FiDownload style={{ width: '1rem', height: '1rem' }} />
            <span>Export</span>
          </button>

          <label className="checkbox-label">
            <input type="checkbox" style={{ borderRadius: '0.25rem' }} />
            <span>Show Archived</span>
          </label>

          <div className="sort-container">
            <span className="sort-label">Sort by:</span>
            <span className="sort-value">Name</span>
            <FiChevronDown style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
          </div>
        </div>
      </div>

      {/* Property Cards */}
      <div className="property-cards">
        <div>
          {/* Sample Property Card */}
          <div className="property-card">
            <div className="property-card-content">
              {/* Property Image */}
              <div className="property-image">
                <img
                  src={sampleProperty.image}
                  alt="Property"
                  className="property-img"
                />
                <div className="status-badge">
                  <FiCheck style={{ width: '0.75rem', height: '0.75rem', color: 'white' }} />
                </div>
              </div>

              {/* Property Details */}
              <div className="property-details">
                <div className="property-header">
                  <div>
                    <h3 className="property-address">{sampleProperty.address}</h3>
                    <div className="property-info">
                      <span>{sampleProperty.type}</span>
                      <span>{sampleProperty.units}</span>
                      <span>{sampleProperty.size}</span>
                    </div>
                  </div>
                  <div>
                    <span className="sample-badge">SAMPLE</span>
                  </div>
                </div>

                {/* Financial Metrics */}
                <div className="property-metrics">
                  <div className="metric">
                    {sampleProperty.cashFlow} Cash Flow
                  </div>
                  <div className="metric">
                    {sampleProperty.capRate} Cap Rate
                  </div>
                  <div className="metric">
                    {sampleProperty.coc} COC
                  </div>
                </div>
              </div>

              {/* Purchase Price */}
              <div className="property-price">
                <div className="price-value">{sampleProperty.purchasePrice}</div>
                <div className="price-label">Purchase Price</div>
                <FiChevronRight className="price-arrow" />
              </div>
            </div>
          </div>

          {/* Add New Property Card */}
          <div className="add-property-card">
            <div className="add-property-content">
              {/* Add Icon */}
              <div className="add-icon-container">
                <div className="add-icon-bg">
                  <svg style={{ width: '2rem', height: '2rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="add-icon-plus">
                  <FiPlus style={{ width: '0.75rem', height: '0.75rem', color: 'white' }} />
                </div>
              </div>

              {/* Add Property Text */}
              <div className="add-text">
                <h3 className="add-title">Add a New {getSectionTitle().replace(' Properties', '')} Property</h3>
                <p className="add-description">
                  Click here to analyze a new {getSectionTitle().replace(' Properties', '').toLowerCase()} property or copy an existing one.
                </p>
              </div>

              {/* Add Icon */}
              <div>
                <FiPlus className="add-large-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;