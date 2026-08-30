"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { navPrimary, siteProfile } from "@/content";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper-elevated/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[72rem] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="font-serif text-lg font-medium tracking-tight text-ink">
          {siteProfile.shortName}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {navPrimary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm ${
                isActive(pathname, item.href)
                  ? "font-semibold text-ink underline decoration-accent decoration-2 underline-offset-8"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/resume" className="text-sm font-medium text-ink-soft hover:text-ink">
            Resume
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-10 items-center rounded-full bg-accent px-4 text-sm font-medium text-paper-elevated"
          >
            Contact
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line text-sm font-medium lg:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <div
          id={menuId}
          className="border-t border-line bg-paper-elevated px-5 py-5 lg:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col gap-4">
            {navPrimary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="min-h-11 text-base text-ink"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/resume" className="min-h-11 text-base text-ink" onClick={() => setOpen(false)}>
              Resume
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent text-paper-elevated"
              onClick={() => setOpen(false)}
            >
              Contact
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
