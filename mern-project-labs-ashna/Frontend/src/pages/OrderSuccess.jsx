import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header customer={customer} />

      <main className="max-w-xl mx-auto px-4 py-16 sm:py-24 flex-1 flex items-center justify-center w-full">
        <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-12 text-center">
          {/* Animated Success Check Circle */}
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 text-3xl font-extrabold shadow-inner border border-emerald-100 animate-bounce">
            ✓
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
            Payment Verified
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Order Placed Successfully!
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
            Thank you for your purchase with ShopKart. Your payment has been verified by the backend cryptographic check and your inventory items have been reserved.
          </p>

          {/* Order ID Reference Badge */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-8 text-xs">
            <span className="text-slate-400 block mb-1">Assigned Order Reference</span>
            <span className="font-mono text-xs sm:text-sm font-extrabold text-indigo-700 select-all">
              {id}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/orders"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-200"
            >
              View Order History &rarr;
            </Link>
            <Link
              to="/products"
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
