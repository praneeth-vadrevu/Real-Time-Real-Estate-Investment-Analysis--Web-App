import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

/**
 * Saved property data structure.
 * Represents a property that has been analyzed and saved by the user.
 */
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

/**
 * Properties context provider.
 * Manages saved properties state and provides methods to manipulate properties.
 */
export const PropertiesProvider: React.FC<PropertiesProviderProps> = ({ children }) => {
  const [properties, setProperties] = useState<SavedProperty[]>([]);

  // Load properties from localStorage when component mounts
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

  // Automatically save properties to localStorage whenever the properties array changes
  useEffect(() => {
    localStorage.setItem('savedProperties', JSON.stringify(properties));
  }, [properties]);

  /**
   * Adds a new property to the saved properties list.
   * Generates a unique ID and timestamps automatically.
   * 
   * @param propertyData The property data to add (without id, createdAt, updatedAt)
   * @returns The newly created property with generated fields
   */
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

  /**
   * Updates an existing property with new data.
   * 
   * @param id The ID of the property to update
   * @param updates Partial property data with fields to update
   */
  const updateProperty = (id: string, updates: Partial<SavedProperty>) => {
    setProperties(prev =>
      prev.map(prop =>
        prop.id === id
          ? { ...prop, ...updates, updatedAt: new Date().toISOString() }
          : prop
      )
    );
  };

  /**
   * Deletes a property from the saved properties list.
   * 
   * @param id The ID of the property to delete
   */
  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(prop => prop.id !== id));
  };

  /**
   * Toggles the shortlist status of a property.
   * 
   * @param id The ID of the property to toggle
   */
  const toggleShortlist = (id: string) => {
    setProperties(prev =>
      prev.map(prop =>
        prop.id === id
          ? { ...prop, isShortlisted: !prop.isShortlisted, updatedAt: new Date().toISOString() }
          : prop
      )
    );
  };

  /**
   * Gets all properties filtered by investment strategy.
   * 
   * @param strategy The investment strategy to filter by
   * @returns Array of properties matching the strategy
   */
  const getPropertiesByStrategy = (strategy: 'rental' | 'brrrr' | 'flip' | 'wholesale') => {
    return properties.filter(prop => prop.strategy === strategy);
  };

  /**
   * Gets all properties that are currently shortlisted.
   * 
   * @returns Array of shortlisted properties
   */
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

