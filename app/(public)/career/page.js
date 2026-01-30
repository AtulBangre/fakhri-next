import CareerContent from '@/components/career/CareerContent';
import { seoData } from '@/data/company';

export const metadata = {
    title: seoData.career.title,
    description: seoData.career.description,
    keywords: seoData.career.keywords,
};

export default function CareerPage() {
    return <CareerContent />;
}
