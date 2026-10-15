import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Orders() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchCustomerAndOrders = async () => {
      try {
        const userRes = await apiClient.get("/customers/me");
        setCustomer(userRes.data);

        const ordersRes = await apiClient.get("/orders");
        setOrders(ordersRes.data?.orders || []);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setErrorMessage("Failed to load your orders history.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerAndOrders();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header customer={customer} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Purchase History
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track delivery progress and inspect itemized payment receipts
            </p>
          </div>

          {orders.length > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold self-start sm:self-auto">
              <span>{orders.length} Placed {orders.length === 1 ? "Order" : "Orders"}</span>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-500">Loading your orders history...</p>
          </div>
        )}

        {/* Error State */}
        {errorMessage && !isLoading && (
          <div className="py-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-white border border-rose-200 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl mx-auto mb-3">
              ✕
            </div>
            <p className="text-sm font-bold text-slate-800 mb-1">Error Loading Orders</p>
            <p className="text-xs text-rose-600 mb-5">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty Orders */}
        {!isLoading && !errorMessage && orders.length === 0 && (
          <div className="py-20 text-center max-w-md mx-auto p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mx-auto mb-4">
              📦
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1.5">No orders found</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              You haven't placed any orders yet. Discover our latest items in the catalog.
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition"
            >
              Browse Catalog &rarr;
            </Link>
          </div>
        )}

        {/* Orders Listing */}
        {!isLoading && !errorMessage && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const isPaid = order.paymentStatus === "PAID";
              const isFailed = order.paymentStatus === "FAILED";

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 hover:shadow-md transition-shadow"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Order</span>
                        <span className="font-mono text-xs font-extrabold text-slate-800">
                          #{order._id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isFailed
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isPaid
                              ? "bg-emerald-500"
                              : isFailed
                              ? "bg-rose-500"
                              : "bg-amber-500"
                          }`}
                        ></span>
                        Payment: {order.paymentStatus}
                      </span>

                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Status: {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Snapshot Preview */}
                  <div className="divide-y divide-slate-100 my-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200/60"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=100&auto=format&fit=crop&q=80";
                            }}
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        <span className="text-sm font-extrabold text-slate-900 shrink-0">
                          ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 gap-3">
                    <div>
                      <span className="text-xs font-medium text-slate-500">Order Grand Total: </span>
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <Link
                      to={`/orders/${order._id}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition border border-indigo-200 text-center"
                    >
                      View Full Order Details &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
