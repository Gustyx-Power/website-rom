import { useState, useRef } from "react";

export default function PocoHologram() {
  const [rotate, setRotate] = useState({ x: 5, y: -8 });
  const wrapRef = useRef(null);

  function handleMouseMove(e) {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 14;
    setRotate({ x: rotX, y: rotY });
  }

  function handleMouseLeave() {
    setRotate({ x: 4, y: -6 });
  }

  return (
    <div
      className="holo-phone-wrap"
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="CAD Wireframe POCO F5"
    >
      <div
        className="holo-phone-stage"
        style={{
          transform: `perspective(900px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        <svg
          className="holo-phone-svg"
          viewBox="50 30 240 440"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Glowing Scan Beam */}
            <linearGradient id="cadScanBeam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0, 240, 255, 0)" />
              <stop offset="50%" stopColor="rgba(0, 240, 255, 0.45)" />
              <stop offset="100%" stopColor="rgba(255, 230, 0, 0.75)" />
            </linearGradient>

            {/* Subtle glow filter */}
            <filter id="cadGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ================= PHONE CHASSIS ================= */}
          {/* Hard Shadow Silhouette */}
          <rect
            x="68"
            y="48"
            width="206"
            height="404"
            rx="26"
            ry="26"
            fill="none"
            stroke="rgba(0, 0, 0, 0.95)"
            strokeWidth="10"
          />

          {/* Outer Phone Border (POCO F5 Silhouette) */}
          <rect
            x="65"
            y="45"
            width="210"
            height="410"
            rx="26"
            ry="26"
            fill="rgba(10, 12, 16, 0.92)"
            stroke="var(--accent-cyan)"
            strokeWidth="2.5"
            filter="url(#cadGlow)"
          />

          {/* Inner Technical CAD Chamfer Frame */}
          <rect
            x="71"
            y="51"
            width="198"
            height="398"
            rx="21"
            ry="21"
            fill="none"
            stroke="rgba(0, 240, 255, 0.35)"
            strokeWidth="1"
            strokeDasharray="4 3"
          />

          {/* Side Buttons (Right Edge: Volume rocker & Power / Fingerprint) */}
          <line
            x1="275"
            y1="130"
            x2="275"
            y2="175"
            stroke="var(--accent-yellow)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <line
            x1="275"
            y1="190"
            x2="275"
            y2="225"
            stroke="var(--accent-cyan)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Antenna Bands on side frame */}
          <line x1="65" y1="95" x2="69" y2="95" stroke="var(--accent-yellow)" strokeWidth="2" />
          <line x1="271" y1="95" x2="275" y2="95" stroke="var(--accent-yellow)" strokeWidth="2" />
          <line x1="65" y1="405" x2="69" y2="405" stroke="var(--accent-yellow)" strokeWidth="2" />
          <line x1="271" y1="405" x2="275" y2="405" stroke="var(--accent-yellow)" strokeWidth="2" />

          {/* ================= REAR CAMERA SYSTEM (POCO F5) ================= */}
          {/* Main Camera 1 (Top Left) */}
          <g className="cad-cam">
            <circle
              cx="105"
              cy="105"
              r="26"
              fill="rgba(0, 0, 0, 0.8)"
              stroke="var(--accent-cyan)"
              strokeWidth="2.5"
            />
            <circle
              cx="105"
              cy="105"
              r="20"
              fill="none"
              stroke="var(--accent-yellow)"
              strokeWidth="1.2"
            />
            <circle cx="105" cy="105" r="13" fill="#03080d" stroke="var(--accent-cyan)" strokeWidth="1" />
            <circle cx="105" cy="105" r="6" fill="var(--accent-cyan)" />
            {/* Optical reflection arc */}
            <path
              d="M 96 98 A 12 12 0 0 1 114 98"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="1.5"
              fill="none"
            />
          </g>

          {/* Secondary Camera 2 (Bottom Left) */}
          <g className="cad-cam">
            <circle
              cx="105"
              cy="165"
              r="26"
              fill="rgba(0, 0, 0, 0.8)"
              stroke="var(--accent-cyan)"
              strokeWidth="2.5"
            />
            <circle
              cx="105"
              cy="165"
              r="20"
              fill="none"
              stroke="rgba(0, 240, 255, 0.55)"
              strokeWidth="1.2"
            />
            <circle cx="105" cy="165" r="13" fill="#03080d" stroke="var(--accent-cyan)" strokeWidth="1" />
            <circle cx="105" cy="165" r="6" fill="var(--accent-cyan)" />
          </g>

          {/* Tertiary Macro Camera (Right of top lens) */}
          <circle
            cx="148"
            cy="118"
            r="10"
            fill="rgba(0, 0, 0, 0.8)"
            stroke="var(--accent-cyan)"
            strokeWidth="1.8"
          />
          <circle cx="148" cy="118" r="4.5" fill="var(--accent-cyan)" />

          {/* Dual LED Flash (Right of bottom lens) */}
          <rect
            x="144"
            y="142"
            width="8"
            height="22"
            rx="4"
            fill="rgba(255, 230, 0, 0.6)"
            stroke="var(--accent-yellow)"
            strokeWidth="1.2"
          />

          {/* ================= SCANLINE BEAM ANIMATION ================= */}
          <rect
            className="cad-scan-beam"
            x="66"
            y="46"
            width="208"
            height="18"
            fill="url(#cadScanBeam)"
          />
        </svg>
      </div>
    </div>
  );
}
