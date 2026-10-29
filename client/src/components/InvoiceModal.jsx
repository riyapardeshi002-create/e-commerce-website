import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle2, PackageCheck, FileText, ArrowDownToLine } from 'lucide-react';
import { formatINR } from '../api/client';

export default function InvoiceModal({ order, isOpen, onClose }) {
  const invoiceRef = useRef(null);

  if (!isOpen || !order) return null;

  const invoiceNumber = order.orderNumber
    ? order.orderNumber.replace('SOLE-', 'INV-')
    : `INV-${order.id?.slice(0, 8).toUpperCase()}`;

  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(order.createdAt || Date.now()).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      {/* Container Box */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-zinc-200 my-auto flex flex-col max-h-[92vh]">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-zinc-950 text-white px-6 py-4 flex items-center justify-between border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-brand-400">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">Purchase Invoice / Bill</h2>
              <p className="text-[11px] text-zinc-400 font-mono">{invoiceNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm active:scale-95"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-3 py-2 rounded-xl items-center gap-1.5 transition"
              title="Select 'Save as PDF' in print destination"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition ml-2"
              aria-label="Close invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-10 bg-white" id="sole-printable-invoice" ref={invoiceRef}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b-2 border-zinc-950 gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 uppercase">
                  SOLE
                </span>
                <span className="text-xs font-extrabold uppercase bg-zinc-950 text-white px-2 py-0.5 rounded tracking-widest">
                  SHOE STORE
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Premium Contemporary Footwear & Authentic Sneaker House
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                GSTIN: 29AAECS1234F1Z8 • sole-client.onrender.com
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block">
                TAX INVOICE
              </span>
              <p className="font-mono text-base font-black text-zinc-950 mt-0.5">
                {invoiceNumber}
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                <span className="text-zinc-400">Order No: </span>
                <span className="font-mono font-bold text-zinc-900">{order.orderNumber}</span>
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Date: {formattedDate} at {formattedTime}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" />
                <span>PAID — DEMO CHECKOUT</span>
              </div>
            </div>
          </div>

          {/* Billing & Shipping Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-zinc-200 text-xs">
            <div>
              <h4 className="font-black uppercase tracking-wider text-zinc-400 text-[10px] mb-2">
                BILLED & SHIPPED TO
              </h4>
              <p className="font-bold text-zinc-950 text-sm">{order.customerName}</p>
              <p className="text-zinc-600 mt-1">{order.deliveryAddress}</p>
              <p className="text-zinc-600">
                {order.city}, {order.state} - <span className="font-mono font-semibold">{order.postalCode}</span>
              </p>
              <p className="text-zinc-600 mt-1">
                <span className="text-zinc-400">Phone: </span>
                <span className="font-medium text-zinc-900">{order.phone}</span>
              </p>
              {order.user?.email && (
                <p className="text-zinc-600">
                  <span className="text-zinc-400">Email: </span>
                  <span className="font-medium text-zinc-900">{order.user.email}</span>
                </p>
              )}
            </div>

            <div className="sm:text-right">
              <h4 className="font-black uppercase tracking-wider text-zinc-400 text-[10px] mb-2">
                ORDER DISPATCH DETAILS
              </h4>
              <p className="text-zinc-600">
                <span className="text-zinc-400">Fulfillment Center: </span>
                <span className="font-medium text-zinc-900">SOLE Bengaluru Hub</span>
              </p>
              <p className="text-zinc-600 mt-1">
                <span className="text-zinc-400">Shipping Mode: </span>
                <span className="font-medium text-zinc-900">Standard Express (3-5 Days)</span>
              </p>
              <p className="text-zinc-600 mt-1">
                <span className="text-zinc-400">Payment Channel: </span>
                <span className="font-medium text-zinc-900">Simulated Demo Transaction</span>
              </p>
              <p className="text-zinc-600 mt-1">
                <span className="text-zinc-400">Verification: </span>
                <span className="font-mono text-[11px] text-zinc-700">Atomic PostgreSQL Commit</span>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-6 border-b border-zinc-200">
            <h4 className="font-black uppercase tracking-wider text-zinc-400 text-[10px] mb-3">
              PURCHASED ITEMS & INVENTORY SNAPSHOT
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-300 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    <th className="pb-2.5">Item Description</th>
                    <th className="pb-2.5">Brand</th>
                    <th className="pb-2.5 text-center">Size</th>
                    <th className="pb-2.5 text-center">Qty</th>
                    <th className="pb-2.5 text-right">Unit Price</th>
                    <th className="pb-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {order.orderItems?.map((item, idx) => {
                    const originalPrice = item.product?.price ? Number(item.product.price) : null;
                    const unitPrice = Number(item.unitPrice);
                    const hasDiscount = originalPrice && originalPrice > unitPrice;

                    return (
                      <tr key={item.id || idx} className="hover:bg-zinc-50/50">
                        <td className="py-3 pr-2">
                          <p className="font-bold text-zinc-950">{item.productNameSnapshot}</p>
                          <p className="text-[10px] text-zinc-400 font-mono">
                            SKU: SOLE-{item.productId?.slice(0, 6).toUpperCase() || 'ITEM'}
                          </p>
                        </td>
                        <td className="py-3 text-zinc-700 font-medium">
                          {item.product?.brand || 'SOLE'}
                        </td>
                        <td className="py-3 text-center font-bold text-zinc-900">
                          UK/US {item.size}
                        </td>
                        <td className="py-3 text-center text-zinc-700">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-right text-zinc-900">
                          {formatINR(unitPrice)}
                          {hasDiscount && (
                            <span className="block text-[10px] text-zinc-400 line-through">
                              {formatINR(originalPrice)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right font-black text-zinc-950">
                          {formatINR(item.lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Totals Section */}
          <div className="py-6 flex flex-col sm:flex-row justify-between gap-6 border-b border-zinc-200 text-xs">
            {/* Left: Notes & Project Notice */}
            <div className="space-y-2 max-w-sm">
              <p className="font-bold text-zinc-900 uppercase text-[10px] tracking-wider">
                Store Policy & Verification
              </p>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                • 100% Authentic shoe guarantee on all inspected models.<br />
                • 30-day hassle-free return on unworn pairs with original tags.<br />
                • This bill was generated for a College Cloud Computing Project demonstration.
              </p>
            </div>

            {/* Right: Calculations */}
            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-zinc-950">{formatINR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Estimated Taxes (GST 18%):</span>
                <span className="text-zinc-500 font-medium">Included</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Shipping & Handling:</span>
                <span className="font-semibold text-zinc-950">
                  {Number(order.shippingCost) === 0 ? 'FREE' : formatINR(order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-zinc-950 pt-3 border-t-2 border-zinc-950">
                <span>Total Amount:</span>
                <span>{formatINR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4 text-xs text-zinc-400">
            <div>
              <p className="font-bold text-zinc-900">Thank you for shopping with SOLE!</p>
              <p className="text-[11px] mt-0.5">For customer support, reach out to help@sole.store or call 1800-SOLE-SHOE.</p>
            </div>
            <div className="text-center sm:text-right">
              <div className="w-28 h-8 border-b border-zinc-300 mx-auto sm:ml-auto"></div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-1">
                Authorized Signature
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer (Hidden when printing) */}
        <div className="no-print bg-zinc-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-zinc-200 gap-3 flex-shrink-0">
          <p className="text-[11px] text-zinc-500 text-center sm:text-left">
            💡 Tip: In the browser print dialog, select <strong>"Save as PDF"</strong> to download a digital invoice copy.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold px-4 py-2.5 rounded-xl transition active:scale-95"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
