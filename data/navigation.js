// Navigation data
export const navigationItems = [
    { label: "Home", href: "/" },
    {
        label: "Company",
        href: "#",
        children: [
            { label: "About Us", href: "/about" },
            { label: "Career", href: "/career" },
            { label: "Testimonials", href: "/#testimonials" }
        ]
    },
    { label: "Services", href: "/services" },
    { label: "Within 2 Hours", href: "/within-2-hours" },
    { label: "Pricing", href: "/pricing" },
    {
        label: "Resources",
        href: "#",
        children: [
            { label: "Blog", href: "/blog" },
            { label: "FAQs", href: "/pricing#faq" }
        ]
    },
    { label: "Contact", href: "/contact" },
];

export const footerLinks = {
    services: [
        { label: "Account Management", href: "/services#account-management" },
        { label: "Product Listing", href: "/services#product-listing" },
        { label: "FBA Operations", href: "/services#fba-operations" },
        { label: "Ads Management", href: "/services#ads-management" },
        { label: "A+ Content", href: "/services#a-plus-content" },
    ],
    company: [
        { label: "About Us", href: "/about" },
        { label: "Career", href: "/career" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" },
    ],
    support: [
        { label: "Within 2 Hours", href: "/within-2-hours" },
        { label: "Pricing", href: "/pricing" },
        { label: "FAQs", href: "/pricing#faq" },
    ],
};
