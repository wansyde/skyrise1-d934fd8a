import AppLayout from "@/components/layout/AppLayout";
import HeroSection from "@/components/home/HeroSection";
import CaseStudySection from "@/components/home/CaseStudySection";
import AnalyticsSection from "@/components/home/AnalyticsSection";
import EditorialSection from "@/components/home/EditorialSection";
import WhatsAppButton from "@/components/WhatsAppButton";

const Home = () => {
  return (
    <AppLayout>
      <WhatsAppButton />
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
