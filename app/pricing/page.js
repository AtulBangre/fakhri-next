import PricingContent from '@/components/pricing/PricingContent';
import UnderConstruction from '@/components/ui/UnderConstruction';
import { seoData } from '@/data/company';

export const metadata = {
    title: seoData.pricing.title,
    description: seoData.pricing.description,
    keywords: seoData.pricing.keywords,
};

export default function PricingPage() {
    return (
        <>
            {/* <PricingContent /> */}
            <UnderConstruction
                title="Service Pricing & Plans"
                messageIndex={4}
            />
        </>
    );
}
