"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Youtube } from "lucide-react";
import Logo from "@/components/ui/Logo";
const footerLinks = {
    services: [
        { name: "Account Management", href: "/services#account-management" },
        { name: "Brand Registry", href: "/services#brand-registry" },
        { name: "A+ Content", href: "/services#a-plus-content" },
        { name: "PPC Management", href: "/services#ppc" },
        { name: "Catalog Management", href: "/services#catalog" },
    ],
    company: [
        { name: "About Us", href: "/about" },
        { name: "Career", href: "/career" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
    ],
    support: [
        { name: "Client Portal", href: "/client/dashboard" },
        { name: "Within 2 Hours", href: "/within-2-hours" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
    ],
};
const PublicFooter = () => {
    return (<footer className="bg-brand-dark text-white">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Logo variant="white" size="lg"/>
            <p className="mt-4 text-sm text-gray-400 max-w-sm">
              No.1 Growth Partner for Amazon Sellers. Helping businesses scale their Amazon presence since 2016.
            </p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4"/>
                <span>hello@fakhriitservices.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4"/>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4"/>
                <span>Global Remote Team</span>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5"/>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5"/>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5"/>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5"/>
              </a>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (<li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (<li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (<li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Fakhri IT Services. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">Amazon SPN Partner</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">Amazon Affiliate Partner</span>
            </div>
          </div>
        </div>
      </div>
    </footer>);
};
export default PublicFooter;
