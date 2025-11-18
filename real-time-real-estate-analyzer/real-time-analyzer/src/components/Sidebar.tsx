import React from 'react';
import { FiHome, FiList, FiPlus } from 'react-icons/fi';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onItemClick: (itemId: string) => void;
  onAddProperty?: (strategy: 'rental' | 'brrrr' | 'flip' | 'wholesale') => void;
}

interface SectionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface Section {
  id: string;
  label: string;
  count: number;
  items: SectionItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, onItemClick, onAddProperty }) => {
  const sections: Section[] = [
    {
      id: "rentals",
      label: "Rentals",
      count: 2,
      items: [
        { id: "rental-properties", label: "Properties", icon: <FiHome style={{ width: '1rem', height: '1rem' }} /> },
        { id: "rental-criteria", label: "Purchase Criteria", icon: <FiList style={{ width: '1rem', height: '1rem' }} /> }
      ]
    },
    {
      id: "brrrr",
      label: "BRRRRs",
      count: 1,
      items: [
        { id: "brrrr-properties", label: "Properties", icon: <FiHome style={{ width: '1rem', height: '1rem' }} /> },
        { id: "brrrr-criteria", label: "Purchase Criteria", icon: <FiList style={{ width: '1rem', height: '1rem' }} /> }
      ]
    },
    {
      id: "flips",
      label: "Flips",
      count: 1,
      items: [
        { id: "flip-properties", label: "Properties", icon: <FiHome style={{ width: '1rem', height: '1rem' }} /> },
        { id: "flip-criteria", label: "Purchase Criteria", icon: <FiList style={{ width: '1rem', height: '1rem' }} /> }
      ]
    },
    {
      id: "wholesale",
      label: "Wholesale",
      count: 1,
      items: [
        { id: "wholesale-properties", label: "Properties", icon: <FiHome style={{ width: '1rem', height: '1rem' }} /> },
        { id: "wholesale-criteria", label: "Purchase Criteria", icon: <FiList style={{ width: '1rem', height: '1rem' }} /> }
      ]
    }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {sections.map((section) => (
          <div key={section.id} className="section">
            {/* Section Header */}
            <div 
              className={`section-header ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => onSectionChange(section.id)}
            >
              <div className="section-title">
                <span className="section-name">{section.label}</span>
                <span className="section-count">{section.count}</span>
              </div>
              <button 
                className="add-button"
                onClick={(e) => {
                  e.stopPropagation();
                  // Map section ID to strategy
                  const strategyMap: { [key: string]: 'rental' | 'brrrr' | 'flip' | 'wholesale' } = {
                    'rentals': 'rental',
                    'brrrr': 'brrrr',
                    'flips': 'flip',
                    'wholesale': 'wholesale'
                  };
                  const strategy = strategyMap[section.id] || 'rental';
                  if (onAddProperty) {
                    onAddProperty(strategy);
                  }
                }}
              >
                <FiPlus style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>

            {/* Section Items */}
            <div className="section-items">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  className="section-item"
                  onClick={() => onItemClick(item.id)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;