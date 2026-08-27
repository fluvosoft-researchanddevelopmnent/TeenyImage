import {
  HeroSection,
  ToolsSection,
  WorkYourWaySection,
  FeatureTrustSection,
} from "@/components/common";
import { RecentFilesSection } from "@/components/common/RecentFilesSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <RecentFilesSection />
      <ToolsSection />
      <WorkYourWaySection />
      <FeatureTrustSection />
    </>
  );
}
