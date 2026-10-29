import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
    shippingCost: 0,
    freeShippingThreshold: 2000,
    amountNeededForFreeShipping: 2000,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({
        items: [],
        itemCount: 0,
        subtotal: 0,
        shippingCost: 0,
        freeShippingThreshold: 2000,
        amountNeededForFreeShipping: 2000,
        totalAmount: 0,
      });
      return;
    }
    try {
      setLoading(true);
      const res = await cartApi.getCart();
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, size, quantity = 1) => {
    const res = await cartApi.addToCart({ productId, size, quantity });
    await fetchCart();
    setIsCartOpen(true);
    return res;
  };

  const updateQuantity = async (cartItemId, quantity) => {
    const res = await cartApi.updateQuantity(cartItemId, quantity);
    await fetchCart();
    return res;
  };

  const removeFromCart = async (cartItemId) => {
    const res = await cartApi.removeItem(cartItemId);
    await fetchCart();
    return res;
  };

  const value = {
    cart,
    items: cart.items,
    itemCount: cart.itemCount,
    subtotal: cart.subtotal,
    shippingCost: cart.shippingCost,
    totalAmount: cart.totalAmount,
    freeShippingThreshold: cart.freeShippingThreshold,
    amountNeededForFreeShipping: cart.amountNeededForFreeShipping,
    loading,
    isCartOpen,
    setIsCartOpen,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
