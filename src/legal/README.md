# Legal Documentation Implementation

This directory contains the legal documentation components for the YourWay platform by Edbotz Inc.

## Components

### 1. PrivacyStatement.js
- Comprehensive privacy policy covering both main education services and RTD-Connect
- Sections for data collection, usage, third-party services, and user rights
- Compliant with PIPEDA and PIPA requirements

### 2. TermsAndConditions.js
- Unified terms covering both service types
- Service-specific sections for:
  - Education Services (tuition payments via Stripe)
  - Home Education Support (reimbursements via Stripe Connect)
- Clear delineation of responsibilities and liabilities

### 3. LegalAcceptance.js
- Reusable components for legal document acceptance
- Version tracking for terms updates
- Firebase integration for compliance logging

## Usage Examples

### In Registration Forms

```javascript
import { LegalAcceptanceCheckbox, recordLegalAcceptance } from '../legal/LegalAcceptance';

// In your registration component
const [legalAccepted, setLegalAccepted] = useState(false);
const [showLegalError, setShowLegalError] = useState(false);

// In your form
<LegalAcceptanceCheckbox 
  onAcceptanceChange={setLegalAccepted}
  showError={showLegalError}
  required={true}
/>

// On form submission
const handleSubmit = async () => {
  if (!legalAccepted) {
    setShowLegalError(true);
    return;
  }
  
  // After successful user creation
  await recordLegalAcceptance(user.uid, user.email, {
    registrationType: 'student', // or 'homeEducation'
    timestamp: Date.now()
  });
};
```

### Checking for Updates

```javascript
import { checkLegalAcceptance, LegalUpdatePrompt } from '../legal/LegalAcceptance';

// In your app initialization or dashboard
useEffect(() => {
  const checkLegal = async () => {
    if (user) {
      const status = await checkLegalAcceptance(user.uid);
      
      if (status.needsUpdate) {
        setShowLegalUpdate(true);
      }
    }
  };
  
  checkLegal();
}, [user]);

// Render update prompt if needed
{showLegalUpdate && (
  <LegalUpdatePrompt
    userId={user.uid}
    onAccept={() => setShowLegalUpdate(false)}
    onDecline={() => signOut()}
  />
)}
```

## Version Management

Update version numbers in `LegalAcceptance.js` when making significant changes:

```javascript
export const LEGAL_VERSIONS = {
  terms: '1.0.0',    // Increment for Terms updates
  privacy: '1.0.0',  // Increment for Privacy updates
  lastUpdated: '2025-01-08'
};
```

## Database Structure

Legal acceptance is stored in Firebase:

```
/users/{userId}/legalAcceptance
  - termsVersion: "1.0.0"
  - privacyVersion: "1.0.0"
  - acceptedAt: 1704729600000
  - acceptedBy: "userId"
  - email: "user@example.com"
  - ipAddress: "IP_NOT_COLLECTED"
  - userAgent: "Mozilla/5.0..."

/legalAcceptanceLog/{sanitizedEmail}/{timestamp}
  - (same structure for compliance logging)
```

## Routes

Legal pages are accessible at:
- `/privacy` - Privacy Statement
- `/terms` - Terms and Conditions

These routes are configured in `App.js` for all three app variants (Main, EdBotz, RTDConnect).

## Footer Links

Legal links have been added to:
1. **Layout.js** - Main app footer (shown on staff/student dashboards)
2. **RTDConnect/LandingPage.js** - RTD-Connect landing page footer
3. **RTDConnect/Dashboard.js** - RTD-Connect dashboard footer

## Compliance Notes

1. **Data Collection**: We clearly state what data is collected for each service type
2. **Third-Party Services**: Explicit mention of Stripe and Stripe Connect handling
3. **User Rights**: Clear explanation of PIPEDA/PIPA rights
4. **Minors**: Parental consent requirements for users under 18
5. **Audit Trail**: All acceptances logged with timestamps for compliance

## Future Enhancements

- [ ] Add email notifications for terms updates
- [ ] Implement granular consent options (marketing, analytics, etc.)
- [ ] Add data export functionality for GDPR compliance
- [ ] Create admin interface for managing legal document versions
- [ ] Add multi-language support for legal documents