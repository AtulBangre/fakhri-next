
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { CartProvider } from "@/context/CartContext";
import { getNavigation, getCompanyInfo } from "@/lib/content";

export default async function PublicLayout({ children }) {
    const [navData, companyData] = await Promise.all([
        getNavigation(),
        getCompanyInfo()
    ]);

    return (
        <CartProvider>
            <ScrollToTop />
            <Header
                initialNavigation={navData?.main}
                companyInfo={companyData?.info}
            />
            <main className="min-h-screen pt-20">
                {children}
            </main>
            <Footer
                initialFooterLinks={navData?.footer}
                companyInfo={companyData?.info}
                contactInfo={companyData?.contact}
            />
        </CartProvider>
    );
}
