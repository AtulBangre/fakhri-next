import ContactContent from '@/components/contact/ContactContent';
import { getPageContent } from '@/lib/content';

export async function generateMetadata() {
    const content = await getPageContent('contact');
    return {
        title: content?.seo?.title || 'Contact Us',
        description: content?.seo?.description || '',
        keywords: content?.seo?.keywords || '',
    };
}

export default async function ContactPage() {
    const content = await getPageContent('contact');
    return <ContactContent initialContent={content} />;
}
