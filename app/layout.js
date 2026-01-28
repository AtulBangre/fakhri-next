import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";

export const metadata = {
  title: "Fakhri IT Services | No.1 Amazon Seller Services Partner",
  description: "Your trusted Amazon seller services partner since 2016. Expert account management, FBA operations, PPC advertising, and growth strategies for Amazon sellers.",
  keywords: "Amazon seller services, Amazon account management, FBA services, Amazon PPC, Amazon consulting",
  authors: [{ name: "Fakhri IT Services" }],
  openGraph: {
    title: "Fakhri IT Services | No.1 Amazon Seller Services Partner",
    description: "Your trusted Amazon seller services partner since 2016.",
    type: "website",
    locale: "en_US",
    siteName: "Fakhri IT Services",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <SmoothScrollProvider>
          <ScrollToTop />
          <Header />
          <main className="min-h-screen pt-20">
            {children}
          </main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
