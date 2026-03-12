import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Lazy load page components to dramatically improve split points and initial page load speed
const Menu = React.lazy(() => import('./pages/Menu'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Profile = React.lazy(() => import('./pages/Profile'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const RestaurantDashboard = React.lazy(() => import('./pages/RestaurantDashboard'));
const PartnerWithUs = React.lazy(() => import('./pages/PartnerWithUs'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ScrollToTop />
      <Navbar />
      <div style={{ flex: 1 }}>
        <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #ff6b6b', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>
                    {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                </style>
            </div>
        }>
          <Routes>
            <Route path="/" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/myorders" element={<Orders />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
            <Route path="/partner" element={<PartnerWithUs />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
