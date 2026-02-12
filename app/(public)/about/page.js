import { getCompanyData, getTeamMembers } from '@/lib/actions/content';
import AboutContent from '@/components/about/AboutContent';

export const metadata = {
    title: "About Us | Fakhri IT Services - Your Amazon Growth Partner",
    description: "Learn about Fakhri IT Services, a leading Amazon agency helping brands scale since 2016. Meet our expert team of account managers, creative designers, and strategists.",
    keywords: "About Fakhri IT Services, Amazon agency team, Amazon seller consultants, e-commerce experts",
};

export default async function AboutPage() {
    const [company, team] = await Promise.all([
        getCompanyData(),
        getTeamMembers()
    ]);

    return <AboutContent company={company} team={team} />;
}
