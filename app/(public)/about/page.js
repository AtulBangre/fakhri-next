import AboutContent from '@/components/about/AboutContent';
import { getPageContent, getTeamMembers } from '@/lib/content';

export async function generateMetadata() {
    const content = await getPageContent('about');
    return {
        title: content?.seo?.title || 'About Us',
        description: content?.seo?.description || '',
        keywords: content?.seo?.keywords || '',
    };
}

export default async function AboutPage() {
    const [teamMembers, content] = await Promise.all([
        getTeamMembers(),
        getPageContent('about')
    ]);

    return <AboutContent initialTeam={teamMembers} initialContent={content} />;
}
