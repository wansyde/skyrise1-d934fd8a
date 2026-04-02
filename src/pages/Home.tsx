import AppLayout from "@/components/layout/AppLayout";
import HeroSection from "@/components/home/HeroSection";
import CaseStudySection from "@/components/home/CaseStudySection";
import AnalyticsSection from "@/components/home/AnalyticsSection";
import EditorialSection from "@/components/home/EditorialSection";

const Home = () => {
  return (
    <AppLayout>
      <div className="px-0">
        <HeroSection />
        <CaseStudySection />
        <AnalyticsSection />
        <EditorialSection />
      </div>
    </AppLayout>
  );
};

export default Home;
