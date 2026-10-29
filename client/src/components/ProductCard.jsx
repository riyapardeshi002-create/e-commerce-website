import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { formatINR } from '../api/client';
import { useWishlist } from '../context/WishlistContext';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80';

export default function ProductCard({ product, onSelect }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imgSrc, setImgSrc] = useState(product.imageUrl || FALLBACK_IMAGE);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const isSaved = isInWishlist(product.id);
  const hasSale = product.salePrice && Number(product.salePrice) < Number(product.price);
  const discountPercent = hasSale
    ? Math.round(((Number(product.price) - Number(product.salePrice)) / Number(product.price)) * 100)
    : 0;

  // Calculate total stock across all sizes
  const totalStock = product.sizes?.reduce((sum, s) => sum + s.stockQuantity, 0) || 0;
  const isOutOfStock = totalStock <= 0;

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    try {
      setWishlistLoading(true);
      await toggleWishlist(product.id);
    } catch (_err) {
      // handled in context
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative bg-white rounded-2xl p-3 sm:p-4 border border-zinc-200/80 hover:border-zinc-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Shoe Image Box */}
        <div className="relative aspect-square w-full rounded-xl bg-zinc-100 overflow-hidden mb-3.5 flex items-center justify-center">
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {hasSale && (
              <span className="bg-rose-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
            {product.featured && (
              <span className="bg-zinc-900 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-sm">
                Featured
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-zinc-700 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-sm">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            disabled={wishlistLoading}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all duration-200 shadow-sm z-10 ${
              isSaved
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                : 'bg-white/90 backdrop-blur-sm text-zinc-500 hover:text-zinc-950 hover:bg-white'
            }`}
            title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
          </button>

          {/* Quick Details Hover Bar */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <span className="w-full py-2 bg-zinc-900/90 backdrop-blur text-white text-xs font-semibold rounded-xl text-center shadow-md flex items-center justify-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              View Details
            </span>
          </div>
        </div>

        {/* Product Brand & Category */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium mb-1 uppercase tracking-wider">
          <span>{product.brand}</span>
          <span>{product.category}</span>
        </div>

        {/* Product Title */}
        <h3 className="text-sm font-bold text-zinc-900 line-clamp-1 group-hover:text-zinc-950 tracking-tight">
          {product.name}
        </h3>

        {/* Available Sizes Hint */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex items-center gap-1 mt-1 text-[11px] text-zinc-400">
            <span>Sizes:</span>
            <span className="font-medium text-zinc-600">
              {product.sizes.map((s) => s.size).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Price & Action Row */}
      <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-extrabold text-zinc-900">
            {formatINR(hasSale ? product.salePrice : product.price)}
          </span>
          {hasSale && (
            <span className="text-xs text-zinc-400 line-through">
              {formatINR(product.price)}
            </span>
          )}
        </div>

        <span className="text-xs font-semibold text-zinc-900 group-hover:text-brand-600 transition flex items-center gap-1">
          Select &rarr;
        </span>
      </div>
    </div>
  );
}
