import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LayoutProvider } from './context/LayoutContext';
import { ModeProvider } from './context/ModeContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { TutorialProvider } from './context/TutorialContext';
import { CourseProvider } from './context/CourseContext'; 
import { SchoolYearProvider } from './context/SchoolYearContext'; 
import { AudioProvider } from './context/AudioContext';
import GlobalTextSelectionProvider from './context/GlobalTextSelectionProvider';
import App from "./App";
import { Toaster } from 'sonner'; 
import './index.css';

const isSecondSite = process.env.REACT_APP_SITE === 'second';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <UserPreferencesProvider>
          <LayoutProvider>
            <ModeProvider>
              <TutorialProvider> 
                <CourseProvider> 
                  <SchoolYearProvider>
                    <AudioProvider>
                      <GlobalTextSelectionProvider>
                        <App isSecondSite={isSecondSite} />
                        <Toaster position="top-right" />
                      </GlobalTextSelectionProvider>
                    </AudioProvider>
                  </SchoolYearProvider>
                </CourseProvider> 
              </TutorialProvider> 
            </ModeProvider>
          </LayoutProvider>
        </UserPreferencesProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);