"use client"
import Link from "next/link";
import { motion } from "motion/react";
import Image from "next/image";
import { FaQuoteLeft, FaStar, FaCheckCircle } from "react-icons/fa";

function SuccessStories() {
  const stories = [
    {
      id: 1,
      type: "buyer",
      name: "Sarah Johnson",
      role: "Happy Buyer",
      image: "https://i.pravatar.cc/150?img=5",
      rating: 5,
      story:
        "Found an amazing vintage camera at half the retail price! The seller was incredibly helpful, and the product was exactly as described. This platform made second-hand shopping so trustworthy.",
      purchase: "Vintage Canon Camera",
      amount: "$450",
      savedAmount: "$500",
      verifiedBadge: true,
    },
    {
      id: 2,
      type: "seller",
      name: "Michael Chen",
      role: "Successful Seller",
      image: "https://i.pravatar.cc/150?img=12",
      rating: 5,
      story:
        "I've sold over 30 items in just 3 months! The platform's easy listing process and buyer protection features gave my customers confidence. Turned my unused electronics into $5,000+",
      purchase: "Gaming Console & Accessories",
      amount: "$5,200",
      itemsSold: "32 items",
      verifiedBadge: true,
    },
    {
      id: 3,
      type: "buyer",
      name: "Emily Rodriguez",
      role: "Eco-Conscious Buyer",
      image: "https://i.pravatar.cc/150?img=9",
      rating: 5,
      story:
        "Love that I can shop sustainably while saving money! Got a beautiful designer handbag that looks brand new. The verification process made me feel secure throughout.",
      purchase: "Designer Handbag",
      amount: "$280",
      savedAmount: "$720",
      verifiedBadge: true,
    },
    {
      id: 4,
      type: "seller",
      name: "David Park",
      role: "Power Seller",
      image: "https://i.pravatar.cc/150?img=13",
      rating: 5,
      story:
        "Started as a hobby, now it's my side business! The seller dashboard makes inventory management a breeze. My items reach genuine buyers quickly, and payments are always secure.",
      purchase: "Furniture & Home Decor",
      amount: "$8,500",
      itemsSold: "47 items",
      verifiedBadge: true,
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#FAFAFA] via-white to-[#F9FAFB] dark:from-[#0b0f19] dark:via-[#0e1628] dark:to-[#0b0f19] py-16 sm:py-20 lg:py-24 transition-colors duration-300">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#10B981]/5 dark:bg-[#10B981]/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-[5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#3B82F6]/5 dark:bg-[#3B82F6]/10 blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.05, 0.07, 0.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12 lg:mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants} className="mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-[#10B981]/10 text-emerald-700 dark:text-emerald-300 border border-[#10B981]/20">
              <FaCheckCircle className="text-[#10B981]" size={14} />
              Real Stories, Real Success
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-4"
          >
            Success Stories from Our
            <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
              Amazing Community
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
          >
            Hear from buyers who found incredible deals and sellers who turned
            their unused items into profit
          </motion.p>
        </motion.div>

        {/* Stories Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              variants={cardVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 },
              }}
              className="group relative"
            >
              <div className="relative h-full p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)] hover:border-emerald-400/40 transition-all duration-300">
                {/* Type Badge */}
                <div className="absolute top-6 right-6">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      story.type === "buyer"
                        ? "bg-[#3B82F6]/10 text-blue-600 dark:text-blue-400 border border-[#3B82F6]/20"
                        : "bg-[#F59E0B]/10 text-amber-600 dark:text-amber-400 border border-[#F59E0B]/20"
                    }`}
                  >
                    {story.type === "buyer" ? "🛍️ Buyer" : "💰 Seller"}
                  </span>
                </div>

                {/* Quote Icon */}
                <div className="absolute top-6 left-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <FaQuoteLeft className="text-[#10B981]" size={40} />
                </div>

                {/* Profile Section */}
                <div className="flex items-start gap-4 mb-6 mt-8">
                  <motion.div
                    className="relative flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={story.image}
                      alt={story.name}
                      height={48}
                      width={48}
                      unoptimized
                      className="w-12 h-12 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-800 group-hover:ring-emerald-500/30 transition-all duration-300"
                    />
                    {story.verifiedBadge && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                        <FaCheckCircle className="text-white" size={10} />
                      </div>
                    )}
                  </motion.div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">
                      {story.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{story.role}</p>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-1">
                      {[...Array(story.rating)].map((_, i) => (
                        <FaStar key={i} className="text-amber-400" size={14} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Story Text */}
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 text-[15px]">
                  &quot;{story.story}&quot;
                </p>

                {/* Purchase Details */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
                        {story.type === "buyer" ? "Purchase" : "Total Sales"}
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {story.purchase}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {story.savedAmount && (
                        <div className="text-right">
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
                            Saved
                          </p>
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {story.savedAmount}
                          </p>
                        </div>
                      )}

                      {story.itemsSold && (
                        <div className="text-right">
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
                            Items Sold
                          </p>
                          <p className="text-lg font-bold text-amber-500 dark:text-amber-400">
                            {story.itemsSold}
                          </p>
                        </div>
                      )}

                      <div className="text-right">
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
                          {story.type === "buyer" ? "Paid" : "Earned"}
                        </p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                          {story.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/[0.03] group-hover:to-cyan-500/[0.03] transition-all duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-12 lg:mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
            Join thousands of satisfied buyers and sellers
          </p>
          <Link href="/products">
            <motion.button
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg shadow-[0_4px_20px_rgba(16,185,129,0.25)] transition-all duration-300 cursor-pointer"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 8px 30px rgba(16,185,129,0.35)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Success Items
              <FaCheckCircle size={18} />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default SuccessStories;
