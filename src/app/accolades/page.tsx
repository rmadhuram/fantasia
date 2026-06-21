"use client";

import Image from "next/image";
import { useState } from "react";

const CERTS = [
  { file: "1993-abacus-software.jpg", year: "1993", name: "Abacus", college: "CEG, Guindy" },
  { file: "1993-compsem-software.jpg", year: "1993", name: "Compsem", college: "Annamalai University" },
  { file: "1993-interrupt-software.jpg", year: "1993", name: "Interrupt", college: "SVCE" },
  { file: "1994-krec-software.jpg", year: "1994", name: "*.Fest", college: "KREC, Suratkal" },
  { file: "1994-nexus-software.jpg", year: "1994", name: "Nexus", college: "GCT, Coimbatore" },
  { file: "1994-surge-project.jpg", year: "1994", name: "Surge", college: "Annamalai University" },
  { file: "1994-traitdunion-software.jpg", year: "1994", name: "Trait-d'Union", college: "PEC" },
];

const ACCOLADES = [...CERTS].sort((a, b) => a.year.localeCompare(b.year) || a.name.localeCompare(b.name));

function navButtonStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    [side]: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "2.5rem",
    lineHeight: 1,
    color: "#e8e8ec",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid #444",
    borderRadius: "50%",
    width: "3rem",
    height: "3rem",
    cursor: "pointer",
    zIndex: 51,
  };
}

export default function AccoladesPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  function showPrev() {
    setSelectedIndex((i) => (i === null ? null : (i - 1 + ACCOLADES.length) % ACCOLADES.length));
  }

  function showNext() {
    setSelectedIndex((i) => (i === null ? null : (i + 1) % ACCOLADES.length));
  }

  const selected = selectedIndex === null ? null : ACCOLADES[selectedIndex];

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
      <p style={{ opacity: 0.7, marginTop: 0, marginBottom: "1.25rem" }}>
        Awards won during college for Fantasia, originally built on an IBM PC with 640K of RAM.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {ACCOLADES.map((cert, index) => (
          <button
            key={cert.file}
            onClick={() => setSelectedIndex(index)}
            style={{
              padding: 0,
              border: "1px solid #333",
              borderRadius: "8px",
              overflow: "hidden",
              background: "#14141a",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div style={{ position: "relative", width: "100%", height: "160px" }}>
              <Image
                src={`/certs/${cert.file}`}
                alt={`${cert.name}, ${cert.college} (${cert.year})`}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div style={{ padding: "0.6rem 0.75rem" }}>
              <div style={{ fontWeight: 600 }}>{cert.name}</div>
              <div style={{ opacity: 0.6, fontSize: "0.85rem" }}>
                {cert.college} · {cert.year}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          onClick={() => setSelectedIndex(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            cursor: "zoom-out",
            padding: "2rem",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            style={navButtonStyle("left")}
            aria-label="Previous certificate"
          >
            ‹
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", width: "80vw", height: "85vh", cursor: "default" }}
          >
            <Image
              src={`/certs/${selected.file}`}
              alt={`${selected.name}, ${selected.college} (${selected.year})`}
              fill
              style={{ objectFit: "contain", borderRadius: "6px" }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-2rem",
                left: 0,
                right: 0,
                textAlign: "center",
                color: "#e8e8ec",
              }}
            >
              {selected.name}, {selected.college} ({selected.year})
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            style={navButtonStyle("right")}
            aria-label="Next certificate"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
