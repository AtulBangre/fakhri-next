import { getPricingPlans, getFAQs, getServices } from '@/lib/actions/content';
import PricingContent from '@/components/pricing/PricingContent';

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Pricing Plans | Fakhri IT Services - Transparent Amazon Service Pricing",
    description: "Flexible pricing plans for Amazon sellers. Choose from Elite, Premium, and Platinum packages designed to scale your Amazon business.",
    keywords: "Amazon services pricing, seller services cost, Amazon management packages",
};

export default async function PricingPage() {
    const [plans, faqs, servicesRaw] = await Promise.all([
        getPricingPlans(),
        getFAQs('pricing'),
        getServices()
    ]);

    // Format services for the add-ons list
    const services = servicesRaw
        .filter(srv => srv.pricing && srv.pricing.standard && srv.pricing.standard.price)
        .map(srv => ({
            id: srv._id,
            name: srv.title,
            category: srv.category,
            price: srv.pricing.standard.price
        }));

    return <PricingContent plans={plans} faqs={faqs} services={services} />;
}
