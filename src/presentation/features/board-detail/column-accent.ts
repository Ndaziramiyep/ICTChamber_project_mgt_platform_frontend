export interface ColumnAccent {
  /** Solid background class for the column's header bar. */
  header: string;
  /** Text color class for the header bar, contrasted against `header`. */
  headerText: string;
}

/** Curated so every entry pairs a saturated background with dark, readable text. */
const COLUMN_ACCENTS: ColumnAccent[] = [
  { header: "bg-rose-400", headerText: "text-rose-950" },
  { header: "bg-amber-300", headerText: "text-amber-950" },
  { header: "bg-emerald-400", headerText: "text-emerald-950" },
  { header: "bg-sky-300", headerText: "text-sky-950" },
  { header: "bg-violet-300", headerText: "text-violet-950" },
  { header: "bg-orange-300", headerText: "text-orange-950" },
  { header: "bg-teal-300", headerText: "text-teal-950" },
  { header: "bg-fuchsia-300", headerText: "text-fuchsia-950" },
];

/**
 * Cycles through a fixed accent palette so every column gets a distinct colored header
 * regardless of how many columns a board has (boards have arbitrary, user-named columns, not a
 * fixed Backlog/Doing/Review/Done set).
 */
export function getColumnAccent(columnIndex: number): ColumnAccent {
  return COLUMN_ACCENTS[columnIndex % COLUMN_ACCENTS.length]!;
}
