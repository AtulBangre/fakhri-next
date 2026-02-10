import PricingContent from '@/components/pricing/PricingContent';
import { getPageContent, getPlans, getFaqs, getWithin2HoursProducts } from '@/lib/content';

export async function generateMetadata() {
    const content = await getPageContent('pricing');
    return {
        title: content?.seo?.title || 'Pricing',
        description: content?.seo?.description || '',
        keywords: content?.seo?.keywords || '',
    };
}

export default async function PricingPage() {
    const [content, plans, faqs, within2HoursProducts, within2HoursContent] = await Promise.all([
        getPageContent('pricing'),
        getPlans(),
        getFaqs('Pricing'),
        getWithin2HoursProducts(),
        getPageContent('within2hours')
    ]);

    // Transform plans for simplified ID access if needed by UI
    const transformedPlans = plans.map(p => ({ ...p, id: p.planId, _id: p._id.toString() }));
    const transformedFaqs = faqs.map(f => ({ ...f, _id: f._id.toString() }));
    const transformedProducts = within2HoursProducts.map(p => ({ ...p, id: p.productId, _id: p._id.toString() }));

    return <PricingContent
        initialPlans={transformedPlans}
        initialFaqs={transformedFaqs}
        initialWithin2Hours={transformedProducts}
        initialContent={content}
        initialWithin2HoursContent={within2HoursContent}
    />;
}
