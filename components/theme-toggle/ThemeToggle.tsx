"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      className={styles.toggle}
      onClick={toggleTheme}
      title={isDark ? "Mod luminos" : "Mod intunecat"}
    >
      <span className={`${styles.iconWrap} ${isDark ? styles.active : ""}`}>
        <Moon size={14} />
      </span>
      <span className={`${styles.iconWrap} ${!isDark ? styles.active : ""}`}>
        <Sun size={14} />
      </span>
      <span
        className={`${styles.slider} ${isDark ? styles.sliderLeft : styles.sliderRight}`}
      />
    </button>
  );
}
