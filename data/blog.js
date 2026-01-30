// Blog Collection
export const blogPosts = [
    {

        id: 1,
        title: "How to Reduce ACOS by 40% with Smart PPC Strategies",
        excerpt: "Learn the proven techniques our team uses to dramatically improve advertising efficiency for Amazon sellers.",
        category: "PPC",
        author: "John Smith",
        date: "Jan 15, 2026",
        publishDate: "2026-01-15",
        readTime: "8 min read",
        slug: "reduce-acos-smart-ppc",
        thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {

        id: 2,
        title: "Complete Guide to Amazon Brand Registry 2026",
        excerpt: "Everything you need to know about registering your brand on Amazon and unlocking premium features.",
        category: "Brand Building",
        author: "Sarah Johnson",
        date: "Jan 12, 2026",
        publishDate: "2026-01-12",
        readTime: "12 min read",
        slug: "brand-registry-guide-2026",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {

        id: 3,
        title: "A+ Content Best Practices: What Actually Converts",
        excerpt: "Data-driven insights on creating enhanced brand content that drives higher conversion rates.",
        category: "Content",
        author: "Michael Chen",
        date: "Jan 10, 2026",
        publishDate: "2026-01-10",
        readTime: "6 min read",
        slug: "a-plus-content-best-practices",
        thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {

        id: 4,
        title: "Navigating Amazon Suspensions: A Step-by-Step Guide",
        excerpt: "What to do when your account gets suspended and how to write an effective Plan of Action.",
        category: "Account Health",
        author: "Emily Rodriguez",
        date: "Jan 8, 2026",
        publishDate: "2026-01-08",
        readTime: "10 min read",
        slug: "amazon-suspension-guide",
        thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {

        id: 5,
        title: "Product Photography Tips for Higher Click-Through Rates",
        excerpt: "Improve your product images with these professional photography tips and Amazon guidelines.",
        category: "Photography",
        author: "David Lee",
        date: "Jan 5, 2026",
        publishDate: "2026-01-05",
        readTime: "7 min read",
        slug: "product-photography-tips",
        thumbnail: "https://images.unsplash.com/photo-1542038784424-fa00ed4998e9?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {

        id: 6,
        title: "Inventory Management: Avoiding Stockouts and Long-Term Storage Fees",
        excerpt: "Smart strategies to optimize your FBA inventory and minimize unnecessary costs.",
        category: "Operations",
        author: "John Smith",
        date: "Jan 2, 2026",
        publishDate: "2026-01-02",
        readTime: "9 min read",
        slug: "inventory-management-guide",
        thumbnail: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800&h=600"
    },
];
export const blogCategories = [
    { name: "All", slug: "all" },
    { name: "PPC", slug: "ppc" },
    { name: "Brand Building", slug: "brand-building" },
    { name: "Content", slug: "content" },
    { name: "Account Health", slug: "account-health" },
    { name: "Photography", slug: "photography" },
    { name: "Operations", slug: "operations" },
];
export const getCategoryNames = () => {
    return blogCategories.map(cat => cat.name);
};
