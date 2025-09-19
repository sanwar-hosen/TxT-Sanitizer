// Main App component with React Router setup using Outlet structure
// This component defines the main application routing with nested routes

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import History from './pages/History';
import Settings from './pages/Settings';
import About from './pages/About';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main layout route with nested child routes */}
          <Route path="/" element={<Layout />}>
            {/* Home page route - accessible via logo only */}
            <Route index element={<Home />} />
            
            {/* History page route */}
            <Route path="history" element={<History />} />
            
            {/* Settings page route */}
            <Route path="settings" element={<Settings />} />
            
            {/* About page route */}
            <Route path="about" element={<About />} />
            
            {/* Add more nested routes here as the application grows */}
            {/* Example: <Route path="sanitize" element={<SanitizePage />} /> */}
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;