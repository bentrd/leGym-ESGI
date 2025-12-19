"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthButtons } from "@/components/layout/auth-buttons";
import { NavCarousel, type NavItem } from "@/components/layout/nav-carousel";

type MobileMenuProps = {
  navItems: NavItem[];
  isAuthenticated: boolean;
};

export function MobileMenu({ navItems, isAuthenticated }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <Button
        size="icon"
        color="grey"
        onClick={() => setIsOpen((v) => !v)}
        className="aspect-square h-9! w-9! p-0 md:hidden"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <>
              <div
                className="fixed top-20 right-0 bottom-0 left-0 z-40 bg-white/20 backdrop-blur-xs md:hidden"
                onClick={() => setIsOpen(false)}
                aria-hidden={true}
              />

              <div className="border-border bg-muted fixed top-20 right-0 left-0 z-40 overflow-hidden rounded-b-md border shadow-lg md:hidden">
                <nav className="container px-4 py-3">
                  <NavCarousel
                    items={navItems}
                    variant="mobile"
                    onNavigate={() => setIsOpen(false)}
                  />

                  {!isAuthenticated && (
                    <div className="mt-3 pt-3">
                      <AuthButtons
                        variant="vertical"
                        onLoginClick={() => setIsOpen(false)}
                        onSignupClick={() => setIsOpen(false)}
                      />
                    </div>
                  )}
                </nav>
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
