"use client";
import { useState } from "react";
import { , useLocation } from "next/link";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/Logo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Pricing", href: "/pricing" },
    { name: "Within 2 Hours", href: "/within-2-hours" },
    { name: "Blog", href: "/blog" },
    { name: "Career", href: "/career" },
    { name: "Contact Us", href: "/contact" },
];
const PublicHeader = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const isActive = (href) => pathname === href;
    return (<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo showTagline/>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navigation.map((item) => (<Link key={item.name} href={item.href} className={`px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent ${isActive(item.href)
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"}`}>
              {item.name}
            </Link>))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Client Login <ChevronDown className="ml-1 h-4 w-4"/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/client/dashboard">Client Portal</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" asChild>
            <Link href="/contact">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (<div className="lg:hidden animate-slide-down border-t bg-background">
          <nav className="container py-4 space-y-1">
            {navigation.map((item) => (<Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"}`}>
                {item.name}
              </Link>))}
            <div className="pt-4 space-y-2 border-t mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/client/dashboard">Client Login</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/contact">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>)}
    </header>);
};
export default PublicHeader;
