// Layout component with Outlet structure
// This component provides the main layout structure (Navbar, main content area, Footer)
// Child routes will be rendered in the Outlet area

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation bar - appears on all pages */}
      <Navbar />
      
      {/* Main content area - child routes will be rendered here via Outlet */}
      <main className="flex-1 bg-gray-100 w-full h-full">
        <Outlet />
      </main>
      
      {/* Footer - appears on all pages */}
      <Footer />
    </div>
  );
}

export default Layout;