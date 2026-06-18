"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const links = [
  { label: "Home",       href: "/" },
  { label: "Products",   href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Dashboard",  href: "/dashboard" },
];

export default function NavLinks({ mobile = false, onNavigate }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <ul role="list" className="flex flex-col gap-1">
        {links.map(({ label, href }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-foreground hover:bg-default-100"
                  }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul role="list" className="flex items-center gap-1">
      {links.map(({ label, href }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              className={`relative px-3 py-1.5 text-sm transition-colors rounded-md
                ${
                  isActive
                    ? "font-semibold text-foreground"
                    : "font-normal text-foreground/60 hover:text-foreground hover:bg-default-100"
                }`}
            >
              {label}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-foreground" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}