// Enhanced SEO component for proper site name recognition
// This component provides comprehensive structured data for search engines
// Located in src/components/SEOStructuredData.jsx

import { useEffect } from 'react';

function SEOStructuredData() {
  useEffect(() => {
    // Enhanced structured data with explicit site information
    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "https://txt-sanitizer.pages.dev/#website",
          "url": "https://txt-sanitizer.pages.dev/",
          "name": "TxT Sanitizer",
          "description": "Free online text cleaning and sanitization tool",
          "publisher": {
            "@id": "https://txt-sanitizer.pages.dev/#person"
          }
        },
        {
          "@type": "WebApplication",
          "@id": "https://txt-sanitizer.pages.dev/#webapplication",
          "name": "TxT Sanitizer",
          "description": "Free online text cleaning and sanitization tool with custom presets",
          "url": "https://txt-sanitizer.pages.dev",
          "applicationCategory": "Utility",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "creator": {
            "@id": "https://txt-sanitizer.pages.dev/#person"
          }
        },
        {
          "@type": "Person",
          "@id": "https://txt-sanitizer.pages.dev/#person",
          "name": "Sano",
          "url": "https://www.linkedin.com/in/sanwar-hosen/"
        }
      ]
    };

    // Create and inject the structured data script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // This component doesn't render any visible content
  return null;
}

export default SEOStructuredData;