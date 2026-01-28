// Pricing plans data
export const pricingPlans = [
    {
        id: "elite",
        name: "Elite",
        subtitle: "Starter Package",
        prices: {
            monthly: "₹15,000",
        },
        period: "/month",
        description: "Best for new sellers getting started on Amazon.",
        highlighted: false,
        features: [
            { text: "Listing/ Cataloging", value: "Up To 100", included: true },
            { text: "GTIN / Brand / Category Approvals", value: true, included: true },
            { text: "Listing Optimization", value: true, included: true },
            { text: "Order Management", value: true, included: true },
            { text: "Weekly Meeting", value: false, included: false },
            { text: "Returns Management", value: true, included: true },
            { text: "Safe-T Claims & A to Z Claim", value: true, included: true },
            { text: "Performance Management", value: "Basic", included: true },
            { text: "FBA Setup & Shipments", value: true, included: true },
            { text: "FBA Planning", value: true, included: true },
            { text: "Sponsored Ad Campaigns", value: true, included: true },
            { text: "Display / Brand Ads", value: false, included: false },
            { text: "Budget Planning", value: false, included: false },
            { text: "Deals & Coupons", value: true, included: true },
            { text: "Growth Strategy", value: false, included: false },
            { text: "Program Access", value: false, included: false },
            { text: "Pricing Determination", value: true, included: true },
            { text: "Product Recommendations", value: false, included: false },
            { text: "A+ / EBC + Infographics", value: false, included: false },
            { text: "SEO & Keywords", value: "Basic", included: true },
            { text: "Competitor Analysis", value: false, included: false },
            { text: "Custom Reports", value: false, included: false },
            { text: "M.T.R. Tax Reports & Invoices", value: true, included: true },
            { text: "Payment Reconciliation Report", value: false, included: false },
            { text: "Daily Monitoring", value: true, included: true },
            { text: "Priority Support", value: false, included: false },
        ],
        cta: "Get Elite Plan",
    },
    {
        id: "premium",
        name: "Premium",
        subtitle: "Most Popular",
        prices: {
            monthly: "₹20,000",
        },
        period: "/month",
        description: "Ideal for growing brands needing comprehensive management.",
        highlighted: true,
        features: [
            { text: "Listing/ Cataloging", value: "Up To 500", included: true },
            { text: "GTIN / Brand / Category Approvals", value: true, included: true },
            { text: "Listing Optimization", value: true, included: true },
            { text: "Order Management", value: true, included: true },
            { text: "Weekly Meeting", value: true, included: true },
            { text: "Returns Management", value: true, included: true },
            { text: "Safe-T Claims & A to Z Claim", value: true, included: true },
            { text: "Performance Management", value: "Advanced", included: true },
            { text: "FBA Setup & Shipments", value: true, included: true },
            { text: "FBA Planning", value: true, included: true },
            { text: "Sponsored Ad Campaigns", value: true, included: true },
            { text: "Display / Brand Ads", value: "Display Ads", included: true },
            { text: "Budget Planning", value: true, included: true },
            { text: "Deals & Coupons", value: true, included: true },
            { text: "Growth Strategy", value: true, included: true },
            { text: "Program Access", value: false, included: false },
            { text: "Pricing Determination", value: true, included: true },
            { text: "Product Recommendations", value: true, included: true },
            { text: "A+ / EBC + Infographics", value: "5 EBC + 5 InfoGFX", included: true },
            { text: "SEO & Keywords", value: "Monthly 1 Time", included: true },
            { text: "Competitor Analysis", value: false, included: false },
            { text: "Custom Reports", value: true, included: true },
            { text: "M.T.R. Tax Reports & Invoices", value: false, included: false },
            { text: "Payment Reconciliation Report", value: false, included: false },
            { text: "Daily Monitoring", value: true, included: true },
            { text: "Priority Support", value: false, included: false },
        ],
        cta: "Get Premium Plan",
    },
    {
        id: "platinum",
        name: "Platinum",
        subtitle: "Enterprise Solution",
        prices: {
            monthly: "₹30,000",
        },
        period: "/month",
        description: "Full-service solution for high-volume sellers and large catalogs.",
        highlighted: false,
        features: [
            { text: "Listing/ Cataloging", value: "Up To 1000", included: true },
            { text: "GTIN / Brand / Category Approvals", value: true, included: true },
            { text: "Listing Optimization", value: true, included: true },
            { text: "Order Management", value: true, included: true },
            { text: "Weekly Meeting", value: true, included: true },
            { text: "Returns Management", value: true, included: true },
            { text: "Safe-T Claims & A to Z Claim", value: true, included: true },
            { text: "Performance Management", value: "Advanced + Priority", included: true },
            { text: "FBA Setup & Shipments", value: true, included: true },
            { text: "FBA Planning", value: true, included: true },
            { text: "Sponsored Ad Campaigns", value: true, included: true },
            { text: "Display / Brand Ads", value: "Display+Brands Ads", included: true },
            { text: "Budget Planning", value: true, included: true },
            { text: "Deals & Coupons", value: true, included: true },
            { text: "Growth Strategy", value: true, included: true },
            { text: "Program Access", value: true, included: true },
            { text: "Pricing Determination", value: true, included: true },
            { text: "Product Recommendations", value: true, included: true },
            { text: "A+ / EBC + Infographics", value: "10 EBC + 10 InfoGFX", included: true },
            { text: "SEO & Keywords", value: "Monthly 3 Time", included: true },
            { text: "Competitor Analysis", value: true, included: true },
            { text: "Custom Reports", value: "Advanced", included: true },
            { text: "M.T.R. Tax Reports & Invoices", value: true, included: true },
            { text: "Payment Reconciliation Report", value: true, included: true },
            { text: "Daily Monitoring", value: true, included: true },
            { text: "Priority Support", value: true, included: true },
        ],
        cta: "Get Platinum Plan",
    },
];

export const pricingDisclaimer = "Sales and growth results may vary based on multiple factors including product category, competition, market conditions, and seller commitment. No guaranteed outcomes. Results mentioned are based on historical client performance and are not promises of future success.";

// Within 2 Hours Service Pricing Data
export const within2HoursServices = [
    {
        id: "apt-content-1",
        name: "A+ Content Creation/product",
        price: 500,
        category: "Content"
    },
    {
        id: "infographics",
        name: "Infographics Creation/product",
        price: 500,
        category: "Design"
    },
    {
        id: "listing-catalog",
        name: "Listing Cataloging",
        price: 500,
        category: "Catalog"
    },
    {
        id: "apt-content-2",
        name: "Product Photography",
        price: 500,
        category: "Content"
    },
    {
        id: "apt-content-3",
        name: "Brand Store Design",
        price: 500,
        category: "Design"
    },
    {
        id: "apt-content-4",
        name: "Product Video Creation",
        price: 500,
        category: "Video"
    },
    {
        id: "apt-content-5",
        name: "SEO Optimization",
        price: 500,
        category: "SEO"
    },
    {
        id: "apt-content-6",
        name: "Competitor Analysis",
        price: 500,
        category: "Analysis"
    },
    {
        id: "apt-content-7",
        name: "Product Listing Audit",
        price: 500,
        category: "Audit"
    },
];

export const within2HoursInfo = {
    title: "Problems We Handle Within 2 Hours",
    description: "When your Amazon business is at risk, our experts act immediately. Get urgent issues resolved with guaranteed 2-hour response time.",
    badge: "Emergency Services"
};
