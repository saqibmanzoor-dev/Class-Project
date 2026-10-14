import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import { CartProvider } from './context/CartContext';

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <CartProvider user={user}>
        <Routes>
          {/* Lab 01 Authentication Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />} />

          {/* Catalog & Shopping Journey Routes */}
          <Route path="/home" element={<Home user={user} setUser={setUser} />} />
          <Route path="/cart" element={<Cart user={user} setUser={setUser} />} />

          {/* Lab 06 Checkout & Orders Routes */}
          <Route path="/checkout" element={<Checkout user={user} setUser={setUser} />} />
          <Route path="/order-success/:id" element={<OrderSuccess user={user} setUser={setUser} />} />
          <Route path="/orders" element={<Orders user={user} setUser={setUser} />} />
          <Route path="/orders/:id" element={<OrderDetails user={user} setUser={setUser} />} />

          {/* Default / Fallback Routes */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
