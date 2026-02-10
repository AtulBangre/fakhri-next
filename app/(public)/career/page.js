import CareerContent from '@/components/career/CareerContent';
import { getPageContent, getJobs } from '@/lib/content';

export async function generateMetadata() {
    const content = await getPageContent('career');
    return {
        title: content?.seo?.title || 'Careers',
        description: content?.seo?.description || '',
        keywords: content?.seo?.keywords || '',
    };
}

export default async function CareerPage() {
    const [content, jobs] = await Promise.all([
        getPageContent('career'),
        getJobs()
    ]);

    return <CareerContent initialContent={content} initialJobs={jobs} />;
}
