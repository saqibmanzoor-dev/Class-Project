import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist, toggleWishlist } from '../services/api';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children, user }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await getWishlist();
      if (res.success && Array.isArray(res.wishlist)) {
        setWishlist(res.wishlist);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist from backend:', err);
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Failed to load wishlist');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const wishlistCount = wishlist.length;

  const isWishlisted = (productId) => {
    if (!productId) return false;
    return wishlist.some(
      (item) => (item._id || item).toString() === productId.toString()
    );
  };

  const addItemToWishlist = async (productId) => {
    try {
      const res = await addToWishlist(productId);
      await fetchWishlist();
      return { success: true, message: res.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add to wishlist';
      return { success: false, message: msg };
    }
  };

  const removeItemFromWishlist = async (productId) => {
    try {
      const res = await removeFromWishlist(productId);
      await fetchWishlist();
      return { success: true, message: res.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove from wishlist';
      return { success: false, message: msg };
    }
  };

  const toggleItemInWishlist = async (productId) => {
    try {
      const res = await toggleWishlist(productId);
      await fetchWishlist();
      return { success: true, saved: res.saved, message: res.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to toggle wishlist item';
      return { success: false, message: msg };
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        loading,
        error,
        fetchWishlist,
        isWishlisted,
        addItemToWishlist,
        removeItemFromWishlist,
        toggleItemInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
