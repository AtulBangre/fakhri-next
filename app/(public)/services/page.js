import ServicesContent from '@/components/services/ServicesContent';
import { getPageContent, getServices } from '@/lib/content';

export async function generateMetadata() {
    const content = await getPageContent('services');
    return {
        title: content?.seo?.title || 'Our Services',
        description: content?.seo?.description || '',
        keywords: content?.seo?.keywords || '',
    };
}

export default async function ServicesPage() {
    const [content, services] = await Promise.all([
        getPageContent('services'),
        getServices()
    ]);

    // Transform services if needed (e.g. ensure id is present)
    const transformedServices = services.map(s => ({
        ...s,
        id: s.serviceId, // Ensure serviceId is mapped to id as component expects
        _id: s._id.toString()
    }));

    return <ServicesContent initialServices={transformedServices} initialContent={content} />;
}
