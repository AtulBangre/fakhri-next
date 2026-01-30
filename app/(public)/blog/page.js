import BlogContent from '@/components/blog/BlogContent';
import { seoData } from '@/data/company';

export const metadata = {
    title: seoData.blog.title,
    description: seoData.blog.description,
    keywords: seoData.blog.keywords,
};

export default function BlogPage() {
    return <BlogContent />;
}
