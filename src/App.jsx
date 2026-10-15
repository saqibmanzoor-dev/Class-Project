import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { getProfile } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);

  // Restore authenticated session on initial app load if token/cookie exists
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        const profile = await getProfile();
        if (isMounted && profile && profile._id) {
          setUser(profile);
        }
      } catch (err) {
        // Guest user: remain unauthenticated quietly without forced redirects
        if (isMounted) setUser(null);
      }
    };

    restoreSession();
    return () => { isMounted = false; };
  }, []);

  return (
    <BrowserRouter>
      <WishlistProvider user={user}>
        <CartProvider user={user}>
          <Routes>
            {/* Lab 01 Authentication Routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />} />

            {/* Dedicated Flagship Storefront Home Route */}
            <Route path="/" element={<Home user={user} setUser={setUser} />} />
            <Route path="/home" element={<Home user={user} setUser={setUser} />} />

            {/* Dedicated Product Catalogue Route (Lab 02 & Lab 03) */}
            <Route path="/products" element={<Products user={user} setUser={setUser} />} />
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

            {/* Default Fallback Route to Storefront Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </WishlistProvider>
    </BrowserRouter>
  );
}
