import React, { createContext, useContext, useState } from 'react';

// Create the context
const OrderContext = createContext();

// Custom hook for consuming the context
export const useOrder = () => useContext(OrderContext);

// Provider component to wrap around your app
export const OrderProvider = ({ children }) => {
  const [order, setOrder] = useState("");

  return (
    <OrderContext.Provider value={{ order, setOrder }}>
      {children}
    </OrderContext.Provider>
  );
};
