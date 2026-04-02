"use client";

import { useRef } from "react";
import styles from "./SmsToggle.module.css";

interface SmsToggleProps {
  smsEnabled: boolean;
  onToggle: () => void;
}

export default function SmsToggle({ smsEnabled, onToggle }: SmsToggleProps) {
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
          !smsEnabled ? styles.toggleLabelActiveRed : styles.toggleLabelInactive
        }`}
      >
        SMS oprit
      </span>
      <button
        className={`${styles.toggle} ${animClass} ${
          smsEnabled ? styles.toggleCheckedGreen : styles.toggleCheckedRed
        }`}
        onClick={handleClick}
      >
        <span
          className={`${styles.toggleThumb} ${animClass} ${
            smsEnabled ? styles.toggleThumbChecked : ""
          }`}
        />
      </button>
      <span
        className={`${styles.toggleLabel} ${
          smsEnabled ? styles.toggleLabelActiveGreen : styles.toggleLabelInactive
        }`}
      >
        SMS pornit
      </span>
    </div>
  );
}
