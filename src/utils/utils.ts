export function swapItemsInArray<T>(array: T[], i: number, j: number) {
  [array[i], array[j]] = [array[j], array[i]];
}
