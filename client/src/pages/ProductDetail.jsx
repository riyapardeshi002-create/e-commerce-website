import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, ArrowLeft, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import { formatINR, productsApi } from '../api/client';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail({ product: initialProduct, productId, onBack, onSelectRelated }) {
  const [product, setProduct] = useState(initialProduct || null);
  const [selectedImage, setSelectedImage] = useState(initialProduct?.imageUrl || '');
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(!initialProduct);
  const [addingToCart, setAddingToCart] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message }

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated, openAuthModal } = useAuth();

  useEffect(() => {
    if (productId && (!product || product.id !== productId)) {
      loadProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.imageUrl);
      // Auto-select first in-stock size if available
      const firstInStock = product.sizes?.find((s) => s.stockQuantity > 0);
      if (firstInStock) {
        setSelectedSize(firstInStock.size);
      }
    }
  }, [product]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await productsApi.getById(productId);
      if (res.success) {
        setProduct(res.data);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="h-6 w-32 bg-zinc-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-zinc-200 rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-zinc-200 rounded w-3/4"></div>
            <div className="h-6 bg-zinc-200 rounded w-1/4"></div>
            <div className="h-24 bg-zinc-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const hasSale = product.salePrice && Number(product.salePrice) < Number(product.price);
  const discountPercent = hasSale
    ? Math.round(((Number(product.price) - Number(product.salePrice)) / Number(product.price)) * 100)
    : 0;

  // Selected size record
  const currentSizeRecord = product.sizes?.find((s) => s.size === selectedSize);
  const maxStock = currentSizeRecord ? currentSizeRecord.stockQuantity : 0;
  const isSelectedSizeOutOfStock = currentSizeRecord ? currentSizeRecord.stockQuantity <= 0 : false;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setFeedback({ type: 'error', message: 'Please select a shoe size before adding to bag.' });
      return;
    }
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (isSelectedSizeOutOfStock) {
      setFeedback({ type: 'error', message: `Size UK/US ${selectedSize} is currently out of stock.` });
      return;
    }

    try {
      setAddingToCart(true);
      setFeedback(null);
      await addToCart(product.id, selectedSize, quantity);
      setFeedback({ type: 'success', message: `Added to bag: Size UK/US ${selectedSize} (Qty: ${quantity})` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setAddingToCart(false);
    }
  };

  // Gallery images (main image + additional images)
  const allImages = [
    product.imageUrl,
    ...(product.images?.map((img) => img.imageUrl) || []),
  ].filter((url, idx, arr) => arr.indexOf(url) === idx);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-8">
        <button onClick={onBack} className="hover:text-zinc-950 flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to catalogue</span>
        </button>
        <span>/</span>
        <span className="uppercase">{product.category}</span>
        <span>/</span>
        <span className="text-zinc-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Multi-image Gallery */}
        <div className="space-y-4">
          {/* Main Large Image */}
          <div className="aspect-square bg-zinc-100 rounded-3xl overflow-hidden border border-zinc-200/80 relative flex items-center justify-center">
            <img
              src={selectedImage || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {hasSale && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-md">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl bg-zinc-100 border-2 overflow-hidden flex-shrink-0 transition ${
                    selectedImage === img
                      ? 'border-zinc-950 shadow-md ring-2 ring-zinc-950/20'
                      : 'border-zinc-200 hover:border-zinc-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-brand-600 mb-1.5">
              <span>{product.brand}</span>
              <span className="text-zinc-400 font-medium">{product.category} Edition</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-zinc-950">
                {formatINR(hasSale ? product.salePrice : product.price)}
              </span>
              {hasSale && (
                <>
                  <span className="text-base text-zinc-400 line-through">
                    {formatINR(product.price)}
                  </span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    Save {formatINR(Number(product.price) - Number(product.salePrice))}
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Inclusive of all applicable taxes</p>
          </div>

          {/* Description */}
          <div className="border-t border-b border-zinc-200 py-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">Description</h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Select Size (UK/US)
              </label>
              {selectedSize && (
                <span className="text-xs text-zinc-500">
                  {maxStock > 0 ? (
                    maxStock <= 5 ? (
                      <span className="text-amber-600 font-bold">Only {maxStock} pairs remaining!</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">In Stock ({maxStock} pairs)</span>
                    )
                  ) : (
                    <span className="text-rose-600 font-bold">Currently Sold Out</span>
                  )}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {product.sizes?.map((sz) => {
                const isOutOfStock = sz.stockQuantity <= 0;
                const isSelected = selectedSize === sz.size;

                return (
                  <button
                    key={sz.size}
                    onClick={() => {
                      setSelectedSize(sz.size);
                      setQuantity(1);
                      setFeedback(null);
                    }}
                    disabled={isOutOfStock}
                    className={`py-3 rounded-2xl text-xs font-extrabold border transition-all duration-150 relative ${
                      isOutOfStock
                        ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-zinc-950 text-white border-zinc-950 shadow-md ring-2 ring-zinc-950/20'
                        : 'bg-white text-zinc-900 border-zinc-300 hover:border-zinc-900'
                    }`}
                  >
                    <span>{sz.size}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-zinc-300 bg-white rounded-xl">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="p-2.5 text-zinc-600 hover:text-zinc-950 disabled:opacity-30 rounded-l-xl transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-zinc-900 min-w-[24px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxStock || 1, q + 1))}
                  disabled={quantity >= maxStock}
                  className="p-2.5 text-zinc-600 hover:text-zinc-950 disabled:opacity-30 rounded-r-xl transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] text-zinc-500">
                Max {maxStock > 0 ? maxStock : 1} per customer
              </span>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || isSelectedSizeOutOfStock}
              className="flex-1 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-extrabold py-4 px-6 rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-[0.99] shadow-lg flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{addingToCart ? 'Adding to Bag...' : isSelectedSizeOutOfStock ? 'Sold Out in this Size' : 'Add to Bag'}</span>
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-4 rounded-2xl border transition-all shadow-sm ${
                isSaved
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-zinc-300 text-zinc-600 hover:text-zinc-950 hover:border-zinc-950'
              }`}
              title={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
            </button>
          </div>

          {/* Benefits Micro-cards */}
          <div className="grid grid-cols-3 gap-3 pt-4 text-center">
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80">
              <Truck className="w-4 h-4 text-zinc-700 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-zinc-900">Express Delivery</p>
              <p className="text-[9px] text-zinc-400">2-4 Business Days</p>
            </div>
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80">
              <ShieldCheck className="w-4 h-4 text-zinc-700 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-zinc-900">100% Genuine</p>
              <p className="text-[9px] text-zinc-400">Verified Authentic</p>
            </div>
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80">
              <RotateCcw className="w-4 h-4 text-zinc-700 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-zinc-900">Free Exchange</p>
              <p className="text-[9px] text-zinc-400">7-Day Fit Guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-zinc-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
              You May Also Like
            </h2>
            <span className="text-xs text-zinc-500">More in {product.category}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {product.relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelect={(p) => {
                  setProduct(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
