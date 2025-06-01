import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { OrderProvider } from './context/OrderContext';
import { OrderProviders } from './context/InfoContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <OrderProvider>
      <OrderProviders>
        <App />
      </OrderProviders>
    </OrderProvider>
  </React.StrictMode>
);

reportWebVitals();
