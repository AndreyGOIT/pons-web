// client/src/utils/formatDate.ts
export const formatDate = (date?: string | Date | null) => {
    if (!date) return "—";

    return new Intl.DateTimeFormat("fi-FI", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(date));
};