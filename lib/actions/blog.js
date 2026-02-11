'use server';

import connectDB from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';

export async function getBlogPosts({ page = 1, limit = 10, search = '', category = '' } = {}) {
    await connectDB();

    const skip = (page - 1) * limit;
    const query = {};

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { excerpt: { $regex: search, $options: 'i' } }
        ];
    }

    if (category) {
        query.category = category;
    }

    try {
        const posts = await BlogPost.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await BlogPost.countDocuments(query);

        return {
            posts: JSON.parse(JSON.stringify(posts)),
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        };
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return { posts: [], total: 0, pages: 0, currentPage: page, error: 'Failed to fetch posts' };
    }
}

export async function getBlogPostBySlug(slug) {
    await connectDB();
    try {
        const post = await BlogPost.findOne({ slug }).lean();
        return post ? JSON.parse(JSON.stringify(post)) : null;
    } catch (error) {
        console.error('Error fetching blog post:', error);
        return null;
    }
}
