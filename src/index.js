import React from "react";
import ReactDOM from "react-dom/client";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { AuthProvider } from './context/AuthContext'; // Import the AuthProvider
import App from "./App";

const initialOptions = {
  "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
  currency: "CAD",
  "data-env": process.env.REACT_APP_PAYPAL_ENV,
  vault: true,
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* Wrap everything with AuthProvider */}
      <PayPalScriptProvider options={initialOptions}>
        <App />
      </PayPalScriptProvider>
    </AuthProvider>
  </React.StrictMode>
);