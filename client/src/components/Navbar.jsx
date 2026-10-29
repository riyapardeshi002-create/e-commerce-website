import React, { useState } from 'react';
import { ShoppingBag, Heart, User, Menu, X, Search, ShieldCheck, ChevronDown, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar({ onNavigate, currentView, selectedCategory, onSelectCategory }) {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Men', 'Women', 'Sports', 'Casual', 'Running'];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('shop', { search: searchQuery.trim() });
      setSearchQuery('');
    }
  };

  const handleCategoryClick = (cat) => {
    onSelectCategory(cat === 'All' ? null : cat);
    onNavigate('shop', { category: cat === 'All' ? null : cat });
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200">
      {/* Top Announcement Bar */}
      <div className="bg-zinc-950 text-white text-xs font-medium py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
        <span>FREE EXPRESS SHIPPING ON ALL ORDERS ABOVE ₹2,000 | 100% VERIFIED AUTHENTIC FOOTWEAR</span>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-700 hover:text-black hover:bg-zinc-100 rounded-lg transition"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <span className="font-black text-3xl tracking-tighter text-zinc-950 flex items-center gap-1.5">
              SOLE<span className="text-brand-500 text-4xl leading-none">.</span>
            </span>
          </div>

          {/* Desktop Category Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-semibold transition tracking-tight ${
                currentView === 'home' ? 'text-zinc-950 border-b-2 border-zinc-950 pb-1' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => { onSelectCategory(null); onNavigate('shop'); }}
              className={`text-sm font-semibold transition tracking-tight ${
                currentView === 'shop' && !selectedCategory ? 'text-zinc-950 border-b-2 border-zinc-950 pb-1' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              All Shoes
            </button>
            {categories.filter(c => c !== 'All').map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`text-sm font-semibold transition tracking-tight ${
                  currentView === 'shop' && selectedCategory === cat
                    ? 'text-zinc-950 border-b-2 border-zinc-950 pb-1'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* Search, Wishlist, Cart & Account Actions */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Search Bar (desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Search shoes or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 bg-zinc-100 hover:bg-zinc-200/70 focus:bg-white text-xs rounded-full pl-9 pr-4 py-2 border border-transparent focus:border-zinc-300 focus:outline-none transition"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
            </form>

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-full relative transition"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-zinc-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-full relative transition"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Account / Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 pl-3 bg-zinc-100 hover:bg-zinc-200 rounded-full text-xs font-semibold text-zinc-800 transition"
                >
                  <span className="max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                  {isAdmin && (
                    <span className="bg-brand-500 text-white text-[9px] uppercase px-1.5 py-0.5 rounded-full font-bold">
                      Admin
                    </span>
                  )}
                  <div className="w-7 h-7 bg-zinc-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-zinc-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-zinc-100">
                      <p className="text-xs text-zinc-500 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-zinc-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => { onNavigate('admin'); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 flex items-center gap-2 transition"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </button>
                    )}

                    <button
                      onClick={() => { onNavigate('account'); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 transition"
                    >
                      <Package className="w-4 h-4" />
                      My Orders & Profile
                    </button>

                    <button
                      onClick={() => { onNavigate('wishlist'); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 transition"
                    >
                      <Heart className="w-4 h-4" />
                      Saved Shoes ({wishlistCount})
                    </button>

                    <div className="border-t border-zinc-100 my-1"></div>

                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="inline-flex items-center space-x-1.5 bg-zinc-950 text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-zinc-800 transition active:scale-95 shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Search shoes or brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-100 text-xs rounded-full pl-9 pr-4 py-2.5 border border-zinc-200 focus:outline-none"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
          </form>

          <div className="space-y-1">
            <button
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-zinc-900 rounded-lg hover:bg-zinc-100"
            >
              Home
            </button>
            <button
              onClick={() => { onSelectCategory(null); onNavigate('shop'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-zinc-900 rounded-lg hover:bg-zinc-100"
            >
              All Shoes
            </button>
            {categories.filter(c => c !== 'All').map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className="w-full text-left px-3 py-2 text-sm font-medium text-zinc-600 rounded-lg hover:bg-zinc-100"
              >
                {cat} Footwear
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-100 space-y-1">
            <button
              onClick={() => { onNavigate('wishlist'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-zinc-700 flex items-center justify-between"
            >
              <span>Saved Wishlist</span>
              <span className="bg-zinc-100 text-zinc-800 text-xs px-2 py-0.5 rounded-full font-bold">{wishlistCount}</span>
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { onNavigate('account'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-zinc-700"
                >
                  My Orders & Account
                </button>
                {isAdmin && (
                  <button
                    onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm font-bold text-brand-600"
                  >
                    Admin Dashboard
                  </button>
                )}
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                className="w-full mt-2 bg-zinc-950 text-white text-center py-2.5 rounded-xl text-sm font-semibold"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
