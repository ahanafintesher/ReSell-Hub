"use client";

import { DeleteModal } from "@/components/Modals/DeleteModal";
import { getMyProducts } from "@/lib/actions/myProducts";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useEffect, useState } from "react";



const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  "in-progress": "bg-blue-100 text-blue-600",
  completed: "bg-green-100 text-green-600",
};

function StatusBadge({ status }) {
   
  const color =
    statusColors[status?.toLowerCase()] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-block text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${color}`}
    >
      {status}
    </span>
  );
}

export default function MyProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data, error } = useSession();
  const sellerInfo = data?.user?.email;
  

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getMyProducts(sellerInfo);
        setProducts(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [sellerInfo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div>loading....</div>
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
        <Link href="/add-task">
          <button className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition">
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
              <th className="text-left px-6 py-4 w-1/4">Condition</th>
              <th className="text-left px-6 py-4">Price</th>
              <th className="text-left px-6 py-4">Category</th>
              <th className="text-left px-6 py-4">Stock</th>
              <th className="text-left px-6 py-4 whitespace-nowrap w-[130px]">
                Status
              </th>
              <th className="text-left px-6 py-4 whitespace-nowrap w-[200px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-14 text-gray-400">
                  No tasks yet — add one to get started.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={products._id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {product.title}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.condition}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.price}
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
                      <DeleteModal id={product._id}></DeleteModal>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/*    */}
      <div className="hidden sm:grid lg:hidden grid-cols-2 gap-4">
        {products.length === 0 ? (
          <p className="col-span-2 text-center py-14 text-gray-400">
            No tasks yet — add one to get started.
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
              <p className="text-sm text-gray-500 line-clamp-2">
                {product.condition}
              </p>
              <p className="text-sm text-gray-500 line-clamp-2">
                {product.price}
              </p>
              <p className="text-sm text-gray-500 line-clamp-2">
                {product.category}
              </p>
              <p className="text-sm text-gray-500 line-clamp-2">
                {product.stock}
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-auto">
                <DeleteModal id={product._id}></DeleteModal>
              </div>
            </div>
          ))
        )}
      </div>
      {/* ── Mobile list (< sm) ── */}
      <div className="flex sm:hidden flex-col gap-3">
        {products.length === 0 ? (
          <p className="text-center py-14 text-gray-400">
            No tasks yet — add one to get started.
          </p>
        ) : (
          products.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="text-sm font-semibold text-gray-800 leading-snug">
                  {product.title}
                </h2>
                <StatusBadge status={product.status} />
              </div>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {product.condition}
              </p>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {product.price}
              </p>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {product.category}
              </p>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {product.stock}
              </p>
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <DeleteModal id={product._id}></DeleteModal>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
