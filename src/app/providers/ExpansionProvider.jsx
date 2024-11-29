"use client";
import { createContext, useContext, useEffect, useState } from 'react';

const expandedContext = createContext();

export const useExpanded = () => useContext(expandedContext);

export const ExpandedProvider = ({ children }) => {
  const [expanded, setExpanded] = useState(() => {
    const storedExpanded = localStorage.getItem('expanded');
    return storedExpanded ? JSON.parse(storedExpanded) : 100;
  });
  useEffect(() => {
    localStorage.setItem('expanded', JSON.stringify(expanded));
  }, [expanded]);
  return (
    <expandedContext.Provider value={{ expanded, setExpanded }}>
      {children}
    </expandedContext.Provider>
  );
};