"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie, Refrigerator, ChefHat, Menu, X } from "lucide-react";
import HowToCookModal from "./HowToCookModal";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/dashboard", label: "Discover", icon: ChefHat },
  { href: "/recipes", label: "My Recipes", icon: Cookie },
  { href: "/pantry", label: "My Pantry", icon: Refrigerator },
];

const Header = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-100"
            : "bg-[var(--cream-50)]/80 backdrop-blur-sm border-b border-transparent"
        )}
      >
        <nav className="section-container h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="Served – go to homepage"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--brand-green-700)] flex items-center justify-center shadow-sm group-hover:bg-[var(--brand-green-600)] transition-colors">
              <ChefHat className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-[var(--brand-green-900)] tracking-tight">
              Served
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname?.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                    active
                      ? "bg-[var(--brand-green-50)] text-[var(--brand-green-700)] shadow-sm"
                      : "text-stone-500 hover:text-[var(--brand-green-700)] hover:bg-[var(--brand-green-50)]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <SignedIn>
              <HowToCookModal />
              <div className="ml-1">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 ring-2 ring-[var(--brand-green-200)] ring-offset-1",
                    },
                  }}
                />
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="hidden sm:block text-sm font-semibold text-stone-600 hover:text-[var(--brand-green-700)] px-3 py-2 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-[var(--brand-green-700)] hover:bg-[var(--brand-green-600)] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden ml-1 p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-stone-100 shadow-lg animate-fade-in-up">
            <div className="section-container py-4 space-y-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname?.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                      active
                        ? "bg-[var(--brand-green-50)] text-[var(--brand-green-700)]"
                        : "text-stone-600 hover:bg-stone-50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
              <SignedOut>
                <div className="pt-2 border-t border-stone-100 flex gap-2">
                  <SignInButton mode="modal">
                    <button className="flex-1 text-center text-sm font-semibold text-stone-600 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="flex-1 text-center bg-[var(--brand-green-700)] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[var(--brand-green-600)] transition-colors">
                      Get Started
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;