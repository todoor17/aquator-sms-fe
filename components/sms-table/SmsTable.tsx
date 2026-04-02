"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Plus, Check, X } from "lucide-react";
import type { SMSRow } from "@/types/client";
import { isValidPhone, normalizeRoPhone } from "@/lib/phone-validation";
import { formatDate, parseDate } from "@/lib/date-format";
import ConfirmModal from "@/components/confirm-modal/ConfirmModal";
import api from "@/lib/api";
import styles from "./SmsTable.module.css";

const TEMP_PREFIX = "_temp_";

interface SmsTableProps {
  rows: SMSRow[];
  defaultPhone: string;
  isRoPhone: boolean;
  isManual: boolean;
  clientId: string;
  orderId?: string;
  addLabel?: string;
  addClassName?: string;
}

export default function SmsTable({
  rows,
  defaultPhone,
  isRoPhone,
  isManual,
  clientId,
  orderId,
  addLabel = "Adauga un program nou",
  addClassName,
}: SmsTableProps) {
  // localRows: rows managed in FE only (unsaved + saved-but-not-in-redux)
  const [localRows, setLocalRows] = useState<SMSRow[]>([]);
  // IDs of rows that were deleted locally but need backend delete
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRowData, setEditingRowData] = useState<SMSRow | null>(null);
  const [validationErrors, setValidationErrors] = useState({
    data: false,
    tipSMS: false,
    telefon: false,
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isTemp = (id: string) => id.startsWith(TEMP_PREFIX);
  // Combine: redux rows (excluding locally deleted) + local rows
  const allRows = [
    ...rows.filter((r) => !deletedIds.has(r.id)),
    ...localRows,
  ];

  function resetEdit() {
    setEditingRowId(null);
    setEditingRowData(null);
    setValidationErrors({ data: false, tipSMS: false, telefon: false });
  }

  useEffect(() => {
    if (!isManual && editingRowId) {
      if (isTemp(editingRowId)) {
        setLocalRows((prev) => prev.filter((r) => r.id !== editingRowId));
      }
      resetEdit();
    }
  }, [isManual]);

  function validate(row: SMSRow) {
    return {
      data: !row.data || !/^\d{4}-\d{2}-\d{2}$/.test(row.data.trim()),
      tipSMS: !row.tipSMS,
      telefon: !isValidPhone(row.telefon),
    };
  }

  function handleAddRow() {
    // If editing, validate first
    if (editingRowId && editingRowData) {
      const errors = validate(editingRowData);
      setValidationErrors(errors);
      if (errors.data || errors.tipSMS || errors.telefon) return;
      // Save current edit before adding new
      doSave(editingRowId, editingRowData);
    }

    const today = new Date().toISOString().split("T")[0];
    const tempRow: SMSRow = {
      id: `${TEMP_PREFIX}${Date.now()}`,
      data: today,
      tipSMS: "reminder achizitie",
      telefon: isRoPhone ? defaultPhone : "",
      status: "pending",
    };

    setLocalRows((prev) => [...prev, tempRow]);
    setEditingRowId(tempRow.id);
    setEditingRowData({ ...tempRow });
    setValidationErrors({ data: false, tipSMS: false, telefon: false });
  }

  function doSave(id: string, data: SMSRow) {
    const normalizedPhone = normalizeRoPhone(data.telefon);
    const payload = {
      data: data.data,
      tipSMS: data.tipSMS,
      telefon: normalizedPhone,
      status: data.status,
    };

    // Update local state immediately (seamless)
    const savedRow = { ...data, telefon: normalizedPhone };

    if (isTemp(id)) {
      // New row — save to backend silently, replace temp with real ID in local state
      const url = orderId
        ? `/orders/${orderId}/programs`
        : `/clients/${clientId}/programs`;

      api.post<SMSRow>(url, payload).then((res) => {
        const realRow = res.data;
        setLocalRows((prev) =>
          prev.map((r) => (r.id === id ? { ...savedRow, id: realRow.id } : r))
        );
      });

      // Update temp row data immediately (before backend responds)
      setLocalRows((prev) =>
        prev.map((r) => (r.id === id ? savedRow : r))
      );
    } else if (localRows.some((r) => r.id === id)) {
      // Locally tracked row — update in backend silently, update local state
      const url = orderId
        ? `/orders/${orderId}/programs/${id}`
        : `/clients/${clientId}/programs/${id}`;
      api.put(url, payload);

      setLocalRows((prev) =>
        prev.map((r) => (r.id === id ? savedRow : r))
      );
    } else {
      // Redux row — update in backend silently, move to local state
      const url = orderId
        ? `/orders/${orderId}/programs/${id}`
        : `/clients/${clientId}/programs/${id}`;
      api.put(url, payload);

      // Hide from redux view, add to local
      setDeletedIds((prev) => new Set(prev).add(id));
      setLocalRows((prev) => [...prev, savedRow]);
    }
    resetEdit();
  }

  function handleSaveEdit() {
    if (!editingRowData || !editingRowId) return;
    const errors = validate(editingRowData);
    setValidationErrors(errors);
    if (errors.data || errors.tipSMS || errors.telefon) return;
    doSave(editingRowId, editingRowData);
  }

  function handleDeleteRow(id: string) {
    if (isTemp(id)) {
      // Unsaved temp — just remove locally
      setLocalRows((prev) => prev.filter((r) => r.id !== id));
    } else if (localRows.some((r) => r.id === id)) {
      // Locally tracked (was saved to backend) — delete from backend + remove locally
      const url = orderId
        ? `/orders/${orderId}/programs/${id}`
        : `/clients/${clientId}/programs/${id}`;
      api.delete(url);
      setLocalRows((prev) => prev.filter((r) => r.id !== id));
    } else {
      // Redux row — delete from backend + hide from view
      const url = orderId
        ? `/orders/${orderId}/programs/${id}`
        : `/clients/${clientId}/programs/${id}`;
      api.delete(url);
      setDeletedIds((prev) => new Set(prev).add(id));
    }
    if (editingRowId === id) resetEdit();
    setDeleteConfirmId(null);
  }

  function handleStartEdit(row: SMSRow) {
    setEditingRowId(row.id);
    setEditingRowData({ ...row });
    setValidationErrors({ data: false, tipSMS: false, telefon: false });
  }

  function handleCancelEdit() {
    if (editingRowId && isTemp(editingRowId)) {
      // Unsaved new row — remove from local state
      setLocalRows((prev) => prev.filter((r) => r.id !== editingRowId));
    }
    resetEdit();
  }

  function handleEditField(field: keyof SMSRow, value: string | boolean) {
    if (editingRowData) {
      setEditingRowData({ ...editingRowData, [field]: value });
      if (validationErrors[field as keyof typeof validationErrors]) {
        setValidationErrors((prev) => ({ ...prev, [field]: false }));
      }
    }
  }

  return (
    <div>
      {allRows.length > 0 ? (
        <div className={styles.tableWrapper}>
          <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data trimitere SMS</th>
                <th>Tip SMS</th>
                <th>Telefon</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actiuni</th>
              </tr>
            </thead>
            <tbody>
              {allRows.map((row) => {
                const isEditing = editingRowId === row.id;
                const isTempRow = isTemp(row.id);
                const d = isEditing ? editingRowData! : row;

                return (
                  <tr key={row.id}>
                    <td>
                      <div>
                        {isEditing ? (
                          <>
                            <div className={styles.dateInputWrapper}>
                              <input
                                type="text"
                                value={formatDate(d.data)}
                                onChange={(e) => {
                                  handleEditField("data", parseDate(e.target.value));
                                }}
                                placeholder="dd / mm / yyyy"
                                className={`${styles.inputField} ${styles.dateField} ${
                                  validationErrors.data
                                    ? styles.inputFieldError
                                    : ""
                                }`}
                              />
                              <input
                                type="date"
                                value={d.data}
                                onChange={(e) =>
                                  handleEditField("data", e.target.value)
                                }
                                className={styles.datePickerHidden}
                                tabIndex={-1}
                              />
                            </div>
                            {validationErrors.data && (
                              <span className={styles.fieldError}>
                                {!d.data?.trim() ? "Camp obligatoriu" : "Data invalida"}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className={styles.dateDisplay}>
                            {formatDate(d.data)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.tipSmsCell}>
                        <select
                          value={d.tipSMS}
                          onChange={(e) =>
                            handleEditField(
                              "tipSMS",
                              e.target.value as SMSRow["tipSMS"],
                            )
                          }
                          disabled={!isEditing}
                          className={`${styles.selectField} ${
                            isEditing && validationErrors.tipSMS
                              ? styles.selectFieldError
                              : ""
                          }`}
                        >
                          <option value="schimb">schimb</option>
                          <option value="achizitie">achizitie</option>
                          <option value="reminder achizitie">
                            reminder achizitie
                          </option>
                        </select>
                        {d.tipSMS && (
                          <span
                            className={`${styles.tipTag} ${
                              d.tipSMS === "schimb"
                                ? styles.tipTagS1
                                : d.tipSMS === "achizitie"
                                  ? styles.tipTagS2
                                  : styles.tipTagS3
                            }`}
                          >
                            {d.tipSMS === "schimb"
                              ? "S1"
                              : d.tipSMS === "achizitie"
                                ? "S2"
                                : "S3"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <input
                        type="tel"
                        value={d.telefon}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9+]/g, "");
                          handleEditField("telefon", v);
                        }}
                        disabled={!isEditing}
                        className={`${styles.inputField} ${styles.phoneField} ${
                          isEditing && validationErrors.telefon
                            ? styles.inputFieldError
                            : ""
                        }`}
                        placeholder="+40... sau 07..."
                      />
                      {isEditing && validationErrors.telefon && (
                        <span className={styles.fieldError}>
                          {!d.telefon?.trim() ? "Camp obligatoriu" : "Nr. telefon incorect"}
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          d.status === "sent"
                            ? styles.badgeSent
                            : d.status === "planned"
                              ? styles.badgePlanned
                              : d.status === "cancelled"
                                ? styles.badgeCancelled
                                : d.status === "error"
                                  ? styles.badgeError
                                  : styles.badgePending
                        }`}
                      >
                        {d.status === "sent"
                          ? "Trimis"
                          : d.status === "planned"
                            ? "Planificat"
                            : d.status === "cancelled"
                              ? "Anulat"
                              : d.status === "error"
                                ? "Eroare"
                                : "Netrimis"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className={`${styles.iconBtn} ${styles.iconBtnSave}`}
                              title="Salveaza"
                            >
                              <Check size={16} color="var(--green-400)" />
                            </button>
                            {isTempRow ? (
                              <button
                                onClick={() => handleDeleteRow(row.id)}
                                className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                                title="Sterge"
                              >
                                <Trash2 size={16} color="var(--red-400)" />
                              </button>
                            ) : (
                              <button
                                onClick={handleCancelEdit}
                                className={`${styles.iconBtn} ${styles.iconBtnCancel}`}
                                title="Anuleaza"
                              >
                                <X size={16} color="var(--purple-400)" />
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(row)}
                              disabled={
                                !isManual ||
                                (row.status !== "pending" &&
                                  row.status !== "planned")
                              }
                              className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
                              title="Editeaza"
                            >
                              <Edit size={16} color="var(--purple-400)" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(row.id)}
                              disabled={
                                !isManual ||
                                (row.status !== "pending" &&
                                  row.status !== "planned")
                              }
                              className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                              title="Sterge"
                            >
                              <Trash2 size={16} color="var(--red-400)" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      ) : null}

      <button
        onClick={handleAddRow}
        disabled={!isManual}
        className={`${styles.addBtn} ${addClassName || ""}`}
      >
        <Plus size={16} />
        {addLabel}
      </button>

      {deleteConfirmId && (
        <ConfirmModal
          title="Atentie!"
          message="Sunteti sigur ca doriti sa stergeti programul selectat?"
          confirmLabel="Sterge"
          cancelLabel="Renunta"
          onConfirm={() => handleDeleteRow(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}
