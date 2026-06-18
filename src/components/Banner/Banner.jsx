"use client";
import { FaShoppingBag, FaStore, FaUsers, FaThumbsUp, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

function HeroBanner() {
  const stats = [
    {
      icon: <FaShoppingBag className="text-[#10B981]" size={22} />,
      value: "50K+",
      label: "Active Listings",
    },
    {
      icon: <FaUsers className="text-[#3B82F6]" size={22} />,
      value: "120K+",
      label: "Happy Users",
    },
    {
      icon: <FaThumbsUp className="text-[#F59E0B]" size={22} />,
      value: "98%",
      label: "Satisfaction Rate",
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <section
      id="hero-banner"
      className="relative w-full overflow-hidden bg-[#FAFAFA]"
      style={{ minHeight: "100vh" }}
    >
      {/* Decorative Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#10B981]/8"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#3B82F6]/6"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.06, 0.1, 0.06],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#F59E0B]/5"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />

        {/* Floating shapes */}
        <motion.div
          className="absolute top-[15%] left-[10%] w-16 h-16 rounded-2xl bg-[#10B981]/10"
          style={{ transform: "rotate(12deg)" }}
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute top-[60%] left-[5%] w-12 h-12 rounded-full bg-[#3B82F6]/10"
          variants={floatingVariants}
          animate="animate"
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-[25%] right-[8%] w-20 h-20 rounded-xl bg-[#F59E0B]/10"
          style={{ transform: "rotate(-8deg)" }}
          variants={floatingVariants}
          animate="animate"
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-[25%] right-[15%] w-14 h-14 rounded-2xl bg-[#10B981]/10"
          style={{ transform: "rotate(20deg)" }}
          variants={floatingVariants}
          animate="animate"
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
      </div>

      {/* Main Content Container */}
      <div
        className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12"
        style={{ minHeight: "100vh" }}
      >
        {/* Content Wrapper */}
        <motion.div
          className="w-full max-w-6xl mx-auto flex flex-col items-center text-center py-8 lg:py-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge / Eyebrow */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-[#10B981]/10 text-[#059669] border border-[#10B981]/20">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              Trusted Second-Hand Marketplace
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[3.75rem] font-extrabold text-[#111827] leading-[1.1] tracking-tight max-w-4xl"
            variants={itemVariants}
          >
            Buy & Sell Pre-Owned
            <br />
            <span className="text-[#10B981]">Products with Confidence</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            className="mt-4 lg:mt-5 text-base sm:text-lg md:text-xl text-[#6B7280] max-w-2xl leading-relaxed px-2 sm:px-0"
            variants={itemVariants}
          >
            Join the community that values trust, affordability, and sustainability.
            Every item finds a new home, and every purchase makes a positive impact.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-6 lg:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
            variants={itemVariants}
          >
            <motion.button
              className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 rounded-[0.875rem] bg-[#10B981] text-white font-semibold text-base sm:text-lg shadow-[0_4px_20px_rgba(16,185,129,0.25)] transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] cursor-pointer"
              aria-label="Browse Products"
              whileHover={{
                scale: 1.02,
                y: -2,
                boxShadow: "0 8px 30px rgba(16,185,129,0.35)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <FaShoppingBag size={18} />
              Browse Products
              <FaArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </motion.button>

            <motion.button
              className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 rounded-[0.875rem] border-2 border-[#E5E7EB] text-[#111827] font-semibold text-base sm:text-lg bg-white/60 transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] cursor-pointer"
              aria-label="Start Selling"
              whileHover={{
                scale: 1.02,
                y: -2,
                backgroundColor: "rgba(255,255,255,1)",
                borderColor: "rgba(16,185,129,0.3)",
                boxShadow: "0 8px 30px rgba(15,23,42,0.08)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <FaStore size={18} />
              Start Selling
            </motion.button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div className="mt-8 lg:mt-10 w-full" variants={itemVariants}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="group relative flex flex-col items-center text-center p-4 sm:p-5 lg:p-6 rounded-[1.25rem] bg-white/70 border border-[#E5E7EB]/60 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
                  variants={statsVariants}
                  whileHover={{
                    y: -4,
                    boxShadow: "0 20px 40px rgba(15,23,42,0.12)",
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderColor: "rgba(16,185,129,0.2)",
                  }}
                >
                  {/* Icon container */}
                  <motion.div
                    className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]/40 transition-all duration-300 mb-2.5 sm:mb-3"
                    whileHover={{ scale: 1.1 }}
                  >
                    {stat.icon}
                  </motion.div>

                  {/* Value */}
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight group-hover:text-[#10B981] transition-colors duration-300">
                    {stat.value}
                  </span>

                  {/* Label */}
                  <span className="text-xs sm:text-sm font-medium text-[#6B7280] mt-0.5">
                    {stat.label}
                  </span>

                  {/* Subtle gradient border on hover */}
                  <div className="absolute inset-0 rounded-[1.25rem] bg-[#10B981]/0 group-hover:bg-[#10B981]/[0.03] transition-colors duration-300 pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom trust bar */}
          <motion.div
            className="mt-6 lg:mt-8 flex items-center gap-4 text-xs sm:text-sm text-[#9CA3AF]"
            variants={itemVariants}
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
              <span>Verified Sellers</span>
            </div>
            <div className="w-px h-4 bg-[#E5E7EB]" />
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3 2.25h6m-5.25-3.375c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125 1.125-.504 1.125-1.125-.504-1.125-1.125-1.125zm4.875-1.125c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125 1.125-.504 1.125-1.125-.504-1.125-1.125-1.125zm-8.625-1.125c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125 1.125-.504 1.125-1.125-.504-1.125-1.125-1.125z" />
              </svg>
              <span>Secure Payments</span>
            </div>
            <div className="w-px h-4 bg-[#E5E7EB]" />
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>24h Support</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroBanner;