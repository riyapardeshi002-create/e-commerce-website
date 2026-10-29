import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones, ArrowRight } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-zinc-950 text-zinc-300 pt-16 pb-12 border-t border-zinc-800">
      {/* Brand Values / Value Proposition Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-zinc-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-zinc-900 rounded-xl text-brand-500 flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">Express Shipping</h4>
              <p className="text-xs text-zinc-400 mt-1">Complimentary nationwide shipping on orders over ₹2,000.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-zinc-900 rounded-xl text-brand-500 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">100% Authentic</h4>
              <p className="text-xs text-zinc-400 mt-1">Directly sourced and authenticated by footwear specialists.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-zinc-900 rounded-xl text-brand-500 flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">7-Day Free Exchange</h4>
              <p className="text-xs text-zinc-400 mt-1">Hassle-free size replacement and returns if fit isn't perfect.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-zinc-900 rounded-xl text-brand-500 flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">24/7 Concierge</h4>
              <p className="text-xs text-zinc-400 mt-1">Dedicated customer care assistance for orders and sizing.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Intro */}
          <div className="md:col-span-2 space-y-4">
            <span className="font-black text-3xl tracking-tighter text-white flex items-center gap-1">
              SOLE<span className="text-brand-500 text-4xl leading-none">.</span>
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Contemporary performance sneakers, athletic gear, and lifestyle silhouettes engineered for modern comfort, street elegance, and enduring quality.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center text-[11px] bg-zinc-900 text-zinc-300 px-3 py-1.5 rounded-full border border-zinc-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                College Cloud Computing Project — Full-Stack E-commerce
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Footwear Categories</h5>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <button onClick={() => onNavigate('shop', { category: 'Running' })} className="hover:text-white transition">
                  Running & Marathons
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'Casual' })} className="hover:text-white transition">
                  Casual & Everyday Street
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'Sports' })} className="hover:text-white transition">
                  Multi-Sport & Training
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'Men' })} className="hover:text-white transition">
                  Men's Collection
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'Women' })} className="hover:text-white transition">
                  Women's Collection
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Customer Care</h5>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li><button onClick={() => onNavigate('account')} className="hover:text-white transition">Track Your Order</button></li>
              <li><button onClick={() => onNavigate('wishlist')} className="hover:text-white transition">Saved Wishlist</button></li>
              <li><span className="hover:text-white cursor-pointer transition">Size & Fit Guide</span></li>
              <li><span className="hover:text-white cursor-pointer transition">Shipping Information</span></li>
              <li><span className="hover:text-white cursor-pointer transition">Terms & Privacy</span></li>
            </ul>
          </div>

          {/* Tech Stack Info */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Cloud Architecture</h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                <span>React + Vite (Static Site)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                <span>Express REST API (Web Service)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                <span>PostgreSQL (Render DB)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                <span>Prisma ORM & Migrations</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                <span>JWT HTTP-Only Cookies</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <p>© 2026 SOLE Inc. All Rights Reserved. Created for academic demonstration.</p>
        <p className="flex items-center gap-1.5">
          <span>Designed with precision for Cloud Computing</span>
        </p>
      </div>
    </footer>
  );
}
