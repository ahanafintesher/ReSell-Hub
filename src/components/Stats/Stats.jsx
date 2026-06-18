'use client'  
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  FaShoppingBag,
  FaStore,
  FaUsers,
  FaCheckCircle,
  FaTrophy,
  FaChartLine,
} from "react-icons/fa";

function Stats() {
  const stats = [
    {
      id: 1,
      icon: <FaShoppingBag size={28} />,
      label: "Total Products",
      value: 50000,
      suffix: "+",
      color: "#10B981",
      bgColor: "bg-[#10B981]/10",
      borderColor: "border-[#10B981]/20",
      description: "Active listings available",
    },
    {
      id: 2,
      icon: <FaStore size={28} />,
      label: "Total Sellers",
      value: 15000,
      suffix: "+",
      color: "#3B82F6",
      bgColor: "bg-[#3B82F6]/10",
      borderColor: "border-[#3B82F6]/20",
      description: "Verified sellers worldwide",
    },
    {
      id: 3,
      icon: <FaUsers size={28} />,
      label: "Total Buyers",
      value: 120000,
      suffix: "+",
      color: "#F59E0B",
      bgColor: "bg-[#F59E0B]/10",
      borderColor: "border-[#F59E0B]/20",
      description: "Happy customers served",
    },
    {
      id: 4,
      icon: <FaCheckCircle size={28} />,
      label: "Completed Orders",
      value: 250000,
      suffix: "+",
      color: "#8B5CF6",
      bgColor: "bg-[#8B5CF6]/10",
      borderColor: "border-[#8B5CF6]/20",
      description: "Successful transactions",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Gradient Blobs */}
        <motion.div
          className="absolute top-0 left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#10B981]/10 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#3B82F6]/10 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-[#10B981]/10 to-[#3B82F6]/10 text-[#059669] border border-[#10B981]/20">
              <FaChartLine className="text-[#10B981]" size={14} />
              Our Growing Community
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] leading-tight tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Marketplace by the
            <br />
            <span className="bg-gradient-to-r from-[#10B981] to-[#3B82F6] bg-clip-text text-transparent">
              Numbers
            </span>
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg text-[#6B7280] leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join a thriving marketplace trusted by thousands of buyers and sellers worldwide
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <StatCard key={stat.id} stat={stat} index={index} />
          ))}
        </div>

        {/* Achievement Banner */}
        <motion.div
          className="mt-12 lg:mt-16 relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#10B981] via-[#059669] to-[#10B981] p-8 sm:p-10 lg:p-12 shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
            {/* Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center lg:text-left">
                <motion.div
                  className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaTrophy className="text-white" size={32} />
                </motion.div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    #1 Trusted Marketplace
                  </h3>
                  <p className="text-white/90 text-sm sm:text-base">
                    Rated 4.9/5 by over 50,000+ users
                  </p>
                </div>
              </div>

              <motion.button
                className="flex-shrink-0 px-8 py-4 rounded-xl bg-white text-[#10B981] font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Join Now
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {[
            { label: "Avg. Response Time", value: "2 hours" },
            { label: "Customer Satisfaction", value: "98%" },
            { label: "Monthly Growth", value: "+15%" },
            { label: "Countries Served", value: "50+" },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="text-center p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]"
              whileHover={{ y: -4, borderColor: "#10B981" }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-2xl font-bold text-[#111827] mb-1">
                {item.value}
              </p>
              <p className="text-sm text-[#6B7280]">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Separate StatCard Component with Counter Animation
function StatCard({ stat, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let startTime;
      const duration = 2000; // 2 seconds
      const startValue = 0;
      const endValue = stat.value;

      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(easeOutQuart * (endValue - startValue) + startValue);

        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(endValue);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, stat.value]);

  return (
    <motion.div
      ref={ref}
      className="group relative"
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <motion.div
        className={`relative h-full p-6 sm:p-8 rounded-2xl bg-white border-2 ${stat.borderColor} shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300`}
        whileHover={{
          y: -8,
          boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
          borderColor: stat.color,
        }}
      >
        {/* Icon Container */}
        <motion.div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${stat.bgColor} mb-4 transition-all duration-300`}
          style={{ color: stat.color }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          {stat.icon}
        </motion.div>

        {/* Counter */}
        <div className="mb-2">
          <motion.h3
            className="text-4xl sm:text-5xl font-extrabold text-[#111827] tracking-tight"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {count.toLocaleString()}
            <span style={{ color: stat.color }}>{stat.suffix}</span>
          </motion.h3>
        </div>

        {/* Label */}
        <h4 className="text-lg font-bold text-[#111827] mb-1">
          {stat.label}
        </h4>

        {/* Description */}
        <p className="text-sm text-[#6B7280] leading-relaxed">
          {stat.description}
        </p>

        {/* Progress Bar */}
        <motion.div
          className="mt-4 h-1 rounded-full bg-[#E5E7EB] overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: stat.color }}
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          />
        </motion.div>

        {/* Hover Gradient */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${stat.color}05, transparent)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export default Stats;