import { useEffect, useRef } from "react";
import * as THREE from "three";
import "vanta/dist/vanta.net.min.js";
import "./VantaBackground.css";

/**
 * Subtle animated network background (Vanta NET + three.js).
 * Purely decorative - reads no metrics/history data, touches no
 * dashboard state. Mounted once in AppLayout, sits behind all content.
 *
 * Vanta's UMD build doesn't always produce a clean default export under
 * esbuild/Vite interop - in many versions it just attaches itself as a
 * side effect to `window.VANTA.NET` instead of exporting a function.
 * We import the file for its side effect (no named/default binding) and
 * resolve the actual factory function from window.VANTA at run time,
 * after the module has executed.
 */
function resolveNetFactory() {
  if (typeof window !== "undefined" && window.VANTA && typeof window.VANTA.NET === "function") {
    return window.VANTA.NET;
  }
  return null;
}

export default function VantaBackground() {
  const containerRef = useRef(null);
  const effectRef = useRef(null);

  useEffect(() => {
    // Guard against double-init (e.g. React 18/19 StrictMode double-invoke in dev)
    if (effectRef.current || !containerRef.current) return;

    const NET = resolveNetFactory();

    if (typeof NET !== "function") {
      // Surface a clear diagnostic instead of a cryptic "NET is not a function"
      console.error(
        "VantaBackground: could not resolve a callable VANTA.NET factory.",
        "window.VANTA =", typeof window !== "undefined" ? window.VANTA : undefined
      );
      return;
    }

    effectRef.current = NET({
        el: containerRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        backgroundColor: 0x070b12,   // deeper navy-black
        color: 0x4f9dde,              // softer blue
        points: 10.0,                  // slightly denser
        maxDistance: 24.0,             // longer, more elegant lines
        spacing: 18.0,                  // tighter node spacing
        showDots: false,               // lines only
      });

    return () => {
      if (effectRef.current) {
        effectRef.current.destroy();
        effectRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="vanta-bg" aria-hidden="true" />;
}