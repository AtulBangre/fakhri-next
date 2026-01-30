
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";

export default function PublicLayout({ children }) {
    return (
        <>
            <ScrollToTop />
            <Header />
            <main className="min-h-screen pt-20">
                {children}
            </main>
            <Footer />
        </>
    );
}
