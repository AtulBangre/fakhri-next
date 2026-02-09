'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ShoppingCart, Trash2 } from 'lucide-react';
import { navigationItems } from '@/data/navigation';
import { useCart } from '@/context/CartContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDesktopDropdown, setActiveDesktopDropdown] = useState(null);
    const [mobileExpanded, setMobileExpanded] = useState({});
    const pathname = usePathname();
    const { cartItems, removeFromCart, updateQuantity, totalItems, totalAmount } = useCart();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setActiveDesktopDropdown(null);
        setMobileExpanded({});
    }, [pathname]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.overflowX = 'hidden'; // Ensure horizontal scroll is always hidden
        };
    }, [isMobileMenuOpen]);

    const toggleMobileDropdown = (label) => {
        setMobileExpanded(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-background/95 backdrop-blur-lg shadow-md'
                    : 'bg-background/80 backdrop-blur-sm'
                    }`}
            >
                <div className="container-custom">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group z-50">
                            <motion.img
                                src={'/Logo.png'}
                                alt="Fakhri IT Services"
                                className="h-7 md:h-8 w-auto object-contain"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navigationItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="relative"
                                    onMouseEnter={() => item.children && setActiveDesktopDropdown(item.label)}
                                    onMouseLeave={() => item.children && setActiveDesktopDropdown(null)}
                                >
                                    {item.children ? (
                                        <button
                                            className={`flex items-center gap-1 px-4 py-2 font-medium text-sm transition-colors duration-200 ${item.children.some(child => child.href === pathname)
                                                ? 'text-primary'
                                                : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {item.label}
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDesktopDropdown === item.label ? 'rotate-180' : ''}`} />
                                        </button>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className={`relative px-4 py-2 font-medium text-sm transition-colors duration-200 ${pathname === item.href
                                                ? 'text-primary'
                                                : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {item.label}
                                            {pathname === item.href && (
                                                <motion.div
                                                    layoutId="activeNav"
                                                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary"
                                                    transition={{ duration: 0.3 }}
                                                />
                                            )}
                                        </Link>
                                    )}

                                    {/* Desktop Dropdown Menu */}
                                    <AnimatePresence>
                                        {item.children && activeDesktopDropdown === item.label && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-full left-0 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden py-1"
                                            >
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={`block px-4 py-2.5 text-sm transition-colors hover:bg-muted/50 ${pathname === child.href
                                                            ? 'text-primary font-medium bg-primary/5'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                            }`}
                                                    >
                                                        {child.label}
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </nav>

                        {/* CTA Button & Cart */}
                        <div className="hidden lg:flex items-center gap-4">
                            {/* Cart Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative flex items-center gap-2 px-3">
                                        <div className="relative">
                                            <ShoppingCart className="h-5 w-5" />
                                            {totalItems > 0 && (
                                                <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center border-2 border-background">
                                                    {totalItems}
                                                </span>
                                            )}
                                        </div>
                                        {totalAmount > 0 && (
                                            <span className="text-sm font-medium hidden xl:inline-block">
                                                ₹{totalAmount.toLocaleString()}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80 p-0">
                                    <div className="p-4 border-b border-border">
                                        <h4 className="font-semibold">Shopping Cart</h4>
                                        <p className="text-sm text-muted-foreground">{totalItems} items</p>
                                    </div>

                                    <div className="max-h-[300px] overflow-y-auto p-4 space-y-4">
                                        {cartItems.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                                <p>Your cart is empty</p>
                                            </div>
                                        ) : (
                                            cartItems.map((item) => (
                                                <div key={item.id} className="flex gap-3">
                                                    <div className="flex-1 space-y-1">
                                                        <h5 className="text-sm font-medium leading-none">{item.name}</h5>
                                                        <p className="text-xs text-muted-foreground">{item.category}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <div className="flex items-center border border-input rounded-md h-7">
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    className="px-2 hover:bg-accent h-full flex items-center"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="px-2 text-xs font-medium border-x border-input h-full flex items-center bg-accent/50">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    className="px-2 hover:bg-accent h-full flex items-center"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                            <button
                                                                onClick={() => removeFromCart(item.id)}
                                                                className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold">₹{item.price * item.quantity}</p>
                                                        <p className="text-xs text-muted-foreground">₹{item.price} ea</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {cartItems.length > 0 && (
                                        <div className="p-4 border-t border-border bg-muted/20">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="font-medium">Total</span>
                                                <span className="text-lg font-bold text-primary">₹{totalAmount}</span>
                                            </div>
                                            <Button
                                                className="w-full"
                                                onClick={() => {
                                                    // Check if user is logged in (simulated for now)
                                                    const isLoggedIn = false; // TODO: Replace with actual auth check
                                                    if (!isLoggedIn) {
                                                        window.location.href = '/auth/login?redirect=/checkout';
                                                    } else {
                                                        window.location.href = '/checkout';
                                                    }
                                                }}
                                            >
                                                Checkout
                                            </Button>
                                        </div>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Link
                                href="/sign-in"
                                className="btn-primary text-sm py-3 px-6"
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-foreground z-50 relative"
                            aria-label="Toggle menu"
                        >
                            <motion.div
                                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </motion.div>
                        </button>
                    </div>
                </div>
            </header >

            {/* Mobile Menu */}
            < AnimatePresence >
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Menu Content */}
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm z-50 lg:hidden bg-background border-l border-border overflow-y-auto"
                        >
                            <nav className="px-6 py-24 space-y-2">
                                {navigationItems.map((item, index) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        {item.children ? (
                                            <div className="rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => toggleMobileDropdown(item.label)}
                                                    className={`flex items-center justify-between w-full px-4 py-3 font-medium transition-colors ${item.children.some(child => child.href === pathname)
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                        }`}
                                                >
                                                    {item.label}
                                                    <ChevronDown
                                                        className={`w-4 h-4 transition-transform duration-200 ${mobileExpanded[item.label] ? 'rotate-180' : ''}`}
                                                    />
                                                </button>
                                                <AnimatePresence>
                                                    {mobileExpanded[item.label] && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="bg-muted/30"
                                                        >
                                                            {item.children.map((child) => (
                                                                <Link
                                                                    key={child.href}
                                                                    href={child.href}
                                                                    className={`block pl-8 pr-4 py-2.5 text-sm transition-colors ${pathname === child.href
                                                                        ? 'text-primary font-medium'
                                                                        : 'text-muted-foreground hover:text-foreground'
                                                                        }`}
                                                                >
                                                                    {child.label}
                                                                </Link>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${pathname === item.href
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    }`}
                                            >
                                                {item.label}
                                            </Link>
                                        )}
                                    </motion.div>
                                ))}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: navigationItems.length * 0.05 }}
                                    className="pt-4"
                                >
                                    <Link
                                        href="/contact"
                                        className="btn-primary w-full text-center"
                                    >
                                        Get Started
                                    </Link>
                                </motion.div>
                            </nav>
                        </motion.div>
                    </>
                )
                }
            </AnimatePresence >
        </>
    );
}
