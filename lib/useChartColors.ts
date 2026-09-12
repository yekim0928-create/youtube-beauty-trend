"use client";

import { useEffect, useState } from "react";

interface ChartColors {
  accent: string;
  accentSoft: string;
  grid: string;
  text: string;
}

const LIGHT: ChartColors = {
  accent: "#a8636f",
  accentSoft: "#f6e4e6",
  grid: "#ecdfd6",
  text: "#8a7b6c",
};

const DARK: ChartColors = {
  accent: "#e6b1b8",
  accentSoft: "#35262a",
  grid: "#3a2f29",
  text: "#b3a396",
};

export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(LIGHT);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setColors(mql.matches ? DARK : LIGHT);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  return colors;
}
