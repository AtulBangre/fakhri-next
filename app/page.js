import Hero from '@/components/home/Hero';
import TrustBadges from '@/components/home/TrustBadges';
import ServicesPreview from '@/components/home/ServicesPreview';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import CTA from '@/components/home/CTA';
import Testimonials from '@/components/home/Testimonials';
import { seoData } from '@/data/company';
import { homeFAQs } from '@/data/faq';
import FaQ from '@/components/home/FaQ';

export const metadata = {
  title: seoData.home.title,
  description: seoData.home.description,
  keywords: seoData.home.keywords,
};

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBadges />
      <ServicesPreview />
      <WhyChooseUs />
      <CTA />
      <Testimonials />
      <FaQ data={homeFAQs} />
    </>
  );
}
