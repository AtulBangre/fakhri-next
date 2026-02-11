import Hero from '@/components/home/Hero';
import TrustBadges from '@/components/home/TrustBadges';
import ServicesPreview from '@/components/home/ServicesPreview';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import CTA from '@/components/home/CTA';
import Testimonials from '@/components/home/Testimonials';
import FaQ from '@/components/home/FaQ';
import { getServices, getTestimonials, getFAQs, getCompanyData } from '@/lib/actions/content';

export const metadata = {
  title: "Fakhri IT Services | No.1 Amazon Seller Services Partner",
  description: "Your trusted Amazon seller services partner since 2016. Expert account management, FBA operations, PPC advertising, and growth strategies for Amazon sellers.",
  keywords: "Amazon seller services, Amazon account management, FBA services, Amazon PPC, Amazon consulting",
};

export default async function Home() {
  const [services, testimonials, faqs, company] = await Promise.all([
    getServices(),
    getTestimonials(),
    getFAQs(),
    getCompanyData()
  ]);

  const homeFAQs = faqs.filter(f => f.categories && f.categories.home);

  return (
    <>
      <Hero company={company} />
      <TrustBadges company={company} />
      <ServicesPreview services={services} />
      <WhyChooseUs company={company} />
      <CTA />
      <Testimonials testimonials={testimonials} />
      <FaQ data={homeFAQs} />
    </>
  );
}
