import ContactContent from '@/components/contact/ContactContent';
import { seoData } from '@/data/company';

export const metadata = {
    title: seoData.contact.title,
    description: seoData.contact.description,
    keywords: seoData.contact.keywords,
};

export default function ContactPage() {
    return <ContactContent />;
}
