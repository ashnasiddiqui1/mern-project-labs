import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function ProductCard({ product }) {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState("");
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);
  const [cartError, setCartError] = useState("");

  const savedInWishlist = isWishlisted(product._id);

  const cartEntry = cartItems.find(
    (item) => (item.product?._id || item.product) === product._id
  );

  const currentCartQty = cartEntry ? cartEntry.quantity : 0;
  const currentTotalStock =
    cartEntry && cartEntry.product && typeof cartEntry.product.stock === "number"
      ? cartEntry.product.stock
      : (product?.stock || 0);

  const remainingAvailableStock = Math.max(0, currentTotalStock - currentCartQty);

  const handleWishlistClick = async () => {
    if (isUpdatingWishlist) return;
    setIsUpdatingWishlist(true);
    setWishlistError("");

    const res = await toggleWishlist(product);
    if (!res.success) {
      if (res.status === 401) {
        setWishlistError("Please login to save favorites");
      } else {
        setWishlistError(res.error || "Could not update wishlist");
      }
    }
    setIsUpdatingWishlist(false);
  };

  const handleAddToCartClick = async () => {
    if (isUpdatingCart || remainingAvailableStock <= 0) return;
    setIsUpdatingCart(true);
    setCartError("");

    const res = await addToCart(product._id);
    if (!res.success) {
      if (res.status === 401) {
        setCartError("Please login to add items to cart");
      } else {
        setCartError(res.error || "Failed to add to cart");
      }
    }
    setIsUpdatingCart(false);
  };

  const handleIncrement = async () => {
    if (!cartEntry || isUpdatingCart || cartEntry.quantity >= currentTotalStock) return;
    setIsUpdatingCart(true);
    setCartError("");

    const res = await updateQuantity(product._id, cartEntry.quantity + 1);
    if (!res.success) {
      setCartError(res.error || "Cannot increase quantity");
    }
    setIsUpdatingCart(false);
  };

  const handleDecrement = async () => {
    if (!cartEntry || isUpdatingCart) return;
    setIsUpdatingCart(true);
    setCartError("");

    if (cartEntry.quantity <= 1) {
      const res = await removeFromCart(product._id);
      if (!res.success) {
        setCartError(res.error || "Failed to remove item");
      }
    } else {
      const res = await updateQuantity(product._id, cartEntry.quantity - 1);
      if (!res.success) {
        setCartError(res.error || "Cannot decrease quantity");
      }
    }
    setIsUpdatingCart(false);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Product Image & Badges */}
        <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&auto=format&fit=crop&q=80";
            }}
          />

          {/* Category Pill Tag */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-white/90 backdrop-blur-md text-slate-700 shadow-xs border border-slate-200/60">
              {product.category}
            </span>
          </div>

          {/* Wishlist Heart Button */}
          <div className="absolute top-3 right-3">
            <button
              onClick={handleWishlistClick}
              disabled={isUpdatingWishlist}
              title={savedInWishlist ? "Remove from wishlist" : "Save to wishlist"}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
                savedInWishlist
                  ? "bg-rose-500 text-white hover:bg-rose-600 scale-105"
                  : "bg-white/90 backdrop-blur-md text-slate-600 hover:text-rose-500 hover:bg-white"
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="p-4 sm:p-5">
          {wishlistError && (
            <div className="mb-2 p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-[11px]">
              {wishlistError}
            </div>
          )}

          <h3
            className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors mb-1.5"
            title={product.name}
          >
            {product.name}
          </h3>

          <div className="flex items-baseline justify-between gap-2 mb-3">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>

            {/* Live Stock Badge */}
            <div className="text-right">
              {remainingAvailableStock > 0 ? (
                remainingAvailableStock <= 5 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Only {remainingAvailableStock} left!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {remainingAvailableStock} in stock
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Out of stock
                </span>
              )}
            </div>
          </div>

          {cartError && (
            <div className="mb-3 p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-[11px]">
              {cartError}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 sm:p-5 pt-0 space-y-2">
        {!cartEntry ? (
          <button
            onClick={handleAddToCartClick}
            disabled={isUpdatingCart || currentTotalStock <= 0 || remainingAvailableStock <= 0}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
              currentTotalStock <= 0 || remainingAvailableStock <= 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : isUpdatingCart
                ? "bg-indigo-400 text-white cursor-wait"
                : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md hover:shadow-indigo-200"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <span>{isUpdatingCart ? "Adding..." : currentTotalStock <= 0 ? "Out of Stock" : "Add to Bag"}</span>
          </button>
        ) : (
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1 h-10">
            <button
              onClick={handleDecrement}
              disabled={isUpdatingCart}
              className="w-8 h-8 rounded-lg bg-white shadow-xs border border-slate-200/60 text-slate-700 hover:bg-slate-100 font-bold text-sm flex items-center justify-center transition disabled:opacity-50 cursor-pointer"
              title={cartEntry.quantity === 1 ? "Remove from bag" : "Decrease quantity"}
            >
              -
            </button>
            <span className="text-xs font-bold text-slate-800">
              {isUpdatingCart ? "..." : `${cartEntry.quantity} in Bag`}
            </span>
            <button
              onClick={handleIncrement}
              disabled={cartEntry.quantity >= currentTotalStock || isUpdatingCart}
              className="w-8 h-8 rounded-lg bg-white shadow-xs border border-slate-200/60 text-slate-700 hover:bg-slate-100 font-bold text-sm flex items-center justify-center transition disabled:opacity-50 cursor-pointer"
              title="Increase quantity"
            >
              +
            </button>
          </div>
        )}

        <Link
          to={`/products/${product._id}`}
          className="block w-full py-2 text-center text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-colors"
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}
