import { getCompanyData } from '@/lib/actions/content';
import ContactContent from '@/components/contact/ContactContent';

export const metadata = {
    title: "Contact Us | Fakhri IT Services - Get a Free Consultation",
    description: "Contact our team for a free Amazon account audit and consultation. We're here to help you scale your Amazon business.",
    keywords: "Contact Fakhri IT Services, Amazon consultant contact, free Amazon audit",
};

export default async function ContactPage() {
    const company = await getCompanyData();
    return <ContactContent company={company} />;
}
