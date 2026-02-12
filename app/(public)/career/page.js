import { getJobs } from '@/lib/actions/content';
import CareerContent from '@/components/career/CareerContent';

export const metadata = {
    title: "Careers | Fakhri IT Services - Join Our Amazon Agency Team",
    description: "Build your career with Fakhri IT Services. Explore current job openings for account managers, PPC specialists, content creators, and more.",
    keywords: "Amazon agency jobs, e-commerce careers, work at Fakhri IT Services",
};

export default async function CareerPage() {
    const jobs = await getJobs();
    return <CareerContent jobs={jobs} />;
}
