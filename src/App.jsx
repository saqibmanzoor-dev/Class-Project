import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <WishlistProvider user={user}>
        <CartProvider user={user}>
          <Routes>
            {/* Lab 01 Authentication Routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />} />

            {/* Catalog & Discovery Routes (Lab 02 & Lab 03) */}
            <Route path="/home" element={<Home user={user} setUser={setUser} />} />
            <Route path="/products" element={<Home user={user} setUser={setUser} />} />
            <Route path="/products/:id" element={<ProductDetails user={user} setUser={setUser} />} />

            {/* Wishlist Journey Route (Lab 04) */}
            <Route path="/wishlist" element={<Wishlist user={user} setUser={setUser} />} />

            {/* Shopping Cart Route (Lab 05) */}
            <Route path="/cart" element={<Cart user={user} setUser={setUser} />} />

            {/* Checkout & Orders Routes (Lab 06) */}
            <Route path="/checkout" element={<Checkout user={user} setUser={setUser} />} />
            <Route path="/order-success/:id" element={<OrderSuccess user={user} setUser={setUser} />} />
            <Route path="/orders" element={<Orders user={user} setUser={setUser} />} />
            <Route path="/orders/:id" element={<OrderDetails user={user} setUser={setUser} />} />

            {/* Default / Fallback Routes */}
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>
        </CartProvider>
      </WishlistProvider>
    </BrowserRouter>
  );
}
