import React, { useState } from 'react';
import { Heart, Trash2, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatINR } from '../api/client';

export default function Wishlist({ onNavigate, onSelectProduct }) {
  const { items, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState({});
  const [movingId, setMovingId] = useState(null);

  const handleSelectSize = (itemId, size) => {
    setSelectedSizes({ ...selectedSizes, [itemId]: size });
  };

  const handleMoveToBag = async (item) => {
    const chosenSize = selectedSizes[item.id] || item.product?.sizes?.find(s => s.stockQuantity > 0)?.size;
    if (!chosenSize) {
      alert('Please choose a size first.');
      return;
    }

    try {
      setMovingId(item.id);
      await addToCart(item.productId, chosenSize, 1);
      await removeFromWishlist(item.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setMovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-zinc-100 rounded-2xl h-72 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">Your Wishlist</h1>
          <p className="text-xs text-zinc-500 mt-1">Saved footwear silhouettes and future additions to your bag</p>
        </div>
        <span className="text-xs font-bold bg-zinc-100 text-zinc-800 px-3 py-1 rounded-full">
          {items.length} {items.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 p-8">
          <Heart className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-900">Your wishlist is currently empty</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Click the heart icon on any sneaker to save it to your wishlist for later.
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="mt-5 bg-zinc-950 text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-zinc-800 transition"
          >
            Explore Catalogue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const p = item.product;
            if (!p) return null;
            const chosenSize = selectedSizes[item.id] || p.sizes?.find(s => s.stockQuantity > 0)?.size;
            const hasSale = p.salePrice && Number(p.salePrice) < Number(p.price);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div
                    onClick={() => onSelectProduct(p)}
                    className="aspect-square bg-zinc-100 rounded-2xl overflow-hidden mb-3 relative cursor-pointer group"
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(item.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur rounded-full text-zinc-400 hover:text-rose-600 shadow-sm"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{p.brand}</p>
                  <h3
                    onClick={() => onSelectProduct(p)}
                    className="text-sm font-bold text-zinc-900 line-clamp-1 cursor-pointer hover:underline"
                  >
                    {p.name}
                  </h3>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm font-extrabold text-zinc-900">
                      {formatINR(hasSale ? p.salePrice : p.price)}
                    </span>
                    {hasSale && (
                      <span className="text-xs text-zinc-400 line-through">
                        {formatINR(p.price)}
                      </span>
                    )}
                  </div>

                  {/* Size options */}
                  <div className="mt-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                      Choose Size:
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {p.sizes?.map((sz) => (
                        <button
                          key={sz.size}
                          onClick={() => handleSelectSize(item.id, sz.size)}
                          disabled={sz.stockQuantity <= 0}
                          className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition ${
                            sz.stockQuantity <= 0
                              ? 'opacity-30 line-through bg-zinc-50 border-zinc-200'
                              : chosenSize === sz.size
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                          }`}
                        >
                          {sz.size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100">
                  <button
                    onClick={() => handleMoveToBag(item)}
                    disabled={movingId === item.id}
                    className="w-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{movingId === item.id ? 'Moving...' : 'Move to Bag'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
