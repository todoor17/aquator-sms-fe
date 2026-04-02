"use client";

import { useRef } from "react";
import type { ClientMode } from "@/types/client";
import styles from "./ModeToggle.module.css";

interface ModeToggleProps {
  mode: ClientMode;
  onToggle: () => void;
}

export default function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  const hasInteracted = useRef(false);
  const animClass = hasInteracted.current ? styles.hasInteracted : "";

  function handleClick() {
    hasInteracted.current = true;
    onToggle();
  }

  return (
    <div className={styles.toggleWrapper} onClick={(e) => e.stopPropagation()}>
      <span
        className={`${styles.toggleLabel} ${
          mode === "Manual" ? styles.toggleLabelActive : ""
        }`}
      >
        Program manual
      </span>
      <button
        className={`${styles.toggle} ${animClass} ${
          mode === "Automat" ? styles.toggleChecked : ""
        }`}
        onClick={handleClick}
      >
        <span
          className={`${styles.toggleThumb} ${animClass} ${
            mode === "Automat" ? styles.toggleThumbChecked : ""
          }`}
        />
      </button>
      <span
        className={`${styles.toggleLabel} ${
          mode === "Automat" ? styles.toggleLabelActive : ""
        }`}
      >
        Program automat
      </span>
    </div>
  );
}
