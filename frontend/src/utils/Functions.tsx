export function formatMonthYear(year: number, month: number): string {
    const date = new Date(year, month - 1);
    return date.toLocaleString("fr-FR", { month: "long", year: "numeric" });
}