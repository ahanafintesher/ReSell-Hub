import Link from "next/link";
import { getProducts } from "@/lib/actions/getProducts";
import {
  Laptop,
  Headphones,
  Watch,
  Plug,
  Shirt,
  Armchair,
  Car,
  Smartphone,
  Package,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Categories | ReSell Hub",
  description: "Browse verified pre-owned products by category on ReSell Hub.",
};

const CATEGORIES = [
  {
    id: "Electronics",
    name: "Electronics",
    description: "Laptops, computers, displays, and consumer electronics in great condition.",
    icon: Laptop,
    badgeColor: "bg-blue-100 text-blue-700",
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    id: "Audio",
    name: "Audio",
    description: "Headphones, wireless earbuds, Bluetooth speakers, and sound accessories.",
    icon: Headphones,
    badgeColor: "bg-purple-100 text-purple-700",
    iconBg: "bg-purple-50 text-purple-600",
  },
  {
    id: "Wearables",
    name: "Wearables",
    description: "Smartwatches, fitness bands, and wearable smart devices.",
    icon: Watch,
    badgeColor: "bg-emerald-100 text-emerald-700",
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "Accessories",
    name: "Accessories",
    description: "Keyboards, mice, docks, adapters, chargers, and gaming peripherals.",
    icon: Plug,
    badgeColor: "bg-amber-100 text-amber-700",
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    id: "Fashion",
    name: "Fashion",
    description: "Vintage apparel, shoes, jackets, bags, and everyday lifestyle clothing.",
    icon: Shirt,
    badgeColor: "bg-rose-100 text-rose-700",
    iconBg: "bg-rose-50 text-rose-600",
  },
  {
    id: "Furniture",
    name: "Furniture",
    description: "Work desks, ergonomic office chairs, shelving, and home furniture.",
    icon: Armchair,
    badgeColor: "bg-orange-100 text-orange-700",
    iconBg: "bg-orange-50 text-orange-600",
  },
  {
    id: "Vehicles",
    name: "Vehicles",
    description: "Bicycles, e-scooters, commuter bikes, and vehicle accessories.",
    icon: Car,
    badgeColor: "bg-cyan-100 text-cyan-700",
    iconBg: "bg-cyan-50 text-cyan-600",
  },
  {
    id: "Mobile Phones",
    name: "Mobile Phones",
    description: "Certified pre-owned smartphones, tablets, and protective cases.",
    icon: Smartphone,
    badgeColor: "bg-teal-100 text-teal-700",
    iconBg: "bg-teal-50 text-teal-600",
  },
  {
    id: "Others",
    name: "Others",
    description: "Books, collectibles, musical instruments, tools, and miscellaneous goods.",
    icon: Package,
    badgeColor: "bg-gray-100 text-gray-700",
    iconBg: "bg-gray-50 text-gray-600",
  },
];

export default async function CategoriesPage() {
  let products = [];
  try {
    products = await getProducts();
  } catch (err) {
    console.warn("Failed to fetch products for categories count:", err.message);
  }

  const productList = Array.isArray(products) ? products : [];

  const getCategoryCount = (catName) => {
    return productList.filter((p) => {
      if (!p.category) return false;
      return p.category.toLowerCase() === catName.toLowerCase();
    }).length;
  };

  return (
    <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Marketplace Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Browse Products by Category
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600">
            Find quality pre-owned goods across our verified marketplace categories.
            Save money, reduce waste, and discover great deals.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = getCategoryCount(cat.name);

            return (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-green-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.iconBg}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.badgeColor}`}
                    >
                      {count} {count === 1 ? "Item" : "Items"}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    {cat.name}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-green-600 group-hover:gap-2.5 transition-all">
                  Browse {cat.name}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Help Banner */}
        <div className="mt-16 rounded-2xl border border-gray-200 bg-white p-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between shadow-sm">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Have items you no longer use?
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Join thousands of sellers giving items a second life on ReSell Hub.
            </p>
          </div>
          <div className="mt-5 sm:mt-0">
            <Link
              href="/dashboard/seller/products/add-products"
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition"
            >
              List an Item Now
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
