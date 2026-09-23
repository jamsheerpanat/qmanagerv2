import React from "react";

/**
 * Light, abstract "technology" cover shared by every proposal template. Each
 * service's cover page is a thin wrapper that supplies its title, accent
 * colours and highlights.
 *
 * The artwork is inline SVG rather than a photo: it stays sharp in the
 * generated PDF and is tinted per template from `theme`. `.pdf-page` forces a
 * white background with !important, so the page tint is drawn by the SVG too.
 */
export type CoverTheme = {
  /** Deep accent: highlighted title word, reference, icons. Must read on white. */
  accent: string;
  /** Bright accent for glows, rings and the gradient bars. */
  bright: string;
  /** Second hue for the abstract artwork. */
  secondary: string;
};

export type LightCoverPageProps = {
  projectName?: string;
  customerName?: string;
  customerCompany?: string;
  proposalDate?: string;
  proposalReference?: string;
  revisionNumber?: string | number;
  projectLocation?: string;
  /** Unique per template so SVG gradient ids don't collide. */
  id: string;
  theme: CoverTheme;
  badge: string;
  titleLead: string;
  titleHighlight: string;
  tagline: string;
  highlights?: string[];
  showCertifications?: boolean;
  defaultReference?: string;
};

const INK = "#0b1324";
const BODY = "#475569";
const MUTED = "#94a3b8";
const HAIRLINE = "#e2e8f0";

/** `#rrggbb` + alpha (0-1) → `#rrggbbaa`. */
const alpha = (hex: string, a: number) =>
  hex +
  Math.round(a * 255)
    .toString(16)
    .padStart(2, "0");

const label: React.CSSProperties = {
  color: MUTED,
  fontSize: "7.5px",
  fontWeight: 600,
  letterSpacing: "2.2px",
  textTransform: "uppercase",
  marginBottom: "5px",
};

/** Points on the ring system, used for the network nodes. */
const RING_CX = 640;
const RING_CY = 250;
const onRing = (r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return [RING_CX + r * Math.cos(rad), RING_CY + r * Math.sin(rad)] as const;
};

