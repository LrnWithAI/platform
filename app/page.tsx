import { HeroSection } from "@/components/layout/sections/hero";
import { BenefitsSection } from "@/components/layout/sections/benefits";
import { FeaturesSection } from "@/components/layout/sections/features";
import { CommunitySection } from "@/components/layout/sections/community";
import { FooterSection } from "@/components/layout/sections/footer";
import { TeamSection } from "@/components/layout/sections/team";

export default function Home() {
  return (
    <div className="p-2">
      <HeroSection />
      <BenefitsSection />
      <FeaturesSection />
      <TeamSection />
      <CommunitySection />
      <FooterSection />
    </div>
  );
}
