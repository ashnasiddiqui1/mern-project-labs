import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import apiClient from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import FilterToolbar from "../components/FilterToolbar";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All Categories";

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    apiClient
      .get("/customers/me")
      .then((res) => setCustomer(res.data))
      .catch(() => {
        // Guest user browsing
      });
  }, []);

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const queryParams = {};
        if (searchQuery.trim()) {
          queryParams.search = searchQuery.trim();
        }
        if (selectedCategory && selectedCategory !== "All Categories" && selectedCategory !== "All") {
          queryParams.category = selectedCategory;
        }

        const response = await apiClient.get("/products", { params: queryParams });
        setProducts(response.data?.products || []);
      } catch (err) {
        console.error("Error retrieving catalog:", err);
        setErrorMessage("Unable to load product catalog right now.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, [searchQuery, selectedCategory]);

  const handleCategorySelection = (category) => {
    setSelectedCategory(category);
    if (category === "All Categories") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header customer={customer} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Page Header Title */}
        <div className="mb-6 sm:mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
            Browse Inventory
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time stock tracking and live search across all categories
          </p>
        </div>

        {/* Filter and Search Bar */}
        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={selectedCategory}
          onCategoryChange={handleCategorySelection}
          totalResults={!isLoading && !errorMessage ? products.length : undefined}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-500">Retrieving catalog items...</p>
          </div>
        )}

        {/* Error State */}
        {errorMessage && !isLoading && (
          <div className="py-16 text-center max-w-md mx-auto p-6 rounded-2xl bg-white border border-rose-200 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl mx-auto mb-3">
              ✕
            </div>
            <p className="text-sm font-bold text-slate-800 mb-1">Error Loading Products</p>
            <p className="text-xs text-rose-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => setSelectedCategory("All Categories")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Empty Catalog State */}
        {!isLoading && !errorMessage && products.length === 0 && (
          <div className="py-20 text-center max-w-md mx-auto p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto mb-4">
              🔍
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No products found</h3>
            <p className="text-xs text-slate-500 mb-6">
              We couldn't find any products matching your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !errorMessage && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
