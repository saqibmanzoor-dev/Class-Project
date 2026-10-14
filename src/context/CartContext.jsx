import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart as apiClearCart } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children, user }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await getCart();
      if (res.success && Array.isArray(res.cart)) {
        setCart(res.cart);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      // If unauthorized, ignore silently
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Failed to load cart');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Derived state: total item count for Navbar badge
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);

  // Derived state: subtotal amount
  const cartTotal = cart.reduce((total, item) => {
    const price = item.product?.price || 0;
    return total + price * (item.quantity || 0);
  }, 0);

  const addItem = async (productId, quantity = 1) => {
    try {
      const res = await addToCart(productId, quantity);
      if (res.success && res.cart) {
        setCart(res.cart);
      }
      return { success: true, cart: res.cart };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      return { success: false, message: msg };
    }
  };

  const updateItemQty = async (productId, quantity) => {
    try {
      const res = await updateCartQuantity(productId, quantity);
      if (res.success && res.cart) {
        setCart(res.cart);
      }
      return { success: true, cart: res.cart };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      return { success: false, message: msg };
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await removeFromCart(productId);
      if (res.success && res.cart) {
        setCart(res.cart);
      }
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item from cart';
      return { success: false, message: msg };
    }
  };

  // Immediate global state reset (used immediately upon successful payment verification)
  const emptyCart = () => {
    setCart([]);
  };

  const clearEntireCart = async () => {
    try {
      await apiClearCart();
      setCart([]);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to clear cart';
      return { success: false, message: msg };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        loading,
        error,
        fetchCart,
        addItem,
        updateItemQty,
        removeItem,
        emptyCart,
        clearEntireCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
