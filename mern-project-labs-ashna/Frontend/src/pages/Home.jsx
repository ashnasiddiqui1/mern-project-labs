import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const { totalCount } = useCart();
  const { wishlist } = useWishlist();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get("/customers/me");
        setCustomer(response.data);
      } catch (err) {
        console.error("Authentication required:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const categoryCards = [
    { name: "Electronics", desc: "Audio, wearables, & tech gadgets", icon: "⚡" },
    { name: "Fashion", desc: "Apparel, accessories, & streetwear", icon: "✨" },
    { name: "Books", desc: "Engineering, tech, & programming", icon: "📚" },
    { name: "Home", desc: "Minimalist living & modern decor", icon: "🏡" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header customer={customer} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Hero Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 sm:p-10 shadow-xl mb-10">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Customer Dashboard
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Welcome back, {customer.fullName}!
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              Explore your personalized ShopKart dashboard. Manage your saved products, check your cart, or jump straight into the product catalog.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-100 transition shadow-md"
              >
                Browse Catalog &rarr;
              </Link>
              <Link
                to="/cart"
                className="px-5 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm transition border border-indigo-400/40"
              >
                View Cart ({totalCount})
              </Link>
            </div>
          </div>

          {/* Decorative glowing gradient orbs */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-32 -mb-16 w-60 h-60 rounded-full bg-violet-500/20 blur-2xl pointer-events-none"></div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Cart</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount} Items</p>
            </div>
            <Link
              to="/cart"
              className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition"
            >
              🛒
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saved in Wishlist</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{wishlist.length} Items</p>
            </div>
            <Link
              to="/wishlist"
              className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition"
            >
              ♥
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order History</p>
              <p className="text-xs font-bold text-slate-900 mt-2">Track & Review</p>
            </div>
            <Link
              to="/orders"
              className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center hover:bg-violet-100 transition"
            >
              📦
            </Link>
          </div>
        </div>

        {/* Customer Account Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 mb-10">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Customer Profile Information</h2>
              <p className="text-xs text-slate-500">Your registered account credentials and contact details</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Full Name
              </span>
              <span className="text-sm font-bold text-slate-800">{customer.fullName}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Email Address
              </span>
              <span className="text-sm font-bold text-slate-800">{customer.email}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Phone Number
              </span>
              <span className="text-sm font-bold text-slate-800">{customer.phone}</span>
            </div>
          </div>
        </div>

        {/* Categories Showcase */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Explore Catalog Categories</h2>
              <p className="text-xs text-slate-500">Browse curated selections across all departments</p>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              View All Products &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categoryCards.map((category) => (
              <div
                key={category.name}
                onClick={() => navigate(`/products?category=${encodeURIComponent(category.name)}`)}
                className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center text-2xl mb-3 transition-colors">
                  {category.icon}
                </div>
                <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {category.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
