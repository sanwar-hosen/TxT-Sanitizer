// Layout component with Outlet structure
// This component provides the main layout structure (Navbar, main content area, Footer)
// Child routes will be rendered in the Outlet area
// Updated with semantic HTML elements and SEO structured data for better search engine optimization

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SEOStructuredData from './SEOStructuredData';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* SEO structured data injection for search engines */}
      <SEOStructuredData />
      
      {/* Semantic header element for better SEO and accessibility */}
      <header>
        <Navbar />
      </header>
      
      {/* Main content area with semantic main element - child routes will be rendered here via Outlet */}
      <main className="flex-1 bg-gray-100 w-full h-full" role="main">
        <Outlet />
      </main>
      
      {/* Semantic footer element for better SEO and accessibility */}
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default Layout;