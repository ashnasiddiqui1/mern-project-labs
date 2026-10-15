import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const userRes = await apiClient.get("/customers/me");
        setCustomer(userRes.data);

        const orderRes = await apiClient.get(`/orders/${id}`);
        setOrder(orderRes.data?.order);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else if (err.response?.status === 403) {
          setErrorMessage("You do not have authorization to inspect this order.");
        } else if (err.response?.status === 404) {
          setErrorMessage("Requested order record was not found.");
        } else {
          setErrorMessage(err.response?.data?.error || "Failed to load order receipt.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header customer={customer} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Breadcrumb Header */}
        <div className="mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition mb-3"
          >
            &larr; Back to Order History
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                Receipt & Tracking
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Order Breakdown
              </h1>
            </div>
            {order && (
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                ID: {order._id}
              </span>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-500">Retrieving order receipt...</p>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && !isLoading && (
          <div className="py-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-white border border-rose-200 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl mx-auto mb-3">
              ✕
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Unable to Display Order</h3>
            <p className="text-xs text-rose-600 mb-5">{errorMessage}</p>
            <Link
              to="/orders"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              Return to Orders
            </Link>
          </div>
        )}

        {/* Order Details Body */}
        {!isLoading && !errorMessage && order && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Placement Date
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      order.paymentStatus === "PAID"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : order.paymentStatus === "FAILED"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    Payment: {order.paymentStatus}
                  </span>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Delivery Status: {order.status}
                  </span>
                </div>
              </div>

              {order.razorpayPaymentId && (
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                  <span className="font-semibold text-slate-500">Razorpay Payment ID:</span>
                  <span className="font-mono bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 font-bold text-slate-800">
                    {order.razorpayPaymentId}
                  </span>
                </div>
              )}
            </div>

            {/* Shipping Details Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
                Shipping Destination
              </h2>

              <div className="text-xs sm:text-sm text-slate-700 space-y-1.5">
                <p className="font-bold text-slate-900 text-sm">{order.shippingAddress?.fullName}</p>
                <p className="text-slate-600">{order.shippingAddress?.addressLine}</p>
                <p className="text-slate-600">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} —{" "}
                  <span className="font-bold text-slate-800">{order.shippingAddress?.pincode}</span>
                </p>
                <p className="text-slate-500 pt-2 flex items-center gap-2">
                  <span>Contact:</span>
                  <span className="font-semibold text-slate-800">{order.shippingAddress?.phone}</span>
                </p>
              </div>
            </div>

            {/* Itemized Items Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
                Itemized Receipt ({order.items?.length || 0} Products)
              </h2>

              <div className="divide-y divide-slate-100 mb-6">
                {order.items?.map((item, index) => (
                  <div key={index} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200/60"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=100&auto=format&fit=crop&q=80";
                        }}
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Unit Price: ₹{Number(item.price).toLocaleString('en-IN')} &times; {item.quantity}
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-extrabold text-slate-900 shrink-0">
                      ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Shipping & Delivery:</span>
                  <span className="font-semibold text-emerald-600 uppercase tracking-wider">Free</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 text-base font-extrabold text-slate-900">
                  <span>Grand Total Paid:</span>
                  <span className="text-xl text-indigo-700">
                    ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                  </span>
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
