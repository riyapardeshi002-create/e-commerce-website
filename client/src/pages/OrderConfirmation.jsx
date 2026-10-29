import React, { useState } from 'react';
import { CheckCircle2, Package, ArrowRight, Printer, FileText } from 'lucide-react';
import { formatINR } from '../api/client';
import InvoiceModal from '../components/InvoiceModal';

export default function OrderConfirmation({ order, onContinueShopping, onViewOrders }) {
  const [showInvoice, setShowInvoice] = useState(false);

  if (!order) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-zinc-200/80 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-emerald-600 block">
          ORDER CONFIRMED & PROCESSED
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
          Thank you for your order!
        </h1>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Your order has been recorded in the PostgreSQL database, inventory counts have been atomically updated, and an official purchase bill has been generated.
        </p>

        {/* Order Identifier Box */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl py-3.5 px-6 inline-block mt-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Order Reference Number</p>
          <p className="text-lg font-black text-zinc-950 font-mono tracking-wider">{order.orderNumber}</p>
        </div>

        {/* Simulated Delivery Timeline */}
        <div className="pt-6 max-w-md mx-auto">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 mb-2">
            <span className="text-emerald-600">✓ Confirmed</span>
            <span className="text-zinc-900">Processing</span>
            <span className="text-zinc-400">Dispatched</span>
            <span className="text-zinc-400">Delivered</span>
          </div>
          <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-1/3 rounded-full"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setShowInvoice(true)}
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition active:scale-95 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>View & Print Bill / Invoice</span>
          </button>

          <button
            onClick={onViewOrders}
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition active:scale-95 flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>My Orders</span>
          </button>

          <button
            onClick={onContinueShopping}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition active:scale-95 flex items-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Itemized Order Details Card */}
      <div className="mt-8 bg-zinc-50 rounded-3xl p-6 sm:p-8 border border-zinc-200 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">
            Order Summary & Snapshots
          </h3>
          <button
            onClick={() => setShowInvoice(true)}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Open Printable Tax Invoice</span>
          </button>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {order.orderItems?.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-zinc-200/80 text-xs">
              <div className="flex items-center gap-3">
                {item.product?.imageUrl && (
                  <img
                    src={item.product.imageUrl}
                    alt={item.productNameSnapshot}
                    className="w-12 h-12 object-cover rounded-xl border border-zinc-200"
                  />
                )}
                <div>
                  <h4 className="font-bold text-zinc-900">{item.productNameSnapshot}</h4>
                  <p className="text-[11px] text-zinc-500">
                    Size: UK/US {item.size} • Qty: {item.quantity} × {formatINR(item.unitPrice)}
                  </p>
                </div>
              </div>
              <span className="font-extrabold text-zinc-900">
                {formatINR(item.lineTotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Delivery Details */}
        <div className="border-t border-zinc-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] mb-1">
              Delivery Address
            </h4>
            <p className="text-zinc-600 font-medium">{order.customerName}</p>
            <p className="text-zinc-500">{order.deliveryAddress}</p>
            <p className="text-zinc-500">{order.city}, {order.state} - {order.postalCode}</p>
            <p className="text-zinc-500 mt-1">Contact: {order.phone}</p>
          </div>

          <div className="text-right sm:border-l sm:border-zinc-200 sm:pl-4 space-y-1">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal:</span>
              <span className="font-bold text-zinc-900">{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Shipping:</span>
              <span className="font-bold text-zinc-900">
                {Number(order.shippingCost) === 0 ? 'FREE' : formatINR(order.shippingCost)}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-zinc-950 pt-2 border-t border-zinc-200">
              <span>Total Paid:</span>
              <span>{formatINR(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        order={order}
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
      />
    </div>
  );
}
