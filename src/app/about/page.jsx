import Link from "next/link";
import {
  Recycle,
  ShieldCheck,
  CreditCard,
  Users,
  CheckCircle2,
  HelpCircle,
  Truck,
  RotateCcw,
  Lock,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "About Us | ReSell Hub",
  description: "Learn about ReSell Hub, our mission for sustainable consumption, and how pre-owned trading works.",
};

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Create an Account",
    description: "Register effortlessly as a buyer or seller using email or your Google account.",
  },
  {
    step: "02",
    title: "Discover or List Items",
    description: "Browse verified electronics, fashion, and furniture, or list your pre-owned items with high-res photos.",
  },
  {
    step: "03",
    title: "Secure Stripe Checkout",
    description: "Complete transactions safely with industry-standard Stripe credit and debit card processing.",
  },
  {
    step: "04",
    title: "Track & Review",
    description: "Track shipment milestones from accepted to delivered, and share authentic feedback on the community.",
  },
];

const FAQS = [
  {
    id: "faq",
    question: "What is ReSell Hub?",
    answer: "ReSell Hub is an online marketplace where individuals buy and sell pre-owned, certified, and second-hand items safely and efficiently, promoting sustainable reuse.",
  },
  {
    id: "shipping",
    question: "How does shipping and order delivery work?",
    answer: "Sellers pack and dispatch items after payment confirmation. Order progress can be tracked in real-time under your Buyer Dashboard My Orders section with status updates (Accepted, Processing, Shipped, Delivered).",
  },
  {
    id: "returns",
    question: "What is the return and refund policy?",
    answer: "If an item does not match the seller's condition description or images, buyers can initiate an inquiry before order completion. Orders may be cancelled by buyers prior to shipping.",
  },
  {
    id: "privacy",
    question: "How is my personal data and payment info protected?",
    answer: "Payment processing is handled directly through Stripe's PCI-DSS compliant infrastructure. ReSell Hub never stores your sensitive credit card credentials, and user data is protected with secure JWT authentication.",
  },
  {
    id: "terms",
    question: "What are the marketplace rules for sellers?",
    answer: "All listed items must accurately disclose their true condition (Used, Like New, Refurbished), exact specifications, and authentic photos. Counterfeit or mislabeled goods are strictly moderated and removed.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header / Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            <Recycle className="w-3.5 h-3.5" />
            Sustainable Second-Hand Commerce
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Giving Pre-Owned Goods a Second Life
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Many people own high-quality products that are still perfectly usable but no longer needed.
            ReSell Hub connects conscious buyers with verified sellers to reduce waste, foster circular consumption,
            and make quality items accessible at affordable prices.
          </p>
        </section>

        {/* Impact Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-4">
              <Recycle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Reduce Waste</h2>
            <p className="mt-2 text-sm text-gray-500">
              Extending the lifespan of electronics and apparel keeps functional goods out of landfills.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Affordable Deals</h2>
            <p className="mt-2 text-sm text-gray-500">
              Access premium laptops, smartphones, and fashion up to 70% cheaper than retail prices.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Secure Payments</h2>
            <p className="mt-2 text-sm text-gray-500">
              Stripe checkout encryption ensures payments are safeguarded and tracked with verified IDs.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Seller Earnings</h2>
            <p className="mt-2 text-sm text-gray-500">
              Turn unused equipment and closet items into instant cash with a streamlined seller dashboard.
            </p>
          </div>
        </section>

        {/* How The System Works */}
        <section id="how-it-works" className="space-y-8 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How The System Works</h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500">
              Our 4-step workflow is engineered for simplicity, security, and trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-black text-green-600/30 font-mono">
                    {item.step}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="space-y-6 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Help, Shipping, Returns & Privacy
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div
                key={faq.id}
                id={faq.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm scroll-mt-24"
              >
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed pl-7">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="rounded-3xl bg-gray-900 text-white p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to join the sustainable commerce movement?
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-300">
            Browse through hundreds of pre-owned tech products or start selling your own unused devices today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-500 transition shadow-md"
            >
              Explore Products
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/seller/products/add-products"
              className="inline-flex items-center justify-center rounded-xl border border-gray-700 bg-gray-800 px-6 py-3 font-semibold text-gray-200 hover:bg-gray-700 transition"
            >
              Start Selling
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
