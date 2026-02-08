import AboutContent from '@/components/about/AboutContent';
import { seoData } from '@/data/company';

export const metadata = {
    title: seoData.about.title,
    description: seoData.about.description,
    keywords: seoData.about.keywords,
};

export default function AboutPage() {
    return <AboutContent />;
}
