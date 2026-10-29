import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Flame, Compass, Send } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productsApi } from '../api/client';

export default function Home({ onNavigate, onSelectProduct, onSelectCategory }) {
  const [trending, setTrending] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [trendRes, newRes] = await Promise.all([
        productsApi.getAll({ featured: true, limit: 4 }),
        productsApi.getAll({ sort: 'newest', limit: 8 }),
      ]);
      if (trendRes.success) setTrending(trendRes.data);
      if (newRes.success) setNewArrivals(newRes.data);
    } catch (err) {
      console.error('Error loading home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const categoryCards = [
    { name: 'Running', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', tag: 'High Performance' },
    { name: 'Casual', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80', tag: 'Everyday Comfort' },
    { name: 'Sports', image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&q=80', tag: 'Training & Turf' },
    { name: 'Men', image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80', tag: 'Men’s Silhouettes' },
    { name: 'Women', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80', tag: 'Women’s Heritage' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Large Editorial Hero Section */}
      <section className="relative overflow-hidden bg-zinc-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-4 border border-zinc-900">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-6 z-10">
            <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COLLECTION 2026 DROP // EDITION 01</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.95]">
              PRECISION <br />
              <span className="text-zinc-500">IN EVERY</span> <br />
              STRIDE<span className="text-brand-500">.</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed">
              Engineered for velocity, street aesthetics, and uncompromising comfort. Discover authenticated performance sneakers from the world's most sought-after sportswear creators.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => { onSelectCategory(null); onNavigate('shop'); }}
                className="bg-white hover:bg-zinc-100 text-zinc-950 font-extrabold text-xs uppercase tracking-wider px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl transition active:scale-95 flex items-center gap-2"
              >
                <span>Shop All Shoes</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('shop', { section: 'trending' })}
                className="bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-800 font-bold text-xs uppercase tracking-wider px-7 py-3.5 rounded-full transition active:scale-95 flex items-center gap-2"
              >
                <Flame className="w-4 h-4 text-brand-500" />
                <span>Trending Drops</span>
              </button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-square">
              {/* Subtle back glowing ring */}
              <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full transform -translate-y-4"></div>
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=85"
                alt="SOLE Hero Sneaker"
                className="relative w-full h-full object-contain -rotate-12 drop-shadow-2xl hover:rotate-0 transition-transform duration-700 cursor-pointer"
                onClick={() => { onSelectCategory(null); onNavigate('shop'); }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Category Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-1">Curation</p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">Shop by Category</h2>
          </div>
          <button
            onClick={() => { onSelectCategory(null); onNavigate('shop'); }}
            className="text-xs font-bold text-zinc-900 hover:text-brand-600 transition flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categoryCards.map((cat) => (
            <div
              key={cat.name}
              onClick={() => { onSelectCategory(cat.name); onNavigate('shop', { category: cat.name }); }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer bg-zinc-900 border border-zinc-200/60 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 block mb-0.5">
                  {cat.tag}
                </span>
                <h3 className="text-base font-extrabold text-white tracking-tight flex items-center justify-between">
                  <span>{cat.name}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">&rarr;</span>
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Trending Footwear Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-600 mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Most Popular</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">Trending Footwear</h2>
          </div>
          <button
            onClick={() => onNavigate('shop', { section: 'trending' })}
            className="text-xs font-bold text-zinc-900 hover:text-brand-600 transition flex items-center gap-1"
          >
            <span>Explore Trending</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-zinc-100 rounded-2xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {trending.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Promotional Seasonal Editorial Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-zinc-900 text-white p-8 sm:p-14 border border-zinc-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 lg:opacity-60 hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=900&q=80"
              alt="Promotion"
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="relative z-10 max-w-lg space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-brand-500 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
              LIMITED TIME PROMOTION
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase leading-none">
              SUMMER VELOCITY <br />
              <span className="text-brand-400">UP TO 25% OFF</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Equip your training rotation with high-stack marathon runners, responsive turf trainers, and retro street classics.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('shop')}
                className="bg-white hover:bg-zinc-100 text-zinc-950 font-extrabold text-xs uppercase tracking-wider px-7 py-3 rounded-full transition active:scale-95 flex items-center gap-2"
              >
                <span>Shop Promotion</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. New Arrivals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-1">Latest Additions</p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">New Arrivals</h2>
          </div>
          <button
            onClick={() => onNavigate('shop', { sort: 'newest' })}
            className="text-xs font-bold text-zinc-900 hover:text-brand-600 transition flex items-center gap-1"
          >
            <span>Browse All New</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-zinc-100 rounded-2xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* 6. Newsletter Subscription */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-zinc-100 rounded-3xl p-8 sm:p-12 border border-zinc-200">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-brand-600 block mb-2">
            STAY IN THE ROTATION
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            Get First Access to Exclusive Drops
          </h3>
          <p className="text-xs text-zinc-600 mt-2 max-w-md mx-auto">
            Subscribe to receive insider release dates, restock alerts, and member-only promotions directly to your inbox.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="mt-6 flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 bg-white border border-zinc-300 rounded-full px-5 py-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 shadow-sm"
            />
            <button
              type="submit"
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition active:scale-95 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Subscribe</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {subscribed && (
            <p className="text-xs font-bold text-emerald-600 mt-3 animate-fade-in">
              ✓ Welcome to the SOLE Community! You are now subscribed.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
