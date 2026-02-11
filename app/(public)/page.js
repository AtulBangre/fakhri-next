import Hero from '@/components/home/Hero';
import TrustBadges from '@/components/home/TrustBadges';
import ServicesPreview from '@/components/home/ServicesPreview';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import CTA from '@/components/home/CTA';
import Testimonials from '@/components/home/Testimonials';

import { allFAQs } from '@/data/allFAQs';
import FaQ from '@/components/home/FaQ';

export const metadata = {
  title: "Fakhri IT Services | No.1 Amazon Seller Services Partner",
  description: "Your trusted Amazon seller services partner since 2016. Expert account management, FBA operations, PPC advertising, and growth strategies for Amazon sellers.",
  keywords: "Amazon seller services, Amazon account management, FBA services, Amazon PPC, Amazon consulting",
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
      <FaQ data={allFAQs.filter(f => f.categories.home)} />
    </>
  );
}
