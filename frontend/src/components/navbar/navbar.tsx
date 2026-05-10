"use client";

import { siteConfig } from "@/config/site";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  name: string;
  link: string;
}

interface NavbarProps {
  navItems?: NavItem[];
  showModeToggle?: boolean;
  isLandingPage?: boolean;
  isExternalPage?: boolean;
}

const landingPageNavItems = [
  { name: "Features", link: "/#features" },
  { name: "How It Works", link: "/#how-it-works" },
];

const externalPageNavItems = [
  { name: "Features", link: "/#features" },
  { name: "How It Works", link: "/#how-it-works" },
];

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

export default function NavbarComponent({
  navItems,
  showModeToggle = true,
  isLandingPage = false,
  isExternalPage = false,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { setTheme, theme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("student_token");
    const id = localStorage.getItem("student_id");
    setIsLoggedIn(!!token && !!id);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    localStorage.removeItem("student_id");
    localStorage.removeItem("student_token");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  const router = useRouter();

  const items = isLandingPage ? landingPageNavItems : isExternalPage ? externalPageNavItems : navItems || [];

  const handleNavClick = (item: NavItem) => {
    if ((isLandingPage || isExternalPage) && item.link.startsWith("/#")) {
      router.push(item.link);
    } else if (isLandingPage && item.link.startsWith("#")) {
      const sectionId = item.link.replace("#", "");
      scrollToSection(sectionId);
    } else {
      router.push(item.link);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-50 w-full px-4 py-4 transition-transform duration-300",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="relative mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-lg bg-background/80 backdrop-blur-md px-6 py-3 lg:flex dark:bg-background/80 border border-border/20">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/favicon.svg" alt="Logo" width={24} height={24} className="text-primary" />
          <span className="font-bold text-foreground">{siteConfig.name}</span>
        </Link>

        <div className="hidden flex-row items-center justify-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground lg:flex">
          {items.map((item, idx) => (
            <button
              key={`link-${idx}`}
              onClick={() => handleNavClick(item)}
              className="px-4 py-2 text-foreground hover:text-primary transition-colors"
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
          ) : isLoggedIn ? (
            <Link href="/user/dashboard" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors">
                Get Started
              </Link>
            </>
          )}
          {showModeToggle && (
            <DropdownMenu open={isThemeDropdownOpen} onOpenChange={setIsThemeDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="cursor-pointer border-border">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem onClick={() => { setTheme("light"); setIsThemeDropdownOpen(false); }}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setTheme("dark"); setIsThemeDropdownOpen(false); }}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setTheme("system"); setIsThemeDropdownOpen(false); }}>System</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "relative top-0 z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-background/80 backdrop-blur-md px-4 py-3 lg:hidden border border-border/20 transition-transform duration-300",
          isVisible ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="flex w-full flex-row items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/favicon.svg" alt="Logo" width={24} height={24} className="text-primary" />
            <span className="font-bold text-foreground">{siteConfig.name}</span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-foreground p-2">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 bg-background/95 backdrop-blur-xl px-4 py-8 border border-border shadow-2xl">
            {items.map((item, idx) => (
              <button
                key={`mobile-link-${idx}`}
                onClick={() => handleNavClick(item)}
                className="text-foreground hover:text-primary transition-colors"
              >
                {item.name}
              </button>
            ))}
            <div className="flex w-full flex-col gap-4 mt-4">
              {isLoading ? (
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : isLoggedIn ? (
                <Link
                  href="/user/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold"
                  >
                    Get Started
                  </Link>
                </>
              )}
              {showModeToggle && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full border-border">
                      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="bg-popover border-border">
                    <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}