import { clsx, type ClassValue } from "clsx";

/** Thin wrapper around `clsx` so components import a single project-local helper. */
export function cx(...classValues: ClassValue[]): string {
  return clsx(classValues);
}
