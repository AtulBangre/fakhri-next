import Within2HoursContent from '@/components/within-2-hours/Within2HoursContent';
import { seoData } from '@/data/company';

export const metadata = {
    title: seoData.within2hours.title,
    description: seoData.within2hours.description,
    keywords: seoData.within2hours.keywords,
};

export default function Within2HoursPage() {
    return <Within2HoursContent />;
}
