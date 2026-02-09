
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { CartProvider } from "@/context/CartContext";

export default function PublicLayout({ children }) {
    return (
        <CartProvider>
            <ScrollToTop />
            <Header />
            <main className="min-h-screen pt-20">
                {children}
            </main>
            <Footer />
        </CartProvider>
    );
}
