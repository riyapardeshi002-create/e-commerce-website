import React, { useState, useEffect } from 'react';
import { Package, User, LogOut, ChevronDown, ChevronUp, MapPin, Phone, Calendar, ArrowRight, ShieldCheck, Printer, FileText } from 'lucide-react';
import { ordersApi, formatINR } from '../api/client';
import { useAuth } from '../context/AuthContext';
import InvoiceModal from '../components/InvoiceModal';

export default function Account({ onNavigate }) {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersApi.getMyOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'delivered':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Account Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-zinc-950 text-white rounded-full flex items-center justify-center text-xl font-black">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">{user?.name}</h1>
              {user?.role === 'admin' && (
                <span className="bg-brand-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">{user?.email}</p>
            <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Member since {new Date(user?.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin')}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold px-4 py-2.5 rounded-full transition"
            >
              Admin Dashboard
            </button>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 px-4 py-2.5 rounded-full border border-rose-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Orders Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-zinc-950 tracking-tight">Your Order History</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Track, review, and view receipts for all past footwear purchases</p>
          </div>
          <span className="text-xs font-bold bg-zinc-100 px-3 py-1 rounded-full text-zinc-700">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 h-36 border border-zinc-200 animate-pulse"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 p-8">
            <Package className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900">No orders placed yet</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Once you checkout, your orders, delivery status, and price snapshots will appear right here.
            </p>
            <button
              onClick={() => onNavigate('shop')}
              className="mt-5 bg-zinc-950 text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-zinc-800 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm overflow-hidden transition"
                >
                  {/* Order Card Header */}
                  <div
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="p-6 cursor-pointer hover:bg-zinc-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-zinc-100 rounded-2xl text-zinc-900 flex-shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-black text-zinc-950">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })} • {order.orderItems?.length || 0} items
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100">
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Amount</p>
                        <p className="text-base font-black text-zinc-950">{formatINR(order.totalAmount)}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInvoiceOrder(order);
                        }}
                        className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition active:scale-95"
                        title="Print Purchase Bill"
                      >
                        <Printer className="w-3.5 h-3.5 text-brand-600" />
                        <span className="hidden sm:inline">Bill / Invoice</span>
                      </button>

                      <div className="p-2 text-zinc-400 hover:text-zinc-900 rounded-full">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Items Drawer */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 bg-zinc-50 border-t border-zinc-100 space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                          Order Snapshot & Items
                        </h4>
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-sm active:scale-95"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Official Invoice</span>
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {order.orderItems?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-white rounded-2xl border border-zinc-200 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              {item.product?.imageUrl && (
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.productNameSnapshot}
                                  className="w-12 h-12 object-cover rounded-xl border border-zinc-200"
                                />
                              )}
                              <div>
                                <h5 className="font-bold text-zinc-900">{item.productNameSnapshot}</h5>
                                <p className="text-[11px] text-zinc-500">
                                  Size: UK/US {item.size} • Qty: {item.quantity} × {formatINR(item.unitPrice)}
                                </p>
                              </div>
                            </div>
                            <span className="font-extrabold text-zinc-900">{formatINR(item.lineTotal)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery destination summary */}
                      <div className="p-4 bg-white rounded-2xl border border-zinc-200 text-xs flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <p className="font-bold text-zinc-900 uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Delivery Destination</span>
                          </p>
                          <p className="text-zinc-700 font-medium">{order.customerName}</p>
                          <p className="text-zinc-500">{order.deliveryAddress}, {order.city}, {order.state} - {order.postalCode}</p>
                          <p className="text-zinc-500 mt-0.5">Phone: {order.phone}</p>
                        </div>

                        <div className="text-right sm:border-l sm:border-zinc-100 sm:pl-4 space-y-1">
                          <p className="text-zinc-500">Subtotal: <span className="font-bold text-zinc-900">{formatINR(order.subtotal)}</span></p>
                          <p className="text-zinc-500">Shipping: <span className="font-bold text-zinc-900">{Number(order.shippingCost) === 0 ? 'FREE' : formatINR(order.shippingCost)}</span></p>
                          <p className="font-black text-zinc-950 pt-1 border-t border-zinc-100">Total: {formatINR(order.totalAmount)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoice Modal for Selected Order */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </div>
  );
}
