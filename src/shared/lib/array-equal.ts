/** Shallow value equality for two string arrays, used to bail out of redundant state updates. */
export function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((value, index) => value === b[index]);
}
