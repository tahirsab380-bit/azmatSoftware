// client/src/App.jsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  PlusSquare,
  Table,
  ShoppingBag,
  ReceiptText,
  Sun,
  Moon,
  Users,
  Package,
  Settings
} from 'lucide-react';
import './sidebar.css';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import MenuPage from './pages/MenuPage';
import CategoriesPage from './pages/CategoriesPage';
import AddCategoryPage from './pages/AddCategoryPage';
import TablesPage from './pages/TablesPage';
import StaffPage from './pages/StaffPage';
import OrdersPage from './pages/OrdersPage';
import BillsPage from './pages/BillsPage';

import InventoryPage from './pages/InventoryPage';
// import CustomersPage from './pages/CustomersPage';

const API = 'http://localhost:5000/api';

// Protected & Public Routes (same as before)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}
//some
function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/" replace /> : children;
}

function NavItem({ to, icon: Icon, children, isSub = false }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`nav-link ${isActive ? 'active' : ''} ${isSub ? 'sub-item' : ''}`}
    >
      <Icon size={24} />
      <span>{children}</span>
    </Link>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false); // false = light, true = dark
  const [restaurantName, setRestaurantName] = useState('Restora'); // Default name
  const [bgColor, setBgColor] = useState('#ffffff'); // Default background

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Cycle through background colors (or you can make a dropdown later)
  const cycleBackground = () => {
    const colors = ['#ffffff', '#f1f5f9', '#111827', '#1e293b'];
    const currentIndex = colors.indexOf(bgColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    setBgColor(colors[nextIndex]);
  };

  return (
    <Router>
      <div className={darkMode ? 'dark' : 'light'} style={{ background: bgColor, minHeight: '100vh' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div style={{ display: 'flex', minHeight: '100vh' }}>
                {/* Sidebar */}
                <aside>
                  <div className="logo-container">
                    <Link to="/" className="logo-link">
                      <div className="logo-icon">R</div>
                      <div>
                        <h1 className="logo-text">{restaurantName}</h1> {/* Dynamic name */}
                        <p className="logo-subtitle">Restaurant POS</p>
                      </div>
                    </Link>
                  </div>

                  <nav>
                    <NavItem to="/" icon={LayoutDashboard}>Dashboard</NavItem>
                    <NavItem to="/menu" icon={UtensilsCrossed}>Menu Items</NavItem>
                    <NavItem to="/categories" icon={Tags}>Categories</NavItem>
                    <NavItem to="/add-category" icon={PlusSquare} isSub>Add Category</NavItem>
                    <NavItem to="/tables" icon={Table}>Tables</NavItem>
                    <NavItem to="/staff" icon={Users}>Staff Management</NavItem>
                    <NavItem to="/inventory" icon={Package}>Inventory Management</NavItem>
                    <NavItem to="/orders" icon={ShoppingBag}>Orders / POS</NavItem>
                    {/* <NavItem to="/customers" icon={Users}>Customers</NavItem> */}
                    <NavItem to="/bills" icon={ReceiptText}>Bills & History</NavItem>
                  </nav>

                  <div className="sidebar-footer">
                    {/* Theme Toggle */}
                    <button onClick={() => setDarkMode(!darkMode)} className="theme-btn">
                      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    {/* Settings Button - Change Name & Background */}
                    {/* <button onClick={cycleBackground} className="settings-btn">
                      <Settings size={18} />
                      Settings (Change BG)
                    </button> */}

                    <button onClick={() => {
                      const newName = prompt('Enter new restaurant name:', restaurantName);
                      if (newName) setRestaurantName(newName);
                    }} className="settings-btn">
                      <Settings size={18} />
                      Change Name
                    </button>

                    <button onClick={handleLogout} className="logout-btn">
                      Logout
                    </button>
                  </div>
                </aside>

                {/* Main Content */}
                <main style={{
                  flex: 1,
                  marginLeft: '320px',
                  background: bgColor, // Dynamic background
                  minHeight: '100vh',
                  color: darkMode ? '#e5e7eb' : '#111827'
                }}>
                  <div style={{
                    padding: '40px',
                    maxWidth: '1300px',
                    margin: '0 auto',
                    width: '95%'
                  }}>
                    <Routes>
                      <Route path="/" element={<Dashboard API={API} restaurantName={restaurantName} />} />
                      <Route path="/menu" element={<MenuPage API={API} />} />
                      <Route path="/categories" element={<CategoriesPage API={API} />} />
                      <Route path="/add-category" element={<AddCategoryPage API={API} />} />
                      <Route path="/tables" element={<TablesPage API={API} />} />
                      <Route path="/staff" element={<StaffPage />} />
                      <Route path="/inventory" element={<InventoryPage />} />
                      <Route path="/orders" element={<OrdersPage API={API} />} />
                      {/* <Route path="/customers" element={<CustomersPage />} /> */}
                      <Route path="/bills" element={<BillsPage API={API} restaurantName={restaurantName} />} />
  
                      <Route path="*" element={
                        <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <h1 style={{ fontSize: '3rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>404 - Page Not Found</h1>
                        </div>
                      } />
                    </Routes>
                  </div>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;