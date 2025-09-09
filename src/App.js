import React, { lazy, Suspense } from 'react';
import PageLoader from './components/PageLoader';
import './styles/styles.css';
import 'katex/dist/katex.min.css';

// Lazy load the three apps - only load the one we need based on environment
const MainApp = lazy(() => import('./apps/MainApp'));
const EdBotzApp = lazy(() => import('./apps/EdBotzApp'));
const RTDConnectApp = lazy(() => import('./apps/RTDConnectApp'));

function App() {
  // Check which site we're running
  const siteType = process.env.REACT_APP_SITE;
  
  // Use Suspense to show loading state while the app chunk loads
  return (
    <Suspense fallback={<PageLoader message="Loading application..." />}>
      {siteType === 'second' && <EdBotzApp />}
      {siteType === 'rtdconnect' && <RTDConnectApp />}
      {(!siteType || siteType === 'main') && <MainApp />}
    </Suspense>
  );
}

export default App;