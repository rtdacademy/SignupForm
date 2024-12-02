import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LayoutProvider } from './context/LayoutContext';
import { ModeProvider } from './context/ModeContext';
import App from "./App";
import './index.css';

const isSecondSite = process.env.REACT_APP_SITE === 'second';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
       
          <LayoutProvider>
            <ModeProvider>
              <App isSecondSite={isSecondSite} />
            </ModeProvider>
          </LayoutProvider>
       
      </AuthProvider>
    </Router>
  </React.StrictMode>
);