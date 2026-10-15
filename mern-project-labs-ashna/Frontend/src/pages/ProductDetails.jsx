import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function ProductDetails() {
  const { id } = useParams();
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [customer, setCustomer] = useState(null);

  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState("");
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);
  const [cartError, setCartError] = useState("");

  const savedInWishlist = isWishlisted(product?._id);

  const cartEntry = product
    ? cartItems.find((item) => (item.product?._id || item.product) === product._id)
    : null;

  const currentCartQty = cartEntry ? cartEntry.quantity : 0;
  const currentTotalStock =
    cartEntry && cartEntry.product && typeof cartEntry.product.stock === "number"
      ? cartEntry.product.stock
      : (product?.stock || 0);

  const remainingAvailableStock = Math.max(0, currentTotalStock - currentCartQty);

  useEffect(() => {
    apiClient
      .get("/customers/me")
      .then((res) => setCustomer(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await apiClient.get(`/products/${id}`);
        setProduct(response.data.product || response.data);
      } catch (err) {
        console.error("Failed to load product details:", err);
        setErrorMessage("Product could not be found or has been removed.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleWishlistToggle = async () => {
    if (isUpdatingWishlist || !product) return;
    setIsUpdatingWishlist(true);
    setWishlistError("");

    const res = await toggleWishlist(product);
    if (!res.success) {
      if (res.status === 401) {
        setWishlistError("Please sign in to save products to wishlist");
      } else {
        setWishlistError(res.error || "Could not update wishlist");
      }
    }
    setIsUpdatingWishlist(false);
  };

  const handleAddToCartClick = async () => {
    if (isUpdatingCart || !product || remainingAvailableStock <= 0) return;
    setIsUpdatingCart(true);
    setCartError("");

    const res = await addToCart(product._id);
    if (!res.success) {
      if (res.status === 401) {
        setCartError("Please sign in to add products to your cart");
      } else {
        setCartError(res.error || "Failed to add product to cart");
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
      setCartError(res.error || "Failed to increase quantity");
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
        setCartError(res.error || "Failed to decrease quantity");
      }
    }
    setIsUpdatingCart(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header customer={customer} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/products" className="hover:text-indigo-600 transition">
            &larr; Back to Catalog
          </Link>
          {product && (
            <>
              <span>/</span>
              <span className="text-slate-400">{product.category}</span>
              <span>/</span>
              <span className="text-slate-800 truncate max-w-[200px]">{product.name}</span>
            </>
          )}
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-500">Loading product information...</p>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && !isLoading && (
          <div className="py-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-white border border-rose-200 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl mx-auto mb-3">
              ✕
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Item Not Found</h3>
            <p className="text-xs text-rose-600 mb-5">{errorMessage}</p>
            <Link
              to="/products"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Product Showcase */}
        {!isLoading && !errorMessage && product && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
              {/* Product Media Column */}
              <div className="relative aspect-square w-full rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/60 shadow-inner flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80";
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-slate-200/60">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Product Info & Purchase Column */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      Official ShopKart Release
                    </span>

                    {/* Wishlist Button */}
                    <button
                      onClick={handleWishlistToggle}
                      disabled={isUpdatingWishlist}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-xs cursor-pointer ${
                        savedInWishlist
                          ? "bg-rose-50 text-rose-600 border border-rose-200"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span>
                        {isUpdatingWishlist
                          ? "Saving..."
                          : savedInWishlist
                          ? "Saved to Wishlist"
                          : "Add to Wishlist"}
                      </span>
                    </button>
                  </div>

                  {wishlistError && (
                    <div className="mb-3 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
                      {wishlistError}
                    </div>
                  )}

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                    {product.name}
                  </h1>

                  <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-6">
                    <span className="text-3xl font-extrabold text-slate-900">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </span>

                    {/* Stock Status Pill */}
                    {remainingAvailableStock > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        In Stock ({remainingAvailableStock} units available)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Description Box */}
                  <div className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Description
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Value Highlights */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs flex items-center gap-2.5">
                      <span className="text-indigo-600 font-bold">✓</span>
                      <span className="text-slate-700 font-medium">Genuine Inventory</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs flex items-center gap-2.5">
                      <span className="text-indigo-600 font-bold">✓</span>
                      <span className="text-slate-700 font-medium">Razorpay Test Checkout</span>
                    </div>
                  </div>
                </div>

                {/* Purchase / Cart Actions */}
                <div className="pt-6 border-t border-slate-100">
                  {cartError && (
                    <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
                      {cartError}
                    </div>
                  )}

                  {!cartEntry ? (
                    <button
                      onClick={handleAddToCartClick}
                      disabled={isUpdatingCart || currentTotalStock <= 0 || remainingAvailableStock <= 0}
                      className={`w-full py-3.5 px-6 rounded-2xl text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                        currentTotalStock <= 0 || remainingAvailableStock <= 0
                          ? "bg-slate-300 cursor-not-allowed shadow-none"
                          : isUpdatingCart
                          ? "bg-indigo-400 cursor-wait"
                          : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-98"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                      </svg>
                      <span>
                        {isUpdatingCart
                          ? "Adding to Bag..."
                          : currentTotalStock > 0
                          ? "Add to Shopping Bag"
                          : "Product Sold Out"}
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-2 h-14">
                      <button
                        onClick={handleDecrement}
                        disabled={isUpdatingCart}
                        className="w-12 h-10 rounded-xl bg-white shadow-xs border border-slate-200/80 text-slate-800 hover:bg-slate-100 font-bold text-base flex items-center justify-center transition cursor-pointer disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="text-sm font-extrabold text-slate-800">
                        {isUpdatingCart ? "Updating..." : `In Your Cart: ${cartEntry.quantity}`}
                      </span>
                      <button
                        onClick={handleIncrement}
                        disabled={cartEntry.quantity >= currentTotalStock || isUpdatingCart}
                        className="w-12 h-10 rounded-xl bg-white shadow-xs border border-slate-200/80 text-slate-800 hover:bg-slate-100 font-bold text-base flex items-center justify-center transition cursor-pointer disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
