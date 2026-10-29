import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '../api/client';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user, openAuthModal } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await wishlistApi.getWishlist();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId) => {
    return items.some((item) => item.productId === productId || item.product?.id === productId);
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      openAuthModal('login');
      return { success: false, message: 'Please sign in to save items to your wishlist.' };
    }
    try {
      const res = await wishlistApi.toggleWishlist(productId);
      await fetchWishlist();
      return res;
    } catch (err) {
      console.error('Toggle wishlist error:', err);
      throw err;
    }
  };

  const removeFromWishlist = async (wishlistItemId) => {
    try {
      const res = await wishlistApi.removeItem(wishlistItemId);
      await fetchWishlist();
      return res;
    } catch (err) {
      console.error('Remove wishlist error:', err);
      throw err;
    }
  };

  const value = {
    items,
    wishlistCount: items.length,
    loading,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    fetchWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
