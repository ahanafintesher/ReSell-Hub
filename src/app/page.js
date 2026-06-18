import HeroBanner from "@/components/Banner/Banner";
import Stats from "@/components/Stats/Stats";
import SuccessStories from "@/components/SuccessStories/SuccessStories";


export default function Home() {
  return (
   <div>
     <HeroBanner></HeroBanner>
    <SuccessStories></SuccessStories>
    <Stats></Stats>
   </div>
  );
}
