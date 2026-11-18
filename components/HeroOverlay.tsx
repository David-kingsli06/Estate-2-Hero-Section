"use client";

import React from "react";
import { STAGES } from "@/lib/frames";

interface HeroOverlayProps {
  progress: number;
  activeStageIndex: number;
  reducedMotion?: boolean;
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({
  progress,
  activeStageIndex,
  reducedMotion = false,
}) => {
  // Stage counter formatted strings
  const stageNumberFormatted = (activeStageIndex + 1).toString().padStart(2, "0");

  // In reduced motion, stage 4 wordmark + subline are statically shown
  if (reducedMotion) {
    return (
      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 sm:p-12 lg:p-[6vw]">
        {/* Stage counter top-right */}
        <div className="self-end font-sans text-[14px] tracking-[0.2em] text-[#2B2620]/70 select-none">
          04 / 04
        </div>

        {/* Wordmark and subline */}
        <div className="w-full lg:w-[34vw] my-auto">
          <p
            className="font-serif text-[#2B2620] leading-[1.1] tracking-[0.08em] text-[64px] lg:text-[96px] text-shadow-calm"
          >
            Cedar Ridge
          </p>
          <p className="font-sans text-[#5C5043] text-[16px] lg:text-[18px] leading-[1.5] mt-4 text-shadow-calm">
            Homes by the sea. Ready for you.
          </p>
        </div>

        <div className="h-6" />
      </div>
    );
  }

  // Wordmark calculation (Stage 4, p crossing 0.8)
  // Starts with letter spacing 0.4em and opacity 0 at p=0.75-0.8.
  // As p crosses 0.8, it tightens to 0.08em and fades to opacity 1 over ~1400ms.
  // In scroll terms, p from 0.78 to 0.92 handles this calm transition.
  const wordmarkP = Math.max(0, Math.min(1, (progress - 0.78) / 0.15));
  // Easing: cubic-bezier(0.22, 1, 0.36, 1) approximation
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const wordmarkEased = easeOutCubic(wordmarkP);
  const wordmarkSpacingEm = 0.4 - wordmarkEased * (0.4 - 0.08); // 0.4em -> 0.08em
  const wordmarkOpacity = wordmarkEased;

  // Scroll cue: visible only in stage 1, stops completely after p = 0.02
  const showScrollCue = progress <= 0.02;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 sm:p-10 lg:p-[6vw]">
      {/* Top bar with stage counter */}
      <div className="flex justify-end w-full select-none">
        <div className="font-sans text-[14px] tracking-[0.2em] text-[#2B2620]/70 flex items-center">
          <span
            key={stageNumberFormatted}
            className="inline-block transition-opacity duration-400 ease-out"
          >
            {stageNumberFormatted}
          </span>
          <span className="ml-1 text-[#2B2620]/70">/ 04</span>
        </div>
      </div>

      {/* Main Text Container:
          Desktop: left 6vw, width 34vw, vertically centered.
          Mobile: top 35% of viewport.
      */}
      <div className="w-full lg:w-[34vw] my-auto pt-6 lg:pt-0">
        {STAGES.map((stage, idx) => {
          const isActive = activeStageIndex === idx;

          if (stage.isWordmark) {
            // Stage 4 Wordmark
            return (
              <div
                key={stage.id}
                className={`transition-opacity duration-700 ease-out ${
                  isActive ? "block" : "hidden"
                }`}
                style={{
                  opacity: wordmarkOpacity,
                }}
              >
                <p
                  className="font-serif text-[#2B2620] leading-[1.1] text-[64px] lg:text-[96px] text-shadow-calm transition-[letter-spacing] duration-700 ease-out"
                  style={{
                    letterSpacing: `${wordmarkSpacingEm}em`,
                  }}
                >
                  {stage.headline}
                </p>
                <p
                  className="font-sans text-[#5C5043] text-[16px] lg:text-[18px] leading-[1.5] mt-4 text-shadow-calm transition-opacity duration-700 ease-out"
                  style={{
                    opacity: wordmarkOpacity,
                    transitionDelay: "300ms",
                  }}
                >
                  {stage.subline}
                </p>
              </div>
            );
          }

          // Stages 1, 2, 3
          const Tag = stage.tag;
          return (
            <div
              key={stage.id}
              className={`transition-all duration-900 ${
                isActive
                  ? "opacity-100 translate-y-0 blur-none pointer-events-auto block"
                  : "opacity-0 translate-y-6 blur-md pointer-events-none hidden"
              }`}
              style={{
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <Tag className="font-serif text-[#2B2620] text-[40px] sm:text-[48px] lg:text-[68px] leading-[1.1] tracking-normal text-shadow-calm">
                {stage.headline}
              </Tag>
              <p
                className={`font-sans text-[#5C5043] text-[16px] lg:text-[18px] leading-[1.5] mt-4 text-shadow-calm transition-opacity duration-700 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  transitionDelay: isActive ? "300ms" : "0ms",
                  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {stage.subline}
              </p>

              {/* Scroll cue: thin 40px cedar line pulsing slowly, stops after p = 0.02 */}
              {stage.id === 1 && showScrollCue && (
                <div className="mt-8 flex items-center gap-3">
                  <div className="w-[40px] h-[1.5px] bg-[#8A5A3C] animate-cedar-pulse" />
                  <span className="font-sans text-[12px] tracking-[0.15em] text-[#8A5A3C] uppercase opacity-75">
                    Scroll to build
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom spacer */}
      <div className="h-6" />
    </div>
  );
};
