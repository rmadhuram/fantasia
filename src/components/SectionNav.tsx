"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/wireframes", label: "Wireframes" },
  { href: "/meshes", label: "Meshes" },
  { href: "/solid-of-revolution", label: "Solid of Revolution" },
  { href: "/accolades", label: "Accolades" },
];

export default function SectionNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        padding: "0.75rem 2rem",
        borderBottom: "1px solid #333",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#e8e8ec", whiteSpace: "nowrap" }}>
        Fantasia! v4.0 - Isometric 3D Engine
      </span>
      <div style={{ display: "flex", gap: "1.25rem" }}>
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
      </div>
    </nav>
  );
}
