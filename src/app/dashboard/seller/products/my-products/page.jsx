"use client";

import { DeleteModal } from "@/components/Modals/DeleteModal";
import { getMyProducts } from "@/lib/actions/myProducts";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useEffect, useState } from "react";

const statusColors = {
  available: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  hidden: "bg-amber-100 text-amber-800 border border-amber-200",
  sold: "bg-purple-100 text-purple-800 border border-purple-200",
};

function StatusBadge({ status }) {
  const normalized = status?.toLowerCase() || "available";
  const color =
    statusColors[normalized] ?? "bg-slate-100 text-slate-700 border border-slate-200";
  return (
    <span
      className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium capitalize whitespace-nowrap ${color}`}
    >
      {status || "Available"}
    </span>
  );
}

export default function MyProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data } = useSession();
  const sellerInfo = data?.user?.email;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getMyProducts(sellerInfo);
        setProducts(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [sellerInfo]);

  const handleDeleteSuccess = (deletedId) => {
    setProducts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  if (loading) {
    return (
      <div
        className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-pulse"
        role="status"
        aria-label="Loading your products"
      >
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="h-8 w-44 bg-slate-200 rounded-md" />
          <div className="h-10 w-28 bg-slate-200 rounded-lg" />
        </div>
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden p-6 space-y-4">
          <div className="h-6 bg-slate-100 rounded w-full" />
          <div className="h-12 bg-slate-50 rounded w-full" />
          <div className="h-12 bg-slate-50 rounded w-full" />
          <div className="h-12 bg-slate-50 rounded w-full" />
          <div className="h-12 bg-slate-50 rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
          My Products
        </h1>
        <Link href="/dashboard/seller/products/add-products">
          <button className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-xs">
            + Add New
          </button>
        </Link>
      </div>

      {/* ── Desktop table (lg+) ── */}
      <div className="hidden lg:block overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
            <tr>
              <th className="text-left px-6 py-4 w-1/4">Product Name</th>
              <th className="text-left px-6 py-4">Condition</th>
              <th className="text-left px-6 py-4">Price</th>
              <th className="text-left px-6 py-4">Category</th>
              <th className="text-left px-6 py-4">Stock</th>
              <th className="text-left px-6 py-4 whitespace-nowrap w-[130px]">
                Status
              </th>
              <th className="text-left px-6 py-4 whitespace-nowrap w-[160px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-14 text-gray-400">
                  No products listed yet — add your first product to get started.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product._id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {product.title}
                  </td>
                  <td className="px-6 py-4 text-gray-600 capitalize">
                    {product.condition}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    ৳{product.price}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <DeleteModal id={product._id} onSuccess={handleDeleteSuccess} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Tablet grid (sm to lg) ── */}
      <div className="hidden sm:grid lg:hidden grid-cols-2 gap-4">
        {products.length === 0 ? (
          <p className="col-span-2 text-center py-14 text-gray-400">
            No products listed yet — add your first product to get started.
          </p>
        ) : (
          products.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-semibold text-gray-800 leading-snug">
                  {product.title}
                </h2>
                <StatusBadge status={product.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block font-medium">Condition:</span>
                  <span className="font-medium text-slate-700 capitalize">{product.condition}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Price:</span>
                  <span className="font-semibold text-emerald-700">৳{product.price}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Category:</span>
                  <span className="font-medium text-slate-700">{product.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Stock:</span>
                  <span className="font-medium text-slate-700">{product.stock}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-auto">
                <DeleteModal id={product._id} onSuccess={handleDeleteSuccess} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Mobile list (< sm) ── */}
      <div className="flex sm:hidden flex-col gap-3">
        {products.length === 0 ? (
          <p className="text-center py-14 text-gray-400">
            No products listed yet — add your first product to get started.
          </p>
        ) : (
          products.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h2 className="text-sm font-semibold text-gray-800 leading-snug">
                  {product.title}
                </h2>
                <StatusBadge status={product.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                <div>
                  <span className="text-slate-400 block font-medium">Condition:</span>
                  <span className="font-medium text-slate-700 capitalize">{product.condition}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Price:</span>
                  <span className="font-semibold text-emerald-700">৳{product.price}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Category:</span>
                  <span className="font-medium text-slate-700">{product.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Stock:</span>
                  <span className="font-medium text-slate-700">{product.stock}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <DeleteModal id={product._id} onSuccess={handleDeleteSuccess} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
