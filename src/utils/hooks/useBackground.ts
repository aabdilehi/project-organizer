import { useEffect, useState } from "react";


export type BackgroundSlug = {
  color: string;
  pattern: string[];
  size: { x: number; y: number }[];
  offset: { x: number; y: number }[];
};

//

const useBackground = (position: { x: number; y: number }, scale: number) => {
  const [background, setBackground] = useState<BackgroundSlug>(crossBackground);
  // const [css, setCSS] = useState<string[]>(crossBackground.pattern);
  // const [size, setSize] = useState<{ x: number; y: number }[]>(
  //   crossBackground.size
  // );
  // const [offset, setOffset] = useState<{ x: number; y: number }[]>(
  //   crossBackground.offset
  // );

  // function setBackground(background: BackgroundSlug) {
  //   if (background.pattern == null) return;
  //   setCSS(background.pattern);

  //   if (background.size != null) setSize(background.size);
  //   if (background.offset != null) setOffset(background.offset);
  // }

  function updateBackground(position: { x: number; y: number }, scale: number) {
    const root = document.querySelector<HTMLDivElement>("#root");
    if (!root) return;
    root.style.backgroundColor = `rgb(var(--primary-color))`;
    root.style.backgroundImage = background.pattern.join(",");
    root.style.backgroundPosition = background.offset
      .map(
        ({ x, y }) => `${position.x + x * scale}px ${position.y + y * scale}px`
      )
      .join();
    root.style.backgroundSize = background.size
      .map(({ x, y }) => `${x * scale}px ${y * scale}px`)
      .join();
  }

  useEffect(() => {
      updateBackground(position, scale);
  }, [background, position, scale]);

  return { background, setBackground, updateBackground };
};

export const rhombusBackground: BackgroundSlug = {
  color: `red`,
  pattern: [
    `linear-gradient(135deg, rgb(var(--secondary-color)) 25%, transparent 25%)`,
    `linear-gradient(225deg, rgb(var(--secondary-color)) 25%, transparent 25%)`,
    `linear-gradient(45deg, rgb(var(--secondary-color)) 25%, transparent 25%)`,
    `linear-gradient(315deg, rgb(var(--secondary-color)) 25%, rgb(var(--primary-color)) 25%)`,
  ],
  offset: [
    { x: 15, y: 0 },
    { x: 15, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ],
  size: [{ x: 15, y: 15 }],
};

export const originalBackground: BackgroundSlug = {
  color: `rgb(var(--primary-background-color))`,
  pattern: [
    `radial-gradient(
    circle,
    rgb(var(--secondary-color)) 3px,
    rgb(var(--primary-color)) 2px
  )`,
  ],
  size: [{ x: 40, y: 40 }],
  offset: [{ x: 0, y: 0 }],
};

export const crossBackground: BackgroundSlug = {
  color: `rgba(229, 229, 247, 0.8)`,
  pattern: [
    `radial-gradient(circle, transparent 20%, rgb(var(--primary-color)) 20%,
    rgb(var(--primary-color)) 80%, transparent 80%, transparent)`,
    `radial-gradient(circle, transparent 20%, rgb(var(--primary-color)) 20%,
    rgb(var(--primary-color)) 80%, transparent 80%, transparent)`,
    `linear-gradient(rgb(var(--secondary-color)) 15.5%, transparent 15.5%)`,
    `linear-gradient(90deg, rgb(var(--secondary-color)) 15.5%, transparent 15.5%)`,
  ],
  size: [
    { x: 100, y: 100 },
    { x: 100, y: 100 },
    { x: 50, y: 50 },
    { x: 50, y: 50 },
  ],
  offset: [
    { x: 0, y: 0 },
    { x: 50, y: 50 },
    { x: 0, y: -4 },
    { x: -4, y: 0 },
  ],
};

export const waveBackground: BackgroundSlug = {
  color: `rgba(229, 229, 247, 0.8)`,
  pattern: [
    `radial-gradient(
      circle at 100% 50%,
      transparent 20%,
      rgb(var(--secondary-color)) 21%,
      rgb(var(--secondary-color)) 34%,
      transparent 35%,
      transparent
    )`,
    `radial-gradient(
        circle at 0% 50%,
        transparent 20%,
        rgb(var(--secondary-color)) 21%,
        rgb(var(--secondary-color)) 34%,
        transparent 35%,
        transparent
      )`,
  ],
  size: [{ x: 75, y: 100 }],
  offset: [
    { x: 0, y: 0 },
    { x: 0, y: -50 },
  ],
};

export const paperBackground: BackgroundSlug = {
  color: "rgb(var(--primary-color))",
  pattern: [
    `linear-gradient(rgb(var(--secondary-color)) 4px, transparent 4px)`,
    `linear-gradient(90deg, rgb(var(--secondary-color)) 4px, transparent 4px)`,
    `linear-gradient(rgb(var(--secondary-color)) 2px, transparent 2px)`,
    `linear-gradient(90deg, rgb(var(--secondary-color)) 2px, rgb(var(--primary-color)) 2px)`,
  ],
  size: [
    { x: 150, y: 150 },
    { x: 150, y: 150 },
    { x: 30, y: 30 },
    { x: 30, y: 30 },
  ],
  offset: [
    { x: -0, y: -0 },
    { x: -0, y: -0 },
    { x: -0, y: -0 },
    { x: -0, y: -0 },
  ],
};

export default useBackground;



export enum Backgrounds {
  DEFAULT = "default",
  CROSS = "cross",
  WAVE = "wave",
  PAPER = "paper",
  CUSTOM = "custom"
};

export const backgroundMap: {[key in Backgrounds]: BackgroundSlug} = {
  [Backgrounds.DEFAULT]: originalBackground,
  [Backgrounds.CROSS]: crossBackground,
  [Backgrounds.WAVE]: waveBackground,
  [Backgrounds.PAPER]: paperBackground,
  [Backgrounds.CUSTOM]: {
    color: "",
    pattern: [],
    size: [],
    offset: []
  }
}