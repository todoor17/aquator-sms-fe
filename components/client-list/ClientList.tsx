"use client";

import { SearchX } from "lucide-react";
import type { Client } from "@/types/client";
import ClientCard from "@/components/client-card/ClientCard";
import ClientCardSkeleton from "@/components/client-card-skeleton/ClientCardSkeleton";
import styles from "./ClientList.module.css";

interface ClientListProps {
  clients: Client[];
  isInitialLoading: boolean;
  hasMore: boolean;
  isFetchingMore: boolean;
  triggerRef: (node: HTMLDivElement | null) => void;
}

export default function ClientList({
  clients,
  isInitialLoading,
  hasMore,
  isFetchingMore,
  triggerRef,
}: ClientListProps) {
  if (isInitialLoading) {
    return (
      <div className={styles.clientList}>
        <ClientCardSkeleton />
        <ClientCardSkeleton />
        <ClientCardSkeleton />
        <ClientCardSkeleton />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <SearchX size={40} />
        </div>
        <p className={styles.emptyTitle}>Nu au fost gasiti clienti</p>
        <p className={styles.emptySubtitle}>
          Incearca sa modifici filtrele sau termenul de cautare
        </p>
      </div>
    );
  }

  return (
    <div className={styles.clientList}>
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
      {hasMore && (
        <div ref={triggerRef}>
          <ClientCardSkeleton />
        </div>
      )}
      {isFetchingMore && !hasMore && <ClientCardSkeleton />}
    </div>
  );
}
