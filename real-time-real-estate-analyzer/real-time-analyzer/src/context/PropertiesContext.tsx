import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export interface SavedProperty {
  id: string;
  zpid?: string;
  strategy: 'rental' | 'brrrr' | 'flip' | 'wholesale';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price?: number;
  purchasePrice?: number;
  cashFlow?: number;
  capRate?: number;
  coc?: number;
  image?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  lat?: number;
  lon?: number;
  createdAt: string;
  updatedAt: string;
  isShortlisted?: boolean;
}

interface PropertiesContextType {
  properties: SavedProperty[];
  addProperty: (property: Omit<SavedProperty, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProperty: (id: string, updates: Partial<SavedProperty>) => void;
  deleteProperty: (id: string) => void;
  toggleShortlist: (id: string) => void;
  getPropertiesByStrategy: (strategy: 'rental' | 'brrrr' | 'flip' | 'wholesale') => SavedProperty[];
  getShortlistedProperties: () => SavedProperty[];
}

const PropertiesContext = createContext<PropertiesContextType | undefined>(undefined);

export const useProperties = () => {
  const context = useContext(PropertiesContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertiesProvider');
  }
  return context;
};

interface PropertiesProviderProps {
  children: ReactNode;
}

export const PropertiesProvider: React.FC<PropertiesProviderProps> = ({ children }) => {
  const [properties, setProperties] = useState<SavedProperty[]>([]);

  // Load properties from localStorage on mount
  useEffect(() => {
    const storedProperties = localStorage.getItem('savedProperties');
    if (storedProperties) {
      try {
        const parsedProperties = JSON.parse(storedProperties);
        setProperties(parsedProperties);
      } catch (error) {
        console.error('Error parsing stored properties:', error);
        localStorage.removeItem('savedProperties');
      }
    }
  }, []);

  // Save properties to localStorage whenever properties change
  useEffect(() => {
    localStorage.setItem('savedProperties', JSON.stringify(properties));
  }, [properties]);

  const addProperty = (propertyData: Omit<SavedProperty, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProperty: SavedProperty = {
      ...propertyData,
      id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProperties(prev => [...prev, newProperty]);
    return newProperty;
  };

  const updateProperty = (id: string, updates: Partial<SavedProperty>) => {
    setProperties(prev =>
      prev.map(prop =>
        prop.id === id
          ? { ...prop, ...updates, updatedAt: new Date().toISOString() }
          : prop
      )
    );
  };

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(prop => prop.id !== id));
  };

  const toggleShortlist = (id: string) => {
    setProperties(prev =>
      prev.map(prop =>
        prop.id === id
          ? { ...prop, isShortlisted: !prop.isShortlisted, updatedAt: new Date().toISOString() }
          : prop
      )
    );
  };

  const getPropertiesByStrategy = (strategy: 'rental' | 'brrrr' | 'flip' | 'wholesale') => {
    return properties.filter(prop => prop.strategy === strategy);
  };

  const getShortlistedProperties = () => {
    return properties.filter(prop => prop.isShortlisted);
  };

  const value: PropertiesContextType = {
    properties,
    addProperty,
    updateProperty,
    deleteProperty,
    toggleShortlist,
    getPropertiesByStrategy,
    getShortlistedProperties,
  };

  return <PropertiesContext.Provider value={value}>{children}</PropertiesContext.Provider>;
};

