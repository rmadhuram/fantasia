"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/wireframes", label: "Wireframes" },
  { href: "/meshes", label: "Meshes" },
  { href: "/solid-of-revolution", label: "Solid of Revolution" },
];

export default function SectionNav() {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", gap: "1.25rem", borderBottom: "1px solid #333", paddingBottom: "0.75rem" }}>
      {SECTIONS.map((section) => {
        const active = pathname === section.href;
        return (
          <Link
            key={section.href}
            href={section.href}
            style={{
              color: active ? "#e8e8ec" : "#888",
              fontWeight: active ? 600 : 400,
              textDecoration: "none",
            }}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
