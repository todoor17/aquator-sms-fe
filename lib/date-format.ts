/** Convert yyyy-mm-dd to dd.mm.yyyy for display */
export function formatDate(isoDate: string): string {
    if (!isoDate) return "";
    const parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    return `${parts[2]} / ${parts[1]} / ${parts[0]}`;
}

/** Convert dd / mm / yyyy or dd.mm.yyyy to yyyy-mm-dd for storage/inputs */
export function parseDate(displayDate: string): string {
    if (!displayDate) return "";
    const parts = displayDate.split(/\s*[./]\s*/);
    if (parts.length !== 3) return displayDate;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}
