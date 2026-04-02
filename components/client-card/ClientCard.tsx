"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { ChevronDown, ChevronUp, Phone } from "lucide-react";
import type { AppDispatch } from "@/store";
import type { Client } from "@/types/client";
import { updateClientModeThunk, updateClientSmsSettingsThunk } from "@/store/slices/clients/thunks";
import ModeToggle from "@/components/mode-toggle/ModeToggle";
import SmsToggle from "@/components/sms-toggle/SmsToggle";
import SmsTable from "@/components/sms-table/SmsTable";
import OrderSection from "@/components/order-section/OrderSection";
import styles from "./ClientCard.module.css";

interface ClientCardProps {
  client: Client;
}

export default function ClientCard({ client }: ClientCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isExpanded, setIsExpanded] = useState(false);

  const isManual = client.mode === "Manual";

  function handleToggleMode() {
    const newMode = client.mode === "Manual" ? "Automat" as const : "Manual" as const;
    dispatch(updateClientModeThunk({ clientId: client.id, mode: newMode }));
  }

  function handleToggleSms() {
    dispatch(updateClientSmsSettingsThunk({ clientId: client.id, smsEnabled: !client.smsEnabled }));
  }

  return (
    <div className={styles.card}>
      {/* Collapsed header */}
      <div
        className={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.headerInfo}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>
              {client.title
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </h3>
            {client.isRoPhone ? (
              <span className={styles.tagPhone}>
                <Phone size={12} />
                {client.telefon}
              </span>
            ) : (
              <span className={styles.tagPhoneInvalidWrap}>
                <span className={styles.tagPhoneInvalid}>
                  <Phone size={12} />
                  {client.telefon}
                  <span className={styles.nonRoLabel}> - NON RO</span>
                </span>
                <span className={styles.tooltip}>
                  Numarul de telefon nu este un numar de mobil din Romania
                </span>
              </span>
            )}
            <span
              className={
                client.platforma?.toLowerCase() === "emag"
                  ? styles.tagEmag
                  : styles.tagGomag
              }
            >
              {client.platforma}
            </span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <SmsToggle
            smsEnabled={client.smsEnabled}
            onToggle={handleToggleSms}
          />
          <ModeToggle
            mode={client.mode}
            onToggle={handleToggleMode}
          />
          {isExpanded ? (
            <ChevronUp className={styles.chevron} />
          ) : (
            <ChevronDown className={styles.chevron} />
          )}
        </div>
      </div>

      {/* Client-level actions bar */}
      {isExpanded && (
        <div className={styles.clientActions}>
          <div className={styles.additionalBlock}>
            <h5 className={styles.additionalTitle}>
              Programe SMS client
            </h5>
            <SmsTable
              rows={client.smsRows}
              defaultPhone={client.telefon}
              isRoPhone={client.isRoPhone}
              isManual={isManual}
              clientId={client.id}
              addLabel="Adauga program pe client"
            />
          </div>
        </div>
      )}

      {/* Expanded content: orders */}
      {isExpanded && (
        <div className={styles.content}>
          {client.orders.length > 0 ? (
            client.orders.map((order) => (
              <OrderSection
                key={order.id}
                order={order}
                isManual={isManual}
                isRoPhone={client.isRoPhone}
                clientId={client.id}
              />
            ))
          ) : (
            <div className={styles.emptyOrders}>
              <span className={styles.emptyIcon}>📦</span>
              Fara comenzi
            </div>
          )}
        </div>
      )}
    </div>
  );
}
