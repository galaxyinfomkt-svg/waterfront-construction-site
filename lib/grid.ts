/** 6-col grid spans: rows of 2 large, then rows of 3; never an empty cell.
 *  Use with `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-x-6 gap-y-10` (design spec §4.27).
 *  n = 1 would leave half a row empty, so a single item spans the row at a readable width instead. */
export function spanFor(i: number, n: number) {
  if (n === 1) return "lg:col-span-6 lg:max-w-[48rem]";
  const r = n % 3, big = r === 1 ? 4 : r === 2 ? 2 : 0;
  return i < big ? "lg:col-span-3" : "lg:col-span-2";
}
