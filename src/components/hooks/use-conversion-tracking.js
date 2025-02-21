export const useConversionTracking = () => {
  const trackConversion = (url) => {
    // Check if gtag_report_conversion is available
    if (typeof window.gtag === 'function') {
      gtag('event', 'conversion', {
        'send_to': 'AW-10977800535/-IAdCOOvhJkaENfiz_Io',
        'value': 1.0,
        'currency': 'CAD',
        'event_callback': function() {
          if (url) {
            window.location = url;
          }
        }
      });
    } else {
      // Fallback if gtag is not available
      if (url) {
        window.location = url;
      }
    }
  };

  return trackConversion;
};