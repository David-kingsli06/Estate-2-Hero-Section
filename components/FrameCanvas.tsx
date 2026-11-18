"use client";

import React, { useRef, useEffect, useCallback } from "react";
import {
  TOTAL_FRAMES,
  getFramePath,
  mapProgressToFrame,
} from "@/lib/frames";

interface FrameCanvasProps {
  progress: number;
  onProgressRatio?: (ratio: number) => void;
  onFrameZeroDrawn?: () => void;
}

export const FrameCanvas: React.FC<FrameCanvasProps> = ({
  progress,
  onProgressRatio,
  onFrameZeroDrawn,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameZeroReportedRef = useRef(false);

  // Smooth lerp state
  const targetProgressRef = useRef<number>(progress);
  const currentProgressRef = useRef<number>(progress);
  const currentDrawnFrameRef = useRef<number>(-1);
  const rafIdRef = useRef<number | null>(null);

  // Sync scroll progress into ref
  useEffect(() => {
    targetProgressRef.current = progress;
  }, [progress]);

  // Sizing canvas backing store from element size * min(dpr, 2)
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);

    if (targetW > 0 && targetH > 0) {
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    }
  }, []);

  // Draw frame with object-fit: cover at 104 percent crop
  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      resizeCanvas();

      const img = imagesRef.current[index];
      let activeImg = img;
      if (!activeImg || !activeImg.complete || activeImg.naturalWidth === 0) {
        for (let i = index; i >= 0; i--) {
          const fallback = imagesRef.current[i];
          if (fallback && fallback.complete && fallback.naturalWidth > 0) {
            activeImg = fallback;
            break;
          }
        }
      }

      if (!activeImg || !activeImg.complete || activeImg.naturalWidth === 0) return;

      const { width, height } = canvas;
      if (width === 0 || height === 0) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // 104 percent cover crop
      const imgW = activeImg.naturalWidth;
      const imgH = activeImg.naturalHeight;
      const canvasRatio = width / height;
      const imgRatio = imgW / imgH;

      let drawW: number;
      let drawH: number;

      if (canvasRatio > imgRatio) {
        drawW = width;
        drawH = width / imgRatio;
      } else {
        drawH = height;
        drawW = height * imgRatio;
      }

      const scale = 1.04;
      const finalW = drawW * scale;
      const finalH = drawH * scale;
      const offsetX = (width - finalW) / 2;
      const offsetY = (height - finalH) / 2;

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(activeImg, offsetX, offsetY, finalW, finalH);
      currentDrawnFrameRef.current = index;

      if (index === 0 && !frameZeroReportedRef.current) {
        frameZeroReportedRef.current = true;
        console.log("frame 0 drawn");
        onFrameZeroDrawn?.();
      }
    },
    [onFrameZeroDrawn, resizeCanvas]
  );

  // Resize on mount and window resize
  useEffect(() => {
    resizeCanvas();
    const handleResize = () => {
      resizeCanvas();
      if (currentDrawnFrameRef.current >= 0) {
        drawFrame(currentDrawnFrameRef.current);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [resizeCanvas, drawFrame]);

  // Preload all frames with new Image()
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const path = getFramePath(i);
      img.src = path;

      img.onload = () => {
        loadedCount++;
        onProgressRatio?.(loadedCount / TOTAL_FRAMES);

        // Draw frame 0 as soon as it loads
        if (i === 0) {
          drawFrame(0);
        }
      };

      img.onerror = () => {
        console.error(`Failed to load frame: ${path}`);
      };

      images[i] = img;
    }

    imagesRef.current = images;
  }, [drawFrame, onProgressRatio]);

  // Animation loop: apply 0.04 lerp to p, compute index = round(p * 191), redraw only on change
  useEffect(() => {
    const tick = () => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const diff = target - current;

      // Lerp factor for p changed from 0.06 to 0.04 for slower, smoother glide
      if (Math.abs(diff) > 0.0001) {
        currentProgressRef.current = current + diff * 0.04;
      } else {
        currentProgressRef.current = target;
      }

      const index = mapProgressToFrame(currentProgressRef.current);

      if (index !== currentDrawnFrameRef.current) {
        console.log(`index: ${index}`);
        drawFrame(index);
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [drawFrame]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Cedar Ridge homes built on a beach, shown from a 3D blueprint on the sand through foundations, assembly, and the finished homes at dusk."
      className="absolute inset-0 w-full h-full object-cover z-[1]"
    />
  );
};
