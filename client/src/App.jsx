import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Account from './pages/Account';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/AdminDashboard';

function MainApp() {
  const { user, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'shop' | 'product-detail' | 'checkout' | 'order-confirmation' | 'account' | 'wishlist' | 'admin'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [shopFilters, setShopFilters] = useState({});
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);

  // Navigation router
  const handleNavigate = (view, options = {}) => {
    if (view === 'shop') {
      if (options.category !== undefined) {
        setSelectedCategory(options.category);
      }
      setShopFilters(options);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order) => {
    setLastPlacedOrder(order);
    setCurrentView('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Admin Dashboard mode
  if (currentView === 'admin' && isAdmin) {
    return (
      <AdminDashboard onExitAdmin={() => handleNavigate('home')} />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 selection:bg-zinc-950 selection:text-white">
      {/* Navbar Header */}
      <Navbar
        onNavigate={handleNavigate}
        currentView={currentView}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentView === 'home' && (
          <Home
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {currentView === 'shop' && (
          <Shop
            initialFilters={{ ...shopFilters, category: selectedCategory }}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'product-detail' && (
          <ProductDetail
            product={selectedProduct}
            productId={selectedProduct?.id}
            onBack={() => handleNavigate('shop')}
            onSelectRelated={handleSelectProduct}
          />
        )}

        {currentView === 'checkout' && (
          <Checkout
            onBack={() => handleNavigate('shop')}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentView === 'order-confirmation' && (
          <OrderConfirmation
            order={lastPlacedOrder}
            onContinueShopping={() => handleNavigate('shop')}
            onViewOrders={() => handleNavigate('account')}
          />
        )}

        {currentView === 'account' && (
          <Account
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'wishlist' && (
          <Wishlist
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => handleNavigate('checkout')}
        onContinueShopping={() => handleNavigate('shop')}
      />

      {/* Global Auth Modal */}
      <AuthModal />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <MainApp />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
