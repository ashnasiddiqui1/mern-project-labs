import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    subtotal,
    totalCount,
    updateQuantity,
    removeFromCart,
    refreshCart
  } = useCart();

  const [customer, setCustomer] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

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

  const handleIncrease = async (entry) => {
    const productId = entry.product?._id || entry.product;
    const stock = entry.product?.stock || 0;
    if (entry.quantity >= stock || updatingId || removingId) return;

    setUpdatingId(productId);
    await updateQuantity(productId, entry.quantity + 1);
    setUpdatingId(null);
  };

  const handleDecrease = async (entry) => {
    const productId = entry.product?._id || entry.product;
    if (updatingId || removingId) return;

    setUpdatingId(productId);
    if (entry.quantity <= 1) {
      await removeFromCart(productId);
    } else {
      await updateQuantity(productId, entry.quantity - 1);
    }
    setUpdatingId(null);
  };

  const handleRemove = async (entry) => {
    const productId = entry.product?._id || entry.product;
    if (updatingId || removingId) return;

    setRemovingId(productId);
    await removeFromCart(productId);
    setRemovingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header customer={customer} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Checkout Preparation
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review and adjust quantities before proceeding to shipping & payment
            </p>
          </div>

          {cartItems.length > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold self-start sm:self-auto">
              <span>{totalCount} Total Items in Cart</span>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-500">Loading your shopping bag...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-white border border-rose-200 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl mx-auto mb-3">
              ✕
            </div>
            <p className="text-sm font-bold text-slate-800 mb-1">Failed to Load Cart</p>
            <p className="text-xs text-rose-600 mb-5">{error}</p>
            <button
              onClick={refreshCart}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty Cart State */}
        {!loading && !error && cartItems.length === 0 && (
          <div className="py-20 text-center max-w-md mx-auto p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mx-auto mb-4">
              🛒
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1.5">
              Your shopping bag is empty
            </h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Looks like you haven't added any products to your cart yet. Explore our product catalog to get started.
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition"
            >
              Browse Catalog &rarr;
            </Link>
          </div>
        )}

        {/* Cart Contents */}
        {!loading && !error && cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Items Column */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((entry) => {
                const product = entry.product || {};
                const productId = product._id || entry.product;
                const isItemUpdating = updatingId === productId;
                const isItemRemoving = removingId === productId;
                const totalStock = typeof product.stock === "number" ? product.stock : 0;
                const remainingStock = Math.max(0, totalStock - entry.quantity);

                return (
                  <div
                    key={productId}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=160&auto=format&fit=crop&q=80";
                          }}
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
                          {product.category || "Item"}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 line-clamp-1" title={product.name}>
                          {product.name}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 mb-1">
                          ₹{Number(product.price || 0).toLocaleString('en-IN')} each
                        </p>
                        <p className="text-[11px]">
                          {remainingStock > 0 ? (
                            <span className="text-emerald-700 font-semibold">{remainingStock} more available</span>
                          ) : (
                            <span className="text-rose-700 font-semibold">Max stock reached</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Stepper & Subtotal */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 gap-3">
                      {/* Stepper */}
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 h-9">
                        <button
                          onClick={() => handleDecrease(entry)}
                          disabled={isItemUpdating || isItemRemoving}
                          className="w-7 h-7 rounded-lg bg-white shadow-xs border border-slate-200/60 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
                          title={entry.quantity === 1 ? "Remove from cart" : "Decrease quantity"}
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800">
                          {entry.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrease(entry)}
                          disabled={entry.quantity >= totalStock || isItemUpdating || isItemRemoving}
                          className="w-7 h-7 rounded-lg bg-white shadow-xs border border-slate-200/60 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
                          title={entry.quantity >= totalStock ? "Maximum stock reached" : "Increase quantity"}
                        >
                          +
                        </button>
                      </div>

                      {/* Line Subtotal and Remove Button */}
                      <div className="text-right">
                        <p className="text-sm sm:text-base font-extrabold text-slate-900">
                          ₹{Number((product.price || 0) * entry.quantity).toLocaleString('en-IN')}
                        </p>
                        <button
                          onClick={() => handleRemove(entry)}
                          disabled={isItemRemoving || isItemUpdating}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer disabled:opacity-50 mt-0.5"
                        >
                          {isItemRemoving ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sticky top-24">
                <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Total Items ({totalCount}):</span>
                    <span className="font-semibold text-slate-800">
                      ₹{Number(subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery Charges:</span>
                    <span className="font-semibold text-emerald-600 uppercase tracking-wider">
                      Free
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-slate-100 text-sm font-extrabold text-slate-900">
                    <span>Grand Total:</span>
                    <span className="text-lg text-indigo-700">
                      ₹{Number(subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                  className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-indigo-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <span>&rarr;</span>
                </button>

                <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                  <Link
                    to="/products"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    &larr; Continue Shopping
                  </Link>
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
