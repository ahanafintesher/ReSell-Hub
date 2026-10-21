import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    title: "Total Users",
    value: "0",
    icon: Users,
  },
  {
    title: "Total Products",
    value: "0",
    icon: Package,
  },
  {
    title: "Total Orders",
    value: "0",
    icon: ShoppingCart,
  },
  {
    title: "Total Revenue",
    value: "$0",
    icon: TrendingUp,
  },
];

const AdminOverviewPage = () => {
  return (
    <section className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="mt-1 text-sm text-default-500">
          Monitor your marketplace from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-default-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">{stat.title}</p>
                  <h2 className="mt-2 text-2xl font-bold">{stat.value}</h2>
                </div>

                <div className="rounded-lg bg-default-100 p-3">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AdminOverviewPage;