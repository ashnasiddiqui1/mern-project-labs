import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, loading, error, removeFromWishlist, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [customer, setCustomer] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [movingId, setMovingId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await apiClient.get("/customers/me");
        setCustomer(res.data);
      } catch {
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    await removeFromWishlist(productId);
    setRemovingId(null);
  };

  const handleMoveToCart = async (product) => {
    const productId = product._id || product.id || product;
    setMovingId(productId);
    const cartRes = await addToCart(productId);
    if (cartRes.success) {
      await removeFromWishlist(productId);
    }
    setMovingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header customer={customer} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 block mb-1">
              Saved Favorites
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Products you have marked to purchase or track
            </p>
          </div>

          {wishlist.length > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold self-start sm:self-auto">
              <span>♥ {wishlist.length} Saved {wishlist.length === 1 ? "Item" : "Items"}</span>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-500">Loading your saved items...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-white border border-rose-200 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl mx-auto mb-3">
              ✕
            </div>
            <p className="text-sm font-bold text-slate-800 mb-1">Failed to Load Wishlist</p>
            <p className="text-xs text-rose-600 mb-5">{error}</p>
            <button
              onClick={refreshWishlist}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty Wishlist */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="py-20 text-center max-w-md mx-auto p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-3xl mx-auto mb-4">
              ♥
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1.5">
              Your wishlist is empty
            </h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Explore our product catalog and tap the heart icon on items you'd like to save for later.
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition"
            >
              Explore Products &rarr;
            </Link>
          </div>
        )}

        {/* Wishlist Grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item._id}
                className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&auto=format&fit=crop&q=80";
                      }}
                    />

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-slate-700 shadow-xs border border-slate-200/60">
                        {item.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemove(item._id)}
                      disabled={removingId === item._id}
                      title="Remove from wishlist"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-600 hover:bg-white flex items-center justify-center transition shadow-xs cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors mb-1.5" title={item.name}>
                      {item.name}
                    </h3>

                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-lg font-extrabold text-slate-900">
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </span>

                      {item.stock > 0 ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {item.stock} left
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Out of stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 pt-0 space-y-2">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    disabled={movingId === item._id || item.stock <= 0}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      item.stock <= 0
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                    <span>{movingId === item._id ? "Moving to Bag..." : "Move to Bag"}</span>
                  </button>

                  <Link
                    to={`/products/${item._id}`}
                    className="block w-full py-2 text-center text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
