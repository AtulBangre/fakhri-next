import Hero from '@/components/home/Hero';
import TrustBadges from '@/components/home/TrustBadges';
import ServicesPreview from '@/components/home/ServicesPreview';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import CTA from '@/components/home/CTA';
import Testimonials from '@/components/home/Testimonials';
import FaQ from '@/components/home/FaQ';
import { getPageContent, getServices, getTestimonials, getFaqs } from '@/lib/content';

export async function generateMetadata() {
  const content = await getPageContent('home');
  return {
    title: content?.seo?.title || 'Fakhri IT Services',
    description: content?.seo?.description || '',
    keywords: content?.seo?.keywords || '',
  };
}

export default async function Home() {
  const [content, services, testimonials, faqs] = await Promise.all([
    getPageContent('home'),
    getServices(),
    getTestimonials(),
    getFaqs('Home')
  ]);

  // Transform items if needed (converting objects to plain JSON was done in lib/content)
  const transformedServices = services.map(s => ({ ...s, _id: s._id.toString() }));
  const transformedTestimonials = testimonials.map(t => ({ ...t, _id: t._id.toString() }));
  const transformedFaqs = faqs.map(f => ({ ...f, _id: f._id.toString() }));

  return (
    <>
      <Hero initialContent={content} />
      <TrustBadges initialContent={content} />
      <ServicesPreview initialServices={transformedServices} initialContent={content} />
      <WhyChooseUs initialContent={content} />
      <CTA initialContent={content} />
      <Testimonials initialTestimonials={transformedTestimonials} initialContent={content} />
      <FaQ data={transformedFaqs} />
    </>
  );
}
