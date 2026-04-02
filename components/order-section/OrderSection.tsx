"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Phone, Calendar } from "lucide-react";
import type { Order } from "@/types/client";
import { formatDate } from "@/lib/date-format";
import SmsTable from "@/components/sms-table/SmsTable";
import styles from "./OrderSection.module.css";

interface OrderSectionProps {
  order: Order;
  isManual: boolean;
  isRoPhone: boolean;
  clientId: string;
}

export default function OrderSection({ order, isManual, isRoPhone, clientId }: OrderSectionProps) {
  const [isOrderExpanded, setIsOrderExpanded] = useState(false);

  return (
    <div className={styles.orderBlock}>
      <div
        className={styles.orderTitleRow}
        onClick={() => setIsOrderExpanded(!isOrderExpanded)}
      >
        <h4 className={styles.sectionTitle}>
          Ultima comanda pe numarul{" "}
          <span className={styles.tagPhone}>
            <Phone size={12} />
            {order.telefon}
          </span>
          {" "}este{" "}
          <span className={styles.tagOrder}>{order.id}</span>
          {" "}din data{" "}
          <span className={styles.tagDate}>
            <Calendar size={12} />
            {formatDate(order.data)}
          </span>
        </h4>
        <span className={styles.orderChevron}>
          {isOrderExpanded ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </span>
      </div>

      {isOrderExpanded && (
        <div className={styles.orderContent}>
          <ul className={styles.productList}>
            {order.products.map((product, idx) => (
              <li key={idx} className={styles.productItem}>
                {product}
              </li>
            ))}
          </ul>

          <h5 className={styles.smsTitle}>Programe SMS comanda</h5>
          <SmsTable
            rows={order.smsRows}
            defaultPhone={order.telefon}
            isRoPhone={isRoPhone}
            isManual={isManual}
            clientId={clientId}
            orderId={order.id}
            addLabel="Adauga program pe comanda"
          />
        </div>
      )}
    </div>
  );
}
