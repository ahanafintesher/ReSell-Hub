import HeroBanner from "@/components/Banner/Banner";
import PopularCategories from "@/components/Home/PopularCategories";
import FeaturedProducts from "@/components/Home/FeaturedProducts";
import Stats from "@/components/Stats/Stats";
import SuccessStories from "@/components/SuccessStories/SuccessStories";
import SustainabilitySection from "@/components/SustainabilitySection/SustainabilitySection";
import TrustedSellersShowcase from "@/components/TopSeller/TopSeller";
import CallToAction from "@/components/Home/CallToAction";

export default function Home() {
  return (
    <div className="w-full overflow-hidden">
      <HeroBanner />
      <PopularCategories />
      <FeaturedProducts />
      <Stats />
      <SuccessStories />
      <SustainabilitySection />
      <TrustedSellersShowcase />
      <CallToAction />
    </div>
  );
}
