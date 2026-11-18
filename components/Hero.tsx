"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { getActiveStageIndex } from "@/lib/frames";
import { FrameCanvas } from "./FrameCanvas";
import { HeroOverlay } from "./HeroOverlay";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [loadRatio, setLoadRatio] = useState<number>(0);
  const [posterRemoved, setPosterRemoved] = useState<boolean>(false);
  const reducedMotion = useReducedMotion();

  // Remove poster only after frame 0 is drawn
  const handleFrameZeroDrawn = () => {
    setPosterRemoved(true);
    console.log("poster removed");
  };

  // Scroll tracking: window scroll listener + GSAP ScrollTrigger across 600vh
  useEffect(() => {
    if (reducedMotion) return;

    const el = containerRef.current;
    if (!el) return;

    const computeProgress = () => {
      const rect = el.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return 0;
      const currentScroll = -rect.top;
      const rawProgress = currentScroll / totalScrollable;
      return Math.max(0, Math.min(1, rawProgress));
    };

    const handleScroll = () => {
      const p = computeProgress();
      setScrollProgress(p);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    let trigger: ScrollTrigger | null = null;
    try {
      trigger = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
      ScrollTrigger.refresh();
    } catch (e) {
      console.warn("ScrollTrigger notice:", e);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (trigger) trigger.kill();
    };
  }, [reducedMotion]);

  const activeStage = getActiveStageIndex(scrollProgress);

  return (
    <section
      ref={containerRef}
      className={`relative w-full ${
        reducedMotion ? "h-screen" : "h-[600vh]"
      } bg-[#D8C3A5]`}
    >
      {/* Sticky 100vh Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Hairline preloader progress */}
        {loadRatio < 1 && (
          <div
            className="absolute top-0 left-0 h-[2px] bg-[#8A5A3C] z-30 transition-all duration-300 ease-out pointer-events-none"
            style={{ width: `${Math.round(loadRatio * 100)}%` }}
          />
        )}

        {/* Poster Image (z-0) - remains visible until frame 0 is drawn */}
        {!posterRemoved && (
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
            <Image
              src="/cedar_ridge_poster_16x9.jpg"
              alt="Cedar Ridge development poster"
              fill
              priority
              sizes="100vw"
              className="object-cover scale-[1.04]"
            />
          </div>
        )}

        {/* Frame Canvas (z-1) - sits directly above poster */}
        {!reducedMotion && (
          <FrameCanvas
            progress={scrollProgress}
            onProgressRatio={setLoadRatio}
            onFrameZeroDrawn={handleFrameZeroDrawn}
          />
        )}

        {/* Soft text contrast gradient */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#D8C3A5]/60 via-[#D8C3A5]/15 to-transparent w-full lg:w-[42vw]" />

        {/* Text & Stage UI Overlay (z-20) */}
        <HeroOverlay
          progress={scrollProgress}
          activeStageIndex={activeStage}
          reducedMotion={reducedMotion}
        />
      </div>
    </section>
  );
};
