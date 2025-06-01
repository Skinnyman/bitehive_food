import React, { createContext, useContext, useState } from 'react';

// Create the context
const OrderContext = createContext();

// Custom hook for consuming the context
export const useOd = () => useContext(OrderContext);

// Provider component to wrap around your app
export const OrderProviders = ({ children }) => {
  const [od, setOd] = useState("");

  return (
    <OrderContext.Provider value={{ od, setOd }}>
      {children}
    </OrderContext.Provider>
  );
};