const Artwork = ({ id, theme }: { id: string; theme: CoverTheme }) => {
  const g = (name: string) => `${id}-${name}`;
  // Kept to the upper half of the page so no line crosses the title block.
  const nodes = [
    onRing(170, 205),
    onRing(210, 215),
    onRing(300, 200),
    onRing(380, 215),
    onRing(230, 180),
    onRing(170, 150),
    onRing(300, 225),
  ];
  const links: [number, number][] = [
    [0, 1],
    [0, 2],
    [2, 3],
    [0, 4],
    [4, 2],
    [4, 5],
    [1, 6],
  ];
  // Arc for the emblem-style accent segment on the inner ring.
  const [ax1, ay1] = onRing(120, 55);
  const [ax2, ay2] = onRing(120, 125);

  return (
    <svg
      viewBox="0 0 794 1123"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={g("base")} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f1f5fb" />
        </linearGradient>
        <radialGradient id={g("glowA")}>
          <stop offset="0" stopColor={theme.bright} stopOpacity="0.22" />
          <stop offset="1" stopColor={theme.bright} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={g("glowB")}>
          <stop offset="0" stopColor={theme.secondary} stopOpacity="0.16" />
          <stop offset="1" stopColor={theme.secondary} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={g("node")}>
          <stop offset="0" stopColor={theme.bright} stopOpacity="0.55" />
          <stop offset="1" stopColor={theme.bright} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={g("wave")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={theme.secondary} stopOpacity="0" />
          <stop offset="0.35" stopColor={theme.secondary} stopOpacity="0.55" />
          <stop offset="0.75" stopColor={theme.bright} stopOpacity="0.6" />
          <stop offset="1" stopColor={theme.bright} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={g("arc")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={theme.bright} />
          <stop offset="1" stopColor={theme.secondary} />
        </linearGradient>
        <pattern id={g("dots")} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#64748b" fillOpacity="0.28" />
        </pattern>
        <radialGradient id={g("dotFade")} cx="0.78" cy="0.2" r="0.55">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={g("dotMask")}>
          <rect width="794" height="1123" fill={`url(#${g("dotFade")})`} />
        </mask>
      </defs>

      {/* Base tint and colour washes */}
      <rect width="794" height="1123" fill={`url(#${g("base")})`} />
      <circle cx="700" cy="170" r="440" fill={`url(#${g("glowA")})`} />
      <circle cx="40" cy="1000" r="420" fill={`url(#${g("glowB")})`} />
      <circle cx="760" cy="900" r="260" fill={`url(#${g("glowA")})`} opacity="0.6" />

      {/* Dot grid, fading out from the top right */}
      <rect width="794" height="1123" fill={`url(#${g("dots")})`} mask={`url(#${g("dotMask")})`} />

      {/* Concentric rings, echoing the Octonics emblem */}
      <g fill="none">
        <circle cx={RING_CX} cy={RING_CY} r="120" stroke={theme.accent} strokeOpacity="0.22" strokeWidth="1" />
        <circle cx={RING_CX} cy={RING_CY} r="170" stroke={theme.accent} strokeOpacity="0.16" strokeWidth="1" strokeDasharray="2 6" />
        <circle cx={RING_CX} cy={RING_CY} r="230" stroke={theme.accent} strokeOpacity="0.14" strokeWidth="1" />
        <circle cx={RING_CX} cy={RING_CY} r="300" stroke={theme.accent} strokeOpacity="0.1" strokeWidth="1" strokeDasharray="1 5" />
        <circle cx={RING_CX} cy={RING_CY} r="380" stroke={theme.accent} strokeOpacity="0.07" strokeWidth="1" />
        <path
          d={`M ${ax1} ${ay1} A 120 120 0 0 1 ${ax2} ${ay2}`}
          stroke={`url(#${g("arc")})`}
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx={RING_CX} cy={RING_CY} r="64" stroke={theme.bright} strokeOpacity="0.25" strokeWidth="1" />
      </g>

      {/* Network: links, then nodes with a soft glow */}
      <g stroke={theme.accent} strokeOpacity="0.28" strokeWidth="0.8">
        {links.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />
        ))}
      </g>
      {nodes.map(([x, y], i) => (
        <g key={i}>
          {i % 2 === 0 && <circle cx={x} cy={y} r="14" fill={`url(#${g("node")})`} />}
          <circle cx={x} cy={y} r={i % 2 === 0 ? 3.2 : 2.4} fill="#ffffff" stroke={theme.accent} strokeWidth="1.2" />
        </g>
      ))}

      {/* Circuit traces, top edge */}
      <g fill="none" stroke={theme.accent} strokeOpacity="0.18" strokeWidth="1">
        <path d="M 794 520 H 720 L 690 490 H 610" />
        <path d="M 794 548 H 700 L 676 572 H 560" />
      </g>
      <g fill="#ffffff" stroke={theme.accent} strokeOpacity="0.4" strokeWidth="1">
        <circle cx="610" cy="490" r="2.5" />
        <circle cx="560" cy="572" r="2.5" />
      </g>

      {/* Flowing lines across the lower half */}
      <g fill="none" stroke={`url(#${g("wave")})`}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M -40 ${880 + i * 14} C 200 ${790 + i * 20}, 440 ${1010 - i * 10}, 840 ${820 + i * 16}`}
            strokeWidth={i === 2 ? 1.6 : 0.8}
            strokeOpacity={1 - i * 0.12}
          />
        ))}
      </g>
    </svg>
  );
};

const PinIcon = ({ color }: { color: string }) => (
  <svg width="9" height="11" viewBox="0 0 12 15" style={{ flexShrink: 0 }} aria-hidden="true">
    <path
      d="M6 0C2.7 0 0 2.6 0 5.9 0 10.3 6 15 6 15s6-4.7 6-9.1C12 2.6 9.3 0 6 0Zm0 8.2a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6Z"
      fill={color}
    />
  </svg>
);

export const LightCoverPage = ({
  projectName,
  customerName,
  customerCompany,
  proposalDate,
  proposalReference,
  revisionNumber,
  projectLocation,
  id,
  theme,
  badge,
  titleLead,
  titleHighlight,
  tagline,
  highlights,
  showCertifications,
  defaultReference = "OC-2025-0001",
}: LightCoverPageProps) => {
  const date =
    proposalDate ||
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  const preparedFor = customerCompany || customerName;

  return (
    <div
      className="pdf-page relative overflow-hidden"
      style={{
        height: "297mm",
        fontFamily: "'Montserrat', 'Inter', sans-serif",
        color: INK,
      }}
    >
      <Artwork id={id} theme={theme} />

      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: `linear-gradient(90deg, ${theme.accent}, ${theme.bright}, ${theme.secondary})`,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          height: "100%",
          padding: "16mm 18mm 13mm",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header: logo, certifications, reference */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <img
            src="/octonics-logo.png"
            alt="Octonics Innovations"
            style={{ height: "19px", width: "auto", objectFit: "contain" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {showCertifications && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  background: "#ffffff",
                  border: `1px solid ${HAIRLINE}`,
                  padding: "6px 10px",
                  borderRadius: "8px",
                }}
              >
                <img src="/knx-partner-logo.jpg" alt="KNX" style={{ height: "17px", width: "auto", objectFit: "contain" }} />
                <div style={{ width: "1px", height: "14px", background: HAIRLINE }} />
                <img src="/iso-certification.gif" alt="ISO" style={{ height: "17px", width: "auto", objectFit: "contain" }} />
              </div>
            )}
            <div
              style={{
                textAlign: "right",
                background: "rgba(255,255,255,0.75)",
                border: `1px solid ${HAIRLINE}`,
                borderRadius: "8px",
                padding: "6px 12px",
              }}
            >
              <div style={{ ...label, fontSize: "6.5px", marginBottom: "2px" }}>Reference</div>
              <div style={{ color: theme.accent, fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.3px" }}>
                {proposalReference || defaultReference}
                {revisionNumber && String(revisionNumber) !== "0" && (
                  <span style={{ color: MUTED, fontWeight: 600, marginLeft: "6px" }}>Rev. {revisionNumber}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Title block */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "16mm" }}>
          <div style={{ marginBottom: "16px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: alpha(theme.bright, 0.1),
                border: `1px solid ${alpha(theme.accent, 0.22)}`,
                color: theme.accent,
                fontSize: "8px",
                fontWeight: 700,
                letterSpacing: "2.8px",
                textTransform: "uppercase",
                padding: "6px 14px",
                borderRadius: "999px",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: theme.bright, boxShadow: `0 0 0 3px ${alpha(theme.bright, 0.2)}` }} />
              {badge}
            </span>
          </div>

          <h1 style={{ margin: 0, fontSize: "46px", fontWeight: 800, lineHeight: 1.02, letterSpacing: "-1.2px", color: INK }}>
            {titleLead}
            <br />
            <span style={{ color: theme.accent }}>{titleHighlight}</span>
          </h1>
          <div
            style={{
              marginTop: "10px",
              fontSize: "15px",
              fontWeight: 300,
              letterSpacing: "9px",
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            Proposal
          </div>

          <div
            style={{
              width: "64px",
              height: "3px",
              borderRadius: "2px",
              background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})`,
              margin: "20px 0 16px",
            }}
          />

          <p style={{ margin: 0, color: BODY, fontSize: "11.5px", lineHeight: 1.75, maxWidth: "330px", fontFamily: "'Inter', sans-serif" }}>
            {tagline}
          </p>

          {highlights && highlights.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "18px", maxWidth: "400px" }}>
              {highlights.map((h) => (
                <span
                  key={h}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(255,255,255,0.85)",
                    border: `1px solid ${HAIRLINE}`,
                    color: "#334155",
                    fontSize: "8.5px",
                    fontWeight: 600,
                    padding: "5px 10px",
                    borderRadius: "6px",
                  }}
                >
                  <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: theme.bright }} />
                  {h}
                </span>
              ))}
            </div>
          )}

          {projectName && (
            <div
              style={{
                marginTop: "22px",
                maxWidth: "400px",
                background: "rgba(255,255,255,0.88)",
                border: `1px solid ${HAIRLINE}`,
                borderLeft: `3px solid ${theme.accent}`,
                borderRadius: "10px",
                padding: "12px 16px",
                boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
              }}
            >
              <div style={{ ...label, marginBottom: "4px" }}>Project</div>
              <div style={{ color: INK, fontSize: "16px", fontWeight: 700, lineHeight: 1.3 }}>{projectName}</div>
              {projectLocation && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: BODY, fontSize: "10px", marginTop: "5px" }}>
                  <PinIcon color={theme.accent} />
                  {projectLocation}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details card */}
        <div
          style={{
            marginTop: "18mm",
            background: "rgba(255,255,255,0.9)",
            border: `1px solid ${HAIRLINE}`,
            borderRadius: "14px",
            padding: "16px 22px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            boxShadow: "0 14px 40px rgba(15,23,42,0.07)",
          }}
        >
          <div style={{ paddingRight: "16px" }}>
            <div style={label}>Prepared For</div>
            <div style={{ color: INK, fontWeight: 700, fontSize: "12px" }}>{customerName || "—"}</div>
            {customerCompany && <div style={{ color: BODY, fontSize: "10px", marginTop: "2px" }}>{customerCompany}</div>}
          </div>
          <div style={{ borderLeft: `1px solid ${HAIRLINE}`, padding: "0 16px" }}>
            <div style={label}>Prepared By</div>
            <div style={{ color: INK, fontWeight: 700, fontSize: "12px" }}>Octonics Innovations</div>
            <div style={{ color: BODY, fontSize: "10px", marginTop: "2px" }}>Kuwait</div>
          </div>
          <div style={{ borderLeft: `1px solid ${HAIRLINE}`, paddingLeft: "16px", textAlign: "right" }}>
            <div style={label}>Proposal Date</div>
            <div style={{ color: INK, fontWeight: 700, fontSize: "12px" }}>{date}</div>
          </div>
        </div>

        {preparedFor && (
          <div style={{ marginTop: "10px", color: MUTED, fontSize: "7.5px", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            Confidential · Prepared exclusively for {preparedFor}
          </div>
        )}
      </div>

      {/* Bottom accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: `linear-gradient(90deg, ${theme.secondary}, ${theme.bright}, ${theme.accent})`,
        }}
      />
    </div>
  );
};
