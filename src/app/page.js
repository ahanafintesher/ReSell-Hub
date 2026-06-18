import HeroBanner from "@/components/Banner/Banner";
import Stats from "@/components/Stats/Stats";
import SuccessStories from "@/components/SuccessStories/SuccessStories";
import SustainabilitySection from "@/components/SustainabilitySection/SustainabilitySection";


export default function Home() {
  return (
   <div>
     <HeroBanner></HeroBanner>
    <SuccessStories></SuccessStories>
    <Stats></Stats>
    <SustainabilitySection></SustainabilitySection>
   </div>
  );
}
