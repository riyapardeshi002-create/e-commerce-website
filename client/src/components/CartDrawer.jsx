import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../api/client';

export default function CartDrawer({ onProceedToCheckout, onContinueShopping }) {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, loading } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [updatingId, setUpdatingId] = useState(null);

  if (!isCartOpen) return null;

  const handleQuantityChange = async (itemId, currentQty, delta, maxStock) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (newQty > maxStock) return;
    try {
      setUpdatingId(itemId);
      await updateQuantity(itemId, newQty);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      setUpdatingId(itemId);
      await removeFromCart(itemId);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setIsCartOpen(false);
    onProceedToCheckout();
  };

  const freeShippingProgress = Math.min(
    100,
    Math.round((cart.subtotal / cart.freeShippingThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-zinc-900" />
              <h2 className="text-lg font-bold text-zinc-900">Your Bag</h2>
              <span className="text-xs font-semibold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full">
                {cart.itemCount}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-zinc-50 px-6 py-3.5 border-b border-zinc-200">
            {cart.subtotal >= cart.freeShippingThreshold ? (
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                You've unlocked FREE Express Shipping!
              </p>
            ) : (
              <p className="text-xs text-zinc-600">
                Add <span className="font-bold text-zinc-900">{formatINR(cart.amountNeededForFreeShipping)}</span> more for <span className="font-bold text-zinc-900">FREE Express Delivery</span>.
              </p>
            )}
            <div className="w-full bg-zinc-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!isAuthenticated ? (
              <div className="py-16 text-center">
                <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-zinc-900">Please Sign In</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Sign in to view your bag, access saved sizes, and continue to checkout.
                </p>
                <button
                  onClick={() => openAuthModal('login')}
                  className="mt-4 bg-zinc-950 text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-zinc-800 transition"
                >
                  Sign In Now
                </button>
              </div>
            ) : cart.items.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-zinc-900">Your bag is empty</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Discover trending sneakers and footwear for your rotation.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onContinueShopping();
                  }}
                  className="mt-5 inline-flex items-center gap-2 bg-zinc-950 text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-zinc-800 transition"
                >
                  Explore Footwear
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-zinc-50 rounded-2xl border border-zinc-200/60 relative group"
                >
                  {/* Item Image */}
                  <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-zinc-200/80">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-zinc-900 truncate">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={updatingId === item.id}
                          className="text-zinc-400 hover:text-rose-600 transition p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-500 uppercase tracking-wide">
                        {item.brand} • Size {item.size}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-zinc-300 bg-white rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1, item.availableStock)}
                          disabled={updatingId === item.id || item.quantity <= 1}
                          className="p-1 hover:bg-zinc-100 disabled:opacity-30 rounded-l transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-zinc-800 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.availableStock)}
                          disabled={updatingId === item.id || item.quantity >= item.availableStock}
                          className="p-1 hover:bg-zinc-100 disabled:opacity-30 rounded-r transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Subtotal */}
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-zinc-900">
                          {formatINR(item.lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Checkout CTA */}
          {isAuthenticated && cart.items.length > 0 && (
            <div className="p-6 bg-white border-t border-zinc-200 space-y-3">
              <div className="space-y-1.5 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-zinc-900">{formatINR(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-zinc-900">
                    {cart.shippingCost === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      formatINR(cart.shippingCost)
                    )}
                  </span>
                </div>
                <div className="border-t border-zinc-100 pt-2 flex justify-between text-sm font-black text-zinc-950">
                  <span>Order Total</span>
                  <span className="text-base font-extrabold">{formatINR(cart.totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition active:scale-[0.99] flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <span>Proceed to Demo Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-zinc-400">
                ⚡ Demo Mode: No credit card required. Database updates stock atomically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
