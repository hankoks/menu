import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import CartBar from './components/CartBar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import OrderStatus from './pages/OrderStatus';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminMenu from './pages/admin/AdminMenu';
import AdminOrders from './pages/admin/AdminOrders';
import AdminQR from './pages/admin/AdminQR';
import AdminSettings from './pages/admin/AdminSettings';
import AdminStaff from './pages/admin/AdminStaff';
import AdminTables from './pages/admin/AdminTables';
import AsiaTemplate from './pages/themes/AsiaTemplate';
import BorcelleTemplate from './pages/themes/BorcelleTemplate';
import FastbiteTemplate from './pages/themes/FastbiteTemplate';

function CustomerLayout({ children }) {
  const { branding } = useAppContext();

  if (branding.template === 'asia') {
    return <AsiaTemplate />;
  }
  if (branding.template === 'borcelle') {
    return <BorcelleTemplate />;
  }
  if (branding.template === 'fastbite') {
    return <FastbiteTemplate />;
  }

  return (
    <>
      <Header />
      {children}
      <CartBar />
    </>
  );
}

// Optional helper to block deep customer routes for single-page templates
function ThemeRouter({ children }) {
  const { branding } = useAppContext();
  if (branding.template === 'asia' || branding.template === 'borcelle' || branding.template === 'fastbite') {
    return <Navigate to="/" replace />;
  }
  return <CustomerLayout>{children}</CustomerLayout>;
}


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer routes */}
        <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
        <Route path="/about" element={<ThemeRouter><About /></ThemeRouter>} />
        <Route path="/contact" element={<ThemeRouter><Contact /></ThemeRouter>} />
        <Route path="/cart" element={<ThemeRouter><Cart /></ThemeRouter>} />
        <Route path="/product/:id" element={<ThemeRouter><ProductDetail /></ThemeRouter>} />
        <Route path="/order/:id" element={<ThemeRouter><OrderStatus /></ThemeRouter>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="qr" element={<AdminQR />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="tables" element={<AdminTables />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
