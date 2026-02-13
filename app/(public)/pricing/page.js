import { getPricingPlans, getFAQs, getCatalogServices } from '@/lib/actions/content';
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
        getCatalogServices()
    ]);

    // Format services for the add-ons list based on Standard Price
    const services = servicesRaw
        .filter(srv => srv.pricing && srv.pricing.standard && srv.pricing.standard.price > 0)
        .map(srv => ({
            id: srv._id,
            name: srv.name,
            category: srv.category,
            price: srv.pricing.standard.price
        }));

    return <PricingContent plans={plans} faqs={faqs} services={services} />;
}
