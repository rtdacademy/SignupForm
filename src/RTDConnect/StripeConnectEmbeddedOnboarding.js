import React from 'react';
import { StripeConnectEmbeddedOnboarding } from '../components/ConnectEmbeddedComponents';

// This component replaces the old StripeConnectOnboarding.js
// It uses the new embedded components approach instead of redirects
const StripeConnectOnboarding = (props) => {
  return <StripeConnectEmbeddedOnboarding {...props} />;
};

export default StripeConnectOnboarding;