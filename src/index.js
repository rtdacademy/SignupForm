import React from "react";
import ReactDOM from "react-dom/client";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LayoutProvider } from './context/LayoutContext';
import { ModeProvider } from './context/ModeContext';
import App from "./App";
import './index.css';

const initialOptions = {
  "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
  currency: "CAD",
  "data-env": process.env.REACT_APP_PAYPAL_ENV,
  vault: true,
};

// Determine which site to render based on the environment variable
const isSecondSite = process.env.REACT_APP_SITE === 'second';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <PayPalScriptProvider options={initialOptions}>
          <LayoutProvider>
            <ModeProvider>
              <App isSecondSite={isSecondSite} />
            </ModeProvider>
          </LayoutProvider>
        </PayPalScriptProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);