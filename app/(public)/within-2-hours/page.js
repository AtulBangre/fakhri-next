import Within2HoursContent from '@/components/within-2-hours/Within2HoursContent';
import { getPageContent, getWithin2HoursProducts } from '@/lib/content';

export async function generateMetadata() {
    const content = await getPageContent('within2hours');
    return {
        title: content?.seo?.title || 'Within 2 Hours',
        description: content?.seo?.description || '',
        keywords: content?.seo?.keywords || '',
    };
}

export default async function Within2HoursPage() {
    const [content, contactContent, products] = await Promise.all([
        getPageContent('within2hours'),
        getPageContent('contact'), // Need contact info (phone/whatsapp)
        getWithin2HoursProducts()
    ]);

    // Transform products to match expected "services" format if needed or pass directly
    const services = products.map(p => ({ ...p, id: p.productId, _id: p._id.toString() }));

    return <Within2HoursContent
        initialContent={content}
        initialContactInfo={contactContent}
        initialServices={services}
    />;
}
