/**
 * CSV / TSV export helpers.
 *
 * The dashboard writes to Google Sheets continuously (see SheetsContext), so
 * these are for the other direction: getting a snapshot out for a report, a
 * boss update, or a paste into another sheet.
 */

export type ExportRow = Record<string, string | number | boolean | null | undefined>;

const escapeCsv = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const escapeTsv = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[\t\r\n]/g, " ");
};

export const toCsv = (rows: ExportRow[], columns?: string[]): string => {
  if (rows.length === 0) return "";
  const cols = columns ?? Object.keys(rows[0]);
  const head = cols.map(escapeCsv).join(",");
  const body = rows.map((row) => cols.map((c) => escapeCsv(row[c])).join(","));
  return [head, ...body].join("\r\n");
};

export const toTsv = (rows: ExportRow[], columns?: string[]): string => {
  if (rows.length === 0) return "";
  const cols = columns ?? Object.keys(rows[0]);
  const head = cols.map(escapeTsv).join("\t");
  const body = rows.map((row) => cols.map((c) => escapeTsv(row[c])).join("\t"));
  return [head, ...body].join("\n");
};

/** Downloads rows as a CSV file. The BOM makes Excel open UTF-8 correctly. */
export const downloadCsv = (filename: string, rows: ExportRow[], columns?: string[]): void => {
  const csv = toCsv(rows, columns);
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/** Copies TSV to the clipboard — paste straight into a Google Sheet cell range. */
export const copyTsv = async (rows: ExportRow[], columns?: string[]): Promise<boolean> => {
  const tsv = toTsv(rows, columns);
  try {
    await navigator.clipboard.writeText(tsv);
    return true;
  } catch {
    return false;
  }
};

export const timestampSlug = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
};
