// SEO component for injecting structured data markup
// This component provides Google with structured information about the application
// Following clean code principles with comprehensive comments

import { useEffect } from 'react';

function SEOStructuredData() {
  useEffect(() => {
    // Structured data helps Google understand what our application does
    // This follows Schema.org WebApplication markup standards
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
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
        "@type": "Person",
        "name": "Sano",
        "url": "https://www.linkedin.com/in/sanwar-hosen/"
      },
      "featureList": [
        "Text sanitization with custom presets",
        "File upload support for .txt and .md files", 
        "History tracking of sanitization operations",
        "Custom preset management",
        "Case-insensitive pattern matching",
        "Real-time text processing"
      ],
      "browserRequirements": "Requires JavaScript. Works with modern browsers.",
      "softwareVersion": "1.0.0"
    };

    // Create and inject the structured data script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    
    // Add script to document head for Google to crawl
    document.head.appendChild(script);

    // Cleanup function to remove script when component unmounts
    // Following React best practices for side effect cleanup
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // This component doesn't render any visible content
  // It only injects SEO data into the document head
  return null;
}

export default SEOStructuredData;