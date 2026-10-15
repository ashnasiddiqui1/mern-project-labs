import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, totalCount, refreshCart, clearCart } = useCart();

  const [customer, setCustomer] = useState(null);
  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [formError, setFormError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get("/customers/me");
        setCustomer(response.data);
        if (response.data?.fullName) {
          setShippingForm((prev) => ({
            ...prev,
            fullName: prev.fullName || response.data.fullName,
            phone: prev.phone || response.data.phone || ""
          }));
        }
      } catch {
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const scriptTag = document.createElement("script");
      scriptTag.src = "https://checkout.razorpay.com/v1/checkout.js";
      scriptTag.onload = () => resolve(true);
      scriptTag.onerror = () => resolve(false);
      document.body.appendChild(scriptTag);
    });
  };

  const handlePaymentSubmission = async (e) => {
    e.preventDefault();
    setFormError("");

    const fullName = shippingForm.fullName.trim();
    const phone = shippingForm.phone.trim();
    const addressLine = shippingForm.addressLine.trim();
    const city = shippingForm.city.trim();
    const state = shippingForm.state.trim();
    const pincode = shippingForm.pincode.trim();

    if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
      setFormError("All shipping address fields are required.");
      return;
    }

    const cleanPhoneDigits = phone.replace(/\D/g, "");
    if (cleanPhoneDigits.length < 10 || cleanPhoneDigits.length > 15) {
      setFormError("Please provide a valid phone number (at least 10 digits).");
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setFormError("Pincode must contain exactly 6 digits.");
      return;
    }

    if (cartItems.length === 0) {
      setFormError("Your shopping bag is empty. Please add items before checking out.");
      return;
    }

    setIsProcessing(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setFormError("Failed to load Razorpay payment gateway. Check network connectivity.");
        setIsProcessing(false);
        return;
      }

      const response = await apiClient.post("/orders/create-payment-order", {
        shippingAddress: {
          fullName,
          phone,
          addressLine,
          city,
          state,
          pincode
        }
      });

      const orderData = response.data;

      const checkoutOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ShopKart",
        description: "Order Checkout Payment",
        order_id: orderData.razorpayOrderId,
        handler: async function (paymentResponse) {
          try {
            const verification = await apiClient.post("/orders/verify-payment", {
              orderId: orderData.orderId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            });

            if (verification.data.success) {
              clearCart();
              await refreshCart();
              navigate(`/order-success/${orderData.orderId}`);
            }
          } catch (verificationErr) {
            setFormError(
              verificationErr.response?.data?.error || "Payment verification failed."
            );
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: fullName,
          contact: phone,
          email: customer?.email || ""
        },
        theme: {
          color: "#4F46E5"
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(checkoutOptions);
      razorpayInstance.on("payment.failed", async function (failureEvent) {
        await apiClient
          .post("/orders/payment-failed", {
            orderId: orderData.orderId
          })
          .catch(() => null);

        setFormError(
          failureEvent.error?.description || "Payment failed or was canceled."
        );
        setIsProcessing(false);
      });

      razorpayInstance.open();
    } catch (orderErr) {
      setFormError(
        orderErr.response?.data?.error || "Failed to initialize payment gateway."
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header customer={customer} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Stepper Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition mb-3"
          >
            &larr; Back to Shopping Bag
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                Final Step
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Checkout & Shipping
              </h1>
            </div>
            {/* Stepper Pills */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-400">1. Bag</span>
              <span className="text-slate-300">&rarr;</span>
              <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                2. Shipping & Payment
              </span>
              <span className="text-slate-300">&rarr;</span>
              <span className="text-slate-400">3. Confirmation</span>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mx-auto mb-4">
              🛒
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1.5">Your cart is empty</h2>
            <p className="text-xs text-slate-500 mb-6">
              Please add products to your cart before proceeding to checkout.
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Form Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Destination Shipping Address
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter the recipient contact and delivery location
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    Required Details
                  </span>
                </div>

                {formError && (
                  <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handlePaymentSubmission} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingForm.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingForm.phone}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Address Line / Street Details *
                    </label>
                    <input
                      type="text"
                      name="addressLine"
                      value={shippingForm.addressLine}
                      onChange={handleInputChange}
                      placeholder="Flat, Building No., Street, Landmark"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingForm.city}
                        onChange={handleInputChange}
                        placeholder="Mumbai"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingForm.state}
                        onChange={handleInputChange}
                        placeholder="Maharashtra"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Pincode (6 digits) *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        maxLength="6"
                        value={shippingForm.pincode}
                        onChange={handleInputChange}
                        placeholder="400001"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm transition shadow-lg shadow-indigo-200 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                      <span>
                        {isProcessing
                          ? "Connecting to Razorpay..."
                          : `Pay ₹${Number(subtotal).toLocaleString('en-IN')} with Razorpay`}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Review Items Column */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sticky top-24">
                <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
                  Review Bag ({totalCount} items)
                </h2>

                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1 mb-4">
                  {cartItems.map((entry) => {
                    const product = entry.product || {};
                    const productId = product._id || entry.product;

                    return (
                      <div key={productId} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200/60"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=100&auto=format&fit=crop&q=80";
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">{product.name}</p>
                            <p className="text-slate-400 mt-0.5">
                              {entry.quantity} × ₹{Number(product.price || 0).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        <span className="font-extrabold text-slate-900 shrink-0">
                          ₹{Number((product.price || 0) * entry.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-800">
                      ₹{Number(subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span className="font-semibold text-emerald-600 uppercase tracking-wider">
                      Free
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-extrabold text-slate-900">
                    <span>Total Due:</span>
                    <span className="text-lg text-indigo-700">
                      ₹{Number(subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-800 flex items-center gap-2.5">
                  <span className="text-base">🔒</span>
                  <span>Razorpay Test Sandbox enabled. No real currency will be charged.</span>
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
