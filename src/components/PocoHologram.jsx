import { useState, useRef, useEffect } from "react";

export default function PocoHologram() {
  const [rotate, setRotate] = useState({ x: 3, y: -6 });
  const wrapRef = useRef(null);
  const rafRef = useRef(null);

  function handleMouseMove(e) {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -10;
    const rotY = ((x - centerX) / centerX) * 12;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setRotate({ x: rotX, y: rotY });
    });
  }

  function handleMouseLeave() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setRotate({ x: 3, y: -6 });
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

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
          viewBox="40 25 260 460"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Vector Hard Shadow (Gecko and Zen Browser Compatible, Zero Flicker) */}
          <rect
            x="74"
            y="54"
            width="210"
            height="410"
            rx="26"
            ry="26"
            fill="#000000"
            stroke="rgba(0, 0, 0, 0.9)"
            strokeWidth="2"
          />

          {/* Outer Phone Border (POCO F5 Clean White Silhouette) */}
          <rect
            x="65"
            y="45"
            width="210"
            height="410"
            rx="26"
            ry="26"
            fill="#0a0c10"
            stroke="#ffffff"
            strokeWidth="2.5"
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
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
            strokeDasharray="4 3"
          />

          {/* Side Buttons (Right Edge: Volume rocker & Power / Fingerprint) */}
          <line
            x1="275"
            y1="130"
            x2="275"
            y2="175"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <line
            x1="275"
            y1="190"
            x2="275"
            y2="225"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Antenna Bands on side frame */}
          <line x1="65" y1="95" x2="69" y2="95" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" />
          <line x1="271" y1="95" x2="275" y2="95" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" />
          <line x1="65" y1="405" x2="69" y2="405" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" />
          <line x1="271" y1="405" x2="275" y2="405" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" />

          {/* ================= REAR CAMERA SYSTEM (POCO F5) ================= */}
          {/* Main Camera 1 (Top Left) */}
          <g className="cad-cam">
            <circle
              cx="105"
              cy="105"
              r="26"
              fill="rgba(0, 0, 0, 0.85)"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
            <circle
              cx="105"
              cy="105"
              r="20"
              fill="none"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="1.2"
            />
            <circle cx="105" cy="105" r="13" fill="#03080d" stroke="#ffffff" strokeWidth="1" />
            <circle cx="105" cy="105" r="6" fill="#ffffff" />
            {/* Optical reflection arc */}
            <path
              d="M 96 98 A 12 12 0 0 1 114 98"
              stroke="rgba(255, 255, 255, 0.9)"
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
              fill="rgba(0, 0, 0, 0.85)"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
            <circle
              cx="105"
              cy="165"
              r="20"
              fill="none"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="1.2"
            />
            <circle cx="105" cy="165" r="13" fill="#03080d" stroke="#ffffff" strokeWidth="1" />
            <circle cx="105" cy="165" r="6" fill="#ffffff" />
          </g>

          {/* Tertiary Macro Camera (Centered vertically between main lenses) */}
          <circle
            cx="148"
            cy="135"
            r="10"
            fill="rgba(0, 0, 0, 0.85)"
            stroke="#ffffff"
            strokeWidth="1.8"
          />
          <circle cx="148" cy="135" r="4.5" fill="#ffffff" />

          {/* Dual LED Flash (Aligned with bottom lens center) */}
          <rect
            x="144"
            y="155"
            width="8"
            height="20"
            rx="4"
            fill="rgba(255, 255, 255, 0.12)"
            stroke="#ffffff"
            strokeWidth="1.2"
          />
        </svg>
      </div>
    </div>
  );
}
