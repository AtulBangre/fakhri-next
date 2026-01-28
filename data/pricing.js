// Pricing plans data
export const pricingPlans = [
    {
        id: "elite",
        name: "Elite",
        subtitle: "For Growing Sellers",
        prices: {
            quarterly: "$999",
            yearly: "$849"
        },
        period: "/month",
        description: "Perfect for sellers starting their Amazon journey or looking to optimize their existing presence.",
        highlighted: false,
        features: [
            { text: "Account health monitoring", included: true },
            { text: "Basic listing optimization (up to 10 SKUs)", included: true },
            { text: "Monthly performance reports", included: true },
            { text: "Email support (48hr response)", included: true },
            { text: "Basic PPC management", included: true },
            { text: "FBA inventory guidance", included: true },
            { text: "A+ Content creation", included: false },
            { text: "Dedicated account manager", included: false },
            { text: "Priority support", included: false },
            { text: "Strategic consultation", included: false },
            { text: "Strategic abc", included: false }
        ],
        cta: "Get Started",
    },
    {
        id: "premium",
        name: "Premium",
        subtitle: "Most Popular",
        prices: {
            quarterly: "$2,499",
            yearly: "$2,199"
        },
        period: "/month",
        description: "Ideal for established sellers ready to accelerate growth and dominate their category.",
        highlighted: true,
        features: [
            { text: "Account health monitoring", included: true },
            { text: "Advanced listing optimization (up to 50 SKUs)", included: true },
            { text: "Weekly performance reports", included: true },
            { text: "Priority support (24hr response)", included: true },
            { text: "Advanced PPC management", included: true },
            { text: "Full FBA operations management", included: true },
            { text: "A+ Content creation (5 products)", included: true },
            { text: "Dedicated account manager", included: true },
            { text: "Bi-weekly strategy calls", included: true },
            { text: "Competitor analysis", included: false },
            { text: "Strategic abc", included: false }
        ],
        cta: "Start Growing",
    },
    {
        id: "platinum",
        name: "Platinum",
        subtitle: "Enterprise Solution",
        prices: {
            quarterly: "$4,999",
            yearly: "$4,249"
        },
        period: "/month",
        description: "Tailored solutions for high-volume sellers and enterprise brands seeking full-service partnership.",
        highlighted: false,
        features: [
            { text: "Account health monitoring", included: true },
            { text: "Unlimited SKU optimization", included: true },
            { text: "Real-time dashboards & reports", included: true },
            { text: "24/7 priority support", included: true },
            { text: "Enterprise PPC management", included: true },
            { text: "Full FBA operations management", included: true },
            { text: "Unlimited A+ Content creation", included: true },
            { text: "Dedicated account team", included: true },
            { text: "Weekly strategy calls", included: true },
            { text: "Market expansion strategy", included: true },
            { text: "Strategic abc", included: true }
        ],
        cta: "Contact Sales",
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
