"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Copy,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@heroui/react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Product Inquiry",
    message: "",
  });
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support@resellhub.com");
    setCopied(true);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (formData.message.trim().length < 10) {
      toast.error("Message must be at least 10 characters long.");
      return;
    }

    // Prepare mailto link to honestly open the user's email client without inventing backend endpoints
    const mailtoUrl = `mailto:support@resellhub.com?subject=${encodeURIComponent(
      `[ReSell Hub Inquiry] ${formData.subject} - from ${formData.name}`
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nInquiry Type: ${formData.subject}\n\nMessage:\n${formData.message}`
    )}`;

    window.open(mailtoUrl, "_blank");
    setSubmitted(true);
    toast.success("Contact inquiry prepared in your mail client!");
  };

  return (
    <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full mb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            Customer Support & Inquiries
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Contact ReSell Hub Team
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600">
            Have questions about buying, selling, payments, or listing a product?
            Our support team is here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Direct Support</h2>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-400">Email Us</p>
                    <a
                      href="mailto:support@resellhub.com"
                      className="text-sm font-semibold text-gray-900 hover:text-green-600 transition block truncate"
                    >
                      support@resellhub.com
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline mt-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? "Copied!" : "Copy Address"}
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400">Call Us</p>
                    <a
                      href="tel:+8801700000000"
                      className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition block"
                    >
                      +880 (17) 000-0000
                    </a>
                    <p className="text-xs text-gray-500 mt-0.5">Mon - Sat, 9am - 8pm</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400">Headquarters</p>
                    <p className="text-sm font-semibold text-gray-900">
                      123 Market Street, Dhaka, Bangladesh
                    </p>
                  </div>
                </div>

                {/* Response Guarantee */}
                <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400">Response Window</p>
                    <p className="text-sm text-gray-600">
                      We respond to all verified marketplace inquiries within 24 business hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Notice */}
            <div className="rounded-2xl border border-green-200 bg-green-50/70 p-5">
              <div className="flex items-center gap-2 text-green-800 font-semibold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Buyer & Seller Protection
              </div>
              <p className="text-xs text-green-700 leading-relaxed">
                Never send direct wire transfers outside the platform. All transactions are securely completed through Stripe Checkout.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Send an Inquiry</h2>
              <p className="text-sm text-gray-500 mb-6">
                Fill in the details below. Submitting will prepare your message directly for our support team.
              </p>

              {submitted && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-semibold">Inquiry prepared!</p>
                    <p className="mt-1 text-xs text-green-700">
                      Your default email application has opened with your inquiry formatted for <strong>support@resellhub.com</strong>.
                      You can also email us directly at any time.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Rakib Hasan"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                    />
                  </div>
                </div>

                {/* Inquiry Type / Subject */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Topic / Category
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 bg-white"
                  >
                    <option value="Product Inquiry">Product Inquiry</option>
                    <option value="Order & Delivery Tracking">Order & Delivery Tracking</option>
                    <option value="Seller Account Support">Seller Account Support</option>
                    <option value="Payment & Stripe Assistance">Payment & Stripe Assistance</option>
                    <option value="Report Listing or Discrepancy">Report Listing or Discrepancy</option>
                    <option value="Other Feedback">Other Feedback</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Message *
                    </label>
                    <span className="text-xs text-gray-400">
                      {formData.message.length} characters (min 10)
                    </span>
                  </div>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Describe your inquiry in detail, including product title or order ID if relevant..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 p-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 resize-y"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    color="primary"
                    className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Dispatch Message via Email
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
