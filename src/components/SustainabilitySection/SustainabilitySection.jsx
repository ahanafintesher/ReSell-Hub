'use client';
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  FaLeaf,
  FaRecycle,
  FaTree,
  FaWater,
  FaCloudSun,
  FaGlobeAmericas,
  FaHeart,
  FaSeedling,
} from "react-icons/fa";

function SustainabilitySection() {
  const impactStats = [
    {
      id: 1,
      icon: <FaRecycle size={32} />,
      value: 15000,
      unit: "tons",
      label: "Waste Diverted",
      description: "From landfills this year",
      color: "#10B981",
      bgColor: "bg-[#10B981]/10",
      gradient: "from-[#10B981] to-[#059669]",
    },
    {
      id: 2,
      icon: <FaWater size={32} />,
      value: 500,
      unit: "M liters",
      label: "Water Saved",
      description: "Through reuse vs. new production",
      color: "#3B82F6",
      bgColor: "bg-[#3B82F6]/10",
      gradient: "from-[#3B82F6] to-[#2563EB]",
    },
    {
      id: 3,
      icon: <FaCloudSun size={32} />,
      value: 25000,
      unit: "tons",
      label: "CO₂ Reduced",
      description: "Carbon emissions prevented",
      color: "#F59E0B",
      bgColor: "bg-[#F59E0B]/10",
      gradient: "from-[#F59E0B] to-[#D97706]",
    },
    {
      id: 4,
      icon: <FaTree size={32} />,
      value: 50000,
      unit: "trees",
      label: "Trees Equivalent",
      description: "Environmental impact saved",
      color: "#10B981",
      bgColor: "bg-[#10B981]/10",
      gradient: "from-[#059669] to-[#047857]",
    },
  ];

  const benefits = [
    {
      icon: <FaLeaf size={24} />,
      title: "Reduce Carbon Footprint",
      description: "Every pre-owned purchase reduces manufacturing emissions by up to 80%",
      color: "#10B981",
    },
    {
      icon: <FaRecycle size={24} />,
      title: "Circular Economy",
      description: "Keep products in use longer, minimizing waste and resource extraction",
      color: "#3B82F6",
    },
    {
      icon: <FaSeedling size={24} />,
      title: "Conserve Resources",
      description: "Save water, energy, and raw materials needed for new production",
      color: "#F59E0B",
    },
    {
      icon: <FaGlobeAmericas size={24} />,
      title: "Protect Our Planet",
      description: "Join a community making conscious choices for a sustainable future",
      color: "#8B5CF6",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#F0FDF4] via-white to-[#ECFDF5] py-16 sm:py-20 lg:py-24">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Leaves */}
        <motion.div
          className="absolute top-[10%] left-[5%] text-[#10B981]/20"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <FaLeaf size={60} />
        </motion.div>

        <motion.div
          className="absolute top-[60%] right-[8%] text-[#10B981]/20"
          animate={{
            y: [0, -20, 0],
            rotate: [0, -15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        >
          <FaLeaf size={80} />
        </motion.div>

        <motion.div
          className="absolute bottom-[15%] left-[10%] text-[#10B981]/20"
          animate={{
            y: [0, -25, 0],
            rotate: [0, 12, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <FaSeedling size={50} />
        </motion.div>

        {/* Gradient Blobs */}
        <motion.div
          className="absolute top-0 right-[20%] w-[500px] h-[500px] rounded-full bg-[#10B981]/10 blur-3xl"
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
          className="absolute bottom-0 left-[15%] w-[600px] h-[600px] rounded-full bg-[#3B82F6]/10 blur-3xl"
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
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-[#10B981]/10 text-[#059669] border border-[#10B981]/20">
              <FaLeaf className="text-[#10B981]" size={14} />
              Environmental Impact
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] leading-tight tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Every Purchase Makes a
            <br />
            <span className="bg-gradient-to-r from-[#10B981] to-[#059669] bg-clip-text text-transparent">
              Difference for Our Planet
            </span>
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg text-[#6B7280] leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            By choosing pre-owned products, you're part of a sustainable movement reducing waste and protecting the environment
          </motion.p>
        </motion.div>

        {/* Impact Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {impactStats.map((stat, index) => (
            <ImpactStatCard key={stat.id} stat={stat} index={index} />
          ))}
        </div>

        {/* Visual Impact Representation */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] p-8 sm:p-12 lg:p-16 shadow-2xl">
            {/* Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            <div className="relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content */}
              <div className="text-white">
                <motion.div
                  className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <FaHeart className="text-white" size={18} />
                  <span className="font-semibold">Our Collective Impact</span>
                </motion.div>

                <h3 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
                  Together, We've Saved the Environment
                </h3>
                <p className="text-white/90 text-lg mb-6 leading-relaxed">
                  Every item you buy or sell on our platform contributes to a more sustainable future. Here's what our community has achieved together.
                </p>

                <div className="space-y-3">
                  {[
                    "Reduced manufacturing waste by thousands of tons",
                    "Prevented harmful emissions from new production",
                    "Conserved precious natural resources",
                    "Extended product lifecycles significantly",
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="text-white/95">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Visual */}
              <div className="relative">
                <motion.div
                  className="relative w-full aspect-square max-w-md mx-auto"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  {/* Circular Progress */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    {/* Background Circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="12"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="white"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 80}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                      whileInView={{ strokeDashoffset: 2 * Math.PI * 80 * 0.25 }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </svg>

                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <FaGlobeAmericas size={60} className="mb-4 opacity-90" />
                    <div className="text-5xl font-bold mb-2">75%</div>
                    <div className="text-sm opacity-90 text-center px-4">
                      Less Environmental Impact
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="group relative p-6 sm:p-8 rounded-2xl bg-white border-2 border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{
                y: -6,
                boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
                borderColor: benefit.color,
              }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-all duration-300"
                style={{
                  backgroundColor: `${benefit.color}15`,
                  color: benefit.color,
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {benefit.icon}
              </motion.div>

              <h3 className="text-xl font-bold text-[#111827] mb-2">
                {benefit.title}
              </h3>
              <p className="text-[#6B7280] leading-relaxed">
                {benefit.description}
              </p>

              {/* Hover Gradient */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${benefit.color}05, transparent)`,
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-[#6B7280] mb-6 text-lg">
            Join thousands making a positive environmental impact
          </p>
          <motion.button
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-semibold text-lg shadow-[0_4px_20px_rgba(16,185,129,0.25)]"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 30px rgba(16,185,129,0.35)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <FaLeaf size={18} />
            Start Shopping Sustainably
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// Impact Stat Card Component with Counter
function ImpactStatCard({ stat, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let startTime;
      const duration = 2000;
      const startValue = 0;
      const endValue = stat.value;

      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
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
        className={`relative h-full p-6 sm:p-8 rounded-2xl bg-white border-2 border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300`}
        whileHover={{
          y: -8,
          boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
          borderColor: stat.color,
        }}
      >
        {/* Icon */}
        <motion.div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${stat.bgColor} mb-4`}
          style={{ color: stat.color }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          {stat.icon}
        </motion.div>

        {/* Counter */}
        <div className="mb-2">
          <motion.div
            className="flex items-baseline gap-2"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3
              className="text-4xl sm:text-5xl font-extrabold tracking-tight"
              style={{ color: stat.color }}
            >
              {count.toLocaleString()}
            </h3>
            <span className="text-xl font-bold text-[#6B7280]">
              {stat.unit}
            </span>
          </motion.div>
        </div>

        {/* Label */}
        <h4 className="text-lg font-bold text-[#111827] mb-1">
          {stat.label}
        </h4>

        {/* Description */}
        <p className="text-sm text-[#6B7280]">{stat.description}</p>

        {/* Animated Progress Bar */}
        <motion.div
          className="mt-4 h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${stat.gradient}`}
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

export default SustainabilitySection;