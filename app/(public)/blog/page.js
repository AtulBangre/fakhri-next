import BlogContent from '@/components/blog/BlogContent';
import { getPageContent, getBlogPosts } from '@/lib/content';

export async function generateMetadata() {
    const content = await getPageContent('blog');
    return {
        title: content?.seo?.title || 'Our Blog',
        description: content?.seo?.description || '',
        keywords: content?.seo?.keywords || '',
    };
}

export default async function BlogPage() {
    const [content, posts] = await Promise.all([
        getPageContent('blog'),
        getBlogPosts()
    ]);

    // Transform posts if needed (e.g. ensure _id is string)
    const transformedPosts = posts.map(p => ({
        ...p,
        _id: p._id.toString(),
        publishDate: p.publishDate ? new Date(p.publishDate).toISOString() : new Date().toISOString()
    }));

    return <BlogContent initialPosts={transformedPosts} initialContent={content} />;
}
