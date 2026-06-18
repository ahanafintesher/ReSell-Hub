'use client';
import { motion } from "framer-motion";
import { useState } from "react";
import {
  FaStar,
  FaCheckCircle,
  FaShoppingBag,
  FaThumbsUp,
  FaMedal,
  FaAward,
  FaCrown,
  FaHeart,
  FaArrowRight,
} from "react-icons/fa";

function TrustedSellersShowcase() {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Sellers", icon: <FaStar size={16} /> },
    { id: "electronics", label: "Electronics", icon: "📱" },
    { id: "fashion", label: "Fashion", icon: "👗" },
    { id: "home", label: "Home & Garden", icon: "🏡" },
    { id: "sports", label: "Sports", icon: "⚽" },
  ];

  const topSellers = [
    {
      id: 1,
      name: "TechHub Pro",
      category: "electronics",
      avatar: "https://i.pravatar.cc/150?img=33",
      badge: "platinum",
      rating: 4.9,
      reviewCount: 2847,
      itemsSold: 5420,
      responseTime: "1 hour",
      joinedDate: "2021",
      specialties: ["Laptops", "Smartphones", "Cameras"],
      verified: true,
      topRated: true,
      description: "Certified refurbisher specializing in premium electronics with warranty",
      coverImage: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
    },
    {
      id: 2,
      name: "Vintage Closet",
      category: "fashion",
      avatar: "https://i.pravatar.cc/150?img=44",
      badge: "gold",
      rating: 4.8,
      reviewCount: 1923,
      itemsSold: 3850,
      responseTime: "2 hours",
      joinedDate: "2020",
      specialties: ["Designer Bags", "Vintage Clothing", "Accessories"],
      verified: true,
      topRated: true,
      description: "Curated collection of authentic vintage and designer fashion pieces",
      coverImage: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
    },
    {
      id: 3,
      name: "HomeStyle Living",
      category: "home",
      avatar: "https://i.pravatar.cc/150?img=26",
      badge: "platinum",
      rating: 5.0,
      reviewCount: 1654,
      itemsSold: 2980,
      responseTime: "30 mins",
      joinedDate: "2022",
      specialties: ["Furniture", "Decor", "Kitchen"],
      verified: true,
      topRated: true,
      description: "Quality home furnishings and decor with sustainable sourcing",
      coverImage: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800&q=80",
    },
    {
      id: 4,
      name: "Sports Gear Hub",
      category: "sports",
      avatar: "https://i.pravatar.cc/150?img=68",
      badge: "gold",
      rating: 4.9,
      reviewCount: 1432,
      itemsSold: 3120,
      responseTime: "1 hour",
      joinedDate: "2021",
      specialties: ["Cycling", "Fitness", "Outdoor"],
      verified: true,
      topRated: false,
      description: "Premium sports equipment and outdoor gear at great prices",
      coverImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
    },
    {
      id: 5,
      name: "Gadget Galaxy",
      category: "electronics",
      avatar: "https://i.pravatar.cc/150?img=14",
      badge: "silver",
      rating: 4.7,
      reviewCount: 987,
      itemsSold: 1850,
      responseTime: "3 hours",
      joinedDate: "2022",
      specialties: ["Gaming", "Audio", "Smart Home"],
      verified: true,
      topRated: false,
      description: "Latest tech gadgets and gaming equipment with great deals",
      coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    },
    {
      id: 6,
      name: "Eco Fashion Co",
      category: "fashion",
      avatar: "https://i.pravatar.cc/150?img=48",
      badge: "gold",
      rating: 4.8,
      reviewCount: 1245,
      itemsSold: 2670,
      responseTime: "2 hours",
      joinedDate: "2020",
      specialties: ["Sustainable Fashion", "Shoes", "Jewelry"],
      verified: true,
      topRated: true,
      description: "Eco-conscious fashion with emphasis on quality and sustainability",
      coverImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    },
  ];

  const getBadgeInfo = (badge) => {
    const badges = {
      platinum: {
        icon: <FaCrown size={16} />,
        color: "#059669",
        bgColor: "bg-[#059669]/10",
        borderColor: "border-[#059669]/30",
        label: "Platinum Seller",
      },
      gold: {
        icon: <FaMedal size={16} />,
        color: "#10B981",
        bgColor: "bg-[#10B981]/10",
        borderColor: "border-[#10B981]/30",
        label: "Gold Seller",
      },
      silver: {
        icon: <FaAward size={16} />,
        color: "#34D399",
        bgColor: "bg-[#34D399]/10",
        borderColor: "border-[#34D399]/30",
        label: "Silver Seller",
      },
    };
    return badges[badge] || badges.silver;
  };

  const filteredSellers = activeCategory === "all" 
    ? topSellers 
    : topSellers.filter(seller => seller.category === activeCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  return (
    <section className="relative w-full overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[5%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#10B981]/5 blur-3xl"
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
          className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-[#059669]/5 blur-3xl"
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
              <FaMedal className="text-[#10B981]" size={14} />
              Premium Marketplace Partners
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] leading-tight tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Meet Our Top-Rated
            <br />
            <span className="bg-gradient-to-r from-[#10B981] to-[#059669] bg-clip-text text-transparent">
              Trusted Sellers
            </span>
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg text-[#111827] leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Verified professionals with outstanding ratings and thousands of happy customers
          </motion.p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeCategory === category.id
                  ? "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/25"
                  : "bg-white text-[#111827] border-2 border-[#E5E7EB] hover:border-[#10B981]/30 hover:text-[#10B981]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {typeof category.icon === 'string' ? (
                <span className="text-lg">{category.icon}</span>
              ) : (
                category.icon
              )}
              {category.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Sellers Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          key={activeCategory}
        >
          {filteredSellers.map((seller, index) => (
            <SellerCard key={seller.id} seller={seller} index={index} getBadgeInfo={getBadgeInfo} />
          ))}
        </motion.div>

        {/* Bottom Stats Bar */}
        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-2xl bg-gradient-to-r from-[#F0FDF4] via-white to-[#F0FDF4] border-2 border-[#10B981]/20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { icon: <FaMedal size={24} />, value: "500+", label: "Verified Sellers", color: "#10B981" },
            { icon: <FaStar size={24} />, value: "4.8", label: "Average Rating", color: "#059669" },
            { icon: <FaShoppingBag size={24} />, value: "50K+", label: "Products Listed", color: "#10B981" },
            { icon: <FaThumbsUp size={24} />, value: "98%", label: "Positive Reviews", color: "#059669" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
              >
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-[#111827] mb-1">{stat.value}</div>
              <div className="text-sm text-[#111827]">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-[#111827] mb-6 text-lg">
            Want to become a trusted seller?
          </p>
          <motion.button
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-semibold text-lg shadow-[0_4px_20px_rgba(16,185,129,0.25)]"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 30px rgba(16,185,129,0.35)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            Apply Now
            <FaArrowRight size={16} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// Seller Card Component
function SellerCard({ seller, index, getBadgeInfo }) {
  const badgeInfo = getBadgeInfo(seller.badge);

  return (
    <motion.div
      className="group relative"
      variants={{
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
      }}
      whileHover={{ y: -8 }}
    >
      <div className="relative h-full overflow-hidden rounded-2xl bg-white border-2 border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] hover:border-[#10B981]/30 transition-all duration-300">
        {/* Cover Image */}
        <div className="relative h-32 overflow-hidden">
          <img
            src={seller.coverImage}
            alt={seller.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Top Rated Badge */}
          {seller.topRated && (
            <motion.div
              className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm flex items-center gap-1.5 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <FaStar className="text-[#10B981]" size={12} />
              <span className="text-xs font-bold text-[#111827]">Top Rated</span>
            </motion.div>
          )}
        </div>

        {/* Profile Section */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-12 mb-4">
            <motion.div
              className="relative inline-block"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={seller.avatar}
                alt={seller.name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-xl"
              />
              {seller.verified && (
                <div
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg"
                  style={{ backgroundColor: badgeInfo.color }}
                >
                  <FaCheckCircle className="text-white" size={16} />
                </div>
              )}
            </motion.div>
          </div>

          {/* Seller Info */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-[#111827] mb-1">{seller.name}</h3>
            
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${badgeInfo.bgColor} border ${badgeInfo.borderColor}`}
              style={{ color: badgeInfo.color }}
            >
              {badgeInfo.icon}
              {badgeInfo.label}
            </div>

            {/* Description */}
            <p className="text-sm text-[#111827] leading-relaxed mb-4">
              {seller.description}
            </p>

            {/* Specialties */}
            <div className="flex flex-wrap gap-2 mb-4">
              {seller.specialties.map((specialty, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#F0FDF4] text-xs font-medium text-[#111827] border border-[#10B981]/20"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 p-4 rounded-xl bg-[#F0FDF4] border border-[#10B981]/20">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <FaStar className="text-[#10B981]" size={14} />
                <span className="text-lg font-bold text-[#111827]">{seller.rating}</span>
              </div>
              <p className="text-xs text-[#111827]">{seller.reviewCount.toLocaleString()} reviews</p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <FaShoppingBag className="text-[#10B981]" size={14} />
                <span className="text-lg font-bold text-[#111827]">{seller.itemsSold.toLocaleString()}</span>
              </div>
              <p className="text-xs text-[#111827]">Items sold</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#111827]">Response time:</span>
              <span className="font-semibold text-[#10B981]">{seller.responseTime}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#111827]">Member since:</span>
              <span className="font-semibold text-[#111827]">{seller.joinedDate}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-semibold text-sm shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Shop
            </motion.button>
            <motion.button
              className="px-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[#111827] hover:border-[#10B981]/30 hover:text-[#10B981] transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaHeart size={18} />
            </motion.button>
          </div>
        </div>

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#10B981]/0 to-[#059669]/0 group-hover:from-[#10B981]/[0.02] group-hover:to-[#059669]/[0.02] transition-all duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
}

export default TrustedSellersShowcase;