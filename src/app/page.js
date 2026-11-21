import HeroBanner from "@/components/Banner/Banner";
import PopularCategories from "@/components/Home/PopularCategories";
import FeaturedProducts from "@/components/Home/FeaturedProducts";
import Stats from "@/components/Stats/Stats";
import SuccessStories from "@/components/SuccessStories/SuccessStories";
import SustainabilitySection from "@/components/SustainabilitySection/SustainabilitySection";
import TrustedSellersShowcase from "@/components/TopSeller/TopSeller";
import CallToAction from "@/components/Home/CallToAction";
import { getFeaturedCategories } from "@/lib/actions/categories";

export default async function Home() {
  const { data: featuredCategories = [], error: featuredError = null } =
    await getFeaturedCategories();

  return (
    <div className="w-full overflow-hidden">
      <HeroBanner />
      <PopularCategories
        initialCategories={featuredCategories}
        initialError={featuredError}
      />
      <FeaturedProducts />
      <Stats />
      <SuccessStories />
      <SustainabilitySection />
      <TrustedSellersShowcase />
      <CallToAction />
    </div>
  );
}
