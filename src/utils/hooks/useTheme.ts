import { useEffect, useState } from "react";
import { IconType } from "react-icons";
import {
  TbMoonFilled as MoonIcon,
  TbSunFilled as SunIcon,
  TbDevices as DeviceIcon,
  TbBrush as CustomIcon,
} from "react-icons/tb";

export enum Themes {
  SYSTEM = "system",
  LIGHT = "light",
  DARK = "dark",
  CUSTOM = "custom",
}

export const ThemeIcons: { [theme in Themes]: IconType } = {
  [Themes.SYSTEM]: DeviceIcon,
  [Themes.LIGHT]: SunIcon,
  [Themes.DARK]: MoonIcon,
  [Themes.CUSTOM]: CustomIcon,
};

const useTheme = () => {
  const [theme, setTheme] = useState<Themes>(Themes.DARK);

  useEffect(() => {
    const rootElement = document.querySelector("#root");
    if (!rootElement) return;

    const isDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    rootElement.classList.remove(...Object.values(Themes)); // Remove all themes currently applied

    rootElement.classList.add("main");
    if (theme == Themes.SYSTEM)
      rootElement.classList.add(isDarkMode ? Themes.DARK : Themes.LIGHT);
    else rootElement.classList.add(theme);
  }, [theme]);

  return { theme, setTheme };
};

export default useTheme;
