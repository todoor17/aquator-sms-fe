"use client";

import { Search, Check } from "lucide-react";
import type { ClientResources } from "@/models/clients/clients";
import styles from "./SearchToolbar.module.css";

interface SearchToolbarProps {
  search: string;
  magazin: string;
  anComanda: string;
  lunaComanda: string;
  tipClient: string;
  smsEnabled: string;
  mode: string;
  resources: ClientResources | null;
  onSearchChange: (value: string) => void;
  onMagazinChange: (value: string) => void;
  onAnComandaChange: (value: string) => void;
  onLunaComandaChange: (value: string) => void;
  onTipClientChange: (value: string) => void;
  onSmsEnabledChange: (value: string) => void;
  onModeChange: (value: string) => void;
  onSubmit: () => void;
}

export default function SearchToolbar({
  search,
  magazin,
  anComanda,
  lunaComanda,
  tipClient,
  smsEnabled,
  mode,
  resources,
  onSearchChange,
  onMagazinChange,
  onAnComandaChange,
  onLunaComandaChange,
  onTipClientChange,
  onSmsEnabledChange,
  onModeChange,
  onSubmit,
}: SearchToolbarProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      onSubmit();
    }
  }

  const currentYear = new Date().getFullYear();
  const years =
    resources?.years ??
    Array.from({ length: currentYear - 2023 + 1 }, (_, i) =>
      String(currentYear - i),
    );
  const months = resources?.months ?? [
    { value: "1", label: "Ianuarie" },
    { value: "2", label: "Februarie" },
    { value: "3", label: "Martie" },
    { value: "4", label: "Aprilie" },
    { value: "5", label: "Mai" },
    { value: "6", label: "Iunie" },
    { value: "7", label: "Iulie" },
    { value: "8", label: "August" },
    { value: "9", label: "Septembrie" },
    { value: "10", label: "Octombrie" },
    { value: "11", label: "Noiembrie" },
    { value: "12", label: "Decembrie" },
  ];
  const magazines = resources?.magazines ?? [
    { value: "emag", label: "eMAG" },
    { value: "gomag", label: "GOMag" },
  ];
  const tipClientOptions = resources?.tipClient ?? [
    { value: "cu_comenzi", label: "Cu comenzi" },
    { value: "fara_comenzi", label: "Fara comenzi" },
  ];

  return (
    <div className={styles.stickyWrapper}>
      <div className={styles.toolbar} onKeyDown={handleKeyDown}>
        <div className={styles.row1}>
          <div className={styles.cellSearch}>
            <label className={styles.fieldLabel}>Cautare</label>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Nume sau telefon"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.cellFilter}>
            <label className={styles.fieldLabel}>Magazin</label>
            <select
              className={styles.filterSelect}
              value={magazin}
              onChange={(e) => onMagazinChange(e.target.value)}
            >
              <option value="">Toate</option>
              {magazines.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.cellFilter}>
            <label className={styles.fieldLabel}>Tip client</label>
            <select
              className={styles.filterSelect}
              value={tipClient}
              onChange={(e) => {
                onTipClientChange(e.target.value);
                if (e.target.value === "fara_comenzi") {
                  onAnComandaChange("");
                  onLunaComandaChange("");
                }
              }}
            >
              <option value="">Toti</option>
              {tipClientOptions.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div></div>
        </div>

        <div className={styles.row2}>
          <div className={styles.cellChecks}>
            <div className={styles.checkGroup}>
              <label className={styles.fieldLabel}>Status SMS</label>
              <div className={styles.checkPair}>
                <button
                  type="button"
                  className={`${styles.checkBtn} ${smsEnabled === "true" ? styles.checkBtnActiveGreen : ""}`}
                  onClick={() =>
                    onSmsEnabledChange(smsEnabled === "true" ? "" : "true")
                  }
                >
                  <span
                    className={`${styles.checkBox} ${smsEnabled === "true" ? styles.checkBoxActiveGreen : ""}`}
                  >
                    {smsEnabled === "true" && <Check size={12} />}
                  </span>
                  SMS Pornit
                </button>
                <button
                  type="button"
                  className={`${styles.checkBtn} ${smsEnabled === "false" ? styles.checkBtnActiveRed : ""}`}
                  onClick={() =>
                    onSmsEnabledChange(smsEnabled === "false" ? "" : "false")
                  }
                >
                  <span
                    className={`${styles.checkBox} ${smsEnabled === "false" ? styles.checkBoxActiveRed : ""}`}
                  >
                    {smsEnabled === "false" && <Check size={12} />}
                  </span>
                  SMS Oprit
                </button>
              </div>
            </div>
            <div className={styles.checkGroup}>
              <label className={styles.fieldLabel}>Mod trimitere</label>
              <div className={styles.checkPair}>
                <button
                  type="button"
                  className={`${styles.checkBtn} ${mode === "Manual" ? styles.checkBtnActiveBlue : ""}`}
                  onClick={() =>
                    onModeChange(mode === "Manual" ? "" : "Manual")
                  }
                >
                  <span
                    className={`${styles.checkBox} ${mode === "Manual" ? styles.checkBoxActiveBlue : ""}`}
                  >
                    {mode === "Manual" && <Check size={12} />}
                  </span>
                  Manual
                </button>
                <button
                  type="button"
                  className={`${styles.checkBtn} ${mode === "Automat" ? styles.checkBtnActiveOrange : ""}`}
                  onClick={() =>
                    onModeChange(mode === "Automat" ? "" : "Automat")
                  }
                >
                  <span
                    className={`${styles.checkBox} ${mode === "Automat" ? styles.checkBoxActiveOrange : ""}`}
                  >
                    {mode === "Automat" && <Check size={12} />}
                  </span>
                  Automat
                </button>
              </div>
            </div>
          </div>
          <div className={styles.cellFilter}>
            <label className={styles.fieldLabel}>An comanda</label>
            <select
              className={`${styles.filterSelect} ${tipClient === "fara_comenzi" ? styles.filterSelectDisabled : ""}`}
              value={anComanda}
              disabled={tipClient === "fara_comenzi"}
              onChange={(e) => {
                onAnComandaChange(e.target.value);
                if (!e.target.value) onLunaComandaChange("");
              }}
            >
              <option value="">Toti anii</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.cellFilter}>
            <label className={styles.fieldLabel}>Luna comanda</label>
            <select
              className={`${styles.filterSelect} ${!anComanda || tipClient === "fara_comenzi" ? styles.filterSelectDisabled : ""}`}
              value={lunaComanda}
              onChange={(e) => onLunaComandaChange(e.target.value)}
              disabled={!anComanda || tipClient === "fara_comenzi"}
            >
              <option value="">Toate lunile</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.cellBtn}>
            <button className={styles.searchBtn} onClick={onSubmit}>
              <Search size={16} />
              Cauta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
