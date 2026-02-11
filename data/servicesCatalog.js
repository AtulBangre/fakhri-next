// Consolidated Services Catalog Collection
// Merges Add-on services and Within 2 Hours (Priority) services

export const servicesCatalog = [
    {
        id: "account-suspension",
        name: "Account Suspension Recovery",
        category: "Critical",
        pricing: {
            standard: { price: 1500, label: "Detailed" },
            priority: null
        }
    },
    {
        id: "listing-suppression",
        name: "Listing Suppression Fix",
        category: "Urgent",
        pricing: {
            standard: { price: 800, label: "Detailed" },
            priority: null
        }
    },
    {
        id: "policy-violation",
        name: "Policy Violation Resolution",
        category: "Critical",
        pricing: {
            standard: { price: 1200, label: "Detailed" },
            priority: null
        }
    },
    {
        id: "inventory-stranded",
        name: "Stranded Inventory Recovery",
        category: "Urgent",
        pricing: {
            standard: { price: 600, label: "Detailed" },
            priority: null
        }
    },
    {
        id: "hijacker-removal",
        name: "Hijacker Removal Service",
        category: "Critical",
        pricing: {
            standard: { price: 900, label: "Detailed" },
            priority: null
        }
    },
    {
        id: "negative-review",
        name: "Negative Review Management",
        category: "Support",
        pricing: {
            standard: { price: 500, label: "Detailed" },
            priority: null
        }
    },
    {
        id: "buy-box-loss",
        name: "Buy Box Loss Investigation",
        category: "Urgent",
        pricing: {
            standard: { price: 700, label: "Detailed" },
            priority: null
        }
    },
    {
        id: "appeal-writing",
        name: "Professional Appeal Writing",
        category: "Critical",
        pricing: {
            standard: { price: 1000, label: "Detailed" },
            priority: null
        }
    },
    {
        id: "performance-metrics",
        name: "Performance Metrics Recovery",
        category: "Urgent",
        pricing: {
            standard: { price: 800, label: "Detailed" },
            priority: null
        }
    },
    // Priority Services (Within 2 Hours)
    {
        id: "enhanced-brand-content",
        name: "Enhanced Brand Content (A+ Content)",
        category: "Marketing",
        pricing: {
            standard: null,
            priority: { price: 2500, label: "Within 2 Hours" }
        }
    },
    {
        id: "product-photography",
        name: "Professional Product Photography",
        category: "Creative",
        pricing: {
            standard: null,
            priority: { price: 3000, label: "Within 2 Hours" }
        }
    },
    {
        id: "ppc-management",
        name: "Advanced PPC Campaign Management",
        category: "Advertising",
        pricing: {
            standard: null,
            priority: { price: 5000, label: "Within 2 Hours" }
        }
    },
    {
        id: "seo-optimization",
        name: "Listing SEO Optimization",
        category: "Marketing",
        pricing: {
            standard: null,
            priority: { price: 1500, label: "Within 2 Hours" }
        }
    },
    {
        id: "competitor-analysis",
        name: "Comprehensive Competitor Analysis",
        category: "Analytics",
        pricing: {
            standard: null,
            priority: { price: 2000, label: "Within 2 Hours" }
        }
    },
    {
        id: "inventory-forecasting",
        name: "Inventory Forecasting & Planning",
        category: "Operations",
        pricing: {
            standard: null,
            priority: { price: 1800, label: "Within 2 Hours" }
        }
    },
    {
        id: "brand-registry",
        name: "Brand Registry Setup & Management",
        category: "Brand Protection",
        pricing: {
            standard: null,
            priority: { price: 1200, label: "Within 2 Hours" }
        }
    },
    {
        id: "review-generation",
        name: "Review Generation Campaign",
        category: "Marketing",
        pricing: {
            standard: null,
            priority: { price: 2200, label: "Within 2 Hours" }
        }
    },
];


export const priorityServicesPageInfo = {
    title: "Within 2 Hours Service Pricing",
    description: "Built for time-sensitive needs, this service ensures your work receives priority attention with quicker response and execution.",
    badge: "Priority Services"
};
