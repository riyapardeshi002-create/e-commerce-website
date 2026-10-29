import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, ShoppingBag, Truck, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersApi, formatINR } from '../api/client';

export default function Checkout({ onBack, onOrderSuccess }) {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    phone: '',
    deliveryAddress: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001',
    paymentMethod: 'demo_cod', // 'demo_cod' | 'demo_upi' | 'demo_card'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customerName || !formData.phone || !formData.deliveryAddress || !formData.city || !formData.state || !formData.postalCode) {
      setError('Please fill in all required delivery details.');
      return;
    }

    try {
      setLoading(true);
      const res = await ordersApi.createOrder({
        customerName: formData.customerName,
        phone: formData.phone,
        deliveryAddress: formData.deliveryAddress,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
      });

      if (res.success && res.data) {
        await fetchCart();
        onOrderSuccess(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-zinc-900">Your bag is empty</h2>
        <p className="text-xs text-zinc-500 mt-1">Add items to your bag before checking out.</p>
        <button
          onClick={onBack}
          className="mt-6 bg-zinc-950 text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-zinc-800 transition"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-950 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Shopping Bag</span>
      </button>

      {/* College Project Disclaimer Badge */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 mb-8 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
            DEMO CHECKOUT SIMULATION — Cloud Computing Project
          </h4>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            This checkout simulates a full relational transaction in PostgreSQL. No real money will be charged, and no real financial cards are processed. Stock will be atomically decremented in PostgreSQL.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form: Delivery Information */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h2 className="text-xl font-black text-zinc-950 tracking-tight">Delivery Details</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Please provide where your footwear should be dispatched.</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="e.g. Riya Sharma"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Street Address / Apartment *
              </label>
              <input
                type="text"
                required
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                placeholder="Flat / House No., Landmark, Building Name, Street"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Bengaluru"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Karnataka"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="560001"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Demo Payment Selector */}
            <div className="pt-4 border-t border-zinc-200">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-2">
                Simulated Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label
                  className={`p-3 rounded-2xl border cursor-pointer text-center transition ${
                    formData.paymentMethod === 'demo_cod'
                      ? 'border-zinc-950 bg-zinc-950 text-white font-bold'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="demo_cod"
                    checked={formData.paymentMethod === 'demo_cod'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Truck className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs block">Demo Cash on Delivery</span>
                </label>

                <label
                  className={`p-3 rounded-2xl border cursor-pointer text-center transition ${
                    formData.paymentMethod === 'demo_upi'
                      ? 'border-zinc-950 bg-zinc-950 text-white font-bold'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="demo_upi"
                    checked={formData.paymentMethod === 'demo_upi'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <ShieldCheck className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs block">Demo UPI Instant</span>
                </label>

                <label
                  className={`p-3 rounded-2xl border cursor-pointer text-center transition ${
                    formData.paymentMethod === 'demo_card'
                      ? 'border-zinc-950 bg-zinc-950 text-white font-bold'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="demo_card"
                    checked={formData.paymentMethod === 'demo_card'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <CreditCard className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs block">Demo Card Auth</span>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-zinc-50 rounded-3xl p-6 sm:p-7 border border-zinc-200 space-y-6 sticky top-28">
            <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider">
              Order Summary ({cart.itemCount} Items)
            </h3>

            {/* Item list */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-14 h-14 object-cover rounded-xl border border-zinc-200 bg-white flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-900 truncate">{item.productName}</p>
                    <p className="text-[11px] text-zinc-500">
                      Size {item.size} • Qty {item.quantity}
                    </p>
                    <p className="font-extrabold text-zinc-900 mt-1">
                      {formatINR(item.lineTotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="border-t border-zinc-200 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-bold text-zinc-900">{formatINR(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Shipping</span>
                <span className="font-bold text-zinc-900">
                  {cart.shippingCost === 0 ? (
                    <span className="text-emerald-600">FREE</span>
                  ) : (
                    formatINR(cart.shippingCost)
                  )}
                </span>
              </div>
              <div className="border-t border-zinc-200 pt-3 flex justify-between text-base font-black text-zinc-950">
                <span>Total Amount</span>
                <span className="text-lg font-black">{formatINR(cart.totalAmount)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              form="checkout-form"
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-extrabold py-4 px-4 rounded-2xl text-xs uppercase tracking-wider shadow-xl transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Processing Order...' : 'Confirm Demo Order'}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </button>

            <div className="text-[10px] text-zinc-400 text-center leading-normal">
              🔒 Safe & Secure Transaction — Powered by Render PostgreSQL ACID Transactions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
